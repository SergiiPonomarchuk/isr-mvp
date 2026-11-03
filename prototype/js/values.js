/**
 * mapTaxonomyToUserValues - Maps database taxonomy array to user-friendly value category arrays.
 */
function mapTaxonomyToUserValues(taxonomy) {
  return {
    domains: [
      { id: 1, name: 'Agency & Freedom', score: taxonomy.domains[0] !== undefined ? taxonomy.domains[0] : 50 },
      { id: 2, name: 'Relationality & Care', score: taxonomy.domains[1] !== undefined ? taxonomy.domains[1] : 50 },
      { id: 3, name: 'Security & Stable Order', score: taxonomy.domains[2] !== undefined ? taxonomy.domains[2] : 50 },
      { id: 4, name: 'Justice & Fairness', score: taxonomy.domains[3] !== undefined ? taxonomy.domains[3] : 50 },
      { id: 5, name: 'Redemption & Restoration', score: taxonomy.domains[4] !== undefined ? taxonomy.domains[4] : 50 },
      { id: 6, name: 'Authentic Expression', score: taxonomy.domains[5] !== undefined ? taxonomy.domains[5] : 50 },
      { id: 7, name: 'Protective Care & Stewardship', score: taxonomy.domains[6] !== undefined ? taxonomy.domains[6] : 50 },
      { id: 8, name: 'Cooperation & Shared Governance', score: taxonomy.domains[7] !== undefined ? taxonomy.domains[7] : 50 },
      { id: 9, name: 'Spiritual & Religious Practice', score: taxonomy.domains[8] !== undefined ? taxonomy.domains[8] : 50 },
      { id: 10, name: 'Digital Rights & Tech Democracy', score: taxonomy.domains[9] !== undefined ? taxonomy.domains[9] : 50 }
    ],
    contextShifts: {
      work: (taxonomy.contextual_shifts && taxonomy.contextual_shifts.work) || [0,0,0,0,0,0,0,0,0,0],
      family: (taxonomy.contextual_shifts && taxonomy.contextual_shifts.family) || [0,0,0,0,0,0,0,0,0,0],
      private: (taxonomy.contextual_shifts && taxonomy.contextual_shifts.private) || [0,0,0,0,0,0,0,0,0,0],
      crisis: (taxonomy.contextual_shifts && taxonomy.contextual_shifts.crisis) || [0,0,0,0,0,0,0,0,0,0]
    },
    items: taxonomy.items || {},
    conflictResolution: [
      { name: 'Individual Freedom vs. Collective Harmony', weight: taxonomy.conflict_resolution[0] !== undefined ? taxonomy.conflict_resolution[0] : 50 },
      { name: 'Truth-Telling vs. Kindness', weight: taxonomy.conflict_resolution[1] !== undefined ? taxonomy.conflict_resolution[1] : 50 },
      { name: 'Proportional Justice vs. Restoration', weight: taxonomy.conflict_resolution[2] !== undefined ? taxonomy.conflict_resolution[2] : 50 },
      { name: 'Equal Distribution vs. Merit-Based', weight: taxonomy.conflict_resolution[3] !== undefined ? taxonomy.conflict_resolution[3] : 50 },
      { name: 'Kin/Close vs. Universal Responsibility', weight: taxonomy.conflict_resolution[4] !== undefined ? taxonomy.conflict_resolution[4] : 50 },
      { name: 'Stability vs. Change', weight: taxonomy.conflict_resolution[5] !== undefined ? taxonomy.conflict_resolution[5] : 50 },
      { name: 'Tradition vs. Innovation', weight: taxonomy.conflict_resolution[6] !== undefined ? taxonomy.conflict_resolution[6] : 50 },
      { name: 'Self-Interest vs. Collective Welfare', weight: taxonomy.conflict_resolution[7] !== undefined ? taxonomy.conflict_resolution[7] : 50 },
      { name: 'Individual Responsibility vs. Systemic Causation', weight: taxonomy.conflict_resolution[8] !== undefined ? taxonomy.conflict_resolution[8] : 50 },
      { name: 'Self-Sacrifice vs. Self-Preservation', weight: taxonomy.conflict_resolution[9] !== undefined ? taxonomy.conflict_resolution[9] : 50 },
      { name: 'Competition vs. Cooperation', weight: taxonomy.conflict_resolution[10] !== undefined ? taxonomy.conflict_resolution[10] : 50 },
      { name: 'In-Group Loyalty vs. Impartial Justice', weight: taxonomy.conflict_resolution[11] !== undefined ? taxonomy.conflict_resolution[11] : 50 },
      { name: 'Question Authority vs. Accept Authority', weight: taxonomy.conflict_resolution[12] !== undefined ? taxonomy.conflict_resolution[12] : 50 },
      { name: 'Certainty vs. Possibility', weight: taxonomy.conflict_resolution[13] !== undefined ? taxonomy.conflict_resolution[13] : 50 },
      { name: 'Principle vs. Pragmatism', weight: taxonomy.conflict_resolution[14] !== undefined ? taxonomy.conflict_resolution[14] : 50 },
      { name: 'Present vs. Future Security', weight: taxonomy.conflict_resolution[15] !== undefined ? taxonomy.conflict_resolution[15] : 50 },
      { name: 'Universal Standards vs. Cultural Relativism', weight: taxonomy.conflict_resolution[16] !== undefined ? taxonomy.conflict_resolution[16] : 50 },
      { name: 'Individual Rights vs. Collective Duty', weight: taxonomy.conflict_resolution[17] !== undefined ? taxonomy.conflict_resolution[17] : 50 },
      { name: 'Efficiency vs. Human Care', weight: taxonomy.conflict_resolution[18] !== undefined ? taxonomy.conflict_resolution[18] : 50 },
      { name: 'Freedom vs. Structure', weight: taxonomy.conflict_resolution[19] !== undefined ? taxonomy.conflict_resolution[19] : 50 },
      { name: 'Inner Truth vs. Social Belonging', weight: taxonomy.conflict_resolution[20] !== undefined ? taxonomy.conflict_resolution[20] : 50 },
      { name: 'Environmental Sustainability vs. Economic Prosperity', weight: taxonomy.conflict_resolution[21] !== undefined ? taxonomy.conflict_resolution[21] : 50 },
      { name: 'Cultural Preservation vs. Modernization', weight: taxonomy.conflict_resolution[22] !== undefined ? taxonomy.conflict_resolution[22] : 50 },
      { name: 'Protective Authority vs. Respecting Autonomy', weight: taxonomy.conflict_resolution[23] !== undefined ? taxonomy.conflict_resolution[23] : 50 },
      { name: 'Accountability vs. Compassion', weight: taxonomy.conflict_resolution[24] !== undefined ? taxonomy.conflict_resolution[24] : 50 },
      { name: 'Emotional Openness vs. Self-Protection', weight: taxonomy.conflict_resolution[25] !== undefined ? taxonomy.conflict_resolution[25] : 50 },
      { name: 'Digital Privacy vs. Convenience', weight: taxonomy.conflict_resolution[26] !== undefined ? taxonomy.conflict_resolution[26] : 50 },
      { name: 'Human Labor vs. Automation', weight: taxonomy.conflict_resolution[27] !== undefined ? taxonomy.conflict_resolution[27] : 50 },
      { name: 'Tech Innovation vs. Democratic Control', weight: taxonomy.conflict_resolution[28] !== undefined ? taxonomy.conflict_resolution[28] : 50 },
      { name: 'Digital Privacy vs. Safety', weight: taxonomy.conflict_resolution[29] !== undefined ? taxonomy.conflict_resolution[29] : 50 },
      { name: 'Digital Inclusion vs. Environmental Cost', weight: taxonomy.conflict_resolution[30] !== undefined ? taxonomy.conflict_resolution[30] : 50 },
      { name: 'Spiritual Authority vs. Democratic Governance', weight: taxonomy.conflict_resolution[31] !== undefined ? taxonomy.conflict_resolution[31] : 50 },
      { name: 'Digital Privacy vs. Social Connection', weight: taxonomy.conflict_resolution[32] !== undefined ? taxonomy.conflict_resolution[32] : 50 },
      { name: 'Digital vs. Embodied Experience', weight: taxonomy.conflict_resolution[33] !== undefined ? taxonomy.conflict_resolution[33] : 50 },
      { name: 'Digital Privacy vs. Collective Transparency', weight: taxonomy.conflict_resolution[34] !== undefined ? taxonomy.conflict_resolution[34] : 50 },
      { name: 'Justice-Based vs. Cooperative Distribution', weight: taxonomy.conflict_resolution[35] !== undefined ? taxonomy.conflict_resolution[35] : 50 }
    ]
  };
}

