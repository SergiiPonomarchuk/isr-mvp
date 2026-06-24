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
 * openRelevanceModal - Unifies the Relevance weights modal for edit and view modes.
 */
function openRelevanceModal(params, onSave, isReadOnly = false) {
  const proposalModalOverlay = document.getElementById('proposal-modal-overlay');
  const proposalModalCloseBtn = document.getElementById('proposal-modal-close-btn');
  const proposalModalTitle = document.getElementById('proposal-modal-title');
  const proposalModalBody = document.getElementById('proposal-modal-body');

  if (!proposalModalOverlay || !proposalModalCloseBtn || !proposalModalTitle || !proposalModalBody) return;

  proposalModalTitle.textContent = isReadOnly ? "Estimated Relevance Weight Suggestions & Reasoning" : "Configure Relevance Weights";

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
        ${isReadOnly ? "Relevance weight configurations applied for this issue. Hover over components to see evaluation criteria." : "Adjust relevance component weights (hover to see criteria). The sum of all weights must be exactly 100%."}
      </div>
      
      <div class="relevance-components-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
        ${isReadOnly ? `
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
        ` : `
          <div class="custom-tooltip" data-tooltip="${escapeHtmlAttr(reasoning_D)}" style="background:var(--surface-soft); padding:12px; border-radius:8px; border:1px solid var(--border); display:flex; flex-direction:column; gap:6px; text-align:left;">
            <label style="font-size:0.75rem; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Demographics (D) (%)</label>
            <input type="number" id="edit-rel-wD" value="${Math.round(wD * 100)}" min="0" max="100" style="width:100%; padding:6px; border:1px solid var(--border); border-radius:4px; background:var(--surface); color:var(--text); font-weight:700; font-size:1.15rem;" />
            ${demoDetails}
          </div>
          <div class="custom-tooltip" data-tooltip="${escapeHtmlAttr(reasoning_G)}" style="background:var(--surface-soft); padding:12px; border-radius:8px; border:1px solid var(--border); display:flex; flex-direction:column; gap:6px; text-align:left;">
            <label style="font-size:0.75rem; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Geographics (G) (%)</label>
            <input type="number" id="edit-rel-wG" value="${Math.round(wG * 100)}" min="0" max="100" style="width:100%; padding:6px; border:1px solid var(--border); border-radius:4px; background:var(--surface); color:var(--text); font-weight:700; font-size:1.15rem;" />
            ${geoDetails}
          </div>
          <div class="custom-tooltip" data-tooltip="${escapeHtmlAttr(reasoning_S)}" style="background:var(--surface-soft); padding:12px; border-radius:8px; border:1px solid var(--border); display:flex; flex-direction:column; gap:6px; text-align:left;">
            <label style="font-size:0.75rem; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Semantics (S) (%)</label>
            <input type="number" id="edit-rel-wS" value="${Math.round(wS * 100)}" min="0" max="100" style="width:100%; padding:6px; border:1px solid var(--border); border-radius:4px; background:var(--surface); color:var(--text); font-weight:700; font-size:1.15rem;" />
            ${semanticDetails}
          </div>
          <div class="custom-tooltip" data-tooltip="${escapeHtmlAttr(reasoning_X)}" style="background:var(--surface-soft); padding:12px; border-radius:8px; border:1px solid var(--border); display:flex; flex-direction:column; gap:6px; text-align:left;">
            <label style="font-size:0.75rem; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Social (X) (%)</label>
            <input type="number" id="edit-rel-wX" value="${Math.round(wX * 100)}" min="0" max="100" style="width:100%; padding:6px; border:1px solid var(--border); border-radius:4px; background:var(--surface); color:var(--text); font-weight:700; font-size:1.15rem;" />
          </div>
        `}
      </div>
      
      <div style="display:flex; flex-direction:column; gap:6px;">
        <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted);">Relevance Weight Evaluation Reasoning Summary</label>
        <div class="topic-detail-note" style="min-height: 80px; text-align: left;">
          ${reasoning}
        </div>
      </div>
      
      <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:8px;">
        ${isReadOnly ? `
          <button type="button" class="topic-back-btn" id="relevance-modal-close-view" style="padding:8px 16px; border-radius:8px; cursor:pointer; border:1px solid var(--border); background:var(--surface-muted); color:var(--text);">Close</button>
        ` : `
          <button type="button" class="tour-btn tour-btn-secondary" id="relevance-modal-cancel" style="padding:8px 16px;">Cancel</button>
          <button type="button" class="tour-btn tour-btn-primary" id="relevance-modal-save" style="padding:8px 16px;">Save & Apply</button>
        `}
      </div>
    </div>
  `;

  proposalModalBody.innerHTML = contentHtml;

  if (isReadOnly) {
    document.getElementById('relevance-modal-close-view').onclick = () => { proposalModalOverlay.hidden = true; };
  } else {
    document.getElementById('relevance-modal-cancel').onclick = () => { proposalModalOverlay.hidden = true; };
    document.getElementById('relevance-modal-save').onclick = () => {
      const valD = parseInt(document.getElementById('edit-rel-wD').value) || 0;
      const valG = parseInt(document.getElementById('edit-rel-wG').value) || 0;
      const valS = parseInt(document.getElementById('edit-rel-wS').value) || 0;
      const valX = parseInt(document.getElementById('edit-rel-wX').value) || 0;

      if (valD + valG + valS + valX !== 100) {
        alert('Relevance weights must sum to exactly 100%. Current sum: ' + (valD + valG + valS + valX) + '%');
        return;
      }

      onSave({
        w_D: valD / 100,
        w_G: valG / 100,
        w_S: valS / 100,
        w_X: valX / 100
      });

      proposalModalOverlay.hidden = true;
    };
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

  proposalModalTitle.textContent = isReadOnly ? "Estimated ISR Aggregation weights & Reasoning" : "Configure ISR Aggregation Weights";

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
        ${isReadOnly ? "ISR Aggregation weights applied for this issue. Hover over components to see evaluation criteria." : "Adjust aggregation weights (hover to see criteria). The sum of all weights must be exactly 100%."}
      </div>
      
      <div class="isr-components-grid" style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px;">
        ${isReadOnly ? `
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
        ` : `
          <div class="custom-tooltip" data-tooltip="${escapeHtmlAttr(reasoning_R)}" style="background:var(--surface-soft); padding:12px; border-radius:8px; border:1px solid var(--border); display:flex; flex-direction:column; gap:6px; text-align:left;">
            <label style="font-size:0.75rem; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Relevance (R) (%)</label>
            <input type="number" id="edit-isr-wR" value="${Math.round(wR * 100)}" min="0" max="100" style="width:100%; padding:6px; border:1px solid var(--border); border-radius:4px; background:var(--surface); color:var(--text); font-weight:700; font-size:1.15rem;" />
          </div>
          <div class="custom-tooltip" data-tooltip="${escapeHtmlAttr(reasoning_E)}" style="background:var(--surface-soft); padding:12px; border-radius:8px; border:1px solid var(--border); display:flex; flex-direction:column; gap:6px; text-align:left;">
            <label style="font-size:0.75rem; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Expertise (E) (%)</label>
            <input type="number" id="edit-isr-wE" value="${Math.round(wE * 100)}" min="0" max="100" style="width:100%; padding:6px; border:1px solid var(--border); border-radius:4px; background:var(--surface); color:var(--text); font-weight:700; font-size:1.15rem;" />
          </div>
          <div class="custom-tooltip" data-tooltip="${escapeHtmlAttr(reasoning_C)}" style="background:var(--surface-soft); padding:12px; border-radius:8px; border:1px solid var(--border); display:flex; flex-direction:column; gap:6px; text-align:left;">
            <label style="font-size:0.75rem; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Contribution (C) (%)</label>
            <input type="number" id="edit-isr-wC" value="${Math.round(wC * 100)}" min="0" max="100" style="width:100%; padding:6px; border:1px solid var(--border); border-radius:4px; background:var(--surface); color:var(--text); font-weight:700; font-size:1.15rem;" />
          </div>
        `}
      </div>
      
      <div style="display:flex; flex-direction:column; gap:6px;">
        <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted);">ISR Aggregation Reasoning Summary</label>
        <div class="topic-detail-note" style="min-height: 80px; text-align: left;">
          ${reasoning}
        </div>
      </div>
      
      <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:8px;">
        ${isReadOnly ? `
          <button type="button" class="topic-back-btn" id="isr-modal-close-view" style="padding:8px 16px; border-radius:8px; cursor:pointer; border:1px solid var(--border); background:var(--surface-muted); color:var(--text);">Close</button>
        ` : `
          <button type="button" class="tour-btn tour-btn-secondary" id="isr-modal-cancel" style="padding:8px 16px;">Cancel</button>
          <button type="button" class="tour-btn tour-btn-primary" id="isr-modal-save" style="padding:8px 16px;">Save & Apply</button>
        `}
      </div>
    </div>
  `;

  proposalModalBody.innerHTML = contentHtml;

  if (isReadOnly) {
    document.getElementById('isr-modal-close-view').onclick = () => { proposalModalOverlay.hidden = true; };
  } else {
    document.getElementById('isr-modal-cancel').onclick = () => { proposalModalOverlay.hidden = true; };
    document.getElementById('isr-modal-save').onclick = () => {
      const valR = parseInt(document.getElementById('edit-isr-wR').value) || 0;
      const valE = parseInt(document.getElementById('edit-isr-wE').value) || 0;
      const valC = parseInt(document.getElementById('edit-isr-wC').value) || 0;

      if (valR + valE + valC !== 100) {
        alert('ISR aggregation weights must sum to exactly 100%. Current sum: ' + (valR + valE + valC) + '%');
        return;
      }

      onSave({
        w_relevance: valR / 100,
        w_expertise: valE / 100,
        w_contribution: valC / 100
      });

      proposalModalOverlay.hidden = true;
    };
  }

  proposalModalCloseBtn.onclick = () => { proposalModalOverlay.hidden = true; };
  proposalModalOverlay.hidden = false;
}

