/**
 * Decision options: cost, funding source and needed resources (task A3, PD-8).
 *
 * These are option content that members write and discuss (numbers in text are
 * fine here). They give nobody weight and are never read by any score.
 * Cost is stored in the as-built field `budget`, so older options still display.
 *
 * Works in the browser (window.ISROptions) and in Node tests (module.exports).
 */
(function (root) {
  var LIMITS = { title: 200, cost: 100, funding_source: 300, resource: 300, resources: 20 };

  function clean(value, max) {
    return String(value === undefined || value === null ? '' : value).replace(/\s+/g, ' ').trim().slice(0, max);
  }

  function escapeHtml(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /**
   * input: {title, cost, funding_source, resources: [string]}
   * returns {ok, errors: [string], option: {title, budget, funding_source, resources_needed}}
   */
  function validateOption(input) {
    var i = input || {};
    var option = {
      title: clean(i.title, LIMITS.title),
      budget: clean(i.cost, LIMITS.cost),
      funding_source: clean(i.funding_source, LIMITS.funding_source),
      resources_needed: (Array.isArray(i.resources) ? i.resources : [])
        .map(function (r) { return clean(r, LIMITS.resource); })
        .filter(function (r) { return r.length > 0; })
        .slice(0, LIMITS.resources)
    };
    var errors = [];
    if (!option.title) errors.push('Please specify an option name.');
    if (!option.budget) errors.push('Please specify the cost (for example "€1,200" or "no cost").');
    if (!option.funding_source) errors.push('Please specify the funding source (for example "building fund", "municipal grant" or "no money needed").');
    return { ok: errors.length === 0, errors: errors, option: option };
  }

  var NOT_STATED = '<span style="font-style: italic;">not stated</span>';

  /** "Cost: … · Funding: …" and the resources line, for cards and windows. */
  function optionDetailsHtml(opt) {
    var o = opt || {};
    var cost = o.budget && o.budget !== 'N/A' ? '<b>' + escapeHtml(o.budget) + '</b>' : NOT_STATED;
    var funding = o.funding_source ? '<b>' + escapeHtml(o.funding_source) + '</b>' : NOT_STATED;
    var res = Array.isArray(o.resources_needed) && o.resources_needed.length > 0
      ? o.resources_needed.map(escapeHtml).join('; ')
      : NOT_STATED;
    return 'Cost: ' + cost + ' &middot; Funding: ' + funding +
      '<div style="margin-top: 2px;">Resources: ' + res + '</div>';
  }

  /** The issue's analysed needs (Analyzer resources_needed), money first, read-only guidance. */
  function issueNeedsHtml(needs) {
    var list = (Array.isArray(needs) ? needs.slice() : []).filter(function (n) { return n && n.resource_type; });
    if (list.length === 0) return '<div style="font-style: italic;">No analysis of the needs is available for this issue.</div>';
    var order = { high: 0, medium: 1, low: 2 };
    list.sort(function (a, b) {
      var am = a.resource_type === 'money_budget' ? 0 : 1;
      var bm = b.resource_type === 'money_budget' ? 0 : 1;
      if (am !== bm) return am - bm;
      return (order[a.importance_level] || 3) - (order[b.importance_level] || 3);
    });
    return list.map(function (n) {
      return '<div style="margin-bottom: 2px;">&bull; <b>' + escapeHtml(String(n.resource_type).replace(/_/g, ' ')) + '</b>' +
        (n.importance_level ? ' (' + escapeHtml(n.importance_level) + ')' : '') +
        (n.explanation ? ': ' + escapeHtml(n.explanation) : '') + '</div>';
    }).join('');
  }

  var api = {
    LIMITS: LIMITS,
    validateOption: validateOption,
    optionDetailsHtml: optionDetailsHtml,
    issueNeedsHtml: issueNeedsHtml,
    escapeHtml: escapeHtml
  };
  root.ISROptions = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
