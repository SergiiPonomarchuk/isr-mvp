// Initialize Firebase
if (typeof firebase !== 'undefined' && typeof firebaseConfig !== 'undefined') {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
}

const sectionTitles = {
  chat: 'Chat',
  voting: 'Voting',
  tasks: 'To Do',
  values: 'Values',
  profile: 'Profile',
  settings: 'Settings'
};

function formatTaskDeadline(dateStr) {
  if (!dateStr || dateStr === "Ongoing") return "";
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return dateStr;
}

function getMostUrgentTask(tasks) {
  if (!tasks || tasks.length === 0) return null;
  const unfinished = tasks.filter(t => t.status !== 'done');
  if (unfinished.length === 0) return null;
  
  unfinished.sort((a, b) => {
    const dateA = a.deadline ? new Date(a.deadline) : new Date(8640000000000000);
    const dateB = b.deadline ? new Date(b.deadline) : new Date(8640000000000000);
    return dateA - dateB;
  });
  return unfinished[0];
}

function isUrgentDate(dateStr) {
  if (!dateStr) return false;
  const target = new Date(dateStr);
  const today = new Date("2026-06-05");
  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 3;
}

let currentSectionId = null;

function toggleContent(id) {
  const content = document.getElementById(id);
  if (!content) return;
  content.style.display = content.style.display === 'block' ? 'none' : 'block';
}

