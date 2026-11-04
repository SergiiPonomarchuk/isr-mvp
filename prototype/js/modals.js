function escapeHtmlAttr(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}


/**
 * A2 (PD-8): nobody types a number. Derived values are shown read-only; the topic
 * starter can only clarify the context, and the server derives everything again.
 */
function clarifyBlockHtml(prefix) {
  return `
      <div style="display:flex; flex-direction:column; gap:6px;">
        <label for="${prefix}-clarification" style="font-size:0.85rem; font-weight:600; color:var(--text-muted);">Clarify the context</label>
        <textarea id="${prefix}-clarification" rows="3" maxlength="2000" placeholder="If these values look wrong, describe what the assistant missed: who is affected, where, local rules or owners. Nobody types a number." style="width:100%; padding:8px; border:1px solid var(--border); border-radius:6px; background:var(--surface); color:var(--text); font-size:0.85rem; resize:vertical;"></textarea>
      </div>`;
}

function clarifyButtonsHtml(prefix) {
  return `
          <button type="button" class="tour-btn tour-btn-secondary" id="${prefix}-modal-cancel" style="padding:8px 16px;">Close</button>
          <button type="button" class="tour-btn tour-btn-primary" id="${prefix}-modal-save" style="padding:8px 16px;">Derive again</button>`;
}

function wireClarify(prefix, onSave, overlay) {
  document.getElementById(`${prefix}-modal-cancel`).onclick = () => { overlay.hidden = true; };
  document.getElementById(`${prefix}-modal-save`).onclick = () => {
    const text = (document.getElementById(`${prefix}-clarification`).value || "").trim();
    if (!text) {
      alert('Describe what should be clarified, then derive again.');
      return;
    }
    onSave({ clarification: text });
    overlay.hidden = true;
  };
}

/**
 * openRelevanceModal - Unifies the Relevance weights modal for edit and view modes.
 */
