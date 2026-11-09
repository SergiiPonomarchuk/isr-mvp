
// Initialize Firebase
if (typeof firebase !== 'undefined') {
  const config = window.firebaseConfig || (typeof firebaseConfig !== 'undefined' ? firebaseConfig : null);
  if (config && !firebase.apps.length) {
    firebase.initializeApp(config);
  }
  // Opt-in for local testing (A2): open http://localhost:5000/?emulator=1 to use the
  // Firestore emulator (port 8080) instead of the live project. Remembered per tab.
  try {
    const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    if (isLocal && new URLSearchParams(window.location.search).get('emulator') === '1') {
      sessionStorage.setItem('useFirestoreEmulator', '1');
    }
    if (isLocal && sessionStorage.getItem('useFirestoreEmulator') === '1' && firebase.apps.length) {
      firebase.firestore().useEmulator('127.0.0.1', 8080);
      console.info('Using the Firestore emulator at 127.0.0.1:8080');
    }
  } catch (e) {
    console.warn('Firestore emulator switch failed:', e);
  }
}

const sectionTitles = {
  chat: 'Chat',
  voting: 'Voting',
  tasks: 'To Do',
  values: 'Values',
  profile: 'Profile',
  settings: 'Settings',
  actions: 'Actions'
};

var staticTasksMockData = {
  "task-1": {
    title: "Fence door renew",
    description: "Replace the broken wooden door on the northern fence line with a modern metal frame door. Secure locking mechanism to be integrated.",
    status: "approved",
    ends: "2026-04-01",
    submitter_id: "System",
    created_at: "2026-01-10T00:00:00Z",
    participants: ["1", "2", "3"],
    relevance_scores: { "1": 0.95 },
    isr_scores: { "1": 1.07 },
    tasks: [
      { step: "Collect contractor quotes", status: "done", in_charge_uid: "2", in_charge_name: "Iryna V.", deadline: "2026-02-28", marks: [], results: "Got quotes from 3 local suppliers." },
      { step: "Approve budget at next meeting", status: "in_process", in_charge_uid: "1", in_charge_name: "Sergey B.", deadline: "2026-03-18", marks: [] },
      { step: "Install new door", status: "pending", in_charge_uid: "3", in_charge_name: "Andrii D.", deadline: "2026-04-01", marks: [] }
    ],
    options: [
      { label: "Option A: Local Direct Fix", score: 4.65, author_name: "Iryna V.", budget: "€250", description: [] },
      { label: "Option B: External Contractor Hire", score: 0.00, author_name: "System", budget: "€600", description: [] }
    ],
    winning_option_index: 0,
    messages: []
  },
  "task-2": {
    title: "Ladders to 1st entrance",
    description: "Procure and install heavy-duty aluminum step ladders to the first entrance side ramp to facilitate delivery drivers.",
    status: "tasks",
    ends: "2026-05-25",
    submitter_id: "System",
    created_at: "2026-02-05T00:00:00Z",
    participants: ["1", "4"],
    relevance_scores: { "1": 0.65 },
    isr_scores: { "1": 0.77 },
    tasks: [
      { step: "Safety inspection", status: "in_process", in_charge_uid: "4", in_charge_name: "Audrey T.", deadline: "2026-05-15", marks: [] },
      { step: "Order replacement parts", status: "pending", in_charge_uid: "1", in_charge_name: "Sergey B.", deadline: "2026-05-25", marks: [] }
    ],
    options: [],
    winning_option_index: null,
    messages: []
  },
  "task-3": {
    title: "Studio rental contract extension",
    description: "Negotiate lease extension terms for the community choreography studio room with the building association landlord.",
    status: "tasks",
    ends: "2026-07-01",
    submitter_id: "System",
    created_at: "2026-03-01T00:00:00Z",
    participants: ["2", "4"],
    relevance_scores: { "1": 0.48 },
    isr_scores: { "1": 1.42 },
    tasks: [
      { step: "Review current lease terms", status: "done", in_charge_uid: "2", in_charge_name: "Iryna V.", deadline: "2026-04-10", marks: [], results: "Reviewed. Found €15/hour flat rate." },
      { step: "Negotiate new rate", status: "in_process", in_charge_uid: "4", in_charge_name: "Audrey T.", deadline: "2026-05-01", marks: [] },
      { step: "Sign updated contract", status: "pending", in_charge_uid: "4", in_charge_name: "Audrey T.", deadline: "2026-07-01", marks: [] }
    ],
    options: [],
    winning_option_index: null,
    messages: []
  },
  "task-4": {
    title: "After-school program funding",
    description: "Organize parent association fundraising campaign and apply for the local district grant to support the weekly after-school educational kids club.",
    status: "tasks",
    ends: "2026-05-10",
    submitter_id: "System",
    created_at: "2026-01-20T00:00:00Z",
    participants: ["1", "2"],
    relevance_scores: { "1": 0.88 },
    isr_scores: { "1": 0.93 },
    tasks: [
      { step: "Draft budget proposal", status: "done", in_charge_uid: "1", in_charge_name: "Sergey B.", deadline: "2026-03-20", marks: [], results: "Drafted proposal requesting €2000." },
      { step: "Present to parent committee", status: "done", in_charge_uid: "1", in_charge_name: "Sergey B.", deadline: "2026-04-02", marks: [], results: "Approved by committee unanimously." },
      { step: "Apply for district grant", status: "in_process", in_charge_uid: "2", in_charge_name: "Iryna V.", deadline: "2026-04-15", marks: [] },
      { step: "Hire program coordinator", status: "pending", in_charge_uid: "1", in_charge_name: "Sergey B.", deadline: "2026-05-10", marks: [] }
    ],
    options: [],
    winning_option_index: null,
    messages: []
  },
  "task-5": {
    title: "Switch CI/CD to GitHub Actions",
    description: "Decommission Jenkins server and write native GitHub Actions workflows for continuous integration build and test pipelines.",
    status: "tasks",
    ends: "2026-06-01",
    submitter_id: "System",
    created_at: "2026-02-15T00:00:00Z",
    participants: ["5", "1"],
    relevance_scores: { "1": 0.91 },
    isr_scores: { "1": 1.15 },
    tasks: [
      { step: "Audit existing Jenkins pipelines", status: "done", in_charge_uid: "5", in_charge_name: "Elon M.", deadline: "2026-05-05", marks: [], results: "Audited. Found 12 distinct build configurations." },
      { step: "Write GitHub Actions workflows", status: "in_process", in_charge_uid: "1", in_charge_name: "Sergey B.", deadline: "2026-05-20", marks: [] },
      { step: "Decommission Jenkins server", status: "pending", in_charge_uid: "5", in_charge_name: "Elon M.", deadline: "2026-06-01", marks: [] }
    ],
    options: [],
    winning_option_index: null,
    messages: []
  },
  "task-6": {
    title: "Bike lane on Central Avenue",
    description: "Proposal to coordinate with the city municipality to mark a dedicated bike lane along Central Avenue adjacent to the building complex.",
    status: "approved",
    ends: "2026-05-15",
    submitter_id: "System",
    created_at: "2026-01-05T00:00:00Z",
    participants: ["1"],
    relevance_scores: { "1": 0.95 },
    isr_scores: { "1": 1.07 },
    tasks: [
      { step: "Conduct traffic impact study", status: "done", in_charge_uid: "1", in_charge_name: "Sergey B.", deadline: "2026-02-15", marks: [], results: "Traffic impact study done. Positive results." },
      { step: "Approve final route design", status: "done", in_charge_uid: "1", in_charge_name: "Sergey B.", deadline: "2026-03-30", marks: [], results: "Route design approved by district engineer." },
      { step: "Begin road marking and signage", status: "in_process", in_charge_uid: "1", in_charge_name: "Sergey B.", deadline: "2026-05-15", marks: [] }
    ],
    options: [],
    winning_option_index: null,
    messages: []
  }
};

function formatDateWithSetting(val) {
  if (!val) return '';
  let date;
  if (val instanceof Date) {
    date = val;
  } else if (typeof val === 'number') {
    date = new Date(val);
  } else {
    // If it's already in dd.mm.yyyy format
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(val)) {
      const savedFormat = localStorage.getItem('dateFormat') || 'dd.mm.yyyy';
      if (savedFormat === 'dd.mm.yyyy') return val;
      const parts = val.split('.');
      date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    } else {
      date = new Date(val);
    }
  }
  
  if (isNaN(date.getTime())) {
    const match = val.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const savedFormat = localStorage.getItem('dateFormat') || 'dd.mm.yyyy';
      if (savedFormat === 'yyyy-mm-dd') return `${match[1]}-${match[2]}-${match[3]}`;
      if (savedFormat === 'mm/dd/yyyy') return `${match[2]}/${match[3]}/${match[1]}`;
      return `${match[3]}.${match[2]}.${match[1]}`;
    }
    return val;
  }

  const savedFormat = localStorage.getItem('dateFormat') || 'dd.mm.yyyy';
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();

  if (savedFormat === 'yyyy-mm-dd') {
    return `${y}-${m}-${d}`;
  } else if (savedFormat === 'mm/dd/yyyy') {
    return `${m}/${d}/${y}`;
  }
  return `${d}.${m}.${y}`;
}

function formatTaskDeadline(dateStr) {
  if (!dateStr || dateStr === "Ongoing") return "";
  return formatDateWithSetting(dateStr);
}

function parseInputDate(dateStr) {
  if (!dateStr || dateStr === "Ongoing") return "";
  const parts = dateStr.split('.');
  if (parts.length === 3) {
    const d = parts[0].padStart(2, '0');
    const m = parts[1].padStart(2, '0');
    let y = parts[2];
    if (y.length === 2) {
      y = '20' + y;
    }
    return `${y}-${m}-${d}`;
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
  // L1: the real date (was frozen at 2026-06-05).
  if (!dateStr) return false;
  const ymd = String(dateStr).slice(0, 10);
  if (!Lifecycle.isDate(ymd)) return false;
  const diffDays = Lifecycle.daysBetween(Lifecycle.todayIn(Lifecycle.TIME_ZONE), ymd);
  return diffDays >= 0 && diffDays <= 3;
}

let currentSectionId = null;
let newTopicGeo = [47.553832, 7.606599]; // default Basel center
window.newTopicGeo = newTopicGeo;
let profileGeotags = [];
let suggestedParams = null;

// ==========================================
// GLOBAL MAP RENDERING & CIRCLES LOGIC
// ==========================================
window.leafletInnerCircle = null;
window.leafletOuterCircle = null;
window.googleInnerCircle = null;
window.googleOuterCircle = null;

window.updateCircles = function(lat, lng, mu, sigma) {
  const center = [lat, lng];
  const totalRadius = mu + (3 * sigma);

  if (typeof L !== 'undefined' && window.mapInstance instanceof L.Map) {
    if (!window.leafletInnerCircle) {
      window.leafletInnerCircle = L.circle(center, {
        color: '#3182ce',
        fillColor: '#3182ce',
        fillOpacity: 0.25,
        radius: mu
      }).addTo(window.mapInstance);
    } else {
      window.leafletInnerCircle.setLatLng(center);
      window.leafletInnerCircle.setRadius(mu);
    }

    if (!window.leafletOuterCircle) {
      window.leafletOuterCircle = L.circle(center, {
        color: '#e53e3e',
        fillColor: '#e53e3e',
        fillOpacity: 0.08,
        dashArray: '5, 5',
        radius: totalRadius
      }).addTo(window.mapInstance);
    } else {
      window.leafletOuterCircle.setLatLng(center);
      window.leafletOuterCircle.setRadius(totalRadius);
    }
  } else if (typeof google !== 'undefined' && google.maps && window.mapInstance instanceof google.maps.Map) {
    const googleCenter = { lat: lat, lng: lng };
    if (!window.googleInnerCircle) {
      window.googleInnerCircle = new google.maps.Circle({
        strokeColor: '#3182ce',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#3182ce',
        fillOpacity: 0.25,
        map: window.mapInstance,
        center: googleCenter,
        radius: mu
      });
    } else {
      window.googleInnerCircle.setCenter(googleCenter);
      window.googleInnerCircle.setRadius(mu);
    }

    if (!window.googleOuterCircle) {
      window.googleOuterCircle = new google.maps.Circle({
        strokeColor: '#e53e3e',
        strokeOpacity: 0.6,
        strokeWeight: 1.5,
        fillColor: '#e53e3e',
        fillOpacity: 0.08,
        map: window.mapInstance,
        center: googleCenter,
        radius: totalRadius
      });
    } else {
      window.googleOuterCircle.setCenter(googleCenter);
      window.googleOuterCircle.setRadius(totalRadius);
    }
  }
};

window.initInteractiveMap = function(isReadOnly = false) {
  const mapCanvas = document.getElementById('geo-map-canvas');
  if (!mapCanvas) return;
  mapCanvas.innerHTML = '';
  
  window.leafletInnerCircle = null;
  window.leafletOuterCircle = null;
  window.googleInnerCircle = null;
  window.googleOuterCircle = null;
  
  const distInput = document.getElementById('geo-affect-distance');
  const fadeInput = document.getElementById('geo-affect-fade');
  const getMuSigma = () => {
    const muVal = parseFloat(distInput ? distInput.value : 100) || 100;
    const fadeVal = parseFloat(fadeInput ? fadeInput.value : 150) || 150;
    return { mu: muVal, sigma: fadeVal / 3 };
  };

  const updateCirclesLocal = () => {
    const { mu, sigma } = getMuSigma();
    window.updateCircles(window.newTopicGeo[0], window.newTopicGeo[1], mu, sigma);
  };

  if (typeof L !== 'undefined') {
    const mapEl = document.createElement('div');
    mapEl.style.width = '100%';
    mapEl.style.height = '100%';
    mapCanvas.appendChild(mapEl);

    if (window.detailMapInstance) {
      try {
        window.detailMapInstance.remove();
      } catch(e) {
        console.warn(e);
      }
      window.detailMapInstance = null;
    }

    const map = L.map(mapEl).setView([window.newTopicGeo[0], window.newTopicGeo[1]], 15);
    window.detailMapInstance = map;
    window.mapInstance = map;

    // Load Google Maps tiles
    L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; <a href="https://maps.google.com">Google Maps</a>'
    }).addTo(map);

    const marker = L.marker([window.newTopicGeo[0], window.newTopicGeo[1]], { draggable: !isReadOnly }).addTo(map);
    window.mapMarker = marker;

    const coordsInput = document.getElementById('geo-epicenter-coords');
    const updateCoords = (lat, lng) => {
      window.newTopicGeo = [lat, lng];
      if (coordsInput) {
        coordsInput.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }
      updateCirclesLocal();
    };

    // Set initial inputs value
    updateCoords(window.newTopicGeo[0], window.newTopicGeo[1]);

    if (!isReadOnly) {
      marker.on('dragend', function() {
        const latLng = marker.getLatLng();
        updateCoords(latLng.lat, latLng.lng);
      });

      map.on('click', function(e) {
        marker.setLatLng(e.latlng);
        updateCoords(e.latlng.lat, e.latlng.lng);
      });

      const tags = window.profileGeotags || profileGeotags || [];
      tags.forEach(tag => {
        const pMarker = L.marker([tag.geo[0], tag.geo[1]], {
          icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })
        }).addTo(map);
        pMarker.bindTooltip(`${tag.type}: ${tag.place || tag.address || ''}`);
        pMarker.on('click', () => {
          marker.setLatLng([tag.geo[0], tag.geo[1]]);
          map.panTo([tag.geo[0], tag.geo[1]]);
          updateCoords(tag.geo[0], tag.geo[1]);
        });
      });
    }

    // Draw initial circles
    updateCirclesLocal();

    // Bind input listeners
    if (distInput) {
      distInput.removeEventListener('input', updateCirclesLocal);
      distInput.addEventListener('input', updateCirclesLocal);
    }
    if (fadeInput) {
      fadeInput.removeEventListener('input', updateCirclesLocal);
      fadeInput.addEventListener('input', updateCirclesLocal);
    }

  } else if (typeof google !== 'undefined' && google.maps) {
    const center = { lat: window.newTopicGeo[0], lng: window.newTopicGeo[1] };
    window.mapInstance = new google.maps.Map(mapCanvas, {
      center: center,
      zoom: 15,
      panControl: !isReadOnly,
      zoomControl: true
    });
    
    window.mapMarker = new google.maps.Marker({
      position: center,
      map: window.mapInstance,
      draggable: !isReadOnly,
      icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
    });

    const coordsInput = document.getElementById('geo-epicenter-coords');
    const updateCoords = (lat, lng) => {
      window.newTopicGeo = [lat, lng];
      if (coordsInput) {
        coordsInput.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }
      updateCirclesLocal();
    };

    if (!isReadOnly) {
      const tags = window.profileGeotags || profileGeotags || [];
      tags.forEach(tag => {
        const marker = new google.maps.Marker({
          position: { lat: tag.geo[0], lng: tag.geo[1] },
          map: window.mapInstance,
          title: `${tag.type}: ${tag.place || tag.address || ''}`,
          icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        });
        marker.addListener('click', () => {
          updateCoords(tag.geo[0], tag.geo[1]);
          window.mapMarker.setPosition({ lat: tag.geo[0], lng: tag.geo[1] });
          window.mapInstance.panTo({ lat: tag.geo[0], lng: tag.geo[1] });
        });
      });

      window.mapInstance.addListener('click', (e) => {
        updateCoords(e.latLng.lat(), e.latLng.lng());
        window.mapMarker.setPosition(e.latLng);
      });

      window.mapMarker.addListener('dragend', (e) => {
        updateCoords(e.latLng.lat(), e.latLng.lng());
      });
    }

    // Draw initial circles
    updateCirclesLocal();

    // Bind input listeners
    if (distInput) {
      distInput.removeEventListener('input', updateCirclesLocal);
      distInput.addEventListener('input', updateCirclesLocal);
    }
    if (fadeInput) {
      fadeInput.removeEventListener('input', updateCirclesLocal);
      fadeInput.addEventListener('input', updateCirclesLocal);
    }

  } else {
    // Fallback SVG Map Rendering
    const svgNamespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNamespace, "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.background = "#edf2f7";
    svg.style.cursor = isReadOnly ? "default" : "crosshair";
    mapCanvas.appendChild(svg);

    const controls = document.createElement('div');
    controls.className = 'map-fallback-control';
    controls.innerHTML = `
      <button type="button" class="map-control-btn" id="map-zoom-in">+</button>
      <button type="button" class="map-control-btn" id="map-zoom-out">−</button>
    `;
    mapCanvas.appendChild(controls);

    controls.querySelector('#map-zoom-in').onclick = (e) => { e.stopPropagation(); window.zoomLevel *= 1.25; drawSvg(); };
    controls.querySelector('#map-zoom-out').onclick = (e) => { e.stopPropagation(); window.zoomLevel /= 1.25; drawSvg(); };

    const baseLat = 47.58;
    const baseLon = 7.61;

    function toPixels(lat, lon) {
      const dy = lat - baseLat;
      const dx = lon - baseLon;
      const px = 250 + (dx * 7000 * window.zoomLevel) + window.panX;
      const py = 150 - (dy * 7000 * window.zoomLevel) + window.panY;
      return { x: px, y: py };
    }

    function toCoords(px, py) {
      const dx = (px - 250 - window.panX) / (7000 * window.zoomLevel);
      const dy = (150 - py - window.panY) / (7000 * window.zoomLevel);
      return [baseLat + dy, baseLon + dx];
    }

    function drawSvg() {
      svg.innerHTML = '';
      
      // Grid lines
      for (let i = -6; i <= 6; i++) {
        const latVal = baseLat + i * 0.008;
        const lonVal = baseLon + i * 0.008;
        
        const latP = toPixels(latVal, baseLon);
        const lonP = toPixels(baseLat, lonVal);

        const hLine = document.createElementNS(svgNamespace, "line");
        hLine.setAttribute("x1", "0");
        hLine.setAttribute("y1", latP.y);
        hLine.setAttribute("x2", "500");
        hLine.setAttribute("y2", latP.y);
        hLine.setAttribute("stroke", "#cbd5e0");
        hLine.setAttribute("stroke-width", "0.5");
        svg.appendChild(hLine);

        const vLine = document.createElementNS(svgNamespace, "line");
        vLine.setAttribute("x1", lonP.x);
        vLine.setAttribute("y1", "0");
        vLine.setAttribute("x2", lonP.x);
        vLine.setAttribute("y2", "300");
        vLine.setAttribute("stroke", "#cbd5e0");
        vLine.setAttribute("stroke-width", "0.5");
        svg.appendChild(vLine);
      }

      if (!isReadOnly) {
        // Draw profile anchors
        const tags = window.profileGeotags || profileGeotags || [];
        tags.forEach(tag => {
          const p = toPixels(tag.geo[0], tag.geo[1]);
          const c = document.createElementNS(svgNamespace, "circle");
          c.setAttribute("cx", p.x);
          c.setAttribute("cy", p.y);
          c.setAttribute("r", "8");
          c.setAttribute("fill", "#2c5282");
          c.setAttribute("stroke", "#fff");
          c.setAttribute("stroke-width", "2");
          c.style.cursor = "pointer";
          
          const t = document.createElementNS(svgNamespace, "title");
          t.textContent = `${tag.type}: ${tag.place || tag.address || ''}`;
          c.appendChild(t);

          c.onclick = (e) => {
            e.stopPropagation();
            window.newTopicGeo = [tag.geo[0], tag.geo[1]];
            const coordsInput = document.getElementById('geo-epicenter-coords');
            if (coordsInput) {
              coordsInput.value = `${window.newTopicGeo[0].toFixed(6)}, ${window.newTopicGeo[1].toFixed(6)}`;
            }
            drawSvg();
          };
          svg.appendChild(c);
        });
      }

      // Draw inner and outer circles around window.newTopicGeo
      const targetP = toPixels(window.newTopicGeo[0], window.newTopicGeo[1]);
      const { mu, sigma } = getMuSigma();
      
      // Approx. 111000 meters per degree
      const muPx = (mu / 111000) * 7000 * window.zoomLevel;
      const fadePx = ((3 * sigma) / 111000) * 7000 * window.zoomLevel;

      // Outer circle (decay boundary)
      const outerC = document.createElementNS(svgNamespace, "circle");
      outerC.setAttribute("cx", targetP.x);
      outerC.setAttribute("cy", targetP.y);
      outerC.setAttribute("r", (muPx + fadePx).toString());
      outerC.setAttribute("fill", "rgba(229, 62, 98, 0.08)");
      outerC.setAttribute("stroke", "#e53e3e");
      outerC.setAttribute("stroke-width", "1");
      outerC.setAttribute("stroke-dasharray", "5,5");
      svg.appendChild(outerC);

      // Inner circle (mu)
      const innerC = document.createElementNS(svgNamespace, "circle");
      innerC.setAttribute("cx", targetP.x);
      innerC.setAttribute("cy", targetP.y);
      innerC.setAttribute("r", muPx.toString());
      innerC.setAttribute("fill", "rgba(49, 130, 206, 0.25)");
      innerC.setAttribute("stroke", "#3182ce");
      innerC.setAttribute("stroke-width", "1.5");
      svg.appendChild(innerC);

      // Target marker
      const tOuter = document.createElementNS(svgNamespace, "circle");
      tOuter.setAttribute("cx", targetP.x);
      tOuter.setAttribute("cy", targetP.y);
      tOuter.setAttribute("r", "12");
      tOuter.setAttribute("fill", "rgba(229, 62, 98, 0.25)");
      tOuter.setAttribute("stroke", "#e53e3e");
      tOuter.setAttribute("stroke-width", "2");
      svg.appendChild(tOuter);

      const tInner = document.createElementNS(svgNamespace, "circle");
      tInner.setAttribute("cx", targetP.x);
      tInner.setAttribute("cy", targetP.y);
      tInner.setAttribute("r", "4");
      tInner.setAttribute("fill", "#e53e3e");
      svg.appendChild(tInner);

      const textHud = document.createElementNS(svgNamespace, "text");
      textHud.setAttribute("x", "12");
      textHud.setAttribute("y", "24");
      textHud.setAttribute("font-size", "11px");
      textHud.setAttribute("fill", "#4a5568");
      textHud.setAttribute("font-family", "monospace");
      textHud.textContent = `Lat: ${window.newTopicGeo[0].toFixed(4)} Lon: ${window.newTopicGeo[1].toFixed(4)}`;
      svg.appendChild(textHud);
    }

    if (!isReadOnly) {
      svg.addEventListener('click', (e) => {
        const rect = svg.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        window.newTopicGeo = toCoords(clickX, clickY);
        const coordsInput = document.getElementById('geo-epicenter-coords');
        if (coordsInput) {
          coordsInput.value = `${window.newTopicGeo[0].toFixed(6)}, ${window.newTopicGeo[1].toFixed(6)}`;
        }
        drawSvg();
      });

      let isDragging = false;
      let startX, startY;
      svg.addEventListener('mousedown', (e) => {
        if (e.target !== svg) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
      });
      svg.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        window.panX += dx;
        window.panY += dy;
        startX = e.clientX;
        startY = e.clientY;
        drawSvg();
      });
      window.addEventListener('mouseup', () => { isDragging = false; });
    }

    drawSvg();

    // Bind input listeners for fallback SVG to redraw
    if (distInput) {
      distInput.removeEventListener('input', drawSvg);
      distInput.addEventListener('input', drawSvg);
    }
    if (fadeInput) {
      fadeInput.removeEventListener('input', drawSvg);
      fadeInput.addEventListener('input', drawSvg);
    }
  }
};