function safeGetStorage(key) {
  try {
    return sessionStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

function safeSetStorage(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch (e) {}
}

function openSectionModal(sectionId) {
  const overlay = document.getElementById('section-modal-overlay');
  const titleEl = document.getElementById('section-modal-title');
  const bodyEl = document.getElementById('section-modal-body');
  const source = document.getElementById('section-' + sectionId);
  const menu = document.getElementById('menu');

  if (!overlay || !titleEl || !bodyEl || !source) return;

  if (menu) menu.classList.remove('menu-open');

  titleEl.textContent = sectionTitles[sectionId] || sectionId;
  bodyEl.removeAttribute('data-topic-detail-open');
  bodyEl.__restoreView = null;
  bodyEl.innerHTML = source.innerHTML;

  currentSectionId = sectionId;
  overlay.classList.add('active');
  document.body.classList.add('modal-open');

  // Bind interactions for list elements immediately
  if (typeof window.bindTopicListInteractions === 'function') {
    window.bindTopicListInteractions();
  }

  // If opening values section, bind values-specific event listeners in the modal
  if (sectionId === 'values' && typeof window.bindValuesSection === 'function') {
    window.bindValuesSection(bodyEl);
  }
}

function closeSectionModal() {
  const overlay = document.getElementById('section-modal-overlay');
  const bodyEl = document.getElementById('section-modal-body');
  const titleEl = document.getElementById('section-modal-title');

  if (!overlay || !bodyEl) return;

  // NEW BEHAVIOR: If a topic detail is open, restore the list view and STOP.
  if (bodyEl.hasAttribute('data-topic-detail-open') && typeof bodyEl.__restoreView === 'function') {
    bodyEl.__restoreView();
    
    // Restore the modal title (e.g., from the topic back to "Voting" or "Chat")
    if (titleEl && bodyEl.hasAttribute('data-topic-source-title')) {
      titleEl.textContent = bodyEl.getAttribute('data-topic-source-title');
    }
    
    // Exit the function early so the modal itself does not close
    return; 
  }

  // Clear modal body
  bodyEl.innerHTML = '';
  bodyEl.removeAttribute('data-topic-detail-open');
  bodyEl.__restoreView = null;

  currentSectionId = null;
  overlay.classList.remove('active');
  document.body.classList.remove('modal-open');
}

function initLoginPage() {
  const usernameInput = document.getElementById('login-username');
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');

  const loginOverlay = document.getElementById('login-modal-overlay');
  const closeBtn = document.getElementById('login-modal-close-btn');

  if (closeBtn && loginOverlay) {
    closeBtn.onclick = function() {
      loginOverlay.hidden = true;
    };
  }

  const currentUserId = safeGetStorage('userId');

  if (usernameInput && loginBtn && registerBtn) {
    const syncButtons = () => {
      const hasValue = usernameInput.value.trim().length > 0;
      loginBtn.disabled = !hasValue;
      registerBtn.disabled = !hasValue;
    };

    syncButtons();
    usernameInput.addEventListener('input', syncButtons);

    loginBtn.addEventListener('click', async function () {
      const value = usernameInput.value.trim();
      if (!value) return;
      loginBtn.disabled = true;
      loginBtn.textContent = "Logging in...";
      try {
        const db = firebase.firestore();
        const snap = await db.collection("users").where("displayName", "==", value).limit(1).get();
        if (!snap.empty) {
          const userDoc = snap.docs[0];
          safeSetStorage('userId', userDoc.id);
          safeSetStorage('userName', value);
          if (loginOverlay) loginOverlay.hidden = true;
          window.location.reload();
        } else {
          alert("No user found with display name '" + value + "'. Please adopt a profile below or click Register to create a new profile.");
          loginBtn.disabled = false;
          loginBtn.textContent = "Login";
        }
      } catch (err) {
        alert("Login failed: " + err.message);
        loginBtn.disabled = false;
        loginBtn.textContent = "Login";
      }
    });

    registerBtn.addEventListener('click', async function () {
      const value = usernameInput.value.trim();
      if (!value) return;
      registerBtn.disabled = true;
      registerBtn.textContent = "Registering...";
      try {
        const db = firebase.firestore();
        const newUid = 'user_' + Date.now();
        await db.collection("users").doc(newUid).set({
          uid: newUid,
          displayName: value,
          firstName: value.split(' ')[0] || value,
          lastName: value.split(' ').slice(1).join(' ') || '',
          birthDate: "1990-01-01",
          gender: "Not specified",
          nationality: "Swiss",
          values_description: "I believe in social responsibility, community cooperation, and transparency.",
          geography: [
            { type: "residence", place: "Basel", address: "Spalenring 12", geo: [47.5538, 7.6066], unit_type: "owner" }
          ],
          socialRelations: [],
          features: ["bike"],
          skills: [{ type: "education", name: "General Education" }],
          post: [{ job: "Innovator", place: "Basel", department: "Community", salary: "N/A" }]
        });
        safeSetStorage('userId', newUid);
        safeSetStorage('userName', value);
        if (loginOverlay) loginOverlay.hidden = true;
        window.location.reload();
      } catch (err) {
        alert("Registration failed: " + err.message);
        registerBtn.disabled = false;
        registerBtn.textContent = "Register";
      }
    });
  }

  // Profile search and adoption from Firestore
  const searchBtn = document.getElementById('search-profiles-btn');
  const searchResultsContainer = document.getElementById('search-results');
  
  if (searchBtn && searchResultsContainer) {
    searchBtn.addEventListener('click', async function () {
      searchResultsContainer.innerHTML = '<div style="color: var(--text-muted); font-size: 0.9rem; padding: 12px;">Searching database...</div>';
      
      try {
        const db = firebase.firestore();
        const nameVal = document.getElementById("search-name").value.trim();
        const gender = document.getElementById("search-gender").value;
        const jobVal = document.getElementById("search-job").value.toLowerCase().trim();
        const ageMin = parseInt(document.getElementById("search-age-min").value) || 0;
        const ageMax = parseInt(document.getElementById("search-age-max").value) || 200;

        const nameTerms = nameVal ? nameVal.toLowerCase().split(/\s+/).filter(Boolean) : [];
        let snapDocs = [];
        
        if (nameTerms.length > 0) {
          const firstTerm = nameTerms[0];
          if (/^\d+$/.test(firstTerm)) {
            const doc = await db.collection("users").doc(firstTerm).get();
            if (doc.exists) snapDocs.push(doc);
            
            const uidSnap = await db.collection("users").where("uid", "==", parseInt(firstTerm)).get();
            uidSnap.forEach(d => {
              if (!snapDocs.some(sd => sd.id === d.id)) snapDocs.push(d);
            });
          } else {
            const capName = firstTerm.charAt(0).toUpperCase() + firstTerm.slice(1);
            const lowerName = firstTerm;

            let queries = [];
            queries.push(db.collection("users").where("displayName", ">=", capName).where("displayName", "<=", capName + "\uf8ff").limit(50).get());
            queries.push(db.collection("users").where("firstName", ">=", capName).where("firstName", "<=", capName + "\uf8ff").limit(50).get());
            queries.push(db.collection("users").where("lastName", ">=", capName).where("lastName", "<=", capName + "\uf8ff").limit(50).get());

            if (lowerName !== capName) {
              queries.push(db.collection("users").where("displayName", ">=", lowerName).where("displayName", "<=", lowerName + "\uf8ff").limit(50).get());
              queries.push(db.collection("users").where("firstName", ">=", lowerName).where("firstName", "<=", lowerName + "\uf8ff").limit(50).get());
              queries.push(db.collection("users").where("lastName", ">=", lowerName).where("lastName", "<=", lowerName + "\uf8ff").limit(50).get());
            }
            
            const results = await Promise.all(queries);
            const uniqueDocs = new Map();
            results.forEach(snap => {
              snap.forEach(d => uniqueDocs.set(d.id, d));
            });
            snapDocs = Array.from(uniqueDocs.values());
          }
        } else {
          let q = db.collection("users");

          if (ageMin > 0 || ageMax < 200) {
            const currentYear = new Date().getFullYear();
            const minYear = currentYear - ageMax;
            const maxYear = currentYear - ageMin;
            q = q.where("birthDate", ">=", `${minYear}-01-01`).where("birthDate", "<=", `${maxYear}-12-31`);
          } else if (gender) {
            q = q.where("gender", "==", gender);
          }
          
          const snap = await q.limit(400).get();
          snap.forEach(d => snapDocs.push(d));
        }
        
        const matches = [];
        snapDocs.forEach(doc => {
          const user = doc.data();
          
          if (nameTerms.length > 0) {
            const fullName = (user.displayName || "").toLowerCase();
            const matchesAll = nameTerms.every(term => fullName.includes(term));
            if (!matchesAll) return;
          }
          if (gender && user.gender !== gender) return;
          
          const jobs = (user.post || []).map(p => (p.job || "").toLowerCase());
          if (jobVal && !jobs.some(j => j.includes(jobVal))) return;
          
          let age = null;
          if (user.birthDate) {
            const birthYear = parseInt(user.birthDate.split(/[-\/]/)[0]);
            if (!isNaN(birthYear)) {
              age = new Date().getFullYear() - birthYear;
            }
          }
          if (age !== null && (age < ageMin || age > ageMax)) return;
          if (age === null && (ageMin > 0 || ageMax < 200)) return;
          
          matches.push({ id: doc.id, ...user, age });
        });
        
        searchResultsContainer.innerHTML = '';
        if (matches.length === 0) {
          searchResultsContainer.innerHTML = '<div style="color: var(--text-muted); font-size: 0.9rem; padding: 12px;">No matching profiles found in database.</div>';
          return;
        }
        
        matches.forEach(user => {
          const card = document.createElement('div');
          card.className = 'profile-result-card';
          
          const primaryJob = user.post && user.post[0] ? user.post[0].job : 'Not specified';
          const ageText = user.age !== null ? `${user.age} y/o` : '';
          const metaText = [user.gender, ageText, primaryJob].filter(Boolean).join(' · ');
          
          card.innerHTML = `
            <div class="profile-result-info">
              <div class="profile-result-name">${user.displayName} (ID: ${user.uid})</div>
              <div class="profile-result-meta">${metaText}</div>
            </div>
            <button type="button" class="profile-adopt-btn" data-uid="${user.uid}" data-name="${user.displayName}">Adopt & Login</button>
          `;
          
          card.querySelector('.profile-adopt-btn').addEventListener('click', function () {
            const adoptedUid = this.getAttribute('data-uid');
            const adoptedName = this.getAttribute('data-name');
            safeSetStorage('userId', adoptedUid);
            safeSetStorage('userName', adoptedName);
            if (loginOverlay) loginOverlay.hidden = true;
            window.location.reload();
          });
          
          searchResultsContainer.appendChild(card);
        });
      } catch (err) {
        console.error("Firestore search failed:", err);
        searchResultsContainer.innerHTML = `<div style="color: var(--urgent); font-size: 0.9rem; padding: 12px;">Error: ${err.message}</div>`;
      }
    });
  }
}

function initValuesVectorModal() {
  var modal = document.getElementById('values-vector-modal');
  var closeBtn = document.getElementById('values-vector-close');
  var backdrop = document.getElementById('values-vector-backdrop');

  var domainsChart = document.getElementById('vector-domains-chart');
  var contextGrid = document.getElementById('context-shifts-grid');
  var domainsAccordion = document.getElementById('vector-domains-accordion');
  var conflictWeights = document.getElementById('vector-conflict-weights');
  var contextDetails = document.getElementById('vector-context-details');

  if (!modal || !closeBtn || !backdrop) return;

  var vectorData = {
    domains: [
      { id: 1, name: 'Agency & Freedom', score: 72 },
      { id: 2, name: 'Relationality & Care', score: 60 },
      { id: 3, name: 'Security & Stable Order', score: 68 },
      { id: 4, name: 'Justice & Fairness', score: 40 },
      { id: 5, name: 'Redemption & Restoration', score: 90, muted: true },
      { id: 6, name: 'Authentic Expression', score: 65 },
      { id: 7, name: 'Protective Care & Stewardship', score: 75 },
      { id: 8, name: 'Cooperation & Shared Governance', score: 58 },
      { id: 9, name: 'Spiritual & Religious Practice', score: 80 },
      { id: 10, name: 'Digital Rights & Tech Democracy', score: 90, muted: true }
    ],
    contextShifts: {
      work:    [10, 0, 0, 0, 0, 8, 7, 0, 0, 0],
      family:  [0, 12, 7, 0, 0, 6, 8, 0, 9, 0],
      private: [0, 0, 0, 0, 0, 6, 0, 0, 10, 0],
      crisis:  [-10, 0, 8, 0, 0, 0, 6, 7, 9, 0]
    },
    conflictResolution: [
      { name: 'Individual Freedom vs. Collective Harmony', weight: 78 },
      { name: 'Truth-Telling vs. Kindness', weight: 64 },
      { name: 'Proportional Justice vs. Restoration', weight: 82 },
      { name: 'Equal Distribution vs. Merit-Based', weight: 59 },
      { name: 'Kin/Close vs. Universal Responsibility', weight: 68 },
      { name: 'Stability vs. Change', weight: 74 },
      { name: 'Tradition vs. Innovation', weight: 50 },
      { name: 'Self-Interest vs. Collective Welfare', weight: 50 },
      { name: 'Individual Responsibility vs. Systemic Causation', weight: 50 },
      { name: 'Self-Sacrifice vs. Self-Preservation', weight: 50 },
      { name: 'Competition vs. Cooperation', weight: 50 },
      { name: 'In-Group Loyalty vs. Impartial Justice', weight: 50 },
      { name: 'Question Authority vs. Accept Authority', weight: 50 },
      { name: 'Certainty vs. Possibility', weight: 50 },
      { name: 'Principle vs. Pragmatism', weight: 50 },
      { name: 'Present vs. Future Security', weight: 50 },
      { name: 'Universal Standards vs. Cultural Relativism', weight: 50 },
      { name: 'Individual Rights vs. Collective Duty', weight: 50 },
      { name: 'Efficiency vs. Human Care', weight: 50 },
      { name: 'Freedom vs. Structure', weight: 50 },
      { name: 'Inner Truth vs. Social Belonging', weight: 50 },
      { name: 'Environmental Sustainability vs. Economic Prosperity', weight: 50 },
      { name: 'Cultural Preservation vs. Modernization', weight: 50 },
      { name: 'Protective Authority vs. Respecting Autonomy', weight: 50 },
      { name: 'Accountability vs. Compassion', weight: 50 },
      { name: 'Emotional Openness vs. Self-Protection', weight: 50 },
      { name: 'Digital Privacy vs. Convenience', weight: 50 },
      { name: 'Human Labor vs. Automation', weight: 50 },
      { name: 'Tech Innovation vs. Democratic Control', weight: 50 },
      { name: 'Digital Privacy vs. Safety', weight: 50 },
      { name: 'Digital Inclusion vs. Environmental Cost', weight: 50 },
      { name: 'Spiritual Authority vs. Democratic Governance', weight: 50 },
      { name: 'Digital Privacy vs. Social Connection', weight: 50 },
      { name: 'Digital vs. Embodied Experience', weight: 50 },
      { name: 'Digital Privacy vs. Collective Transparency', weight: 50 },
      { name: 'Justice-Based vs. Cooperative Distribution', weight: 50 }
    ]
  };

  var taxonomyDomains = [
    {
      id: 1,
      name: 'Agency & Freedom',
      definition: 'Degree to which community enables and protects individual capacity to make autonomous choices, resist coercion, and shape own life.',
      actionFocus: 'Does community create conditions where people can choose freely?',
      value: 72,
      facets: [
        {
          id: '1.1',
          name: 'Moral Freedom & Choice',
          clusters: [
            {
              id: '1.1.1',
              name: 'Freedom to Choose',
              items: [
                { id: '1.1.1.a', text: 'Community respects choices even when disagreeable', value: 78 },
                { id: '1.1.1.b', text: 'People have exit rights (can leave without penalty)', value: 75 }
              ]
            },
            {
              id: '1.1.2',
              name: 'Autonomy Conditions',
              items: [
                { id: '1.1.2.a', text: 'Community provides information for informed choice', value: 70 },
                { id: '1.1.2.b', text: 'People own their time and labor (not coerced)', value: 73 },
                { id: '1.1.2.c', text: "Norms don't force conformity; diversity of paths allowed", value: 68 }
              ]
            }
          ]
        },
        {
          id: '1.2',
          name: 'Anti-Coercion & Power-Limitation',
          clusters: [
            {
              id: '1.2.1',
              name: 'Preventing Abuse',
              items: [
                { id: '1.2.1.a', text: 'Community opposes unjust hierarchy', value: 77 },
                { id: '1.2.1.b', text: 'Community prevents manipulation and deception by authorities', value: 79 },
                { id: '1.2.1.c', text: 'Community protects exit rights (can refuse unjust situations)', value: 74 }
              ]
            },
            {
              id: '1.2.2',
              name: 'Distributed Power',
              items: [
                { id: '1.2.2.a', text: 'Power is distributed, not concentrated', value: 69 },
                { id: '1.2.2.b', text: 'Community resists institutional overreach', value: 71 }
              ]
            }
          ]
        },
        {
          id: '1.3',
          name: 'Self-Determination Spaces',
          clusters: [
            {
              id: '1.3.1',
              name: 'Goal Pursuit Support',
              items: [
                { id: '1.3.1.a', text: 'Community enables people to choose own path', value: 76 },
                { id: '1.3.1.b', text: 'Resources and time accessible for own goals', value: 64 }
              ]
            },
            {
              id: '1.3.2',
              name: 'Responsibility-Taking',
              items: [
                { id: '1.3.2.a', text: 'Community supports people taking responsibility for own welfare', value: 72 }
              ]
            }
          ]
        },
        {
          id: '1.4',
          name: 'Bodily & Medical Autonomy',
          clusters: [
            {
              id: '1.4.1',
              name: 'Medical Self-Determination',
              items: [
                { id: '1.4.1.a', text: 'Community respects medical decisions even if disagree', value: 70 },
                { id: '1.4.1.b', text: 'Reproductive autonomy protected', value: 66 },
                { id: '1.4.1.c', text: "Community doesn't force treatment", value: 72 }
              ]
            },
            {
              id: '1.4.2',
              name: 'Inclusive Physical Autonomy',
              items: [
                { id: '1.4.2.a', text: 'Community accommodates disabled people (not forces assimilation)', value: 61 },
                { id: '1.4.2.b', text: 'Accessibility is standard, not exception', value: 60 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 2,
      name: 'Relationality & Care',
      definition: 'Degree to which community actively cares for relationships, honors bonds, and creates conditions for connection.',
      actionFocus: 'Does community prioritize relationships and care?',
      value: 60,
      facets: [
        {
          id: '2.1',
          name: 'Active Care for Particular People',
          clusters: [
            {
              id: '2.1.1',
              name: 'Knowing People Deeply',
              items: [
                { id: '2.1.1.a', text: 'Community learns and knows individuals', value: 66 },
                { id: '2.1.1.b', text: 'Community accepts people as they are, not as "should be"', value: 62 },
                { id: '2.1.1.c', text: 'Relationships are prioritized (not transactional)', value: 68 }
              ]
            },
            {
              id: '2.1.2',
              name: 'Unconditional Presence',
              items: [
                { id: '2.1.2.a', text: 'Community includes strangers and those unlike us', value: 52 },
                { id: '2.1.2.b', text: 'Care is not conditional on likability or usefulness', value: 57 },
                { id: '2.1.2.c', text: 'Community seeks humanity in the "other"', value: 59 }
              ]
            }
          ]
        },
        {
          id: '2.2',
          name: 'Family Bonds & Community Bonds',
          clusters: [
            {
              id: '2.2.1',
              name: 'Relational Loyalty',
              items: [
                { id: '2.2.1.a', text: 'Community prioritizes members (family-like responsibility)', value: 71 },
                { id: '2.2.1.b', text: 'Community maintains continuity and remembers history', value: 63 }
              ]
            },
            {
              id: '2.2.2',
              name: 'Diverse Forms of Belonging',
              items: [
                { id: '2.2.2.a', text: 'Community recognizes all family forms (LGBTQ+, chosen, etc.)', value: null },
                { id: '2.2.2.b', text: 'Mutual aid is shared responsibility within community', value: 74 },
                { id: '2.2.2.c', text: 'Belonging is not conditional on conformity', value: 58 }
              ]
            }
          ]
        },
        {
          id: '2.3',
          name: 'Responsibility to Others',
          clusters: [
            {
              id: '2.3.1',
              name: 'Expanding Circle of Responsibility',
              items: [
                { id: '2.3.1.a', text: "Community takes responsibility for actions' ripple effects", value: 64 },
                { id: '2.3.1.b', text: 'Community feels obligation to distant/unknown people', value: 49 },
                { id: '2.3.1.c', text: 'Global impact is considered in decisions', value: 51 }
              ]
            },
            {
              id: '2.3.2',
              name: 'Intergenerational Duty',
              items: [
                { id: '2.3.2.a', text: 'Community prioritizes future generations', value: 61 },
                { id: '2.3.2.b', text: 'Community protects children first', value: 76 },
                { id: '2.3.2.c', text: 'Stewardship of world for those not yet born', value: 62 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 3,
      name: 'Security & Stable Order',
      definition: 'Degree to which community provides safety, basic needs, and predictable structure.',
      actionFocus: 'Does community ensure basic safety and order?',
      value: 68,
      facets: [
        {
          id: '3.1',
          name: 'Physical Safety & Needs',
          clusters: [
            {
              id: '3.1.1',
              name: 'Protecting from Harm',
              items: [
                { id: '3.1.1.a', text: 'Community prevents violence and bodily harm', value: 81 },
                { id: '3.1.1.b', text: 'Community ensures shelter, food, health access', value: 72 }
              ]
            },
            {
              id: '3.1.2',
              name: 'Stability for Living',
              items: [
                { id: '3.1.2.a', text: 'Community maintains predictable conditions for planning', value: 67 },
                { id: '3.1.2.b', text: 'Chaos and emergency are prevented when possible', value: 71 }
              ]
            }
          ]
        },
        {
          id: '3.2',
          name: 'Clear Order & Structure',
          clusters: [
            {
              id: '3.2.1',
              name: 'Transparent Norms',
              items: [
                { id: '3.2.1.a', text: 'Community rules are clear and knowable', value: 73 },
                { id: '3.2.1.b', text: 'Roles and responsibilities are defined', value: 70 }
              ]
            },
            {
              id: '3.2.2',
              name: 'Evolution of Norms',
              items: [
                { id: '3.2.2.a', text: 'Rules change when needed; not rigid', value: 55 },
                { id: '3.2.2.b', text: 'Balance between stability and adaptation', value: 56 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 4,
      name: 'Justice & Fairness',
      definition: 'Degree to which community treats people fairly, allocates resources equitably, and addresses injustice.',
      actionFocus: 'Does community make fair decisions and distributions?',
      value: 40,
      facets: [
        {
          id: '4.1',
          name: 'Equal Worth & Dignity',
          clusters: [
            {
              id: '4.1.1',
              name: 'Baseline Equality',
              items: [
                { id: '4.1.1.a', text: 'Community grants equal rights to all members', value: 42 },
                { id: '4.1.1.b', text: 'No person is treated as "worth less"', value: 48 },
                { id: '4.1.1.c', text: 'Community rejects hierarchy based on identity', value: 36 }
              ]
            },
            {
              id: '4.1.2',
              name: 'Equality of Opportunity',
              items: [
                { id: '4.1.2.a', text: 'Community removes barriers to equal starting position', value: 41 },
                { id: '4.1.2.b', text: 'Community redistributes to level playing field', value: null },
                { id: '4.1.2.c', text: 'Access is not determined by birth circumstances', value: 39 }
              ]
            }
          ]
        },
        {
          id: '4.2',
          name: 'Fair Proportionality',
          clusters: [
            {
              id: '4.2.1',
              name: 'Rewarding Contribution',
              items: [
                { id: '4.2.1.a', text: 'Community rewards effort and good behavior', value: 58 },
                { id: '4.2.1.b', text: 'Consequences are proportional to actions', value: 61 },
                { id: '4.2.1.c', text: 'Contribution affects allocation when relevant', value: 64 }
              ]
            },
            {
              id: '4.2.2',
              name: 'Reciprocal Exchange',
              items: [
                { id: '4.2.2.a', text: 'Community maintains fair give-and-take', value: 57 },
                { id: '4.2.2.b', text: 'No free-riding or exploitation allowed', value: 59 },
                { id: '4.2.2.c', text: 'Mutual obligation is expected and enforced', value: 62 }
              ]
            }
          ]
        },
        {
          id: '4.3',
          name: 'Meeting Actual Needs',
          clusters: [
            {
              id: '4.3.1',
              name: 'Sufficiency for All',
              items: [
                { id: '4.3.1.a', text: 'Community ensures baseline (food, shelter, dignity)', value: 46 },
                { id: '4.3.1.b', text: 'Community provides extra support for vulnerable', value: 44 },
                { id: '4.3.1.c', text: 'Community adjusts to actual differences (equity)', value: null }
              ]
            },
            {
              id: '4.3.2',
              name: 'Correcting Past Wrongs',
              items: [
                { id: '4.3.2.a', text: 'Community addresses historical injustices', value: null },
                { id: '4.3.2.b', text: 'Community repairs harm done', value: 43 },
                { id: '4.3.2.c', text: 'Community restores those wronged to fullness', value: 45 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 5,
      name: 'Redemption & Restoration',
      definition: 'Degree to which community believes in transformation, second chances, and redemption of wrongdoers.',
      actionFocus: 'Does community allow people to change and be restored?',
      value: null,
      facets: [
        {
          id: '5.1',
          name: 'Forgiveness & Letting Go',
          clusters: [
            {
              id: '5.1.1',
              name: 'Releasing Resentment',
              items: [
                { id: '5.1.1.a', text: 'Community lets go of grudges', value: null },
                { id: '5.1.1.b', text: "Past actions don't permanently define person", value: null },
                { id: '5.1.1.c', text: 'Possibility of change is honored (not just punishment)', value: null }
              ]
            }
          ]
        },
        {
          id: '5.2',
          name: 'Restoration & Reintegration',
          clusters: [
            {
              id: '5.2.1',
              name: 'Return to Community',
              items: [
                { id: '5.2.1.a', text: 'Community reintegrates wrongdoers (exile is last resort)', value: null },
                { id: '5.2.1.b', text: 'Community demonstrates people can change', value: null },
                { id: '5.2.1.c', text: 'Healing relationships is prioritized over resentment', value: null }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 6,
      name: 'Authentic Expression & Value-Living',
      definition: 'Degree to which community allows genuine self-expression and living according to stated values.',
      actionFocus: 'Does community allow authentic expression and value coherence?',
      value: 65,
      facets: [
        {
          id: '6.1',
          name: 'Living with Integrity',
          clusters: [
            {
              id: '6.1.1',
              name: 'Value-Behavior Coherence',
              items: [
                { id: '6.1.1.a', text: 'Community makes living by values possible (not hypocritical)', value: 67 },
                { id: '6.1.1.b', text: 'Walking the talk is possible (values match actions)', value: 69 },
                { id: '6.1.1.c', text: 'Transparency: people can be known as they are', value: 62 }
              ]
            }
          ]
        },
        {
          id: '6.2',
          name: 'Authentic Self-Expression',
          clusters: [
            {
              id: '6.2.1',
              name: 'Expression Allowed',
              items: [
                { id: '6.2.1.a', text: 'Community allows people to express true beliefs', value: 71 },
                { id: '6.2.1.b', text: 'Genuine perspectives are valued (not silenced)', value: 63 },
                { id: '6.2.1.c', text: 'People are not forced to hide or mask', value: 58 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 7,
      name: 'Protective Care & Stewardship',
      definition: 'Degree to which community protects vulnerable, stewards nature, preserves heritage, and acts for future generations.',
      actionFocus: 'Does community protect those who need protection and care for the world?',
      value: 75,
      facets: [
        {
          id: '7.1',
          name: 'Protection of Vulnerable',
          clusters: [
            {
              id: '7.1.1',
              name: 'Child Protection',
              items: [
                { id: '7.1.1.a', text: 'Community makes children safety central (all policy measured by this)', value: 84 },
                { id: '7.1.1.b', text: 'Child welfare is yardstick for good community', value: 82 },
                { id: '7.1.1.c', text: 'Community willingly sacrifices for child welfare', value: 79 }
              ]
            },
            {
              id: '7.1.2',
              name: 'Advocacy for Powerless',
              items: [
                { id: '7.1.2.a', text: 'Community speaks for those without voice', value: 72 },
                { id: '7.1.2.b', text: 'Community has special responsibility to vulnerable', value: 76 },
                { id: '7.1.2.c', text: 'Community uses power to protect, not exploit', value: 73 }
              ]
            }
          ]
        },
        {
          id: '7.2',
          name: 'Environmental Stewardship',
          clusters: [
            {
              id: '7.2.1',
              name: 'Ecological Commitment',
              items: [
                { id: '7.2.1.a', text: 'Community acts on environmental concern (pollution, climate, biodiversity)', value: 66 },
                { id: '7.2.1.b', text: 'Community values non-human life intrinsically (not just instrumental)', value: null },
                { id: '7.2.1.c', text: 'Long-term ecosystem health > short-term gain', value: 69 }
              ]
            },
            {
              id: '7.2.2',
              name: 'Personal Responsibility & Action',
              items: [
                { id: '7.2.2.a', text: 'Community members reduce consumption footprint', value: null },
                { id: '7.2.2.b', text: 'Community members acknowledge personal impact', value: 54 },
                { id: '7.2.2.c', text: 'Community holds itself accountable', value: 61 }
              ]
            },
            {
              id: '7.2.3',
              name: 'Systemic Change Commitment',
              items: [
                { id: '7.2.3.a', text: 'Community supports environmental policy', value: 63 },
                { id: '7.2.3.b', text: 'Community recognizes systems need change (not just individuals)', value: 67 },
                { id: '7.2.3.c', text: 'Community advocates at policy level', value: 60 }
              ]
            }
          ]
        },
        {
          id: '7.3',
          name: 'Intergenerational Stewardship',
          clusters: [
            {
              id: '7.3.1',
              name: 'Future as Priority',
              items: [
                { id: '7.3.1.a', text: 'Community gives future people equal moral standing', value: 72 },
                { id: '7.3.1.b', text: 'Community commits to livable, healthy world for them', value: 74 },
                { id: '7.3.1.c', text: "Present comfort doesn't override future opportunity", value: 68 }
              ]
            },
            {
              id: '7.3.2',
              name: 'Preserving Meaning & Heritage',
              items: [
                { id: '7.3.2.a', text: 'Community honors ancestral wisdom', value: 57 },
                { id: '7.3.2.b', text: 'Community maintains meaningful practices', value: 63 },
                { id: '7.3.2.c', text: "Community doesn't discard heritage for novelty alone", value: 59 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 8,
      name: 'Cooperation & Shared Governance',
      definition: 'Degree to which community makes decisions collectively, shares resources fairly, and governs transparently.',
      actionFocus: 'Does community govern collectively and share equitably?',
      value: 58,
      facets: [
        {
          id: '8.1',
          name: 'Collective Decision-Making',
          clusters: [
            {
              id: '8.1.1',
              name: 'Group Deliberation',
              items: [
                { id: '8.1.1.a', text: 'Community avoids conflict through dialogue', value: 60 },
                { id: '8.1.1.b', text: 'Community seeks consensus (not just majority)', value: 56 },
                { id: '8.1.1.c', text: 'Collective good is prioritized (not just individual interest)', value: 61 }
              ]
            },
            {
              id: '8.1.2',
              name: 'Shared Purpose & Mission',
              items: [
                { id: '8.1.2.a', text: 'Community has common mission uniting members', value: 64 },
                { id: '8.1.2.b', text: 'Collective goal takes priority over individual achievement', value: 55 },
                { id: '8.1.2.c', text: 'Community takes pride in collective accomplishment', value: 62 }
              ]
            }
          ]
        },
        {
          id: '8.2',
          name: 'Transparent Governance',
          clusters: [
            {
              id: '8.2.1',
              name: 'Open Information',
              items: [
                { id: '8.2.1.a', text: 'Community decisions are transparent (not hidden)', value: 70 },
                { id: '8.2.1.b', text: 'Community explains how power is used', value: 67 },
                { id: '8.2.1.c', text: 'Secrecy is known corruption risk (prevented)', value: 71 }
              ]
            },
            {
              id: '8.2.2',
              name: 'Accountability',
              items: [
                { id: '8.2.2.a', text: 'Community leaders must justify decisions', value: 68 },
                { id: '8.2.2.b', text: 'Accountability prevents power abuse', value: 72 },
                { id: '8.2.2.c', text: 'No one is above question', value: 73 }
              ]
            }
          ]
        },
        {
          id: '8.3',
          name: 'Shared Resources & Distribution',
          clusters: [
            {
              id: '8.3.1',
              name: 'Commons Care',
              items: [
                { id: '8.3.1.a', text: 'Community treats shared resources as belonging to all', value: 65 },
                { id: '8.3.1.b', text: 'Community prevents tragedy of commons (sustainable use)', value: 62 },
                { id: '8.3.1.c', text: 'Community opposes hoarding and extraction', value: 59 }
              ]
            },
            {
              id: '8.3.2',
              name: 'Fair Economic Allocation',
              items: [
                { id: '8.3.2.a', text: "Community prioritizes meeting everyone's basic needs first", value: 66 },
                { id: '8.3.2.b', text: 'Community opposes extreme wealth concentration', value: null },
                { id: '8.3.2.c', text: 'Community considers effort/contribution in distribution', value: 63 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 9,
      name: 'Spiritual & Religious Practice',
      definition: 'Degree to which community honors spiritual traditions, creates spaces for spiritual community, and integrates spiritual practice.',
      actionFocus: 'Does community support and respect spiritual practice?',
      value: 80,
      facets: [
        {
          id: '9.1',
          name: 'Religious Community & Belonging',
          clusters: [
            {
              id: '9.1.1',
              name: 'Community Participation',
              items: [
                { id: '9.1.1.a', text: 'Community honors religious community membership', value: 82 },
                { id: '9.1.1.b', text: 'Community recognizes shared spiritual practice as creating belonging', value: 79 },
                { id: '9.1.1.c', text: 'Community honors connection between spirituality and ancestors/future', value: 76 }
              ]
            }
          ]
        },
        {
          id: '9.2',
          name: 'Spiritual Practice & Integration',
          clusters: [
            {
              id: '9.2.1',
              name: 'Sacred Practice Support',
              items: [
                { id: '9.2.1.a', text: 'Community honors religious practice/ritual (intrinsic value)', value: 84 },
                { id: '9.2.1.b', text: 'Community supports maintaining religious tradition', value: 81 },
                { id: '9.2.1.c', text: 'Community recognizes spiritual practice as transformative', value: 78 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 10,
      name: 'Digital Rights & Tech Democracy',
      definition: 'Degree to which community protects digital autonomy, ensures technology serves human flourishing, and governs tech democratically.',
      actionFocus: 'Does community protect rights in digital realm and govern technology for human flourishing?',
      value: null,
      facets: [
        {
          id: '10.1',
          name: 'Digital Autonomy & Privacy',
          clusters: [
            {
              id: '10.1.1',
              name: 'Privacy & Data Protection',
              items: [
                { id: '10.1.1.a', text: 'Community protects privacy in digital spaces', value: null },
                { id: '10.1.1.b', text: 'Community treats personal data as belonging to person (not extractable)', value: null },
                { id: '10.1.1.c', text: 'Community prevents surveillance (corporate/government)', value: null }
              ]
            },
            {
              id: '10.1.2',
              name: 'Algorithmic Autonomy',
              items: [
                { id: '10.1.2.a', text: 'Community prevents invisible algorithmic manipulation', value: null },
                { id: '10.1.2.b', text: 'Community ensures people understand how algorithms affect them', value: null },
                { id: '10.1.2.c', text: 'Community makes algorithmic systems explainable and contestable', value: null }
              ]
            },
            {
              id: '10.1.3',
              name: 'Digital Self-Determination',
              items: [
                { id: '10.1.3.a', text: 'Community protects control over digital identity/presence', value: null },
                { id: '10.1.3.b', text: 'Community allows digital anonymity when chosen', value: null },
                { id: '10.1.3.c', text: 'Community prevents digital profiling/categorization without consent', value: null }
              ]
            }
          ]
        },
        {
          id: '10.2',
          name: 'Human Flourishing Over Efficiency',
          clusters: [
            {
              id: '10.2.1',
              name: 'Preserving Human Judgment & Work',
              items: [
                { id: '10.2.1.a', text: "Community keeps technology in service role (doesn't replace humans)", value: null },
                { id: '10.2.1.b', text: 'Community preserves human decision-making in important choices', value: null },
                { id: '10.2.1.c', text: 'Community prevents dehumanizing efficiency gains', value: null }
              ]
            },
            {
              id: '10.2.2',
              name: 'Embodied Connection',
              items: [
                { id: '10.2.2.a', text: 'Community prioritizes face-to-face human connection', value: null },
                { id: '10.2.2.b', text: 'Community uses digital tools to enable (not replace) human interaction', value: null },
                { id: '10.2.2.c', text: 'Community preserves human labor and meaning', value: null }
              ]
            },
            {
              id: '10.2.3',
              name: 'Protection from Digital Harm',
              items: [
                { id: '10.2.3.a', text: 'Community prevents tools from dehumanizing relationships', value: null },
                { id: '10.2.3.b', text: 'Community addresses tech addiction and psychological manipulation', value: null },
                { id: '10.2.3.c', text: 'Community protects children from digital exploitation', value: null }
              ]
            }
          ]
        },
        {
          id: '10.3',
          name: 'Democratic Technology Governance',
          clusters: [
            {
              id: '10.3.1',
              name: 'Democratic Control',
              items: [
                { id: '10.3.1.a', text: 'Community prevents tech companies from unilateral power over communication', value: null },
                { id: '10.3.1.b', text: 'Community ensures algorithms are governed democratically (not corporately)', value: null },
                { id: '10.3.1.c', text: 'Technology governance includes affected communities', value: null }
              ]
            },
            {
              id: '10.3.2',
              name: 'Universal Access & Inclusion',
              items: [
                { id: '10.3.2.a', text: 'Community treats digital access as right (not luxury); addresses digital divides', value: null },
                { id: '10.3.2.b', text: 'Community ensures technology accessible to all (including disabled)', value: null },
                { id: '10.3.2.c', text: 'Community prioritizes infrastructure for inclusion', value: null }
              ]
            },
            {
              id: '10.3.3',
              name: 'Power Limitation',
              items: [
                { id: '10.3.3.a', text: 'Community opposes tech monopolies and power concentration', value: null },
                { id: '10.3.3.b', text: 'Community promotes open standards and interoperability', value: null },
                { id: '10.3.3.c', text: 'Community ensures public technology infrastructure is democratically governed', value: null }
              ]
            }
          ]
        }
      ]
    }
  ];

  function openModal() {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    renderVectorModal();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  window.openValuesVectorModal = openModal;
  window.closeValuesVectorModal = closeModal;

  function renderDomainsChart() {
    if (!domainsChart) return;
    domainsChart.innerHTML = '';
    var data = window.currentUserValues || vectorData;

    data.domains.forEach(function(domain) {
      var group = document.createElement('div');
      group.className = 'bar-group';

      var bar = document.createElement('div');
      const isNull = domain.score === null || domain.score === undefined;
      const heightVal = isNull ? 100 : domain.score;
      
      bar.className = 'bar' + (isNull ? ' bar-null' : (domain.muted ? ' bar-muted' : ''));
      bar.style.height = heightVal + '%';

      var label = document.createElement('span');
      label.className = 'bar-label';
      label.textContent = domain.id;
      if (isNull) {
        label.style.color = '#888888';
      }

      group.appendChild(bar);
      group.appendChild(label);
      domainsChart.appendChild(group);
    });
  }

  function renderContextShiftsGrid() {
    if (!contextGrid) return;
    contextGrid.innerHTML = '';
    var data = window.currentUserValues || vectorData;

    var labels = [
      { key: 'work', short: 'W' },
      { key: 'family', short: 'F' },
      { key: 'private', short: 'P' },
      { key: 'crisis', short: 'C' }
    ];

    labels.forEach(function(row) {
      var wrap = document.createElement('div');
      wrap.className = 'shift-row';

      var left = document.createElement('div');
      left.className = 'shift-label';
      left.textContent = row.short;

      var trackWrap = document.createElement('div');
      trackWrap.className = 'shift-track-grid';

      data.contextShifts[row.key].forEach(function(value) {
        var cell = document.createElement('div');
        cell.className = 'shift-cell';

        if (value !== 0) {
          var mark = document.createElement('div');
          mark.className = 'shift-mark' + (value < 0 ? ' shift-mark-blue' : '');
          mark.style.width = Math.min(Math.abs(value) * 3, 100) + '%';
          cell.appendChild(mark);
        }

        trackWrap.appendChild(cell);
      });

      wrap.appendChild(left);
      wrap.appendChild(trackWrap);
      contextGrid.appendChild(wrap);
    });
  }

  function renderAccordion() {
    if (!domainsAccordion) return;
    domainsAccordion.innerHTML = '';

    taxonomyDomains.forEach(function(domain) {
      var item = document.createElement('div');
      item.className = 'vector-accordion-item';

      var realDomainScore = null;
      if (window.currentUserValues && window.currentUserValues.domains) {
        var match = window.currentUserValues.domains.find(function(d) { return d.id === domain.id; });
        if (match) realDomainScore = match.score;
      } else {
        realDomainScore = domain.value;
      }

      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'vector-accordion-trigger';
      button.textContent = domain.id + '. ' + domain.name + ' [' + (realDomainScore === null ? 'null' : realDomainScore) + ']';

      var content = document.createElement('div');
      content.className = 'vector-accordion-content';
      content.hidden = true;

      var definition = document.createElement('p');
      definition.className = 'vector-domain-definition';
      definition.textContent = domain.definition;

      var focus = document.createElement('p');
      focus.className = 'vector-domain-definition';
      focus.innerHTML = '<strong>Action focus:</strong> ' + domain.actionFocus;

      content.appendChild(definition);
      content.appendChild(focus);

      var itemIndex = 0;
      var domainKey = 'd' + domain.id;
      var userItemsArray = (window.currentUserValues && window.currentUserValues.items) ? window.currentUserValues.items[domainKey] : null;

      domain.facets.forEach(function(facet) {
        var facetEl = document.createElement('div');
        facetEl.className = 'vector-facet';

        var facetTitle = document.createElement('div');
        facetTitle.className = 'vector-facet-title';
        facetTitle.textContent = facet.id + ' ' + facet.name;

        facetEl.appendChild(facetTitle);

        facet.clusters.forEach(function(cluster) {
          var clusterEl = document.createElement('div');
          clusterEl.className = 'vector-cluster';

          var clusterTitle = document.createElement('div');
          clusterTitle.className = 'vector-cluster-title';
          clusterTitle.textContent = cluster.id + ' ' + cluster.name;

          var list = document.createElement('ul');
          list.className = 'vector-domain-items';

          cluster.items.forEach(function(entry) {
            var realItemValue = null;
            if (window.currentUserValues) {
              if (userItemsArray && userItemsArray[itemIndex] !== undefined) {
                realItemValue = userItemsArray[itemIndex];
              } else {
                realItemValue = null;
              }
            } else {
              realItemValue = entry.value;
            }
            itemIndex++;

            var li = document.createElement('li');
            li.innerHTML = '<span class="vector-item-id">' + entry.id + '</span> ' +
                          entry.text +
                          ' <span class="vector-item-value">[' + (realItemValue === null ? 'null' : realItemValue) + ']</span>';
            list.appendChild(li);
          });

          clusterEl.appendChild(clusterTitle);
          clusterEl.appendChild(list);
          facetEl.appendChild(clusterEl);
        });

        content.appendChild(facetEl);
      });

      button.addEventListener('click', function() {
        content.hidden = !content.hidden;
        item.classList.toggle('open');
      });

      item.appendChild(button);
      item.appendChild(content);
      domainsAccordion.appendChild(item);
    });
  }

  function renderConflictWeights() {
    if (!conflictWeights) return;
    conflictWeights.innerHTML = '';
    var data = window.currentUserValues || vectorData;

    data.conflictResolution.forEach(function(item) {
      if (item.weight === 50) return; // Only show weights different from 50
      
      var row = document.createElement('div');
      row.className = 'vector-weight-row';

      row.innerHTML =
        '<div class="vector-weight-name">' + item.name + '</div>' +
        '<div class="vector-weight-bar"><div class="vector-weight-fill" style="width:' + item.weight + '%"></div></div>' +
        '<div class="vector-weight-value">' + item.weight + '</div>';

      conflictWeights.appendChild(row);
    });
  }

  function renderVectorModal() {
    renderDomainsChart();
    renderContextShiftsGrid();
    renderAccordion();
    renderConflictWeights();
  }

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', function(e) {
    if (!modal.hidden && e.key === 'Escape') {
      closeModal();
    }
  });

  // Global click delegation for values-vector-btn (Issue 4)
  document.addEventListener('click', function(e) {
    if (e.target.closest('#values-vector-btn')) {
      e.preventDefault();
      // Restore logged-in user's own values vector before opening
      window.currentUserValues = window.loggedInUserValues || null;
      const titleEl = document.getElementById('values-vector-title');
      if (titleEl) {
        titleEl.textContent = "Vector of Values";
      }
      openModal();
    }
  });
}

function initTopicDetailViews() {
  var modalTitle = document.getElementById('section-modal-title');
  var modalBody = document.getElementById('section-modal-body');

  if (!modalBody) return;


  var reactionChoices = [
    { value: 'good', label: '👍 Good' },
    { value: 'funny', label: '😁 Funny' },
    { value: 'flood', label: '🥴 Flood' },
    { value: 'rude', label: '😡 Rude' },
    { value: 'fool', label: '💊 Fool' }
  ];

  var reactionEmojis = {
    good: '👍',
    funny: '😁',
    flood: '🥴',
    rude: '😡',
    fool: '💊'
  };

  window.userCache = window.userCache || {};

  async function resolveUserNames(uids) {
    if (typeof firebase === 'undefined') return;
    const db = firebase.firestore();
    const fetchPromises = uids.map(async function(uid) {
      if (uid === 'system') return;
      if (window.userCache[uid]) return;
      try {
        const userDoc = await db.collection("users").doc(uid.toString()).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          window.userCache[uid] = userData.displayName || ('User ' + uid);
        } else {
          window.userCache[uid] = 'User ' + uid;
        }
      } catch (err) {
        console.error("Error fetching user name for uid " + uid + ":", err);
        window.userCache[uid] = 'User ' + uid;
      }
    });
    await Promise.all(fetchPromises);
  }

  function resolveReactionLabel(m) {
    if (!m) return '';
    let val = '';
    if (typeof m === 'string') {
      val = m;
    } else if (typeof m === 'object') {
      val = m.reaction || m.type || m.mark || m.label || m.value || '';
    }
    val = val.toLowerCase().trim();
    if (!val) return '';
    const choice = reactionChoices.find(c => c.value === val);
    return choice ? choice.label : val;
  }

  function resolveReactionValue(m) {
    if (!m) return '';
    let val = '';
    if (typeof m === 'string') {
      val = m;
    } else if (typeof m === 'object') {
      val = m.reaction || m.type || m.mark || m.label || m.value || '';
    }
    return val.toLowerCase().trim();
  }

  function getStatusBadge(status) {
    if (status === 'approved') return '<span class="status-pill status-pill-done">Approved</span>';
    if (status === 'discussion') return '<span class="status-pill status-pill-pending">Discussion</span>';
    if (status === 'canceled') return '<span class="status-pill status-pill-pending">Canceled</span>';
    if (status === 'inactive') return '<span class="status-pill status-pill-pending" style="background:var(--error-soft, #fed7d7); color:var(--error, #e53e3e);">Inactive</span>';
    return '<span class="status-pill status-pill-active">Voting</span>';
  }

    function formatRelevanceWeights(docData) {
    var d = docData.w_demographic !== undefined ? docData.w_demographic : 0.2;
    var g = docData.w_geographic !== undefined ? docData.w_geographic : 0.6;
    var s = docData.w_semantic !== undefined ? docData.w_semantic : 0.1;
    var x = docData.w_social !== undefined ? docData.w_social : 0.1;
    return 'D<span class="weight-number">' + (d * 100).toFixed(0) + '</span> ' +
           'G<span class="weight-number">' + (g * 100).toFixed(0) + '</span> ' +
           'S<span class="weight-number">' + (s * 100).toFixed(0) + '</span> ' +
           'X<span class="weight-number">' + (x * 100).toFixed(0) + '</span>';
  }

  function formatIsrWeights(docData) {
    var r = docData.w_relevance !== undefined ? docData.w_relevance : 0.4;
    var e = docData.w_expertise !== undefined ? docData.w_expertise : 0.3;
    var c = docData.w_contribution !== undefined ? docData.w_contribution : 0.3;
    return 'R<span class="weight-number">' + (r * 100).toFixed(0) + '</span> ' +
           'E<span class="weight-number">' + (e * 100).toFixed(0) + '</span> ' +
           'C<span class="weight-number">' + (c * 100).toFixed(0) + '</span>';
  }

  function renderMetaRow(items) {
    return '<div class="topic-detail-meta">' +
      items.map(function(item) {
        var firstRowHtml = '';
        if (item.firstRow) {
          firstRowHtml = '<span class="topic-detail-meta-tiny">' + item.firstRow + '</span>';
        }

        var valClass = 'topic-detail-meta-value';
        if (item.label === '📍') {
          valClass += ' geo-meta-value';
        }

        if (item.label === 'Microcommunity') {
          return '<button type="button" class="topic-detail-meta-item microcommunity-btn" data-meta="Microcommunity" data-uids="' + (item.uids || '') + '">' +
            firstRowHtml +
            '<span class="topic-detail-meta-label">Micro&shy;community</span>' +
            '<span class="topic-detail-meta-value">' + item.value + '</span>' +
            '</button>';
        }

        return '<button type="button" class="topic-detail-meta-item" data-meta="' + item.label + '">' +
          firstRowHtml +
          '<span class="topic-detail-meta-label">' + item.label + '</span>' +
          '<span class="' + valClass + '">' + item.value + '</span>' +
          '</button>';
      }).join('') +
      '</div>';
  }


  function renderVotingTopic(topic) {
    var inactive = topic.status !== 'in_process';

    var otherMessages = topic.messages || [];
    if (otherMessages.length > 0) {
      otherMessages = otherMessages.slice(1);
    }
    
    var messagesListHtml = otherMessages.map(function(msg) {
      var authorName = msg.author || 'User';
      var text = msg.text || '';
      var parentLink = '';
      if (msg.parentID) {
        parentLink = '<div style="font-size:0.78rem; color:var(--text-soft); margin-bottom: 2px;">In reply to parent message #' + msg.parentID + '</div>';
      }
      return '<div class="topic-message-card" id="msg-' + msg.id + '" style="margin-bottom: 8px; padding: 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); text-align: left;">' +
               parentLink +
               '<div class="topic-message-author" style="font-weight:600; font-size:0.85rem; color:var(--text-muted); margin-bottom:2px;">' + authorName + '</div>' +
               '<div class="topic-message-text" style="font-size:0.92rem; color:var(--text);">' + escapeHtml(text) + '</div>' +
             '</div>';
    }).join('');

    if (!messagesListHtml) {
      messagesListHtml = '<div style="color:var(--text-muted); font-style:italic; font-size:0.88rem; padding: 4px;">No messages in this discussion.</div>';
    }

    return '' +
      '<div class="topic-detail-card">' +
        '<div class="topic-detail-top">' +
          '<div>' +
            '<div class="topic-detail-eyebrow">Voting topic</div>' +
            '<h3 class="topic-detail-title">' + topic.name + '</h3>' +
          '</div>' +
          '<div class="topic-detail-status-wrap">' + getStatusBadge(topic.status) + '</div>' +
        '</div>' +

        '<p class="topic-detail-description">' + topic.description + '</p>' +

        renderMetaRow([
          { label: 'Microcommunity', value: (topic.participants || []).length + ' members', uids: (topic.participants || []).join(',') },
          { label: 'Deadline', value: topic.deadline },
          { label: 'Relevance', value: topic.relevance, firstRow: topic.relevanceWeights },
          { label: 'ISR-score', value: topic.isrScore, firstRow: topic.isrWeights },
          { label: 'Expertise Depth', value: topic.expertiseDepth || "None" }
        ]) +

        '<div class="topic-detail-block">' +
          '<div class="topic-detail-block-title">Status explanation</div>' +
          '<div class="topic-detail-note">' + topic.statusText + '</div>' +
        '</div>' +

        '<div class="topic-detail-block">' +
          '<div class="topic-detail-block-title">Decision options</div>' +
          '<div class="topic-options-list">' +
            topic.options.map(function(option, optIdx) {
              var scoreVal = option.score !== undefined ? option.score : 0;
              
              var stepsHtml = '';
              if (option.description && option.description.length > 0) {
                stepsHtml = '<div class="voting-option-steps" style="margin-top: 6px; padding-left: 24px; font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">' +
                  option.description.map(function(s) {
                    var dlHtml = s.deadline ? ' - <span style="font-weight: 500; color: var(--text-soft);">' + formatTaskDeadline(s.deadline) + '</span>' : '';
                    return '<div style="margin-bottom: 2px;">&bull; ' + s.step + ' <span style="font-weight: 500; color: var(--text-soft);">(' + s.in_charge_name + ')</span>' + dlHtml + '</div>';
                  }).join('') +
                '</div>';
              }
              
              var metaDetails = '';
              if (option.author_name && option.author_name !== 'System') {
                metaDetails = '<div style="font-size: 0.8rem; color: var(--text-muted); margin-left: 24px; margin-top: 2px;">Proposed by ' + option.author_name + ' &middot; <b>Budget: ' + option.budget + '</b></div>';
              }

              return '<label class="topic-option-row ' + (inactive ? 'topic-option-disabled' : '') + '" style="display: flex; flex-direction: column; align-items: stretch; gap: 4px; padding: 12px; border: 1px solid var(--border); border-radius: 12px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s;">' +
                '<div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">' +
                  '<span style="display: flex; align-items: center; gap: 8px;">' +
                    '<input type="radio" name="voting-option" value="' + optIdx + '" ' + (inactive ? 'disabled' : '') + ' style="cursor: pointer;" />' +
                    '<span class="topic-option-text" style="font-weight: 600; color: var(--text);">' + option.label + '</span>' +
                  '</span>' +
                  (topic.status === 'approved' || topic.status === 'in_process'
                    ? '<span class="topic-option-score" style="font-weight: 600; font-size: 0.85rem; color: var(--text-soft);">ISR total: ' + scoreVal.toFixed(2) + '</span>'
                    : '') +
                '</div>' +
                metaDetails +
                stepsHtml +
              '</label>';
            }).join('') +
          '</div>' +
        '</div>' +

        '<div class="topic-detail-actions">' +
          '<div class="topic-detail-actions-left" style="display: flex; gap: 8px;">' +
            '<button type="button" class="voting-discussion-toggle-btn">Discussion</button>' +
            (topic.status === 'canceled' || topic.status === 'discussion' || topic.status === 'approved'
              ? '<button type="button" class="danger-link-btn" data-remove-topic="1">Remove topic from the Voting list</button>'
              : '') +
          '</div>' +
          '<div class="topic-detail-actions-right">' +
            '<button type="button" class="topic-back-btn">Cancel</button>' +
            '<button type="button" ' + (inactive ? 'disabled' : '') + '>Vote</button>' +
          '</div>' +
        '</div>' +
        
        '<div class="voting-discussion-container" style="display: none; margin-top: 20px; border-top: 1px solid var(--border); padding-top: 16px;">' +
          '<div class="topic-detail-block-title" style="margin-bottom: 12px; font-weight: 700; color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase;">Previous Discussion Messages</div>' +
          '<div class="topic-message-list" style="max-height: 250px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">' +
            messagesListHtml +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function renderReactionMenu(msg, currentUserId) {
    if (!msg) {
      msg = { id: 'dummy', reactions: [] };
    }
    var currentUserId = currentUserId || safeGetStorage('userId') || "1";
    var userMarks = (msg.reactions || []).filter(function(r) {
      return (r.uid || '').toString() === currentUserId.toString();
    });
    var userMarkTypes = userMarks.map(function(r) { return r.type; });
    var hasTwoReactions = userMarkTypes.length >= 2;

    return '<div class="reaction-menu" hidden>' +
      reactionChoices.map(function(choice) {
        var isPressed = userMarkTypes.indexOf(choice.value) >= 0;
        var isDisabled = hasTwoReactions && !isPressed;
        
        var extraClasses = 'reaction-choice-btn' + (isPressed ? ' pressed' : '');
        var disabledAttr = isDisabled ? ' disabled' : '';

        return '<button type="button" class="' + extraClasses + '" data-reaction="' + choice.value + '" data-msg-id="' + msg.id + '"' + disabledAttr + '>' + choice.label + '</button>';
      }).join('') +
    '</div>';
  }

  function renderChatTopic(topic) {
    var currentUserId = safeGetStorage('userId') || "1";

    var firstMsg = topic.messages[0];
    var descriptionReactionsHtml = '';
    if (firstMsg) {
      var existingReactions = '';
      if (firstMsg.reactions && firstMsg.reactions.length > 0) {
        var grouped = {};
        firstMsg.reactions.forEach(function(r) {
          if (r.type) {
            if (!grouped[r.type]) {
              grouped[r.type] = {
                emoji: r.emoji,
                uids: [],
                count: 0
              };
            }
            if (r.uid) {
              grouped[r.type].uids.push(r.uid);
            }
            grouped[r.type].count++;
          }
        });

        var reactionOrder = ['good', 'funny', 'flood', 'rude', 'fool'];
        reactionOrder.forEach(function(key) {
          var g = grouped[key];
          if (g) {
            var uidsAttr = g.uids.join(',');
            var label = g.emoji + (g.count > 1 ? ' ' + g.count : '');
            existingReactions += '<span class="reaction-bubble" data-uids="' + uidsAttr + '">' + label + '</span>';
          }
        });
      }

      var isOwnMessage = (firstMsg.uid || '').toString() === currentUserId.toString();
      var reactButtonHtml = '';
      if (!isOwnMessage) {
        reactButtonHtml = 
          '<div class="reaction-wrap">' +
            '<button type="button" class="topic-inline-btn react-toggle-btn" data-reaction-menu="0">React</button>' +
            renderReactionMenu(firstMsg, currentUserId) +
          '</div>';
      }

      if (existingReactions || reactButtonHtml) {
        descriptionReactionsHtml = 
          '<div class="topic-description-actions" style="margin-top: 8px; margin-bottom: 12px; display: flex; gap: 8px; align-items: center;">' +
            existingReactions + 
            reactButtonHtml +
          '</div>';
      }
    }

    var otherMessages = topic.messages.slice(1);

    // Render decision options
    var optionsHtml = (topic.options || []).map(function(opt) {
      var grouped = {};
      (opt.marks || []).forEach(function(r) {
        var rType = r.type || r.reaction || r.mark || '';
        if (rType) {
          if (!grouped[rType]) {
            grouped[rType] = {
              emoji: reactionEmojis[rType] || '👍',
              uids: [],
              count: 0
            };
          }
          if (r.uid) grouped[rType].uids.push(r.uid);
          grouped[rType].count++;
        }
      });
      
      var existingReactionsHtml = '';
      ['good', 'funny', 'flood', 'rude', 'fool'].forEach(function(key) {
        var g = grouped[key];
        if (g) {
          existingReactionsHtml += '<span class="reaction-bubble" data-uids="' + g.uids.join(',') + '">' + g.emoji + (g.count > 1 ? ' ' + g.count : '') + '</span>';
        }
      });
      
      var isOwnOption = (opt.author_uid || '').toString() === currentUserId.toString();
      var reactBtnHtml = '';
      if (!isOwnOption) {
        reactBtnHtml = 
          '<div class="reaction-wrap">' +
            '<button type="button" class="topic-inline-btn react-toggle-btn" data-reaction-menu="opt_' + opt.id + '">React</button>' +
            renderReactionMenu({ id: 'opt_' + opt.id, reactions: opt.marks || [] }, currentUserId) +
          '</div>';
      }
      
      var stepsPreviewHtml = (opt.description || []).slice(0, 2).map(function(s) {
        var dlHtml = s.deadline ? ' - <span style="font-weight: 500; color: var(--text-soft);">' + formatTaskDeadline(s.deadline) + '</span>' : '';
        return '<div style="margin-bottom: 2px;">&bull; ' + s.step + ' <span style="font-weight: 500; color: var(--text-soft);">(' + s.in_charge_name + ')</span>' + dlHtml + '</div>';
      }).join('');
      
      var remainingStepsCount = (opt.description || []).length - 2;
      if (remainingStepsCount > 0) {
        stepsPreviewHtml += '<div style="font-style: italic; font-size: 0.78rem; margin-top: 2px; color: var(--text-soft);">+ ' + remainingStepsCount + ' more steps...</div>';
      }

      return '<div class="option-card" data-option-id="' + opt.id + '">' +
        '<div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">' +
          '<div>' +
            '<div style="font-weight: 700; font-size: 0.98rem; color: var(--text);">' + opt.title + '</div>' +
            '<div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px;">Proposed by ' + opt.author_name + ' &middot; <b>Budget: ' + opt.budget + '</b></div>' +
          '</div>' +
          '<div class="option-reactions-container" style="display: flex; gap: 6px; align-items: center;" onclick="event.stopPropagation();">' +
            existingReactionsHtml +
            reactBtnHtml +
          '</div>' +
        '</div>' +
        '<div class="option-steps-preview" style="font-size: 0.82rem; color: var(--text-muted); border-top: 1px dashed var(--border); padding-top: 6px; margin-top: 6px;">' +
          stepsPreviewHtml +
        '</div>' +
      '</div>';
    }).join('');

    if (!optionsHtml) {
      optionsHtml = '<div style="font-size:0.88rem; color:var(--text-muted); font-style:italic; padding: 4px;">No proposed options yet.</div>';
    }

    return '' +
      '<div class="topic-detail-card">' +
        '<div class="topic-detail-top">' +
          '<div>' +
            '<h3 class="topic-detail-title">' + topic.name + ' <span class="topic-starter-name">(by ' + topic.creatorName + ')</span></h3>' +
          '</div>' +
        '</div>' +
 
        '<p class="topic-detail-description">' + topic.description + '</p>' +
        descriptionReactionsHtml +
 
        renderMetaRow([
          { label: 'Microcommunity', value: (topic.participants || []).length + ' members', uids: (topic.participants || []).join(',') },
          { label: 'Deadline', value: topic.deadline },
          { label: '📍', value: topic.geoposition || "N/A" },
          { label: 'Relevance', value: topic.relevance, firstRow: topic.relevanceWeights },
          { label: 'ISR-score', value: topic.isrScore, firstRow: topic.isrWeights },
          { label: 'Expertise Depth', value: topic.expertiseDepth || "None" }
        ]) +
 
        '<div class="topic-detail-block">' +
          '<div class="topic-detail-block-title">Decision options</div>' +
          '<div class="options-list-container">' +
            optionsHtml +
          '</div>' +
          '<div style="margin-top: 12px;">' +
            '<button type="button" id="propose-option-btn">Propose option</button>' +
          '</div>' +
        '</div>' +
 
        '<div class="topic-detail-block">' +
          '<div class="topic-detail-block-title">Messages</div>' +
          '<div class="topic-message-list">' +
            otherMessages.map(function(msg, index) {
              var msgIndex = index + 1;
              var existingReactions = '';
              if (msg.reactions && msg.reactions.length > 0) {
                var grouped = {};
                msg.reactions.forEach(function(r) {
                  if (r.type) {
                    if (!grouped[r.type]) {
                      grouped[r.type] = {
                        emoji: r.emoji,
                        uids: [],
                        count: 0
                      };
                    }
                    if (r.uid) {
                      grouped[r.type].uids.push(r.uid);
                    }
                    grouped[r.type].count++;
                  }
                });
 
                var reactionOrder = ['good', 'funny', 'flood', 'rude', 'fool'];
                reactionOrder.forEach(function(key) {
                  var g = grouped[key];
                  if (g) {
                    var uidsAttr = g.uids.join(',');
                    var label = g.emoji + (g.count > 1 ? ' ' + g.count : '');
                    existingReactions += '<span class="reaction-bubble" data-uids="' + uidsAttr + '">' + label + '</span>';
                  }
                });
              }
              
              var parentLinkHtml = '';
              if (msg.parentID) {
                var firstMsg = topic.messages[0];
                var isReplyToFirst = firstMsg && (msg.parentID === firstMsg.id);
                if (!isReplyToFirst) {
                  var parentMsg = topic.messages.find(function(m) { return m.id === msg.parentID; });
                  var parentAuthor = parentMsg ? parentMsg.author : ('User ' + msg.parentID);
                  parentLinkHtml = '<div class="topic-message-parent-link">In reply to <span class="parent-link" data-parent-id="' + msg.parentID + '">' + parentAuthor + '</span></div>';
                }
              }
 
              var isOwnMessage = (msg.uid || '').toString() === currentUserId.toString();
              var reactButtonHtml = '';
              if (!isOwnMessage) {
                reactButtonHtml = 
                  '<div class="reaction-wrap">' +
                    '<button type="button" class="topic-inline-btn react-toggle-btn" data-reaction-menu="' + msgIndex + '">React</button>' +
                    renderReactionMenu(msg, currentUserId) +
                  '</div>';
              }
 
              var replyBtnHtml = '<button type="button" class="topic-inline-btn reply-btn" data-msg-id="' + msg.id + '" data-author="' + msg.author + '">Reply</button>';
 
              return '' +
              '<div class="topic-message-card" id="msg-' + msg.id + '" data-msg-id="' + msg.id + '">' +
                '<div class="topic-message-author">' + msg.author + '</div>' +
                parentLinkHtml +
                '<div class="topic-message-text">' + msg.text + '</div>' +
                '<div class="topic-message-actions">' +
                  replyBtnHtml +
                  existingReactions + 
                  reactButtonHtml +
                '</div>' +
              '</div>';
            }).join('') +
          '</div>' +
        '</div>' +
 
        '<div class="topic-detail-block">' +
          '<div class="topic-input-row">' +
            '<input type="text" placeholder="Write a message..." />' +
          '</div>' +
          '<div class="topic-detail-actions">' +
            '<div class="topic-detail-actions-left">' +
              '<button type="button">Attach</button>' +
            '</div>' +
            '<div class="topic-detail-actions-right">' +
              '<button type="button" class="topic-back-btn">Cancel</button>' +
              '<button type="button" class="topic-send-btn">Send</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function renderChatCreate() {
    return '' +
      '<div class="topic-detail-card">' +
        '<div class="topic-detail-top">' +
          '<div>' +
            '<div class="topic-detail-eyebrow">New issue topic</div>' +
            '<h3 class="topic-detail-title">Register a new issue</h3>' +
          '</div>' +
        '</div>' +

        '<div class="topic-form-grid">' +
          '<div class="topic-form-field">' +
            '<label>Issue Topic Name</label>' +
            '<input type="text" placeholder="Enter issue topic name" />' +
          '</div>' +
          '<div class="topic-form-field">' +
            '<label>Issue Description</label>' +
            '<textarea class="topic-form-textarea" placeholder="Describe the issue"></textarea>' +
          '</div>' +
        '</div>' +

        '<div class="topic-detail-actions">' +
          '<div class="topic-detail-actions-left">' +
            '<button type="button">Attach</button>' +
            '<button type="button">Check</button>' +
          '</div>' +
          '<div class="topic-detail-actions-right">' +
            '<button type="button" class="topic-back-btn">Cancel</button>' +
            '<button type="button">Create</button>' +
          '</div>' +
        '</div>' +

        '<div class="topic-detail-block">' +
          '<div class="topic-detail-block-title">AI assistant</div>' +
          '<div class="topic-ai-panel">' +
            '<div class="ai-msg ai-msg-assistant">Specify issue scale, location, context and other details. Don’t forget to check if this issue already exists.</div>' +
            '<div class="topic-input-row">' +
              '<input type="text" placeholder="Type details for AI assistant..." />' +
              '<button type="button">Send</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function renderTaskMarksHtml(marks) {
    var grouped = {};
    (marks || []).forEach(function(r) {
      var rType = r.type || r.reaction || '';
      if (rType) {
        if (!grouped[rType]) {
          grouped[rType] = {
            emoji: reactionEmojis[rType] || '👍',
            uids: [],
            count: 0
          };
        }
        if (r.uid) grouped[rType].uids.push(r.uid);
        grouped[rType].count++;
      }
    });
    
    var existingReactionsHtml = '';
    ['good', 'funny', 'flood', 'rude', 'fool'].forEach(function(key) {
      var g = grouped[key];
      if (g) {
        existingReactionsHtml += '<span class="reaction-bubble" data-uids="' + g.uids.join(',') + '">' + g.emoji + (g.count > 1 ? ' ' + g.count : '') + '</span>';
      }
    });
    return existingReactionsHtml;
  }

  function renderSubtasks(subtasks, taskIdx, currentUserId, inChargeUid, isParentCanceled) {
    if (!subtasks || subtasks.length === 0) return '';
    return subtasks.map(function(subtask, subtaskIdx) {
      var isSubDone = subtask.status === 'done';
      var textStyle = isSubDone ? 'text-decoration: line-through; color: var(--text-muted);' : 'color: var(--text);';
      if (isParentCanceled) textStyle += ' color: var(--text-soft); font-style: italic;';
      
      var subInChargeUid = subtask.in_charge_uid || inChargeUid;
      var isResponsible = (subInChargeUid || '').toString() === currentUserId.toString();
      var checkboxDisabled = (isParentCanceled || !isResponsible) ? ' disabled' : '';

      var isParentResponsible = (inChargeUid || '').toString() === currentUserId.toString();
      var deleteHtml = (isParentResponsible && !isParentCanceled) ? '<button type="button" class="subtask-remove-btn" data-task-idx="' + taskIdx + '" data-subtask-idx="' + subtaskIdx + '" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.9rem; padding: 0 4px; line-height: 1;">&times;</button>' : '';
      
      var responsibleHtml = subtask.in_charge_name ? ' <span style="font-weight: 500; color: var(--text-soft);">(' + subtask.in_charge_name + ')</span>' : '';
      var deadlineHtml = subtask.deadline ? ' - <span style="font-weight: 500; color: var(--text-soft);">' + formatTaskDeadline(subtask.deadline) + '</span>' : '';

      var subtaskComments = subtask.comments || [];
      var subtaskMarks = subtask.marks || [];
      var subtaskReactionsHtml = renderTaskMarksHtml(subtaskMarks);

      var reactId = 'subtask_' + taskIdx + '_' + subtaskIdx;
      var reactHtml = subtaskReactionsHtml +
        '<div class="reaction-wrap">' +
          '<button type="button" class="topic-inline-btn react-toggle-btn" data-reaction-menu="' + reactId + '">React</button>' +
          renderReactionMenu({ id: reactId, reactions: subtaskMarks }, currentUserId) +
        '</div>';

      var resultsBtnHtml = '';
      var resultsSectionHtml = '';
      if (isSubDone) {
        resultsBtnHtml = '<button type="button" class="topic-inline-btn subtask-results-btn" data-task-idx="' + taskIdx + '" data-subtask-idx="' + subtaskIdx + '" style="font-size: 0.8rem; padding: 2px 6px; border: 1px solid var(--border); border-radius: 4px; cursor: pointer; background: var(--surface-soft); margin-right: 4px;">Results</button>';
        
        var subResultsVal = subtask.results || '';
        resultsSectionHtml = '<div class="subtask-results-section" id="subtask-results-section-' + taskIdx + '-' + subtaskIdx + '" style="display: none; margin-top: 6px; padding: 8px; border: 1px solid var(--border); border-radius: 6px; background: var(--surface-soft); text-align: left; width: 100%; box-sizing: border-box;">' +
                               '<div style="font-weight: 600; font-size: 0.78rem; color: var(--text-muted); margin-bottom: 4px;">Subtask Execution Results:</div>' +
                               '<div style="font-size: 0.82rem; color: var(--text); background: var(--surface); padding: 6px 8px; border-radius: 4px; border: 1px solid var(--border); margin-bottom: 6px; white-space: pre-wrap;">' + (subResultsVal ? escapeHtml(subResultsVal) : '<span style="font-style: italic; color: var(--text-soft);">No results submitted yet.</span>') + '</div>' +
                               '<div class="subtask-results-form" style="display: flex; flex-direction: column; gap: 4px;">' +
                                 '<textarea class="subtask-results-input" placeholder="Document subtask results..." style="width: 100%; min-height: 40px; padding: 4px 8px; border: 1px solid var(--border); border-radius: 4px; font-size: 0.8rem; background: var(--surface); color: var(--text); resize: vertical;">' + escapeHtml(subResultsVal) + '</textarea>' +
                                 '<div style="display: flex; justify-content: flex-end;">' +
                                   '<button type="button" class="subtask-save-results-btn" data-task-idx="' + taskIdx + '" data-subtask-idx="' + subtaskIdx + '" style="padding: 2px 10px; font-size: 0.78rem; border-radius: 4px; cursor: pointer; background: var(--accent); color: var(--accent-contrast, #fff); border: none;">Save</button>' +
                                 '</div>' +
                               '</div>' +
                             '</div>';
      }

      var actionsHtml = '';
      if (!isParentCanceled) {
        actionsHtml = '<div style="display: flex; gap: 6px; align-items: center; margin-top: 2px;" onclick="event.stopPropagation();">' +
                        '<button type="button" class="topic-inline-btn subtask-comment-input-toggle-btn" data-task-idx="' + taskIdx + '" data-subtask-idx="' + subtaskIdx + '" style="font-size: 0.85rem; padding: 0; background: none; border: none; cursor: pointer;">💬</button>' +
                        (isSubDone ? reactHtml + resultsBtnHtml : '') +
                      '</div>';
      }

      var commentsSectionId = 'subtask-comments-section-' + taskIdx + '-' + subtaskIdx;
      var newCommentFormId = 'subtask-comment-form-' + taskIdx + '-' + subtaskIdx;
      var commentsTreeId = 'subtaskcomment_' + taskIdx + '_' + subtaskIdx;

      var commentsHtml = '<div class="subtask-comments-section" id="' + commentsSectionId + '" style="display: none; margin-top: 4px; border-top: 1px dashed var(--border); padding-top: 6px; width: 100%;">' +
                           renderTaskCommentsTree(subtaskComments, commentsTreeId, currentUserId) +
                           '<div class="subtask-new-comment-form" id="' + newCommentFormId + '" style="display: none; margin-top: 6px; display: flex; gap: 6px; align-items: center; width: 100%;">' +
                             '<input type="text" class="subtask-new-comment-input" data-task-idx="' + taskIdx + '" data-subtask-idx="' + subtaskIdx + '" placeholder="Add a subtask comment..." style="flex: 1; padding: 4px 8px; border: 1px solid var(--border); border-radius: 4px; font-size: 0.8rem; background: var(--surface); color: var(--text);" />' +
                             '<button type="button" class="subtask-add-comment-btn" data-task-idx="' + taskIdx + '" data-subtask-idx="' + subtaskIdx + '" style="padding: 4px 10px; font-size: 0.8rem; border-radius: 4px; cursor: pointer;">Comment</button>' +
                           '</div>' +
                         '</div>';

      return '<div class="subtask-card-item" style="position: relative; display: flex; flex-direction: column; gap: 4px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 6px; margin-bottom: 6px; width: 100%; box-sizing: border-box;">' +
               '<div style="display: flex; align-items: center; gap: 8px; justify-content: space-between; flex-wrap: wrap; width: 100%;">' +
                 '<div style="display: flex; align-items: center; gap: 6px; flex: 1; flex-wrap: wrap;">' +
                   '<input type="checkbox" class="subtask-status-checkbox" data-task-idx="' + taskIdx + '" data-subtask-idx="' + subtaskIdx + '"' + (isSubDone ? ' checked' : '') + checkboxDisabled + ' style="width: 14px; height: 14px; cursor: pointer; accent-color: var(--accent);" />' +
                   '<span style="font-size: 0.85rem; font-weight: 500; ' + textStyle + '">' + escapeHtml(subtask.title || subtask.step || subtask.text || '') + responsibleHtml + deadlineHtml + '</span>' +
                 '</div>' +
                 '<div style="display: flex; align-items: center; gap: 6px;">' +
                   deleteHtml +
                 '</div>' +
               '</div>' +
               actionsHtml +
               resultsSectionHtml +
               commentsHtml +
             '</div>';
    }).join('');
  }

  function renderTaskCommentsTree(comments, taskIdx, currentUserId) {
    if (!comments || comments.length === 0) return '';
    
    var roots = [];
    var childrenOf = {};
    comments.forEach(function(c) {
      var pId = c.parent_id || null;
      if (!pId) {
        roots.push(c);
      } else {
        if (!childrenOf[pId]) childrenOf[pId] = [];
        childrenOf[pId].push(c);
      }
    });

    function renderCommentNode(comment, depth) {
      var authorName = comment.author_name || 'User';
      var text = comment.text || '';
      var indent = depth * 16;
      var children = childrenOf[comment.id] || [];
      var commentId = comment.id;
      
      var existingReactions = renderTaskMarksHtml(comment.marks);
      var reactHtml = existingReactions +
        '<div class="reaction-wrap">' +
          '<button type="button" class="topic-inline-btn react-toggle-btn" data-reaction-menu="taskcomment_' + taskIdx + '_' + commentId + '">React</button>' +
          renderReactionMenu({ id: 'taskcomment_' + taskIdx + '_' + commentId, reactions: comment.marks || [] }, currentUserId) +
        '</div>';

      var commentHtml = '<div class="task-comment-card" id="task-comment-' + comment.id + '" style="margin-left: ' + indent + 'px; margin-bottom: 6px; padding: 6px 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface-muted); text-align: left; font-size: 0.85rem;">' +
                          '<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;">' +
                            '<div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">' +
                              '<span style="font-weight: 600; color: var(--text-muted);">' + authorName + '</span>' +
                              '<span style="font-size: 0.75rem; color: var(--text-soft);">' + (comment.timestamp ? comment.timestamp : '') + '</span>' +
                            '</div>' +
                            '<div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;" onclick="event.stopPropagation();">' +
                              '<button type="button" class="topic-inline-btn task-comment-reply-toggle-btn" data-comment-id="' + comment.id + '" style="font-size: 0.95rem; padding: 0; background: none; border: none; cursor: pointer;">💬</button>' +
                              reactHtml +
                            '</div>' +
                          '</div>' +
                          '<div style="color: var(--text); margin-top: 2px;">' + escapeHtml(text) + '</div>' +
                          
                          '<div class="task-comment-reply-form" id="reply-form-' + comment.id + '" style="display: none; margin-top: 6px; gap: 6px; align-items: center;">' +
                            '<input type="text" class="task-reply-input" placeholder="Write a reply..." style="flex: 1; padding: 4px 8px; border: 1px solid var(--border); border-radius: 4px; font-size: 0.8rem; background: var(--surface); color: var(--text);" />' +
                            '<button type="button" class="task-submit-reply-btn" data-task-idx="' + taskIdx + '" data-parent-id="' + comment.id + '" style="padding: 4px 8px; font-size: 0.8rem; border-radius: 4px;">Send</button>' +
                          '</div>' +
                        '</div>';
                        
      var childrenHtml = children.map(function(child) {
        return renderCommentNode(child, depth + 1);
      }).join('');
      
      return commentHtml + childrenHtml;
    }

    return '<div class="task-comments-list" style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px;">' +
             roots.map(function(root) {
               return renderCommentNode(root, 0);
             }).join('') +
           '</div>';
  }

  function renderTasksTopic(topic) {
    var winningOption = null;
    if (topic.options && topic.winning_option_index !== null && topic.winning_option_index !== undefined) {
      winningOption = topic.options[topic.winning_option_index];
    }

    var winnerHtml = '';
    if (winningOption) {
      winnerHtml = '<div class="topic-detail-block">' +
                     '<div class="topic-detail-block-title">Winning Option</div>' +
                     '<div class="winning-option-card" style="padding: 12px; border: 1px solid var(--border); border-radius: 12px; margin-bottom: 16px; background: var(--surface-muted);">' +
                       '<div style="font-weight: 700; font-size: 0.98rem; color: var(--text);">' + (winningOption.label || winningOption.title || 'Option') + '</div>' +
                       '<div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">Proposed by <b>' + winningOption.author_name + '</b> &middot; Budget: <b>' + winningOption.budget + '</b></div>' +
                     '</div>' +
                   '</div>';
    }

    var otherMessages = topic.messages || [];
    if (otherMessages.length > 0) {
      otherMessages = otherMessages.slice(1);
    }
    
    var messagesListHtml = otherMessages.map(function(msg) {
      var authorName = msg.author || 'User';
      var text = msg.text || '';
      var parentLink = '';
      if (msg.parentID) {
        parentLink = '<div style="font-size:0.78rem; color:var(--text-soft); margin-bottom: 2px;">In reply to parent message #' + msg.parentID + '</div>';
      }
      return '<div class="topic-message-card" id="msg-' + msg.id + '" style="margin-bottom: 8px; padding: 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); text-align: left;">' +
               parentLink +
               '<div class="topic-message-author" style="font-weight:600; font-size:0.85rem; color:var(--text-muted); margin-bottom:2px;">' + authorName + '</div>' +
               '<div class="topic-message-text" style="font-size:0.92rem; color:var(--text);">' + escapeHtml(text) + '</div>' +
             '</div>';
    }).join('');

    if (!messagesListHtml) {
      messagesListHtml = '<div style="color:var(--text-muted); font-style:italic; font-size:0.88rem; padding: 4px;">No messages in this discussion.</div>';
    }

    var otherOptions = (topic.options || []).filter(function(option, optIdx) {
      return optIdx !== topic.winning_option_index;
    });

    var otherOptionsHtml = otherOptions.map(function(option) {
      var scoreVal = option.score !== undefined ? option.score : 0;
      
      var stepsHtml = '';
      if (option.description && option.description.length > 0) {
        stepsHtml = '<div class="voting-option-steps" style="margin-top: 6px; padding-left: 24px; font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">' +
          option.description.map(function(s) {
            var dlHtml = s.deadline ? ' - <span style="font-weight: 500; color: var(--text-soft);">' + formatTaskDeadline(s.deadline) + '</span>' : '';
            return '<div style="margin-bottom: 2px;">&bull; ' + s.step + ' <span style="font-weight: 500; color: var(--text-soft);">(' + s.in_charge_name + ')</span>' + dlHtml + '</div>';
          }).join('') +
        '</div>';
      }
      
      var metaDetails = '';
      if (option.author_name && option.author_name !== 'System') {
        metaDetails = '<div style="font-size: 0.8rem; color: var(--text-muted); margin-left: 24px; margin-top: 2px;">Proposed by ' + option.author_name + ' &middot; <b>Budget: ' + option.budget + '</b></div>';
      }

      return '<div class="topic-option-row" style="display: flex; flex-direction: column; align-items: stretch; gap: 4px; padding: 12px; border: 1px solid var(--border); border-radius: 12px; margin-bottom: 8px; cursor: default; background: var(--surface);">' +
        '<div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">' +
          '<span style="display: flex; align-items: center; gap: 8px;">' +
            '<span class="topic-option-text" style="font-weight: 600; color: var(--text);">' + (option.label || option.title || 'Option') + '</span>' +
          '</span>' +
          '<span class="topic-option-score" style="font-weight: 600; font-size: 0.85rem; color: var(--text-soft);">ISR total: ' + scoreVal.toFixed(2) + '</span>' +
        '</div>' +
        metaDetails +
        stepsHtml +
      '</div>';
    }).join('');

    if (!otherOptionsHtml) {
      otherOptionsHtml = '<div style="color:var(--text-muted); font-style:italic; font-size:0.88rem; padding: 4px;">No other options for this issue.</div>';
    }

    var currentUserId = safeGetStorage('userId') || "1";
    var participantOptions = (topic.participants || []).map(function(uid) {
      var name = window.userCache[uid] || ('User ' + uid);
      return '<option value="' + uid + '">' + name + '</option>';
    }).join('');

    return '' +
      '<div class="topic-detail-card">' +
        '<div class="topic-detail-top">' +
          '<div>' +
            '<div class="topic-detail-eyebrow">Task topic</div>' +
            '<h3 class="topic-detail-title">' + topic.name + '</h3>' +
          '</div>' +
        '</div>' +

        '<p class="topic-detail-description">' + topic.description + '</p>' +

        renderMetaRow([
          { label: 'Microcommunity', value: (topic.participants || []).length + ' members', uids: (topic.participants || []).join(',') },
          { label: 'Deadline', value: topic.deadline },
          { label: 'Relevance', value: topic.relevance, firstRow: topic.relevanceWeights },
          { label: 'ISR-score', value: topic.isrScore, firstRow: topic.isrWeights },
          { label: 'Expertise Depth', value: topic.expertiseDepth || "None" }
        ]) +

        winnerHtml +

        '<div class="topic-detail-block">' +
          '<div class="topic-detail-block-title">Tasks</div>' +
          '<div class="task-items-list" style="display: flex; flex-direction: column; gap: 12px;">' +
            topic.tasks.map(function(task, taskIdx) {
              var taskText = typeof task === 'string' ? task : (task.step || task.text || '');
              var taskDeadline = task.deadline ? ' - <span style="font-weight: 500; color: var(--text-soft);">' + formatTaskDeadline(task.deadline) + '</span>' : '';
              var responsibleHtml = task.in_charge_name ? ' <span style="font-weight: 500; color: var(--text-soft);">(' + task.in_charge_name + ')</span>' : '';
              
              var isDone = task.status === 'done';
              var isCanceled = task.status === 'canceled' || task.status === 'cancelled';
              var doneEmoji = isDone ? '✔️ ' : '';
              var taskTextStyle = isCanceled ? 'text-decoration: line-through; color: var(--text-soft); font-style: italic;' : '';
              
              var isResponsible = (task.in_charge_uid || '').toString() === currentUserId.toString();
              var checkboxDisabled = (!isResponsible) ? ' disabled' : '';

              var reactHtml = '';
              if (isDone) {
                var existingReactions = renderTaskMarksHtml(task.marks);
                reactHtml = existingReactions +
                  '<div class="reaction-wrap">' +
                    '<button type="button" class="topic-inline-btn react-toggle-btn" data-reaction-menu="task_' + taskIdx + '">React</button>' +
                    renderReactionMenu({ id: 'task_' + taskIdx, reactions: task.marks || [] }, currentUserId) +
                  '</div>' +
                  '<button type="button" class="topic-inline-btn task-results-btn" data-task-idx="' + taskIdx + '" style="margin-left: 4px; padding: 2px 6px; border: 1px solid var(--border); border-radius: 4px; cursor: pointer; background: var(--surface-soft); font-size: 0.8rem;">Results</button>';
              }

              var resultsValue = task.results || '';
              var resultsHtml = '';
              if (isDone) {
                resultsHtml = '<div class="task-results-section" id="task-results-section-' + taskIdx + '" style="display: none; margin-top: 6px; border-top: 1px solid var(--border); padding-top: 8px; text-align: left;">' +
                                '<div style="font-weight: 600; font-size: 0.82rem; color: var(--text-muted); margin-bottom: 4px;">Task Execution Results:</div>' +
                                '<div style="font-size: 0.88rem; color: var(--text); background: var(--surface-muted); padding: 8px 10px; border-radius: 6px; border: 1px solid var(--border); margin-bottom: 6px; white-space: pre-wrap;">' + (resultsValue ? escapeHtml(resultsValue) : '<span style="font-style: italic; color: var(--text-soft);">No results submitted yet.</span>') + '</div>' +
                                '<div class="task-results-form" style="display: flex; flex-direction: column; gap: 6px;">' +
                                  '<textarea class="task-results-input" placeholder="Document the task results for contribution assessment..." style="width: 100%; min-height: 60px; padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; font-size: 0.85rem; background: var(--surface); color: var(--text); resize: vertical;">' + escapeHtml(resultsValue) + '</textarea>' +
                                  '<div style="display: flex; justify-content: flex-end;">' +
                                    '<button type="button" class="task-save-results-btn" data-task-idx="' + taskIdx + '" style="padding: 4px 12px; font-size: 0.82rem; border-radius: 6px; cursor: pointer; background: var(--accent); color: var(--accent-contrast, #fff); border: none;">Save</button>' +
                                  '</div>' +
                                '</div>' +
                              '</div>';
              }

              var responsibleActionsHtml = '';
              if (isResponsible) {
                if (isCanceled) {
                  responsibleActionsHtml = 
                    '<button type="button" class="topic-inline-btn task-restore-btn" data-task-idx="' + taskIdx + '" style="font-size: 0.8rem; padding: 2px 6px; border: 1px solid var(--border); border-radius: 4px; cursor: pointer; background: var(--surface-soft); margin-right: 4px;">Restore</button>';
                } else {
                  responsibleActionsHtml = 
                    '<button type="button" class="topic-inline-btn task-breakdown-toggle-btn" data-task-idx="' + taskIdx + '" style="font-size: 0.8rem; padding: 2px 6px; border: 1px solid var(--border); border-radius: 4px; cursor: pointer; background: var(--surface-soft); margin-right: 4px;">🛠️ Break down</button>' +
                    '<button type="button" class="topic-inline-btn task-cancel-btn" data-task-idx="' + taskIdx + '" style="font-size: 0.8rem; padding: 2px 6px; border: 1px solid var(--border); border-radius: 4px; cursor: pointer; color: var(--error, #e53e3e); background: var(--surface-soft); margin-right: 4px;">Cancel</button>';
                }
              }

              return '<div class="task-item-card" style="position: relative; padding: 12px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); display: flex; flex-direction: column; gap: 8px;">' +
                       '<div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%;">' +
                         '<div style="display: flex; align-items: center; gap: 8px; flex: 1;">' +
                           (isCanceled ? 
                             '<span style="font-size: 0.95rem; margin-right: 2px; user-select: none;">❌</span>' : 
                             '<input type="checkbox" class="task-status-checkbox" data-task-idx="' + taskIdx + '"' + (isDone ? ' checked' : '') + checkboxDisabled + ' style="width: 16px; height: 16px; cursor: pointer; accent-color: var(--accent);" />'
                           ) +
                           '<button type="button" class="task-name-btn" data-task-idx="' + taskIdx + '" style="background: none; border: none; font-size: 0.95rem; cursor: pointer; text-align: left; padding: 0; font-weight: 600; color: var(--text); flex: 1; display: inline-flex; align-items: center; flex-wrap: wrap; gap: 4px; ' + taskTextStyle + '">' +
                             doneEmoji + escapeHtml(taskText) + responsibleHtml + taskDeadline +
                           '</button>' +
                         '</div>' +
                         '<div style="display: flex; gap: 8px; align-items: center;" onclick="event.stopPropagation();">' +
                           responsibleActionsHtml +
                           '<button type="button" class="topic-inline-btn task-comment-input-toggle-btn" data-task-idx="' + taskIdx + '" style="font-size: 0.95rem; padding: 0; background: none; border: none; cursor: pointer;">💬</button>' +
                           reactHtml +
                         '</div>' +
                       '</div>' +
                       
                       '<div class="task-subtasks-section" style="margin-top: 4px; padding-left: 24px; display: flex; flex-direction: column; gap: 4px;">' +
                         '<div class="task-subtasks-list" id="task-subtasks-list-' + taskIdx + '" style="display: flex; flex-direction: column; gap: 4px;">' +
                           renderSubtasks(task.subtasks || [], taskIdx, currentUserId, task.in_charge_uid, isCanceled) +
                         '</div>' +
                         '<div class="task-breakdown-form" id="task-breakdown-form-' + taskIdx + '" style="display: none; margin-top: 8px; flex-direction: column; gap: 8px; border: 1px solid var(--border); padding: 10px; border-radius: 8px; background: var(--surface-soft); width: 100%; box-sizing: border-box;">' +
                            '<div style="font-weight: 600; font-size: 0.82rem; color: var(--text-muted); text-align: left;">Add Subtask:</div>' +
                            '<input type="text" class="task-new-subtask-input" data-task-idx="' + taskIdx + '" placeholder="Subtask description..." style="width: 100%; padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; font-size: 0.85rem; background: var(--surface); color: var(--text); box-sizing: border-box;" />' +
                            '<div style="display: flex; gap: 8px; align-items: center; width: 100%; flex-wrap: wrap;">' +
                              '<select class="task-new-subtask-responsible" data-task-idx="' + taskIdx + '" style="flex: 1; min-width: 120px; padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--surface); color: var(--text); font-size: 0.82rem;">' +
                                participantOptions +
                              '</select>' +
                              '<input type="date" class="task-new-subtask-deadline" data-task-idx="' + taskIdx + '" style="padding: 6px 8px; border: 1px solid var(--border); border-radius: 6px; background: var(--surface); color: var(--text); font-size: 0.82rem;" />' +
                              '<button type="button" class="task-add-subtask-btn" data-task-idx="' + taskIdx + '" style="padding: 6px 12px; font-size: 0.82rem; font-weight: 600; border-radius: 6px; background: var(--accent); color: var(--accent-contrast, #fff); border: none; cursor: pointer;">➕ Add</button>' +
                            '</div>' +
                          '</div>' +
                       '</div>' +
                       
                       '<div class="task-comments-section" id="task-comments-section-' + taskIdx + '" style="display: none; margin-top: 4px; border-top: 1px dashed var(--border); padding-top: 8px;">' +
                         renderTaskCommentsTree(task.comments || [], taskIdx, currentUserId) +
                         '<div class="task-new-comment-form" id="task-comment-form-' + taskIdx + '" style="display: none; margin-top: 8px; display: flex; gap: 8px; align-items: center;">' +
                           '<input type="text" class="task-new-comment-input" data-task-idx="' + taskIdx + '" placeholder="Add a comment..." style="flex: 1; padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; font-size: 0.82rem; background: var(--surface-muted); color: var(--text);" />' +
                           '<button type="button" class="task-add-comment-btn" data-task-idx="' + taskIdx + '" style="padding: 6px 12px; font-size: 0.82rem; border-radius: 6px; cursor: pointer;">Comment</button>' +
                         '</div>' +
                       '</div>' +
                       resultsHtml +
                     '</div>';
            }).join('') +
          '</div>' +
        '</div>' +

        '<div class="topic-detail-actions">' +
          '<div class="topic-detail-actions-left" style="display: flex; gap: 8px;">' +
            '<button type="button" class="tasks-discussion-toggle-btn">Discussion</button>' +
            '<button type="button" class="tasks-other-options-toggle-btn">Other options</button>' +
          '</div>' +
          '<div class="topic-detail-actions-right">' +
            '<button type="button" class="topic-back-btn">Cancel</button>' +
          '</div>' +
        '</div>' +

        '<div class="tasks-discussion-container" style="display: none; margin-top: 20px; border-top: 1px solid var(--border); padding-top: 16px;">' +
          '<div class="topic-detail-block-title" style="margin-bottom: 12px; font-weight: 700; color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase;">Previous Discussion Messages</div>' +
          '<div class="topic-message-list" style="max-height: 250px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">' +
            messagesListHtml +
          '</div>' +
        '</div>' +

        '<div class="tasks-other-options-container" style="display: none; margin-top: 20px; border-top: 1px solid var(--border); padding-top: 16px;">' +
          '<div class="topic-detail-block-title" style="margin-bottom: 12px; font-weight: 700; color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase;">Other Options</div>' +
          '<div class="topic-options-list" style="display: flex; flex-direction: column; gap: 8px;">' +
            otherOptionsHtml +
          '</div>' +
        '</div>' +
      '</div>';
  }

  // Active listener token to cancel when exiting modal detail view
  let activeDetailListener = null;

  async function renderTopicDetail(kind, topicId, sourceViewHtml, titleText) {
    modalBody.setAttribute('data-topic-detail-open', '1');
    modalBody.setAttribute('data-topic-source-kind', kind);
    modalBody.setAttribute('data-topic-source-title', titleText || '');
    modalBody.setAttribute('data-active-topic-id', topicId);
    modalBody.__sourceViewHtml = sourceViewHtml || modalBody.innerHTML;
    modalBody.__restoreView = restoreTopicListView;

    modalBody.innerHTML = '<div style="padding:20px; color:var(--text-muted); font-size:0.95rem;">Loading details from database...</div>';

    if (typeof firebase === 'undefined') return;
    const db = firebase.firestore();

    let currentDiscData = null;
    let cachedMemberData = null;
    let activeModalType = null;

    // Clean up any existing listeners
    if (activeDetailListener) {
      activeDetailListener();
      activeDetailListener = null;
    }

    function formatDateToString(date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    function formatDeadlineDisplay(endsStr) {
      if (!endsStr || endsStr === "Ongoing") return "Ongoing";
      const parts = endsStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
      }
      return endsStr;
    }

    function closeOverlayModal() {
      activeModalType = null;
      const overlay = document.getElementById('proposal-modal-overlay');
      if (overlay) {
        overlay.hidden = true;
      }
    }

    function showRelevanceModal() {
      const disc = currentDiscData;
      if (!disc) return;

      const proposalModalOverlay = document.getElementById('proposal-modal-overlay');
      const proposalModalCloseBtn = document.getElementById('proposal-modal-close-btn');
      const proposalModalTitle = document.getElementById('proposal-modal-title');
      const proposalModalBody = document.getElementById('proposal-modal-body');

      if (!proposalModalOverlay || !proposalModalCloseBtn || !proposalModalTitle || !proposalModalBody) return;

      proposalModalTitle.textContent = "Relevance Component Scores";

      const userObj = cachedMemberData || {};
      const dVal = userObj.D_score !== undefined ? parseFloat(userObj.D_score) : 0.0;
      const gVal = userObj.G_score !== undefined ? parseFloat(userObj.G_score) : 0.0;
      const sVal = userObj.S_score !== undefined ? parseFloat(userObj.S_score) : 0.0;
      const xVal = userObj.X_score !== undefined ? parseFloat(userObj.X_score) : 0.0;
      const totalRelevance = userObj.relevance_score !== undefined ? parseFloat(userObj.relevance_score) : 0.0;

      const wD = disc.w_demographic !== undefined ? parseFloat(disc.w_demographic) : 0.2;
      const wG = disc.w_geographic !== undefined ? parseFloat(disc.w_geographic) : 0.6;
      const wS = disc.w_semantic !== undefined ? parseFloat(disc.w_semantic) : 0.1;
      const wX = disc.w_social !== undefined ? parseFloat(disc.w_social) : 0.1;

      proposalModalBody.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:16px; color:var(--text);">
          <div style="font-size:0.9rem; color:var(--text-muted); border-bottom:1px solid var(--border); padding-bottom:8px; margin-bottom:8px;">
            Detailed Relevance component scores for your profile on this topic.
          </div>
          
          <div class="relevance-components-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
            <!-- Demographics -->
            <div style="background:var(--surface-soft); padding:12px; border-radius:8px; border:1px solid var(--border);">
              <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600; text-transform:uppercase; margin-bottom:4px;">Demographics (D)</div>
              <div style="font-size:1.2rem; font-weight:700; color:var(--text);">${dVal.toFixed(3)} <span style="font-size:0.8rem; font-weight:normal; color:var(--text-soft); display:block; margin-top:2px;">× ${(wD * 100).toFixed(0)}% weight</span></div>
            </div>
            
            <!-- Geographics -->
            <div style="background:var(--surface-soft); padding:12px; border-radius:8px; border:1px solid var(--border);">
              <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600; text-transform:uppercase; margin-bottom:4px;">Geographics (G)</div>
              <div style="font-size:1.2rem; font-weight:700; color:var(--text);">${gVal.toFixed(3)} <span style="font-size:0.8rem; font-weight:normal; color:var(--text-soft); display:block; margin-top:2px;">× ${(wG * 100).toFixed(0)}% weight</span></div>
            </div>
            
            <!-- Semantics -->
            <div style="background:var(--surface-soft); padding:12px; border-radius:8px; border:1px solid var(--border);">
              <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600; text-transform:uppercase; margin-bottom:4px;">Semantics (S)</div>
              <div style="font-size:1.2rem; font-weight:700; color:var(--text);">${sVal.toFixed(3)} <span style="font-size:0.8rem; font-weight:normal; color:var(--text-soft); display:block; margin-top:2px;">× ${(wS * 100).toFixed(0)}% weight</span></div>
            </div>
            
            <!-- Social -->
            <div style="background:var(--surface-soft); padding:12px; border-radius:8px; border:1px solid var(--border);">
              <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600; text-transform:uppercase; margin-bottom:4px;">Social (X)</div>
              <div style="font-size:1.2rem; font-weight:700; color:var(--text);">${xVal.toFixed(3)} <span style="font-size:0.8rem; font-weight:normal; color:var(--text-soft); display:block; margin-top:2px;">× ${(wX * 100).toFixed(0)}% weight</span></div>
            </div>
          </div>
          
          <div style="background:var(--primary-soft); border:1px solid var(--primary); padding:16px; border-radius:8px; text-align:center;">
            <div style="font-size:0.85rem; color:var(--primary); margin-bottom:4px; font-weight:600;">Total Relevance</div>
            <div style="font-size:2rem; font-weight:800; color:var(--primary);">${(totalRelevance * 100).toFixed(0)}%</div>
          </div>
          
          <div style="display:flex; flex-direction:column; gap:6px;">
            <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted);">Explanation</label>
            <textarea placeholder="Explanation" style="width:100%; height:80px; padding:10px; border-radius:8px; border:1px solid var(--border); background:var(--surface); color:var(--text); font-size:0.9rem; resize:vertical;"></textarea>
          </div>
          
          <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:8px;">
            <button type="button" class="topic-back-btn" id="relevance-modal-close" style="padding:8px 16px; border-radius:8px; cursor:pointer; border:1px solid var(--border); background:var(--surface-muted); color:var(--text);">Close</button>
          </div>
        </div>
      `;

      const closeBtn = document.getElementById('relevance-modal-close');
      if (closeBtn) {
        closeBtn.onclick = closeOverlayModal;
      }

      proposalModalCloseBtn.onclick = closeOverlayModal;
      proposalModalOverlay.onclick = function(e) {
        if (e.target === proposalModalOverlay) {
          closeOverlayModal();
        }
      };

      proposalModalOverlay.hidden = false;
    }

    function showIsrModal() {
      const disc = currentDiscData;
      if (!disc) return;

      const proposalModalOverlay = document.getElementById('proposal-modal-overlay');
      const proposalModalCloseBtn = document.getElementById('proposal-modal-close-btn');
      const proposalModalTitle = document.getElementById('proposal-modal-title');
      const proposalModalBody = document.getElementById('proposal-modal-body');

      if (!proposalModalOverlay || !proposalModalCloseBtn || !proposalModalTitle || !proposalModalBody) return;

      proposalModalTitle.textContent = "ISR-score Component Scores";

      const userObj = cachedMemberData || {};
      const rVal = userObj.normalized_relevance !== undefined ? parseFloat(userObj.normalized_relevance) : 0.0;
      const eVal = userObj.normalized_experience !== undefined ? parseFloat(userObj.normalized_experience) : 0.0;
      const cVal = userObj.normalized_contribution !== undefined ? parseFloat(userObj.normalized_contribution) : 0.0;
      const totalIsr = userObj.isr_score !== undefined ? parseFloat(userObj.isr_score) : 0.0;

      const wR = disc.w_relevance !== undefined ? parseFloat(disc.w_relevance) : 0.4;
      const wE = disc.w_expertise !== undefined ? parseFloat(disc.w_expertise) : 0.3;
      const wC = disc.w_contribution !== undefined ? parseFloat(disc.w_contribution) : 0.3;

      proposalModalBody.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:16px; color:var(--text);">
          <div style="font-size:0.9rem; color:var(--text-muted); border-bottom:1px solid var(--border); padding-bottom:8px; margin-bottom:8px;">
            Detailed ISR-score component scores for your profile on this topic.
          </div>
          
          <div class="isr-components-grid" style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px;">
            <!-- Normalized Relevance -->
            <div style="background:var(--surface-soft); padding:12px; border-radius:8px; border:1px solid var(--border);">
              <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600; text-transform:uppercase; margin-bottom:4px;">Relevance (R)</div>
              <div style="font-size:1.2rem; font-weight:700; color:var(--text);">${rVal.toFixed(3)} <span style="font-size:0.8rem; font-weight:normal; color:var(--text-soft); display:block; margin-top:2px;">× ${(wR * 100).toFixed(0)}% weight</span></div>
            </div>
            
            <!-- Normalized Expertise -->
            <div style="background:var(--surface-soft); padding:12px; border-radius:8px; border:1px solid var(--border);">
              <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600; text-transform:uppercase; margin-bottom:4px;">Expertise (E)</div>
              <div style="font-size:1.2rem; font-weight:700; color:var(--text);">${eVal.toFixed(3)} <span style="font-size:0.8rem; font-weight:normal; color:var(--text-soft); display:block; margin-top:2px;">× ${(wE * 100).toFixed(0)}% weight</span></div>
            </div>
            
            <!-- Normalized Contribution -->
            <div style="background:var(--surface-soft); padding:12px; border-radius:8px; border:1px solid var(--border);">
              <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600; text-transform:uppercase; margin-bottom:4px;">Contribution (C)</div>
              <div style="font-size:1.2rem; font-weight:700; color:var(--text);">${cVal.toFixed(3)} <span style="font-size:0.8rem; font-weight:normal; color:var(--text-soft); display:block; margin-top:2px;">× ${(wC * 100).toFixed(0)}% weight</span></div>
            </div>
          </div>
          
          <div style="background:var(--primary-soft); border:1px solid var(--primary); padding:16px; border-radius:8px; text-align:center;">
            <div style="font-size:0.85rem; color:var(--primary); margin-bottom:4px; font-weight:600;">Total ISR-score</div>
            <div style="font-size:2rem; font-weight:800; color:var(--primary);">${totalIsr.toFixed(3)}</div>
          </div>
          
          <div style="display:flex; flex-direction:column; gap:6px;">
            <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted);">Explanation</label>
            <textarea placeholder="Explanation" style="width:100%; height:80px; padding:10px; border-radius:8px; border:1px solid var(--border); background:var(--surface); color:var(--text); font-size:0.9rem; resize:vertical;"></textarea>
          </div>
          
          <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:8px;">
            <button type="button" class="topic-back-btn" id="isr-modal-close" style="padding:8px 16px; border-radius:8px; cursor:pointer; border:1px solid var(--border); background:var(--surface-muted); color:var(--text);">Close</button>
          </div>
        </div>
      `;

      const closeBtn = document.getElementById('isr-modal-close');
      if (closeBtn) {
        closeBtn.onclick = closeOverlayModal;
      }

      proposalModalCloseBtn.onclick = closeOverlayModal;
      proposalModalOverlay.onclick = function(e) {
        if (e.target === proposalModalOverlay) {
          closeOverlayModal();
        }
      };

      proposalModalOverlay.hidden = false;
    }

    async function submitDeadlineVote(voteType) {
  const currentUserId = safeGetStorage('userId') || "1";
  const discRef = db.collection("discussions").doc(topicId);
  const issueRef = db.collection("issues").doc(topicId);

  try {
    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(discRef);
      if (!doc.exists) return;

      const data = doc.data();
      const isrScoresMap = data.isr_scores || {};
      let totalIsrSum = 0;
      for (const uid in isrScoresMap) {
        totalIsrSum += parseFloat(isrScoresMap[uid]) || 0;
      }

      let votesMap = data.deadline_votes || {};
      const currentVote = votesMap[currentUserId];

      if (currentVote === voteType) {
        delete votesMap[currentUserId];
      } else {
        votesMap[currentUserId] = voteType;
      }

      // Recalculate sums
      let plus1WeekSum = 0;
      let startVotingSum = 0;
      let backToChatSum = 0;
      let finishVotingSum = 0;
      let cancelIssueSum = 0;

      for (const uid in votesMap) {
        const v = votesMap[uid];
        const userIsrScore = parseFloat(isrScoresMap[uid]) || 0;
        if (v === 'plus_1_week') {
          plus1WeekSum += userIsrScore;
        } else if (v === 'start_voting') {
          startVotingSum += userIsrScore;
        } else if (v === 'back_to_chat') {
          backToChatSum += userIsrScore;
        } else if (v === 'finish_voting') {
          finishVotingSum += userIsrScore;
        } else if (v === 'cancel_issue') {
          cancelIssueSum += userIsrScore;
        }
      }

      let updateFields = {
        deadline_votes: votesMap
      };

      if (totalIsrSum > 0) {
        let transitionTriggered = false;
        const cancelRatio = cancelIssueSum / totalIsrSum;

        if (data.status === 'inactive') {
          if (cancelRatio <= 0.10) {
            transitionTriggered = true;
            // Reactivate issue!
            const newEndsDate = new Date();
            newEndsDate.setDate(newEndsDate.getDate() + 7);
            const newEndsStr = formatDateToString(newEndsDate);

            const origStatus = data.previous_status || (kind === 'voting' ? 'in_process' : (kind === 'tasks' ? 'approved' : 'discussion'));
            updateFields.status = origStatus;
            updateFields.ends = newEndsStr;
            updateFields.previous_status = firebase.firestore.FieldValue.delete();
            updateFields.deadline_votes = {}; // reset votes on reactivation

            if (origStatus === 'in_process' || origStatus === 'approved' || origStatus === 'tasks') {
              transaction.update(issueRef, {
                status: origStatus,
                ends: newEndsStr,
                deadline_votes: {},
                previous_status: firebase.firestore.FieldValue.delete()
              });
            }

            setTimeout(() => {
              closeOverlayModal();
              restoreTopicListView();
            }, 100);
          } else {
            // Still inactive, just update the vote map
            if (kind === 'voting' || kind === 'tasks') {
              transaction.update(issueRef, {
                deadline_votes: votesMap
              });
            }
          }
        } else {
          // Normal active flows...
          if (cancelRatio > 0.10) {
            transitionTriggered = true;
            // Cancel issue (become inactive)
            updateFields.status = 'inactive';
            
            let prevStatus = 'discussion';
            if (kind === 'voting') prevStatus = 'in_process';
            else if (kind === 'tasks') prevStatus = 'approved';
            
            updateFields.previous_status = prevStatus;

            if (kind === 'voting' || kind === 'tasks') {
              transaction.update(issueRef, {
                status: 'inactive',
                previous_status: prevStatus,
                deadline_votes: votesMap
              });
            }

            setTimeout(() => {
              closeOverlayModal();
              restoreTopicListView();
            }, 100);
          } else if ((plus1WeekSum / totalIsrSum) > 0.10) {
            transitionTriggered = true;
            let currentDeadlineDate = new Date();
            if (data.ends && data.ends !== "Ongoing") {
              const parts = data.ends.split('-');
              if (parts.length === 3) {
                currentDeadlineDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
              }
            }
            currentDeadlineDate.setDate(currentDeadlineDate.getDate() + 7);
            const newEndsStr = formatDateToString(currentDeadlineDate);
            
            updateFields.ends = newEndsStr;
            updateFields.deadline_votes = {}; // reset votes

            // Update issue deadline as well if in voting
            if (kind === 'voting') {
              transaction.update(issueRef, {
                ends: newEndsStr,
                deadline_votes: {}
              });
            }

            setTimeout(() => { closeOverlayModal(); }, 100);
          } else if ((startVotingSum / totalIsrSum) > 0.10 && kind === 'chat') {
            transitionTriggered = true;
            const newEndsDate = new Date();
            newEndsDate.setDate(newEndsDate.getDate() + 7);
            const newEndsStr = formatDateToString(newEndsDate);

            updateFields.status = 'Voting';
            updateFields.ends = newEndsStr;
            updateFields.deadline_votes = {}; // reset votes

            // Create/update document in issues collection
            const issueDoc = await transaction.get(issueRef);
            
            let issueOptions = [];
            if (data.options_v2 && data.options_v2.length > 0) {
              issueOptions = data.options_v2.map(opt => ({
                label: opt.title,
                score: 0,
                author_uid: opt.author_uid || "",
                author_name: opt.author_name || "System",
                budget: opt.budget || "N/A",
                description: opt.description || []
              }));
            } else {
              issueOptions = [
                { label: "Proceed with proposed fix", score: 0, author_name: "System", budget: "N/A", description: [] },
                { label: "Reject proposal", score: 0, author_name: "System", budget: "N/A", description: [] },
                { label: "Request more details", score: 0, author_name: "System", budget: "N/A", description: [] }
              ];
            }

            const issueData = {
              title: data.topic || "",
              description: data.description || "",
              category: data.category || "General",
              status: 'in_process', // active for voting
              ends: newEndsStr,
              submitter_id: data.creator_uid || "system",
              created_at: new Date().toISOString(),
              participants: data.participants || [],
              options: issueOptions,
              deadline_votes: {}, // reset votes
              w_demographic: data.w_demographic !== undefined ? data.w_demographic : 0.2,
              w_geographic: data.w_geographic !== undefined ? data.w_geographic : 0.6,
              w_semantic: data.w_semantic !== undefined ? data.w_semantic : 0.1,
              w_social: data.w_social !== undefined ? data.w_social : 0.1,
              w_relevance: data.w_relevance !== undefined ? data.w_relevance : 0.4,
              w_expertise: data.w_expertise !== undefined ? data.w_expertise : 0.3,
              w_contribution: data.w_contribution !== undefined ? data.w_contribution : 0.3,
              last_message_sender_name: data.last_message_sender_name || "",
              last_message_sender_uid: data.last_message_sender_uid || "",
              last_message_text: data.last_message_text || "",
              last_message_timestamp: data.last_message_timestamp || "",
              relevance_scores: data.relevance_scores || {},
              isr_scores: data.isr_scores || {},
              message_count: data.message_count || 0
            };

            if (issueDoc.exists) {
              transaction.update(issueRef, issueData);
            } else {
              transaction.set(issueRef, issueData);
            }

            setTimeout(() => {
              closeOverlayModal();
              restoreTopicListView();
            }, 100);
          } else if ((backToChatSum / totalIsrSum) > 0.10 && kind === 'voting') {
            transitionTriggered = true;
            // Transition back to Chat
            const newEndsDate = new Date();
            newEndsDate.setDate(newEndsDate.getDate() + 7);
            const newEndsStr = formatDateToString(newEndsDate);

            updateFields.status = 'discussion';
            updateFields.ends = newEndsStr;
            updateFields.deadline_votes = {}; // reset votes

            transaction.update(issueRef, {
              status: 'discussion',
              ends: newEndsStr,
              deadline_votes: {},
              votes: {} // reset votes
            });

            setTimeout(() => {
              closeOverlayModal();
              restoreTopicListView();
            }, 100);
          } else if ((finishVotingSum / totalIsrSum) > 0.10 && kind === 'voting') {
            transitionTriggered = true;
            // Transition to Approved
            updateFields.status = 'approved';
            updateFields.deadline_votes = {}; // reset votes

            transaction.update(issueRef, {
              status: 'approved',
              deadline_votes: {}
            });

            setTimeout(() => {
              closeOverlayModal();
              restoreTopicListView();
            }, 100);
          }
        }

        if (!transitionTriggered && data.status !== 'inactive' && (kind === 'voting' || kind === 'tasks')) {
          transaction.update(issueRef, {
            deadline_votes: votesMap
          });
        }
      }

      transaction.update(discRef, updateFields);
    });
  } catch (err) {
    console.error("Transaction failed:", err);
    alert("Transaction failed: " + err.message);
  }
}

    function showDeadlineModal() {
  const disc = currentDiscData;
  if (!disc) return;

  const proposalModalOverlay = document.getElementById('proposal-modal-overlay');
  const proposalModalCloseBtn = document.getElementById('proposal-modal-close-btn');
  const proposalModalTitle = document.getElementById('proposal-modal-title');
  const proposalModalBody = document.getElementById('proposal-modal-body');

  if (!proposalModalOverlay || !proposalModalCloseBtn || !proposalModalTitle || !proposalModalBody) return;

  let modalKind = kind;
  if (disc.status === 'inactive') {
    if (disc.previous_status === 'in_process') {
      modalKind = 'voting';
    } else if (disc.previous_status === 'approved' || disc.previous_status === 'tasks') {
      modalKind = 'tasks';
    } else {
      modalKind = 'chat';
    }
  }

  if (modalKind === 'tasks') {
    proposalModalTitle.textContent = "Cancel Issue Voting";
  } else if (modalKind === 'voting') {
    proposalModalTitle.textContent = "Deadline & Back to Chat Voting";
  } else {
    proposalModalTitle.textContent = "Deadline Adjustment & Voting";
  }

  const currentUserId = safeGetStorage('userId') || "1";
  const isrScoresMap = disc.isr_scores || {};
  let totalIsrSum = 0;
  for (const uid in isrScoresMap) {
    totalIsrSum += parseFloat(isrScoresMap[uid]) || 0;
  }

  const votesMap = disc.deadline_votes || {};
  let plus1WeekSum = 0;
  let startVotingSum = 0;
  let backToChatSum = 0;
  let finishVotingSum = 0;
  let cancelIssueSum = 0;

  for (const uid in votesMap) {
    const v = votesMap[uid];
    const userIsrScore = parseFloat(isrScoresMap[uid]) || 0;
    if (v === 'plus_1_week') {
      plus1WeekSum += userIsrScore;
    } else if (v === 'start_voting') {
      startVotingSum += userIsrScore;
    } else if (v === 'back_to_chat') {
      backToChatSum += userIsrScore;
    } else if (v === 'finish_voting') {
      finishVotingSum += userIsrScore;
    } else if (v === 'cancel_issue') {
      cancelIssueSum += userIsrScore;
    }
  }

  const plus1WeekPct = totalIsrSum > 0 ? (plus1WeekSum / totalIsrSum) * 100 : 0;
  const startVotingPct = totalIsrSum > 0 ? (startVotingSum / totalIsrSum) * 100 : 0;
  const backToChatPct = totalIsrSum > 0 ? (backToChatSum / totalIsrSum) * 100 : 0;
  const finishVotingPct = totalIsrSum > 0 ? (finishVotingSum / totalIsrSum) * 100 : 0;
  const cancelIssuePct = totalIsrSum > 0 ? (cancelIssueSum / totalIsrSum) * 100 : 0;
  const userVote = votesMap[currentUserId];

  let descriptionText = "Adjust the discussion deadline, initiate the voting stage, or cancel this issue.";
  let secondRowHtml = "";
  let showPlus1WeekButton = true;

  if (modalKind === 'voting') {
    descriptionText = "Adjust the voting deadline, transition back to the chat discussion, finish voting, or cancel this issue.";
    secondRowHtml = `
        <!-- Back to Chat Button -->
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; background:var(--surface-soft); border:1px solid var(--border); padding:12px; border-radius:8px;">
          <button type="button" class="deadline-vote-btn ${userVote === 'back_to_chat' ? 'active' : ''}" data-vote="back_to_chat">
            ${userVote === 'back_to_chat' ? '✓ ' : ''}Back to Chat
          </button>
          <div style="text-align:right; min-width:120px;">
            <div style="font-size:0.95rem; font-weight:700; color:var(--text);">${backToChatSum.toFixed(2)} ISR</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${backToChatPct.toFixed(1)}% of total</div>
          </div>
        </div>
        <!-- Finish Voting Button -->
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; background:var(--surface-soft); border:1px solid var(--border); padding:12px; border-radius:8px;">
          <button type="button" class="deadline-vote-btn ${userVote === 'finish_voting' ? 'active' : ''}" data-vote="finish_voting">
            ${userVote === 'finish_voting' ? '✓ ' : ''}Finish Voting
          </button>
          <div style="text-align:right; min-width:120px;">
            <div style="font-size:0.95rem; font-weight:700; color:var(--text);">${finishVotingSum.toFixed(2)} ISR</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${finishVotingPct.toFixed(1)}% of total</div>
          </div>
        </div>
    `;
  } else if (modalKind === 'tasks') {
    descriptionText = "Vote to cancel this issue and mark it as inactive.";
    showPlus1WeekButton = false;
    secondRowHtml = "";
  } else {
    secondRowHtml = `
        <!-- Start Voting Button -->
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; background:var(--surface-soft); border:1px solid var(--border); padding:12px; border-radius:8px;">
          <button type="button" class="deadline-vote-btn ${userVote === 'start_voting' ? 'active' : ''}" data-vote="start_voting">
            ${userVote === 'start_voting' ? '✓ ' : ''}Start Voting
          </button>
          <div style="text-align:right; min-width:120px;">
            <div style="font-size:0.95rem; font-weight:700; color:var(--text);">${startVotingSum.toFixed(2)} ISR</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${startVotingPct.toFixed(1)}% of total</div>
          </div>
        </div>
    `;
  }

  const cancelIssueButtonHtml = `
        <!-- Cancel Issue Button -->
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; background:var(--surface-soft); border:1px solid var(--border); padding:12px; border-radius:8px;">
          <button type="button" class="deadline-vote-btn ${userVote === 'cancel_issue' ? 'active' : ''}" data-vote="cancel_issue" style="color:var(--error, #e53e3e);">
            ${userVote === 'cancel_issue' ? '✓ ' : ''}Cancel Issue
          </button>
          <div style="text-align:right; min-width:120px;">
            <div style="font-size:0.95rem; font-weight:700; color:var(--text);">${cancelIssueSum.toFixed(2)} ISR</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${cancelIssuePct.toFixed(1)}% of total</div>
          </div>
        </div>
  `;

  let buttonsListHtml = "";
  if (showPlus1WeekButton) {
    buttonsListHtml += `
        <!-- +1 Week Button -->
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; background:var(--surface-soft); border:1px solid var(--border); padding:12px; border-radius:8px;">
          <button type="button" class="deadline-vote-btn ${userVote === 'plus_1_week' ? 'active' : ''}" data-vote="plus_1_week">
            ${userVote === 'plus_1_week' ? '✓ ' : ''}+1 Week
          </button>
          <div style="text-align:right; min-width:120px;">
            <div style="font-size:0.95rem; font-weight:700; color:var(--text);">${plus1WeekSum.toFixed(2)} ISR</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${plus1WeekPct.toFixed(1)}% of total</div>
          </div>
        </div>
    `;
  }
  buttonsListHtml += secondRowHtml;
  buttonsListHtml += cancelIssueButtonHtml;

  proposalModalBody.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:16px; color:var(--text);">
      <div style="font-size:0.9rem; color:var(--text-muted); border-bottom:1px solid var(--border); padding-bottom:8px; margin-bottom:8px;">
        ${descriptionText}
      </div>
      
      <div style="background:var(--surface-soft); padding:16px; border-radius:8px; border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:0.9rem; font-weight:600; color:var(--text-muted);">Current Deadline:</span>
        <span style="font-size:1.1rem; font-weight:700; color:var(--text);">${formatDeadlineDisplay(disc.ends)}</span>
      </div>
      
      <div style="display:flex; flex-direction:column; gap:12px;">
        ${buttonsListHtml}
      </div>
      
      <div style="font-size:0.8rem; color:var(--text-muted); line-height:1.4; background:var(--surface-soft); padding:10px; border-radius:6px; border:1px solid var(--border);">
        💡 <b>Rule:</b> Action triggers automatically when support exceeds <b>10%</b> of the microcommunity's total ISR-score (${totalIsrSum.toFixed(2)} ISR).
      </div>
      
      <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:8px;">
        <button type="button" class="topic-back-btn" id="deadline-modal-close" style="padding:8px 16px; border-radius:8px; cursor:pointer; border:1px solid var(--border); background:var(--surface-muted); color:var(--text);">Close</button>
      </div>
    </div>
  `;

  const closeBtn = document.getElementById('deadline-modal-close');
  if (closeBtn) {
    closeBtn.onclick = closeOverlayModal;
  }

  proposalModalCloseBtn.onclick = closeOverlayModal;
  proposalModalOverlay.onclick = function(e) {
    if (e.target === proposalModalOverlay) {
      closeOverlayModal();
    }
  };

  const buttons = proposalModalBody.querySelectorAll('.deadline-vote-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', async function(e) {
      e.preventDefault();
      const voteType = this.getAttribute('data-vote');
      buttons.forEach(b => b.disabled = true);
      try {
        await submitDeadlineVote(voteType);
      } catch (err) {
        console.error("Error casting deadline vote:", err);
      } finally {
        buttons.forEach(b => b.disabled = false);
      }
    });
  });

  proposalModalOverlay.hidden = false;
}

    function refreshOpenModal() {
      if (!activeModalType) return;
      if (activeModalType === 'relevance') {
        showRelevanceModal();
      } else if (activeModalType === 'isr') {
        showIsrModal();
      } else if (activeModalType === 'deadline') {
        showDeadlineModal();
      }
    }

    function bindChatMetaButtons(disc) {
      modalBody.querySelectorAll('[data-meta="Relevance"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          activeModalType = 'relevance';
          showRelevanceModal();
        });
      });

      modalBody.querySelectorAll('[data-meta="ISR-score"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          activeModalType = 'isr';
          showIsrModal();
        });
      });

      modalBody.querySelectorAll('[data-meta="Deadline"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          activeModalType = 'deadline';
          showDeadlineModal();
        });
      });
    }

    if (kind === 'chat') {
      try {
        let currentMessagesRaw = null;
        let isRendering = false;
        let pendingRender = false;
        let replyToMsgId = null;

        // Fetch missing user profiles in parallel & render UI
        async function updateUI() {
          if (!currentDiscData || !currentMessagesRaw) return;
          if (isRendering) {
            pendingRender = true;
            return;
          }
          isRendering = true;

          try {
            const disc = currentDiscData;
            const rawMessages = currentMessagesRaw;

            // Get user relevance from member list or discussions record directly
            const currentUserId = safeGetStorage('userId');
            let userRelevance = "N/A";
            let userIsr = "N/A";

            // Load microcommunity member data for logged-in user if not already cached
            if (!cachedMemberData && currentUserId) {
              try {
                let mcId = topicId;
                const mcSnap = await db.collection("microcommunities")
                  .where("issue_id", "==", topicId)
                  .limit(1)
                  .get();
                mcSnap.forEach(doc => {
                  mcId = doc.id;
                });
                
                if (mcId) {
                  const memberDoc = await db.collection("microcommunity_members")
                    .doc(mcId + '_' + currentUserId)
                    .get();
                  if (memberDoc.exists) {
                    cachedMemberData = memberDoc.data();
                  }
                }
              } catch (err) {
                console.error("Error loading user microcommunity member data:", err);
              }
            }

            if (currentUserId) {
              const uidStr = currentUserId.toString();
              if (disc.relevance_scores && disc.relevance_scores[uidStr] !== undefined) {
                const score = disc.relevance_scores[uidStr];
                userRelevance = (score * 100).toFixed(0) + "%";
                if (disc.isr_scores && disc.isr_scores[uidStr] !== undefined) {
                  userIsr = disc.isr_scores[uidStr].toFixed(2);
                } else {
                  userIsr = (score * 1.5).toFixed(2);
                }
              } else if (cachedMemberData) {
                userRelevance = (cachedMemberData.relevance_score * 100).toFixed(0) + "%";
                if (cachedMemberData.isr_score !== undefined) {
                  userIsr = cachedMemberData.isr_score.toFixed(2);
                } else {
                  userIsr = (cachedMemberData.relevance_score * 1.5).toFixed(2);
                }
              }
            }

            const relevanceWeights = formatRelevanceWeights(disc);
            const isrWeights = formatIsrWeights(disc);

            const uidsToFetch = new Set();
            if (disc.creator_uid) {
              uidsToFetch.add(disc.creator_uid.toString());
            }
            rawMessages.forEach(msg => {
              if (msg.uid && msg.uid !== 'system') {
                uidsToFetch.add(msg.uid.toString());
              }
            });

            // Mark discussion as read
            if (typeof window.markDiscussionAsReadWithCount === 'function') {
              window.markDiscussionAsReadWithCount(topicId, rawMessages.length);
            }

            // Fetch missing user profiles in parallel
            await resolveUserNames(Array.from(uidsToFetch));

            const messages = [];
            let indexCounter = 0;
            rawMessages.forEach(msg => {
              const uid = msg.uid;
              let authorName = '';
              if (uid === 'system') {
                authorName = 'SYSTEM';
              } else {
                const displayName = window.userCache[uid] || ('User ' + uid);
                authorName = displayName + ' ID:' + uid;
              }

              // Resolve reactions correctly to structured objects
              const parsedReactions = (msg.marks || []).map(m => {
                const rUid = m.uid || '';
                const type = resolveReactionValue(m);
                const emoji = reactionEmojis[type] || '?';
                return { uid: rUid, type: type, emoji: emoji };
              });

              messages.push({
                id: msg.id || (indexCounter + 1),
                parentID: msg.parentID,
                uid: msg.uid,
                author: authorName,
                text: msg.text,
                reactions: parsedReactions
              });
              indexCounter++;
            });

            const pList = disc.participants || [];
            const uniqueUids = pList.map(function(uid) { return uid.toString(); }).filter(function(uid) { return uid && uid !== 'system'; });
            const msgUids = messages.map(function(m) { return m.uid.toString(); }).filter(function(uid) { return uid && uid !== 'system'; });
            const combinedUids = Array.from(new Set(uniqueUids.concat(msgUids)));

            const creatorUid = disc.creator_uid ? disc.creator_uid.toString() : '';
            const creatorDisplayName = window.userCache[creatorUid] || ('User ' + creatorUid);
            const creatorName = creatorUid ? (creatorDisplayName + ' ID:' + creatorUid) : 'System';

            let geopositionVal = "N/A";
            if (disc.location && typeof disc.location.latitude === 'number' && typeof disc.location.longitude === 'number') {
              const lat = disc.location.latitude;
              const lon = disc.location.longitude;
              const dist = disc.affection_distance !== undefined ? disc.affection_distance : 0;
              geopositionVal = `${lat.toFixed(4)}, ${lon.toFixed(4)}<br>± ${dist} km`;
            }

            const firstMsgText = messages.length > 0 ? messages[0].text : (disc.description || "Active civic discussion thread for community coordination.");

            const topicData = {
              name: disc.topic,
              creatorName: creatorName,
              description: firstMsgText,
              geoposition: geopositionVal,
              counter: `${messages.length} messages`,
              deadline: disc.ends || "Ongoing",
              relevance: userRelevance,
              isrScore: userIsr,
              relevanceWeights: relevanceWeights,
              isrWeights: isrWeights,
              options: disc.options_v2 || [],
              messages: messages,
              participants: combinedUids,
              expertiseDepth: disc.expertise_depth || "None"
            };

            modalBody.innerHTML = renderChatTopic(topicData);
            bindDetailViewButtons(titleText, disc, true);

            // 1. Bind Parent Message Link Scrolling & Flashing
            modalBody.querySelectorAll('.parent-link').forEach(link => {
              link.addEventListener('click', function(e) {
                e.preventDefault();
                const parentId = parseInt(this.getAttribute('data-parent-id'));
                const targetCard = modalBody.querySelector('#msg-' + parentId);
                if (targetCard) {
                  targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  
                  // Flash Highlight Animation
                  targetCard.classList.remove('highlighted');
                  void targetCard.offsetWidth; // Force reflow to restart CSS animation
                  targetCard.classList.add('highlighted');
                }
              });
            });

            // 2. Bind Live Reply Actions
            const sendBtn = modalBody.querySelector('.topic-send-btn');
            const inputEl = modalBody.querySelector('.topic-detail-block input');

            const replyButtons = modalBody.querySelectorAll('.reply-btn');
            replyButtons.forEach(btn => {
              btn.addEventListener('click', function(e) {
                e.preventDefault();
                const msgId = this.getAttribute('data-msg-id');
                const author = this.getAttribute('data-author');

                replyToMsgId = parseInt(msgId);
                if (inputEl) {
                  inputEl.placeholder = "Reply to " + author + "...";
                  inputEl.focus();
                }
              });
            });



            if (sendBtn && inputEl) {
              sendBtn.onclick = async function() {
                const text = inputEl.value.trim();
                if (!text) return;

                try {
                  const newMsg = {
                    uid: currentUserId,
                    text: text,
                    timestamp: new Date().toISOString(),
                    marks: []
                  };
                  if (replyToMsgId !== null) {
                    newMsg.parentID = replyToMsgId;
                  }

                  const batch = db.batch();
                  const newMsgRef = db.collection("discussions").doc(topicId).collection("messages").doc();
                  batch.set(newMsgRef, newMsg);

                  const discRef = db.collection("discussions").doc(topicId);
                  batch.update(discRef, {
                    message_count: firebase.firestore.FieldValue.increment(1),
                    last_message_sender_name: window.userCache[currentUserId] || 'User',
                    last_message_sender_uid: currentUserId,
                    last_message_text: text,
                    last_message_timestamp: new Date().toISOString()
                  });

                  await batch.commit();

                  inputEl.value = "";
                  inputEl.placeholder = "Write a message...";
                  replyToMsgId = null;
                } catch (err) {
                  console.error("Error sending message:", err);
                }
              };

              inputEl.onkeydown = function(e) {
                if (e.key === 'Enter') {
                  sendBtn.click();
                }
              };
            }

            // 3. Bind Reaction Toggle Buttons
            modalBody.querySelectorAll('.react-toggle-btn').forEach(btn => {
              btn.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Close all other reaction menus first
                modalBody.querySelectorAll('.reaction-menu').forEach(menu => {
                  if (menu !== this.nextElementSibling) {
                    menu.hidden = true;
                  }
                });

                const menu = this.nextElementSibling;
                if (menu) {
                  menu.hidden = !menu.hidden;
                }
              });
            });

            // 4. Bind Reaction Menu item clicks
            modalBody.querySelectorAll('.reaction-choice-btn').forEach(btn => {
              btn.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();
                const msgId = this.getAttribute('data-msg-id');
                const reactionType = this.getAttribute('data-reaction');
                if (!msgId || !reactionType) return;

                // Close the menu immediately
                const menu = this.closest('.reaction-menu');
                if (menu) menu.hidden = true;

                await toggleReaction(msgId, reactionType);
              });
            });

            // 5. Bind Proposal option details modal and creation modal
            bindProposalInteractions(disc, topicId);

            // 6. Bind chat metadata card click handlers
            bindChatMetaButtons(disc);

            // 7. Refresh open sub-modal if one is active
            refreshOpenModal();

          } finally {
            isRendering = false;
            if (pendingRender) {
              pendingRender = false;
              updateUI();
            }
          }
        }



        async function toggleReaction(msgId, reactionType) {
          const currentUserId = safeGetStorage('userId');
          if (!currentUserId) return;

          if (msgId.startsWith('opt_')) {
            let optionId = msgId;
            if (msgId.startsWith('opt_opt_')) {
              optionId = msgId.substring(4);
            }
            const docRef = db.collection("discussions").doc(topicId);

            try {
              await db.runTransaction(async (transaction) => {
                const doc = await transaction.get(docRef);
                if (!doc.exists) return;

                const data = doc.data();
                let options = data.options_v2 || [];

                options = options.map(opt => {
                  if (opt.id === optionId) {
                    let marks = opt.marks || [];
                    const userMarks = marks.filter(m => (m.uid || '').toString() === currentUserId.toString());
                    const userMarkTypes = userMarks.map(m => (m.type || m.reaction || '').toLowerCase().trim());
                    const existingIndex = userMarkTypes.indexOf(reactionType);

                    if (existingIndex >= 0) {
                      marks = marks.filter(m => !((m.uid || '').toString() === currentUserId.toString() && (m.type || m.reaction || '').toLowerCase().trim() === reactionType));
                    } else {
                      if (userMarkTypes.length >= 2) {
                        alert("You can only leave up to 2 different reactions per option.");
                        return opt;
                      }
                      marks.push({
                        uid: currentUserId,
                        type: reactionType,
                        reaction: reactionType
                      });
                    }
                    return { ...opt, marks: marks };
                  }
                  return opt;
                });

                transaction.update(docRef, { options_v2: options });
              });
            } catch (err) {
              console.error("Error toggling option reaction:", err);
            }
          } else if (msgId.startsWith('task_')) {
            const taskIdx = parseInt(msgId.substring(5));
            const docRef = db.collection("issues").doc(topicId);

            try {
              await db.runTransaction(async (transaction) => {
                const doc = await transaction.get(docRef);
                if (!doc.exists) return;

                const data = doc.data();
                const tasks = data.tasks || [];
                if (!tasks[taskIdx]) return;

                let marks = tasks[taskIdx].marks || [];
                const userMarks = marks.filter(m => (m.uid || '').toString() === currentUserId.toString());
                const userMarkTypes = userMarks.map(m => (m.type || m.reaction || '').toLowerCase().trim());
                const existingIndex = userMarkTypes.indexOf(reactionType);

                if (existingIndex >= 0) {
                  marks = marks.filter(m => !((m.uid || '').toString() === currentUserId.toString() && (m.type || m.reaction || '').toLowerCase().trim() === reactionType));
                } else {
                  if (userMarkTypes.length >= 2) {
                    alert("You can only leave up to 2 different reactions per task.");
                    return;
                  }
                  marks.push({
                    uid: currentUserId,
                    type: reactionType,
                    reaction: reactionType
                  });
                }
                tasks[taskIdx].marks = marks;

                transaction.update(docRef, { tasks: tasks });
              });
            } catch (err) {
              console.error("Error toggling task reaction:", err);
            }
          } else if (msgId.startsWith('taskcomment_')) {
            if (msgId.startsWith('taskcomment_subtaskcomment_')) {
              const parts = msgId.split('_');
              const taskIdx = parseInt(parts[2], 10);
              const subtaskIdx = parseInt(parts[3], 10);
              const commentId = parts.slice(4).join('_');
              const docRef = db.collection("issues").doc(topicId);

              try {
                await db.runTransaction(async (transaction) => {
                  const doc = await transaction.get(docRef);
                  if (!doc.exists) return;

                  const data = doc.data();
                  const tasks = data.tasks || [];
                  if (!tasks[taskIdx]) return;

                  const subtasks = tasks[taskIdx].subtasks || [];
                  if (!subtasks[subtaskIdx]) return;

                  let comments = subtasks[subtaskIdx].comments || [];
                  comments = comments.map(c => {
                    if (c.id === commentId) {
                      let marks = c.marks || [];
                      const userMarks = marks.filter(m => (m.uid || '').toString() === currentUserId.toString());
                      const userMarkTypes = userMarks.map(m => (m.type || m.reaction || '').toLowerCase().trim());
                      const existingIndex = userMarkTypes.indexOf(reactionType);

                      if (existingIndex >= 0) {
                        marks = marks.filter(m => !((m.uid || '').toString() === currentUserId.toString() && (m.type || m.reaction || '').toLowerCase().trim() === reactionType));
                      } else {
                        if (userMarkTypes.length >= 2) {
                          alert("You can only leave up to 2 different reactions per comment.");
                          return c;
                        }
                        marks.push({
                          uid: currentUserId,
                          type: reactionType,
                          reaction: reactionType
                        });
                      }
                      return { ...c, marks: marks };
                    }
                    return c;
                  });
                  subtasks[subtaskIdx].comments = comments;

                  transaction.update(docRef, { tasks: tasks });
                });
              } catch (err) {
                console.error("Error toggling subtask comment reaction:", err);
              }
            } else {
              const parts = msgId.split('_');
              const taskIdx = parseInt(parts[1], 10);
              const commentId = parts.slice(2).join('_');
              const docRef = db.collection("issues").doc(topicId);

              try {
                await db.runTransaction(async (transaction) => {
                  const doc = await transaction.get(docRef);
                  if (!doc.exists) return;

                  const data = doc.data();
                  const tasks = data.tasks || [];
                  if (!tasks[taskIdx]) return;

                  let comments = tasks[taskIdx].comments || [];
                  comments = comments.map(c => {
                    if (c.id === commentId) {
                      let marks = c.marks || [];
                      const userMarks = marks.filter(m => (m.uid || '').toString() === currentUserId.toString());
                      const userMarkTypes = userMarks.map(m => (m.type || m.reaction || '').toLowerCase().trim());
                      const existingIndex = userMarkTypes.indexOf(reactionType);

                      if (existingIndex >= 0) {
                        marks = marks.filter(m => !((m.uid || '').toString() === currentUserId.toString() && (m.type || m.reaction || '').toLowerCase().trim() === reactionType));
                      } else {
                        if (userMarkTypes.length >= 2) {
                          alert("You can only leave up to 2 different reactions per comment.");
                          return c;
                        }
                        marks.push({
                          uid: currentUserId,
                          type: reactionType,
                          reaction: reactionType
                        });
                      }
                      return { ...c, marks: marks };
                    }
                    return c;
                  });
                  tasks[taskIdx].comments = comments;

                  transaction.update(docRef, { tasks: tasks });
                });
              } catch (err) {
                console.error("Error toggling task comment reaction:", err);
              }
            }
          } else if (msgId.startsWith('subtask_')) {
            const parts = msgId.split('_');
            const taskIdx = parseInt(parts[1], 10);
            const subtaskIdx = parseInt(parts[2], 10);
            const docRef = db.collection("issues").doc(topicId);

            try {
              await db.runTransaction(async (transaction) => {
                const doc = await transaction.get(docRef);
                if (!doc.exists) return;

                const data = doc.data();
                const tasks = data.tasks || [];
                if (!tasks[taskIdx]) return;

                const subtasks = tasks[taskIdx].subtasks || [];
                if (!subtasks[subtaskIdx]) return;

                let marks = subtasks[subtaskIdx].marks || [];
                const userMarks = marks.filter(m => (m.uid || '').toString() === currentUserId.toString());
                const userMarkTypes = userMarks.map(m => (m.type || m.reaction || '').toLowerCase().trim());
                const existingIndex = userMarkTypes.indexOf(reactionType);

                if (existingIndex >= 0) {
                  marks = marks.filter(m => !((m.uid || '').toString() === currentUserId.toString() && (m.type || m.reaction || '').toLowerCase().trim() === reactionType));
                } else {
                  if (userMarkTypes.length >= 2) {
                    alert("You can only leave up to 2 different reactions per subtask.");
                    return;
                  }
                  marks.push({
                    uid: currentUserId,
                    type: reactionType,
                    reaction: reactionType
                  });
                }
                subtasks[subtaskIdx].marks = marks;

                transaction.update(docRef, { tasks: tasks });
              });
            } catch (err) {
              console.error("Error toggling subtask reaction:", err);
            }
          } else {
            const msgRef = db.collection("discussions").doc(topicId).collection("messages").doc(msgId.toString());

            try {
              await db.runTransaction(async (transaction) => {
                const doc = await transaction.get(msgRef);
                if (!doc.exists) return;

                const data = doc.data();
                let marks = data.marks || [];

                const userMarks = marks.filter(m => (m.uid || '').toString() === currentUserId.toString());
                const userMarkTypes = userMarks.map(m => {
                  if (typeof m === 'string') return m.toLowerCase().trim();
                  return (m.reaction || m.type || m.mark || m.label || m.value || '').toLowerCase().trim();
                });

                const existingIndex = userMarkTypes.indexOf(reactionType);

                if (existingIndex >= 0) {
                  marks = marks.filter(m => {
                    const mUid = (m.uid || '').toString();
                    const mVal = (typeof m === 'string' ? m : (m.reaction || m.type || m.mark || m.label || m.value || '')).toLowerCase().trim();
                    return !(mUid === currentUserId.toString() && mVal === reactionType);
                  });
                } else {
                  if (userMarkTypes.length >= 2) {
                    alert("You can only leave up to 2 different reactions per message.");
                    return;
                  }

                  marks.push({
                    uid: currentUserId,
                    type: reactionType,
                    reaction: reactionType,
                    mark: reactionType
                  });
                }

                transaction.update(msgRef, { marks: marks });
              });
            } catch (err) {
              console.error("Error toggling message reaction:", err);
            }
          }
        }

        const discRef = db.collection("discussions").doc(topicId);

        // 1. Subscribe to discussion document changes
        const discUnsubscribe = discRef.onSnapshot(async (discDoc) => {
          if (!discDoc.exists) {
            modalBody.innerHTML = '<div style="padding:20px; color:var(--urgent);">Discussion thread not found in database.</div>';
            return;
          }
          currentDiscData = discDoc.data();
          await updateUI();
        }, (err) => {
          console.error("Discussion listener error:", err);
        });

        // 2. Subscribe to messages changes
        const messagesUnsubscribe = discRef.collection("messages").orderBy("timestamp", "asc")
          .onSnapshot(async (snap) => {
            const rawMessages = [];
            snap.forEach(mDoc => {
              rawMessages.push(mDoc.data());
            });
            currentMessagesRaw = rawMessages;
            await updateUI();
          }, (err) => {
            console.error("Messages listener error:", err);
          });

        activeDetailListener = () => {
          if (discUnsubscribe) discUnsubscribe();
          if (messagesUnsubscribe) messagesUnsubscribe();
        };

      } catch (err) {
        console.error("Load discussion failed:", err);
        modalBody.innerHTML = `<div style="padding:20px; color:var(--urgent);">Error loading chat: ${err.message}</div>`;
      }

    } else if (kind === 'voting') {
      try {
        let currentIssueData = null;
        let isRendering = false;
        let pendingRender = false;

        async function updateVotingUI() {
          if (!currentIssueData || !currentDiscData) return;
          if (isRendering) {
            pendingRender = true;
            return;
          }
          isRendering = true;

          try {
            const issue = currentIssueData;
            const disc = currentDiscData;
            
            // Use real-time synced discussions data
            const rawParticipants = disc.participants || [];
            const expertiseDepth = disc.expertise_depth || "None";
            const relevanceScores = disc.relevance_scores || {};

            // Fetch messages for the previous discussion
            let messages = [];
            try {
              const msgsSnap = await db.collection("discussions").doc(topicId).collection("messages").orderBy("timestamp", "asc").get();
              msgsSnap.forEach(doc => {
                messages.push(Object.assign({ id: doc.id }, doc.data()));
              });
            } catch (err) {
              console.error("Error fetching messages for voting topic:", err);
            }

            // Resolve names for all uids
            const uidsToResolve = new Set();
            if (issue.submitter_id) uidsToResolve.add(issue.submitter_id.toString());
            
            const uniqueUids = rawParticipants.map(uid => uid.toString()).filter(uid => uid && uid !== 'system');
            const msgUids = messages.map(m => m.uid.toString()).filter(uid => uid && uid !== 'system');
            const combinedUids = Array.from(new Set(uniqueUids.concat(msgUids)));

            combinedUids.forEach(uid => uidsToResolve.add(uid.toString()));
            messages.forEach(msg => {
              if (msg.uid && msg.uid !== 'system') {
                uidsToResolve.add(msg.uid.toString());
              }
            });

            await resolveUserNames(Array.from(uidsToResolve));

            // Map messages with author display names
            messages.forEach(msg => {
              msg.author = window.userCache[msg.uid] || ('User ' + msg.uid);
            });

            // Get user relevance from relevanceScores map or member list fallback
            const currentUserId = safeGetStorage('userId');
            let userRelevance = "N/A";
            let userIsr = "N/A";

            // Load microcommunity member data for logged-in user if not already cached
            if (!cachedMemberData && currentUserId) {
              try {
                let mcId = topicId;
                const mcSnap = await db.collection("microcommunities")
                  .where("issue_id", "==", topicId)
                  .limit(1)
                  .get();
                mcSnap.forEach(doc => {
                  mcId = doc.id;
                });
                
                if (mcId) {
                  const memberDoc = await db.collection("microcommunity_members")
                    .doc(mcId + '_' + currentUserId)
                    .get();
                  if (memberDoc.exists) {
                    cachedMemberData = memberDoc.data();
                  }
                }
              } catch (err) {
                console.error("Error loading user microcommunity member data for voting:", err);
              }
            }

            const isrScoresMap = disc ? (disc.isr_scores || {}) : (issue.isr_scores || {});

            if (currentUserId) {
              const uidStr = currentUserId.toString();
              if (relevanceScores[uidStr] !== undefined) {
                const score = relevanceScores[uidStr];
                userRelevance = (score * 100).toFixed(0) + "%";
                if (isrScoresMap[uidStr] !== undefined) {
                  userIsr = isrScoresMap[uidStr].toFixed(2);
                } else {
                  userIsr = (score * 1.5).toFixed(2);
                }
              } else if (cachedMemberData) {
                userRelevance = (cachedMemberData.relevance_score * 100).toFixed(0) + "%";
                if (cachedMemberData.isr_score !== undefined) {
                  userIsr = cachedMemberData.isr_score.toFixed(2);
                } else {
                  userIsr = (cachedMemberData.relevance_score * 1.5).toFixed(2);
                }
              }
            }

            const relevanceWeights = formatRelevanceWeights(issue);
            const isrWeights = formatIsrWeights(issue);

            // Map options and calculate scores dynamically based on the votes map
            const userVotesMap = issue.votes || {};

            // Fetch scores dynamically for any voters not in isrScoresMap
            const votersToFetch = [];
            for (const uid in userVotesMap) {
              if (isrScoresMap[uid] === undefined) {
                votersToFetch.push(uid);
              }
            }

            const extraScores = {};
            if (votersToFetch.length > 0) {
              let mcId = topicId;
              try {
                const memberDocs = await Promise.all(
                  votersToFetch.map(uid => 
                    db.collection("microcommunity_members").doc(mcId + '_' + uid).get()
                  )
                );
                memberDocs.forEach((mDoc, idx) => {
                  const uid = votersToFetch[idx];
                  if (mDoc.exists) {
                    const mData = mDoc.data();
                    extraScores[uid] = mData.isr_score !== undefined ? mData.isr_score : (mData.relevance_score * 1.5);
                  } else {
                    const uidStr = uid.toString();
                    if (relevanceScores[uidStr] !== undefined) {
                      extraScores[uid] = relevanceScores[uidStr] * 1.5;
                    }
                  }
                });
              } catch (err) {
                console.error("Error fetching extra voter scores:", err);
              }
            }

            // Calculate current option scores based on votes in Firestore
            let baseOptions = [];
            if (disc && disc.options_v2 && disc.options_v2.length > 0) {
              baseOptions = disc.options_v2.map(opt => ({
                label: opt.title,
                score: 0,
                author_name: opt.author_name || "System",
                budget: opt.budget || "N/A",
                description: opt.description || []
              }));
            } else if (issue.options && issue.options.length > 0) {
              baseOptions = issue.options.map(opt => ({
                label: opt.label || opt.title,
                score: 0,
                author_name: opt.author_name || "System",
                budget: opt.budget || "N/A",
                description: opt.description || []
              }));
            } else {
              baseOptions = [
                { label: "Proceed with proposed fix", score: 0, author_name: "System", budget: "N/A", description: [] },
                { label: "Reject proposal", score: 0, author_name: "System", budget: "N/A", description: [] },
                { label: "Request more details", score: 0, author_name: "System", budget: "N/A", description: [] }
              ];
            }

            // Sum up ISR scores for each option
            baseOptions.forEach((opt, idx) => {
              let sum = 0;
              for (const uid in userVotesMap) {
                if (Number(userVotesMap[uid]) === idx) {
                  let score = 0;
                  if (isrScoresMap[uid] !== undefined) {
                    score = parseFloat(isrScoresMap[uid]) || 0;
                  } else if (extraScores[uid] !== undefined) {
                    score = parseFloat(extraScores[uid]) || 0;
                  } else if (uid.toString() === currentUserId.toString()) {
                    score = parseFloat(userIsr) || 0;
                  }
                  sum += score;
                }
              }
              opt.score = parseFloat(sum.toFixed(2));
            });

            const topicData = {
              name: issue.title,
              description: issue.description || (messages.length > 0 ? messages[0].text : ""),
              status: issue.status || "Voting",
              statusText: `This issue is in status: ${issue.status || 'Voting'}.`,
              counter: `Submitter: ${window.userCache[issue.submitter_id] || issue.submitter_id}`,
              deadline: issue.ends || "Active",
              relevance: userRelevance,
              isrScore: userIsr,
              relevanceWeights: relevanceWeights,
              isrWeights: isrWeights,
              participants: combinedUids,
              expertiseDepth: expertiseDepth,
              options: baseOptions,
              messages: messages
            };

            // Render topic detailed HTML
            modalBody.innerHTML = renderVotingTopic(topicData);
            bindDetailViewButtons(titleText, disc);
            bindChatMetaButtons(disc);

            // Bind discussion toggle button click handler
            const discussionToggleBtn = modalBody.querySelector('.voting-discussion-toggle-btn');
            const discussionContainer = modalBody.querySelector('.voting-discussion-container');
            if (discussionToggleBtn && discussionContainer) {
              discussionToggleBtn.onclick = function() {
                if (discussionContainer.style.display === 'none') {
                  discussionContainer.style.display = 'block';
                  discussionToggleBtn.textContent = 'Hide Discussion';
                } else {
                  discussionContainer.style.display = 'none';
                  discussionToggleBtn.textContent = 'Discussion';
                }
              };
            }

            // Setup dynamic Lock-in Vote button states
            const voteSubmitBtn = modalBody.querySelector('.topic-detail-actions-right button:nth-child(2)');
            const radioOptions = modalBody.querySelectorAll('input[name="voting-option"]');
            
            const initialUserChoice = userVotesMap[currentUserId];
            
            // Set initial selected radio
            if (initialUserChoice !== undefined) {
              const selectedRadio = modalBody.querySelector(`input[name="voting-option"][value="${initialUserChoice}"]`);
              if (selectedRadio) {
                selectedRadio.checked = true;
              }
            }

            const updateVoteButtonState = () => {
              if (!voteSubmitBtn) return;
              const selectedRadio = modalBody.querySelector('input[name="voting-option"]:checked');
              if (!selectedRadio) {
                voteSubmitBtn.disabled = true;
              } else {
                const selectedVal = Number(selectedRadio.value);
                if (initialUserChoice !== undefined && selectedVal === Number(initialUserChoice)) {
                  voteSubmitBtn.disabled = true; // prevent double vote submission for identical choice
                } else {
                  voteSubmitBtn.disabled = false;
                }
              }
            };

            updateVoteButtonState();

            radioOptions.forEach(radio => {
              radio.addEventListener('change', updateVoteButtonState);
            });

            if (voteSubmitBtn) {
              voteSubmitBtn.className = 'voting-vote-btn';
              voteSubmitBtn.onclick = async function() {
                const selectedRadio = modalBody.querySelector('input[name="voting-option"]:checked');
                if (!selectedRadio) return;

                const selectedIndex = Number(selectedRadio.value);
                if (selectedIndex === -1) return;

                // Submit vote transaction
                const issueRef = db.collection("issues").doc(topicId);
                try {
                  await db.runTransaction(async (transaction) => {
                    const iDoc = await transaction.get(issueRef);
                    if (!iDoc.exists) return;
                    const iData = iDoc.data();
                    const votes = iData.votes || {};

                    // Assign vote (fixed voting, no toggle off)
                    votes[currentUserId] = selectedIndex;

                    transaction.update(issueRef, { votes: votes });
                  });
                  console.log("Vote submitted successfully.");
                } catch (err) {
                  console.error("Failed to submit vote:", err);
                  alert("Failed to submit vote: " + err.message);
                }
              };
            }

            // Refresh open sub-modal if one is active
            refreshOpenModal();

          } catch (err) {
            console.error("Render voting detail UI failed:", err);
          } finally {
            isRendering = false;
            if (pendingRender) {
              pendingRender = false;
              updateVotingUI();
            }
          }
        }

        const discUnsubscribe = db.collection("discussions").doc(topicId).onSnapshot(doc => {
          if (doc.exists) {
            currentDiscData = doc.data();
            updateVotingUI();
          }
        }, err => {
          console.error("Listen to discussion details in voting failed:", err);
        });

        const issueUnsubscribe = db.collection("issues").doc(topicId).onSnapshot(doc => {
          if (!doc.exists) {
            modalBody.innerHTML = '<div style="padding:20px; color:var(--urgent);">Voting issue not found.</div>';
            return;
          }
          currentIssueData = doc.data();
          updateVotingUI();
        }, err => {
          console.error("Listen to issue details failed:", err);
        });

        activeDetailListener = () => {
          if (issueUnsubscribe) issueUnsubscribe();
          if (discUnsubscribe) discUnsubscribe();
        };

      } catch (err) {
        console.error("Load issue failed:", err);
        modalBody.innerHTML = `<div style="padding:20px; color:var(--urgent);">Error loading voting: ${err.message}</div>`;
      }

    } else if (kind === 'tasks') {
      try {
        let currentMessagesRaw = null;
        let currentIssueRaw = null;
        let currentDiscRaw = null;
        let isRendering = false;
        let pendingRender = false;

        async function updateTasksUI() {
          if (!currentIssueRaw) return;
          if (isRendering) {
            pendingRender = true;
            return;
          }
          isRendering = true;

          try {
            const issue = currentIssueRaw;
            const discData = currentDiscRaw;
            const messages = currentMessagesRaw || [];

            let rawParticipants = [];
            let expertiseDepth = "None";
            let relevanceScores = {};
            if (discData) {
              rawParticipants = discData.participants || [];
              expertiseDepth = discData.expertise_depth || "None";
              relevanceScores = discData.relevance_scores || {};
            }

            const comments = issue.comments || [];
            const commentUids = comments.map(c => (c.uid || '').toString()).filter(uid => uid && uid !== 'system');
            const uniqueUids = rawParticipants.map(uid => uid.toString()).filter(uid => uid && uid !== 'system');
            const msgUids = messages.map(m => (m.uid || '').toString()).filter(uid => uid && uid !== 'system');
            const subtaskUids = [];
            (issue.tasks || []).forEach(t => {
              (t.subtasks || []).forEach(st => {
                if (st.in_charge_uid) subtaskUids.push(st.in_charge_uid.toString());
                (st.comments || []).forEach(sc => {
                  if (sc.uid) subtaskUids.push(sc.uid.toString());
                });
              });
            });
            const combinedUids = Array.from(new Set(uniqueUids.concat(commentUids).concat(msgUids).concat(subtaskUids)));

            const uidsToResolve = new Set();
            if (issue.submitter_id) uidsToResolve.add(issue.submitter_id.toString());
            combinedUids.forEach(uid => uidsToResolve.add(uid.toString()));
            await resolveUserNames(Array.from(uidsToResolve));

            const currentUserId = safeGetStorage('userId');
            let userRelevance = "N/A";
            let userIsr = "N/A";

            if (!cachedMemberData && currentUserId) {
              try {
                let mcSnap = await db.collection("microcommunities")
                  .where("issue_id", "==", topicId)
                  .limit(1)
                  .get();
                let mcId = topicId;
                mcSnap.forEach(doc => { mcId = doc.id; });
                if (mcId) {
                  const memberDoc = await db.collection("microcommunity_members")
                    .doc(mcId + '_' + currentUserId)
                    .get();
                  if (memberDoc.exists) {
                    cachedMemberData = memberDoc.data();
                  }
                }
              } catch (e) {
                console.error("Error loading member data:", e);
              }
            }

            const isrScoresMap = discData ? (discData.isr_scores || {}) : (issue.isr_scores || {});
            if (currentUserId) {
              const uidStr = currentUserId.toString();
              if (relevanceScores[uidStr] !== undefined) {
                const score = relevanceScores[uidStr];
                userRelevance = (score * 100).toFixed(0) + "%";
                userIsr = isrScoresMap[uidStr] !== undefined ? isrScoresMap[uidStr].toFixed(2) : (score * 1.5).toFixed(2);
              } else if (cachedMemberData) {
                userRelevance = (cachedMemberData.relevance_score * 100).toFixed(0) + "%";
                userIsr = cachedMemberData.isr_score !== undefined ? cachedMemberData.isr_score.toFixed(2) : (cachedMemberData.relevance_score * 1.5).toFixed(2);
              }
            }

            const relevanceWeights = formatRelevanceWeights(issue);
            const isrWeights = formatIsrWeights(issue);

            const topicData = {
              name: issue.title,
              description: issue.description,
              status: issue.status || "In progress",
              counter: `Submitter: ${issue.submitter_id}`,
              deadline: issue.ends || "Active",
              relevance: userRelevance,
              isrScore: userIsr,
              relevanceWeights: relevanceWeights,
              isrWeights: isrWeights,
              participants: combinedUids,
              expertiseDepth: expertiseDepth,
              tasks: issue.tasks || [],
              comments: comments,
              options: issue.options || [],
              winning_option_index: issue.winning_option_index !== undefined ? issue.winning_option_index : null,
              messages: messages
            };

            currentDiscData = discData || issue; // For deadline modal, etc.

            modalBody.innerHTML = renderTasksTopic(topicData);
            bindDetailViewButtons(titleText, discData || issue);
            bindChatMetaButtons(discData || issue);
            bindTaskModalInteractions(topicId, issue);

            // Bind discussion and other options toggle buttons click handlers
            const discussionToggleBtn = modalBody.querySelector('.tasks-discussion-toggle-btn');
            const discussionContainer = modalBody.querySelector('.tasks-discussion-container');
            if (discussionToggleBtn && discussionContainer) {
              discussionToggleBtn.onclick = function() {
                discussionContainer.style.display = discussionContainer.style.display === 'none' ? 'block' : 'none';
                discussionToggleBtn.textContent = discussionContainer.style.display === 'block' ? 'Hide Discussion' : 'Discussion';
              };
            }

            const otherOptionsToggleBtn = modalBody.querySelector('.tasks-other-options-toggle-btn');
            const otherOptionsContainer = modalBody.querySelector('.tasks-other-options-container');
            if (otherOptionsToggleBtn && otherOptionsContainer) {
              otherOptionsToggleBtn.onclick = function() {
                otherOptionsContainer.style.display = otherOptionsContainer.style.display === 'none' ? 'block' : 'none';
                otherOptionsToggleBtn.textContent = otherOptionsContainer.style.display === 'block' ? 'Hide other options' : 'Other options';
              };
            }

            // Refresh open sub-modal if one is active
            refreshOpenModal();

          } catch (e) {
            console.error("Render tasks detail UI failed:", e);
          } finally {
            isRendering = false;
            if (pendingRender) {
              pendingRender = false;
              updateTasksUI();
            }
          }
        }

        // Fetch messages once
        let messages = [];
        const msgsSnap = await db.collection("discussions").doc(topicId).collection("messages").orderBy("timestamp", "asc").get();
        msgsSnap.forEach(doc => {
          messages.push(Object.assign({ id: doc.id }, doc.data()));
        });
        currentMessagesRaw = messages;

        // Sync discussions onSnapshot
        const discUnsubscribe = db.collection("discussions").doc(topicId).onSnapshot(doc => {
          if (doc.exists) {
            currentDiscRaw = doc.data();
            updateTasksUI();
          }
        });

        // Sync issues onSnapshot
        const issueUnsubscribe = db.collection("issues").doc(topicId).onSnapshot(doc => {
          if (!doc.exists) {
            modalBody.innerHTML = '<div style="padding:20px; color:var(--urgent);">Task issue not found.</div>';
            return;
          }
          currentIssueRaw = doc.data();
          updateTasksUI();
        });

        activeDetailListener = () => {
          if (issueUnsubscribe) issueUnsubscribe();
          if (discUnsubscribe) discUnsubscribe();
        };

      } catch (err) {
        console.error("Load tasks failed:", err);
        modalBody.innerHTML = `<div style="padding:20px; color:var(--urgent);">Error loading tasks: ${err.message}</div>`;
      }
    }
  }

  function renderChatCreateView(sourceViewHtml, titleText) {
    modalBody.setAttribute('data-topic-detail-open', '1');
    modalBody.setAttribute('data-topic-source-kind', 'chat-create');
    modalBody.setAttribute('data-topic-source-title', titleText || '');
    modalBody.__sourceViewHtml = sourceViewHtml || modalBody.innerHTML;
    modalBody.__restoreView = restoreTopicListView;
    modalBody.innerHTML = renderChatCreate();
    
    bindDetailViewButtons(titleText);

    // Bind Create & AI elements
    const createBtn = modalBody.querySelector('.topic-detail-actions-right button:last-child');
    const titleInput = modalBody.querySelector('.topic-form-field input');
    const descTextarea = modalBody.querySelector('.topic-form-textarea');
    
    const aiInput = modalBody.querySelector('.topic-ai-panel input');
    const aiSendBtn = modalBody.querySelector('.topic-ai-panel button');
    const aiMsgContainer = modalBody.querySelector('.topic-ai-panel .ai-msg');
    
    let suggestedParams = null;
    const functionsBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://127.0.0.1:5001/project-a3d59130-5adf-4677-9e2/us-central1'
      : `https://us-central1-project-a3d59130-5adf-4677-9e2.cloudfunctions.net`;
    
    if (aiSendBtn && aiInput && aiMsgContainer) {
      aiSendBtn.addEventListener('click', async () => {
        const text = aiInput.value.trim();
        if (!text) return;
        
        aiMsgContainer.textContent = "Analyzing issue scale and relevance parameters with AI...";
        try {
          const res = await fetch(`${functionsBaseUrl}/analyzeIssue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: text })
          });
          const data = await res.json();
          if (data.error) {
            aiMsgContainer.textContent = `Error: ${data.error}`;
          } else {
            suggestedParams = data;
            aiMsgContainer.innerHTML = `
              <strong>AI Suggestions:</strong><br>
              📁 Suggested Category: <code>${data.category}</code><br>
              📍 Impact Radius (μ): <code>${data.mu}m</code>, Decay (σ): <code>${data.sigma}m</code><br>
              ⚖️ Weights: D:${(data.weights.w_D*100).toFixed(0)}%, G:${(data.weights.w_G*100).toFixed(0)}%, S:${(data.weights.w_S*100).toFixed(0)}%, X:${(data.weights.w_X*100).toFixed(0)}%<br>
              👥 Target: Age ${data.demographics.minAge || 0}-${data.demographics.maxAge || 100}, Job: ${data.demographics.employmentStatus || 'Any'}<br>
              <button type="button" class="apply-ai-btn" style="margin-top: 8px; padding: 4px 8px; font-size: 0.8rem; border-radius: 6px; cursor:pointer;">Apply suggestions to form</button>
            `;
            
            aiMsgContainer.querySelector('.apply-ai-btn').addEventListener('click', () => {
              if (titleInput) {
                titleInput.value = text.slice(0, 40) + "...";
              }
              if (descTextarea) {
                descTextarea.value = text;
              }
            });
          }
        } catch (err) {
          aiMsgContainer.textContent = `Error analyzing: ${err.message}`;
        }
      });
    }
    
    if (createBtn) {
      createBtn.addEventListener('click', async () => {
        const title = titleInput.value.trim();
        const description = descTextarea.value.trim();
        if (!title || !description) {
          alert("Please specify both Title and Description.");
          return;
        }
        
        createBtn.disabled = true;
        createBtn.textContent = "Creating community...";
        
        try {
          const currentUserId = safeGetStorage('userId') || "1";
          const payload = {
            title,
            description,
            location: [47.553832, 7.606599], // Basel Swiss coordinates matching users location center
            submitterId: currentUserId,
            category: suggestedParams ? suggestedParams.category : "building.maintenance.general",
            mu: suggestedParams ? suggestedParams.mu : 100,
            sigma: suggestedParams ? suggestedParams.sigma : 50,
            weights: suggestedParams ? suggestedParams.weights : { w_D: 0.2, w_G: 0.6, w_S: 0.1, w_X: 0.1 },
            demographics: suggestedParams ? suggestedParams.demographics : { employmentStatus: "any", familyStatus: "any" }
          };
          
          const res = await fetch(`${functionsBaseUrl}/createIssue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const result = await res.json();
          
          if (result.success) {
            alert(`Issue registered successfully!\nMicrocommunity of ${result.members_count} members formed.`);
            restoreTopicListView();
          } else {
            alert(`Error: ${result.error || "Failed to create issue"}`);
            createBtn.disabled = false;
            createBtn.textContent = "Create";
          }
        } catch (err) {
          alert(`Error: ${err.message}`);
          createBtn.disabled = false;
          createBtn.textContent = "Create";
        }
      });
    }
  }

  function restoreTopicListView() {
    if (activeDetailListener) {
      activeDetailListener();
      activeDetailListener = null;
    }
    if (typeof modalBody.__sourceViewHtml === 'string') {
      modalBody.innerHTML = modalBody.__sourceViewHtml;
      modalBody.removeAttribute('data-topic-detail-open');
      modalBody.removeAttribute('data-active-topic-id');
      bindTopicListInteractions();
    }
  }
  
  modalBody.__restoreView = restoreTopicListView;

  function bindReactionBubbles() {
    modalBody.querySelectorAll('.reaction-bubble').forEach(function(bubble) {
      if (bubble.classList.contains('bubble-bound')) return;
      bubble.classList.add('bubble-bound');

      bubble.addEventListener('click', function(e) {
        e.stopPropagation();
        try {
          var uidsAttr = this.getAttribute('data-uids');
          var uids = uidsAttr ? uidsAttr.split(',').filter(Boolean) : [];
          
          var itemEl = this.closest('.topic-message-card, .topic-description-actions, .option-card, .task-item-card, .task-comment-card, .subtask-card-item');
          if (!itemEl) return;

          // Close any other open popups first
          document.querySelectorAll('.reaction-users-popup').forEach(function(p) { p.remove(); });

          var popup = document.createElement('div');
          popup.className = 'reaction-users-popup';
          popup.style.minWidth = '150px';

          popup.addEventListener('click', function(pe) { pe.stopPropagation(); });

          var renderNames = function() {
            popup.innerHTML = '';
            var namesList = uids.length === 0 ? ['No reactions'] : uids.map(function(uid) { return window.userCache[uid] || ('User ' + uid); });
            namesList.forEach(function(n) {
              var item = document.createElement('div');
              item.className = 'reaction-user-item';
              item.textContent = n;
              popup.appendChild(item);
            });
          };

          // Render fallback/cached names instantly
          renderNames();

          // Resolve names in background and re-render
          resolveUserNames(uids).then(function() {
            renderNames();
          });

          itemEl.appendChild(popup);
        } catch (err) {
          console.error("Error displaying reaction users:", err);
        }
      });
    });
  }

  function bindReactionMenus() {
    modalBody.querySelectorAll('.react-toggle-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var wrap = btn.closest('.reaction-wrap');
        if (!wrap) return;
        var menu = wrap.querySelector('.reaction-menu');
        if (!menu) return;
        const isHidden = menu.hidden;
        // Close all other reaction menus
        modalBody.querySelectorAll('.reaction-menu').forEach(m => m.hidden = true);
        menu.hidden = !isHidden;
      });
    });

    modalBody.querySelectorAll('.reaction-choice-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var menu = btn.closest('.reaction-menu');
        if (menu) menu.hidden = true;
      });
    });
  }

  function bindDetailViewButtons(titleText, disc, skipReactionMenus) {
    modalBody.querySelectorAll('.topic-back-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        restoreTopicListView();
        if (modalTitle && titleText) modalTitle.textContent = titleText;
      });
    });

    if (!skipReactionMenus) {
      bindReactionMenus();
      bindReactionBubbles();
    }

    // Bind Microcommunity Button clicks
    modalBody.querySelectorAll('.microcommunity-btn').forEach(btn => {
      btn.addEventListener('click', async function(e) {
        e.stopPropagation();

        const itemEl = this.closest('.topic-detail-meta-item');
        if (!itemEl) return;

        // Toggle popup: if it exists, remove it and exit
        const existing = itemEl.querySelector('.reaction-users-popup');
        if (existing) {
          existing.remove();
          return;
        }

        // Close any other open popups first
        document.querySelectorAll('.reaction-users-popup').forEach(p => p.remove());

        const uidsStr = this.getAttribute('data-uids');
        const uids = uidsStr ? uidsStr.split(',').filter(Boolean) : [];
        const topicId = modalBody.getAttribute('data-active-topic-id');

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

        let names = [];
        let mcValues = null;

        if (uids.length === 0) {
          names = ['No members'];
        } else {
          const db = firebase.firestore();
          let issueData = null;
          try {
            const issueDoc = await db.collection("issues").doc(topicId).get();
            if (issueDoc.exists) {
              issueData = issueDoc.data();
            }
          } catch (err) {
            console.error("Failed to fetch issue for voting status:", err);
          }

          let topicMessages = [];
          try {
            const msgsSnap = await db.collection("discussions").doc(topicId).collection("messages").get();
            msgsSnap.forEach(mDoc => {
              topicMessages.push(mDoc.data());
            });
          } catch (err) {
            console.error("Failed to fetch messages for activity checks:", err);
          }

          try {
            const mcDoc = await db.collection("microcommunities").doc(topicId).get();
            if (mcDoc.exists && mcDoc.data().values_taxonomy) {
              mcValues = mapTaxonomyToUserValues(mcDoc.data().values_taxonomy);
            } else {
              const dynamicTax = await calculateMicrocommunityValuesDynamic(uids, topicId);
              if (dynamicTax) {
                mcValues = mapTaxonomyToUserValues(dynamicTax);
              }
            }
          } catch (err) {
            console.error("Failed to fetch microcommunity doc:", err);
            const dynamicTax = await calculateMicrocommunityValuesDynamic(uids, topicId);
            if (dynamicTax) {
              mcValues = mapTaxonomyToUserValues(dynamicTax);
            }
          }

          await resolveUserNames(uids);
          
          // Map to objects containing score and metadata for sorting
          const memberList = uids.map(uid => {
            const displayName = window.userCache[uid] || ('User ' + uid);
            const rawScore = (disc && disc.isr_scores && disc.isr_scores[uid.toString()] !== undefined)
              ? parseFloat(disc.isr_scores[uid.toString()])
              : -1; // place N/A values at the bottom
            
            const memberUidStr = uid.toString();

            // 1. Commented
            const hasCommented = topicMessages && topicMessages.some(msg => {
              return msg.uid && msg.uid.toString() === memberUidStr && msg.uid !== 'system';
            });

            // 2. Reacted
            const hasReactedMsg = topicMessages && topicMessages.some(msg => {
              return msg.marks && msg.marks.some(m => (m.uid || '').toString() === memberUidStr);
            });
            const hasReactedOpt = disc && disc.options_v2 && disc.options_v2.some(opt => {
              return opt.marks && opt.marks.some(m => (m.uid || '').toString() === memberUidStr);
            });
            const hasReacted = hasReactedMsg || hasReactedOpt;

            // 3. Proposed/Started topic
            const startedTopic = disc && disc.creator_uid && disc.creator_uid.toString() === memberUidStr;
            const proposedOption = disc && disc.options_v2 && disc.options_v2.some(opt => {
              return opt.author_uid && opt.author_uid.toString() === memberUidStr;
            });
            const hasProposed = startedTopic || proposedOption;

            // 4. Voted
            const hasVoted = (issueData && issueData.votes && issueData.votes[memberUidStr] !== undefined) ||
                             (disc && disc.deadline_votes && disc.deadline_votes[memberUidStr] !== undefined);

            let emojisStr = '';
            if (hasCommented) emojisStr += '💬';
            if (hasReacted) emojisStr += '👍';
            if (hasProposed) emojisStr += '💡';
            if (hasVoted) emojisStr += '✅';

            if (emojisStr) emojisStr = ' ' + emojisStr;

            return {
              uid: uid,
              displayName: displayName,
              score: rawScore,
              emojisStr: emojisStr
            };
          });

          // Sort by ISR-score descending
          memberList.sort((a, b) => b.score - a.score);

          names = memberList.map(item => {
            const scoreStr = item.score >= 0 ? item.score.toFixed(2) : "N/A";
            return `${item.displayName} (id: ${item.uid}) - ${scoreStr}${item.emojisStr}`;
          });
        }

        // Create popup wrapper
        const popup = document.createElement('div');
        popup.className = 'reaction-users-popup';
        popup.style.top = '100%';
        popup.style.left = '50%';
        popup.style.transform = 'translateX(-50%)';
        popup.style.minWidth = '240px';

        // Prevent clicking inside the popup from propagating
        popup.addEventListener('click', function(pe) {
          pe.stopPropagation();
        });

        // Add small diagram of Domains
        if (mcValues && mcValues.domains) {
          const chartWrapper = document.createElement('div');
          chartWrapper.className = 'bar-chart';
          chartWrapper.style.height = '40px';
          chartWrapper.style.paddingBottom = '0px';
          chartWrapper.style.marginBottom = '8px';
          chartWrapper.style.borderBottom = '1px solid var(--border)';
          chartWrapper.style.cursor = 'pointer';
          chartWrapper.title = 'Click to view full Microcommunity Values Taxonomy';

          mcValues.domains.forEach(function(domain) {
            const group = document.createElement('div');
            group.className = 'bar-group';
            
            const bar = document.createElement('div');
            const isNull = domain.score === null || domain.score === undefined;
            const heightVal = isNull ? 100 : domain.score;
            
            bar.className = 'bar' + (isNull ? ' bar-null' : (domain.muted ? ' bar-muted' : ''));
            bar.style.height = heightVal + '%';
            
            group.appendChild(bar);
            chartWrapper.appendChild(group);
          });

          chartWrapper.addEventListener('click', function(ce) {
            ce.stopPropagation();
            window.currentUserValues = mcValues;
            const titleEl = document.getElementById('values-vector-title');
            if (titleEl) {
              titleEl.textContent = "Vector of Values (Microcommunity)";
            }
            window.openValuesVectorModal();
          });
          popup.appendChild(chartWrapper);
        }

        names.forEach(n => {
          const item = document.createElement('div');
          item.className = 'reaction-user-item';
          item.textContent = n;
          popup.appendChild(item);
        });

        itemEl.appendChild(popup);
      });
    });
  }

  function bindTaskModalInteractions(topicId, issue) {
    const currentUserId = safeGetStorage('userId');
    if (!currentUserId) return;
    
    const db = firebase.firestore();
    const docRef = db.collection("issues").doc(topicId);

    // 1. Task status checkbox change
    modalBody.querySelectorAll('.task-status-checkbox').forEach(chk => {
      chk.addEventListener('change', async function() {
        const taskIdx = parseInt(this.getAttribute('data-task-idx'));
        const tasks = issue.tasks || [];
        const task = tasks[taskIdx];
        if (!task) return;

        // Check if logged-in user is the responsible person (in_charge_uid)
        if ((task.in_charge_uid || '').toString() !== currentUserId.toString()) {
          alert("Only the responsible person (" + (task.in_charge_name || 'assigned leader') + ") can change the status of this task.");
          this.checked = !this.checked; // Reset checkbox state
          return;
        }

        try {
          await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(docRef);
            if (!doc.exists) return;
            const latestData = doc.data();
            const latestTasks = latestData.tasks || [];
            if (latestTasks[taskIdx]) {
              const currentStatus = latestTasks[taskIdx].status || 'pending';
              latestTasks[taskIdx].status = currentStatus === 'done' ? 'pending' : 'done';
              transaction.update(docRef, { tasks: latestTasks });
            }
          });
          console.log("Task status updated.");
        } catch (err) {
          console.error("Failed to update task status:", err);
          this.checked = !this.checked; // Reset on failure
        }
      });
    });

    // 1b. Task name toggle comments track
    modalBody.querySelectorAll('.task-name-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const taskIdx = this.getAttribute('data-task-idx');
        const commentsSection = modalBody.querySelector(`#task-comments-section-${taskIdx}`);
        if (commentsSection) {
          commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
        }
      });
    });

    // 1c. Task-level comment toggle button (💬 next to task)
    modalBody.querySelectorAll('.topic-inline-btn.task-comment-input-toggle-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const taskIdx = this.getAttribute('data-task-idx');
        const commentsSection = modalBody.querySelector(`#task-comments-section-${taskIdx}`);
        if (commentsSection) {
          commentsSection.style.display = 'block'; // force visible comments track
        }
        const commentForm = modalBody.querySelector(`#task-comment-form-${taskIdx}`);
        if (commentForm) {
          commentForm.style.display = commentForm.style.display === 'none' ? 'flex' : 'none';
        }
      });
    });

    // 1d. Task breakdown toggle button click
    modalBody.querySelectorAll('.task-breakdown-toggle-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const taskIdx = this.getAttribute('data-task-idx');
        const breakdownForm = modalBody.querySelector(`#task-breakdown-form-${taskIdx}`);
        if (breakdownForm) {
          breakdownForm.style.display = breakdownForm.style.display === 'none' ? 'flex' : 'none';
        }
      });
    });

    // 1e. Task cancel button click
    modalBody.querySelectorAll('.task-cancel-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        const taskIdx = parseInt(this.getAttribute('data-task-idx'));
        const tasks = issue.tasks || [];
        const task = tasks[taskIdx];
        if (!task) return;

        // Check if logged-in user is the responsible person
        if ((task.in_charge_uid || '').toString() !== currentUserId.toString()) {
          alert("Only the responsible person can cancel this task.");
          return;
        }

        if (!confirm("Are you sure you want to cancel this task?")) {
          return;
        }

        try {
          await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(docRef);
            if (!doc.exists) return;
            const latestData = doc.data();
            const latestTasks = latestData.tasks || [];
            if (latestTasks[taskIdx]) {
              latestTasks[taskIdx].status = 'canceled';
              transaction.update(docRef, { tasks: latestTasks });
            }
          });
          console.log("Task canceled.");
        } catch (err) {
          console.error("Failed to cancel task:", err);
        }
      });
    });

    // 1f. Task restore button click
    modalBody.querySelectorAll('.task-restore-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        const taskIdx = parseInt(this.getAttribute('data-task-idx'));
        const tasks = issue.tasks || [];
        const task = tasks[taskIdx];
        if (!task) return;

        // Check if logged-in user is the responsible person
        if ((task.in_charge_uid || '').toString() !== currentUserId.toString()) {
          alert("Only the responsible person can restore this task.");
          return;
        }

        try {
          await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(docRef);
            if (!doc.exists) return;
            const latestData = doc.data();
            const latestTasks = latestData.tasks || [];
            if (latestTasks[taskIdx]) {
              latestTasks[taskIdx].status = 'pending';
              transaction.update(docRef, { tasks: latestTasks });
            }
          });
          console.log("Task restored.");
        } catch (err) {
          console.error("Failed to restore task:", err);
        }
      });
    });

    // 1g. Subtask status checkbox change
    modalBody.querySelectorAll('.subtask-status-checkbox').forEach(chk => {
      chk.addEventListener('change', async function() {
        const taskIdx = parseInt(chk.getAttribute('data-task-idx'));
        const subtaskIdx = parseInt(chk.getAttribute('data-subtask-idx'));
        const tasks = issue.tasks || [];
        const task = tasks[taskIdx];
        if (!task) return;

        const subtasks = task.subtasks || [];
        const subtask = subtasks[subtaskIdx];
        if (!subtask) return;
        const subInChargeUid = subtask.in_charge_uid || task.in_charge_uid;
        const subInChargeName = subtask.in_charge_name || task.in_charge_name || 'assigned leader';

        // Check if logged-in user is the responsible person
        if ((subInChargeUid || '').toString() !== currentUserId.toString()) {
          alert("Only the responsible person (" + subInChargeName + ") can change the status of this subtask.");
          this.checked = !this.checked; // Reset checkbox state
          return;
        }

        try {
          await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(docRef);
            if (!doc.exists) return;
            const latestData = doc.data();
            const latestTasks = latestData.tasks || [];
            if (latestTasks[taskIdx] && latestTasks[taskIdx].subtasks && latestTasks[taskIdx].subtasks[subtaskIdx]) {
              const currentSubStatus = latestTasks[taskIdx].subtasks[subtaskIdx].status || 'pending';
              latestTasks[taskIdx].subtasks[subtaskIdx].status = currentSubStatus === 'done' ? 'pending' : 'done';
              transaction.update(docRef, { tasks: latestTasks });
            }
          });
          console.log("Subtask status updated.");
        } catch (err) {
          console.error("Failed to update subtask status:", err);
          this.checked = !this.checked;
        }
      });
    });

    // 1h. Subtask remove button click
    modalBody.querySelectorAll('.subtask-remove-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        const taskIdx = parseInt(this.getAttribute('data-task-idx'));
        const subtaskIdx = parseInt(this.getAttribute('data-subtask-idx'));
        const tasks = issue.tasks || [];
        const task = tasks[taskIdx];
        if (!task) return;

        // Check if logged-in user is the responsible person
        if ((task.in_charge_uid || '').toString() !== currentUserId.toString()) {
          return;
        }

        try {
          await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(docRef);
            if (!doc.exists) return;
            const latestData = doc.data();
            const latestTasks = latestData.tasks || [];
            if (latestTasks[taskIdx] && latestTasks[taskIdx].subtasks) {
              latestTasks[taskIdx].subtasks.splice(subtaskIdx, 1);
              transaction.update(docRef, { tasks: latestTasks });
            }
          });
          console.log("Subtask removed.");
        } catch (err) {
          console.error("Failed to remove subtask:", err);
        }
      });
    });

    // 1i. Add subtask button click
    modalBody.querySelectorAll('.task-add-subtask-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        const taskIdx = parseInt(this.getAttribute('data-task-idx'));
        const inputEl = modalBody.querySelector(`.task-new-subtask-input[data-task-idx="${taskIdx}"]`);
        if (!inputEl) return;
        const text = inputEl.value.trim();
        if (!text) return;

        const tasks = issue.tasks || [];
        const task = tasks[taskIdx];
        if (!task) return;

        // Check if logged-in user is the responsible person
        if ((task.in_charge_uid || '').toString() !== currentUserId.toString()) {
          alert("Only the responsible person can add subtasks.");
          return;
        }

        const respSelect = modalBody.querySelector(`.task-new-subtask-responsible[data-task-idx="${taskIdx}"]`);
        const deadlineInput = modalBody.querySelector(`.task-new-subtask-deadline[data-task-idx="${taskIdx}"]`);
        
        const respUid = respSelect ? respSelect.value : '';
        const respName = respSelect ? (window.userCache[respUid] || 'User ' + respUid) : '';
        const deadline = deadlineInput ? deadlineInput.value : '';

        const newSubtask = {
          title: text,
          status: 'pending',
          in_charge_uid: respUid,
          in_charge_name: respName,
          deadline: deadline
        };

        try {
          await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(docRef);
            if (!doc.exists) return;
            const latestData = doc.data();
            const latestTasks = latestData.tasks || [];
            if (latestTasks[taskIdx]) {
              if (!latestTasks[taskIdx].subtasks) latestTasks[taskIdx].subtasks = [];
              latestTasks[taskIdx].subtasks.push(newSubtask);
              transaction.update(docRef, { tasks: latestTasks });
            }
          });
          inputEl.value = '';
          const breakdownForm = modalBody.querySelector(`#task-breakdown-form-${taskIdx}`);
          if (breakdownForm) breakdownForm.style.display = 'none';
          console.log("Subtask added successfully.");
        } catch (err) {
          console.error("Failed to add subtask:", err);
        }
      });
    });

    // Support enter key on task new subtask input
    modalBody.querySelectorAll('.task-new-subtask-input').forEach(input => {
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          const taskIdx = this.getAttribute('data-task-idx');
          const btn = modalBody.querySelector(`.task-add-subtask-btn[data-task-idx="${taskIdx}"]`);
          if (btn) btn.click();
        }
      });
    });

    // 2. Add comment buttons (top-level comment for a task)
    modalBody.querySelectorAll('.task-add-comment-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        const taskIdx = parseInt(this.getAttribute('data-task-idx'));
        const inputEl = modalBody.querySelector(`.task-new-comment-input[data-task-idx="${taskIdx}"]`);
        if (!inputEl) return;
        const text = inputEl.value.trim();
        if (!text) return;

        const displayName = window.userCache[currentUserId] || ('User ' + currentUserId);
        
        const newComment = {
           id: 'tc_' + Date.now() + '_' + Math.floor(Math.random()*1000),
           uid: currentUserId,
           author_name: displayName,
           text: text,
           timestamp: new Date().toLocaleDateString('de-CH') // e.g. "06.06.2026"
        };

        try {
          await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(docRef);
            if (!doc.exists) return;
            const latestData = doc.data();
            const latestTasks = latestData.tasks || [];
            if (latestTasks[taskIdx]) {
              if (!latestTasks[taskIdx].comments) latestTasks[taskIdx].comments = [];
              latestTasks[taskIdx].comments.push(newComment);
              transaction.update(docRef, { tasks: latestTasks });
            }
          });
          inputEl.value = '';
          const commentForm = modalBody.querySelector(`#task-comment-form-${taskIdx}`);
          if (commentForm) commentForm.style.display = 'none';
          console.log("Task comment added successfully.");
        } catch (err) {
          console.error("Failed to add task comment:", err);
        }
      });
    });

    // Support enter key on task new comment input
    modalBody.querySelectorAll('.task-new-comment-input').forEach(input => {
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          const taskIdx = this.getAttribute('data-task-idx');
          const btn = modalBody.querySelector(`.task-add-comment-btn[data-task-idx="${taskIdx}"]`);
          if (btn) btn.click();
        }
      });
    });

    // 3. Reply toggle buttons (shows/hides the inline reply form)
    modalBody.querySelectorAll('.task-comment-reply-toggle-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const commentId = this.getAttribute('data-comment-id');
        const replyForm = modalBody.querySelector(`#reply-form-${commentId}`);
        if (replyForm) {
          replyForm.style.display = replyForm.style.display === 'none' ? 'flex' : 'none';
        }
      });
    });

    // 4. Submit reply comment buttons (adds a nested reply comment)
    modalBody.querySelectorAll('.task-submit-reply-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        const taskIdxStr = this.getAttribute('data-task-idx');
        const parentId = this.getAttribute('data-parent-id');
        const replyForm = modalBody.querySelector(`#reply-form-${parentId}`);
        if (!replyForm) return;
        const inputEl = replyForm.querySelector('.task-reply-input');
        if (!inputEl) return;
        const text = inputEl.value.trim();
        if (!text) return;

        const displayName = window.userCache[currentUserId] || ('User ' + currentUserId);

        if (taskIdxStr.startsWith('subtaskcomment_')) {
          const parts = taskIdxStr.split('_');
          const taskIdx = parseInt(parts[1], 10);
          const subtaskIdx = parseInt(parts[2], 10);

          const newReply = {
             id: 'sc_' + Date.now() + '_' + Math.floor(Math.random()*1000),
             uid: currentUserId,
             author_name: displayName,
             text: text,
             timestamp: new Date().toLocaleDateString('de-CH'),
             parent_id: parentId
          };

          try {
            await db.runTransaction(async (transaction) => {
              const doc = await transaction.get(docRef);
              if (!doc.exists) return;
              const latestData = doc.data();
              const latestTasks = latestData.tasks || [];
              if (latestTasks[taskIdx]) {
                const subtasks = latestTasks[taskIdx].subtasks || [];
                if (subtasks[subtaskIdx]) {
                  if (!subtasks[subtaskIdx].comments) subtasks[subtaskIdx].comments = [];
                  subtasks[subtaskIdx].comments.push(newReply);
                  transaction.update(docRef, { tasks: latestTasks });
                }
              }
            });
            inputEl.value = '';
            replyForm.style.display = 'none';
            console.log("Subtask reply added successfully.");
          } catch (err) {
            console.error("Failed to add subtask reply:", err);
          }
        } else {
          const taskIdx = parseInt(taskIdxStr, 10);
          const newReply = {
             id: 'tc_' + Date.now() + '_' + Math.floor(Math.random()*1000),
             uid: currentUserId,
             author_name: displayName,
             text: text,
             timestamp: new Date().toLocaleDateString('de-CH'),
             parent_id: parentId
          };

          try {
            await db.runTransaction(async (transaction) => {
              const doc = await transaction.get(docRef);
              if (!doc.exists) return;
              const latestData = doc.data();
              const latestTasks = latestData.tasks || [];
              if (latestTasks[taskIdx]) {
                if (!latestTasks[taskIdx].comments) latestTasks[taskIdx].comments = [];
                latestTasks[taskIdx].comments.push(newReply);
                transaction.update(docRef, { tasks: latestTasks });
              }
            });
            inputEl.value = '';
            replyForm.style.display = 'none';
            console.log("Task reply added successfully.");
          } catch (err) {
            console.error("Failed to add task reply:", err);
          }
        }
      });
    });

    // Support enter key on task reply input
    modalBody.querySelectorAll('.task-reply-input').forEach(input => {
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          const container = this.closest('.task-comment-reply-form');
          if (container) {
            const btn = container.querySelector('.task-submit-reply-btn');
            if (btn) btn.click();
          }
        }
      });
    });

    // 5. Results button toggle click
    modalBody.querySelectorAll('.task-results-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const taskIdx = this.getAttribute('data-task-idx');
        const resultsSection = modalBody.querySelector(`#task-results-section-${taskIdx}`);
        if (resultsSection) {
          resultsSection.style.display = resultsSection.style.display === 'none' ? 'block' : 'none';
        }
      });
    });

    // 6. Save results button click
    modalBody.querySelectorAll('.task-save-results-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        const taskIdx = parseInt(this.getAttribute('data-task-idx'), 10);
        const container = this.closest('.task-results-section');
        if (!container) return;
        const textarea = container.querySelector('.task-results-input');
        if (!textarea) return;
        const resultsText = textarea.value.trim();

        try {
          await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(docRef);
            if (!doc.exists) return;
            const latestData = doc.data();
            const latestTasks = latestData.tasks || [];
            if (latestTasks[taskIdx]) {
              latestTasks[taskIdx].results = resultsText;
              transaction.update(docRef, { tasks: latestTasks });
            }
          });
          alert("Task results saved successfully.");
        } catch (err) {
          console.error("Failed to save task results:", err);
          alert("Failed to save task results: " + err.message);
        }
      });
    });



    modalBody.querySelectorAll('.reaction-choice-btn').forEach(btn => {
      btn.addEventListener('click', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        const msgId = this.getAttribute('data-msg-id');
        const reactionType = this.getAttribute('data-reaction');
        if (!msgId || !reactionType) return;

        const menu = this.closest('.reaction-menu');
        if (menu) menu.hidden = true;

        if (msgId.startsWith('task_') || msgId.startsWith('taskcomment_') || msgId.startsWith('subtask_')) {
          await toggleTaskOrCommentReaction(msgId, reactionType);
        }
      });
    });

    // Bind subtask-level comment input toggle
    modalBody.querySelectorAll('.subtask-comment-input-toggle-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const taskIdx = this.getAttribute('data-task-idx');
        const subtaskIdx = this.getAttribute('data-subtask-idx');
        const commentsSection = modalBody.querySelector(`#subtask-comments-section-${taskIdx}-${subtaskIdx}`);
        if (commentsSection) {
          commentsSection.style.display = 'block';
        }
        const commentForm = modalBody.querySelector(`#subtask-comment-form-${taskIdx}-${subtaskIdx}`);
        if (commentForm) {
          commentForm.style.display = commentForm.style.display === 'none' ? 'flex' : 'none';
        }
      });
    });

    // Bind subtask-level add comment click
    modalBody.querySelectorAll('.subtask-add-comment-btn').forEach(btn => {
      btn.addEventListener('click', async function(e) {
        e.stopPropagation();
        const taskIdx = parseInt(this.getAttribute('data-task-idx'), 10);
        const subtaskIdx = parseInt(this.getAttribute('data-subtask-idx'), 10);
        const inputEl = modalBody.querySelector(`.subtask-new-comment-input[data-task-idx="${taskIdx}"][data-subtask-idx="${subtaskIdx}"]`);
        if (!inputEl) return;
        const text = inputEl.value.trim();
        if (!text) return;

        const displayName = window.userCache[currentUserId] || ('User ' + currentUserId);
        const newComment = {
          id: 'sc_' + Date.now() + '_' + Math.floor(Math.random()*1000),
          uid: currentUserId,
          author_name: displayName,
          text: text,
          timestamp: new Date().toLocaleDateString('de-CH')
        };

        try {
          await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(docRef);
            if (!doc.exists) return;
            const latestData = doc.data();
            const latestTasks = latestData.tasks || [];
            if (latestTasks[taskIdx]) {
              const subtasks = latestTasks[taskIdx].subtasks || [];
              if (subtasks[subtaskIdx]) {
                if (!subtasks[subtaskIdx].comments) subtasks[subtaskIdx].comments = [];
                subtasks[subtaskIdx].comments.push(newComment);
                transaction.update(docRef, { tasks: latestTasks });
              }
            }
          });
          inputEl.value = '';
          const commentForm = modalBody.querySelector(`#subtask-comment-form-${taskIdx}-${subtaskIdx}`);
          if (commentForm) commentForm.style.display = 'none';
          console.log("Subtask comment added successfully.");
        } catch (err) {
          console.error("Failed to add subtask comment:", err);
        }
      });
    });

    // Support enter key on subtask new comment input
    modalBody.querySelectorAll('.subtask-new-comment-input').forEach(input => {
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          const taskIdx = this.getAttribute('data-task-idx');
          const subtaskIdx = this.getAttribute('data-subtask-idx');
          const btn = modalBody.querySelector(`.subtask-add-comment-btn[data-task-idx="${taskIdx}"][data-subtask-idx="${subtaskIdx}"]`);
          if (btn) btn.click();
        }
      });
    });

    // Bind subtask results toggle click
    modalBody.querySelectorAll('.subtask-results-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const taskIdx = this.getAttribute('data-task-idx');
        const subtaskIdx = this.getAttribute('data-subtask-idx');
        const resultsSection = modalBody.querySelector(`#subtask-results-section-${taskIdx}-${subtaskIdx}`);
        if (resultsSection) {
          resultsSection.style.display = resultsSection.style.display === 'none' ? 'block' : 'none';
        }
      });
    });

    // Bind subtask save results button click
    modalBody.querySelectorAll('.subtask-save-results-btn').forEach(btn => {
      btn.addEventListener('click', async function(e) {
        e.stopPropagation();
        const taskIdx = parseInt(this.getAttribute('data-task-idx'), 10);
        const subtaskIdx = parseInt(this.getAttribute('data-subtask-idx'), 10);
        const container = this.closest('.subtask-results-section');
        if (!container) return;
        const textarea = container.querySelector('.subtask-results-input');
        if (!textarea) return;
        const resultsText = textarea.value.trim();

        try {
          await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(docRef);
            if (!doc.exists) return;
            const latestData = doc.data();
            const latestTasks = latestData.tasks || [];
            if (latestTasks[taskIdx]) {
              const subtasks = latestTasks[taskIdx].subtasks || [];
              if (subtasks[subtaskIdx]) {
                subtasks[subtaskIdx].results = resultsText;
                transaction.update(docRef, { tasks: latestTasks });
              }
            }
          });
          alert("Subtask results saved successfully.");
        } catch (err) {
          console.error("Failed to save subtask results:", err);
          alert("Failed to save subtask results: " + err.message);
        }
      });
    });

    async function toggleTaskOrCommentReaction(msgId, reactionType) {
      if (msgId.startsWith('task_')) {
        const taskIdx = parseInt(msgId.substring(5), 10);
        try {
          await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(docRef);
            if (!doc.exists) return;

            const data = doc.data();
            const tasks = data.tasks || [];
            if (!tasks[taskIdx]) return;

            let marks = tasks[taskIdx].marks || [];
            const userMarks = marks.filter(m => (m.uid || '').toString() === currentUserId.toString());
            const userMarkTypes = userMarks.map(m => (m.type || m.reaction || '').toLowerCase().trim());
            const existingIndex = userMarkTypes.indexOf(reactionType);

            if (existingIndex >= 0) {
              marks = marks.filter(m => !((m.uid || '').toString() === currentUserId.toString() && (m.type || m.reaction || '').toLowerCase().trim() === reactionType));
            } else {
              if (userMarkTypes.length >= 2) {
                alert("You can only leave up to 2 different reactions per task.");
                return;
              }
              marks.push({
                uid: currentUserId,
                type: reactionType,
                reaction: reactionType
              });
            }
            tasks[taskIdx].marks = marks;

            transaction.update(docRef, { tasks: tasks });
          });
        } catch (err) {
          console.error("Error toggling task reaction:", err);
        }
      } else if (msgId.startsWith('taskcomment_')) {
        // Can be a subtask comment reaction: taskcomment_subtaskcomment_taskIdx_subtaskIdx_commentId
        if (msgId.startsWith('taskcomment_subtaskcomment_')) {
          const parts = msgId.split('_');
          const taskIdx = parseInt(parts[2], 10);
          const subtaskIdx = parseInt(parts[3], 10);
          const commentId = parts.slice(4).join('_');

          try {
            await db.runTransaction(async (transaction) => {
              const doc = await transaction.get(docRef);
              if (!doc.exists) return;

              const data = doc.data();
              const tasks = data.tasks || [];
              if (!tasks[taskIdx]) return;

              const subtasks = tasks[taskIdx].subtasks || [];
              if (!subtasks[subtaskIdx]) return;

              let comments = subtasks[subtaskIdx].comments || [];
              comments = comments.map(c => {
                if (c.id === commentId) {
                  let marks = c.marks || [];
                  const userMarks = marks.filter(m => (m.uid || '').toString() === currentUserId.toString());
                  const userMarkTypes = userMarks.map(m => (m.type || m.reaction || '').toLowerCase().trim());
                  const existingIndex = userMarkTypes.indexOf(reactionType);

                  if (existingIndex >= 0) {
                    marks = marks.filter(m => !((m.uid || '').toString() === currentUserId.toString() && (m.type || m.reaction || '').toLowerCase().trim() === reactionType));
                  } else {
                    if (userMarkTypes.length >= 2) {
                      alert("You can only leave up to 2 different reactions per comment.");
                      return c;
                    }
                    marks.push({
                      uid: currentUserId,
                      type: reactionType,
                      reaction: reactionType
                    });
                  }
                  return { ...c, marks: marks };
                }
                return c;
              });
              subtasks[subtaskIdx].comments = comments;

              transaction.update(docRef, { tasks: tasks });
            });
          } catch (err) {
            console.error("Error toggling subtask comment reaction:", err);
          }
        } else {
          // Regular task comment reaction
          const parts = msgId.split('_');
          const taskIdx = parseInt(parts[1], 10);
          const commentId = parts.slice(2).join('_');

          try {
            await db.runTransaction(async (transaction) => {
              const doc = await transaction.get(docRef);
              if (!doc.exists) return;

              const data = doc.data();
              const tasks = data.tasks || [];
              if (!tasks[taskIdx]) return;

              let comments = tasks[taskIdx].comments || [];
              comments = comments.map(c => {
                if (c.id === commentId) {
                  let marks = c.marks || [];
                  const userMarks = marks.filter(m => (m.uid || '').toString() === currentUserId.toString());
                  const userMarkTypes = userMarks.map(m => (m.type || m.reaction || '').toLowerCase().trim());
                  const existingIndex = userMarkTypes.indexOf(reactionType);

                  if (existingIndex >= 0) {
                    marks = marks.filter(m => !((m.uid || '').toString() === currentUserId.toString() && (m.type || m.reaction || '').toLowerCase().trim() === reactionType));
                  } else {
                    if (userMarkTypes.length >= 2) {
                      alert("You can only leave up to 2 different reactions per comment.");
                      return c;
                    }
                    marks.push({
                      uid: currentUserId,
                      type: reactionType,
                      reaction: reactionType
                    });
                  }
                  return { ...c, marks: marks };
                }
                return c;
              });
              tasks[taskIdx].comments = comments;

              transaction.update(docRef, { tasks: tasks });
            });
          } catch (err) {
            console.error("Error toggling task comment reaction:", err);
          }
        }
      } else if (msgId.startsWith('subtask_')) {
        const parts = msgId.split('_');
        const taskIdx = parseInt(parts[1], 10);
        const subtaskIdx = parseInt(parts[2], 10);

        try {
          await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(docRef);
            if (!doc.exists) return;

            const data = doc.data();
            const tasks = data.tasks || [];
            if (!tasks[taskIdx]) return;

            const subtasks = tasks[taskIdx].subtasks || [];
            if (!subtasks[subtaskIdx]) return;

            let marks = subtasks[subtaskIdx].marks || [];
            const userMarks = marks.filter(m => (m.uid || '').toString() === currentUserId.toString());
            const userMarkTypes = userMarks.map(m => (m.type || m.reaction || '').toLowerCase().trim());
            const existingIndex = userMarkTypes.indexOf(reactionType);

            if (existingIndex >= 0) {
              marks = marks.filter(m => !((m.uid || '').toString() === currentUserId.toString() && (m.type || m.reaction || '').toLowerCase().trim() === reactionType));
            } else {
              if (userMarkTypes.length >= 2) {
                alert("You can only leave up to 2 different reactions per subtask.");
                return;
              }
              marks.push({
                uid: currentUserId,
                type: reactionType,
                reaction: reactionType
              });
            }
            subtasks[subtaskIdx].marks = marks;

            transaction.update(docRef, { tasks: tasks });
          });
        } catch (err) {
          console.error("Error toggling subtask reaction:", err);
        }
      }
    }
  }

  function bindProposalInteractions(disc, topicId) {
    const proposalModalOverlay = document.getElementById('proposal-modal-overlay');
    const proposalModalCloseBtn = document.getElementById('proposal-modal-close-btn');
    const proposalModalTitle = document.getElementById('proposal-modal-title');
    const proposalModalBody = document.getElementById('proposal-modal-body');

    if (!proposalModalOverlay || !proposalModalCloseBtn || !proposalModalTitle || !proposalModalBody) return;

    // Bind Close Button click
    proposalModalCloseBtn.onclick = function() {
      proposalModalOverlay.hidden = true;
    };

    // Close on overlay click
    proposalModalOverlay.onclick = function(e) {
      if (e.target === proposalModalOverlay) {
        proposalModalOverlay.hidden = true;
      }
    };

    // Bind Option Card clicks
    modalBody.querySelectorAll('.option-card').forEach(card => {
      card.addEventListener('click', function(e) {
        // Prevent click if clicking on reactions block
        if (e.target.closest('.option-reactions-container')) return;

        const optionId = this.getAttribute('data-option-id');
        const options = disc.options_v2 || [];
        const opt = options.find(o => o.id === optionId);
        if (!opt) return;

        // Render option details
        proposalModalTitle.textContent = opt.title;
        
        let stepsHtml = '';
        if (opt.description && opt.description.length > 0) {
          stepsHtml = opt.description.map((s, idx) => {
            const dlHtml = s.deadline ? ` - <span style="font-weight: 500; color: var(--text-soft);">${formatTaskDeadline(s.deadline)}</span>` : '';
            return `
              <li style="margin-bottom: 8px; font-size: 0.92rem; line-height: 1.4;">
                ${s.step} 
                <span style="font-weight: 600; color: var(--text-soft);">(${s.in_charge_name})</span>${dlHtml}
              </li>
            `;
          }).join('');
        } else {
          stepsHtml = '<li style="color: var(--text-muted); font-style: italic;">No steps specified</li>';
        }

        proposalModalBody.innerHTML = `
          <div style="margin-bottom: 16px;">
            <div style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 12px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
              Proposed by <b>${opt.author_name}</b> &middot; Budget: <b>${opt.budget}</b>
            </div>
            <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 10px; color: var(--text);">Implementation Steps:</h4>
            <ol style="padding-left: 20px; color: var(--text);">
              ${stepsHtml}
            </ol>
          </div>
          <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
            <button type="button" class="topic-back-btn" id="proposal-modal-close-action" style="padding: 8px 16px; border-radius: 8px; cursor: pointer; border: 1px solid var(--border); background: var(--surface-muted); color: var(--text);">Close</button>
          </div>
        `;

        document.getElementById('proposal-modal-close-action').onclick = function() {
          proposalModalOverlay.hidden = true;
        };

        proposalModalOverlay.hidden = false;
      });
    });

    // Bind Propose Option Button click
    const proposeBtn = modalBody.querySelector('#propose-option-btn');
    if (proposeBtn) {
      proposeBtn.addEventListener('click', function() {
        proposalModalTitle.textContent = "Propose Decision Option";
        
        // Resolve current participants dropdown options
        const participants = disc.participants || [];
        const participantOptions = participants.map(uid => {
          const name = window.userCache[uid] || ('User ' + uid);
          return `<option value="${uid}">${name}</option>`;
        }).join('');

        proposalModalBody.innerHTML = `
          <div class="proposal-form-group">
            <label for="proposal-title-input">Option Name</label>
            <input type="text" id="proposal-title-input" placeholder="e.g. Install Smart Keypad Locks" style="width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text); font-size: 0.9rem;">
          </div>
          <div class="proposal-form-group">
            <label for="proposal-budget-input">Budget</label>
            <input type="text" id="proposal-budget-input" placeholder="e.g. $1,200" style="width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text); font-size: 0.9rem;">
          </div>
          
          <div class="proposal-steps-builder">
            <label style="display: block; font-size: 0.88rem; font-weight: 600; margin-bottom: 8px; color: var(--text);">Implementation Steps Builder</label>
            
            <!-- List of added steps -->
            <div id="added-steps-container" style="margin-bottom: 12px;"></div>

            <!-- Inline form to add a step -->
            <div style="display: flex; flex-direction: column; gap: 8px; border-top: 1px solid var(--border); padding-top: 10px; margin-top: 8px;">
              <input type="text" id="step-desc-input" placeholder="Step description..." style="width: 100%; padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--surface); color: var(--text); font-size: 0.85rem;">
              <div style="display: flex; gap: 8px; align-items: center;">
                <select id="step-leader-select" style="flex: 1; padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--surface); color: var(--text); font-size: 0.85rem;">
                  ${participantOptions}
                </select>
                <button type="button" id="add-step-btn" style="padding: 6px 12px; font-size: 0.85rem; font-weight: 600; border-radius: 6px; background: var(--surface-muted); border: 1px solid var(--border); color: var(--text); cursor: pointer;">Add Step</button>
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
            <button type="button" id="proposal-cancel-btn" style="padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-muted); color: var(--text); cursor: pointer;">Cancel</button>
            <button type="button" id="proposal-submit-btn" style="padding: 8px 16px; border-radius: 8px; border: none; background: var(--primary); color: #fff; cursor: pointer; font-weight: 600;">Submit Proposal</button>
          </div>
        `;

        let tempSteps = [];
        const addedStepsContainer = document.getElementById('added-steps-container');
        const stepDescInput = document.getElementById('step-desc-input');
        const stepLeaderSelect = document.getElementById('step-leader-select');
        const addStepBtn = document.getElementById('add-step-btn');
        const proposalCancelBtn = document.getElementById('proposal-cancel-btn');
        const proposalSubmitBtn = document.getElementById('proposal-submit-btn');

        function renderTempSteps() {
          if (tempSteps.length === 0) {
            addedStepsContainer.innerHTML = '<div style="font-size: 0.8rem; color: var(--text-muted); font-style: italic; padding: 4px;">No steps added yet. Add steps below.</div>';
            return;
          }
          addedStepsContainer.innerHTML = tempSteps.map((s, idx) => `
            <div class="added-step-row" data-index="${idx}">
              <span style="font-weight: 500; color: var(--text);">${idx + 1}. ${s.step} <span style="color: var(--text-soft);">(${s.in_charge_name})</span></span>
              <button type="button" class="added-step-delete" data-index="${idx}">Remove</button>
            </div>
          `).join('');

          // Bind delete buttons
          addedStepsContainer.querySelectorAll('.added-step-delete').forEach(delBtn => {
            delBtn.onclick = function() {
              const idx = parseInt(this.getAttribute('data-index'));
              tempSteps.splice(idx, 1);
              renderTempSteps();
            };
          });
        }

        renderTempSteps();

        // Bind Add Step button
        addStepBtn.onclick = function() {
          const desc = stepDescInput.value.trim();
          if (!desc) {
            alert("Please type a step description.");
            return;
          }
          const leaderUid = stepLeaderSelect.value;
          const leaderName = window.userCache[leaderUid] || ('User ' + leaderUid);

          tempSteps.push({
            step: desc,
            in_charge_uid: leaderUid,
            in_charge_name: leaderName
          });

          stepDescInput.value = '';
          renderTempSteps();
        };

        // Bind Cancel button
        proposalCancelBtn.onclick = function() {
          proposalModalOverlay.hidden = true;
        };

        // Bind Submit button
        proposalSubmitBtn.onclick = async function() {
          const title = document.getElementById('proposal-title-input').value.trim();
          const budget = document.getElementById('proposal-budget-input').value.trim();

          if (!title) {
            alert("Please specify a proposal title.");
            return;
          }
          if (!budget) {
            alert("Please specify a budget.");
            return;
          }
          if (tempSteps.length === 0) {
            alert("Please add at least one implementation step.");
            return;
          }

          proposalSubmitBtn.disabled = true;
          proposalSubmitBtn.textContent = "Submitting...";

          const currentUserId = safeGetStorage('userId') || "1";
          const authorName = window.userCache[currentUserId] || ('User ' + currentUserId);

          const newOption = {
            id: 'opt_' + Date.now(),
            title: title,
            budget: budget,
            author_uid: currentUserId,
            author_name: authorName,
            description: tempSteps,
            marks: []
          };

          const db = firebase.firestore();
          const docRef = db.collection("discussions").doc(topicId);

          try {
            await db.runTransaction(async (transaction) => {
              const doc = await transaction.get(docRef);
              if (!doc.exists) return;
              const data = doc.data();
              const options = data.options_v2 || [];
              options.push(newOption);
              transaction.update(docRef, { options_v2: options });
            });

            proposalModalOverlay.hidden = true;
          } catch (err) {
            console.error("Failed to submit option:", err);
            alert("Failed to submit proposal: " + err.message);
            proposalSubmitBtn.disabled = false;
            proposalSubmitBtn.textContent = "Submit Proposal";
          }
        };

        proposalModalOverlay.hidden = false;
      });
    }
  }

