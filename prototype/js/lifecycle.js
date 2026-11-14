/**
 * Topic lifecycle: the public's management decisions and the deadlines (task L1).
 *
 * The single source of these rules. Used by the Cloud Functions (require("./lifecycle"): the
 * daily deadline run and createIssue) and by the browser (prototype/js/lifecycle.js is a
 * byte-identical copy made with `npm run sync:isr`; window.Lifecycle). The Python migration
 * scripts/migrate_l1.py ports phaseOf, the date helpers and the deadline outcome; all three are
 * checked against tests/fixtures/lifecycle_cases.json.
 *
 * Pure functions only: no Firebase, no network. Depends on the ISR module (tally).
 *
 *   management decision  executes when its supporters hold >= 30 % of the public's ISR pool
 *   voting at the deadline  >= 30 % of the pool voted and a winner -> ToDo; a tie -> +7 days;
 *                           otherwise canceled (no votes, below 30 %, no ISR pool)
 *   chat at the deadline    >= 1 option -> voting (deadline today + 7); no options -> canceled
 *   a deadline is the last open day: the topic expires the day after it (Europe/Zurich)
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./isr"));
  else root.Lifecycle = factory(root.ISR);
}(typeof self !== "undefined" ? self : this, function (ISR) {
  "use strict";

  var MANAGEMENT_THRESHOLD = 0.30;   // author decision 1
  var MIN_VOTED_SHARE = 0.30;        // author decision 1
  var MIN_OPTIONS = 1;               // author decisions 3 and 9
  var EXTEND_DAYS = 7;
  var CHAT_DEADLINE_MONTHS = 1;      // author decision 8
  var TIME_ZONE = "Europe/Zurich";   // decision 7
  var EPS = 1e-9;                    // "at least" on floating sums (decision 6)

  var ACTION_LABELS = {
    plus_1_week: "+1 Week",
    start_voting: "Start Voting",
    back_to_chat: "Back to Chat",
    finish_voting: "Finish Voting",
    cancel_issue: "Cancel Issue",
    reactivate: "Reactivate (+1 week)"
  };
  var PHASE_ACTIONS = {
    chat: ["plus_1_week", "start_voting", "cancel_issue"],
    voting: ["plus_1_week", "back_to_chat", "finish_voting", "cancel_issue"],
    tasks: ["cancel_issue"]
  };

  // ------------------------------------------------------------------ dates ("YYYY-MM-DD")

  function isDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(typeof s === "string" ? s : "");
    if (!m) return false;
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
  }

  function toUtc(s) {
    if (!isDate(s)) throw new Error("not a 'YYYY-MM-DD' date: " + s);
    return Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
  }

  function fromUtc(ms) {
    var d = new Date(ms);
    return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate());
  }

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function addDays(s, n) { return fromUtc(toUtc(s) + n * 86400000); }

  /** Calendar months; the day is clamped to the month's last day (2026-01-31 + 1 -> 2026-02-28). */
  function addMonths(s, n) {
    var y = +s.slice(0, 4), m = +s.slice(5, 7) - 1 + n, d = +s.slice(8, 10);
    if (!isDate(s)) throw new Error("not a 'YYYY-MM-DD' date: " + s);
    y += Math.floor(m / 12);
    m = ((m % 12) + 12) % 12;
    var last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    return fromUtc(Date.UTC(y, m, Math.min(d, last)));
  }

  /** Whole days from a to b (b - a). */
  function daysBetween(a, b) { return Math.round((toUtc(b) - toUtc(a)) / 86400000); }

  /** A deadline is the last open day; non-dates ("Ongoing", missing) never expire. */
  function isExpired(ends, today) { return isDate(ends) && ends < today; }

  /** Today's date in a time zone, as "YYYY-MM-DD". */
  function todayIn(timeZone, now) {
    var parts = new Intl.DateTimeFormat("en-CA", { timeZone: timeZone || TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" })
      .formatToParts(now || new Date());
    var get = function (t) { for (var i = 0; i < parts.length; i++) if (parts[i].type === t) return parts[i].value; return ""; };
    return get("year") + "-" + get("month") + "-" + get("day");
  }

  /** New deadline = the later of the current deadline and floorDate, plus days. */
  function extendDeadline(ends, floorDate, days) {
    var base = isDate(ends) && ends >= floorDate ? ends : floorDate;
    return addDays(base, days === undefined ? EXTEND_DAYS : days);
  }

  /** Deadline of a new chat: the creator's date if it is a date from today on, else today + 1 month. */
  function chatDeadline(requested, today) {
    if (isDate(requested) && requested >= today) return requested;
    return addMonths(today, CHAT_DEADLINE_MONTHS);
  }

  // ------------------------------------------------------------------ phase

  /**
   * Phase of a topic from its discussion and issue documents (either may be null):
   * "archived", "voting", "todo", "inactive" or "chat".
   */
  function phaseOf(disc, issue) {
    var ds = disc ? disc.status : undefined, is = issue ? issue.status : undefined;
    if (is === "archived" || ds === "archived") return "archived";
    if (is === "in_process" || ds === "Voting") return "voting";
    if (is === "approved" || is === "tasks" || ds === "approved") return "todo";
    if (is === "inactive" || ds === "inactive") return "inactive";
    return "chat";
  }

  // ------------------------------------------------------------------ voting result

  function pool(isrByUid) {
    var s = 0;
    Object.keys(isrByUid || {}).forEach(function (uid) {
      var v = Number(isrByUid[uid]);
      if (isFinite(v) && v > 0) s += v;
    });
    return s;
  }

  /**
   * The vote as it would close now: share of the ISR pool that voted (A1 tally: voters
   * without an ISR are not counted) and the result "todo", "tie" or "cancel".
   */
  function votingOutcome(votes, isrByUid, optionCount) {
    var p = pool(isrByUid);
    var t = ISR.tally(votes || {}, isrByUid || {}, optionCount || 0);
    var voted = 0;
    t.counted.forEach(function (c) { voted += c.weight; });
    var share = p > 0 ? voted / p : 0;
    var result, reason;
    if (p <= 0) { result = "cancel"; reason = "no ISR pool"; }
    else if (t.counted.length === 0) { result = "cancel"; reason = "no votes"; }
    else if (share < MIN_VOTED_SHARE - EPS) { result = "cancel"; reason = "below 30 % voted"; }
    else if (t.winner === null) { result = "tie"; reason = t.note; }
    else { result = "todo"; reason = "winner"; }
    return { pool: p, voted: voted, share: share, winner: t.winner, result: result, reason: reason, tally: t };
  }

  // ------------------------------------------------------------------ management decisions

  /**
   * input: { phase: "chat"|"voting"|"tasks", status, cancelReason, votes {uid: action},
   *          isrByUid, optionCount, votingResult (votingOutcome(...).result, voting only) }
   * Returns the buttons, support and share per action, the blocked actions with the reason,
   * and the action that executes now (null if none).
   * Order as built: cancel, +1 week, start voting / back to chat / finish voting.
   */
  function managementOutcome(input) {
    if (input.status === "archived" || input.phase === "archived") return {pool: 0, buttons: [], support: {}, share: {}, blocked: {}, action: null};
    var p = pool(input.isrByUid);
    var inactive = input.status === "inactive";
    var deadlineCanceled = inactive && input.cancelReason === "deadline";
    var buttons = deadlineCanceled ? ["reactivate"] : (PHASE_ACTIONS[input.phase] || []).slice();
    var support = {}, share = {}, blocked = {};
    buttons.forEach(function (a) { support[a] = 0; });
    support.cancel_issue = support.cancel_issue || 0;
    var votes = input.votes || {};
    Object.keys(votes).forEach(function (uid) {
      var a = votes[uid];
      var w = Number((input.isrByUid || {})[uid]);
      if (!isFinite(w) || w <= 0) w = 0;
      if (support[a] === undefined) support[a] = 0;
      support[a] += w;
    });
    Object.keys(support).forEach(function (a) { share[a] = p > 0 ? support[a] / p : 0; });

    if (!inactive) {
      if (buttons.indexOf("start_voting") >= 0 && !((input.optionCount || 0) >= MIN_OPTIONS)) {
        blocked.start_voting = "needs at least " + MIN_OPTIONS + " option";
      }
      if (buttons.indexOf("finish_voting") >= 0 && input.votingResult !== "todo") {
        blocked.finish_voting = input.votingResult === "tie"
          ? "the vote is tied" : "needs at least 30 % of the public's ISR-score voted";
      }
    }

    var reached = function (a) { return p > 0 && share[a] >= MANAGEMENT_THRESHOLD - EPS && !blocked[a]; };
    var action = null;
    if (deadlineCanceled) {
      if (reached("reactivate")) action = "reactivate";
    } else if (inactive) {
      // Cancel Issue holds while its support stays at the threshold (built rule, now 30 %).
      if (p > 0 && share.cancel_issue < MANAGEMENT_THRESHOLD - EPS) action = "reactivate";
    } else {
      var order = ["cancel_issue", "plus_1_week", "start_voting", "back_to_chat", "finish_voting"];
      for (var i = 0; i < order.length && !action; i++) {
        if (buttons.indexOf(order[i]) >= 0 && reached(order[i])) action = order[i];
      }
    }
    return { pool: p, buttons: buttons, support: support, share: share, blocked: blocked, action: action };
  }

  // ------------------------------------------------------------------ deadlines

  /**
   * topic: { phase, ends, optionCount, votes, isrByUid }. Returns { action, reason, votedShare,
   * newEnds } with action "to_voting" | "cancel" (chat), "to_todo" | "extend" | "cancel"
   * (voting), or null when the topic has not expired or its phase has no deadline action.
   */
  function deadlineOutcome(topic, today) {
    var none = { action: null, reason: "", votedShare: null, newEnds: null };
    if (!isExpired(topic.ends, today)) return none;
    if (topic.phase === "chat") {
      if ((topic.optionCount || 0) >= MIN_OPTIONS) {
        return { action: "to_voting", reason: "options proposed", votedShare: null, newEnds: addDays(today, EXTEND_DAYS) };
      }
      return { action: "cancel", reason: "no options", votedShare: null, newEnds: null };
    }
    if (topic.phase === "voting") {
      var v = votingOutcome(topic.votes, topic.isrByUid, topic.optionCount);
      if (v.result === "todo") return { action: "to_todo", reason: v.reason, votedShare: v.share, newEnds: null };
      if (v.result === "tie") {
        return { action: "extend", reason: v.reason, votedShare: v.share, newEnds: extendDeadline(topic.ends, addDays(today, -1)) };
      }
      return { action: "cancel", reason: v.reason, votedShare: v.share, newEnds: null };
    }
    return none;
  }

  /** The issue document written when a chat moves to voting (Start Voting or the deadline run). */
  function votingIssueFields(disc, ends, nowIso) {
    var d = disc || {};
    var options = (d.options_v2 || []).map(function (opt) {
      return {
        label: opt.title,
        score: 0,
        author_uid: opt.author_uid || "",
        author_name: opt.author_name || "System",
        budget: opt.budget || "N/A",
        funding_source: opt.funding_source || "",
        resources_needed: opt.resources_needed || [],
        description: opt.description || []
      };
    });
    var dflt = function (v, x) { return v !== undefined ? v : x; };
    return {
      title: d.topic || "",
      description: d.description || "",
      category: d.category || "General",
      status: "in_process",
      ends: ends,
      submitter_id: d.creator_uid || "system",
      created_at: nowIso,
      participants: d.participants || [],
      options: options,
      deadline_votes: {},
      w_demographic: dflt(d.w_demographic, 0.2),
      w_geographic: dflt(d.w_geographic, 0.6),
      w_semantic: dflt(d.w_semantic, 0.1),
      w_social: dflt(d.w_social, 0.1),
      w_relevance: dflt(d.w_relevance, 0.4),
      w_expertise: dflt(d.w_expertise, 0.3),
      w_contribution: dflt(d.w_contribution, 0.3),
      last_message_sender_name: d.last_message_sender_name || "",
      last_message_sender_uid: d.last_message_sender_uid || "",
      last_message_text: d.last_message_text || "",
      last_message_timestamp: d.last_message_timestamp || "",
      relevance_scores: d.relevance_scores || {},
      isr_scores: d.isr_scores || {},
      message_count: d.message_count || 0
    };
  }

  return {
    MANAGEMENT_THRESHOLD: MANAGEMENT_THRESHOLD,
    MIN_VOTED_SHARE: MIN_VOTED_SHARE,
    MIN_OPTIONS: MIN_OPTIONS,
    EXTEND_DAYS: EXTEND_DAYS,
    CHAT_DEADLINE_MONTHS: CHAT_DEADLINE_MONTHS,
    TIME_ZONE: TIME_ZONE,
    ACTION_LABELS: ACTION_LABELS,
    isDate: isDate,
    addDays: addDays,
    addMonths: addMonths,
    daysBetween: daysBetween,
    isExpired: isExpired,
    todayIn: todayIn,
    extendDeadline: extendDeadline,
    chatDeadline: chatDeadline,
    phaseOf: phaseOf,
    pool: pool,
    votingOutcome: votingOutcome,
    managementOutcome: managementOutcome,
    deadlineOutcome: deadlineOutcome,
    votingIssueFields: votingIssueFields
  };
}));