window.updateTargetMarker = function() {
  if (window.mapInstance && window.mapMarker) {
    const center = [window.newTopicGeo[0], window.newTopicGeo[1]];
    if (typeof L !== 'undefined' && window.mapInstance instanceof L.Map) {
      window.mapMarker.setLatLng(center);
      window.mapInstance.panTo(center);
    } else if (typeof google !== 'undefined' && google.maps && window.mapInstance instanceof google.maps.Map) {
      window.mapMarker.setPosition({ lat: center[0], lng: center[1] });
      window.mapInstance.panTo({ lat: center[0], lng: center[1] });
    }
  } else {
    window.initInteractiveMap();
  }
};

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

  if (sectionId === 'actions') {
    renderUserActionsList(bodyEl);
  }

  // If opening settings section, bind settings-specific event listeners in the modal
  if (sectionId === 'settings') {
    const tooltipsEnabled = localStorage.getItem('tooltipsEnabled') !== 'false';
    const toggle = bodyEl.querySelector('#setting-toggle-tooltips');
    if (toggle) {
      toggle.checked = tooltipsEnabled;
      toggle.addEventListener('change', function() {
        localStorage.setItem('tooltipsEnabled', this.checked);
        const sourceToggle = source.querySelector('#setting-toggle-tooltips');
        if (sourceToggle) sourceToggle.checked = this.checked;
        
        if (this.checked) {
          document.body.classList.remove('tooltips-disabled');
        } else {
          document.body.classList.add('tooltips-disabled');
        }
      });
    }

    const savedDateFormat = localStorage.getItem('dateFormat') || 'dd.mm.yyyy';
    const radios = bodyEl.querySelectorAll('input[name="dateformat"]');
    radios.forEach(radio => {
      if (radio.value === savedDateFormat) {
        radio.checked = true;
      }
      radio.addEventListener('change', function() {
        const selectedFormat = this.value;
        localStorage.setItem('dateFormat', selectedFormat);
        
        const sourceRadios = source.querySelectorAll('input[name="dateformat"]');
        sourceRadios.forEach(sr => {
          if (sr.value === selectedFormat) {
            sr.checked = true;
          }
        });
        
        if (typeof window.triggerChatListRender === 'function') window.triggerChatListRender();
        if (typeof window.triggerVotingListRender === 'function') window.triggerVotingListRender();
        if (typeof window.triggerTasksListRender === 'function') window.triggerTasksListRender();
        
        if (bodyEl.getAttribute('data-topic-detail-open') === '1') {
          const kind = bodyEl.getAttribute('data-topic-source-kind');
          const topicId = bodyEl.getAttribute('data-active-topic-id');
          const sourceViewHtml = bodyEl.__sourceViewHtml;
          const titleText = bodyEl.getAttribute('data-topic-source-title');
          if (kind && topicId && typeof renderTopicDetail === 'function') {
            renderTopicDetail(kind, topicId, sourceViewHtml, titleText);
          }
        }
      });
    });
  }
}

// Global delegated click listener for data-section elements
document.addEventListener('click', function (e) {
  let sectionEl = null;
  let topicItemEl = null;
  
  // Use composedPath() if available, because it preserves the path 
  // even if elements (like dash-card contents) are replaced/detached during bubbling
  if (typeof e.composedPath === 'function') {
    const path = e.composedPath();
    for (let i = 0; i < path.length; i++) {
      let node = path[i];
      if (node && node.nodeType === Node.ELEMENT_NODE) {
        if (!topicItemEl && node.classList && node.classList.contains('topic-item')) {
          topicItemEl = node;
        }
        if (node.hasAttribute && node.hasAttribute('data-section')) {
          sectionEl = node;
          break;
        }
      }
    }
  }

  // Fallback to closest() if composedPath didn't find it or is unavailable
  if (!sectionEl) {
    let target = e.target;
    if (target && target.nodeType === Node.TEXT_NODE) {
      target = target.parentElement;
    }
    if (target && typeof target.closest === 'function') {
      topicItemEl = target.closest('.topic-item');
      sectionEl = target.closest('[data-section]');
    }
  }

  if (sectionEl) {
    e.preventDefault();
    const sectionId = sectionEl.getAttribute('data-section');
    if (typeof openSectionModal === 'function') {
      openSectionModal(sectionId);
    }
    
    // If the user clicked a specific topic inside the dashboard card, auto-open its detail view
    if (topicItemEl) {
      const topicType = topicItemEl.getAttribute('data-topic-type');
      const topicId = topicItemEl.getAttribute('data-topic-id');
      if (topicType && topicId) {
        const modalBody = document.getElementById('section-modal-body');
        const modalTitle = document.getElementById('section-modal-title');
        const sourceTitle = modalTitle ? modalTitle.textContent : '';
        
        if (topicType === 'chat' || topicType === 'voting' || topicType === 'tasks') {
          if (typeof window.markDiscussionAsRead === 'function') {
            window.markDiscussionAsRead(topicId);
          }
        }
        
        // Ensure renderTopicDetail runs immediately after the modal list renders
        setTimeout(function() {
          if (typeof renderTopicDetail === 'function') {
            renderTopicDetail(topicType, topicId, modalBody.innerHTML, sourceTitle);
          }
        }, 0);
      }
    }
  }
});

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