function bindTopicListInteractions() {
    var sourceTitle = modalTitle ? modalTitle.textContent : '';

    modalBody.querySelectorAll('[data-topic-id][data-topic-type]').forEach(function(el) {
      if (el.__eventsBound) return;
      el.__eventsBound = true;

      el.addEventListener('click', function(e) {
        e.preventDefault();
        const currentUserId = safeGetStorage('userId');
        if (!currentUserId) {
          const loginOverlay = document.getElementById('login-modal-overlay');
          if (loginOverlay) loginOverlay.hidden = false;
          alert("Please adopt a profile or register to view live details and participate!");
          return;
        }

        var kind = this.getAttribute('data-topic-type');
        var topicId = this.getAttribute('data-topic-id');
        
        if (kind === 'chat' || kind === 'voting') {
          if (typeof window.markDiscussionAsRead === 'function') {
            window.markDiscussionAsRead(topicId);
          }
        }
        
        renderTopicDetail(kind, topicId, modalBody.innerHTML, sourceTitle);
      });
    });

    var newTopicBtn = modalBody.querySelector('#chat-new-topic-btn');
    if (newTopicBtn) {
      if (!newTopicBtn.__eventsBound) {
        newTopicBtn.__eventsBound = true;
        newTopicBtn.addEventListener('click', function(e) {
          e.preventDefault();
          const currentUserId = safeGetStorage('userId');
          if (!currentUserId) {
            const loginOverlay = document.getElementById('login-modal-overlay');
            if (loginOverlay) loginOverlay.hidden = false;
            alert("Please adopt a profile or register to start a new issue topic.");
            return;
          }
          renderChatCreateView(modalBody.innerHTML, sourceTitle);
        });
      }
    }
  }

  document.addEventListener('click', function(e) {
    // 1. Re-bind topic list interactions on section clicks
    var sectionTrigger = e.target.closest('[data-section]');
    if (sectionTrigger) {
      setTimeout(function() {
        bindTopicListInteractions();
      }, 0);
    }

    // 2. Close reaction choice dropdowns if clicked outside the toggle button or menu
    if (!e.target.closest('.reaction-wrap')) {
      document.querySelectorAll('.reaction-menu').forEach(function(menu) {
        menu.hidden = true;
      });
    }

    // 3. Close reaction user popups if clicked outside any reaction bubble, microcommunity button, or popup itself
    if (!e.target.closest('.reaction-bubble') && !e.target.closest('.microcommunity-btn') && !e.target.closest('.reaction-users-popup')) {
      document.querySelectorAll('.reaction-users-popup').forEach(function(p) {
        p.remove();
      });
    }
  });

  window.bindTopicListInteractions = bindTopicListInteractions;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateValuesDescription(taxonomy) {
  if (!taxonomy || !taxonomy.domains) {
    return "<p>No values taxonomy data available.</p>";
  }
  const domainNames = [
    'Agency & Freedom',
    'Relationality & Care',
    'Security & Stable Order',
    'Justice & Fairness',
    'Redemption & Restoration',
    'Authentic Expression',
    'Protective Care & Stewardship',
    'Cooperation & Shared Governance',
    'Spiritual & Religious Practice',
    'Digital Rights & Tech Democracy'
  ];
  let high = [];
  let low = [];
  taxonomy.domains.forEach((score, index) => {
    if (score >= 70) high.push(domainNames[index]);
    if (score <= 40) low.push(domainNames[index]);
  });

  let text = "";
  if (high.length > 0) {
    text += `I strongly believe in the importance of ${high.slice(0, -1).join(', ')}${high.length > 1 ? ' and ' : ''}${high.slice(-1)}. These principles guide my decisions and my expectations for our community. `;
  }
  if (low.length > 0) {
    text += `I place relatively less emphasis on ${low.slice(0, -1).join(', ')}${low.length > 1 ? ' and ' : ''}${low.slice(-1)} in my daily governance worldview. `;
  }
  if (text === "") {
    text = "I believe in balanced governance, prioritizing cooperation, security, and individual freedom in equal measure.";
  }
  return `<p>${text}</p><p>My active conflict resolution preferences prioritize autonomy, custom solutions, and direct accountability over standardized templates where applicable.</p>`;
}