function openRelevanceModal(params, onSave, isReadOnly = false) {
  const proposalModalOverlay = document.getElementById('proposal-modal-overlay');
  const proposalModalCloseBtn = document.getElementById('proposal-modal-close-btn');
  const proposalModalTitle = document.getElementById('proposal-modal-title');
  const proposalModalBody = document.getElementById('proposal-modal-body');

  if (!proposalModalOverlay || !proposalModalCloseBtn || !proposalModalTitle || !proposalModalBody) return;

  proposalModalTitle.textContent = "Relevance Weights & Reasoning";

  const wD = params.w_demographic !== undefined ? params.w_demographic : (params.w_D || 0.2);
  const wG = params.w_geographic !== undefined ? params.w_geographic : (params.w_G || 0.4);
  const wS = params.w_semantic !== undefined ? params.w_semantic : (params.w_S || 0.3);
  const wX = params.w_social !== undefined ? params.w_social : (params.w_X || 0.1);
  const reasoning = params.relevance_reasoning || "Relevance weights balance the geographic, demographic, semantic interest, and social proximity of members based on the issue description.";

  let demoConditionsText = "";
  if (params.demographics) {
    const conds = [];
    if (params.demographics.minAge !== undefined && params.demographics.minAge !== null && params.demographics.minAge !== "") {
      conds.push(`age>${params.demographics.minAge}`);
    }
    if (params.demographics.maxAge !== undefined && params.demographics.maxAge !== null && params.demographics.maxAge !== "") {
      conds.push(`age<${params.demographics.maxAge}`);
    }
    if (params.demographics.employmentStatus && params.demographics.employmentStatus !== "any") {
      conds.push(`employment: ${params.demographics.employmentStatus}`);
    }
    if (params.demographics.familyStatus && params.demographics.familyStatus !== "any") {
      conds.push(`family: ${params.demographics.familyStatus}`);
    }
    if (Array.isArray(params.demographics.features) && params.demographics.features.length > 0) {
      conds.push(`features: [${params.demographics.features.join(", ")}]`);
    } else if (params.demographics.features && typeof params.demographics.features === 'string') {
      conds.push(`features: [${params.demographics.features}]`);
    }
    if (conds.length > 0) {
      demoConditionsText = ` (${conds.join(", ")})`;
    }
  }

  let muVal = 100;
  let sigmaVal = 50;
  if (params.mu !== undefined && params.mu !== null) {
    muVal = params.mu;
  } else if (params.affection_distance !== undefined && params.affection_distance !== null) {
    muVal = params.affection_distance * 1000;
  } else if (params.mu_distance_meters !== undefined && params.mu_distance_meters !== null) {
    muVal = params.mu_distance_meters;
  }
  if (params.sigma !== undefined && params.sigma !== null) {
    sigmaVal = params.sigma;
  } else if (params.sigma_decay_meters !== undefined && params.sigma_decay_meters !== null) {
    sigmaVal = params.sigma_decay_meters;
  }
  const geoConditionsText = ` (μ = ${muVal}m, 3σ = ${(sigmaVal * 3).toFixed(0)}m)`;

  const reasoning_D = params.reasoning_D || (params.relevance_explanations ? params.relevance_explanations.reasoning_D : null) || "Matches eligibility based on roles or demographics (e.g. parents, seniors, employees).";
  const reasoning_G = params.reasoning_G || (params.relevance_explanations ? params.relevance_explanations.reasoning_G : null) || "Proximity-based impact from epicenter (decreases exponentially with distance).";
  const reasoning_S = params.reasoning_S || (params.relevance_explanations ? params.relevance_explanations.reasoning_S : null) || "Personal interest alignment based on keyword/semantic similarity with description.";
  const reasoning_X = params.reasoning_X || (params.relevance_explanations ? params.relevance_explanations.reasoning_X : null) || "Personal social graph relations (e.g. family/friends) to the issue submitter.";

  const semanticDirections = params.category ? params.category.split('.').map(s => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())).join(' → ') : '';
  const demoDetails = demoConditionsText ? `<div style="font-size:0.72rem; color:var(--primary); margin-top:4px; font-weight:500;">Filters: ${demoConditionsText.replace(/^\s*\(\s*|\s*\)\s*$/g, '')}</div>` : '';
  const geoDetails = `<div style="font-size:0.72rem; color:var(--primary); margin-top:4px; font-weight:500;">μ = ${muVal}m, 3σ = ${(sigmaVal * 3).toFixed(0)}m</div>`;
  const semanticDetails = semanticDirections ? `<div style="font-size:0.72rem; color:var(--primary); margin-top:4px; font-weight:500;">Align: ${semanticDirections}</div>` : '';

  const contentHtml = `
    <div style="display:flex; flex-direction:column; gap:16px; color:var(--text);">
      <div style="font-size:0.9rem; color:var(--text-muted); border-bottom:1px solid var(--border); padding-bottom:8px; margin-bottom:8px;">
        ${isReadOnly ? "Relevance weight configurations applied for this issue. Hover over components to see evaluation criteria." : "Relevance weights derived by the AI assistant for this issue (hover to see the reasoning). They cannot be typed; clarify the context below if they look wrong."}
      </div>
      
      <div class="relevance-components-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
        
          <div class="custom-tooltip" data-tooltip="${escapeHtmlAttr(reasoning_D)}" style="background:var(--surface-soft); padding:12px; border-radius:8px; border:1px solid var(--border); text-align:left;">
            <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600; text-transform:uppercase; margin-bottom:4px;">Demographics (D)</div>
            <div style="font-size:1.2rem; font-weight:700; color:var(--text);">${(wD * 100).toFixed(0)}% <span style="font-size:0.8rem; font-weight:normal; color:var(--text-soft); display:block; margin-top:2px;">Weight</span></div>
            ${demoDetails}
          </div>
          <div class="custom-tooltip" data-tooltip="${escapeHtmlAttr(reasoning_G)}" style="background:var(--surface-soft); padding:12px; border-radius:8px; border:1px solid var(--border); text-align:left;">
            <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600; text-transform:uppercase; margin-bottom:4px;">Geographics (G)</div>
            <div style="font-size:1.2rem; font-weight:700; color:var(--text);">${(wG * 100).toFixed(0)}% <span style="font-size:0.8rem; font-weight:normal; color:var(--text-soft); display:block; margin-top:2px;">Weight</span></div>
            ${geoDetails}
          </div>
          <div class="custom-tooltip" data-tooltip="${escapeHtmlAttr(reasoning_S)}" style="background:var(--surface-soft); padding:12px; border-radius:8px; border:1px solid var(--border); text-align:left;">
            <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600; text-transform:uppercase; margin-bottom:4px;">Semantics (S)</div>
            <div style="font-size:1.2rem; font-weight:700; color:var(--text);">${(wS * 100).toFixed(0)}% <span style="font-size:0.8rem; font-weight:normal; color:var(--text-soft); display:block; margin-top:2px;">Weight</span></div>
            ${semanticDetails}
          </div>
          <div class="custom-tooltip" data-tooltip="${escapeHtmlAttr(reasoning_X)}" style="background:var(--surface-soft); padding:12px; border-radius:8px; border:1px solid var(--border); text-align:left;">
            <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600; text-transform:uppercase; margin-bottom:4px;">Social (X)</div>
            <div style="font-size:1.2rem; font-weight:700; color:var(--text);">${(wX * 100).toFixed(0)}% <span style="font-size:0.8rem; font-weight:normal; color:var(--text-soft); display:block; margin-top:2px;">Weight</span></div>
          </div>
      </div>
      
      <div style="display:flex; flex-direction:column; gap:6px;">
        <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted);">Relevance Weight Evaluation Reasoning Summary</label>
        <div class="topic-detail-note" style="min-height: 80px; text-align: left;">
          ${reasoning}
        </div>
      </div>
      
      ${isReadOnly ? '' : clarifyBlockHtml('relevance')}

      <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:8px;">
        ${isReadOnly ? `
          <button type="button" class="topic-back-btn" id="relevance-modal-close-view" style="padding:8px 16px; border-radius:8px; cursor:pointer; border:1px solid var(--border); background:var(--surface-muted); color:var(--text);">Close</button>
        ` : clarifyButtonsHtml('relevance')}
      </div>
    </div>
  `;

  proposalModalBody.innerHTML = contentHtml;

  if (isReadOnly) {
    document.getElementById('relevance-modal-close-view').onclick = () => { proposalModalOverlay.hidden = true; };
  } else {
    wireClarify('relevance', onSave, proposalModalOverlay);
  }

  proposalModalCloseBtn.onclick = () => { proposalModalOverlay.hidden = true; };
  proposalModalOverlay.hidden = false;
}