/**
 * calculateMicrocommunityValuesDynamic - Aggregates the values taxonomy for all members of the ad-hoc public.
 */
async function calculateMicrocommunityValuesDynamic(memberUids, mcId) {
  if (typeof firebase === 'undefined') return null;
  const db = firebase.firestore();
  try {
    const membersSnap = await db.collection("microcommunity_members")
      .where("microcommunity_id", "==", mcId)
      .get();
    const membersData = [];
    const uidsToFetch = [];
    membersSnap.forEach(doc => {
      const data = doc.data();
      const uid = (data.user_id || '').toString();
      const relevance = parseFloat(data.relevance_score) || 0.1;
      membersData.push({ uid, relevance });
      if (uid) uidsToFetch.push(uid);
    });
    if (membersData.length === 0) return null;

    const userTaxonomies = {};
    await Promise.all(uidsToFetch.map(async (uid) => {
      const userDoc = await db.collection("users").doc(uid).get();
      if (userDoc.exists) {
        const uData = userDoc.data();
        if (uData && uData.values_taxonomy) {
          userTaxonomies[uid] = uData.values_taxonomy;
        }
      }
    }));

    const validMembers = membersData.filter(m => userTaxonomies[m.uid]);
    if (validMembers.length === 0) return null;

    const avgDomains = [];
    for (let i = 0; i < 10; i++) {
      let valSum = 0;
      let relSum = 0;
      validMembers.forEach(m => {
        const taxonomy = userTaxonomies[m.uid];
        const domainsList = taxonomy.domains || [];
        if (domainsList[i] !== undefined && domainsList[i] !== null) {
          valSum += domainsList[i] * m.relevance;
          relSum += m.relevance;
        }
      });
      avgDomains.push(relSum > 0 ? Math.round(valSum / relSum) : 50);
    }

    const avgContextShifts = {};
    ['work', 'family', 'private', 'crisis'].forEach(ctx => {
      const avgCtxList = [];
      for (let i = 0; i < 10; i++) {
        let valSum = 0;
        let relSum = 0;
        validMembers.forEach(m => {
          const taxonomy = userTaxonomies[m.uid];
          const shifts = taxonomy.contextual_shifts || {};
          const ctxList = shifts[ctx] || [];
          if (ctxList[i] !== undefined && ctxList[i] !== null) {
            valSum += ctxList[i] * m.relevance;
            relSum += m.relevance;
          }
        });
        avgCtxList.push(relSum > 0 ? Math.round(valSum / relSum) : 0);
      }
      avgContextShifts[ctx] = avgCtxList;
    });

    const avgItems = {};
    for (let i = 1; i <= 10; i++) {
      const key = 'd' + i;
      let itemsLen = 0;
      for (let m of validMembers) {
        const taxonomy = userTaxonomies[m.uid];
        const items = taxonomy.items || {};
        if (items[key] && items[key].length > 0) {
          itemsLen = items[key].length;
          break;
        }
      }
      if (itemsLen > 0) {
        const avgItemList = [];
        for (let j = 0; j < itemsLen; j++) {
          let valSum = 0;
          let relSum = 0;
          validMembers.forEach(m => {
            const taxonomy = userTaxonomies[m.uid];
            const items = taxonomy.items || {};
            const itemList = items[key] || [];
            if (itemList[j] !== undefined && itemList[j] !== null) {
              valSum += itemList[j] * m.relevance;
              relSum += m.relevance;
            }
          });
          avgItemList.push(relSum > 0 ? Math.round(valSum / relSum) : null);
        }
        avgItems[key] = avgItemList;
      } else {
        avgItems[key] = [];
      }
    }

    const avgConflictResolution = [];
    for (let i = 0; i < 36; i++) {
      let valSum = 0;
      let relSum = 0;
      validMembers.forEach(m => {
        const taxonomy = userTaxonomies[m.uid];
        const conflicts = taxonomy.conflict_resolution || [];
        let val = null;
        if (conflicts[i] !== undefined && conflicts[i] !== null) {
          const entry = conflicts[i];
          val = (typeof entry === 'object' && entry !== null) ? entry.weight : entry;
        }
        if (val !== null) {
          valSum += val * m.relevance;
          relSum += m.relevance;
        }
      });
      avgConflictResolution.push(relSum > 0 ? Math.round(valSum / relSum) : 50);
    }

    return {
      domains: avgDomains,
      contextual_shifts: avgContextShifts,
      items: avgItems,
      conflict_resolution: avgConflictResolution
    };
  } catch (err) {
    console.error("Dynamic calculation error:", err);
    return null;
  }
}