async function getRelevantDiscussionIds(db, storedUid) {
  const relevantIds = new Set();
  if (!storedUid) return relevantIds;
  
  const uidInt = parseInt(storedUid) || 0;

  const safeGet = async (promise) => {
    try {
      return await promise;
    } catch (e) {
      console.warn("Resilient query failed (possibly missing index):", e);
      return { forEach: () => {} };
    }
  };

  try {
    const [created1, created2, part1, part2, member] = await Promise.all([
      safeGet(db.collection("discussions").where("creator_uid", "==", storedUid).get()),
      safeGet(db.collection("discussions").where("creator_uid", "==", uidInt).get()),
      safeGet(db.collection("discussions").where("participants", "array-contains", storedUid).get()),
      safeGet(db.collection("discussions").where("participants", "array-contains", uidInt).get()),
      safeGet(db.collection("microcommunity_members").where("user_id", "==", uidInt).get())
    ]);

    created1.forEach(doc => relevantIds.add(doc.id));
    created2.forEach(doc => relevantIds.add(doc.id));
    part1.forEach(doc => relevantIds.add(doc.id));
    part2.forEach(doc => relevantIds.add(doc.id));

    const mcIds = [];
    member.forEach(doc => {
      const data = doc.data();
      if (data.microcommunity_id) mcIds.push(data.microcommunity_id);
    });

    if (mcIds.length > 0) {
      for (let i = 0; i < mcIds.length; i += 30) {
        const chunk = mcIds.slice(i, i + 30);
        const mcSnap = await safeGet(db.collection("microcommunities").where("microcommunity_id", "in", chunk).get());
        mcSnap.forEach(doc => {
          const data = doc.data();
          if (data.issue_id) relevantIds.add(data.issue_id);
        });
      }
    }
  } catch (err) {
    console.error("Error gathering relevant discussion IDs:", err);
  }

  return relevantIds;
}