/**
 * openIsrModal - Unifies the ISR aggregation weights modal for edit and view modes.
 */
function openIsrModal(params, onSave, isReadOnly = false) {
  const proposalModalOverlay = document.getElementById('proposal-modal-overlay');
  const proposalModalCloseBtn = document.getElementById('proposal-modal-close-btn');
  const proposalModalTitle = document.getElementById('proposal-modal-title');
  const proposalModalBody = document.getElementById('proposal-modal-body');

  if (!proposalModalOverlay || !proposalModalCloseBtn || !proposalModalTitle || !proposalModalBody) return;

  proposalModalTitle.textContent = "ISR Aggregation Weights & Reasoning";

  const wR = params.w_relevance !== undefined ? params.w_relevance : 0.4;
  const wE = params.w_expertise !== undefined ? params.w_expertise : 0.3;
  const wC = params.w_contribution !== undefined ? params.w_contribution : 0.3;
  const reasoning = params.aggregation_reasoning || "Aggregation weights determine the relative importance of voter proximity/lived experience, technical domain competence, and past constructive contribution.";

  const reasoning_R = params.reasoning_R || (params.isr_explanations ? params.isr_explanations.reasoning_R : null) || "Voter's demographic, geographic, semantic, and social alignment to the issue.";
  const reasoning_E = params.reasoning_E || (params.isr_explanations ? params.isr_explanations.reasoning_E : null) || "Credentialed competence or technical skills matching the issue domain.";
  const reasoning_C = params.reasoning_C || (params.isr_explanations ? params.isr_explanations.reasoning_C : null) || "Track record of constructive participation, follow-through, and community rating.";

  const contentHtml = `
    <div style="display:flex; flex-direction:column; gap:16px; color:var(--text);">
      <div style="font-size:0.9rem; color:var(--text-muted); border-bottom:1px solid var(--border); padding-bottom:8px; margin-bottom:8px;">
        ${isReadOnly ? "ISR Aggregation weights applied for this issue. Hover over components to see evaluation criteria." : "ISR aggregation weights derived by the AI assistant for this issue (hover to see the reasoning). They cannot be typed; clarify the context below if they look wrong."}
      </div>
      
      <div class="isr-components-grid" style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px;">
        
          <div class="custom-tooltip" data-tooltip="${escapeHtmlAttr(reasoning_R)}" style="background:var(--surface-soft); padding:12px; border-radius:8px; border:1px solid var(--border); text-align:left;">
            <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600; text-transform:uppercase; margin-bottom:4px;">Relevance (R)</div>
            <div style="font-size:1.2rem; font-weight:700; color:var(--text);">${(wR * 100).toFixed(0)}% <span style="font-size:0.8rem; font-weight:normal; color:var(--text-soft); display:block; margin-top:2px;">Weight</span></div>
          </div>
          <div class="custom-tooltip" data-tooltip="${escapeHtmlAttr(reasoning_E)}" style="background:var(--surface-soft); padding:12px; border-radius:8px; border:1px solid var(--border); text-align:left;">
            <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600; text-transform:uppercase; margin-bottom:4px;">Expertise (E)</div>
            <div style="font-size:1.2rem; font-weight:700; color:var(--text);">${(wE * 100).toFixed(0)}% <span style="font-size:0.8rem; font-weight:normal; color:var(--text-soft); display:block; margin-top:2px;">Weight</span></div>
          </div>
          <div class="custom-tooltip" data-tooltip="${escapeHtmlAttr(reasoning_C)}" style="background:var(--surface-soft); padding:12px; border-radius:8px; border:1px solid var(--border); text-align:left;">
            <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600; text-transform:uppercase; margin-bottom:4px;">Contribution (C)</div>
            <div style="font-size:1.2rem; font-weight:700; color:var(--text);">${(wC * 100).toFixed(0)}% <span style="font-size:0.8rem; font-weight:normal; color:var(--text-soft); display:block; margin-top:2px;">Weight</span></div>
          </div>
      </div>
      
      <div style="display:flex; flex-direction:column; gap:6px;">
        <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted);">ISR Aggregation Reasoning Summary</label>
        <div class="topic-detail-note" style="min-height: 80px; text-align: left;">
          ${reasoning}
        </div>
      </div>
      
      ${isReadOnly ? '' : clarifyBlockHtml('isr')}

      <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:8px;">
        ${isReadOnly ? `
          <button type="button" class="topic-back-btn" id="isr-modal-close-view" style="padding:8px 16px; border-radius:8px; cursor:pointer; border:1px solid var(--border); background:var(--surface-muted); color:var(--text);">Close</button>
        ` : clarifyButtonsHtml('isr')}
      </div>
    </div>
  `;

  proposalModalBody.innerHTML = contentHtml;

  if (isReadOnly) {
    document.getElementById('isr-modal-close-view').onclick = () => { proposalModalOverlay.hidden = true; };
  } else {
    wireClarify('isr', onSave, proposalModalOverlay);
  }

  proposalModalCloseBtn.onclick = () => { proposalModalOverlay.hidden = true; };
  proposalModalOverlay.hidden = false;
}