/**
 * bindValuesSection - Binds event listeners and logic for the profile values editor.
 */
function bindValuesSection(container) {
  const editBtn = container.querySelector('#values-edit-btn');
  const explainBtn = container.querySelector('#values-explain-btn');
  const saveBtn = container.querySelector('#values-save-btn');
  const cancelBtn = container.querySelector('#values-cancel-btn');

  const viewMode = container.querySelector('#values-view-mode');
  const editMode = container.querySelector('#values-edit-mode');

  const textDisplay = container.querySelector('#values-text-display');
  const textarea = container.querySelector('#values-textarea');

  const aiCard = container.querySelector('#values-ai-card');
  const aiInput = container.querySelector('#values-ai-input');
  const aiSendBtn = container.querySelector('#values-ai-send-btn');
  const aiMessages = container.querySelector('#values-ai-messages');

  if (!editBtn || !saveBtn || !cancelBtn || !viewMode || !editMode || !textDisplay || !textarea) {
    return;
  }

  let originalValue = textarea.value;

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderDisplayFromTextarea(value) {
    const paragraphs = value
      .split(/\n\s*\n/)
      .map(function (p) { return p.trim(); })
      .filter(function (p) { return p.length > 0; });

    document.querySelectorAll('#values-text-display').forEach(el => {
      el.innerHTML = paragraphs.map(function (p) {
        return '<p>' + escapeHtml(p) + '</p>';
      }).join('');
    });
    
    document.querySelectorAll('#values-textarea').forEach(el => {
      el.value = value;
    });
  }

  editBtn.onclick = function() {
    viewMode.style.display = 'none';
    editMode.style.display = 'block';
    originalValue = textarea.value;
    textarea.focus();
  };

  cancelBtn.onclick = function() {
    viewMode.style.display = 'block';
    editMode.style.display = 'none';
    textarea.value = originalValue;
  };

  saveBtn.onclick = async function() {
    const value = textarea.value.trim();
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    try {
      const db = firebase.firestore();
      const currentUserId = sessionStorage.getItem('userId');
      if (currentUserId) {
        await db.collection("users").doc(currentUserId.toString()).update({
          values_description: value
        });
      }
      renderDisplayFromTextarea(value);
      viewMode.style.display = 'block';
      editMode.style.display = 'none';
    } catch(err) {
      alert("Failed to save values: " + err.message);
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save';
    }
  };

  if (explainBtn && aiCard) {
    explainBtn.onclick = function() {
      aiCard.style.display = aiCard.style.display === 'block' ? 'none' : 'block';
    };
  }

  // Bind AI helper chat if exist
  if (aiInput && aiSendBtn && aiMessages) {
    const appendMsg = (role, text) => {
      const msg = document.createElement('div');
      msg.className = 'ai-msg ' + (role === 'user' ? 'ai-msg-user' : 'ai-msg-assistant');
      msg.textContent = text;
      aiMessages.appendChild(msg);
      aiMessages.scrollTop = aiMessages.scrollHeight;
    };

    aiSendBtn.onclick = async function() {
      const text = aiInput.value.trim();
      if (!text) return;

      aiInput.value = '';
      appendMsg('user', text);

      aiSendBtn.disabled = true;
      try {
        const db = firebase.firestore();
        const currentUserId = sessionStorage.getItem('userId');
        const userDoc = await db.collection("users").doc(currentUserId.toString()).get();
        const userData = userDoc.exists ? userDoc.data() : {};
        
        appendMsg('assistant', "Analyzing your statement against the values framework...");
        
        // Dynamic call to backend helper functions
        const functions = firebase.functions();
        const analyzeStatement = functions.httpsCallable('analyzeStatement');
        const res = await analyzeStatement({
          statement: text,
          currentTaxonomy: userData.values_taxonomy || null
        });

        // Remove the temporary loading message
        aiMessages.removeChild(aiMessages.lastChild);

        if (res.data && res.data.success) {
          appendMsg('assistant', res.data.explanation);
          if (res.data.newTaxonomy) {
            await db.collection("users").doc(currentUserId.toString()).update({
              values_taxonomy: res.data.newTaxonomy
            });
            if (typeof window.bindValuesSection === 'function') {
              const root = document.getElementById('section-values');
              if (root) window.bindValuesSection(root);
            }
          }
        } else {
          appendMsg('assistant', "Failed to refine worldview vector. Error: " + (res.data ? res.data.error : "Unknown"));
        }
      } catch (err) {
        console.error(err);
        aiMessages.removeChild(aiMessages.lastChild);
        appendMsg('assistant', "Error running values assistant: " + err.message);
      } finally {
        aiSendBtn.disabled = false;
      }
    };

    aiInput.onkeydown = function(e) {
      if (e.key === 'Enter') {
        aiSendBtn.click();
      }
    };
  }
}

/**
 * initValuesSection - Bootstraps values bindings.
 */
function initValuesSection() {
  const root = document.getElementById('section-values');
  if (root) bindValuesSection(root);
}