function initRealTimeDashboardSync(db, storedUid) {
  let activeIssuesCount = 0;
  let discussionsCount = 0;
  
  const updateSummaryStrip = () => {
    const summaryStrip = document.querySelector('.summary-strip');
    if (summaryStrip) {
      summaryStrip.innerHTML = `
        <button class="summary-link" data-section="voting">Active votes: ${activeIssuesCount}</button>
        <span class="summary-separator">·</span>
        <span>Issues: ${activeIssuesCount}</span>
        <span class="summary-separator">·</span>
        <button class="summary-link" data-section="tasks">To Do: ${activeIssuesCount}</button>
        <span class="summary-separator">·</span>
        <button class="summary-link" data-section="chat">Discussions: ${discussionsCount}</button>
      `;
      summaryStrip.querySelectorAll('.summary-link').forEach(el => {
        el.addEventListener('click', function(e) {
          e.preventDefault();
          openSectionModal(this.getAttribute('data-section'));
        });
      });
    }
  };

  const updateTopicListContainer = (sectionId, htmlContent) => {
    const sourceContainer = document.getElementById('section-' + sectionId);
    const modalOverlay = document.getElementById('section-modal-overlay');
    const bodyEl = document.getElementById('section-modal-body');
    
    if (sourceContainer) {
      const listEl = sourceContainer.querySelector('.topic-list');
      if (listEl) listEl.innerHTML = htmlContent;
    }
    
    if (currentSectionId === sectionId && modalOverlay && modalOverlay.classList.contains('active') && bodyEl) {
      if (!bodyEl.hasAttribute('data-topic-detail-open')) {
        const modalListEl = bodyEl.querySelector('.topic-list');
        if (modalListEl) {
          modalListEl.innerHTML = htmlContent;
        } else {
          bodyEl.innerHTML = sourceContainer ? sourceContainer.innerHTML : '';
        }
        bindTopicListInteractions();
      } else {
        if (sourceContainer) {
          bodyEl.__sourceViewHtml = sourceContainer.innerHTML;
        }
      }
    }
  };

  // Discussions state variables
  let cachedChatDocs = [];
  let chatSortMode = 'new';

  // Voting state variables
  let cachedVotingDocs = [];
  let votingSortMode = 'new';

  function formatDateToString(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function formatDeadlineDisplay(endsStr) {
    if (!endsStr || endsStr === "Ongoing") return "Ongoing";
    const parts = endsStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
    return endsStr;
  }

  async function checkAndTransitionExpiredDiscussion(topicId, freshData) {
    const discRef = db.collection("discussions").doc(topicId);
    try {
      await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(discRef);
        if (!doc.exists) return;
        const currentData = doc.data();
        if (currentData.status && currentData.status !== 'discussion') return; // already transitioned

        const newEndsDate = new Date();
        newEndsDate.setDate(newEndsDate.getDate() + 7);
        const newEndsStr = formatDateToString(newEndsDate);

        // Create/update document in issues collection
        const issueRef = db.collection("issues").doc(topicId);
        const issueDoc = await transaction.get(issueRef);
        
        let issueOptions = [];
        if (currentData.options_v2 && currentData.options_v2.length > 0) {
          issueOptions = currentData.options_v2.map(opt => ({
            label: opt.title,
            score: 0,
            author_uid: opt.author_uid || "",
            author_name: opt.author_name || "System",
            budget: opt.budget || "N/A",
            description: opt.description || []
          }));
        } else {
          issueOptions = [
            { label: "Proceed with proposed fix", score: 0, author_name: "System", budget: "N/A", description: [] },
            { label: "Reject proposal", score: 0, author_name: "System", budget: "N/A", description: [] },
            { label: "Request more details", score: 0, author_name: "System", budget: "N/A", description: [] }
          ];
        }

        const issueData = {
          title: currentData.topic || "",
          description: currentData.description || "",
          category: currentData.category || "General",
          status: 'in_process', // active for voting
          ends: newEndsStr,
          submitter_id: currentData.creator_uid || "system",
          created_at: currentData.created_at || new Date().toISOString(),
          participants: currentData.participants || [],
          options: issueOptions,
          deadline_votes: {}, // reset votes
          w_demographic: currentData.w_demographic !== undefined ? currentData.w_demographic : 0.2,
          w_geographic: currentData.w_geographic !== undefined ? currentData.w_geographic : 0.6,
          w_semantic: currentData.w_semantic !== undefined ? currentData.w_semantic : 0.1,
          w_social: currentData.w_social !== undefined ? currentData.w_social : 0.1,
          w_relevance: currentData.w_relevance !== undefined ? currentData.w_relevance : 0.4,
          w_expertise: currentData.w_expertise !== undefined ? currentData.w_expertise : 0.3,
          w_contribution: currentData.w_contribution !== undefined ? currentData.w_contribution : 0.3,
          last_message_sender_name: currentData.last_message_sender_name || "",
          last_message_sender_uid: currentData.last_message_sender_uid || "",
          last_message_text: currentData.last_message_text || "",
          last_message_timestamp: currentData.last_message_timestamp || "",
          relevance_scores: currentData.relevance_scores || {},
          isr_scores: currentData.isr_scores || {},
          message_count: currentData.message_count || 0
        };

        if (issueDoc.exists) {
          transaction.update(issueRef, issueData);
        } else {
          transaction.set(issueRef, issueData);
        }

        // Update discussions document to Voting status (moved here after reads)
        transaction.update(discRef, {
          status: 'Voting',
          ends: newEndsStr,
          deadline_votes: {} // reset votes
        });
      });
      console.log(`Successfully auto-transitioned discussion ${topicId} to Voting.`);
    } catch (err) {
      console.error("Auto-transition transaction failed:", err);
    }
  }

  function getDaysUntil(endsStr) {
    if (!endsStr) return Infinity;
    const today = new Date("2026-06-01T00:00:00");
    const deadline = new Date(endsStr + "T00:00:00");
    if (isNaN(deadline.getTime())) return Infinity;
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  function formatDeadline(endsStr) {
    if (!endsStr) return 'Ongoing';
    const match = endsStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `Ends: ${match[3]}.${match[2]}.${match[1]}`;
    }
    return `Ends: ${endsStr}`;
  }

  function sortDiscussions(docs, sortMode, uidStr) {
    return docs.slice().sort((a, b) => {
      const discA = a.data();
      const discB = b.data();
      
      if (sortMode === 'new') {
        const timeA = new Date(discA.last_message_timestamp || discA.created_at || 0).getTime();
        const timeB = new Date(discB.last_message_timestamp || discB.created_at || 0).getTime();
        return timeB - timeA; // Descending (newest first)
      } else if (sortMode === 'important') {
        const relA = (discA.relevance_scores && discA.relevance_scores[uidStr] !== undefined) ? discA.relevance_scores[uidStr] : 0;
        const relB = (discB.relevance_scores && discB.relevance_scores[uidStr] !== undefined) ? discB.relevance_scores[uidStr] : 0;
        return relB - relA; // Descending (highest relevance first)
      } else if (sortMode === 'urgent') {
        const daysA = getDaysUntil(discA.ends);
        const daysB = getDaysUntil(discB.ends);
        if (daysA === daysB) return 0;
        return daysA < daysB ? -1 : 1; // Ascending (nearest deadline first)
      }
      return 0;
    });
  }

  window.markDiscussionAsRead = function(topicId) {
    let doc = cachedChatDocs.find(d => d.id === topicId);
    let isVoting = false;
    if (!doc) {
      doc = cachedVotingDocs.find(d => d.id === topicId);
      isVoting = true;
    }
    if (!doc) return;
    const total = doc.data().message_count || 0;
    window.markDiscussionAsReadWithCount(topicId, total);

    if (isVoting) {
      let openedVotingIssues = {};
      try {
        openedVotingIssues = JSON.parse(localStorage.getItem('voting_opened_issues') || '{}');
      } catch (e) {}
      openedVotingIssues[topicId] = true;
      localStorage.setItem('voting_opened_issues', JSON.stringify(openedVotingIssues));
      if (typeof window.triggerVotingListRender === 'function') {
        window.triggerVotingListRender();
      }
    }
  };

  window.markDiscussionAsReadWithCount = function(topicId, count) {
    let readCounts = {};
    try {
      readCounts = JSON.parse(localStorage.getItem('chat_read_counts') || '{}');
    } catch (e) {}
    readCounts[topicId] = count;
    localStorage.setItem('chat_read_counts', JSON.stringify(readCounts));
    if (typeof window.triggerChatListRender === 'function') {
      window.triggerChatListRender();
    }
    if (typeof window.triggerVotingListRender === 'function') {
      window.triggerVotingListRender();
    }
  };

  const renderChatList = () => {
    let readCounts = {};
    try {
      readCounts = JSON.parse(localStorage.getItem('chat_read_counts') || '{}');
    } catch (e) {}

    // Calculate tag counts
    let totalNewMessages = 0;
    let totalImportant = 0;
    let totalUrgent = 0;
    
    cachedChatDocs.forEach(doc => {
      const disc = doc.data();
      const tid = doc.id;
      
      const total = disc.message_count || 0;
      const read = readCounts[tid] !== undefined ? readCounts[tid] : total;
      const unread = Math.max(0, total - read);
      totalNewMessages += unread;
      
      const rel = (disc.relevance_scores && disc.relevance_scores[storedUid] !== undefined) ? disc.relevance_scores[storedUid] : 0;
      if (rel > 0.50) {
        totalImportant++;
      }
      
      const days = getDaysUntil(disc.ends);
      if (days <= 6) {
        totalUrgent++;
      }
    });

    const sortedDocs = sortDiscussions(cachedChatDocs, chatSortMode, storedUid);
    
    let listHtml = '';
    sortedDocs.forEach(doc => {
      const disc = doc.data();
      const topicId = doc.id;
      
      const total = disc.message_count || 0;
      const read = readCounts[topicId] !== undefined ? readCounts[topicId] : total;
      const unreadCount = Math.max(0, total - read);
      const isUnread = unreadCount > 0;
      
      const relevanceVal = (disc.relevance_scores && disc.relevance_scores[storedUid] !== undefined)
        ? (disc.relevance_scores[storedUid] * 100).toFixed(0) + "%"
        : "N/A";
      const isrVal = (disc.isr_scores && disc.isr_scores[storedUid] !== undefined)
        ? disc.isr_scores[storedUid].toFixed(2)
        : ((disc.relevance_scores && disc.relevance_scores[storedUid] !== undefined) ? (disc.relevance_scores[storedUid] * 1.5).toFixed(2) : "N/A");
        
      const dateStr = disc.last_message_timestamp ? new Date(disc.last_message_timestamp).toLocaleDateString() : '';
      const nameIdStr = `${disc.last_message_sender_name || 'System'} (ID: ${disc.last_message_sender_uid || 'system'})`;
      const textStr = disc.last_message_text || '';
      
      const previewColor = isUnread ? 'color: var(--text); font-weight: 500;' : 'color: var(--text-muted);';
      
      // Calculate status flags for emojis
      const relVal = (disc.relevance_scores && disc.relevance_scores[storedUid] !== undefined) ? disc.relevance_scores[storedUid] : 0;
      const isImportant = relVal > 0.50;
      const days = getDaysUntil(disc.ends);
      const isUrgent = days <= 6;

      let emojiPrefix = '';
      if (isUnread) emojiPrefix += '🟢';
      if (isImportant) emojiPrefix += '⭐';
      if (isUrgent) emojiPrefix += '⚡';
      const prefix = emojiPrefix ? emojiPrefix + ' ' : '';

      const inactiveStyle = disc.status === 'inactive' ? 'text-decoration: line-through; opacity: 0.65;' : '';

      listHtml += `
        <button class="topic-item" data-topic-type="chat" data-topic-id="${topicId}" style="${inactiveStyle}">
          <div class="topic-header">
            <div class="topic-name-wrap">
              <span class="topic-name">${prefix}${disc.topic}</span>
            </div>
            <span class="topic-meta">${formatDeadline(disc.ends)} &nbsp;·&nbsp; Relevance: <b>${relevanceVal}</b> &nbsp;·&nbsp; ISR: <b>${isrVal}</b></span>
          </div>
          <div class="topic-preview" style="${previewColor} display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">
              <span style="font-weight: 600;">${dateStr} · ${nameIdStr}:</span> ${escapeHtml(textStr)}
            </span>
          </div>
        </button>
      `;
    });
    
    updateTopicListContainer('chat', listHtml);

    // Update filter tags inside DOM
    const tagsHtml = `
      <button class="${chatSortMode === 'new' ? 'active' : ''}" data-chat-sort="new">new: ${totalNewMessages}</button>
      <button class="${chatSortMode === 'important' ? 'active' : ''}" data-chat-sort="important">important: ${totalImportant}</button>
      <button class="${chatSortMode === 'urgent' ? 'active' : ''}" data-chat-sort="urgent">urgent: ${totalUrgent}</button>
    `;
    
    const sourceTags = document.querySelector('#section-chat .search-filter-tags');
    const modalTags = document.querySelector('#section-modal-overlay .search-filter-tags');
    if (sourceTags) sourceTags.innerHTML = tagsHtml;
    if (modalTags && currentSectionId === 'chat') modalTags.innerHTML = tagsHtml;

    // Update Dashboard chat card previews
    const dashChatCard = document.querySelector('.dash-card[data-section="chat"]');
    if (dashChatCard) {
      let badgesHtml = '';
      if (totalNewMessages > 0) {
        badgesHtml += `<span class="dash-badge">new: ${totalNewMessages}</span>`;
      }
      if (totalImportant > 0) {
        badgesHtml += `<span class="dash-badge">important: ${totalImportant}</span>`;
      }
      if (totalUrgent > 0) {
        badgesHtml += `<span class="dash-badge">urgent: ${totalUrgent}</span>`;
      }

      dashChatCard.innerHTML = `
        <div class="dash-card-topline">
          <div class="dash-card-title">Chat</div>
        </div>
        <div class="dash-card-badges">
          ${badgesHtml}
        </div>
      `;
      let count = 0;
      sortedDocs.forEach(doc => {
        if (count >= 3) return;
        const disc = doc.data();
        const topicId = doc.id;
        
        const total = disc.message_count || 0;
        const read = readCounts[topicId] !== undefined ? readCounts[topicId] : total;
        const unreadCount = Math.max(0, total - read);
        const isUnread = unreadCount > 0;
        
        const relVal = (disc.relevance_scores && disc.relevance_scores[storedUid] !== undefined) ? disc.relevance_scores[storedUid] : 0;
        const isImportant = relVal > 0.50;
        const days = getDaysUntil(disc.ends);
        const isUrgent = days <= 6;

        let emojiPrefix = '';
        if (isUnread) emojiPrefix += '🟢';
        if (isImportant) emojiPrefix += '⭐';
        if (isUrgent) emojiPrefix += '⚡';
        const prefix = emojiPrefix ? emojiPrefix + ' ' : '';

        const preview = document.createElement('div');
        preview.className = 'dash-card-preview';
        preview.style.cursor = 'pointer';
        if (disc.status === 'inactive') {
          preview.style.textDecoration = 'line-through';
          preview.style.opacity = '0.65';
        }
        preview.addEventListener('click', () => openSectionModal('chat'));
        
        const dateStr = disc.last_message_timestamp ? new Date(disc.last_message_timestamp).toLocaleDateString() : '';
        const textStr = disc.last_message_text || '';
        
        preview.innerHTML = `
          <div class="topic-line">
            <span class="topic-name">${prefix}${disc.topic}</span>
          </div>
          <div class="topic-preview" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            <b>${disc.last_message_sender_name || 'System'}:</b> ${escapeHtml(textStr)}
          </div>
        `;
        dashChatCard.appendChild(preview);
        count++;
      });
      const footer = document.createElement('div');
      footer.className = 'dash-card-footer-link';
      footer.textContent = `${Math.max(0, cachedChatDocs.length - 3)} more discussions →`;
      footer.style.cursor = 'pointer';
      footer.addEventListener('click', () => openSectionModal('chat'));
    }
  };

  window.triggerChatListRender = renderChatList;

    const renderVotingList = () => {
      let openedVotingIssues = {};
      try {
        openedVotingIssues = JSON.parse(localStorage.getItem('voting_opened_issues') || '{}');
      } catch (e) {}

      // Calculate tag counts
      let totalNewMessages = 0;
      let totalImportant = 0;
      let totalUrgent = 0;
      
      cachedVotingDocs.forEach(doc => {
        const issue = doc.data();
        const tid = doc.id;
        
        const isUnread = !openedVotingIssues[tid];
        if (isUnread) {
          totalNewMessages++;
        }
        
        const rel = (issue.relevance_scores && issue.relevance_scores[storedUid] !== undefined) ? issue.relevance_scores[storedUid] : 0;
        if (rel > 0.50) {
          totalImportant++;
        }
        
        const days = getDaysUntil(issue.ends);
        if (days <= 3) {
          totalUrgent++;
        }
      });

      const sortedDocs = sortDiscussions(cachedVotingDocs, votingSortMode, storedUid);
      
      let listHtml = '';
      sortedDocs.forEach(doc => {
        const issue = doc.data();
        const topicId = doc.id;
        
        const isUnread = !openedVotingIssues[topicId];
        
        const relevanceVal = (issue.relevance_scores && issue.relevance_scores[storedUid] !== undefined)
          ? (issue.relevance_scores[storedUid] * 100).toFixed(0) + "%"
          : "N/A";
        const isrVal = (issue.isr_scores && issue.isr_scores[storedUid] !== undefined)
          ? issue.isr_scores[storedUid].toFixed(2)
          : ((issue.relevance_scores && issue.relevance_scores[storedUid] !== undefined) ? (issue.relevance_scores[storedUid] * 1.5).toFixed(2) : "N/A");
          
        const dateStr = issue.last_message_timestamp ? new Date(issue.last_message_timestamp).toLocaleDateString() : '';
        const nameIdStr = `${issue.last_message_sender_name || 'System'} (ID: ${issue.last_message_sender_uid || 'system'})`;
        const textStr = issue.last_message_text || '';
        
        const previewColor = isUnread ? 'color: var(--text); font-weight: 500;' : 'color: var(--text-muted);';
        
        // Calculate status flags for emojis
        const relVal = (issue.relevance_scores && issue.relevance_scores[storedUid] !== undefined) ? issue.relevance_scores[storedUid] : 0;
        const isImportant = relVal > 0.50;
        const days = getDaysUntil(issue.ends);
        const isUrgent = days <= 3;
        const hasVoted = issue.votes && issue.votes[storedUid] !== undefined;
        const shouldVoteUrgently = isUrgent && !hasVoted;

        let emojiPrefix = '';
        if (isUnread) emojiPrefix += '🟢';
        if (isImportant) emojiPrefix += '⭐';
        if (isUrgent) emojiPrefix += '⚡';
        if (shouldVoteUrgently) emojiPrefix += '🚨';
        const prefix = emojiPrefix ? emojiPrefix + ' ' : '';
        const voteIcon = hasVoted ? '✅' : '🗳️';
        const inactiveStyle = issue.status === 'inactive' ? 'text-decoration: line-through; opacity: 0.65;' : '';

        listHtml += `
          <button class="topic-item" data-topic-type="voting" data-topic-id="${topicId}" style="${inactiveStyle}">
            <div class="topic-header">
              <div class="topic-name-wrap">
                <span class="topic-name">${prefix}${voteIcon} ${issue.title}</span>
              </div>
              <span class="topic-meta">${formatDeadline(issue.ends)} &nbsp;·&nbsp; Relevance: <b>${relevanceVal}</b> &nbsp;·&nbsp; ISR: <b>${isrVal}</b></span>
            </div>
            <div class="topic-preview" style="${previewColor} display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">
                <span style="font-weight: 600;">${dateStr} • ${nameIdStr}:</span> ${escapeHtml(textStr)}
              </span>
            </div>
          </button>
        `;
      });
      
      updateTopicListContainer('voting', listHtml);

      // Update filter tags inside DOM for voting
      const tagsHtml = `
        <button class="${votingSortMode === 'new' ? 'active' : ''}" data-voting-sort="new">new: ${totalNewMessages}</button>
        <button class="${votingSortMode === 'important' ? 'active' : ''}" data-voting-sort="important">important: ${totalImportant}</button>
        <button class="${votingSortMode === 'urgent' ? 'active' : ''}" data-voting-sort="urgent">urgent: ${totalUrgent}</button>
      `;
      
      const sourceTags = document.querySelector('#section-voting .search-filter-tags');
      const modalTags = document.querySelector('#section-modal-overlay .search-filter-tags');
      if (sourceTags) sourceTags.innerHTML = tagsHtml;
      if (modalTags && currentSectionId === 'voting') modalTags.innerHTML = tagsHtml;
    };

    window.triggerVotingListRender = renderVotingList;

    document.addEventListener('click', function(e) {
      const target = e.target.closest('[data-chat-sort]');
      if (target) {
        e.preventDefault();
        chatSortMode = target.getAttribute('data-chat-sort');
        renderChatList();
      }
    });

    document.addEventListener('click', function(e) {
      const target = e.target.closest('[data-voting-sort]');
      if (target) {
        e.preventDefault();
        votingSortMode = target.getAttribute('data-voting-sort');
        renderVotingList();
      }
    });

  // 1. Discussions Sync (Chat)
  db.collection("discussions").orderBy("created_at", "desc").onSnapshot(async snapshot => {
    const relevantIds = await getRelevantDiscussionIds(db, storedUid);
    
    const filteredDocs = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const topicId = doc.id;
      
      // Auto-transition check for deadline
      const isExpired = data.ends && data.ends !== 'Ongoing' && getDaysUntil(data.ends) <= 0;
      
      if (data.status === 'inactive') {
        if (data.previous_status !== 'discussion') {
          return;
        }
      } else if (data.status === 'Voting' || isExpired) {
        if (isExpired && data.status !== 'Voting') {
          // Trigger transition
          checkAndTransitionExpiredDiscussion(topicId, data);
        }
        // closed as discussion (exclude from chat list)
        return;
      }
      
      if (relevantIds.has(topicId)) {
        filteredDocs.push(doc);
      }
    });

    cachedChatDocs = filteredDocs;
    discussionsCount = filteredDocs.length;
    updateSummaryStrip();
    
    // Initialize mock read counts in localStorage if not present
    let readCounts = {};
    try {
      readCounts = JSON.parse(localStorage.getItem('chat_read_counts') || '{}');
    } catch (e) {}
    
    let initializedNew = false;
    filteredDocs.forEach((doc, idx) => {
      const tid = doc.id;
      const total = doc.data().message_count || 0;
      if (readCounts[tid] === undefined) {
        // ~30% are unread
        if (idx % 3 === 0 && total > 1) {
          const unreadCount = Math.min(total - 1, Math.floor(Math.random() * 3) + 1);
          readCounts[tid] = total - unreadCount;
        } else {
          readCounts[tid] = total;
        }
        initializedNew = true;
      }
    });
    if (initializedNew) {
      localStorage.setItem('chat_read_counts', JSON.stringify(readCounts));
    }
    
    renderChatList();
  }, err => console.error("Sync discussions failed:", err));

  // 2. Issues Sync (Voting & Tasks)
  db.collection("issues").orderBy("created_at", "desc").limit(30).onSnapshot(async snapshot => {
    const relevantIds = await getRelevantDiscussionIds(db, storedUid);
    const votingDocs = [];
    const taskDocs = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const topicId = doc.id;
      if (relevantIds.has(topicId)) {
        if (data.status === 'in_process' || (data.status === 'inactive' && data.previous_status === 'in_process')) {
          votingDocs.push(doc);
        }
        if (data.status === 'tasks' || data.status === 'approved' || (data.status === 'inactive' && (data.previous_status === 'approved' || data.previous_status === 'tasks'))) {
          taskDocs.push(doc);
        }
      }
    });

    cachedVotingDocs = votingDocs;
    activeIssuesCount = votingDocs.length;
    updateSummaryStrip();
    
    // Render the voting issues using the aligned card formats and tags
    renderVotingList();
    
    let taskHtml = '';
    taskDocs.forEach(doc => {
      const issue = doc.data();
      const topicId = doc.id;
      
      const tasks = issue.tasks || [];
      const currentUserId = safeGetStorage('userId');
      const hasUnfinishedUserTask = tasks.some(t => {
        return (t.in_charge_uid || '').toString() === (currentUserId || '').toString() && t.status !== 'done';
      });
      
      const urgentTask = getMostUrgentTask(tasks);
      const isUrgent = urgentTask && isUrgentDate(urgentTask.deadline);
      
      const emojiPrefix = (isUrgent ? '⚠️' : '') + (hasUnfinishedUserTask ? '📋 ' : '');
      
      const secondRowHtml = urgentTask
        ? `Next: ${urgentTask.step} (Deadline: ${formatTaskDeadline(urgentTask.deadline)})`
        : '✅ All tasks completed';

      const inactiveStyle = issue.status === 'inactive' ? 'text-decoration: line-through; opacity: 0.65;' : '';

      taskHtml += `
        <button class="topic-item" data-topic-type="tasks" data-topic-id="${topicId}" style="${inactiveStyle}">
          <div class="topic-header" style="display: flex; flex-direction: column; align-items: flex-start; gap: 4px;">
            <span class="topic-name" style="font-weight: 700; text-align: left;">${emojiPrefix}${issue.title}</span>
            <span class="topic-meta" style="font-size: 0.85rem; color: var(--text-soft); font-weight: normal; text-align: left;">
              ${secondRowHtml}
            </span>
          </div>
        </button>
      `;
    });
    updateTopicListContainer('tasks', taskHtml);
    
    const dashVotingCard = document.querySelector('.dash-card[data-section="voting"]');
    if (dashVotingCard) {
      let openedVotingIssues = {};
      try {
        openedVotingIssues = JSON.parse(localStorage.getItem('voting_opened_issues') || '{}');
      } catch (e) {}

      let dashboardNewCount = 0;
      let dashboardImportantNotVotedCount = 0;
      let dashboardUrgentNotVotedCount = 0;

      votingDocs.forEach(doc => {
        const issue = doc.data();
        const topicId = doc.id;

        const isUnread = !openedVotingIssues[topicId];
        const hasVoted = issue.votes && issue.votes[storedUid] !== undefined;

        if (isUnread) {
          dashboardNewCount++;
        }

        const relVal = (issue.relevance_scores && issue.relevance_scores[storedUid] !== undefined) ? issue.relevance_scores[storedUid] : 0;
        const isImportant = relVal > 0.50;

        if (isImportant && !hasVoted) {
          dashboardImportantNotVotedCount++;
        }

        const days = getDaysUntil(issue.ends);
        const isUrgent = days <= 3;

        if (isUrgent && !hasVoted) {
          dashboardUrgentNotVotedCount++;
        }
      });

      let badgesHtml = '';
      if (dashboardNewCount > 0) {
        badgesHtml += `<span class="dash-badge">new: ${dashboardNewCount}</span>`;
      }
      if (dashboardImportantNotVotedCount > 0) {
        badgesHtml += `<span class="dash-badge">important: ${dashboardImportantNotVotedCount}</span>`;
      }
      if (dashboardUrgentNotVotedCount > 0) {
        badgesHtml += `<span class="dash-badge dash-badge-urgent">urgent: ${dashboardUrgentNotVotedCount}</span>`;
      }

      dashVotingCard.innerHTML = `
        <div class="dash-card-topline">
          <div class="dash-card-title">Voting</div>
        </div>
        <div class="dash-card-badges">
          ${badgesHtml}
        </div>
      `;

      let count = 0;
      votingDocs.forEach(doc => {
        if (count >= 3) return;
        const issue = doc.data();
        const topicId = doc.id;
        
        const isUnread = !openedVotingIssues[topicId];
        
        const relVal = (issue.relevance_scores && issue.relevance_scores[storedUid] !== undefined) ? issue.relevance_scores[storedUid] : 0;
        const isImportant = relVal > 0.50;
        const days = getDaysUntil(issue.ends);
        const isUrgent = days <= 3;
        const hasVoted = issue.votes && issue.votes[storedUid] !== undefined;
        const shouldVoteUrgently = isUrgent && !hasVoted;

        let emojiPrefix = '';
        if (isUnread) emojiPrefix += '🟢';
        if (isImportant) emojiPrefix += '⭐';
        if (isUrgent) emojiPrefix += '⚡';
        if (shouldVoteUrgently) emojiPrefix += '🚨';
        const prefix = emojiPrefix ? emojiPrefix + ' ' : '';
        const voteIcon = hasVoted ? '✅' : '🗳️';

        const preview = document.createElement('div');
        preview.className = 'dash-card-preview';
        preview.style.cursor = 'pointer';
        if (issue.status === 'inactive') {
          preview.style.textDecoration = 'line-through';
          preview.style.opacity = '0.65';
        }
        preview.addEventListener('click', () => openSectionModal('voting'));
        preview.innerHTML = `
          <div class="topic-line">
            <span class="topic-name">${prefix}${voteIcon} ${issue.title}</span>
          </div>
          <div class="topic-preview">Status: <b>${issue.status || 'Voting'}</b> · Submitter: <b>${issue.submitter_id}</b></div>
        `;
        dashVotingCard.appendChild(preview);
        count++;
      });
    }

    const dashTasksCard = document.querySelector('.dash-card[data-section="tasks"]');
    if (dashTasksCard) {
      dashTasksCard.innerHTML = `
        <div class="dash-card-topline">
          <div class="dash-card-title">To Do</div>
        </div>
      `;
      let count = 0;
      taskDocs.forEach(doc => {
        if (count >= 3) return;
        const issue = doc.data();
        const topicId = doc.id;
        
        const tasks = issue.tasks || [];
        const currentUserId = safeGetStorage('userId');
        const hasUnfinishedUserTask = tasks.some(t => {
          return (t.in_charge_uid || '').toString() === (currentUserId || '').toString() && t.status !== 'done';
        });
        
        const urgentTask = getMostUrgentTask(tasks);
        const isUrgent = urgentTask && isUrgentDate(urgentTask.deadline);
        
        const emojiPrefix = (isUrgent ? '⚠️' : '') + (hasUnfinishedUserTask ? '📋 ' : '');
        
        const secondRowHtml = urgentTask
          ? `Next: ${urgentTask.step} (Deadline: ${formatTaskDeadline(urgentTask.deadline)})`
          : '✅ All tasks completed';

        const preview = document.createElement('div');
        preview.className = 'dash-card-preview';
        preview.style.cursor = 'pointer';
        if (issue.status === 'inactive') {
          preview.style.textDecoration = 'line-through';
          preview.style.opacity = '0.65';
        }
        preview.addEventListener('click', () => openSectionModal('tasks'));
        preview.innerHTML = `
          <div class="topic-line">
            <span class="topic-name">${emojiPrefix}${issue.title}</span>
          </div>
          <div class="topic-preview" style="font-size: 0.85rem; color: var(--text-soft); padding-top: 2px;">
            ${secondRowHtml}
          </div>
        `;
        dashTasksCard.appendChild(preview);
        count++;
      });
    }
  }, err => console.error("Sync issues/tasks failed:", err));
}

