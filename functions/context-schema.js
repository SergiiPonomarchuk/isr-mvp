"use strict";
const { PROPERTY_KINDS, EMPLOYMENT_STATUSES, FAMILY_STATUSES } = require("./demographics");
const { ANCHORS } = require("./location");
const PROMPT_VERSION = "mr1-context-prompt-5";
const SCOPES = ["unit", "building", "street_segment", "neighborhood", "district", "city", "region", "global_digital"];
const DEMOGRAPHIC_FIELDS = ["minAge", "maxAge", "employmentStatus", "familyStatus", "features", "places", "property_kinds"];
function responseSchema() {
  const text = { type: "string" };
  const list = items => ({ type: "array", items, maxItems: 20 });
  const object = properties => ({ type: "object", properties, required: Object.keys(properties), additionalProperties: false });
  const demographics = object({
    minAge: { type: ["number", "null"], minimum: 0, maximum: 130 },
    maxAge: { type: ["number", "null"], minimum: 0, maximum: 130 },
    employmentStatus: { type: "string", enum: [...EMPLOYMENT_STATUSES] },
    familyStatus: { type: "string", enum: [...FAMILY_STATUSES] },
    features: list(text), places: list(text), property_kinds: list({ type: "string", enum: [...PROPERTY_KINDS] })
  });
  const schema = object({
    result: { type: "string", enum: ["pass", "needs_clarification", "not_consistent"] },
    message: text,
    questions: { type: "array", items: text, maxItems: 3 },
    scope: { anyOf: [{ type: "string", enum: [...SCOPES] }, { type: "null" }] },
    location_reference: { ...object({ anchor: { type: "string", enum: [...ANCHORS] }, place: text }), type: ["object", "null"] },
    accepted: { type: "array", items: object({ id: text, aspect_id: text, evidence: text }) },
    excluded: { type: "object", additionalProperties: text },
    aspects: { type: "array", maxItems: 3, items: object({
      id: text, text: { type: "string", description: "Copy one exact contiguous substring from INPUT_JSON title, description or clarification. Never copy a REFERENCE_JSON title or paraphrase the input." }, demographics,
      demographic_evidence: { type: "array", maxItems: 64, items: object({ field: { type: "string", enum: [...DEMOGRAPHIC_FIELDS] }, value: { type: "string", description: "String form of the exact non-default criterion value." }, quote: { type: "string", description: "Exact input quote stating the affected-person attribute; never just issue-topic words." } }) }
    }) }
  });
  // Keep the provider grammar small; strict bounds remain enforced by the server.
  function compact(value) {
    if (!value || typeof value !== "object") return;
    delete value.maxItems; delete value.minimum; delete value.maximum;
    Object.values(value).forEach(compact);
  }
  compact(schema);
  return schema;
}
module.exports = { PROMPT_VERSION, SCOPES, DEMOGRAPHIC_FIELDS, responseSchema };