/**
 * openExpertiseModal - Required expertise direction (read-only; A2, PD-8).
 * Expertise = education (at least the common-knowledge floor) + experience,
 * added without weights. The resources the issue needs belong to the options.
 */
function openExpertiseModal(params, onSave, isReadOnly = false) {
  const proposalModalOverlay = document.getElementById('proposal-modal-overlay');
  const proposalModalCloseBtn = document.getElementById('proposal-modal-close-btn');
  const proposalModalTitle = document.getElementById('proposal-modal-title');
  const proposalModalBody = document.getElementById('proposal-modal-body');

  if (!proposalModalOverlay || !proposalModalCloseBtn || !proposalModalTitle || !proposalModalBody) return;

  proposalModalTitle.textContent = "Required Expertise & Direction";

  const domain = params.expertise_domain || "General Maintenance";
  const depth = params.expertise_depth || "None";
  const edp = params.expertise_domain_parameters || {};
  const expertiseReasoning = edp.domain_reasoning || params.expertise_reasoning || "Expertise is the sum of related education and related experience, without weights.";

  const importanceOrder = { high: 3, medium: 2, low: 1 };
  const sortedResources = [...(params.resources_needed || [])].sort((a, b) => {
    const valA = importanceOrder[a.importance_level] || 0;
    const valB = importanceOrder[b.importance_level] || 0;
    return valB - valA;
  });

  const card = (title, body) => `
          <div style="background:var(--surface-soft); padding:12px; border-radius:8px; border:1px solid var(--border); text-align:left;">
            <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600; text-transform:uppercase; margin-bottom:6px;">${title}</div>
            <div style="font-size:0.8rem; color:var(--text); line-height:1.4;">${body}</div>
          </div>`;

  const decay = edp.recency_decay_rate !== undefined ? `<br><strong>Recency decay:</strong> ${escapeHtmlAttr(String(edp.recency_decay_rate))}/year` : "";
  const resourcesHtml = sortedResources.length > 0
    ? sortedResources.map(r => `<div style="margin-bottom:2px;">• <strong>${escapeHtmlAttr(String(r.resource_type || "").replace(/_/g, " "))}</strong> (${escapeHtmlAttr(r.importance_level || "")}): ${escapeHtmlAttr(r.explanation || "")}</div>`).join('')
    : 'None listed.';

  const contentHtml = `
    <div style="display:flex; flex-direction:column; gap:16px; color:var(--text);">
      <div style="font-size:0.9rem; color:var(--text-muted); border-bottom:1px solid var(--border); padding-bottom:8px; margin-bottom:8px;">
        Expertise = related education (at least the common-knowledge floor) + related experience, added without weights. The values below were derived by the AI assistant and cannot be typed.
      </div>

      <div class="expertise-components-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
        ${card("Education", `<strong>Domain:</strong> ${escapeHtmlAttr(domain)}<br><strong>Typical depth:</strong> ${escapeHtmlAttr(depth)}`)}
        ${card("Experience", `<strong>Direction:</strong> ${escapeHtmlAttr(domain)}${decay}`)}
      </div>

      <div style="display:flex; flex-direction:column; gap:6px;">
        <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted);">What the issue needs (for the options, not anyone's weight)</label>
        <div class="topic-detail-note" style="text-align:left; font-size:0.8rem;">
          ${resourcesHtml}
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:6px;">
        <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted);">Expertise Reasoning Summary</label>
        <div class="topic-detail-note" style="min-height: 60px; text-align: left;">
          ${escapeHtmlAttr(expertiseReasoning)}
        </div>
      </div>

      ${isReadOnly ? '' : clarifyBlockHtml('expertise')}

      <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:8px;">
        ${isReadOnly ? `
          <button type="button" class="topic-back-btn" id="expertise-modal-close-view" style="padding:8px 16px; border-radius:8px; cursor:pointer; border:1px solid var(--border); background:var(--surface-muted); color:var(--text);">Close</button>
        ` : clarifyButtonsHtml('expertise')}
      </div>
    </div>
  `;

  proposalModalBody.innerHTML = contentHtml;

  if (isReadOnly) {
    document.getElementById('expertise-modal-close-view').onclick = () => { proposalModalOverlay.hidden = true; };
  } else {
    wireClarify('expertise', onSave, proposalModalOverlay);
  }

  proposalModalCloseBtn.onclick = () => { proposalModalOverlay.hidden = true; };
  proposalModalOverlay.hidden = false;
}