function initMainPage() {
  const menuButton = document.getElementById('menu-button');
  const menu = document.getElementById('menu');
  const logo = document.getElementById('logo');
  const overlay = document.getElementById('section-modal-overlay');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  if (!menuButton || !menu) return;

  const storedUid = safeGetStorage('userId');
  const isGuest = !storedUid;

  const nameEl = menuButton.querySelector('.menu-user-name');
  const avatarEl = menuButton.querySelector('.initials-avatar');
  const logoutLink = document.getElementById('logout-link');

  if (isGuest) {
    if (nameEl) nameEl.textContent = "Login / Register";
    if (avatarEl) avatarEl.textContent = "?";
    if (logoutLink) logoutLink.style.display = 'none';

    // Auto start quick tour after 1 second if not completed
    setTimeout(function() {
      const tourCompleted = safeGetStorage('tourCompleted');
      if (tourCompleted !== 'true') {
        startQuickTour();
      }
    }, 1000);
  } else {
    if (logoutLink) logoutLink.style.display = 'block';
  }

  // Load profile dynamically from Firestore
  if (typeof firebase !== 'undefined' && !isGuest) {
    const db = firebase.firestore();
    
    // Start real-time synchronization of dashboard and tab content
    initRealTimeDashboardSync(db, storedUid);

    db.collection("users").doc(storedUid).get().then(doc => {
      if (!doc.exists) return;
      const user = doc.data();

      // Update name and avatar
      if (nameEl) nameEl.textContent = user.displayName;
      if (avatarEl) {
        const initials = (user.displayName || "")
          .split(' ')
          .filter(Boolean)
          .map(part => part.charAt(0).toUpperCase())
          .join('')
          .slice(0, 2);
        avatarEl.textContent = initials || 'U';
      }

      // Populate values description (Issue 4)
      const valuesTextDisplays = document.querySelectorAll('#values-text-display');
      const valuesTextareas = document.querySelectorAll('#values-textarea');
      
      let formattedHtml = "";
      let rawText = "";

      if (user.values_description) {
        rawText = user.values_description;
        formattedHtml = user.values_description
          .split(/\n\s*\n/)
          .map(p => p.trim())
          .filter(p => p.length > 0)
          .map(p => `<p>${escapeHtml(p)}</p>`)
          .join('');
      } else if (user.values_taxonomy) {
        const desc = generateValuesDescription(user.values_taxonomy);
        formattedHtml = desc;
        rawText = desc.replace(/<p>/g, '').replace(/<\/p>/g, '\n\n').trim();
      }

      valuesTextareas.forEach(ta => ta.value = rawText);
      valuesTextDisplays.forEach(td => td.innerHTML = formattedHtml);

      // Update Profile Section UI
      const profileSection = document.getElementById('section-profile');
      if (profileSection) {
        const geoLines = (user.geography || []).map(g => {
          const coords = g.geo ? g.geo.map(num => num.toFixed(4)).join(', ') : 'N/A';
          return `<li><strong>${g.type ? g.type.toUpperCase() : 'ANCHOR'}</strong>: ${g.place || ''} (${g.address || ''}) [${coords}] ${g.unit_type ? '· Unit: ' + g.unit_type : ''}</li>`;
        }).join('');

        const socialLines = (user.socialRelations || []).map(s => {
          return `<li><strong>${s.type ? s.type.toUpperCase() : 'RELATIVE'}</strong>: User ID ${s.relative} ${s.tie ? '(Tie: ' + s.tie + ')' : ''}</li>`;
        }).join('');

        const featureLines = (user.features || []).map(f => `<li>${f}</li>`).join('');

        const skillLines = (user.skills || []).map(s => {
          if (s.type === 'work experience') {
            return `<li><strong>WORK EXPERIENCE</strong>: ${s.comment || 'N/A'} ${s.time ? '· Duration: ' + s.time + ' yr(s)' : ''}</li>`;
          }
          return `<li><strong>${s.type ? s.type.toUpperCase() : 'SKILL'}</strong>: ${s.name || ''} ${s.educationLevel ? '· Level: ' + s.educationLevel : ''} ${s.specialization ? '· Specialization: ' + s.specialization : ''}</li>`;
        }).join('');

        const postLines = (user.post || []).map(p => {
          return `<li><strong>JOB</strong>: ${p.job || ''} · Place: ${p.place || ''} · Department: ${p.department || ''} · Salary: ${p.salary || ''}</li>`;
        }).join('');

        profileSection.innerHTML = `
          <p>Demographics: <button type="button">Change</button></p>
          <div class="values-text-card">
            <ul>
              <li>First Name: ${user.firstName || ''}</li>
              <li>Last Name: ${user.lastName || ''}</li>
              <li>UID: ${user.uid || ''}</li>
              <li>Birth Date: ${user.birthDate || ''}</li>
              <li>Gender: ${user.gender || ''}</li>
              <li>Nationality: ${user.nationality || ''}</li>
            </ul>
          </div>
          <p>Addresses & Anchors: <button type="button">Change</button></p>
          <div class="values-text-card">
            <ul>
              ${geoLines || '<li>No address anchors specified</li>'}
            </ul>
          </div>
          <p>Social Relations: <button type="button">Change</button></p>
          <div class="values-text-card">
            <ul>
              ${socialLines || '<li>No social relations specified</li>'}
            </ul>
          </div>
          <p>Work Experience & Skills: <button type="button">Change</button></p>
          <div class="values-text-card">
            <ul>
              ${postLines}
              ${skillLines || '<li>No skills/experience specified</li>'}
            </ul>
          </div>
          <p>Features: <button type="button">Change</button></p>
          <div class="values-text-card">
            <ul>
              ${featureLines || '<li>No features specified</li>'}
            </ul>
          </div>
          <button type="button">Explain with AI</button>
        `;
      }

      // Cache Core Values Taxonomy for chart
      if (user.values_taxonomy) {
        const taxonomy = user.values_taxonomy;
        window.currentUserValues = {
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
            work: taxonomy.contextual_shifts.work || [0,0,0,0,0,0,0,0,0,0],
            family: taxonomy.contextual_shifts.family || [0,0,0,0,0,0,0,0,0,0],
            private: taxonomy.contextual_shifts.private || [0,0,0,0,0,0,0,0,0,0],
            crisis: taxonomy.contextual_shifts.crisis || [0,0,0,0,0,0,0,0,0,0]
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
        window.loggedInUserValues = window.currentUserValues;
      }
    }).catch(err => console.error("Firestore user profile load failed:", err));
  }

  menuButton.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    const currentUserId = safeGetStorage('userId');
    if (!currentUserId) {
      const loginOverlay = document.getElementById('login-modal-overlay');
      if (loginOverlay) loginOverlay.hidden = false;
      return;
    }
    menu.classList.toggle('menu-open');
  });

  const tourLink = document.getElementById('run-tour-link');
  if (tourLink) {
    tourLink.addEventListener('click', function(e) {
      e.preventDefault();
      menu.classList.remove('menu-open');
      startQuickTour();
    });
  }

  const logoutLinkBtn = document.getElementById('logout-link');
  if (logoutLinkBtn) {
    logoutLinkBtn.addEventListener('click', function(e) {
      e.preventDefault();
      safeSetStorage('userId', '');
      safeSetStorage('userName', '');
      window.location.reload();
    });
  }

  document.addEventListener('click', function (e) {
    if (!menuButton.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('menu-open');
    }
  });

  if (logo) {
    logo.addEventListener('click', function () {
      window.location.reload();
    });
  }

  document.querySelectorAll('[data-section]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      openSectionModal(this.getAttribute('data-section'));
    });
  });

  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeSectionModal();
    });
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeSectionModal);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeSectionModal();
      menu.classList.remove('menu-open');
    }
  });

  initValuesSection();
  initValuesVectorModal();
  initTopicDetailViews();
}

