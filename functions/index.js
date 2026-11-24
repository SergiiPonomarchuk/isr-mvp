const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");
const { toLatLon } = require("./geo");
const Lifecycle = require("./lifecycle");
const Deadlines = require("./deadlines");
const {tallyApprovedIssue} = require("./close-voting");
const aiHelper = require("./ai-helper");
const MR1 = require("./mr1-service");
const MR1Review = require("./context-review");
const { joinIssue } = require("./join-issue");
const { buildAnalyzerLog } = require("./analyzer-log");
const { paramsForCreate } = require("./params");
const { createGeocoder, firestoreStore } = require("./geocode");

admin.initializeApp();
const db = admin.firestore();

// A4 (R3): the Gemini API key is a Firebase secret, set by the author
// (`firebase functions:secrets:set GEMINI_API_KEY`; locally functions/.secret.local).
const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

// U6 (R3): the place lookup (Nominatim) with its cache and switch in Firestore; one per instance,
// so the 1-request-a-second rule holds per instance.
const geocoder = createGeocoder({
  fetchFn: (url, init) => fetch(url, init),
  store: firestoreStore(db),
  log: (message, details) => console.log(message, details),
});

/** A4 (R7): writes one analyzer_logs entry; a failure to log never breaks the request. */
async function writeAnalyzerLog(entry) {
  try {
    const ref = await db.collection("analyzer_logs").add(buildAnalyzerLog(entry));
    return ref.id;
  } catch (err) {
    console.error("Writing the analyzer log failed:", aiHelper.redact(err && err.message));
    return null;
  }
}

// Diagnostic suggestions; checked drafts use the strict reviewed service below.
exports.analyzeIssue = onRequest({ cors: true, secrets: [GEMINI_API_KEY] }, async (req, res) => {
  try {
    const { description } = req.body;
    if (!description || description.length < 20) {
      return res.status(400).json({ error: "Description must be at least 20 characters." });
    }

    const { params: suggestions, meta } = await aiHelper.suggestIssueParams(description);
    await writeAnalyzerLog({
      endpoint: "analyzeIssue", at: new Date().toISOString(), draftId: null,
      submitterUid: req.body.submitterId, input: { title: "", description, clarification: "" },
      meta, normalized: suggestions, shown: suggestions, embedding: null,
    });
    res.json(Object.assign({}, suggestions, { ai_source: meta.ai_source, ai_model: meta.model }));
  } catch (error) {
    console.error("Error analyzing issue:", error);
    res.status(500).json({ error: "Failed to analyze issue description." });
  }
});

// HTTPS Endpoint: Create Issue & Compute Relevance Pipeline
// R0 fix: 256 MiB (the default) was exceeded on live; see CHANGES
exports.createIssue = onRequest({ cors: true, memory: "512MiB", timeoutSeconds: 300, secrets: [GEMINI_API_KEY] }, async (req, res) => {
  try {
    const { title, description, location, submitterId } = req.body;

    if (!title || !description || !location || !submitterId) {
      return res.status(400).json({ error: "Missing required fields: title, description, location, submitterId." });
    }

    // A2: every number comes from the draft that checkIssue derived on the server.
    // Numbers and weight objects in the request body are never read.
    let draftData = null;
    try {
      const draftSnap = req.body.draftId
        ? await db.collection("issue_drafts").doc(String(req.body.draftId)).get()
        : null;
      draftData = draftSnap && draftSnap.exists ? draftSnap.data() : null;
      paramsForCreate(req.body, draftData);
    } catch (err) {
      return res.status(err.status || 400).json({ error: err.message });
    }
    if (MR1Review.supported(draftData.scoring_version)) return res.json(await MR1.create(db, req.body, draftData));
    // Published legacy drafts replay their recorded response without embedding or rescoring.
    if (!draftData.scoring_version && draftData.creation_result) return res.json(draftData.creation_result);
    return res.status(409).json({error: "Run Check again with the current Analyzer before creating this issue."});
  } catch (error) {
    console.error("Error creating issue:", error.status ? error.message : error.code || "internal");
    res.status(error.status || 500).json({ error: error.status ? error.message : "Failed to create issue and form ad-hoc public.",
      similar_issues: error.similar_issues || null });
  }
});

// HTTPS Endpoint: Check/Calculate Relevance Pipeline (Dry-run server-side)
// R0 fix: 256 MiB (the default) was exceeded on live; see CHANGES
exports.checkIssue = onRequest({ cors: true, memory: "512MiB", timeoutSeconds: 300, secrets: [GEMINI_API_KEY] }, async (req, res) => {
  try {
    const { title, description, location, submitterId } = req.body;

    if (!title || !description || !location || !submitterId) {
      return res.status(400).json({ error: "Missing required fields: title, description, location, submitterId." });
    }
    if (!toLatLon(location)) {
      return res.status(400).json({ error: "The location must be [latitude, longitude]." });
    }

    return res.json(await MR1.check(db, req.body, aiHelper, geocoder.geocode, writeAnalyzerLog));

  } catch (error) {
    console.error("Check failed:", error.code || error.status || "internal");
    res.status(error.status || 500).json({error: error.status ? error.message : "The issue could not be checked; please retry.", context_result: error.status===503?"unavailable":null});
  }
});


/**
 * A1 (roadmap stage 2): close a vote on the server.
 * When an issue's status changes to "approved", count the votes with the members' ISR
 * (shared module functions/isr.js), store the option scores, the winner and a tally record,
 * and turn the winning option's steps into the issue's tasks. Voters without an ISR for this
 * public are excluded; a tie or no counted votes gives no winner (author decisions 3, 4).
 * The trigger's own write keeps the status "approved", so it does not run again.
 */
// Firestore triggers must run in the database's region (the database is in europe-central2).
exports.onIssueStatusChange = onDocumentUpdated({ document: "issues/{issueId}", region: "europe-central2", memory: "512MiB" }, async (event) => {
  const before = event.data.before.data() || {};
  const after = event.data.after.data() || {};
  if (after.status !== "approved" || before.status === "approved") return;

  await require("./publication-dispatch").approved(after, { legacy: () => tallyApprovedIssue(db, event.params.issueId, FieldValue) });
});


/**
 * L1: the daily deadline run (decisions 2-4, 7). Every chat and voting topic whose deadline
 * (the last open day) has passed moves on: chat -> voting (at least 1 option) or canceled;
 * voting -> ToDo (>= 30 % of the ISR pool voted and a winner), +7 days on a tie, or canceled.
 * Rules: lifecycle.js; reads and writes: deadlines.js.
 */
exports.closeExpiredTopics = onSchedule({ schedule: "30 0 * * *", timeZone: Lifecycle.TIME_ZONE, region: "europe-central2", memory: "512MiB" }, async () => {
  const today = Lifecycle.todayIn(Lifecycle.TIME_ZONE, new Date());
  const result = await Deadlines.closeExpiredTopics(db, FieldValue, today);
  console.log(`closeExpiredTopics ${today}: checked ${result.checked}, changed ${result.changes.length}`, JSON.stringify(result.changes));
});

// U10: explicit membership requests use the existing synthetic-profile identity workflow.
exports.joinIssue = onRequest({ cors: true, memory: "512MiB" }, async (req, res) => {
  try {
    res.json(await joinIssue(db, req.body || {}, FieldValue.serverTimestamp()));
  } catch (error) {
    console.error("Join failed:", error.status ? error.message : error.code || "internal");
    res.status(error.status || 503).json({ error: error.status ? error.message : "Joining is temporarily unavailable. Please retry." });
  }
});
