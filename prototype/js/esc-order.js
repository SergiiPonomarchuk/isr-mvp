/**
 * Task U5: what one Esc press closes. Pure function; prototype/js/main.js tells it which windows
 * are open and acts on the answer. Loaded by the browser (window.EscOrder) and by the Node tests.
 *
 * One press closes only the topmost open window, in the page's stacking order (z-index):
 *   geoMap   #geo-map-modal-overlay    11000
 *   tour     #tour-overlay             10000  (the tour handles its own Esc: nothing here)
 *   values   #values-vector-modal       2000
 *   login    #login-modal-overlay       1200
 *   proposal #proposal-modal-overlay     600  (option, Deadline, Relevance and ISR windows)
 *   section  #section-modal-overlay      500  (Chat, Voting, ToDo and the new-issue form)
 * A new-issue form with content asks before it is discarded (U5 decision 1 a).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.EscOrder = factory();
}(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var ORDER = ["geoMap", "tour", "values", "login", "proposal", "section"];

  /**
   * open: {geoMap, tour, values, login, proposal, section, createFormHasContent} (booleans).
   * Returns {action: "close", window} | {action: "confirm-discard"} | {action: "none"}.
   */
  function escAction(open) {
    open = open || {};
    for (var i = 0; i < ORDER.length; i++) {
      var w = ORDER[i];
      if (!open[w]) continue;
      if (w === "tour") return { action: "none" };
      if (w === "section" && open.createFormHasContent) return { action: "confirm-discard" };
      return { action: "close", window: w };
    }
    return { action: "none" };
  }

  return { ORDER: ORDER, escAction: escAction };
}));