function bindValuesSection(container) {
  var editBtn = container.querySelector('#values-edit-btn');
  var explainBtn = container.querySelector('#values-explain-btn');
  var saveBtn = container.querySelector('#values-save-btn');
  var cancelBtn = container.querySelector('#values-cancel-btn');

  var viewMode = container.querySelector('#values-view-mode');
  var editMode = container.querySelector('#values-edit-mode');

  var textDisplay = container.querySelector('#values-text-display');
  var textarea = container.querySelector('#values-textarea');

  var aiCard = container.querySelector('#values-ai-card');
  var aiInput = container.querySelector('#values-ai-input');
  var aiSendBtn = container.querySelector('#values-ai-send-btn');
  var aiMessages = container.querySelector('#values-ai-messages');

  if (!editBtn || !saveBtn || !cancelBtn || !viewMode || !editMode || !textDisplay || !textarea) {
    return;
  }

  var originalValue = textarea.value;

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderDisplayFromTextarea(value) {
    var paragraphs = value
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

  function enterEditMode() {
    originalValue = textarea.value;
    document.querySelectorAll('#values-view-mode').forEach(el => el.hidden = true);
    document.querySelectorAll('#values-edit-mode').forEach(el => el.hidden = false);
    textarea.focus();
  }

  function exitEditMode() {
    document.querySelectorAll('#values-edit-mode').forEach(el => el.hidden = true);
    document.querySelectorAll('#values-view-mode').forEach(el => el.hidden = false);
  }

  function appendMessage(text, role) {
    document.querySelectorAll('#values-ai-messages').forEach(aiMsgs => {
      var msg = document.createElement('div');
      msg.className = 'ai-msg ' + (role === 'user' ? 'ai-msg-user' : 'ai-msg-assistant');
      msg.textContent = text;
      aiMsgs.appendChild(msg);
      aiMsgs.scrollTop = aiMsgs.scrollHeight;
    });
  }

  function handleAiSend() {
    if (!aiInput) return;

    var value = aiInput.value.trim();
    if (!value) return;

    appendMessage(value, 'user');
    document.querySelectorAll('#values-ai-input').forEach(input => input.value = '');

    if (/survey/i.test(value)) {
      appendMessage(
        'Great. We can run a short follow-up survey to better ground the values that still look vague across social-process domains.',
        'assistant'
      );
    } else if (/person|reflect|use |havel|mandela|arendt|frankl/i.test(value)) {
      appendMessage(
        'Understood. Name a public figure, philosopher, or community leader, and I will use that person only as a reflection point to test proximity to your stated values.',
        'assistant'
      );
    } else {
      appendMessage(
        'Let’s clarify the weakest areas first. You can describe where you stand on freedom versus safety, justice versus mercy, or individual choice versus community responsibility.',
        'assistant'
      );
    }
  }

  editBtn.addEventListener('click', enterEditMode);

  saveBtn.addEventListener('click', async function () {
    const currentUserId = safeGetStorage('userId');
    if (!currentUserId) {
      const loginOverlay = document.getElementById('login-modal-overlay');
      if (loginOverlay) loginOverlay.hidden = false;
      alert("Please adopt a profile or register to save values.");
      return;
    }
    const newText = textarea.value;
    renderDisplayFromTextarea(newText);
    exitEditMode();
    
    if (typeof firebase !== 'undefined') {
      const db = firebase.firestore();
      if (currentUserId) {
        try {
          await db.collection("users").doc(currentUserId).update({
            values_description: newText
          });
          appendMessage('Saved your updated values description to your profile.', 'assistant');
        } catch (err) {
          console.error("Failed to save values description:", err);
          appendMessage('Failed to save values description: ' + err.message, 'assistant');
        }
      }
    }
  });

  cancelBtn.addEventListener('click', function () {
    document.querySelectorAll('#values-textarea').forEach(el => el.value = originalValue);
    exitEditMode();
  });

  if (explainBtn && aiCard && aiInput) {
    explainBtn.addEventListener('click', function () {
      aiCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      aiInput.focus();
    });
  }

  if (aiSendBtn) {
    aiSendBtn.addEventListener('click', handleAiSend);
  }

  if (aiInput) {
    aiInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAiSend();
      }
    });
  }
}