// Global modal close event listeners
// Must use readyState check because the script is loaded at the bottom of HTML,
// so DOMContentLoaded has usually already fired by the time this code runs.
(function initModalCloseHandlers() {
  function setup() {
    var overlay = document.getElementById('section-modal-overlay');
    var modalCloseBtn = document.getElementById('modal-close-btn');
    var menu = document.getElementById('menu');

    if (overlay) {
      var mousedownOnOverlay = false;
      overlay.addEventListener('mousedown', function (e) {
        mousedownOnOverlay = (e.target === overlay);
      });
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay && mousedownOnOverlay) closeSectionModal();
      });
    }

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', closeSectionModal);
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeSectionModal();
        if (menu) menu.classList.remove('menu-open');
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();

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
        const newUid = Date.now();
        const newUidStr = String(newUid);
        await db.collection("users").doc(newUidStr).set({
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
        safeSetStorage('userId', newUidStr);
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

  window.globalTaxonomyDomains = taxonomyDomains;
  
  function mapTaxonomyToUserValues(taxonomy) {
    if (!taxonomy || !taxonomy.domains) return null;
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
  window.mapTaxonomyToUserValues = mapTaxonomyToUserValues;

  function openModal(dataOverride, titleOverride) {
    var isEvent = dataOverride && (dataOverride instanceof Event || (dataOverride.type && dataOverride.target));
    var data = (dataOverride && !isEvent) ? dataOverride : (window.currentUserValues || vectorData);
    var title = (typeof titleOverride === 'string') ? titleOverride : "Vector of Values";
    if (!data) {
      console.warn("openModal: No data available to render");
      return;
    }
    console.log("openModal opening with title:", title, "data:", data);
    try {
      window.SharedVectorRenderer.render(data, title);
    } catch (err) {
      console.error("SharedVectorRenderer.render failed:", err);
      alert("Error displaying Vector details: " + err.message + "\nCheck browser console for details.");
    }
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  window.openValuesVectorModal = openModal;
  window.closeValuesVectorModal = closeModal;


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

  // staticTasksMockData is declared globally at the top of the file


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

        if (item.label === 'Microcommunity' || item.label === 'Ad-hoc Public') {
          return '<div class="topic-detail-meta-item-wrapper" style="position:relative;">' +
            '<button type="button" class="topic-detail-meta-item microcommunity-btn" data-meta="Ad-hoc Public" data-uids="' + (item.uids || '') + '">' +
            firstRowHtml +
            '<span class="topic-detail-meta-label">Ad-hoc Public</span>' +
            '<span class="topic-detail-meta-value">' + item.value + '</span>' +
            '</button>' +
            '</div>';
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
    var firstMsg = otherMessages[0];
    var firstMsgId = firstMsg ? firstMsg.id : null;
    var otherMessagesSliced = otherMessages.length > 0 ? otherMessages.slice(1) : [];
    var currentUserId = safeGetStorage('userId') || "1";

    var messagesListHtml = renderDiscussionMessages(otherMessagesSliced, currentUserId, firstMsgId);

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
          { label: 'Ad-hoc Public', value: (topic.participants || []).length + ' members', uids: (topic.participants || []).join(',') },
          { label: 'Deadline', value: topic.deadline },
          { label: '📍', value: topic.geoposition || "N/A" },
          { label: 'Relevance', value: topic.relevance, firstRow: topic.relevanceWeights },
          { label: 'ISR-score', value: topic.isrScore, firstRow: topic.isrWeights },
          { label: 'Expertise', value: (topic.expertiseDomain ? topic.expertiseDomain + ', ' : '') + (topic.expertiseDepth || "None") }
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
                metaDetails = '<div style="font-size: 0.8rem; color: var(--text-muted); margin-left: 24px; margin-top: 2px;">Proposed by ' + option.author_name + ' &middot; ' + ISROptions.optionDetailsHtml(option) + '</div>';
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
          '<div class="topic-detail-block-title" style="margin-bottom: 12px; font-weight: 700; color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase;">Discussion Thread</div>' +
          renderMessageSortButtons() +
          '<div class="topic-message-list" style="max-height: 250px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px;">' +
            messagesListHtml +
          '</div>' +
          '<div class="topic-detail-block" style="border: none; padding: 0;">' +
            '<div class="topic-input-row">' +
              '<input type="text" placeholder="Write a message..." style="width: 100%;" />' +
            '</div>' +
            '<div class="topic-detail-actions" style="margin-top: 8px;">' +
              '<div class="topic-detail-actions-right">' +
                '<button type="button" class="topic-send-btn">Send</button>' +
              '</div>' +
            '</div>' +
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

  // U3: sort buttons for an issue's messages (date, ISR, R, E) and the author's values in this
  // ad-hoc public, read from the public's member documents (the A1 source). The choice is kept
  // while the page is open, for every topic; pressing the active button again reverses it.
  var MESSAGE_SORT_KEYS = ['date', 'isr', 'r', 'e'];
  var MESSAGE_SORT_LABELS = { date: 'date', isr: 'ISR', r: 'R', e: 'E' };
  var messageSort = { key: 'date', reversed: false };
  var messageAuthorScores = { topicId: null, mcId: null, byUid: {} };

  // a, b: {idx, s} with idx = position in date order (oldest first) and s = {isr, r, e} or null.
  // date: newest first; ISR, R, E: highest first; reversed flips that. Messages whose author has
  // no value come last; equal values are ordered newest first.
  function compareMessageItems(a, b, key, reversed) {
    if (key === 'date') return reversed ? a.idx - b.idx : b.idx - a.idx;
    var va = a.s ? a.s[key] : null;
    var vb = b.s ? b.s[key] : null;
    var ha = typeof va === 'number' && isFinite(va);
    var hb = typeof vb === 'number' && isFinite(vb);
    if (ha !== hb) return ha ? -1 : 1;
    if (ha && va !== vb) return reversed ? va - vb : vb - va;
    return b.idx - a.idx;
  }

  function messageAuthorScore(uid) {
    var u = (uid || '').toString();
    return messageAuthorScores.byUid[u] || null;
  }

  function sortMessagesForDisplay(messages) {
    var items = messages.map(function(m, i) { return { msg: m, idx: i, s: messageAuthorScore(m.uid) }; });
    items.sort(function(a, b) { return compareMessageItems(a, b, messageSort.key, messageSort.reversed); });
    return items.map(function(x) { return x.msg; });
  }

  // "0.95 R 62 E 1.21": ISR, R in percent, E.
  function renderMessageScores(uid) {
    if (!uid || uid === 'system') return '';
    var s = messageAuthorScore(uid);
    var fmt = function(v, pct) {
      if (typeof v !== 'number' || !isFinite(v)) return 'N/A';
      return pct ? (v * 100).toFixed(0) : v.toFixed(2);
    };
    return '<span class="topic-message-scores" title="ISR, Relevance (%), Expertise in this ad-hoc public">' +
      fmt(s && s.isr) + ' R ' + fmt(s && s.r, true) + ' E ' + fmt(s && s.e) + '</span>';
  }

  function renderMessageSortButtons() {
    return '<div class="search-filter-tags message-sort-tags">' + MESSAGE_SORT_KEYS.map(function(k) {
      var active = messageSort.key === k;
      var arrow = active ? (messageSort.reversed ? ' \u2191' : ' \u2193') : '';
      return '<button type="button" class="' + (active ? 'active' : '') + '" data-msg-sort="' + k + '">' + MESSAGE_SORT_LABELS[k] + arrow + '</button>';
    }).join(' ') + '</div>';
  }

  // Loads the R, E and ISR of the given authors once per opened topic (reset in renderTopicDetail).
  async function loadMessageAuthorScores(db, topicId, uids) {
    if (messageAuthorScores.topicId !== topicId) {
      messageAuthorScores = { topicId: topicId, mcId: null, byUid: {} };
    }
    var cache = messageAuthorScores;
    var num = function(v) { return typeof v === 'number' && isFinite(v) ? v : null; };
    try {
      if (!cache.mcId) {
        var mcId = topicId;
        var mcSnap = await db.collection("microcommunities").where("issue_id", "==", topicId).limit(1).get();
        mcSnap.forEach(function(doc) { mcId = doc.id; });
        cache.mcId = mcId;
      }
      var missing = Array.from(new Set((uids || []).map(function(u) { return (u || '').toString(); })))
        .filter(function(u) { return u && u !== 'system' && !(u in cache.byUid); });
      for (var i = 0; i < missing.length; i += 30) {
        var chunk = missing.slice(i, i + 30);
        var snap = await db.collection("microcommunity_members")
          .where(firebase.firestore.FieldPath.documentId(), "in", chunk.map(function(u) { return cache.mcId + '_' + u; }))
          .get();
        chunk.forEach(function(u) { cache.byUid[u] = null; });
        snap.forEach(function(doc) {
          var d = doc.data();
          var u = doc.id.slice(String(cache.mcId).length + 1);
          cache.byUid[u] = { isr: num(d.isr_score), r: num(d.relevance_score), e: num(d.expertise_score) };
        });
      }
    } catch (err) {
      console.error("Loading the authors' R, E and ISR failed:", err);
    }
  }

  // A press re-orders the message cards in place (their handlers stay bound) and updates the buttons.
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-msg-sort]');
    if (!btn) return;
    e.preventDefault();
    var key = btn.getAttribute('data-msg-sort');
    if (messageSort.key === key) {
      messageSort.reversed = !messageSort.reversed;
    } else {
      messageSort.key = key;
      messageSort.reversed = false;
    }
    var tags = btn.closest('.message-sort-tags');
    var container = tags ? tags.parentElement : null;
    if (tags) tags.outerHTML = renderMessageSortButtons();
    var list = container ? container.querySelector('.topic-message-list') : null;
    if (!list) return;
    var cards = Array.from(list.querySelectorAll(':scope > .topic-message-card'));
    var items = cards.map(function(card) {
      return { card: card, idx: parseInt(card.getAttribute('data-date-idx'), 10) || 0, s: messageAuthorScore(card.getAttribute('data-author-uid')) };
    });
    items.sort(function(a, b) { return compareMessageItems(a, b, messageSort.key, messageSort.reversed); });
    items.forEach(function(x) { list.appendChild(x.card); });
  });

  function renderDiscussionMessages(messages, currentUserId, firstMessageId) {
    if (!messages || messages.length === 0) {
      return '<div style="color:var(--text-muted); font-style:italic; font-size:0.88rem; padding: 4px;">No messages in this discussion.</div>';
    }

    var dateIdx = new Map();
    messages.forEach(function(m, i) { dateIdx.set(m, i); });
    return sortMessagesForDisplay(messages).map(function(msg, index) {
      var msgIndex = index + 1;
      var existingReactions = '';
      if (msg.reactions && msg.reactions.length > 0) {
        var grouped = {};
        msg.reactions.forEach(function(r) {
          if (r.type) {
            if (!grouped[r.type]) {
              grouped[r.type] = {
                emoji: r.emoji || reactionEmojis[r.type] || '👍',
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
        var isReplyToFirst = firstMessageId && (msg.parentID === firstMessageId);
        if (!isReplyToFirst) {
          var parentMsg = messages.find(function(m) { return m.id === msg.parentID; });
          var parentAuthor = parentMsg ? parentMsg.author : ('User ' + msg.parentID);
          parentLinkHtml = '<div class="topic-message-parent-link">In reply to <span class="parent-link" data-parent-id="' + msg.parentID + '">' + parentAuthor + '</span></div>';
        }
      }

      var isOwnMessage = (msg.uid || '').toString() === currentUserId.toString();
      var reactButtonHtml = '';
      if (!isOwnMessage) {
        reactButtonHtml = 
          '<div class="reaction-wrap">' +
            '<button type="button" class="topic-inline-btn react-toggle-btn" data-reaction-menu="' + msg.id + '">React</button>' +
            renderReactionMenu(msg, currentUserId) +
          '</div>';
      }

      var replyBtnHtml = '<button type="button" class="topic-inline-btn reply-btn" data-msg-id="' + msg.id + '" data-author="' + msg.author + '">Reply</button>';

      return '' +
      '<div class="topic-message-card" id="msg-' + msg.id + '" data-msg-id="' + msg.id + '" data-date-idx="' + dateIdx.get(msg) + '" data-author-uid="' + (msg.uid || '') + '">' +
        '<div class="topic-message-author topic-message-author-row"><span>' + msg.author + '</span>' + renderMessageScores(msg.uid) + '</div>' +
        parentLinkHtml +
        '<div class="topic-message-text">' + msg.text + '</div>' +
        '<div class="topic-message-actions">' +
          replyBtnHtml +
          existingReactions + 
          reactButtonHtml +
        '</div>' +
      '</div>';
    }).join('');
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
            '<div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px;">Proposed by ' + opt.author_name + ' &middot; ' + ISROptions.optionDetailsHtml(opt) + '</div>' +
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
          { label: 'Ad-hoc Public', value: (topic.participants || []).length + ' members', uids: (topic.participants || []).join(',') },
          { label: 'Deadline', value: topic.deadline },
          { label: '📍', value: topic.geoposition || "N/A" },
          { label: 'Relevance', value: topic.relevance, firstRow: topic.relevanceWeights },
          { label: 'ISR-score', value: topic.isrScore, firstRow: topic.isrWeights },
          { label: 'Expertise', value: (topic.expertiseDomain ? topic.expertiseDomain + ', ' : '') + (topic.expertiseDepth || "None") }
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
          renderMessageSortButtons() +
          '<div class="topic-message-list">' +
            renderDiscussionMessages(otherMessages, currentUserId, firstMsg ? firstMsg.id : null) +
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

        '<div class="topic-form-grid" style="position: relative; margin-bottom: 14px;">' +
          '<div class="topic-form-field">' +
            '<label>Issue Topic Name</label>' +
            '<input type="text" class="topic-new-title-input" placeholder="Enter issue topic name" style="width:100%; padding: 10px; border: 1px solid var(--border); border-radius: 8px; font-size: 0.95rem; background: var(--surface); color: var(--text);" />' +
          '</div>' +
          '<div class="topic-form-field">' +
            '<label>Issue Description</label>' +
            '<textarea class="topic-form-textarea" placeholder="Describe the issue" style="width:100%; min-height: 120px; padding: 10px; border: 1px solid var(--border); border-radius: 8px; font-size: 0.95rem; background: var(--surface); color: var(--text); resize: vertical;"></textarea>' +
          '</div>' +
        '</div>' +

        '<div class="topic-detail-meta" style="position: relative; margin-bottom: 14px;">' +
          '<div class="topic-detail-meta-item-wrapper" style="position:relative;">' +
            '<button type="button" class="topic-detail-meta-item" data-meta="Ad-hoc Public" id="create-meta-microcommunity" disabled>' +
              '<span class="topic-detail-meta-label">Ad-hoc Public</span>' +
              '<span class="topic-detail-meta-value" id="create-val-microcommunity">0 members</span>' +
            '</button>' +
          '</div>' +
          '<button type="button" class="topic-detail-meta-item" data-meta="Deadline" id="create-meta-deadline">' +
            '<span class="topic-detail-meta-label">Deadline</span>' +
            '<span class="topic-detail-meta-value" id="create-val-deadline">Ongoing</span>' +
          '</button>' +
          '<button type="button" class="topic-detail-meta-item" data-meta="📍" id="create-meta-geo">' +
            '<span class="topic-detail-meta-label">📍</span>' +
            '<span class="topic-detail-meta-value geo-meta-value" id="create-val-geo">47.55, 7.61</span>' +
          '</button>' +
          '<button type="button" class="topic-detail-meta-item" data-meta="Relevance" id="create-meta-relevance" disabled>' +
            '<span class="topic-detail-meta-tiny" id="create-tiny-relevance"></span>' +
            '<span class="topic-detail-meta-label">Relevance</span>' +
            '<span class="topic-detail-meta-value" id="create-val-relevance">N/A</span>' +
          '</button>' +
          '<button type="button" class="topic-detail-meta-item" data-meta="ISR-score" id="create-meta-isr" disabled>' +
            '<span class="topic-detail-meta-tiny" id="create-tiny-isr"></span>' +
            '<span class="topic-detail-meta-label">ISR-score</span>' +
            '<span class="topic-detail-meta-value" id="create-val-isr">N/A</span>' +
          '</button>' +
          '<button type="button" class="topic-detail-meta-item" data-meta="Expertise" id="create-meta-expertise" disabled>' +
            '<span class="topic-detail-meta-label">Expertise</span>' +
            '<span class="topic-detail-meta-value" id="create-val-expertise">None</span>' +
          '</button>' +
        '</div>' +

        '<div class="topic-detail-actions" style="margin-top: 20px;">' +
          '<div class="topic-detail-actions-left" style="display: flex; gap: 8px;">' +
            '<button type="button" class="tour-btn tour-btn-secondary" id="create-check-btn">Check</button>' +
          '</div>' +
          '<div class="topic-detail-actions-right" style="display: flex; gap: 8px;">' +
            '<button type="button" class="tour-btn tour-btn-secondary topic-back-btn">Cancel</button>' +
            '<button type="button" class="tour-btn tour-btn-primary" id="create-submit-btn" disabled>Create</button>' +
          '</div>' +
        '</div>' +

        '<div class="topic-detail-block" id="create-results-members-block" style="display: none; margin-top: 16px;">' +
          '<div class="topic-detail-block-title">Suggested Ad-hoc Public Members (Relevance > 0.15)</div>' +
          '<div id="create-mc-values-diagram" style="display: none; padding: 0 4px;"></div>' +
          '<div class="create-members-list" id="create-members-list" style="display: flex; flex-direction: column; gap: 4px; padding: 12px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); max-height: 200px; overflow-y: auto; text-align: left; font-size: 0.88rem; color: var(--text-muted);"></div>' +
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
    var safeComments = Array.isArray(comments) ? comments : (comments ? [comments] : []);
    safeComments.forEach(function(c) {
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
    var currentUserId = safeGetStorage('userId') || "1";
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
                       '<div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">Proposed by <b>' + winningOption.author_name + '</b> &middot; ' + ISROptions.optionDetailsHtml(winningOption) + '</div>' +
                     '</div>' +
                   '</div>';
    }

    var otherMessages = topic.messages || [];
    var firstMsg = otherMessages[0];
    var firstMsgId = firstMsg ? firstMsg.id : null;
    var otherMessagesSliced = otherMessages.length > 0 ? otherMessages.slice(1) : [];

    var messagesListHtml = renderDiscussionMessages(otherMessagesSliced, currentUserId, firstMsgId);

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
        metaDetails = '<div style="font-size: 0.8rem; color: var(--text-muted); margin-left: 24px; margin-top: 2px;">Proposed by ' + option.author_name + ' &middot; ' + ISROptions.optionDetailsHtml(option) + '</div>';
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

    // U1: participants hold each id as text and as a number; list each user once
    var participantOptions = (topic.participants || []).map(String).filter(function(uid, i, a) { return a.indexOf(uid) === i; }).map(function(uid) {
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
          { label: 'Ad-hoc Public', value: (topic.participants || []).length + ' members', uids: (topic.participants || []).join(',') },
          { label: 'Deadline', value: topic.deadline },
          { label: '📍', value: topic.geoposition || "N/A" },
          { label: 'Relevance', value: topic.relevance, firstRow: topic.relevanceWeights },
          { label: 'ISR-score', value: topic.isrScore, firstRow: topic.isrWeights },
          { label: 'Expertise', value: (topic.expertiseDomain ? topic.expertiseDomain + ', ' : '') + (topic.expertiseDepth || "None") }
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
                              '<input type="text" placeholder="dd.mm.yyyy" class="task-new-subtask-deadline" data-task-idx="' + taskIdx + '" style="padding: 6px 8px; border: 1px solid var(--border); border-radius: 6px; background: var(--surface); color: var(--text); font-size: 0.82rem; width: 110px;" />' +
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
          '<div class="topic-detail-block-title" style="margin-bottom: 12px; font-weight: 700; color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase;">Discussion Thread</div>' +
          renderMessageSortButtons() +
          '<div class="topic-message-list" style="max-height: 250px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px;">' +
            messagesListHtml +
          '</div>' +
          '<div class="topic-detail-block" style="border: none; padding: 0;">' +
            '<div class="topic-input-row">' +
              '<input type="text" placeholder="Write a message..." style="width: 100%;" />' +
            '</div>' +
            '<div class="topic-detail-actions" style="margin-top: 8px;">' +
              '<div class="topic-detail-actions-right">' +
                '<button type="button" class="topic-send-btn">Send</button>' +
              '</div>' +
            '</div>' +
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
    const overlay = document.getElementById('section-modal-overlay');
    if (overlay && !overlay.classList.contains('active')) {
      overlay.classList.add('active');
      document.body.classList.add('modal-open');
    }

    modalBody.setAttribute('data-topic-detail-open', '1');
    modalBody.setAttribute('data-topic-source-kind', kind);
    modalBody.setAttribute('data-topic-source-title', titleText || '');
    modalBody.setAttribute('data-active-topic-id', topicId);
    messageAuthorScores = { topicId: null, mcId: null, byUid: {} }; // U3: read again for this topic
    modalBody.__sourceViewHtml = sourceViewHtml || modalBody.innerHTML;
    modalBody.__restoreView = restoreTopicListView;

    modalBody.innerHTML = '<div style="padding:20px; color:var(--text-muted); font-size:0.95rem;">Loading details from database...</div>';

    if (typeof firebase === 'undefined') return;
    const db = firebase.firestore();

    let currentDiscData = null;
    let currentPhaseIssue = null; // L1: the issue doc in Voting and ToDo (deadline, votes, options)
    let cachedMemberData = null;
    let activeModalType = null;
    let replyToMsgId = null;

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

    function bindDiscussionInteractionHandlers(topicId, container, db, currentUserId) {
      // 1. Bind Parent Message Link Scrolling & Flashing
      container.querySelectorAll('.parent-link').forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          const parentId = this.getAttribute('data-parent-id');
          const targetCard = container.querySelector('#msg-' + parentId);
          if (targetCard) {
            targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Flash Highlight Animation
            targetCard.classList.remove('highlighted');
            void targetCard.offsetWidth; // Force reflow
            targetCard.classList.add('highlighted');
          }
        });
      });

      // 2. Bind Live Reply Actions
      const sendBtn = container.querySelector('.topic-send-btn');
      const inputEl = container.querySelector('.topic-input-row input');

      const replyButtons = container.querySelectorAll('.reply-btn');
      replyButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          const msgId = this.getAttribute('data-msg-id');
          const author = this.getAttribute('data-author');

          replyToMsgId = isNaN(msgId) ? msgId : parseInt(msgId, 10);
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

            // Also check if there's an issue ref in issues collection to sync its message metadata
            const issueRef = db.collection("issues").doc(topicId);
            const issueSnap = await issueRef.get();
            if (issueSnap.exists) {
              batch.update(issueRef, {
                message_count: firebase.firestore.FieldValue.increment(1),
                last_message_sender_name: window.userCache[currentUserId] || 'User',
                last_message_sender_uid: currentUserId,
                last_message_text: text,
                last_message_timestamp: new Date().toISOString()
              });
            }

            await batch.commit();

            inputEl.value = "";
            inputEl.placeholder = "Write a message...";
            replyToMsgId = null;
          } catch (err) {
            console.error("Error sending message:", err);
            replyToMsgId = null;
          }
        };

        inputEl.onkeydown = function(e) {
          if (e.key === 'Enter') {
            sendBtn.click();
          }
        };
      }

      // 3. Bind Reaction Toggle Buttons
      container.querySelectorAll('.react-toggle-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          
          // Close all other reaction menus first
          container.querySelectorAll('.reaction-menu').forEach(menu => {
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
      container.querySelectorAll('.reaction-choice-btn').forEach(btn => {
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
    }

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
      if (!endsStr || endsStr === "Ongoing" || endsStr === "Active") return endsStr || "Ongoing";
      const shown = formatDateWithSetting(endsStr);
      // L1: an expired topic waits for the server's daily deadline run.
      return Lifecycle.isExpired(endsStr, Lifecycle.todayIn(Lifecycle.TIME_ZONE)) ? shown + " (deadline passed)" : shown;
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
      openRelevanceModal(disc, null, true);
    }

    function showIsrModal() {
      const disc = currentDiscData;
      if (!disc) return;
      openIsrModal(disc, null, true);
    }

    // L1: the phase the Deadline window acts on (an inactive topic keeps the phase it was canceled in).
    function deadlinePhase(disc) {
      if (disc && disc.status === 'inactive') {
        if (disc.previous_status === 'in_process') return 'voting';
        if (disc.previous_status === 'approved' || disc.previous_status === 'tasks') return 'tasks';
        return 'chat';
      }
      return kind;
    }

    // L1: input of Lifecycle.managementOutcome (prototype/js/lifecycle.js, shared with the server).
    function deadlineContext(disc, issue, votesMap) {
      const phase = deadlinePhase(disc);
      const isrByUid = {};
      Object.keys(disc.isr_scores || {}).forEach(u => { isrByUid[String(u)] = disc.isr_scores[u]; });
      let votingResult = null;
      if (phase === 'voting' && issue) {
        const votes = {};
        Object.keys(issue.votes || {}).forEach(u => { votes[String(u)] = issue.votes[u]; });
        votingResult = Lifecycle.votingOutcome(votes, isrByUid, (issue.options || []).length).result;
      }
      return {
        phase: phase,
        status: disc.status,
        cancelReason: disc.cancel_reason,
        votes: votesMap || {},
        isrByUid: isrByUid,
        optionCount: (disc.options_v2 || []).length,
        votingResult: votingResult
      };
    }

    async function submitDeadlineVote(voteType) {
  const currentUserId = safeGetStorage('userId') || "1";
  const discRef = db.collection("discussions").doc(topicId);
  const issueRef = db.collection("issues").doc(topicId);
  const DELETE = firebase.firestore.FieldValue.delete();
  const today = Lifecycle.todayIn(Lifecycle.TIME_ZONE);

  try {
    const after = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(discRef);
      if (!doc.exists) return null;
      const issueDoc = await transaction.get(issueRef);
      const data = doc.data();
      const issue = issueDoc.exists ? issueDoc.data() : null;
      const phase = deadlinePhase(data);

      const votesMap = Object.assign({}, data.deadline_votes || {});
      if (votesMap[currentUserId] === voteType) {
        delete votesMap[currentUserId];
      } else {
        votesMap[currentUserId] = voteType;
      }

      // One rule set: at least 30 % of the public's ISR pool; Start Voting needs an option;
      // Finish Voting needs a passing vote; a deadline-canceled topic only offers Reactivate.
      const outcome = Lifecycle.managementOutcome(deadlineContext(data, issue, votesMap));
      const updateFields = { deadline_votes: votesMap };
      const issueFields = {};
      let close = false, toList = false;

      if (outcome.action === 'reactivate') {
        const origStatus = data.previous_status || (phase === 'voting' ? 'in_process' : (phase === 'tasks' ? 'approved' : 'discussion'));
        const newEnds = Lifecycle.addDays(today, Lifecycle.EXTEND_DAYS);
        Object.assign(updateFields, { status: origStatus, ends: newEnds, deadline_votes: {}, previous_status: DELETE, cancel_reason: DELETE });
        Object.assign(issueFields, { ends: newEnds, deadline_votes: {} });
        if (origStatus === 'in_process' || origStatus === 'approved' || origStatus === 'tasks') {
          Object.assign(issueFields, { status: origStatus, previous_status: DELETE, cancel_reason: DELETE });
        }
        close = toList = true;
      } else if (outcome.action === 'cancel_issue') {
        const prevStatus = phase === 'voting' ? 'in_process' : (phase === 'tasks' ? 'approved' : 'discussion');
        Object.assign(updateFields, { status: 'inactive', previous_status: prevStatus });
        if (phase === 'voting' || phase === 'tasks') {
          Object.assign(issueFields, { status: 'inactive', previous_status: prevStatus, deadline_votes: votesMap });
        }
        close = toList = true;
      } else if (outcome.action === 'plus_1_week') {
        // R4: +1 week from the deadline of the current phase, written to both documents.
        const phaseEnds = phase === 'voting' ? ((issue && issue.ends) || data.ends) : data.ends;
        const newEnds = Lifecycle.extendDeadline(phaseEnds, today);
        Object.assign(updateFields, { ends: newEnds, deadline_votes: {} });
        Object.assign(issueFields, { ends: newEnds, deadline_votes: {} });
        close = true;
      } else if (outcome.action === 'start_voting') {
        const newEnds = Lifecycle.addDays(today, Lifecycle.EXTEND_DAYS);
        Object.assign(updateFields, { status: 'Voting', ends: newEnds, deadline_votes: {} });
        const issueData = Lifecycle.votingIssueFields(data, newEnds, new Date().toISOString());
        if (issue) transaction.update(issueRef, issueData); else transaction.set(issueRef, issueData);
        close = toList = true;
      } else if (outcome.action === 'back_to_chat') {
        const newEnds = Lifecycle.addDays(today, Lifecycle.EXTEND_DAYS);
        Object.assign(updateFields, { status: 'discussion', ends: newEnds, deadline_votes: {} });
        Object.assign(issueFields, { status: 'discussion', ends: newEnds, deadline_votes: {}, votes: {} });
        close = toList = true;
      } else if (outcome.action === 'finish_voting') {
        // The A1 trigger stores the scores, the winner, the tally and the tasks.
        Object.assign(updateFields, { status: 'approved', deadline_votes: {} });
        Object.assign(issueFields, { status: 'approved', deadline_votes: {} });
        close = toList = true;
      } else if (phase === 'voting' || phase === 'tasks') {
        // No action yet: the proposal is stored (the issue keeps a copy, as built).
        issueFields.deadline_votes = votesMap;
      }

      if (issue && outcome.action !== 'start_voting' && Object.keys(issueFields).length > 0) {
        transaction.update(issueRef, issueFields);
      }
      transaction.update(discRef, updateFields);
      return { close: close, toList: toList };
    });
    if (after && after.close) {
      setTimeout(() => {
        closeOverlayModal();
        if (after.toList) restoreTopicListView();
      }, 100);
    }
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

  // L1: the rules come from prototype/js/lifecycle.js (the same module the server's deadline run uses).
  const modalKind = deadlinePhase(disc);
  const issue = currentPhaseIssue;
  const currentUserId = safeGetStorage('userId') || "1";
  const votesMap = disc.deadline_votes || {};
  const outcome = Lifecycle.managementOutcome(deadlineContext(disc, issue, votesMap));
  const userVote = votesMap[currentUserId];
  const deadlineCanceled = disc.status === 'inactive' && disc.cancel_reason === 'deadline';
  const phaseEnds = modalKind === 'chat' ? disc.ends : ((issue && issue.ends) || disc.ends);
  const thresholdPct = Math.round(Lifecycle.MANAGEMENT_THRESHOLD * 100);
  const pctOf = (o, a) => ((o.share[a] || 0) * 100).toFixed(1);

  if (deadlineCanceled) {
    proposalModalTitle.textContent = "Reactivate Issue Voting";
  } else if (modalKind === 'tasks') {
    proposalModalTitle.textContent = "Cancel Issue Voting";
  } else if (modalKind === 'voting') {
    proposalModalTitle.textContent = "Deadline & Back to Chat Voting";
  } else {
    proposalModalTitle.textContent = "Deadline Adjustment & Voting";
  }

  let descriptionText;
  if (deadlineCanceled) {
    const log = Array.isArray(disc.lifecycle) ? disc.lifecycle : [];
    const last = log.length ? log[log.length - 1] : null;
    descriptionText = `This issue was canceled at its deadline${last && last.reason ? ' (' + escapeHtml(last.reason) + ')' : ''}. ` +
      `It comes back for one more week when Reactivate is supported by at least ${thresholdPct}% of the public's ISR-score.`;
  } else if (modalKind === 'voting') {
    descriptionText = "Adjust the voting deadline, transition back to the chat discussion, finish voting, or cancel this issue.";
  } else if (modalKind === 'tasks') {
    descriptionText = "Vote to cancel this issue and mark it as inactive.";
  } else {
    descriptionText = "Adjust the discussion deadline, initiate the voting stage, or cancel this issue.";
  }

  const rowHtml = (action) => {
    const blockedReason = outcome.blocked[action];
    const disabled = !!blockedReason && userVote !== action;
    const styles = [];
    if (action === 'cancel_issue') styles.push('color:var(--error, #e53e3e);');
    if (disabled) styles.push('opacity:0.55; cursor:not-allowed;');
    return `
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; background:var(--surface-soft); border:1px solid var(--border); padding:12px; border-radius:8px;">
          <button type="button" class="deadline-vote-btn ${userVote === action ? 'active' : ''}" data-vote="${action}"${disabled ? ' disabled data-blocked="1"' : ''}${styles.length ? ` style="${styles.join(' ')}"` : ''}>
            ${userVote === action ? '✓ ' : ''}${Lifecycle.ACTION_LABELS[action]}${blockedReason ? `<br><span style="font-size:0.72rem; font-weight:400;">${escapeHtml(blockedReason)}</span>` : ''}
          </button>
          <div style="text-align:right; min-width:120px;">
            <div style="font-size:0.95rem; font-weight:700; color:var(--text);">${(outcome.support[action] || 0).toFixed(2)} ISR</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${pctOf(outcome, action)}% of total</div>
          </div>
        </div>`;
  };
  const buttonsListHtml = outcome.buttons.map(rowHtml).join('');

  proposalModalBody.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:16px; color:var(--text);">
      <div style="font-size:0.9rem; color:var(--text-muted); border-bottom:1px solid var(--border); padding-bottom:8px; margin-bottom:8px;">
        ${descriptionText}
      </div>

      <div style="background:var(--surface-soft); padding:16px; border-radius:8px; border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:0.9rem; font-weight:600; color:var(--text-muted);">Current Deadline:</span>
        <span style="font-size:1.1rem; font-weight:700; color:var(--text);">${formatDeadlineDisplay(phaseEnds)}</span>
      </div>

      <div style="display:flex; flex-direction:column; gap:12px;">
        ${buttonsListHtml}
      </div>

      <div style="font-size:0.8rem; color:var(--text-muted); line-height:1.4; background:var(--surface-soft); padding:10px; border-radius:6px; border:1px solid var(--border);">
        💡 <b>Rule:</b> An action is carried out when its support reaches at least <b>${thresholdPct}%</b> of the ad-hoc public's total ISR-score (${outcome.pool.toFixed(2)} ISR). You are asked before your press carries one out.
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
  let deadlineMousedownOnOverlay = false;
  proposalModalOverlay.onmousedown = function(e) {
    deadlineMousedownOnOverlay = (e.target === proposalModalOverlay);
  };
  proposalModalOverlay.onclick = function(e) {
    if (e.target === proposalModalOverlay && deadlineMousedownOnOverlay) {
      closeOverlayModal();
    }
  };

  // R3: a press that would carry out an action asks first; declining stores nothing.
  const confirmText = (next, voteType) => {
    const label = Lifecycle.ACTION_LABELS[next.action];
    if (next.action === 'reactivate' && !deadlineCanceled) {
      return `Without your vote, support for "Cancel Issue" falls to ${pctOf(next, 'cancel_issue')}% (below ${thresholdPct}%), ` +
        `so the issue will be reactivated now with a deadline in ${Lifecycle.EXTEND_DAYS} days. Continue?`;
    }
    if (next.action === voteType) {
      return `With your support, "${label}" reaches ${pctOf(next, next.action)}% of the public's ISR-score ` +
        `(at least ${thresholdPct}% needed) and will be carried out now. Continue?`;
    }
    return `"${label}" has ${pctOf(next, next.action)}% of the public's ISR-score (at least ${thresholdPct}% needed) ` +
      `and will be carried out now. Continue?`;
  };

  const buttons = proposalModalBody.querySelectorAll('.deadline-vote-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', async function(e) {
      e.preventDefault();
      const voteType = this.getAttribute('data-vote');
      const nextVotes = Object.assign({}, votesMap);
      if (nextVotes[currentUserId] === voteType) delete nextVotes[currentUserId];
      else nextVotes[currentUserId] = voteType;
      const next = Lifecycle.managementOutcome(deadlineContext(disc, issue, nextVotes));
      if (next.action && !window.confirm(confirmText(next, voteType))) return;
      buttons.forEach(b => b.disabled = true);
      try {
        await submitDeadlineVote(voteType);
      } catch (err) {
        console.error("Error casting deadline vote:", err);
      } finally {
        buttons.forEach(b => b.disabled = b.hasAttribute('data-blocked'));
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
        if (btn.id === 'create-meta-relevance') return;
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          activeModalType = 'relevance';
          openRelevanceModal(disc, null, true);
        });
      });

      modalBody.querySelectorAll('[data-meta="ISR-score"]').forEach(btn => {
        if (btn.id === 'create-meta-isr') return;
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          activeModalType = 'isr';
          openIsrModal(disc, null, true);
        });
      });

      modalBody.querySelectorAll('[data-meta="Expertise"]').forEach(btn => {
        if (btn.id === 'create-meta-expertise') return;
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          activeModalType = 'expertise';
          openExpertiseModal(disc, null, true);
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
              // A1: one number. The member document is the source; the maps are a server-written
              // cache of it. No 1.5 x relevance fallback: without an ISR for this public, "N/A".
              if (cachedMemberData && cachedMemberData.relevance_score !== undefined) {
                userRelevance = (cachedMemberData.relevance_score * 100).toFixed(0) + "%";
              } else if (disc.relevance_scores && disc.relevance_scores[uidStr] !== undefined) {
                userRelevance = (disc.relevance_scores[uidStr] * 100).toFixed(0) + "%";
              }
              if (cachedMemberData && cachedMemberData.isr_score !== undefined) {
                userIsr = cachedMemberData.isr_score.toFixed(2);
              } else if (disc.isr_scores && disc.isr_scores[uidStr] !== undefined) {
                userIsr = Number(disc.isr_scores[uidStr]).toFixed(2);
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
            await loadMessageAuthorScores(db, topicId, rawMessages.map(m => m.uid)); // U3

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
              const mu = disc.mu_distance_meters !== undefined ? disc.mu_distance_meters : 100;
              const sigma = disc.sigma_decay_meters !== undefined ? disc.sigma_decay_meters : 50;
              geopositionVal = `${lat.toFixed(4)}, ${lon.toFixed(4)}<br>μ: ${mu}m, σ: ${sigma}m`;
            }

            const firstMsgText = messages.length > 0 ? messages[0].text : (disc.description || "Active civic discussion thread for community coordination.");

            const topicData = {
              name: disc.topic,
              creatorName: creatorName,
              description: firstMsgText,
              geoposition: geopositionVal,
              counter: `${messages.length} messages`,
              deadline: formatDeadlineDisplay(disc.ends || "Ongoing"),
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

            // 5. Bind Proposal option details modal and creation modal
            bindProposalInteractions(disc, topicId);

            // 6. Bind chat metadata card click handlers
            bindChatMetaButtons(disc);

            bindReactionBubbles();
            bindDiscussionInteractionHandlers(topicId, modalBody, db, currentUserId);
            
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



        // toggleReaction is hoisted to the top of renderTopicDetail

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
          const fallbackIssueRaw = currentIssueData || currentDiscData;
          if (!fallbackIssueRaw) return;
          if (isRendering) {
            pendingRender = true;
            return;
          }
          isRendering = true;

          try {
            const issue = fallbackIssueRaw;
            const disc = currentDiscData;
            
            // Use real-time synced discussions data
            const rawParticipants = disc.participants || [];
            const expertiseDepth = disc.expertise_depth || "None";
            const relevanceScores = disc.relevance_scores || {};

            const messages = currentMessagesRaw || [];

            // Resolve names for all uids
            const uidsToResolve = new Set();
            if (issue.submitter_id) uidsToResolve.add(issue.submitter_id.toString());
            
            const uniqueUids = rawParticipants.map(uid => uid.toString()).filter(uid => uid && uid !== 'system');
            const msgUids = messages.map(m => (m.uid || '').toString()).filter(uid => uid && uid !== 'system');
            const combinedUids = Array.from(new Set(uniqueUids.concat(msgUids)));

            combinedUids.forEach(uid => uidsToResolve.add(uid.toString()));
            messages.forEach(msg => {
              if (msg.uid && msg.uid !== 'system') {
                uidsToResolve.add(msg.uid.toString());
              }
            });

            await resolveUserNames(Array.from(uidsToResolve));
            await loadMessageAuthorScores(db, topicId, messages.map(m => m.uid)); // U3

            // Map messages with display names and resolved reactions
            const resolvedMessages = [];
            let indexCounter = 0;
            messages.forEach(msg => {
              const uid = msg.uid;
              let authorName = '';
              if (uid === 'system') {
                authorName = 'SYSTEM';
              } else {
                const displayName = window.userCache[uid] || ('User ' + uid);
                authorName = displayName + ' ID:' + uid;
              }

              const parsedReactions = (msg.marks || []).map(m => {
                const rUid = m.uid || '';
                const type = resolveReactionValue(m);
                const emoji = reactionEmojis[type] || '?';
                return { uid: rUid, type: type, emoji: emoji };
              });

              resolvedMessages.push({
                id: msg.id || (indexCounter + 1),
                parentID: msg.parentID,
                uid: msg.uid,
                author: authorName,
                text: msg.text,
                reactions: parsedReactions
              });
              indexCounter++;
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
              // A1: one number. The member document is the source; the maps are a server-written
              // cache of it. No 1.5 x relevance fallback: without an ISR for this public, "N/A".
              if (cachedMemberData && cachedMemberData.relevance_score !== undefined) {
                userRelevance = (cachedMemberData.relevance_score * 100).toFixed(0) + "%";
              } else if (relevanceScores[uidStr] !== undefined) {
                userRelevance = (relevanceScores[uidStr] * 100).toFixed(0) + "%";
              }
              if (cachedMemberData && cachedMemberData.isr_score !== undefined) {
                userIsr = cachedMemberData.isr_score.toFixed(2);
              } else if (isrScoresMap[uidStr] !== undefined) {
                userIsr = Number(isrScoresMap[uidStr]).toFixed(2);
              }
            }

            const relevanceWeights = formatRelevanceWeights(issue);
            const isrWeights = formatIsrWeights(issue);

            // Map options and calculate scores dynamically based on the votes map
            const userVotesMap = issue.votes || {};

            // Calculate current option scores based on votes in Firestore
            let baseOptions = [];
            if (disc && disc.options_v2 && disc.options_v2.length > 0) {
              baseOptions = disc.options_v2.map(opt => ({
                label: opt.title,
                score: 0,
                author_name: opt.author_name || "System",
                budget: opt.budget || "N/A",
                funding_source: opt.funding_source || "",
                resources_needed: opt.resources_needed || [],
                description: opt.description || []
              }));
            } else if (issue.options && issue.options.length > 0) {
              baseOptions = issue.options.map(opt => ({
                label: opt.label || opt.title,
                score: 0,
                author_name: opt.author_name || "System",
                budget: opt.budget || "N/A",
                funding_source: opt.funding_source || "",
                resources_needed: opt.resources_needed || [],
                description: opt.description || []
              }));
            } else {
              baseOptions = []; // L1: no invented options
            }

            // A1: the live tally uses the shared module (window.ISR, prototype/js/isr.js), the same
            // code the server uses when the vote closes. Voters without an ISR are not counted.
            const isrByUid = {};
            Object.keys(isrScoresMap).forEach(uid => { isrByUid[String(uid)] = isrScoresMap[uid]; });
            const votesByUid = {};
            Object.keys(userVotesMap).forEach(uid => { votesByUid[String(uid)] = userVotesMap[uid]; });
            const liveTally = ISR.tally(votesByUid, isrByUid, baseOptions.length);
            baseOptions.forEach((opt, idx) => {
              opt.score = parseFloat((liveTally.scores[idx] || 0).toFixed(2));
            });
            const notCounted = liveTally.excluded.filter(x => x.reason === "no ISR").length;

            let geopositionVal = "N/A";
            const geoDoc = disc || issue;
            if (geoDoc && geoDoc.location && typeof geoDoc.location.latitude === 'number' && typeof geoDoc.location.longitude === 'number') {
              const lat = geoDoc.location.latitude;
              const lon = geoDoc.location.longitude;
              const mu = geoDoc.mu_distance_meters !== undefined ? geoDoc.mu_distance_meters : 100;
              const sigma = geoDoc.sigma_decay_meters !== undefined ? geoDoc.sigma_decay_meters : 50;
              geopositionVal = `${lat.toFixed(4)}, ${lon.toFixed(4)}<br>μ: ${mu}m, σ: ${sigma}m`;
            }

            const topicData = {
              name: issue.title,
              description: issue.description || (messages.length > 0 ? messages[0].text : ""),
              status: issue.status || "Voting",
              statusText: `This issue is in status: ${issue.status || 'Voting'}.` + (notCounted > 0 ? ` ${notCounted} vote(s) from people without an ISR for this public are not counted.` : ''),
              counter: `Submitter: ${window.userCache[issue.submitter_id] || issue.submitter_id}`,
              deadline: formatDeadlineDisplay(issue.ends || "Active"),
              relevance: userRelevance,
              isrScore: userIsr,
              relevanceWeights: relevanceWeights,
              isrWeights: isrWeights,
              participants: combinedUids,
              expertiseDepth: expertiseDepth,
              geoposition: geopositionVal,
              options: baseOptions,
              messages: resolvedMessages
            };

            // Render topic detailed HTML
            modalBody.innerHTML = renderVotingTopic(topicData);
            bindDetailViewButtons(titleText, Object.assign({}, issue, disc));
            bindChatMetaButtons(Object.assign({}, issue, disc));
            bindDiscussionInteractionHandlers(topicId, modalBody, db, currentUserId);

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
          currentDiscData = doc.exists ? doc.data() : {};
          ensureTopicLocation(currentDiscData, topicId);
          updateVotingUI();
        }, err => {
          console.error("Listen to discussion details in voting failed:", err);
        });

        const issueUnsubscribe = db.collection("issues").doc(topicId).onSnapshot(doc => {
          if (doc.exists) {
            currentIssueData = doc.data();
            ensureTopicLocation(currentIssueData, topicId);
          } else {
            currentIssueData = null;
          }
          currentPhaseIssue = currentIssueData;
          updateVotingUI();
        }, err => {
          console.error("Listen to issue details failed:", err);
        });

        const messagesUnsubscribe = db.collection("discussions").doc(topicId).collection("messages").orderBy("timestamp", "asc")
          .onSnapshot(async snap => {
            const rawMessages = [];
            snap.forEach(mDoc => {
              rawMessages.push(Object.assign({ id: mDoc.id }, mDoc.data()));
            });
            currentMessagesRaw = rawMessages;
            updateVotingUI();
          }, err => {
            console.error("Listen to messages in voting failed:", err);
          });

        activeDetailListener = () => {
          if (issueUnsubscribe) issueUnsubscribe();
          if (discUnsubscribe) discUnsubscribe();
          if (messagesUnsubscribe) messagesUnsubscribe();
        };

      } catch (err) {
        console.error("Load issue failed:", err);
        modalBody.innerHTML = `<div style="padding:20px; color:var(--urgent);">Error loading voting: ${err.message}</div>`;
      }

    } else if (kind === 'tasks') {
      if (staticTasksMockData[topicId]) {
        try {
          const issue = staticTasksMockData[topicId];
          const currentUserId = safeGetStorage('userId') || "1";
          
          const relevanceWeights = formatRelevanceWeights(issue);
          const isrWeights = formatIsrWeights(issue);
          
          const topicData = {
            name: issue.title,
            description: issue.description,
            status: issue.status || "In progress",
            counter: `Submitter: ${issue.submitter_id}`,
            deadline: formatDeadlineDisplay(issue.ends || "Active"),
            relevance: (issue.relevance_scores[currentUserId] !== undefined) ? (issue.relevance_scores[currentUserId] * 100).toFixed(0) + "%" : "N/A",
            isrScore: (issue.isr_scores[currentUserId] !== undefined) ? issue.isr_scores[currentUserId].toFixed(2) : "N/A",
            relevanceWeights: relevanceWeights,
            isrWeights: isrWeights,
            participants: issue.participants || [],
            expertiseDepth: "None",
            geoposition: "47.5583, 7.6065<br>μ: 100m, σ: 50m",
            tasks: issue.tasks || [],
            comments: [],
            options: issue.options || [],
            winning_option_index: issue.winning_option_index !== undefined ? issue.winning_option_index : null,
            messages: []
          };
          
          modalBody.innerHTML = renderTasksTopic(topicData);
          bindDetailViewButtons(titleText, issue);
          bindChatMetaButtons(issue);
          bindTaskModalInteractions(topicId, issue);
          
          // Bind collapsible discussion drawer toggles
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
          
          return;
        } catch (e) {
          console.error("Render static mock tasks detail failed:", e);
        }
      }

      try {
        let currentMessagesRaw = null;
        let currentIssueRaw = null;
        let currentDiscRaw = null;
        let isRendering = false;
        let pendingRender = false;

        async function updateTasksUI() {
          const fallbackIssueRaw = currentIssueRaw || currentDiscRaw;
          if (!fallbackIssueRaw) return;
          if (isRendering) {
            pendingRender = true;
            return;
          }
          isRendering = true;

          try {
            const issue = fallbackIssueRaw;
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

            const safeParticipants = Array.isArray(rawParticipants) ? rawParticipants : (rawParticipants ? [rawParticipants] : []);
            const safeComments = Array.isArray(issue.comments) ? issue.comments : (issue.comments ? [issue.comments] : []);
            
            const commentUids = safeComments.map(c => (c.uid || '').toString()).filter(uid => uid && uid !== 'system');
            const uniqueUids = safeParticipants.map(uid => uid.toString()).filter(uid => uid && uid !== 'system');
            const msgUids = messages.map(m => (m.uid || '').toString()).filter(uid => uid && uid !== 'system');
            const subtaskUids = [];
            const safeTasksArray = Array.isArray(issue.tasks) ? issue.tasks : (issue.tasks ? [issue.tasks] : []);
            safeTasksArray.forEach(t => {
              if (t && typeof t === 'object' && t.subtasks) {
                (t.subtasks || []).forEach(st => {
                  if (st.in_charge_uid) subtaskUids.push(st.in_charge_uid.toString());
                  (st.comments || []).forEach(sc => {
                    if (sc.uid) subtaskUids.push(sc.uid.toString());
                  });
                });
              }
            });
            const combinedUids = Array.from(new Set(uniqueUids.concat(commentUids).concat(msgUids).concat(subtaskUids)));

            const uidsToResolve = new Set();
            if (issue.submitter_id) uidsToResolve.add(issue.submitter_id.toString());
            combinedUids.forEach(uid => uidsToResolve.add(uid.toString()));
            await resolveUserNames(Array.from(uidsToResolve));
            await loadMessageAuthorScores(db, topicId, messages.map(m => m.uid)); // U3

            // Map messages with display names and resolved reactions
            const resolvedMessages = [];
            let indexCounter = 0;
            messages.forEach(msg => {
              const uid = msg.uid;
              let authorName = '';
              if (uid === 'system') {
                authorName = 'SYSTEM';
              } else {
                const displayName = window.userCache[uid] || ('User ' + uid);
                authorName = displayName + ' ID:' + uid;
              }

              const safeMarks = Array.isArray(msg.marks) ? msg.marks : (msg.marks ? [msg.marks] : []);
              const parsedReactions = safeMarks.map(m => {
                const rUid = m.uid || '';
                const type = resolveReactionValue(m);
                const emoji = reactionEmojis[type] || '?';
                return { uid: rUid, type: type, emoji: emoji };
              });

              resolvedMessages.push({
                id: msg.id || (indexCounter + 1),
                parentID: msg.parentID,
                uid: msg.uid,
                author: authorName,
                text: msg.text,
                reactions: parsedReactions
              });
              indexCounter++;
            });

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
              // A1: one number. The member document is the source; the maps are a server-written
              // cache of it. No 1.5 x relevance fallback: without an ISR for this public, "N/A".
              if (cachedMemberData && cachedMemberData.relevance_score !== undefined) {
                userRelevance = (cachedMemberData.relevance_score * 100).toFixed(0) + "%";
              } else if (relevanceScores[uidStr] !== undefined) {
                userRelevance = (relevanceScores[uidStr] * 100).toFixed(0) + "%";
              }
              if (cachedMemberData && cachedMemberData.isr_score !== undefined) {
                userIsr = cachedMemberData.isr_score.toFixed(2);
              } else if (isrScoresMap[uidStr] !== undefined) {
                userIsr = Number(isrScoresMap[uidStr]).toFixed(2);
              }
            }

            const relevanceWeights = formatRelevanceWeights(issue);
            const isrWeights = formatIsrWeights(issue);

            let geopositionVal = "N/A";
            const geoDoc = discData || issue;
            if (geoDoc && geoDoc.location && typeof geoDoc.location.latitude === 'number' && typeof geoDoc.location.longitude === 'number') {
              const lat = geoDoc.location.latitude;
              const lon = geoDoc.location.longitude;
              const mu = geoDoc.mu_distance_meters !== undefined ? geoDoc.mu_distance_meters : 100;
              const sigma = geoDoc.sigma_decay_meters !== undefined ? geoDoc.sigma_decay_meters : 50;
              geopositionVal = `${lat.toFixed(4)}, ${lon.toFixed(4)}<br>μ: ${mu}m, σ: ${sigma}m`;
            }

            const topicData = {
              name: issue.title,
              description: issue.description,
              status: issue.status || "In progress",
              counter: `Submitter: ${issue.submitter_id}`,
              deadline: formatDeadlineDisplay(issue.ends || "Active"),
              relevance: userRelevance,
              isrScore: userIsr,
              relevanceWeights: relevanceWeights,
              isrWeights: isrWeights,
              participants: combinedUids,
              expertiseDepth: expertiseDepth,
              geoposition: geopositionVal,
              tasks: Array.isArray(issue.tasks) ? issue.tasks : (issue.tasks ? [issue.tasks] : []),
              comments: safeComments,
              options: Array.isArray(issue.options) ? issue.options : (issue.options ? [issue.options] : []),
              winning_option_index: issue.winning_option_index !== undefined ? issue.winning_option_index : null,
              messages: resolvedMessages
            };

            currentDiscData = Object.assign({}, issue, discData); // For deadline modal, etc.

            modalBody.innerHTML = renderTasksTopic(topicData);
            bindDetailViewButtons(titleText, Object.assign({}, issue, discData));
            bindChatMetaButtons(Object.assign({}, issue, discData));
            bindTaskModalInteractions(topicId, issue);
            bindDiscussionInteractionHandlers(topicId, modalBody, db, currentUserId);

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
            modalBody.innerHTML = `<div style="padding:20px; color:var(--urgent);">Inner error loading tasks UI: ${e.message}</div>`;
          } finally {
            isRendering = false;
            if (pendingRender) {
              pendingRender = false;
              updateTasksUI();
            }
          }
        }

        // Sync discussions onSnapshot
        const discUnsubscribe = db.collection("discussions").doc(topicId).onSnapshot(doc => {
          currentDiscRaw = doc.exists ? doc.data() : {};
          ensureTopicLocation(currentDiscRaw, topicId);
          updateTasksUI();
        });

        // Sync issues onSnapshot
        const issueUnsubscribe = db.collection("issues").doc(topicId).onSnapshot(doc => {
          if (doc.exists) {
            currentIssueRaw = doc.data();
            ensureTopicLocation(currentIssueRaw, topicId);
          } else {
            currentIssueRaw = null;
          }
          currentPhaseIssue = currentIssueRaw;
          updateTasksUI();
        });

        // Sync messages onSnapshot
        const messagesUnsubscribe = db.collection("discussions").doc(topicId).collection("messages").orderBy("timestamp", "asc")
          .onSnapshot(snap => {
            const rawMessages = [];
            snap.forEach(mDoc => {
              rawMessages.push(Object.assign({ id: mDoc.id }, mDoc.data()));
            });
            currentMessagesRaw = rawMessages;
            updateTasksUI();
          });

        activeDetailListener = () => {
          if (issueUnsubscribe) issueUnsubscribe();
          if (discUnsubscribe) discUnsubscribe();
          if (messagesUnsubscribe) messagesUnsubscribe();
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

    // Bind Create & Parameters elements
    const checkBtn = modalBody.querySelector('#create-check-btn');
    const submitBtn = modalBody.querySelector('#create-submit-btn');
    const titleInput = modalBody.querySelector('.topic-new-title-input');
    const descTextarea = modalBody.querySelector('.topic-form-textarea');

    const valMicrocommunity = modalBody.querySelector('#create-val-microcommunity');
    const valRelevance = modalBody.querySelector('#create-val-relevance');
    const valIsr = modalBody.querySelector('#create-val-isr');
    const valExpertise = modalBody.querySelector('#create-val-expertise');
    const tinyRelevance = modalBody.querySelector('#create-tiny-relevance');
    const tinyIsr = modalBody.querySelector('#create-tiny-isr');
    const membersBlock = modalBody.querySelector('#create-results-members-block');
    const membersList = modalBody.querySelector('#create-members-list');

    // L1 (decision 8): every chat has a deadline; the default is today + 1 month.
    let newTopicDeadline = Lifecycle.chatDeadline(null, Lifecycle.todayIn(Lifecycle.TIME_ZONE));
    newTopicGeo = [47.553832, 7.606599]; // default Basel center
    window.newTopicGeo = newTopicGeo;
    let suggestedParams = null;
    // A2: the topic starter can only clarify the context; the server derives again.
    let pendingClarification = "";
    let calculatedMembers = [];
    let microcommunityPreviewValues = null;
    const currentUserId = safeGetStorage('userId') || "1";
    const db = firebase.firestore();

    const functionsBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://127.0.0.1:5001/project-a3d59130-5adf-4677-9e2/us-central1'
      : `https://us-central1-project-a3d59130-5adf-4677-9e2.cloudfunctions.net`;

    // 1. Deadline absolute popup picker
    const deadlineBtn = modalBody.querySelector('#create-meta-deadline');
    const deadlineValEl = modalBody.querySelector('#create-val-deadline');
    if (deadlineBtn && deadlineValEl) {
      deadlineValEl.textContent = newTopicDeadline.split('-').reverse().join('.');
      deadlineBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Remove other popups
        modalBody.querySelectorAll('.reaction-users-popup').forEach(p => p.remove());
        const oldPopup = modalBody.querySelector('#create-deadline-popup');
        if (oldPopup) {
          oldPopup.remove();
          return;
        }

        const popup = document.createElement('div');
        popup.id = 'create-deadline-popup';
        popup.className = 'reaction-users-popup';
        popup.style.position = 'absolute';
        popup.style.zIndex = '101';
        popup.style.padding = '12px';
        popup.style.width = '180px';
        popup.style.display = 'flex';
        popup.style.flexDirection = 'column';
        popup.style.gap = '8px';

        popup.addEventListener('click', function(pe) { pe.stopPropagation(); });

        popup.innerHTML = `
          <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">Set Deadline</div>
          <input type="text" id="create-deadline-input" placeholder="dd.mm.yyyy" style="width: 100%; padding: 6px; border: 1px solid var(--border); border-radius: 4px; font-size: 0.82rem; background: var(--surface); color: var(--text);" />
          <button type="button" id="create-deadline-confirm-btn" class="tour-btn tour-btn-primary" style="padding: 6px; font-size: 0.8rem; width: 100%;">Confirm</button>
        `;

        this.appendChild(popup);

        // Put existing value if set
        const currentVal = deadlineValEl.textContent;
        if (currentVal && currentVal !== "Deadline" && currentVal !== "Ongoing") {
          popup.querySelector('#create-deadline-input').value = currentVal;
        }

        popup.querySelector('#create-deadline-confirm-btn').onclick = (ce) => {
          ce.stopPropagation();
          const val = popup.querySelector('#create-deadline-input').value.trim();
          if (val && !/^\d{1,2}\.\d{1,2}\.\d{2,4}$/.test(val)) {
            alert("Please enter a valid date in dd.mm.yyyy format (e.g. 15.06.2026).");
            return;
          }
          const todayYmd = Lifecycle.todayIn(Lifecycle.TIME_ZONE);
          if (val) {
            const ymd = parseInputDate(val);
            if (!Lifecycle.isDate(ymd) || ymd < todayYmd) {
              alert("The deadline must be a valid date from today on.");
              return;
            }
            deadlineValEl.textContent = val;
            newTopicDeadline = ymd;
          } else {
            // An empty field gives the default deadline (today + 1 month).
            newTopicDeadline = Lifecycle.chatDeadline(null, todayYmd);
            deadlineValEl.textContent = newTopicDeadline.split('-').reverse().join('.');
          }
          popup.remove();
        };
      });
    }

    // 2. Fetch Creator Profile Geotags for Map select shortcuts
    profileGeotags = [];
    window.profileGeotags = profileGeotags;
    async function loadCreatorGeotags() {
      try {
        const userSnap = await db.collection("users").doc(currentUserId.toString()).get();
        if (userSnap.exists) {
          profileGeotags = userSnap.data().geography || [];
          window.profileGeotags = profileGeotags;
        }
      } catch (err) {
        console.error("Error loading user profile geotags:", err);
      }
      if (profileGeotags.length === 0) {
        // Fallback mock geotags if offline/missing
        profileGeotags = [
          { id: 1, type: "home", address: "osbb 2, h12", geo: [47.5943, 7.6205] },
          { id: 2, type: "work", place: "Argo Industry", address: "Railway street, 1", geo: [47.601, 7.618] }
        ];
        window.profileGeotags = profileGeotags;
      }
    }
    loadCreatorGeotags();

    // 3. Geo Map Modal Overlay setup
    const geoBtn = modalBody.querySelector('#create-meta-geo');
    const geoValEl = modalBody.querySelector('#create-val-geo');
    const geoOverlay = document.getElementById('geo-map-modal-overlay');
    const geoCloseBtn = document.getElementById('geo-map-modal-close-btn');
    const geoConfirmBtn = document.getElementById('geo-map-confirm-btn');
    const geoAnchorsList = document.getElementById('geo-profile-anchors-list');
    const mapCanvas = document.getElementById('geo-map-canvas');

    if (geoBtn && geoOverlay) {
      geoBtn.addEventListener('click', async function(e) {
        e.stopPropagation();

        // Close other popups
        modalBody.querySelectorAll('.reaction-users-popup').forEach(p => p.remove());

        const originalCoordsText = `${newTopicGeo[0].toFixed(2)}, ${newTopicGeo[1].toFixed(2)}`;
        geoValEl.textContent = "Calculating...";

        let minDistance = Infinity;
        try {
          const snap = await db.collection("users").get();
          snap.forEach(doc => {
            const user = doc.data();
            if (user.uid.toString() === currentUserId.toString()) return;
            // A3: nearest of home, work and property
            (user.geography || []).forEach(g => {
              if (!g || !["home", "work", "property"].includes(g.type) || !Array.isArray(g.geo)) return;
              const dist = localHaversine(newTopicGeo, g.geo);
              if (dist < minDistance) {
                minDistance = dist;
              }
            });
          });
        } catch (err) {
          console.warn("Could not query user database for nearest distance:", err);
        }

        let formattedDistance = "No users found";
        if (minDistance !== Infinity) {
          if (minDistance < 1000) {
            formattedDistance = `Nearest: ${Math.round(minDistance)}m`;
          } else {
            formattedDistance = `Nearest: ${(minDistance / 1000).toFixed(1)}km`;
          }
        }

        geoValEl.textContent = formattedDistance;

        // Fade back to coordinates
        setTimeout(() => {
          geoValEl.style.transition = 'opacity 0.6s';
          geoValEl.style.opacity = '0';
          setTimeout(() => {
            geoValEl.textContent = originalCoordsText;
            geoValEl.style.opacity = '1';
          }, 600);
        }, 2500);

        // Open map overlay modal
        setTimeout(() => {
          geoOverlay.removeAttribute('hidden');
          geoOverlay.style.display = 'flex';

          const distInput = document.getElementById('geo-affect-distance');
          const fadeInput = document.getElementById('geo-affect-fade');
          if (distInput && fadeInput) {
            if (suggestedParams) {
              distInput.value = suggestedParams.mu;
              fadeInput.value = Math.round(suggestedParams.sigma * 3);
            } else {
              distInput.value = 100;
              fadeInput.value = 150;
            }
          }
          
          if (geoAnchorsList) {
            geoAnchorsList.innerHTML = '';
            profileGeotags.forEach(tag => {
              const row = document.createElement('div');
              row.className = 'geo-anchor-item';
              row.innerHTML = `
                <div>
                  <span class="geo-anchor-type">${tag.type}</span>: ${tag.place || tag.address || 'Location'}
                </div>
                 <span class="geo-anchor-coord">${tag.geo[0].toFixed(4)}, ${tag.geo[1].toFixed(4)}</span>
              `;
              row.addEventListener('click', () => {
                newTopicGeo = [tag.geo[0], tag.geo[1]];
                updateTargetMarker();
              });
              geoAnchorsList.appendChild(row);
            });
          }

          initInteractiveMap();
        }, 300);
      });
    }

    // Microcommunity click listener
    const microcommunityBtn = modalBody.querySelector('#create-meta-microcommunity');
    if (microcommunityBtn) {
      microcommunityBtn.addEventListener('click', function(e) {
        e.stopPropagation();

        const itemEl = this.closest('.topic-detail-meta-item-wrapper') || this;

        // Close other popups
        modalBody.querySelectorAll('.reaction-users-popup').forEach(p => p.remove());

        const existing = itemEl.querySelector('.reaction-users-popup');
        if (existing) {
          existing.remove();
          return;
        }

        const popup = document.createElement('div');
        popup.className = 'reaction-users-popup';
        popup.style.position = 'absolute';
        popup.style.top = '100%';
        popup.style.left = '50%';
        popup.style.transform = 'translateX(-50%)';
        popup.style.minWidth = '240px';
        popup.style.zIndex = '101';

        popup.addEventListener('click', function(pe) {
          pe.stopPropagation();
        });

        if (calculatedMembers.length === 0) {
          const item = document.createElement('div');
          item.className = 'reaction-user-item';
          item.textContent = "Please click 'Check' to suggest members.";
          popup.appendChild(item);
        } else {
          if (microcommunityPreviewValues && microcommunityPreviewValues.domains) {
            const chartWrapper = document.createElement('div');
            chartWrapper.className = 'bar-chart';
            chartWrapper.style.height = '40px';
            chartWrapper.style.paddingBottom = '0px';
            chartWrapper.style.marginBottom = '8px';
            chartWrapper.style.borderBottom = '1px solid var(--border)';
            chartWrapper.style.cursor = 'pointer';
            chartWrapper.title = 'Click to view full Ad-hoc Public Values Taxonomy';

            microcommunityPreviewValues.domains.forEach(function(domain) {
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
              console.log("chartWrapper (Create Topic Popup) clicked! microcommunityPreviewValues:", microcommunityPreviewValues);
              if (typeof window.openValuesVectorModal === 'function') {
                try {
                  window.openValuesVectorModal(microcommunityPreviewValues, "Vector of Values (Ad-hoc Public)");
                } catch (err) {
                  console.error("Error calling openValuesVectorModal:", err);
                }
              } else {
                console.error("window.openValuesVectorModal is not a function!");
              }
            });
            popup.appendChild(chartWrapper);
          }

          calculatedMembers.forEach(m => {
            const item = document.createElement('div');
            item.className = 'reaction-user-item';
            item.style.display = 'flex';
            item.style.justifyContent = 'space-between';
            item.innerHTML = `<span>${m.name}</span> <span style="font-weight:600; color:var(--primary);">Rel: ${m.score.toFixed(3)}</span>`;
            popup.appendChild(item);
          });
        }

        itemEl.appendChild(popup);
      });
    }

    // Relevance click listener
    // Relevance click listener
    const relevanceBtn = modalBody.querySelector('#create-meta-relevance');
    if (relevanceBtn) {
      relevanceBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (!suggestedParams) {
          alert("Please click 'Check' first to calculate relevance parameters.");
          return;
        }
        modalBody.querySelectorAll('.reaction-users-popup').forEach(p => p.remove());

        openRelevanceModal(
          {
            ...suggestedParams,
            w_demographic: suggestedParams.weights.w_D,
            w_geographic: suggestedParams.weights.w_G,
            w_semantic: suggestedParams.weights.w_S,
            w_social: suggestedParams.weights.w_X
          },
          (c) => rederiveWithClarification(c.clarification),
          false
        );
      });
    }

    // ISR-score click listener
    const isrBtn = modalBody.querySelector('#create-meta-isr');
    if (isrBtn) {
      isrBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (!suggestedParams) {
          alert("Please click 'Check' first to calculate ISR aggregation weights.");
          return;
        }
        modalBody.querySelectorAll('.reaction-users-popup').forEach(p => p.remove());

        openIsrModal(
          suggestedParams,
          (c) => rederiveWithClarification(c.clarification),
          false
        );
      });
    }

    // Expertise click listener
    const expertiseBtn = modalBody.querySelector('#create-meta-expertise');
    if (expertiseBtn) {
      expertiseBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (!suggestedParams) {
          alert("Please click 'Check' first to calculate required expertise.");
          return;
        }
        modalBody.querySelectorAll('.reaction-users-popup').forEach(p => p.remove());

        openExpertiseModal(
          suggestedParams,
          (c) => rederiveWithClarification(c.clarification),
          false
        );
      });
    }

    // "Derive again": send the clarification to the server with the same text inputs.
    function rederiveWithClarification(text) {
      pendingClarification = (text || "").trim();
      if (checkBtn) checkBtn.click();
    }

    window.mapInstance = null;
    window.mapMarker = null;
    window.zoomLevel = 1.0;
    window.panX = 0;
    window.panY = 0;

    // Global map rendering and update logic moved to top level

    if (geoConfirmBtn) {
      geoConfirmBtn.onclick = (e) => {
        e.stopPropagation();
        // A2: μ and σ are derived by the server (Check); the map only shows them.
        geoValEl.textContent = `${newTopicGeo[0].toFixed(2)}, ${newTopicGeo[1].toFixed(2)}`;
        geoOverlay.setAttribute('hidden', 'true');
        geoOverlay.style.display = 'none';
        const searchInput = document.getElementById('geo-map-search-input');
        const searchResults = document.getElementById('geo-map-search-results');
        if (searchInput) searchInput.value = '';
        if (searchResults) {
          searchResults.style.display = 'none';
          searchResults.innerHTML = '';
        }
      };
    }

    if (geoCloseBtn) {
      geoCloseBtn.onclick = (e) => {
        e.stopPropagation();
        geoOverlay.setAttribute('hidden', 'true');
        geoOverlay.style.display = 'none';
        const searchInput = document.getElementById('geo-map-search-input');
        const searchResults = document.getElementById('geo-map-search-results');
        if (searchInput) searchInput.value = '';
        if (searchResults) {
          searchResults.style.display = 'none';
          searchResults.innerHTML = '';
        }
      };
    }

    // Geocoding Place Search
    const searchInput = document.getElementById('geo-map-search-input');
    const searchBtn = document.getElementById('geo-map-search-btn');
    const searchResults = document.getElementById('geo-map-search-results');

    async function handleGeoSearch() {
      if (!searchInput) return;
      const query = searchInput.value.trim();
      if (!query) return;

      if (searchBtn) {
        searchBtn.disabled = true;
        searchBtn.textContent = "Searching...";
      }
      if (searchResults) {
        searchResults.style.display = 'flex';
        searchResults.innerHTML = '<div style="color: var(--text-muted); padding: 4px;">Searching...</div>';
      }

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`, {
          headers: {
            'Accept-Language': 'en'
          }
        });
        if (!res.ok) throw new Error("Search service error");
        const results = await res.json();

        if (results.length === 0) {
          if (searchResults) {
            searchResults.innerHTML = `<div style="color: var(--text-muted); padding: 4px;">No results found.</div>`;
          }
          return;
        }

        if (results.length === 1) {
          const item = results[0];
          applySearchResult(parseFloat(item.lat), parseFloat(item.lon));
          if (searchResults) {
            searchResults.style.display = 'none';
            searchResults.innerHTML = '';
          }
        } else {
          if (searchResults) {
            searchResults.innerHTML = '';
            results.forEach(item => {
              const div = document.createElement('div');
              div.className = 'geo-search-result-item';
              div.style.cursor = 'pointer';
              div.style.padding = '6px 10px';
              div.style.borderBottom = '1px solid var(--border)';
              div.style.borderRadius = '4px';
              div.style.transition = 'background 0.2s';
              div.textContent = item.display_name;

              div.onmouseover = () => { div.style.background = 'var(--surface-hover)'; };
              div.onmouseout = () => { div.style.background = ''; };

              div.onclick = () => {
                applySearchResult(parseFloat(item.lat), parseFloat(item.lon));
                searchResults.style.display = 'none';
                searchResults.innerHTML = '';
              };
              searchResults.appendChild(div);
            });
          }
        }
      } catch (err) {
        console.warn("Geocoding failed:", err);
        if (searchResults) {
          searchResults.innerHTML = `<div style="color: var(--text-muted); padding: 4px;">Search failed. Please try again.</div>`;
        }
      } finally {
        if (searchBtn) {
          searchBtn.disabled = false;
          searchBtn.textContent = "Search";
        }
      }
    }

    function applySearchResult(lat, lon) {
      newTopicGeo = [lat, lon];
      window.newTopicGeo = newTopicGeo;

      const coordsInput = document.getElementById('geo-epicenter-coords');
      if (coordsInput) {
        coordsInput.value = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
      }

      window.updateTargetMarker();

      const distInput = document.getElementById('geo-affect-distance');
      const fadeInput = document.getElementById('geo-affect-fade');
      const muVal = parseFloat(distInput ? distInput.value : 100) || 100;
      const fadeVal = parseFloat(fadeInput ? fadeInput.value : 150) || 150;
      window.updateCircles(lat, lon, muVal, fadeVal / 3);
    }

    if (searchBtn) {
      searchBtn.onclick = (e) => {
        e.stopPropagation();
        handleGeoSearch();
      };
    }
    if (searchInput) {
      searchInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.stopPropagation();
          e.preventDefault();
          handleGeoSearch();
        }
      };
    }

    // 4. Demographic check local logic helper
    function localEvaluateDemographics(user, criteria) {
      if (!criteria) return 1.0;
      if (user.birthDate) {
        const birthYear = parseInt(user.birthDate.split("-")[0]);
        if (!isNaN(birthYear)) {
          const age = 2026 - birthYear; // Baseline year 2026
          if (criteria.minAge !== undefined && age < criteria.minAge) return 0.0;
          if (criteria.maxAge !== undefined && age > criteria.maxAge) return 0.0;
        }
      }
      if (criteria.employmentStatus && criteria.employmentStatus !== "any") {
        const isEmployed = Array.isArray(user.post) && user.post.length > 0;
        if (criteria.employmentStatus === "employed" && !isEmployed) return 0.0;
        if (criteria.employmentStatus === "unemployed" && isEmployed) return 0.0;
      }
      if (criteria.familyStatus && criteria.familyStatus !== "any") {
        const relations = user.socialRelations || [];
        const hasChildren = relations.some(r => ["child", "son", "daughter"].includes((r.type || '').toLowerCase()));
        const hasGrandchildren = relations.some(r => ["grandchild", "grandson", "granddaughter"].includes((r.type || '').toLowerCase()));
        if (criteria.familyStatus === "parent" && !hasChildren) return 0.0;
        if (criteria.familyStatus === "grandparent" && !hasGrandchildren) return 0.0;
      }
      if (Array.isArray(criteria.features) && criteria.features.length > 0) {
        const userFeaturesStr = (user.features || []).join(" ").toLowerCase();
        const hasMatchingFeature = criteria.features.some((f) => {
          const term = f.toLowerCase().trim();
          if (!term) return false;
          if (userFeaturesStr.includes(term)) return true;
          if ((term.includes("pet") || term.includes("animal")) &&
              (userFeaturesStr.includes("dog") || userFeaturesStr.includes("cat") || userFeaturesStr.includes("pet") || userFeaturesStr.includes("animal"))) {
            return true;
          }
          return false;
        });
        if (!hasMatchingFeature) return 0.0;
      }
      return 1.0;
    }

    // Haversine distance helper
    function localHaversine(coords1, coords2) {
      const R = 6371e3;
      const lat1 = coords1[0] * Math.PI / 180;
      const lat2 = coords2[0] * Math.PI / 180;
      const deltaLat = (coords2[0] - coords1[0]) * Math.PI / 180;
      const deltaLon = (coords2[1] - coords1[1]) * Math.PI / 180;
      const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }

    // Helper to calculate microcommunity values preview from members list
    async function calculateMicrocommunityValuesFromMembers(members) {
      if (!members || members.length === 0) return null;
      
      const uidsToFetch = members.map(m => m.uid.toString());
      const userTaxonomies = {};
      
      if (typeof firebase !== 'undefined') {
        const db = firebase.firestore();
        await Promise.all(uidsToFetch.map(async (uid) => {
          try {
            const userDoc = await db.collection("users").doc(uid).get();
            if (userDoc.exists) {
              const uData = userDoc.data();
              if (uData && uData.values_taxonomy) {
                userTaxonomies[uid] = uData.values_taxonomy;
              }
            }
          } catch (e) {
            console.warn(`Failed to fetch values taxonomy for user ${uid}:`, e);
          }
        }));
      }

      // Provide mock taxonomies for missing users so the prototype always renders a chart
      members.forEach((m, index) => {
        const uid = m.uid.toString();
        if (!userTaxonomies[uid]) {
          const sourceTax = window.currentUserValues || window.vectorData || {};
          let rawDomains = [];
          if (Array.isArray(sourceTax.domains)) {
            rawDomains = sourceTax.domains.map(d => {
              if (typeof d === 'number') return d;
              if (d && typeof d.score === 'number') return d.score;
              return 50;
            });
          } else {
            rawDomains = [50, 50, 50, 50, 50, 50, 50, 50, 50, 50];
          }

          let rawShifts = { work: [], family: [], private: [], crisis: [] };
          const shiftsObj = sourceTax.contextual_shifts || sourceTax.contextShifts || {};
          ['work', 'family', 'private', 'crisis'].forEach(ctx => {
            rawShifts[ctx] = Array.isArray(shiftsObj[ctx]) ? [...shiftsObj[ctx]] : [0,0,0,0,0,0,0,0,0,0];
          });

          let rawConflict = [];
          const cr = sourceTax.conflict_resolution || sourceTax.conflictResolution || [];
          for (let i = 0; i < 36; i++) {
            const entry = cr[i];
            if (typeof entry === 'number') {
              rawConflict.push(entry);
            } else if (entry && typeof entry.weight === 'number') {
              rawConflict.push(entry.weight);
            } else {
              rawConflict.push(50);
            }
          }

          const rawItems = {};
          const itemsObj = sourceTax.items || {};
          for (let i = 1; i <= 10; i++) {
            const key = 'd' + i;
            rawItems[key] = Array.isArray(itemsObj[key]) ? [...itemsObj[key]] : [];
          }

          // Slightly perturb the values based on index to make it look distinct from personal vector
          const perturbedDomains = rawDomains.map(d => Math.max(0, Math.min(100, d + (index % 3 === 1 ? 15 : (index % 3 === 2 ? -10 : 5)))));

          userTaxonomies[uid] = {
            domains: perturbedDomains,
            contextual_shifts: rawShifts,
            items: rawItems,
            conflict_resolution: rawConflict
          };
        }
      });

      const validMembers = members.filter(m => userTaxonomies[m.uid.toString()]);
      if (validMembers.length === 0) return null;

      try {
        const avgDomains = [];
        for (let i = 0; i < 10; i++) {
          let valSum = 0;
          let relSum = 0;
          validMembers.forEach(m => {
            const taxonomy = userTaxonomies[m.uid.toString()];
            const domainsList = taxonomy.domains || [];
            const score = m.score !== undefined ? m.score : (m.relevance !== undefined ? m.relevance : 0.1);
            if (domainsList[i] !== undefined && domainsList[i] !== null) {
              valSum += domainsList[i] * score;
              relSum += score;
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
              const taxonomy = userTaxonomies[m.uid.toString()];
              const shifts = taxonomy.contextual_shifts || {};
              const ctxList = shifts[ctx] || [];
              const score = m.score !== undefined ? m.score : (m.relevance !== undefined ? m.relevance : 0.1);
              if (ctxList[i] !== undefined && ctxList[i] !== null) {
                valSum += ctxList[i] * score;
                relSum += score;
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
            const taxonomy = userTaxonomies[m.uid.toString()];
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
                const taxonomy = userTaxonomies[m.uid.toString()];
                const items = taxonomy.items || {};
                const itemList = items[key] || [];
                const score = m.score !== undefined ? m.score : (m.relevance !== undefined ? m.relevance : 0.1);
                if (itemList[j] !== undefined && itemList[j] !== null) {
                  valSum += itemList[j] * score;
                  relSum += score;
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
            const taxonomy = userTaxonomies[m.uid.toString()];
            const conflicts = taxonomy.conflict_resolution || [];
            let val = null;
            if (conflicts[i] !== undefined && conflicts[i] !== null) {
              const entry = conflicts[i];
              val = (typeof entry === 'object' && entry !== null) ? entry.weight : entry;
            }
            const score = m.score !== undefined ? m.score : (m.relevance !== undefined ? m.relevance : 0.1);
            if (val !== null) {
              valSum += val * score;
              relSum += score;
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
        console.error("calculateMicrocommunityValuesFromMembers error:", err);
        return null;
      }
    }

    // 5. Check calculation triggers (Recalculation supported)
    if (checkBtn) {
      checkBtn.addEventListener('click', async () => {
        const title = titleInput.value.trim();
        const description = descTextarea.value.trim();
        if (!title || !description) {
          alert("Please specify both Title and Description before checking.");
          return;
        }

        checkBtn.disabled = true;
        checkBtn.textContent = "Calculating...";

        try {
          let data = null;
          // Attempt server-side check calculation
          try {
            // A2: text only. Numbers are derived on the server and never sent.
            const payload = {
              title: title,
              description: description,
              location: newTopicGeo,
              submitterId: currentUserId,
              clarification: pendingClarification
            };

            const res = await fetch(`${functionsBaseUrl}/checkIssue`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            if (res.ok) {
              data = await res.json();
            } else {
              const errData = await res.json();
              throw new Error(errData.error || "Server calculation error");
            }
          } catch (err) {
            console.warn("Server check failed:", err);
          }

          if (data && data.success) {
            suggestedParams = {
              draftId: data.draftId,
              clarification: data.clarification || "",
              category: data.category,
              classification: data.classification || null,
              mu: data.mu,
              sigma: data.sigma,
              geographic_parameters: data.geographic_parameters || null,
              weights: data.weights,
              w_relevance: data.aggregation_weights.w_relevance,
              w_expertise: data.aggregation_weights.w_expertise,
              w_contribution: data.aggregation_weights.w_contribution,
              relevance_reasoning: data.relevance_reasoning || "",
              aggregation_reasoning: data.aggregation_reasoning || "",
              relevance_explanations: data.relevance_explanations || null,
              isr_explanations: data.isr_explanations || null,
              demographics: data.demographics,
              expertise_depth: data.expertise_depth,
              expertise_domain: data.expertise_domain || data.category,
              expertise_domain_parameters: data.expertise_domain_parameters || null,
              resources_needed: data.resources_needed || []
            };
            calculatedMembers = data.members;
            pendingClarification = "";
            const distShow = document.getElementById('geo-affect-distance');
            const fadeShow = document.getElementById('geo-affect-fade');
            if (distShow && fadeShow) {
              distShow.value = suggestedParams.mu;
              fadeShow.value = Math.round(suggestedParams.sigma * 3);
            }
          } else {
            // A2: no parameters are derived in the browser. Without the server
            // nothing can be checked or published.
            throw new Error("The server could not derive the issue parameters. Nothing was changed; please try again.");
          }

          // Calculate aggregated values preview
          if (calculatedMembers && calculatedMembers.length > 0) {
            try {
              const rawTaxonomy = await calculateMicrocommunityValuesFromMembers(calculatedMembers);
              if (rawTaxonomy) {
                microcommunityPreviewValues = mapTaxonomyToUserValues(rawTaxonomy);
              }
            } catch (vErr) {
              console.error("Failed to calculate microcommunity values preview:", vErr);
            }
          }

          // Render metadata button value labels
          valMicrocommunity.textContent = `${calculatedMembers.length} members`;
          
          const dataWeights = suggestedParams.weights;
          const wRelevanceObj = {
            w_demographic: dataWeights.w_D,
            w_geographic: dataWeights.w_G,
            w_semantic: dataWeights.w_S,
            w_social: dataWeights.w_X
          };
          tinyRelevance.innerHTML = formatRelevanceWeights(wRelevanceObj);
          valRelevance.textContent = `100%`;

          const wIsrObj = {
            w_relevance: suggestedParams.w_relevance,
            w_expertise: suggestedParams.w_expertise,
            w_contribution: suggestedParams.w_contribution
          };
          tinyIsr.innerHTML = formatIsrWeights(wIsrObj);
          valIsr.textContent = `1.50`;

          const domainVal = suggestedParams.expertise_domain || "General Maintenance";
          const depthVal = suggestedParams.expertise_depth || "None";
          valExpertise.textContent = (domainVal ? domainVal + ', ' : '') + depthVal;

          // Show members list block
          if (membersBlock && membersList) {
            membersBlock.style.display = 'block';
            membersList.innerHTML = '';
            calculatedMembers.forEach(m => {
              const row = document.createElement('div');
              row.style.display = 'flex';
              row.style.justifyContent = 'space-between';
              row.style.padding = '4px 0';
              row.style.borderBottom = '1px solid var(--border-soft)';
              row.innerHTML = `
                <span>${m.name}</span>
                <span style="font-weight:600; color:var(--primary);">Rel: ${m.score.toFixed(3)}</span>
              `;
              membersList.appendChild(row);
            });
          }

          // Enable metadata buttons
          const mcBtnEl = modalBody.querySelector('#create-meta-microcommunity');
          const relBtnEl = modalBody.querySelector('#create-meta-relevance');
          const isrBtnEl = modalBody.querySelector('#create-meta-isr');
          const expBtnEl = modalBody.querySelector('#create-meta-expertise');
          if (mcBtnEl) mcBtnEl.removeAttribute('disabled');
          if (relBtnEl) relBtnEl.removeAttribute('disabled');
          if (isrBtnEl) isrBtnEl.removeAttribute('disabled');
          if (expBtnEl) expBtnEl.removeAttribute('disabled');

          if (submitBtn) {
            submitBtn.removeAttribute('disabled');
          }

        } catch(err) {
          console.error("Check failed:", err);
          alert(`Check calculations error: ${err.message}`);
        } finally {
          checkBtn.removeAttribute('disabled');
          checkBtn.textContent = "Check";
        }
      });
    }

    // 6. Create button database submission handler
    if (submitBtn) {
      submitBtn.addEventListener('click', async () => {
        const title = titleInput.value.trim();
        const description = descTextarea.value.trim();
        if (!title || !description || !suggestedParams) return;

        submitBtn.disabled = true;
        submitBtn.textContent = "Creating issue...";

        try {
          // A2: the server creates the issue from the draft it derived at Check.
          // Only text inputs are sent; every number comes from the draft.
          const res = await fetch(`${functionsBaseUrl}/createIssue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              draftId: suggestedParams.draftId,
              title: title,
              description: description,
              location: newTopicGeo,
              submitterId: currentUserId,
              deadline: newTopicDeadline
            })
          });
          const out = await res.json().catch(() => ({}));
          if (!res.ok || !out.success) {
            throw new Error(out.error || "The server could not create the issue.");
          }

          alert(`Issue created successfully! Formed ad-hoc public with ${out.members_count} members.`);
          restoreTopicListView();

        } catch(err) {
          console.error("Create failed:", err);
          alert(`Create issue error: ${err.message}`);
          submitBtn.removeAttribute('disabled');
          submitBtn.textContent = "Create";
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
          
          // Toggle popup: if it exists, remove it and exit
          const isCurrentlyOpen = this.querySelector('.reaction-users-popup');
          document.querySelectorAll('.reaction-users-popup').forEach(function(p) { p.remove(); });
          if (isCurrentlyOpen) return;

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

          this.appendChild(popup);
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
    }
    bindReactionBubbles();

    // Bind Microcommunity Button clicks
    modalBody.querySelectorAll('.microcommunity-btn').forEach(btn => {
      btn.addEventListener('click', async function(e) {
        e.stopPropagation();

        const itemEl = this.closest('.topic-detail-meta-item-wrapper') || this.closest('.topic-detail-meta-item');
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

// Function extracted to global scope (main.js top level)

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
          // Immediately show a loading popup so the UI feels responsive
          const loadingPopup = document.createElement('div');
          loadingPopup.className = 'reaction-users-popup loading-popup-temp';
          loadingPopup.style.top = '100%';
          loadingPopup.style.left = '50%';
          loadingPopup.style.transform = 'translateX(-50%)';
          loadingPopup.style.minWidth = '240px';
          loadingPopup.style.padding = '12px';
          loadingPopup.style.textAlign = 'center';
          loadingPopup.style.color = 'var(--text-muted)';
          loadingPopup.textContent = 'Loading ad-hoc public...';
          itemEl.appendChild(loadingPopup);

          const db = typeof firebase !== 'undefined' ? firebase.firestore() : null;
          let issueData = null;
          let topicMessages = [];
          
          if (db) {
          try {
            const issueDoc = await db.collection("issues").doc(topicId).get();
            if (issueDoc.exists) {
              issueData = issueDoc.data();
            }
          } catch (err) {
            console.error("Failed to fetch issue for voting status:", err);
          }

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
              } else {
                const membersList = uids.map(uid => ({ uid: uid, relevance: 0.1 }));
                const fallbackTax = await calculateMicrocommunityValuesFromMembers(membersList);
                if (fallbackTax) mcValues = mapTaxonomyToUserValues(fallbackTax);
              }
            }
          } catch (err) {
            console.error("Failed to fetch microcommunity doc:", err);
            const dynamicTax = await calculateMicrocommunityValuesDynamic(uids, topicId);
            if (dynamicTax) {
              mcValues = mapTaxonomyToUserValues(dynamicTax);
            } else {
              const membersList = uids.map(uid => ({ uid: uid, relevance: 0.1 }));
              const fallbackTax = await calculateMicrocommunityValuesFromMembers(membersList);
              if (fallbackTax) mcValues = mapTaxonomyToUserValues(fallbackTax);
            }
          }
          }
          
          if (!db) {
            // Fallback immediately if offline
            const membersList = uids.map(uid => ({ uid: uid, relevance: 0.1 }));
            const fallbackTax = await calculateMicrocommunityValuesFromMembers(membersList);
            if (fallbackTax) mcValues = mapTaxonomyToUserValues(fallbackTax);
          }

          // Remove the temporary loading popup
          const tempLoading = itemEl.querySelector('.loading-popup-temp');
          if (tempLoading) tempLoading.remove();

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
          chartWrapper.title = 'Click to view full Ad-hoc Public Values Taxonomy';

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
            console.log("chartWrapper (Issue Detail Popup) clicked! mcValues:", mcValues);
            if (typeof window.openValuesVectorModal === 'function') {
              try {
                window.openValuesVectorModal(mcValues, "Vector of Values (Ad-hoc Public)");
              } catch (err) {
                console.error("Error calling openValuesVectorModal:", err);
              }
            } else {
              console.error("window.openValuesVectorModal is not a function!");
            }
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

    // Bind click listeners for Relevance, ISR-score, and Expertise in discussion detail view
    modalBody.querySelectorAll('[data-meta="Relevance"]').forEach(btn => {
      if (btn.id === 'create-meta-relevance') return;
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        openRelevanceModal(
          disc,
          null,
          true
        );
      });
    });

    modalBody.querySelectorAll('[data-meta="ISR-score"]').forEach(btn => {
      if (btn.id === 'create-meta-isr') return;
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        openIsrModal(
          disc,
          null,
          true
        );
      });
    });

    modalBody.querySelectorAll('[data-meta="Expertise"]').forEach(btn => {
      if (btn.id === 'create-meta-expertise') return;
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        openExpertiseModal(
          disc,
          null,
          true
        );
      });
    });

    modalBody.querySelectorAll('[data-meta="📍"]').forEach(btn => {
      if (btn.id === 'create-meta-geo') return;
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (!disc || !disc.location) {
          alert("No location data available for this issue.");
          return;
        }

        // Close other popups
        modalBody.querySelectorAll('.reaction-users-popup').forEach(p => p.remove());

        const geoOverlay = document.getElementById('geo-map-modal-overlay');
        if (!geoOverlay) return;

        const lat = disc.location.latitude;
        const lon = disc.location.longitude;
        const mu = disc.mu_distance_meters !== undefined ? disc.mu_distance_meters : 100;
        const sigma = disc.sigma_decay_meters !== undefined ? disc.sigma_decay_meters : 50;

        // Populate overlay parameters
        const coordsInput = document.getElementById('geo-epicenter-coords');
        if (coordsInput) {
          coordsInput.value = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
        }

        const distInput = document.getElementById('geo-affect-distance');
        const fadeInput = document.getElementById('geo-affect-fade');
        if (distInput && fadeInput) {
          distInput.value = mu;
          fadeInput.value = Math.round(sigma * 3);
          
          // Disable them since it's read-only view
          distInput.disabled = true;
          fadeInput.disabled = true;
        }

        // Hide profile anchors list and confirm button in detail/read-only view
        const geoAnchorsHeader = Array.from(geoOverlay.querySelectorAll('div')).find(el => el.textContent.trim().toUpperCase() === 'YOUR PROFILE GEOTAGS');
        if (geoAnchorsHeader) geoAnchorsHeader.style.display = 'none';
        
        const geoAnchorsList = document.getElementById('geo-profile-anchors-list');
        if (geoAnchorsList) {
          geoAnchorsList.style.display = 'none';
        }

        const geoConfirmBtn = document.getElementById('geo-map-confirm-btn');
        if (geoConfirmBtn) {
          geoConfirmBtn.style.display = 'none';
        }

        // Update modal title to "View Geotag"
        const modalTitle = geoOverlay.querySelector('h3');
        if (modalTitle) {
          modalTitle.textContent = "View Geotag";
        }
        
        const modalDesc = geoOverlay.querySelector('p');
        if (modalDesc) {
          modalDesc.textContent = "Epicenter location and influence range for this issue.";
        }

        // Hide search bar in read-only view
        const searchInput = document.getElementById('geo-map-search-input');
        const searchResults = document.getElementById('geo-map-search-results');
        if (searchInput) {
          searchInput.parentElement.style.display = 'none';
        }
        if (searchResults) {
          searchResults.style.display = 'none';
        }

        // Show overlay first, so that the canvas has a layout size
        geoOverlay.removeAttribute('hidden');
        geoOverlay.style.display = 'flex';

        // Update coordinate variables before rendering
        newTopicGeo = [lat, lon];
        window.newTopicGeo = newTopicGeo;

        // Render Leaflet/fallback interactive map in read-only mode
        window.initInteractiveMap(true);

        // Override close btn click or overlay click to clean up
        const geoCloseBtn = document.getElementById('geo-map-modal-close-btn');
        const originalCloseClick = geoCloseBtn ? geoCloseBtn.onclick : null;

        const cleanupGeoOverlay = () => {
          geoOverlay.setAttribute('hidden', 'true');
          geoOverlay.style.display = 'none';

          if (window.detailMapInstance) {
            try {
              window.detailMapInstance.remove();
            } catch(e) {
              console.warn(e);
            }
            window.detailMapInstance = null;
          }
          window.leafletInnerCircle = null;
          window.leafletOuterCircle = null;
          window.googleInnerCircle = null;
          window.googleOuterCircle = null;
          
          // Restore inputs and buttons to original state
          if (coordsInput) {
            coordsInput.value = '';
          }
          if (distInput && fadeInput) {
            distInput.disabled = false;
            fadeInput.disabled = false;
          }
          if (geoAnchorsHeader) geoAnchorsHeader.style.display = '';
          if (geoAnchorsList) geoAnchorsList.style.display = '';
          if (geoConfirmBtn) geoConfirmBtn.style.display = '';
          if (modalTitle) modalTitle.textContent = "Select Geotag";
          if (modalDesc) modalDesc.textContent = "Click on the map or select one of your profile anchors below to position the issue geotag.";
          
          // Restore search bar
          if (searchInput) {
            searchInput.parentElement.style.display = 'flex';
            searchInput.value = '';
          }
          if (searchResults) {
            searchResults.style.display = 'none';
            searchResults.innerHTML = '';
          }

          if (geoCloseBtn) geoCloseBtn.onclick = originalCloseClick;
          geoOverlay.onmousedown = null;
          geoOverlay.onclick = null;
        };

        if (geoCloseBtn) {
          geoCloseBtn.onclick = function(ce) {
            ce.stopPropagation();
            cleanupGeoOverlay();
          };
        }

        let geoMousedownOnOverlay = false;
        geoOverlay.onmousedown = function(ce) {
          geoMousedownOnOverlay = (ce.target === geoOverlay);
        };
        geoOverlay.onclick = function(ce) {
          if (ce.target === geoOverlay && geoMousedownOnOverlay) {
            cleanupGeoOverlay();
          }
        };
      });
    });
  }

  function bindTaskModalInteractions(topicId, issue) {
    const currentUserId = safeGetStorage('userId');
    if (!currentUserId) return;
    
    const db = firebase.firestore();
    const isMock = topicId.startsWith('task-');
    const docRef = isMock ? null : db.collection("issues").doc(topicId);

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

        if (isMock) {
          task.status = task.status === 'done' ? 'pending' : 'done';
          if (task.status === 'done') {
            task.results = "Mock task execution completed.";
          } else {
            delete task.results;
          }
          console.log("Mock task status updated in memory.");
          if (typeof window.triggerTasksListRender === 'function') {
            window.triggerTasksListRender();
          }
          renderTopicDetail('tasks', topicId, modalBody.__sourceViewHtml, modalBody.getAttribute('data-topic-source-title'));
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

        if (isMock) {
          task.status = 'canceled';
          console.log("Mock task canceled.");
          if (typeof window.triggerTasksListRender === 'function') {
            window.triggerTasksListRender();
          }
          renderTopicDetail('tasks', topicId, modalBody.__sourceViewHtml, modalBody.getAttribute('data-topic-source-title'));
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

        if (isMock) {
          task.status = 'pending';
          console.log("Mock task restored.");
          if (typeof window.triggerTasksListRender === 'function') {
            window.triggerTasksListRender();
          }
          renderTopicDetail('tasks', topicId, modalBody.__sourceViewHtml, modalBody.getAttribute('data-topic-source-title'));
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

        if (isMock) {
          subtask.status = subtask.status === 'done' ? 'pending' : 'done';
          console.log("Mock subtask status updated in memory.");
          renderTopicDetail('tasks', topicId, modalBody.__sourceViewHtml, modalBody.getAttribute('data-topic-source-title'));
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

        if (isMock) {
          task.subtasks.splice(subtaskIdx, 1);
          console.log("Mock subtask removed in memory.");
          renderTopicDetail('tasks', topicId, modalBody.__sourceViewHtml, modalBody.getAttribute('data-topic-source-title'));
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
        const deadlineRaw = deadlineInput ? deadlineInput.value.trim() : '';
        if (deadlineRaw && !/^\d{1,2}\.\d{1,2}\.\d{2,4}$/.test(deadlineRaw) && deadlineRaw !== "Ongoing") {
          alert("Please enter the deadline in dd.mm.yyyy format (e.g. 15.05.2026) or enter 'Ongoing'.");
          return;
        }
        const deadline = parseInputDate(deadlineRaw);

        const newSubtask = {
          title: text,
          status: 'pending',
          in_charge_uid: respUid,
          in_charge_name: respName,
          deadline: deadline
        };

        if (isMock) {
          if (!task.subtasks) task.subtasks = [];
          task.subtasks.push(newSubtask);
          inputEl.value = '';
          const breakdownForm = modalBody.querySelector(`#task-breakdown-form-${taskIdx}`);
          if (breakdownForm) breakdownForm.style.display = 'none';
          console.log("Mock subtask added successfully.");
          renderTopicDetail('tasks', topicId, modalBody.__sourceViewHtml, modalBody.getAttribute('data-topic-source-title'));
          return;
        }

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
           timestamp: formatDateWithSetting(new Date()) // e.g. "06.06.2026"
        };

        if (isMock) {
          const tasks = issue.tasks || [];
          if (tasks[taskIdx]) {
            if (!tasks[taskIdx].comments) tasks[taskIdx].comments = [];
            tasks[taskIdx].comments.push(newComment);
            inputEl.value = '';
            const commentForm = modalBody.querySelector(`#task-comment-form-${taskIdx}`);
            if (commentForm) commentForm.style.display = 'none';
            console.log("Mock task comment added in memory.");
            renderTopicDetail('tasks', topicId, modalBody.__sourceViewHtml, modalBody.getAttribute('data-topic-source-title'));
          }
          return;
        }

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
             timestamp: formatDateWithSetting(new Date()),
             parent_id: parentId
          };

          if (isMock) {
            const tasks = issue.tasks || [];
            if (tasks[taskIdx]) {
              const subtasks = tasks[taskIdx].subtasks || [];
              if (subtasks[subtaskIdx]) {
                if (!subtasks[subtaskIdx].comments) subtasks[subtaskIdx].comments = [];
                subtasks[subtaskIdx].comments.push(newReply);
                inputEl.value = '';
                replyForm.style.display = 'none';
                console.log("Mock subtask reply added successfully.");
                renderTopicDetail('tasks', topicId, modalBody.__sourceViewHtml, modalBody.getAttribute('data-topic-source-title'));
              }
            }
            return;
          }

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
             timestamp: formatDateWithSetting(new Date()),
             parent_id: parentId
          };

          if (isMock) {
            const tasks = issue.tasks || [];
            if (tasks[taskIdx]) {
              if (!tasks[taskIdx].comments) tasks[taskIdx].comments = [];
              tasks[taskIdx].comments.push(newReply);
              inputEl.value = '';
              replyForm.style.display = 'none';
              console.log("Mock task reply added successfully.");
              renderTopicDetail('tasks', topicId, modalBody.__sourceViewHtml, modalBody.getAttribute('data-topic-source-title'));
            }
            return;
          }

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

        if (isMock) {
          const tasks = issue.tasks || [];
          if (tasks[taskIdx]) {
            tasks[taskIdx].results = resultsText;
            console.log("Mock task results saved in memory.");
            alert("Task results saved successfully.");
            renderTopicDetail('tasks', topicId, modalBody.__sourceViewHtml, modalBody.getAttribute('data-topic-source-title'));
          }
          return;
        }

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
          timestamp: formatDateWithSetting(new Date())
        };

        if (isMock) {
          const tasks = issue.tasks || [];
          if (tasks[taskIdx]) {
            const subtasks = tasks[taskIdx].subtasks || [];
            if (subtasks[subtaskIdx]) {
              if (!subtasks[subtaskIdx].comments) subtasks[subtaskIdx].comments = [];
              subtasks[subtaskIdx].comments.push(newComment);
              inputEl.value = '';
              console.log("Mock subtask comment added in memory.");
              renderTopicDetail('tasks', topicId, modalBody.__sourceViewHtml, modalBody.getAttribute('data-topic-source-title'));
            }
          }
          return;
        }

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

        if (isMock) {
          const tasks = issue.tasks || [];
          if (tasks[taskIdx] && tasks[taskIdx].subtasks && tasks[taskIdx].subtasks[subtaskIdx]) {
            tasks[taskIdx].subtasks[subtaskIdx].results = resultsText;
            console.log("Mock subtask results saved in memory.");
            alert("Subtask results saved successfully.");
            renderTopicDetail('tasks', topicId, modalBody.__sourceViewHtml, modalBody.getAttribute('data-topic-source-title'));
          }
          return;
        }

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
      if (isMock) {
        if (msgId.startsWith('task_')) {
          const taskIdx = parseInt(msgId.substring(5), 10);
          const tasks = issue.tasks || [];
          if (tasks[taskIdx]) {
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
            console.log("Mock task reaction updated in memory.");
            renderTopicDetail('tasks', topicId, modalBody.__sourceViewHtml, modalBody.getAttribute('data-topic-source-title'));
          }
        } else if (msgId.startsWith('taskcomment_')) {
          if (msgId.startsWith('taskcomment_subtaskcomment_')) {
            const parts = msgId.split('_');
            const taskIdx = parseInt(parts[2], 10);
            const subtaskIdx = parseInt(parts[3], 10);
            const commentId = parts.slice(4).join('_');

            const tasks = issue.tasks || [];
            if (tasks[taskIdx]) {
              const subtasks = tasks[taskIdx].subtasks || [];
              if (subtasks[subtaskIdx]) {
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
                console.log("Mock subtask comment reaction updated in memory.");
                renderTopicDetail('tasks', topicId, modalBody.__sourceViewHtml, modalBody.getAttribute('data-topic-source-title'));
              }
            }
          } else {
            const parts = msgId.split('_');
            const taskIdx = parseInt(parts[1], 10);
            const commentId = parts.slice(2).join('_');

            const tasks = issue.tasks || [];
            if (tasks[taskIdx]) {
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
              console.log("Mock task comment reaction updated in memory.");
              renderTopicDetail('tasks', topicId, modalBody.__sourceViewHtml, modalBody.getAttribute('data-topic-source-title'));
            }
          }
        }
        return;
      }

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
    let expertiseMousedownOnOverlay = false;
    proposalModalOverlay.onmousedown = function(e) {
      expertiseMousedownOnOverlay = (e.target === proposalModalOverlay);
    };
    proposalModalOverlay.onclick = function(e) {
      if (e.target === proposalModalOverlay && expertiseMousedownOnOverlay) {
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
              Proposed by <b>${opt.author_name}</b> &middot; ${ISROptions.optionDetailsHtml(opt)}
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
        // U1: participants hold each id as text and as a number; list each user once
        const participants = [...new Set((disc.participants || []).map(String))];
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
            <label style="display: block; font-size: 0.88rem; font-weight: 600; margin-bottom: 4px; color: var(--text);">What the issue needs (from the analysis; guidance only)</label>
            <div style="font-size: 0.8rem; color: var(--text-muted); background: var(--surface-soft); border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px;">
              ${ISROptions.issueNeedsHtml(disc.resources_needed)}
            </div>
          </div>
          <div class="proposal-form-group">
            <label for="proposal-budget-input">Cost</label>
            <input type="text" id="proposal-budget-input" maxlength="100" placeholder="e.g. €1,200, or no cost" style="width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text); font-size: 0.9rem;">
          </div>
          <div class="proposal-form-group">
            <label for="proposal-funding-input">Funding source</label>
            <input type="text" id="proposal-funding-input" maxlength="300" placeholder="e.g. building maintenance fund, municipal grant, donations, no money needed" style="width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text); font-size: 0.9rem;">
          </div>
          <div class="proposal-form-group">
            <label for="proposal-resource-input">Resources needed</label>
            <div id="added-resources-container" style="margin-bottom: 6px;"></div>
            <div style="display: flex; gap: 8px;">
              <input type="text" id="proposal-resource-input" maxlength="300" placeholder="e.g. 2 ladders, a meeting hall for 50 people" style="flex: 1; padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--surface); color: var(--text); font-size: 0.85rem;">
              <button type="button" id="add-resource-btn" style="padding: 6px 12px; font-size: 0.85rem; font-weight: 600; border-radius: 6px; background: var(--surface-muted); border: 1px solid var(--border); color: var(--text); cursor: pointer;">Add</button>
            </div>
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
        let tempResources = [];
        const addedResourcesContainer = document.getElementById('added-resources-container');
        const resourceInput = document.getElementById('proposal-resource-input');
        function renderTempResources() {
          addedResourcesContainer.innerHTML = tempResources.length === 0
            ? '<div style="font-size: 0.8rem; color: var(--text-muted); font-style: italic; padding: 4px;">No resources added.</div>'
            : tempResources.map((r, idx) => `
              <div class="added-step-row" data-index="${idx}">
                <span style="font-weight: 500; color: var(--text);">${idx + 1}. ${ISROptions.escapeHtml(r)}</span>
                <button type="button" class="added-resource-delete" data-index="${idx}">Remove</button>
              </div>`).join('');
          addedResourcesContainer.querySelectorAll('.added-resource-delete').forEach(delBtn => {
            delBtn.onclick = function() {
              tempResources.splice(parseInt(this.getAttribute('data-index')), 1);
              renderTempResources();
            };
          });
        }
        renderTempResources();
        document.getElementById('add-resource-btn').onclick = function() {
          const value = resourceInput.value.trim();
          if (!value) return;
          if (tempResources.length >= ISROptions.LIMITS.resources) {
            alert('At most ' + ISROptions.LIMITS.resources + ' resources.');
            return;
          }
          tempResources.push(value);
          resourceInput.value = '';
          renderTempResources();
        };
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
          // A3: cost, funding source and resources are option content; nothing is scored.
          const checked = ISROptions.validateOption({
            title: document.getElementById('proposal-title-input').value,
            cost: document.getElementById('proposal-budget-input').value,
            funding_source: document.getElementById('proposal-funding-input').value,
            resources: tempResources.concat([resourceInput.value])
          });
          if (!checked.ok) {
            alert(checked.errors.join('\n'));
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
            title: checked.option.title,
            budget: checked.option.budget,
            funding_source: checked.option.funding_source,
            resources_needed: checked.option.resources_needed,
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
        
        if (kind === 'chat' || kind === 'voting' || kind === 'tasks') {
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

// U1: top level, so that every view can call it (the voting and task detail listeners
// could not see it inside initRealTimeDashboardSync and threw a ReferenceError).
// When an issue has no stored location it invents one near Basel for display only.
function ensureTopicLocation(disc, topicId) {
  if (!disc) return;
  if (!disc.location) {
    let hash = 0;
    const title = disc.topic || disc.title || topicId || "";
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const offsetLat = ((Math.abs(hash) % 100) - 50) / 10000;
    const offsetLon = ((Math.abs(hash >> 8) % 100) - 50) / 10000;
    
    disc.location = {
      latitude: 47.5583 + offsetLat,
      longitude: 7.6065 + offsetLon
    };
    disc.mu_distance_meters = 100 + (Math.abs(hash) % 150);
    disc.sigma_decay_meters = 50 + (Math.abs(hash >> 4) % 100);
  }
}

function initRealTimeDashboardSync(db, storedUid) {
  let activeIssuesCount = 0;
  let todoCount = 0; // U2: the number of the member's ToDo issues
  let discussionsCount = 0;
  
  const updateSummaryStrip = () => {
    const summaryStrip = document.querySelector('.summary-strip');
    if (summaryStrip) {
      summaryStrip.innerHTML = `
        <button class="summary-link" data-section="chat">Discussions: ${discussionsCount}</button>
        <span class="summary-separator">·</span>
        <button class="summary-link" data-section="voting">Active votes: ${activeIssuesCount}</button>
        <span class="summary-separator">·</span>
        <button class="summary-link" data-section="tasks">To Do: ${todoCount}</button>
      `;
      // Handled via document-level event delegation

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
  const healedTopicIds = new Set();

  // Voting state variables
  let cachedVotingDocs = [];
  let votingSortMode = 'new';
  let cachedTasksDocs = [];
  let tasksSortMode = 'new';

  function formatDateToString(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function formatDeadlineDisplay(endsStr) {
    if (!endsStr || endsStr === "Ongoing") return "Ongoing";
    const shown = formatDateWithSetting(endsStr);
    return Lifecycle.isExpired(endsStr, Lifecycle.todayIn(Lifecycle.TIME_ZONE)) ? shown + " (deadline passed)" : shown;
  }

  function getTopicCategoryChip(title) {
    // Check if title already starts with an emoji
    const emojiRegex = /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    if (emojiRegex.test(title || '')) return '';
    return getTopicCategoryEmoji(title) + ' ';
  }

  function getTopicCategoryEmoji(title) {
    const t = (title || '').toLowerCase();
    if (t.includes('elevator') || t.includes('parking') || t.includes('ladder') || t.includes('flower') || t.includes('fence') || t.includes('door') || t.includes('housing') || t.includes('osbb') || t.includes('charger') || t.includes('ev') || t.includes('room') || t.includes('lobby') || t.includes('chess') || t.includes('club')) {
      return '🏠';
    }
    if (t.includes('dance') || t.includes('choreography') || t.includes('spring') || t.includes('festival') || t.includes('celebration') || t.includes('party') || t.includes('showcase') || t.includes('studio') || t.includes('rent') || t.includes('art') || t.includes('music') || t.includes('social') || t.includes('gathering')) {
      return '💃';
    }
    if (t.includes('school') || t.includes('trip') || t.includes('education') || t.includes('child') || t.includes('kid') || t.includes('program') || t.includes('learning') || t.includes('class') || t.includes('course') || t.includes('camp') || t.includes('after-school')) {
      return '🎒';
    }
    if (t.includes('api') || t.includes('blocker') || t.includes('sprint') || t.includes('ci/cd') || t.includes('github') || t.includes('code') || t.includes('tech') || t.includes('server') || t.includes('migration') || t.includes('web') || t.includes('developer') || t.includes('software') || t.includes('database') || t.includes('app')) {
      return '💻';
    }
    if (t.includes('transport') || t.includes('bus') || t.includes('route') || t.includes('district') || t.includes('budget') || t.includes('renovation') || t.includes('park') || t.includes('bike') || t.includes('avenue') || t.includes('city') || t.includes('street') || t.includes('public') || t.includes('road') || t.includes('lane') || t.includes('authority') || t.includes('tax')) {
      return '🏛️';
    }
    return '🏠';
  }

  function getTopicEmojiPrefix(topic, status, storedUid, isUnread) {
    const title = topic.topic || topic.title || '';
    const category = getTopicCategoryEmoji(title);
    
    const relScores = topic.relevance_scores || {};
    const effectiveUid = (storedUid && String(storedUid).trim()) ? String(storedUid).trim() : (safeGetStorage('userId') || "1");
    const relVal = relScores[effectiveUid] !== undefined
      ? relScores[effectiveUid]
      : (relScores[parseInt(effectiveUid)] !== undefined ? relScores[parseInt(effectiveUid)] : 0);
    const starSymbol = relVal > 0.60 ? '⭐ ' : '';
    
    let statusSymbol = '';
    const s = (status || topic.status || '').toLowerCase();
    const t = title.toLowerCase();
    
    if (s === 'approved' || s === 'completed' || t.includes('fence door renew') || t.includes('bike lane on central avenue')) {
      statusSymbol = '✅';
    } else if (s === 'canceled' || s === 'cancelled' || t.includes('flowers near 3rd entrance')) {
      statusSymbol = '☠️';
    } else if (s === 'discussion' || t.includes('after-school program funding')) {
      statusSymbol = '⬅️';
    } else if (t.includes('elevator maintenance') || t.includes('ladders to 1st entrance') || t.includes('blocker') || t.includes('ci/cd')) {
      statusSymbol = '🔴';
    } else if (t.includes('choreography') || t.includes('public transport route') || t.includes('studio rental') || t.includes('chess club')) {
      statusSymbol = '🟡';
    } else if (isUnread) {
      statusSymbol = '🟢';
    } else {
      if (relVal >= 0.8) {
        statusSymbol = '🔴';
      } else if (relVal >= 0.6) {
        statusSymbol = '🟡';
      } else {
        statusSymbol = '🟢';
      }
    }
    
    return `${category} ${statusSymbol} ${starSymbol}`;
  }


  function getDaysUntil(endsStr) {
    // L1: the real date in Europe/Zurich (was frozen at 2026-06-01). 0 = the deadline is today.
    if (!endsStr || !Lifecycle.isDate(endsStr)) return Infinity;
    return Lifecycle.daysBetween(Lifecycle.todayIn(Lifecycle.TIME_ZONE), endsStr);
  }

  function formatDeadline(endsStr) {
    if (!endsStr) return 'Ongoing';
    if (Lifecycle.isExpired(endsStr, Lifecycle.todayIn(Lifecycle.TIME_ZONE))) return 'Deadline passed';
    return `Ends: ${formatDateWithSetting(endsStr)}`;
  }

  function sortDiscussions(docs, sortMode, uidStr) {
    const effectiveUid = (uidStr && String(uidStr).trim()) ? String(uidStr).trim() : (safeGetStorage('userId') || "1");
    return docs.slice().sort((a, b) => {
      const discA = a.data();
      const discB = b.data();
      
      if (sortMode === 'new') {
        const timeA = new Date(discA.last_message_timestamp || discA.created_at || 0).getTime();
        const timeB = new Date(discB.last_message_timestamp || discB.created_at || 0).getTime();
        return timeB - timeA; // Descending (newest first)
      } else if (sortMode === 'important') {
        const getRel = (d, u) => {
          if (!d.relevance_scores) return 0;
          if (d.relevance_scores[u] !== undefined) return d.relevance_scores[u];
          if (d.relevance_scores[parseInt(u)] !== undefined) return d.relevance_scores[parseInt(u)];
          return 0;
        };
        const relA = getRel(discA, effectiveUid);
        const relB = getRel(discB, effectiveUid);
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
    let isTasks = false;
    if (!doc) {
      doc = cachedVotingDocs.find(d => d.id === topicId);
      isVoting = true;
    }
    if (!doc) {
      doc = cachedTasksDocs.find(d => d.id === topicId);
      isTasks = true;
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
    if (isTasks) {
      let openedTasksIssues = {};
      try {
        openedTasksIssues = JSON.parse(localStorage.getItem('tasks_opened_issues') || '{}');
      } catch (e) {}
      openedTasksIssues[topicId] = true;
      localStorage.setItem('tasks_opened_issues', JSON.stringify(openedTasksIssues));
      if (typeof window.triggerTasksListRender === 'function') {
        window.triggerTasksListRender();
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
    if (typeof window.triggerTasksListRender === 'function') {
      window.triggerTasksListRender();
    }
  };

  const renderChatList = () => {
    let readCounts = {};
    try {
      readCounts = JSON.parse(localStorage.getItem('chat_read_counts') || '{}');
    } catch (e) {}

    const effectiveUid = (storedUid && String(storedUid).trim()) ? String(storedUid).trim() : (safeGetStorage('userId') || "1");

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
      if (unread > 0) {
        totalNewMessages++;
      }
      
      let rel = 0;
      if (disc.relevance_scores) {
        if (disc.relevance_scores[effectiveUid] !== undefined) {
          rel = disc.relevance_scores[effectiveUid];
        } else if (disc.relevance_scores[parseInt(effectiveUid)] !== undefined) {
          rel = disc.relevance_scores[parseInt(effectiveUid)];
        }
      }
      if (rel >= 0.60) {
        totalImportant++;
      }
      
      const days = getDaysUntil(disc.ends);
      if (days <= 7) {
        totalUrgent++;
      }
    });

    const sortedDocs = sortDiscussions(cachedChatDocs, chatSortMode, effectiveUid);
    
    let listHtml = '';
    sortedDocs.forEach(doc => {
      const disc = doc.data();
      const topicId = doc.id;
      
      const total = disc.message_count || 0;
      const read = readCounts[topicId] !== undefined ? readCounts[topicId] : total;
      const unreadCount = Math.max(0, total - read);
      const isUnread = unreadCount > 0;
      
      let relNum = null;
      if (disc.relevance_scores) {
        if (disc.relevance_scores[effectiveUid] !== undefined) {
          relNum = disc.relevance_scores[effectiveUid];
        } else if (disc.relevance_scores[parseInt(effectiveUid)] !== undefined) {
          relNum = disc.relevance_scores[parseInt(effectiveUid)];
        }
      }
      
      let isrNum = null;
      if (disc.isr_scores) {
        if (disc.isr_scores[effectiveUid] !== undefined) {
          isrNum = disc.isr_scores[effectiveUid];
        } else if (disc.isr_scores[parseInt(effectiveUid)] !== undefined) {
          isrNum = disc.isr_scores[parseInt(effectiveUid)];
        }
      }

      // A1: no invented values (was: ISR = 1.5 x relevance; creator 0.85/1.28, participant 0.50/0.75)

      const relevanceVal = relNum !== null
        ? (relNum * 100).toFixed(0) + "%"
        : "N/A";
      const isrVal = isrNum !== null
        ? parseFloat(isrNum).toFixed(2)
        : "N/A";
        
      let dateStr = disc.last_message_timestamp ? formatDateWithSetting(disc.last_message_timestamp) : '';
      let nameIdStr = `${disc.last_message_sender_name || 'System'} (ID: ${disc.last_message_sender_uid || 'system'})`;
      let textStr = disc.last_message_text || '';
      
      // Self-healing check for missing last message metadata (handles empty strings as well)
      if ((!disc.last_message_text || !disc.last_message_timestamp) && !healedTopicIds.has(topicId)) {
        healedTopicIds.add(topicId);
        dateStr = disc.created_at ? formatDateWithSetting(disc.created_at) : '';
        nameIdStr = disc.creator_uid ? `Creator (ID: ${disc.creator_uid})` : 'System (ID: system)';
        textStr = 'Click to open discussion thread...';

        db.collection("discussions").doc(topicId).collection("messages")
          .orderBy("timestamp", "desc").limit(1).get()
          .then(async msgSnapshot => {
            if (!msgSnapshot.empty) {
              const lastMsg = msgSnapshot.docs[0].data();
              let senderName = "System";
              const senderUid = lastMsg.uid || "system";
              if (senderUid !== "system") {
                try {
                  const userDoc = await db.collection("users").doc(senderUid.toString()).get();
                  if (userDoc.exists) {
                    senderName = userDoc.data().displayName || `User ${senderUid}`;
                  } else {
                    senderName = `User ${senderUid}`;
                  }
                } catch (e) {
                  senderName = `User ${senderUid}`;
                }
              }
              db.collection("discussions").doc(topicId).update({
                last_message_text: lastMsg.text || "",
                last_message_sender_uid: senderUid.toString(),
                last_message_sender_name: senderName,
                last_message_timestamp: lastMsg.timestamp || new Date().toISOString()
              }).catch(err => console.error("Error healing discussion document:", err));
            }
          }).catch(err => console.error("Error fetching last message for healing:", err));
      }
      
      const previewColor = isUnread ? 'color: var(--text); font-weight: 500;' : 'color: var(--text-muted);';
      
      ensureTopicLocation(disc, topicId);
      const prefix = getTopicEmojiPrefix(disc, disc.status, storedUid, isUnread);

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
      <button class="${chatSortMode === 'new' ? 'active' : ''}" data-chat-sort="new">new ${totalNewMessages}</button>
      <button class="${chatSortMode === 'important' ? 'active' : ''}" data-chat-sort="important">important ${totalImportant}</button>
      <button class="${chatSortMode === 'urgent' ? 'active' : ''}" data-chat-sort="urgent">urgent ${totalUrgent}</button>
    `;
    
    const sourceTags = document.querySelector('#section-chat .search-filter-tags');
    const modalTags = document.querySelector('#section-modal-overlay .search-filter-tags');
    if (sourceTags) sourceTags.innerHTML = tagsHtml;
    if (modalTags && currentSectionId === 'chat') modalTags.innerHTML = tagsHtml;

    // Update Dashboard chat card previews
    const dashChatCard = document.querySelector('.dash-card[data-section="chat"]');
    if (dashChatCard) {
      let badgesHtml = `
        <span class="dash-badge ${totalNewMessages > 0 ? '' : 'dash-badge-empty'}">new ${totalNewMessages}</span>
        <span class="dash-badge ${totalImportant > 0 ? '' : 'dash-badge-empty'}">important ${totalImportant}</span>
        <span class="dash-badge ${totalUrgent > 0 ? 'dash-badge-urgent' : 'dash-badge-empty'}">urgent ${totalUrgent}</span>
      `;

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
        
        const preview = document.createElement('div');
        preview.className = 'dash-card-preview';
        preview.style.cursor = 'pointer';
        if (disc.status === 'inactive') {
          preview.style.textDecoration = 'line-through';
          preview.style.opacity = '0.65';
        }

        
        const dateStr = disc.last_message_timestamp ? formatDateWithSetting(disc.last_message_timestamp) : '';
        let textStr = disc.last_message_text || '';
        let senderName = disc.last_message_sender_name || 'System';
        
        if (disc.last_message_text === undefined || disc.last_message_text === null) {
          senderName = disc.creator_uid ? `Creator (${disc.creator_uid})` : 'System';
          textStr = 'Click to open discussion thread...';
        }
        
        preview.innerHTML = `
          <div class="topic-line">
            ${getTopicCategoryChip(disc.topic)}
            <span class="topic-name">${disc.topic}</span>
          </div>
          <div class="topic-preview" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            <b>${senderName}:</b> ${escapeHtml(textStr)}
          </div>
        `;
        dashChatCard.appendChild(preview);
        count++;
      });
      const footer = document.createElement('div');
      footer.className = 'dash-card-footer-link';
      footer.textContent = `${Math.max(0, cachedChatDocs.length - 3)} more discussions →`;
      footer.style.cursor = 'pointer';
      footer.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openSectionModal('chat');
      });
      dashChatCard.appendChild(footer);

      // Direct click handler on the card element itself.
      // Preview children call stopPropagation, so this only fires
      // for clicks on the title, badges, or card background.
      if (!dashChatCard.__sectionClickBound) {
        dashChatCard.__sectionClickBound = true;
        dashChatCard.addEventListener('click', function() {
          openSectionModal('chat');
        });
      }
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
        const hasVoted = issue.votes && issue.votes[storedUid] !== undefined;
        if (rel >= 0.60 && !hasVoted) {
          totalImportant++;
        }
        
        const days = getDaysUntil(issue.ends);
        if (days <= 7 && !hasVoted) {
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
          : "N/A";  // A1: no 1.5 x relevance fallback
          
        const dateStr = issue.last_message_timestamp ? formatDateWithSetting(issue.last_message_timestamp) : '';
        const nameIdStr = `${issue.last_message_sender_name || 'System'} (ID: ${issue.last_message_sender_uid || 'system'})`;
        const textStr = issue.last_message_text || '';
        
        const previewColor = isUnread ? 'color: var(--text); font-weight: 500;' : 'color: var(--text-muted);';
        
        ensureTopicLocation(issue, topicId);
        const hasVoted = issue.votes && issue.votes[storedUid] !== undefined;
        const votedCheckmark = hasVoted ? '✅ ' : '';
        const prefix = getTopicEmojiPrefix(issue, issue.status, storedUid, isUnread);
        const inactiveStyle = issue.status === 'inactive' ? 'text-decoration: line-through; opacity: 0.65;' : '';

        listHtml += `
          <button class="topic-item" data-topic-type="voting" data-topic-id="${topicId}" style="${inactiveStyle}">
            <div class="topic-header">
              <div class="topic-name-wrap">
                <span class="topic-name">${votedCheckmark}${prefix}${issue.title}</span>
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
        <button class="${votingSortMode === 'new' ? 'active' : ''}" data-voting-sort="new">new ${totalNewMessages}</button>
        <button class="${votingSortMode === 'important' ? 'active' : ''}" data-voting-sort="important">important ${totalImportant}</button>
        <button class="${votingSortMode === 'urgent' ? 'active' : ''}" data-voting-sort="urgent">urgent ${totalUrgent}</button>
      `;
      
      const sourceTags = document.querySelector('#section-voting .search-filter-tags');
      const modalTags = document.querySelector('#section-modal-overlay .search-filter-tags');
      if (sourceTags) sourceTags.innerHTML = tagsHtml;
      if (modalTags && currentSectionId === 'voting') modalTags.innerHTML = tagsHtml;
    };

    window.triggerVotingListRender = renderVotingList;

    const renderTasksList = () => {
      let openedTasksIssues = {};
      try {
        openedTasksIssues = JSON.parse(localStorage.getItem('tasks_opened_issues') || '{}');
      } catch (e) {}

      let readCounts = {};
      try {
        readCounts = JSON.parse(localStorage.getItem('chat_read_counts') || '{}');
      } catch (e) {}

      // Calculate tag counts
      let tasksNewCount = 0;
      let tasksImportantCount = 0;
      let tasksUrgentCount = 0;

      cachedTasksDocs.forEach(doc => {
        const issue = doc.data();
        const topicId = doc.id;
        const tasks = issue.tasks || [];

        // new: never opened or has unread messages
        const isUnread = !openedTasksIssues[topicId];
        const discDoc = cachedChatDocs.find(d => d.id === topicId);
        const total = discDoc ? (discDoc.data().message_count || 0) : 0;
        const read = readCounts[topicId] !== undefined ? readCounts[topicId] : total;
        const unreadCount = Math.max(0, total - read);
        if (isUnread || unreadCount > 0) {
          tasksNewCount++;
        }

        // important: undone tasks where current user is responsible
        const hasUndoneTaskUserResponsible = tasks.some(t => {
          const tStatus = t.status || 'pending';
          const isUndone = tStatus !== 'done' && tStatus !== 'canceled' && tStatus !== 'cancelled';
          const isUserResp = (t.in_charge_uid || '').toString() === storedUid.toString();
          if (isUndone && isUserResp) return true;
          const subtasks = t.subtasks || [];
          return subtasks.some(st => {
            const stStatus = st.status || 'pending';
            const stUndone = stStatus !== 'done' && stStatus !== 'canceled' && stStatus !== 'cancelled';
            const stUserResp = (st.in_charge_uid || t.in_charge_uid || '').toString() === storedUid.toString();
            return stUndone && stUserResp;
          });
        });
        if (hasUndoneTaskUserResponsible) {
          tasksImportantCount++;
        }

        // urgent: count tasks where user is responsible with deadline in a week or less (days <= 7)
        tasks.forEach(t => {
          const tStatus = t.status || 'pending';
          const isUndone = tStatus !== 'done' && tStatus !== 'canceled' && tStatus !== 'cancelled';
          const isUserResp = (t.in_charge_uid || '').toString() === storedUid.toString();
          const days = t.deadline ? getDaysUntil(t.deadline) : 999;
          if (isUndone && isUserResp && days <= 7) {
            tasksUrgentCount++;
          }
          const subtasks = t.subtasks || [];
          subtasks.forEach(st => {
            const stStatus = st.status || 'pending';
            const stUndone = stStatus !== 'done' && stStatus !== 'canceled' && stStatus !== 'cancelled';
            const stUserResp = (st.in_charge_uid || t.in_charge_uid || '').toString() === storedUid.toString();
            const stDays = st.deadline ? getDaysUntil(st.deadline) : 999;
            if (stUndone && stUserResp && stDays <= 7) {
              tasksUrgentCount++;
            }
          });
        });
      });

      // Sort cachedTasksDocs by tasksSortMode
      const sortedTasks = cachedTasksDocs.slice().sort((a, b) => {
        const issueA = a.data();
        const issueB = b.data();
        
        if (tasksSortMode === 'new') {
          const timeA = new Date(issueA.last_message_timestamp || issueA.created_at || 0).getTime();
          const timeB = new Date(issueB.last_message_timestamp || issueB.created_at || 0).getTime();
          return timeB - timeA;
        } else if (tasksSortMode === 'important') {
          const relA = (issueA.relevance_scores && issueA.relevance_scores[storedUid] !== undefined) ? issueA.relevance_scores[storedUid] : 0;
          const relB = (issueB.relevance_scores && issueB.relevance_scores[storedUid] !== undefined) ? issueB.relevance_scores[storedUid] : 0;
          return relB - relA;
        } else if (tasksSortMode === 'urgent') {
          const daysA = getDaysUntil(issueA.ends);
          const daysB = getDaysUntil(issueB.ends);
          return daysA - daysB;
        }
        return 0;
      });

      let taskHtml = '';
      sortedTasks.forEach(doc => {
        const issue = doc.data();
        const topicId = doc.id;
        ensureTopicLocation(issue, topicId);
        
        const tasks = issue.tasks || [];
        const urgentTask = getMostUrgentTask(tasks);
        
        const prefix = getTopicEmojiPrefix(issue, issue.status, storedUid, false);

        const relevanceVal = (issue.relevance_scores && issue.relevance_scores[storedUid] !== undefined)
          ? (issue.relevance_scores[storedUid] * 100).toFixed(0) + "%"
          : "N/A";
        const isrVal = (issue.isr_scores && issue.isr_scores[storedUid] !== undefined)
          ? issue.isr_scores[storedUid].toFixed(2)
          : "N/A";  // A1: no 1.5 x relevance fallback
          
        const secondRowHtml = urgentTask
          ? `Next: ${urgentTask.step} (Deadline: ${formatTaskDeadline(urgentTask.deadline)})`
          : '✅ All tasks completed';

        const inactiveStyle = issue.status === 'inactive' ? 'text-decoration: line-through; opacity: 0.65;' : '';

        taskHtml += `
          <button class="topic-item" data-topic-type="tasks" data-topic-id="${topicId}" style="${inactiveStyle}">
            <div class="topic-header" style="display: flex; flex-direction: column; align-items: flex-start; gap: 4px; width: 100%;">
              <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 8px;">
                <span class="topic-name" style="font-weight: 700; text-align: left;">${prefix}${issue.title}</span>
                <span class="topic-meta" style="font-size: 0.85rem; font-weight: normal; white-space: nowrap;">Relevance: <b>${relevanceVal}</b> &nbsp;·&nbsp; ISR: <b>${isrVal}</b></span>
              </div>
              <span class="topic-meta" style="font-size: 0.85rem; color: var(--text-soft); font-weight: normal; text-align: left;">
                ${secondRowHtml}
              </span>
            </div>
          </button>
        `;
      });
      updateTopicListContainer('tasks', taskHtml);

      // Update filter tags inside DOM for tasks
      const tagsHtml = `
        <button class="${tasksSortMode === 'new' ? 'active' : ''}" data-tasks-sort="new">new ${tasksNewCount}</button>
        <button class="${tasksSortMode === 'important' ? 'active' : ''}" data-tasks-sort="important">important ${tasksImportantCount}</button>
        <button class="${tasksSortMode === 'urgent' ? 'active' : ''}" data-tasks-sort="urgent">urgent ${tasksUrgentCount}</button>
      `;
      
      const sourceTags = document.querySelector('#section-tasks .search-filter-tags');
      const modalTags = document.querySelector('#section-modal-overlay .search-filter-tags');
      if (sourceTags) sourceTags.innerHTML = tagsHtml;
      if (modalTags && currentSectionId === 'tasks') modalTags.innerHTML = tagsHtml;
    };

    window.triggerTasksListRender = renderTasksList;

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

    document.addEventListener('click', function(e) {
      const target = e.target.closest('[data-tasks-sort]');
      if (target) {
        e.preventDefault();
        tasksSortMode = target.getAttribute('data-tasks-sort');
        renderTasksList();
      }
    });

  // 1. Discussions Sync (Chat)
  db.collection("discussions").orderBy("created_at", "desc").onSnapshot(async snapshot => {
    const relevantIds = await getRelevantDiscussionIds(db, storedUid);
    subscribeMemberIssues(relevantIds); // U2: the Voting and ToDo lists read these issues
    
    const filteredDocs = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const topicId = doc.id;
      
      // L1: an expired chat stays listed ("Deadline passed") until the server's daily deadline run moves it.
      if (data.status === 'inactive') {
        if (data.previous_status !== 'discussion') {
          return;
        }
      } else if (data.status === 'Voting') {
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
  // U2: only the member's issues are read, by document id, at most 30 ids per query (the limit
  // of "in"). The ids are the member's topics as the Chat listener computes them on every change
  // of a discussion, so a topic the member joins or creates is picked up without a reload.
  // (Before U2: the 30 newest issues of the whole collection, then filtered to the member's.)
  const MEMBER_ISSUE_CHUNK = 30;
  const memberIssueDocs = new Map();
  let memberIssueUnsubs = [];
  let memberIssueIdsKey = null;

  function subscribeMemberIssues(relevantIds) {
    const ids = Array.from(relevantIds, String).sort();
    const key = ids.join('|');
    if (key === memberIssueIdsKey) return;
    memberIssueIdsKey = key;
    memberIssueUnsubs.forEach(unsub => unsub());
    memberIssueUnsubs = [];
    const keep = new Set(ids);
    Array.from(memberIssueDocs.keys()).forEach(id => { if (!keep.has(id)) memberIssueDocs.delete(id); });
    if (ids.length === 0) {
      applyMemberIssues();
      return;
    }
    for (let i = 0; i < ids.length; i += MEMBER_ISSUE_CHUNK) {
      const chunk = ids.slice(i, i + MEMBER_ISSUE_CHUNK);
      memberIssueUnsubs.push(db.collection("issues")
        .where(firebase.firestore.FieldPath.documentId(), "in", chunk)
        .onSnapshot(snapshot => {
          snapshot.docChanges().forEach(change => {
            if (change.type === 'removed') memberIssueDocs.delete(change.doc.id);
            else memberIssueDocs.set(change.doc.id, change.doc);
          });
          applyMemberIssues();
        }, err => console.error("Sync issues/tasks failed:", err)));
    }
  }

  // The order of the query before U2 (created_at descending), kept for the dashboard previews and
  // for ties in the list sorts. Firestore orders by type before value: in descending order text
  // comes before Timestamps; equal values by document id, descending.
  const createdAtKey = (v) => {
    if (typeof v === 'string') return [2, v];
    if (v && typeof v.toMillis === 'function') return [1, v.toMillis()];
    return [0, 0]; // no created_at: last (the query before U2 left such issues out)
  };
  const compareCreatedDesc = (a, b) => {
    const ka = createdAtKey(a.data().created_at);
    const kb = createdAtKey(b.data().created_at);
    if (ka[0] !== kb[0]) return kb[0] - ka[0];
    if (ka[1] !== kb[1]) return ka[1] < kb[1] ? 1 : -1;
    return a.id < b.id ? 1 : (a.id > b.id ? -1 : 0);
  };

  function applyMemberIssues() {
    const votingDocs = [];
    const taskDocs = [];
    
    Array.from(memberIssueDocs.values()).sort(compareCreatedDesc).forEach(doc => {
      const data = doc.data();
      if (data.status === 'in_process' || (data.status === 'inactive' && data.previous_status === 'in_process')) {
        votingDocs.push(doc);
      }
      if (data.status === 'tasks' || data.status === 'approved' || (data.status === 'inactive' && (data.previous_status === 'approved' || data.previous_status === 'tasks'))) {
        taskDocs.push(doc);
      }
    });

    const mergedTaskDocs = taskDocs;

    cachedVotingDocs = votingDocs;
    activeIssuesCount = votingDocs.length;
    updateSummaryStrip();
    
    cachedTasksDocs = mergedTaskDocs;
    todoCount = mergedTaskDocs.length;
    updateSummaryStrip();
    
    // Render the voting issues using the aligned card formats and tags
    renderVotingList();
    renderTasksList();
    
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
        const isImportant = relVal >= 0.60;

        if (isImportant && !hasVoted) {
          dashboardImportantNotVotedCount++;
        }

        const days = getDaysUntil(issue.ends);
        const isUrgent = days <= 7;

        if (isUrgent && !hasVoted) {
          dashboardUrgentNotVotedCount++;
        }
      });

      let badgesHtml = `
        <span class="dash-badge ${dashboardNewCount > 0 ? '' : 'dash-badge-empty'}">new ${dashboardNewCount}</span>
        <span class="dash-badge ${dashboardImportantNotVotedCount > 0 ? '' : 'dash-badge-empty'}">important ${dashboardImportantNotVotedCount}</span>
        <span class="dash-badge ${dashboardUrgentNotVotedCount > 0 ? 'dash-badge-urgent' : 'dash-badge-empty'}">urgent ${dashboardUrgentNotVotedCount}</span>
      `;

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
        ensureTopicLocation(issue, topicId);
        
        const preview = document.createElement('div');
        preview.className = 'dash-card-preview';
        preview.style.cursor = 'pointer';
        if (issue.status === 'inactive') {
          preview.style.textDecoration = 'line-through';
          preview.style.opacity = '0.65';
        }

        const hasVoted = issue.votes && issue.votes[storedUid] !== undefined;
        const votedCheckmark = hasVoted ? '✅ ' : '';
        preview.innerHTML = `
          <div class="topic-line">
            <span class="topic-name">${votedCheckmark}${issue.title}</span>
          </div>
          <div class="topic-preview">Status: <b>${issue.status || 'Voting'}</b> · Submitter: <b>${issue.submitter_id}</b></div>
        `;
        dashVotingCard.appendChild(preview);
        count++;
      });
      // Direct click handler on the card element itself.
      if (!dashVotingCard.__sectionClickBound) {
        dashVotingCard.__sectionClickBound = true;
        dashVotingCard.addEventListener('click', function() {
          openSectionModal('voting');
        });
      }
    }

    const dashTasksCard = document.querySelector('.dash-card[data-section="tasks"]');
    if (dashTasksCard) {
      let openedTasksIssues = {};
      try {
        openedTasksIssues = JSON.parse(localStorage.getItem('tasks_opened_issues') || '{}');
      } catch (e) {}

      let readCounts = {};
      try {
        readCounts = JSON.parse(localStorage.getItem('chat_read_counts') || '{}');
      } catch (e) {}

      let tasksNewCount = 0;
      let tasksImportantCount = 0;
      let tasksUrgentCount = 0;

      cachedTasksDocs.forEach(doc => {
        const issue = doc.data();
        const topicId = doc.id;
        const tasks = issue.tasks || [];

        // new: never opened or unread messages
        const isUnread = !openedTasksIssues[topicId];
        const discDoc = cachedChatDocs.find(d => d.id === topicId);
        const total = discDoc ? (discDoc.data().message_count || 0) : 0;
        const read = readCounts[topicId] !== undefined ? readCounts[topicId] : total;
        const unreadCount = Math.max(0, total - read);
        if (isUnread || unreadCount > 0) {
          tasksNewCount++;
        }

        // important: undone tasks where current user is responsible
        const hasUndoneTaskUserResponsible = tasks.some(t => {
          const tStatus = t.status || 'pending';
          const isUndone = tStatus !== 'done' && tStatus !== 'canceled' && tStatus !== 'cancelled';
          const isUserResp = (t.in_charge_uid || '').toString() === storedUid.toString();
          if (isUndone && isUserResp) return true;
          const subtasks = t.subtasks || [];
          return subtasks.some(st => {
            const stStatus = st.status || 'pending';
            const stUndone = stStatus !== 'done' && stStatus !== 'canceled' && stStatus !== 'cancelled';
            const stUserResp = (st.in_charge_uid || t.in_charge_uid || '').toString() === storedUid.toString();
            return stUndone && stUserResp;
          });
        });
        if (hasUndoneTaskUserResponsible) {
          tasksImportantCount++;
        }

        // urgent: count tasks where user is responsible with deadline in a week or less (days <= 7)
        tasks.forEach(t => {
          const tStatus = t.status || 'pending';
          const isUndone = tStatus !== 'done' && tStatus !== 'canceled' && tStatus !== 'cancelled';
          const isUserResp = (t.in_charge_uid || '').toString() === storedUid.toString();
          const days = t.deadline ? getDaysUntil(t.deadline) : 999;
          if (isUndone && isUserResp && days <= 7) {
            tasksUrgentCount++;
          }
          const subtasks = t.subtasks || [];
          subtasks.forEach(st => {
            const stStatus = st.status || 'pending';
            const stUndone = stStatus !== 'done' && stStatus !== 'canceled' && stStatus !== 'cancelled';
            const stUserResp = (st.in_charge_uid || t.in_charge_uid || '').toString() === storedUid.toString();
            const stDays = st.deadline ? getDaysUntil(st.deadline) : 999;
            if (stUndone && stUserResp && stDays <= 7) {
              tasksUrgentCount++;
            }
          });
        });
      });

      let tasksBadgesHtml = `
        <span class="dash-badge ${tasksNewCount > 0 ? '' : 'dash-badge-empty'}">new ${tasksNewCount}</span>
        <span class="dash-badge ${tasksImportantCount > 0 ? '' : 'dash-badge-empty'}">important ${tasksImportantCount}</span>
        <span class="dash-badge ${tasksUrgentCount > 0 ? 'dash-badge-urgent' : 'dash-badge-empty'}">urgent ${tasksUrgentCount}</span>
      `;

      dashTasksCard.innerHTML = `
        <div class="dash-card-topline">
          <div class="dash-card-title">To Do</div>
        </div>
        <div class="dash-card-badges">
          ${tasksBadgesHtml}
        </div>
      `;

      let count = 0;
      cachedTasksDocs.forEach(doc => {
        if (count >= 3) return;
        const issue = doc.data();
        const topicId = doc.id;
        ensureTopicLocation(issue, topicId);
        
        const tasks = issue.tasks || [];
        const urgentTask = getMostUrgentTask(tasks);
        
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

        preview.innerHTML = `
          <div class="topic-line">
            ${getTopicCategoryChip(issue.title)}
            <span class="topic-name">${issue.title}</span>
          </div>
          <div class="topic-preview" style="font-size: 0.85rem; color: var(--text-soft); padding-top: 2px;">
            ${secondRowHtml}
          </div>
        `;
        dashTasksCard.appendChild(preview);
        count++;
      });
      // Direct click handler on the card element itself.
      if (!dashTasksCard.__sectionClickBound) {
        dashTasksCard.__sectionClickBound = true;
        dashTasksCard.addEventListener('click', function() {
          openSectionModal('tasks');
        });
      }
    }
  }
}

function initMainPage() {
  const tooltipsEnabled = localStorage.getItem('tooltipsEnabled') !== 'false';
  if (!tooltipsEnabled) {
    document.body.classList.add('tooltips-disabled');
  } else {
    document.body.classList.remove('tooltips-disabled');
  }

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
  if (typeof firebase !== 'undefined') {
    const db = firebase.firestore();
    
    // Start real-time synchronization of dashboard and tab content
    initRealTimeDashboardSync(db, storedUid || "1");

    if (!isGuest) {
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
      text: "This Index of Social Responsibility prototype helps groups align decisions with shared ad-hoc public values. Let's take a quick 1-minute tour of how it works!",
      target: null
    },
    {
      title: "AI Guidance",
      text: "Here, your personalized AI assistant suggests issues that match your background and profile, guiding your attention to where you are most relevant.",
      target: ".ai-guidance-card"
    },
    {
      title: "Governance Readiness",
      text: "This card tracks your profile completeness and helps you express your worldview through the ad-hoc public values vector.",
      target: ".governance-readiness-card"
    },
    {
      title: "Interactive Dashboard",
      text: "The heart of the app: debate issues in the <b>Chat</b>, view active <b>Voting</b>, and track execution steps in the <b>To Do</b> list.",
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

          tourBubble.style.position = 'fixed';
          if (step.target === "#menu-button") {
            tourBubble.style.top = (rect.bottom + 12) + 'px';
            tourBubble.style.left = (rect.right - bubbleWidth) + 'px';
            tourBubble.style.transform = 'none';
          } else {
            // Place below the element, centered horizontally relative to target
            tourBubble.style.top = (rect.bottom + 12) + 'px';
            tourBubble.style.left = (rect.left + (rect.width - bubbleWidth)/2) + 'px';
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
    document.removeEventListener('keydown', handleKeyDown);
    removeHighlights();
    tourOverlay.hidden = true;
    safeSetStorage('tourCompleted', 'true');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextBtn.click();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevBtn.click();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      endTour();
    }
  };

  document.addEventListener('keydown', handleKeyDown);

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

// Setup global premium tooltips popup
(function() {
  function initGlobalTooltip() {
    try {
      if (!document.body) return;

      let tooltipsEnabled = true;
      try {
        tooltipsEnabled = localStorage.getItem('tooltipsEnabled') !== 'false';
      } catch (storageErr) {
        console.warn("Storage access failed, defaulting tooltips to true:", storageErr);
      }

      if (!tooltipsEnabled) {
        document.body.classList.add('tooltips-disabled');
      } else {
        document.body.classList.remove('tooltips-disabled');
      }

      let globalTooltip = document.getElementById('global-custom-tooltip');
      if (!globalTooltip) {
        globalTooltip = document.createElement('div');
        globalTooltip.id = 'global-custom-tooltip';
        globalTooltip.className = 'global-tooltip-popup';
        document.body.appendChild(globalTooltip);
      }

      let activeTooltipTarget = null;

      document.body.addEventListener('mouseover', (e) => {
        try {
          const target = e.target.closest('.custom-tooltip');
          if (!target) {
            if (activeTooltipTarget) {
              globalTooltip.classList.remove('visible');
              activeTooltipTarget = null;
            }
            return;
          }
          
          if (target === activeTooltipTarget) return;
          if (document.body.classList.contains('tooltips-disabled')) return;
          
          const text = target.getAttribute('data-tooltip');
          if (!text) return;
          
          activeTooltipTarget = target;
          globalTooltip.textContent = text;
          globalTooltip.classList.add('visible');
          
          const rect = target.getBoundingClientRect();
          const tooltipWidth = globalTooltip.offsetWidth || 240;
          const tooltipHeight = globalTooltip.offsetHeight || 60;
          
          let left = rect.left + window.scrollX + (rect.width - tooltipWidth) / 2;
          let top = rect.top + window.scrollY - tooltipHeight - 8;
          
          if (top < window.scrollY + 8) {
            top = rect.bottom + window.scrollY + 8;
          }
          
          left = Math.max(8, Math.min(window.innerWidth - tooltipWidth - 8, left));
          
          globalTooltip.style.left = `${left}px`;
          globalTooltip.style.top = `${top}px`;
        } catch (err) {
          console.error("Tooltip mouseover error:", err);
        }
      });

      document.body.addEventListener('mouseout', (e) => {
        try {
          if (!activeTooltipTarget) return;
          if (!e.relatedTarget || !e.relatedTarget.closest || e.relatedTarget.closest('.custom-tooltip') !== activeTooltipTarget) {
            globalTooltip.classList.remove('visible');
            activeTooltipTarget = null;
          }
        } catch (err) {
          console.error("Tooltip mouseout error:", err);
        }
      });
    } catch (e) {
      console.error("Failed to initialize global tooltips:", e);
    }
  }

  if (document.body) {
    initGlobalTooltip();
  } else {
    document.addEventListener('DOMContentLoaded', initGlobalTooltip);
  }
})();

function initApp() {
  if (document.getElementById('menu-button') && document.getElementById('menu')) {
    initMainPage();
  }
  if (document.getElementById('login-username') || document.getElementById('search-profiles-btn')) {
    initLoginPage();
  }
}

async function renderUserActionsList(containerEl) {
  const listContainer = containerEl.querySelector('#actions-list-container');
  if (!listContainer) return;

  const currentUserId = safeGetStorage('userId');
  if (!currentUserId) {
    listContainer.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-muted);">Please log in to view your actions.</div>';
    return;
  }

  listContainer.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-muted);">Loading actions...</div>';

  try {
    const db = firebase.firestore();
    const docSnap = await db.collection('actions').doc(currentUserId).get();

    if (!docSnap.exists) {
      listContainer.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-muted);">No actions recorded yet.</div>';
      return;
    }

    const data = docSnap.data();
    const actions = data.records || [];

    if (actions.length === 0) {
      listContainer.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-muted);">No actions recorded yet.</div>';
      return;
    }

    // Sort by created_at descending
    actions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    listContainer.innerHTML = '<div class="topic-list"></div>';
    const grid = listContainer.querySelector('.topic-list');

    actions.forEach(action => {
      // Calculate force
      const type_weight = parseFloat(action.type_weight) || 0;
      const time_hours = parseFloat(action.time_hours) || 0;
      const complexity = parseFloat(action.complexity) || 0;
      const result_factor = parseFloat(action.result_factor) || 0;
      const force = type_weight * time_hours * complexity * result_factor;

      // Type Badge styling
      let typeClass = 'badge-default';
      if (action.action_type === 'vote') typeClass = 'badge-vote';
      if (action.action_type === 'task') typeClass = 'badge-task';
      if (action.action_type === 'vote_msg' || action.action_type === 'task_msg' || action.action_type === 'chat_msg') typeClass = 'badge-msg';

      const d = new Date(action.created_at);
      const dateStr = formatDateWithSetting(d);

      // Sentiment formatting
      const sentiment = parseFloat(action.sentiment_scalar) || 0;
      const sentColor = sentiment > 0 ? '#38a169' : (sentiment < 0 ? '#e53e3e' : '#718096');
      const sentSign = sentiment > 0 ? '+' : '';

      const card = document.createElement('button');
      card.className = 'topic-item';
      card.setAttribute('type', 'button');
      card.innerHTML = `
        <div class="topic-header">
          <span class="topic-name">${action.action_name}</span>
          <span class="topic-meta">
            <span class="action-badge ${typeClass}">${action.action_type}</span>
            <span class="action-date" style="margin-left: 8px;">${dateStr}</span>
          </span>
        </div>
        <div class="topic-preview">
          📍 ${action.issue_name} &nbsp;·&nbsp; Force: <b>${force.toFixed(2)}</b> &nbsp;·&nbsp; Sentiment: <b style="color: ${sentColor}">${sentSign}${sentiment.toFixed(1)}</b>
        </div>
      `;
      card.onclick = () => openActionDetailModal(action);
      grid.appendChild(card);
    });
  } catch (err) {
    console.error("Error fetching actions:", err);
    listContainer.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--urgent);">Error loading actions: ${err.message}</div>`;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

async function openActionDetailModal(action) {
  // Header and Subtitle
  const d = new Date(action.created_at);
  const dateStr = formatDateWithSetting(d) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const subtitleStr = dateStr + ' • ' + action.issue_name;

  // Force Calculation
  const w = parseFloat(action.type_weight) || 0;
  const t = parseFloat(action.time_hours) || 0;
  const c = parseFloat(action.complexity) || 0;
  const r = parseFloat(action.result_factor) || 0;
  const force = w * t * c * r;

  let extraHtml = `
    <div style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 24px; text-align: center;">
      ${subtitleStr}
    </div>
    <div class="action-detail-section" style="margin-bottom: 24px; display: flex; gap: 32px; flex-wrap: wrap;">
      <div style="flex: 1; min-width: 250px;">
        <div class="action-detail-section-title" style="font-size: 1.1rem; font-weight: 600; margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">Force Components</div>
        <table class="force-breakdown-table" style="width: 100%; text-align: left; border-collapse: collapse;">
          <tr><th style="padding: 8px 0; border-bottom: 1px solid var(--surface-2); color: var(--text-muted); font-weight: 500;">Type Weight</th><td style="padding: 8px 0; border-bottom: 1px solid var(--surface-2); text-align: right; font-weight: 500;">${w.toFixed(2)}</td></tr>
          <tr><th style="padding: 8px 0; border-bottom: 1px solid var(--surface-2); color: var(--text-muted); font-weight: 500;">Time (Hours)</th><td style="padding: 8px 0; border-bottom: 1px solid var(--surface-2); text-align: right; font-weight: 500;">${t.toFixed(2)}</td></tr>
          <tr><th style="padding: 8px 0; border-bottom: 1px solid var(--surface-2); color: var(--text-muted); font-weight: 500;">Complexity</th><td style="padding: 8px 0; border-bottom: 1px solid var(--surface-2); text-align: right; font-weight: 500;">${c.toFixed(2)}</td></tr>
          <tr><th style="padding: 8px 0; border-bottom: 1px solid var(--border-color); color: var(--text-muted); font-weight: 500;">Result Factor</th><td style="padding: 8px 0; border-bottom: 1px solid var(--border-color); text-align: right; font-weight: 500;">${r.toFixed(2)}</td></tr>
          <tr class="total-row"><th style="padding: 12px 0; font-size: 1.1rem;">Total Force</th><td style="padding: 12px 0; text-align: right; font-size: 1.1rem; font-weight: 700; color: var(--primary);">${force.toFixed(2)}</td></tr>
        </table>
      </div>
  `;

  // Sentiment and Reactions
  const sentiment = parseFloat(action.sentiment_scalar) || 0;
  const sentColor = sentiment > 0 ? '#38a169' : (sentiment < 0 ? '#e53e3e' : '#718096');
  const sentSign = sentiment > 0 ? '+' : '';

  extraHtml += `
      <div style="flex: 1; min-width: 250px;">
        <div class="action-detail-section-title" style="font-size: 1.1rem; font-weight: 600; margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">Reactions & Sentiment</div>
        <div class="reactions-list" id="action-dynamic-reactions-list" style="margin-bottom: 16px;">
          <div style="color:var(--text-muted); font-size:0.85rem;">Loading reactions...</div>
        </div>
        <div style="margin-top: 16px; padding: 16px; background: var(--surface-2); border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600; font-size: 1rem;">Total Sentiment</span>
          <span style="font-weight: 700; font-size: 1.3rem; color: ${sentColor};">${sentSign}${sentiment.toFixed(2)}</span>
        </div>
      </div>
    </div>
  `;

  // Open the unified modal immediately with "Loading reactions..."
  window.SharedVectorRenderer.render(action.vector_data, action.action_name, extraHtml);

  // Now async fetch the reactions and replace the "Loading" placeholder
  const listEl = document.getElementById('action-dynamic-reactions-list');
  if (listEl) {
    if (action.marks && action.marks.length > 0) {
      const db = typeof firebase !== 'undefined' ? firebase.firestore() : null;
      window.userCache = window.userCache || {};
      
      // Pre-fetch names
      if (db) {
        const uidsToFetch = action.marks.map(m => m.uid).filter(uid => !window.userCache[uid]);
        await Promise.all(uidsToFetch.map(async uid => {
          try {
            const doc = await db.collection("users").doc(uid.toString()).get();
            if (doc.exists) window.userCache[uid] = doc.data().displayName || ('User ' + uid);
            else window.userCache[uid] = 'User ' + uid;
          } catch(e) {
            window.userCache[uid] = 'User ' + uid;
          }
        }));
      }

      let reactionsHtml = '';
      action.marks.forEach(m => {
        const name = window.userCache[m.uid] || ('User ' + m.uid);
        const val = parseFloat(m.mark) || 0;
        const color = val > 0 ? '#38a169' : (val < 0 ? '#e53e3e' : 'var(--text-base)');
        const sign = val > 0 ? '+' : '';
        reactionsHtml += `
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--surface-2);">
            <div style="font-weight: 500;">${name}</div>
            <div style="font-weight: 600; color: ${color};">${sign}${val}</div>
          </div>
        `;
      });
      listEl.innerHTML = reactionsHtml;
    } else {
      listEl.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem; padding: 12px 0;">No reactions recorded.</div>';
    }
  }
}

window.SharedVectorRenderer = {
  domainNames: [
    'Agency & Freedom', 'Relationality & Care', 'Security & Stable Order', 
    'Justice & Fairness', 'Redemption & Restoration', 'Authentic Expression', 
    'Protective Care & Stewardship', 'Cooperation & Shared Governance', 
    'Spiritual & Religious Practice', 'Digital Rights & Tech Democracy'
  ],

  conflictNames: [
    'Individual Freedom vs. Collective Harmony', 'Truth-Telling vs. Kindness', 'Proportional Justice vs. Restoration',
    'Equal Distribution vs. Merit-Based', 'Kin/Close vs. Universal Responsibility', 'Stability vs. Change',
    'Tradition vs. Innovation', 'Self-Interest vs. Collective Welfare', 'Individual Responsibility vs. Systemic Causation',
    'Self-Sacrifice vs. Self-Preservation', 'Competition vs. Cooperation', 'In-Group Loyalty vs. Impartial Justice',
    'Question Authority vs. Accept Authority', 'Certainty vs. Possibility', 'Principle vs. Pragmatism',
    'Present vs. Future Security', 'Universal Standards vs. Cultural Relativism', 'Individual Rights vs. Collective Duty',
    'Efficiency vs. Human Care', 'Freedom vs. Structure', 'Inner Truth vs. Social Belonging',
    'Environmental Sustainability vs. Economic Prosperity', 'Cultural Preservation vs. Modernization',
    'Protective Authority vs. Respecting Autonomy', 'Accountability vs. Compassion', 'Emotional Openness vs. Self-Protection',
    'Digital Privacy vs. Convenience', 'Human Labor vs. Automation', 'Tech Innovation vs. Democratic Control',
    'Digital Privacy vs. Safety', 'Digital Inclusion vs. Environmental Cost', 'Spiritual Authority vs. Democratic Governance',
    'Digital Privacy vs. Social Connection', 'Digital vs. Embodied Experience', 'Digital Privacy vs. Collective Transparency',
    'Justice-Based vs. Cooperative Distribution'
  ],

  render: function(data, titleText, extraHtml = '') {
    const modal = document.getElementById('values-vector-modal');
    if (!modal) return;
    
    // Set Title
    const titleEl = document.getElementById('values-vector-title');
    if (titleEl && titleText) {
      titleEl.textContent = titleText;
    }

    // Set Extra Content
    const extraContent = document.getElementById('vector-modal-extra-content');
    if (extraContent) {
      extraContent.innerHTML = extraHtml;
    }

    // Determine format and negative values
    const isActionFormat = data && Array.isArray(data.domains) && typeof data.domains[0] === 'number';
    let hasNegatives = false;
    
    if (isActionFormat) {
      hasNegatives = data.domains.some(v => v < 0);
      if (!hasNegatives && data.contextual_shifts) {
        hasNegatives = Object.values(data.contextual_shifts).some(v => v < 0);
      }
      if (!hasNegatives && data.conflict_resolution) {
        hasNegatives = data.conflict_resolution.some(v => v < 0);
      }
    }

    this.renderDomainsChart(data, isActionFormat, hasNegatives);
    this.renderContextShiftsGrid(data, isActionFormat, hasNegatives);
    this.renderAccordion(data, isActionFormat);
    this.renderConflictWeights(data, isActionFormat, hasNegatives);

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  },

  renderDomainsChart: function(data, isActionFormat, hasNegatives) {
    const chart = document.getElementById('vector-domains-chart');
    if (!chart || !data || !data.domains) return;
    chart.innerHTML = '';
    
    if (isActionFormat) {
      chart.classList.add('action-format');
    } else {
      chart.classList.remove('action-format');
    }
    
    for (let i = 0; i < 10; i++) {
      let val = 0;
      let labelName = this.domainNames[i];
      let isNull = false;
      let isMuted = false;

      if (isActionFormat) {
        val = data.domains[i] !== undefined ? data.domains[i] : 0;
      } else {
        const dObj = data.domains[i];
        if (dObj) {
          val = dObj.score !== undefined && dObj.score !== null ? dObj.score : 0;
          isNull = dObj.score === null || dObj.score === undefined;
          isMuted = dObj.muted;
          labelName = dObj.name || labelName;
        } else {
          isNull = true;
        }
      }

      const group = document.createElement('div');
      group.className = 'bar-group custom-tooltip';
      
      const signStr = (isActionFormat && val > 0) ? '+' : '';
      group.setAttribute('data-tooltip', `${i + 1}. ${labelName} [${isNull ? 'N/A' : signStr + val}]`);

      const track = document.createElement('div');
      track.className = 'bar-track';

      const bar = document.createElement('div');
      bar.className = 'bar' + (isNull ? ' bar-null' : (isMuted ? ' bar-muted' : ''));

      if (isActionFormat) {
        const absVal = Math.abs(val);
        const heightPct = absVal * 0.5;
        bar.style.height = heightPct + '%';
        
        if (val >= 0) {
          bar.classList.add('positive');
          bar.style.bottom = '50%';
          bar.style.background = '#10b981';
          bar.style.borderRadius = '2px 2px 0 0';
        } else {
          bar.classList.add('negative');
          bar.style.top = '50%';
          bar.style.background = '#ef4444';
          bar.style.borderRadius = '0 0 2px 2px';
        }
      } else {
        const heightVal = isNull ? 100 : Math.abs(val);
        bar.style.height = heightVal + '%';

        if (!isNull && val < 0) {
          bar.style.background = 'var(--urgent)';
          bar.style.borderTopLeftRadius = '0';
          bar.style.borderTopRightRadius = '0';
          bar.style.borderBottomLeftRadius = '4px';
          bar.style.borderBottomRightRadius = '4px';
          bar.style.position = 'relative';
          bar.style.top = '100%';
          bar.style.marginBottom = '-' + heightVal + '%';
        }
      }

      const label = document.createElement('span');
      label.className = 'bar-label';
      label.textContent = (i + 1).toString();
      label.title = labelName + (isNull ? ' (N/A)' : ' (' + (val > 0 && isActionFormat ? '+' : '') + val + ')');
      if (isNull) label.style.color = '#888888';

      track.appendChild(bar);
      group.appendChild(track);
      group.appendChild(label);
      chart.appendChild(group);
    }
  },

  renderContextShiftsGrid: function(data, isActionFormat, hasNegatives) {
    const grid = document.getElementById('context-shifts-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const shiftsObj = data.contextual_shifts || data.contextShifts;
    if (!shiftsObj) return;

    const labels = [
      { key: 'work', short: 'W' },
      { key: 'family', short: 'F' },
      { key: 'private', short: 'P' },
      { key: 'crisis', short: 'C' }
    ];

    labels.forEach(row => {
      const wrap = document.createElement('div');
      wrap.className = 'shift-row';
      const left = document.createElement('div');
      left.className = 'shift-label';
      left.textContent = row.short;
      
      const trackWrap = document.createElement('div');
      let valOrArr = shiftsObj[row.key];
      
      // Force to 10-item array to always show the dot grid (Screen 4)
      if (!Array.isArray(valOrArr)) {
        valOrArr = [valOrArr !== undefined ? valOrArr : 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      }
      
      trackWrap.className = 'shift-track-grid';
      valOrArr.forEach((value, idx) => {
        const cell = document.createElement('div');
        cell.className = 'shift-cell-v2 custom-tooltip';
        
        const sign = value > 0 ? '+' : '';
        if (isActionFormat) {
          cell.setAttribute('data-tooltip', `In ${row.key} ${sign}${value}`);
        } else {
          const domainName = this.domainNames[idx] || `Domain ${idx + 1}`;
          cell.setAttribute('data-tooltip', `${idx + 1}. ${domainName} in ${row.key} ${sign}${value}`);
        }

        if (value !== 0) {
          const bar = document.createElement('div');
          bar.className = 'shift-bar-v2 ' + (value > 0 ? 'positive' : 'negative');
          
          // Height is calculated proportional to absolute value (assuming max of 20)
          // Since it's centered, max height of half container is 50%
          const pct = Math.min(50, Math.abs(value) * 2.5);
          bar.style.height = pct + '%';
          
          cell.appendChild(bar);
        }
        trackWrap.appendChild(cell);
      });
      
      wrap.appendChild(left);
      wrap.appendChild(trackWrap);
      grid.appendChild(wrap);
    });
  },

  renderAccordion: function(data, isActionFormat) {
    const acc = document.getElementById('vector-domains-accordion');
    if (!acc || !window.globalTaxonomyDomains) return;
    acc.innerHTML = '';

    // Build items lookup
    let itemValues = {};
    if (isActionFormat && data.items) {
      let itemIndex = 0;
      window.globalTaxonomyDomains.forEach(domain => {
        domain.facets.forEach(facet => {
          facet.clusters.forEach(cluster => {
            cluster.items.forEach(itemObj => {
              if (itemIndex < data.items.length) {
                itemValues[itemObj.id] = data.items[itemIndex];
                itemIndex++;
              }
            });
          });
        });
      });
    } else {
      itemValues = data.items || {};
    }

    // Original Profile Accordion logic was slightly different, let's restore it mostly.
    window.globalTaxonomyDomains.forEach((domain, index) => {
      const item = document.createElement('div');
      item.className = 'vector-accordion-item';

      let realDomainScore = null;
      let dval = 0;
      let isNull = false;
      let dcolor = 'var(--primary)';
      
      if (isActionFormat) {
        dval = data.domains[index] !== undefined ? data.domains[index] : 0;
        realDomainScore = dval;
        if (dval < 0) dcolor = 'var(--urgent)';
      } else {
        const dObj = data.domains && data.domains.find(d => d.id == domain.id);
        if (dObj && dObj.score !== undefined && dObj.score !== null) {
          realDomainScore = dObj.score;
        } else {
          realDomainScore = domain.value !== undefined ? domain.value : null;
          if (realDomainScore === null) isNull = true;
        }
        dval = isNull ? 'N/A' : realDomainScore;
      }
      
      const dsign = (!isNull && dval > 0 && isActionFormat) ? '+' : '';

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'vector-accordion-trigger';
      button.innerHTML = domain.id + '. ' + domain.name + ' <span style="color:'+dcolor+'">[' + dsign + dval + ']</span>';

      const content = document.createElement('div');
      content.className = 'vector-accordion-content';
      content.hidden = true;

      const definition = document.createElement('p');
      definition.className = 'vector-domain-definition';
      definition.textContent = domain.definition;

      const focus = document.createElement('p');
      focus.className = 'vector-domain-definition';
      focus.innerHTML = '<strong>Action focus:</strong> ' + domain.actionFocus;

      content.appendChild(definition);
      content.appendChild(focus);

      const domainKey = 'd' + domain.id;
      const userItemsArray = (!isActionFormat && data.items) ? data.items[domainKey] : null;
      let itemIndex = 0;

      domain.facets.forEach(facet => {
        const facetEl = document.createElement('div');
        facetEl.className = 'vector-facet';

        const facetTitle = document.createElement('div');
        facetTitle.className = 'vector-facet-title';
        facetTitle.textContent = facet.id + ' ' + facet.name;

        facetEl.appendChild(facetTitle);

        facet.clusters.forEach(cluster => {
          const clusterEl = document.createElement('div');
          clusterEl.className = 'vector-cluster';

          const clusterTitle = document.createElement('div');
          clusterTitle.className = 'vector-cluster-title';
          clusterTitle.textContent = cluster.id + ' ' + cluster.name;

          const list = document.createElement('ul');
          list.className = 'vector-domain-items';

          cluster.items.forEach(entry => {
            let realItemValue = null;
            let val = 0;
            if (isActionFormat) {
              val = itemValues[entry.id] !== undefined ? itemValues[entry.id] : 0;
              realItemValue = val;
            } else {
              if (userItemsArray && userItemsArray[itemIndex] !== undefined) {
                realItemValue = userItemsArray[itemIndex];
              } else {
                realItemValue = entry.value !== undefined ? entry.value : null;
              }
              val = realItemValue === null ? 'N/A' : realItemValue;
            }
            itemIndex++;

            let color = 'var(--text-base)';
            let sign = '';
            let fontWeight = '400';
            
            if (val === 'N/A') {
              color = 'var(--text-muted)';
            } else if (isActionFormat) {
              if (val < 0) { color = 'var(--urgent)'; fontWeight = '600'; }
              if (val > 0) { color = 'var(--primary)'; sign = '+'; fontWeight = '600'; }
              if (val === 0) color = 'var(--text-muted)';
            } else {
              fontWeight = '600';
            }

            const li = document.createElement('li');
            li.innerHTML = '<span class="vector-item-id">' + entry.id + '</span> ' +
                          entry.text +
                          ' <span class="vector-item-value" style="color:'+color+'; font-weight:'+fontWeight+'">[' + sign + val + ']</span>';
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
      acc.appendChild(item);
    });
  },

  renderConflictWeights: function(data, isActionFormat) {
    const cw = document.getElementById('vector-conflict-weights');
    if (!cw) return;
    cw.innerHTML = '';
    
    const crArray = data.conflict_resolution || data.conflictResolution;
    if (!crArray) return;

    for (let i = 0; i < crArray.length; i++) {
      let val = 0;
      let name = '';
      
      if (isActionFormat) {
        val = crArray[i] !== undefined ? crArray[i] : 0;
        name = this.conflictNames[i] || `Conflict ${i+1}`;
        if (val === 0) continue; // Skip neutral impacts for Action Vectors
      } else {
        const item = crArray[i];
        if (!item || item.weight === 50) continue; // Skip neutral for Profile Vectors
        val = item.weight;
        name = item.name;
      }
      
      const row = document.createElement('div');
      row.className = 'vector-weight-row';

      // Profile Vector style: Standard 0-100% fill bar, left aligned
      row.innerHTML =
        '<div class="vector-weight-name">' + name + '</div>' +
        '<div class="vector-weight-bar"><div class="vector-weight-fill" style="width:' + Math.max(0, val) + '%"></div></div>' +
        '<div class="vector-weight-value">' + val + '</div>';

      cw.appendChild(row);
    }
  }
};