/**
 * openExpertiseModal - Unifies the Expertise configuration and visualization modal.
 */
function openExpertiseModal(params, onSave, isReadOnly = false) {
  const proposalModalOverlay = document.getElementById('proposal-modal-overlay');
  const proposalModalCloseBtn = document.getElementById('proposal-modal-close-btn');
  const proposalModalTitle = document.getElementById('proposal-modal-title');
  const proposalModalBody = document.getElementById('proposal-modal-body');

  if (!proposalModalOverlay || !proposalModalCloseBtn || !proposalModalTitle || !proposalModalBody) return;

  proposalModalTitle.textContent = isReadOnly ? "Required Expertise & Direction" : "Configure Required Expertise";

  const domain = params.expertise_domain || "General Maintenance";
  const depth = params.expertise_depth || "None";
  const minExpYears = params.min_experience_years !== undefined ? params.min_experience_years : 2;
  const wEdu = params.expertise_weights ? params.expertise_weights.w_education : (params.w_education !== undefined ? params.w_education : 0.3);
  const wExp = params.expertise_weights ? params.expertise_weights.w_experience : (params.w_experience !== undefined ? params.w_experience : 0.4);
  const wRes = params.expertise_weights ? params.expertise_weights.w_resources : (params.w_resources !== undefined ? params.w_resources : 0.3);

  const reasoning_education = params.reasoning_education || (params.expertise_explanations ? params.expertise_explanations.reasoning_education : null) || "Matches verified diplomas/degrees or educational background.";
  const reasoning_experience = params.reasoning_experience || (params.expertise_explanations ? params.expertise_explanations.reasoning_experience : null) || "Matches professional post duration, job titles, or certified work history.";
  const reasoning_resources = params.reasoning_resources || (params.expertise_explanations ? params.expertise_explanations.reasoning_resources : null) || "Matches direct access to physical tools, venues, materials, or equipment.";
  const expertiseReasoning = params.expertise_weights_reasoning || params.expertise_reasoning || "Required expertise weights balance formal education, practical experience, and resource availability for this issue.";

  const importanceOrder = { high: 3, medium: 2, low: 1 };
  const sortedResources = [...(params.resources_needed || [])].sort((a, b) => {
    const valA = importanceOrder[a.importance_level] || 0;
    const valB = importanceOrder[b.importance_level] || 0;
    return valB - valA;
  });

  const contentHtml = `
    <div style="display:flex; flex-direction:column; gap:16px; color:var(--text);">
      <div style="font-size:0.9rem; color:var(--text-muted); border-bottom:1px solid var(--border); padding-bottom:8px; margin-bottom:8px;">
        ${isReadOnly ? "Required domain expertise direction, depth, and component weights. Hover over components to see evaluation criteria." : "Adjust required expertise parameters (hover to see criteria). The sum of all weights must be exactly 100%."}
      </div>
      
      <div class="expertise-components-grid" style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px;">
        ${isReadOnly ? `
          <div class="custom-tooltip" data-tooltip="${escapeHtmlAttr(reasoning_education)}" style="background:var(--surface-soft); padding:12px; border-radius:8px; border:1px solid var(--border); text-align:left; display:flex; flex-direction:column; justify-content:space-between; min-height:140px;">
            <div>
              <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600; text-transform:uppercase; margin-bottom:4px;">Education</div>
              <div style="font-size:1.2rem; font-weight:700; color:var(--text);">${(wEdu * 100).toFixed(0)}% <span style="font-size:0.8rem; font-weight:normal; color:var(--text-soft); display:block; margin-top:2px;">Weight</span></div>
            </div>
            <div style="font-size:0.72rem; color:var(--primary); margin-top:6px; font-weight:500; border-top:1px solid var(--border-soft); padding-top:4px;">
              <strong>Domain:</strong> ${domain}<br>
              <strong>Depth:</strong> ${depth}
            </div>
          </div>
          <div class="custom-tooltip" data-tooltip="${escapeHtmlAttr(reasoning_experience)}" style="background:var(--surface-soft); padding:12px; border-radius:8px; border:1px solid var(--border); text-align:left; display:flex; flex-direction:column; justify-content:space-between; min-height:140px;">
            <div>
              <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600; text-transform:uppercase; margin-bottom:4px;">Experience</div>
              <div style="font-size:1.2rem; font-weight:700; color:var(--text);">${(wExp * 100).toFixed(0)}% <span style="font-size:0.8rem; font-weight:normal; color:var(--text-soft); display:block; margin-top:2px;">Weight</span></div>
            </div>
            <div style="font-size:0.72rem; color:var(--primary); margin-top:6px; font-weight:500; border-top:1px solid var(--border-soft); padding-top:4px;">
              <strong>Dir:</strong> ${domain}<br>
              <strong>Min:</strong> ${minExpYears} yr(s)
            </div>
          </div>
          <div class="custom-tooltip" data-tooltip="${escapeHtmlAttr(reasoning_resources)}" style="background:var(--surface-soft); padding:12px; border-radius:8px; border:1px solid var(--border); text-align:left; display:flex; flex-direction:column; justify-content:space-between; min-height:140px;">
            <div>
              <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600; text-transform:uppercase; margin-bottom:4px;">Resources</div>
              <div style="font-size:1.2rem; font-weight:700; color:var(--text);">${(wRes * 100).toFixed(0)}% <span style="font-size:0.8rem; font-weight:normal; color:var(--text-soft); display:block; margin-top:2px;">Weight</span></div>
            </div>
            ${sortedResources.length > 0 ? `
              <div style="font-size:0.68rem; color:var(--primary); margin-top:6px; border-top:1px solid var(--border-soft); padding-top:4px; max-height:60px; overflow-y:auto; line-height:1.2;">
                ${sortedResources.map(r => `<div style="margin-bottom:1px;">• <strong>${r.resource_type.split('_')[0]}</strong> (${r.importance_level[0].toUpperCase()}): ${r.explanation.substring(0, 30)}...</div>`).join('')}
              </div>
            ` : `<div style="font-size:0.72rem; color:var(--text-muted); margin-top:6px; border-top:1px solid var(--border-soft); padding-top:4px;">None</div>`}
          </div>
        ` : `
          <div class="custom-tooltip" data-tooltip="${escapeHtmlAttr(reasoning_education)}" style="background:var(--surface-soft); padding:12px; border-radius:8px; border:1px solid var(--border); display:flex; flex-direction:column; gap:6px; text-align:left;">
            <label style="font-size:0.7rem; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Education (%)</label>
            <input type="number" id="edit-exp-wEdu" value="${Math.round(wEdu * 100)}" min="0" max="100" style="width:100%; padding:6px; border:1px solid var(--border); border-radius:4px; background:var(--surface); color:var(--text); font-weight:700; font-size:1.15rem;" />
            <div style="display:flex; flex-direction:column; gap:4px; margin-top:4px; border-top: 1px solid var(--border-soft); padding-top:6px;">
              <label style="font-size:0.7rem; color:var(--text-soft); font-weight:600; text-transform:uppercase;">Domain</label>
              <input type="text" id="edit-exp-domain" value="${domain}" style="width:100%; padding:4px; border:1px solid var(--border); border-radius:4px; background:var(--surface); color:var(--text); font-size:0.8rem;" />
            </div>
            <div style="display:flex; flex-direction:column; gap:4px; margin-top:2px;">
              <label style="font-size:0.7rem; color:var(--text-soft); font-weight:600; text-transform:uppercase;">Depth</label>
              <select id="edit-exp-depth" style="width:100%; padding:4px; border:1px solid var(--border); border-radius:4px; background:var(--surface); color:var(--text); font-size:0.8rem;">
                <option value="PhD" ${depth === 'PhD' ? 'selected' : ''}>PhD</option>
                <option value="Master" ${depth === 'Master' ? 'selected' : ''}>Master</option>
                <option value="Bachelor" ${depth === 'Bachelor' ? 'selected' : ''}>Bachelor</option>
                <option value="College" ${depth === 'College' ? 'selected' : ''}>College</option>
                <option value="Vocational Training" ${depth === 'Vocational Training' ? 'selected' : ''}>Vocational Training</option>
                <option value="None" ${depth === 'None' ? 'selected' : ''}>None</option>
              </select>
            </div>
          </div>
          <div class="custom-tooltip" data-tooltip="${escapeHtmlAttr(reasoning_experience)}" style="background:var(--surface-soft); padding:12px; border-radius:8px; border:1px solid var(--border); display:flex; flex-direction:column; gap:6px; text-align:left;">
            <label style="font-size:0.7rem; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Experience (%)</label>
            <input type="number" id="edit-exp-wExp" value="${Math.round(wExp * 100)}" min="0" max="100" style="width:100%; padding:6px; border:1px solid var(--border); border-radius:4px; background:var(--surface); color:var(--text); font-weight:700; font-size:1.15rem;" />
            <div style="display:flex; flex-direction:column; gap:4px; margin-top:4px; border-top: 1px solid var(--border-soft); padding-top:6px;">
              <label style="font-size:0.7rem; color:var(--text-soft); font-weight:600; text-transform:uppercase;">Min Years</label>
              <input type="number" id="edit-exp-min-years" value="${minExpYears}" min="0" max="50" style="width:100%; padding:4px; border:1px solid var(--border); border-radius:4px; background:var(--surface); color:var(--text); font-size:0.8rem;" />
            </div>
          </div>
          <div class="custom-tooltip" data-tooltip="${escapeHtmlAttr(reasoning_resources)}" style="background:var(--surface-soft); padding:12px; border-radius:8px; border:1px solid var(--border); display:flex; flex-direction:column; gap:6px; text-align:left;">
            <label style="font-size:0.7rem; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Resources (%)</label>
            <input type="number" id="edit-exp-wRes" value="${Math.round(wRes * 100)}" min="0" max="100" style="width:100%; padding:6px; border:1px solid var(--border); border-radius:4px; background:var(--surface); color:var(--text); font-weight:700; font-size:1.15rem;" />
            ${sortedResources.length > 0 ? `
              <div style="font-size:0.68rem; color:var(--primary); margin-top:4px; border-top: 1px solid var(--border-soft); padding-top:4px; max-height:80px; overflow-y:auto; line-height:1.2;">
                ${sortedResources.map(r => `<div style="margin-bottom:2px;">• <strong>${r.resource_type.split('_')[0]}</strong> (${r.importance_level})</div>`).join('')}
              </div>
            ` : ''}
          </div>
        `}
      </div>

      <div style="display:flex; flex-direction:column; gap:6px;">
        <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted);">Expertise Reasoning Summary</label>
        <div class="topic-detail-note" style="min-height: 80px; text-align: left;">
          ${expertiseReasoning}
        </div>
      </div>
      
      <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:8px;">
        ${isReadOnly ? `
          <button type="button" class="topic-back-btn" id="expertise-modal-close-view" style="padding:8px 16px; border-radius:8px; cursor:pointer; border:1px solid var(--border); background:var(--surface-muted); color:var(--text);">Close</button>
        ` : `
          <button type="button" class="tour-btn tour-btn-secondary" id="expertise-modal-cancel" style="padding:8px 16px;">Cancel</button>
          <button type="button" class="tour-btn tour-btn-primary" id="expertise-modal-save" style="padding:8px 16px;">Save & Apply</button>
        `}
      </div>
    </div>
  `;

  proposalModalBody.innerHTML = contentHtml;

  if (isReadOnly) {
    document.getElementById('expertise-modal-close-view').onclick = () => { proposalModalOverlay.hidden = true; };
  } else {
    document.getElementById('expertise-modal-cancel').onclick = () => { proposalModalOverlay.hidden = true; };
    document.getElementById('expertise-modal-save').onclick = () => {
      const valEdu = parseInt(document.getElementById('edit-exp-wEdu').value) || 0;
      const valExp = parseInt(document.getElementById('edit-exp-wExp').value) || 0;
      const valRes = parseInt(document.getElementById('edit-exp-wRes').value) || 0;
      const valDomain = document.getElementById('edit-exp-domain').value.trim() || "General Maintenance";
      const valDepth = document.getElementById('edit-exp-depth').value || "None";
      const valMinYears = parseInt(document.getElementById('edit-exp-min-years').value) || 0;

      if (valEdu + valExp + valRes !== 100) {
        alert('Expertise weights must sum to exactly 100%. Current sum: ' + (valEdu + valExp + valRes) + '%');
        return;
      }

      onSave({
        expertise_domain: valDomain,
        expertise_depth: valDepth,
        min_experience_years: valMinYears,
        expertise_weights: {
          w_education: valEdu / 100,
          w_experience: valExp / 100,
          w_resources: valRes / 100
        }
      });

      proposalModalOverlay.hidden = true;
    };
  }

  proposalModalCloseBtn.onclick = () => { proposalModalOverlay.hidden = true; };
  proposalModalOverlay.hidden = false;
}