function startQuickTour() {
  const tourOverlay = document.getElementById('tour-overlay');
  const tourBubble = document.getElementById('tour-bubble');
  const tourText = document.getElementById('tour-bubble-text');
  const tourStepInd = document.getElementById('tour-step-indicator');
  const prevBtn = document.getElementById('tour-prev-btn');
  const nextBtn = document.getElementById('tour-next-btn');
  const skipBtn = document.getElementById('tour-skip-btn');
  const closeBtn = document.getElementById('tour-close-btn-bubble');

  if (!tourOverlay || !tourBubble || !tourText) return;

  const steps = [
    {
      title: "Welcome to ISR!",
      text: "This Index of Social Responsibility prototype helps groups align decisions with shared microcommunity values. Let's take a quick 1-minute tour of how it works!",
      target: null
    },
    {
      title: "AI Guidance",
      text: "Here, your personalized AI assistant suggests issues that match your background and profile, guiding your attention to where you are most relevant.",
      target: ".ai-guidance-card"
    },
    {
      title: "Governance Readiness",
      text: "This card tracks your profile completeness and helps you express your worldview through the microcommunity values vector.",
      target: ".governance-readiness-card"
    },
    {
      title: "Interactive Dashboard",
      text: "The heart of the app: view active <b>Voting</b>, debate issues in the <b>Chat</b>, and track execution steps in the <b>To Do</b> list.",
      target: ".dashboard-grid-primary"
    },
    {
      title: "Login / Adopt Profile",
      text: "Ready to test the alignment algorithms? Click here to adopt a database profile or log in with your own account!",
      target: "#menu-button"
    }
  ];

  let currentStep = 0;
  tourOverlay.hidden = false;

  const removeHighlights = () => {
    document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
  };

  const showStep = (idx) => {
    removeHighlights();
    const step = steps[idx];
    tourText.innerHTML = `<h3>${step.title}</h3>${step.text}`;
    tourStepInd.textContent = `Step ${idx + 1} of ${steps.length}`;

    prevBtn.disabled = idx === 0;
    nextBtn.textContent = idx === steps.length - 1 ? "Finish" : "Next";

    if (step.target) {
      const targetEl = document.querySelector(step.target);
      if (targetEl) {
        targetEl.classList.add('tour-highlight');
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Position the bubble relative to target
        setTimeout(() => {
          const rect = targetEl.getBoundingClientRect();
          const bubbleWidth = tourBubble.offsetWidth || 320;

          if (step.target === "#menu-button") {
            tourBubble.style.position = 'fixed';
            tourBubble.style.top = (rect.bottom + 12) + 'px';
            tourBubble.style.left = (rect.right - bubbleWidth) + 'px';
            tourBubble.style.transform = 'none';
          } else {
            tourBubble.style.position = 'absolute';
            tourBubble.style.top = (window.scrollY + rect.bottom + 12) + 'px';
            tourBubble.style.left = (window.scrollX + rect.left + (rect.width - bubbleWidth)/2) + 'px';
            tourBubble.style.transform = 'none';
          }
        }, 300);
        return;
      }
    }

    // Default center placement
    tourBubble.style.position = 'fixed';
    tourBubble.style.top = '50%';
    tourBubble.style.left = '50%';
    tourBubble.style.transform = 'translate(-50%, -50%)';
  };

  const endTour = () => {
    removeHighlights();
    tourOverlay.hidden = true;
    safeSetStorage('tourCompleted', 'true');
  };

  nextBtn.onclick = () => {
    if (currentStep < steps.length - 1) {
      currentStep++;
      showStep(currentStep);
    } else {
      endTour();
    }
  };

  prevBtn.onclick = () => {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  };

  skipBtn.onclick = endTour;
  closeBtn.onclick = endTour;

  showStep(currentStep);
}

function initValuesSection() {
  bindValuesSection(document.getElementById('section-values'));
}

window.bindValuesSection = bindValuesSection;

function initApp() {
  if (document.getElementById('menu-button') && document.getElementById('menu')) {
    initMainPage();
  }
  if (document.getElementById('login-username') || document.getElementById('search-profiles-btn')) {
    initLoginPage();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}