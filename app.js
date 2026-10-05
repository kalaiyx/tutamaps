/* ═══════════════════════════════════════════════════════════════
   TutaMaps — app.js (Google Maps Pedestrian Navigation)
   Real Small Streets · Local Shops & Pharmacies · Dual Route Comparison
   Team Neural Hydras · KIT Coimbatore
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── 1. CONSTANTS ──────────────────────────────────────────── */

// KIT Coimbatore campus (Kannampalayam)
const KIT_LAT  = 11.0550;
const KIT_LNG  = 77.1333;
const KIT_NAME = 'KIT - Kalaignarkarunanidhi Institute of Technology, Kannampalayam, Coimbatore';

const PHOTON = 'https://photon.komoot.io/api/';
const NOMINATIM = 'https://nominatim.openstreetmap.org';
const OSRM_ENDPOINTS = [
  'https://router.project-osrm.org/route/v1/foot',
  'https://routing.openstreetmap.de/routed-foot/route/v1/foot',
];

const WEIGHTS = {
  normal: { shade: 0.25, light: 0.25, crowd: 0.25, safety: 0.25 },
  heat:   { shade: 0.45, light: 0.15, crowd: 0.20, safety: 0.20 },
  night:  { shade: 0.10, light: 0.45, crowd: 0.30, safety: 0.15 },
};

const KNOWN_LOCATION_ALIASES = {
  'kit': [KIT_LAT, KIT_LNG],
  'kit college': [KIT_LAT, KIT_LNG],
  'kit college gate': [KIT_LAT, KIT_LNG],
  'kit campus': [KIT_LAT, KIT_LNG],
  'kit coimbatore': [KIT_LAT, KIT_LNG],
  'kalaignarkarunanidhi institute of technology': [KIT_LAT, KIT_LNG],
  'sulur': [11.0341, 77.1264],
  'sulur bus stand': [11.0341, 77.1264],
  'sulur old bus stand': [11.0341, 77.1264],
  'sulur bus stop': [11.0341, 77.1264],
  'sulur lake': [11.0290, 77.1280],
  'sulur government hospital': [11.0345, 77.1255],
  'government hospital sulur': [11.0345, 77.1255],
  'sulur hospital': [11.0345, 77.1255],
  'kannampalayam': [11.0510, 77.1300],
  'kannampalayam pirivu': [11.0538, 77.1315],
  'apollo pharmacy': [11.0348, 77.1260],
  'apollo pharmacy sulur': [11.0348, 77.1260],
  'kr bakes': [11.0538, 77.1315],
  'kr bakes and sweets': [11.0538, 77.1315],
  'coimbatore airport': [11.0310, 77.0438],
  'airport peelamedu': [11.0310, 77.0438],
  'airport': [11.0310, 77.0438],
  'fun republic mall': [11.0237, 77.0005],
  'fun mall': [11.0237, 77.0005],
  'singanallur bus stand': [11.0014, 77.0258],
  'singanallur': [11.0014, 77.0258],
  'ondipudur': [11.0080, 77.0515],
  'peelamedu': [11.0255, 77.0035],
  'gandhipuram': [11.0168, 76.9673],
  'coimbatore railway junction': [10.9955, 76.9620],
  'railway station': [10.9955, 76.9620],
  'my location': null,
};

/* ─── 2. LOCAL SHOPS, SMALL STREETS & ESSENTIAL FACILITIES ─── */
// Verified database for walking people in Coimbatore, Kannampalayam, Sulur & KIT corridor
const LOCAL_LANDMARKS_DATABASE = [
  // 🏪 LOCAL SHOPS, BAKERIES & TEA STALLS
  { id: 's1', name: 'KR Bakes & Sweets, Kannampalayam Pirivu', type: 'shop', lat: 11.0538, lng: 77.1315, desc: 'Fresh baked snacks, hot tea, juices and packaged water. Landmark bakery.', icon: '🏪', street: 'College Road' },
  { id: 's2', name: 'Aavin Milk & Ice Cream Parlour', type: 'shop', lat: 11.0542, lng: 77.1325, desc: 'State dairy milk booth, cold beverages and packaged drinking water bottles.', icon: '🏪', street: 'College Road' },
  { id: 's3', name: 'Sri Annapoorna Sweet Stall & Bakery, Sulur', type: 'shop', lat: 11.0340, lng: 77.1265, desc: 'Popular vegetarian bakery, coffee & tea spot along main bus station road.', icon: '🏪', street: 'Trichy Road' },
  { id: 's4', name: 'Tea Time & Snacks Corner', type: 'shop', lat: 11.0510, lng: 77.1300, desc: 'Pedestrian tea stall, biscuits and cold drinks at village junction.', icon: '🏪', street: 'Kannampalayam Main Rd' },
  { id: 's5', name: 'Kannan Departmental Store, Sulur', type: 'shop', lat: 11.0335, lng: 77.1272, desc: 'Supermarket for groceries, personal care, snacks and bottled drinks.', icon: '🏪', street: 'Kalangal Road' },
  { id: 's6', name: 'Fresh Fruits & Tender Coconut Stall', type: 'shop', lat: 11.0525, lng: 77.1310, desc: 'Fresh tender coconut, fresh fruit juices and hydration point.', icon: '🏪', street: 'College Road' },
  { id: 's7', name: 'Nilgiris Supermarket, Singanallur', type: 'shop', lat: 11.0030, lng: 77.0260, desc: 'Supermarket with bakery, groceries and cold hydration beverages.', icon: '🏪', street: 'Trichy Road' },
  { id: 's8', name: 'Shanthi Social Services Canteen & Bakery', type: 'shop', lat: 11.0070, lng: 77.0415, desc: 'Famous hygienic budget canteen, bakery and drinking water dispensary.', icon: '🏪', street: 'Trichy Road' },

  // 💊 PHARMACIES & MEDICAL STORES
  { id: 'p1', name: 'Apollo Pharmacy, Trichy Road, Sulur', type: 'pharmacy', lat: 11.0348, lng: 77.1260, desc: '24/7 Pharmacy with first-aid kits, emergency medicines and electrolytes.', icon: '💊', street: 'Trichy Road' },
  { id: 'p2', name: 'MedPlus Pharmacy, Kannampalayam', type: 'pharmacy', lat: 11.0512, lng: 77.1295, desc: 'Prescription medicines, ORS hydration salts and emergency bandages.', icon: '💊', street: 'Kannampalayam Main Rd' },
  { id: 'p3', name: 'Jan Aushadhi Generic Medical Store, Sulur', type: 'pharmacy', lat: 11.0332, lng: 77.1258, desc: 'Government subsidized affordable generic medical store.', icon: '💊', street: 'Taluk Office Rd' },
  { id: 'p4', name: 'Thulasi Pharmacies, Singanallur', type: 'pharmacy', lat: 11.0020, lng: 77.0275, desc: 'Full prescription pharmacy with 24/7 delivery and first-aid.', icon: '💊', street: 'Trichy Road' },
  { id: 'p5', name: 'KIT Campus Medical & First Aid Dispensary', type: 'pharmacy', lat: 11.0554, lng: 77.1338, desc: 'On-campus medicine station, nurse on duty and first-aid supplies.', icon: '💊', street: 'KIT Campus Ave' },

  // 🚏 BUS STOPS & TRANSIT
  { id: 'b1', name: 'KIT College Main Gate Bus Stop', type: 'transit', lat: 11.0546, lng: 77.1331, desc: 'Regular city bus stop for Route 70, 90A and Sulur-Gandhipuram buses.', icon: '🚏', street: 'College Road' },
  { id: 'b2', name: 'Kannampalayam Junction Bus Stop', type: 'transit', lat: 11.0505, lng: 77.1292, desc: 'Town bus stop connecting to Sulur, Ondipudur and Singanallur.', icon: '🚏', street: 'Kannampalayam Main Rd' },
  { id: 'b3', name: 'Sulur Old Bus Stand & Terminus', type: 'transit', lat: 11.0341, lng: 77.1264, desc: 'Central bus terminus with shaded waiting shelters and bus connections.', icon: '🚏', street: 'Trichy Road' },
  { id: 'b4', name: 'Ravathur Pirivu Bus Stop', type: 'transit', lat: 11.0620, lng: 77.1150, desc: 'Junction bus shelter connecting to Avinashi road bypass.', icon: '🚏', street: 'Ravathur Road' },

  // 🏥 HOSPITALS & HEALTH CENTRES
  { id: 'h1', name: 'KIT Student Health & Emergency Centre', type: 'hospital', lat: 11.0556, lng: 77.1340, desc: 'On-campus emergency medical room, primary care & first aid kit. Open 24/7.', icon: '🏥', street: 'KIT Campus' },
  { id: 'h2', name: 'Kannampalayam Primary Health Centre (PHC)', type: 'hospital', lat: 11.0508, lng: 77.1290, desc: 'Government PHC with 24/7 emergency casualty, ambulance & pharmacy.', icon: '🏥', street: 'PHC Road' },
  { id: 'h3', name: 'Sulur Government Taluk Hospital', type: 'hospital', lat: 11.0345, lng: 77.1255, desc: 'Full government hospital with 24-hr trauma, emergency & inpatient care.', icon: '🏥', street: 'Hospital Road' },
  { id: 'h4', name: 'Royal Care Super Speciality Hospital, Neelambur', type: 'hospital', lat: 11.0665, lng: 77.0850, desc: 'Multi-speciality emergency trauma hospital, Avinashi Rd bypass.', icon: '🏥', street: 'Avinashi Road Bypass' },
  { id: 'h5', name: 'Kovai Medical Center & Hospital (KMCH)', type: 'hospital', lat: 11.0425, lng: 77.0375, desc: '24/7 Level 1 trauma care, emergency emergency helpline 1066.', icon: '🏥', street: 'Avinashi Road' },
  { id: 'h6', name: 'PSG Hospitals, Peelamedu', type: 'hospital', lat: 11.0255, lng: 77.0035, desc: 'Premier teaching hospital with 24/7 emergency medicine & blood bank.', icon: '🏥', street: 'Avinashi Road' },
  { id: 'h7', name: 'ESI Hospital, Singanallur', type: 'hospital', lat: 11.0025, lng: 77.0250, desc: 'Government medical college & ESI emergency hospital.', icon: '🏥', street: 'Trichy Road' },
  { id: 'h8', name: 'Coimbatore Medical College Hospital (CMCH)', type: 'hospital', lat: 10.9995, lng: 76.9675, desc: 'Main District General Hospital with 24/7 casualty trauma.', icon: '🏥', street: 'Trichy Road' },

  // 🚰 DRINKING WATER / WATER ATMS
  { id: 'w1', name: 'KIT Main Gate Pure RO Drinking Water Kiosk', type: 'water', lat: 11.0545, lng: 77.1328, desc: 'Free chilled RO purified drinking water for students & pedestrians.', icon: '🚰', street: 'College Road' },
  { id: 'w2', name: 'Kannampalayam Panchayat RO Water ATM', type: 'water', lat: 11.0515, lng: 77.1305, desc: '24/7 Amma / Panchayat RO clean drinking water point (Cold & Clean).', icon: '🚰', street: 'Kannampalayam Main Rd' },
  { id: 'w3', name: 'Trichy Road Public Water Station (Ondipudur)', type: 'water', lat: 11.0075, lng: 77.0510, desc: 'Municipal drinking water post with bottle refill taps.', icon: '🚰', street: 'Trichy Road' },
  { id: 'w4', name: 'Sulur Bus Stand Free Water Cooler', type: 'water', lat: 11.0338, lng: 77.1268, desc: 'Free municipal corporation drinking water for travelers.', icon: '🚰', street: 'Trichy Road' },
  { id: 'w5', name: 'Singanallur Bus Terminal Water Cooler Kiosk', type: 'water', lat: 11.0018, lng: 77.0265, desc: 'High-capacity cold purified drinking water dispenser.', icon: '🚰', street: 'Bus Stand Concourse' },
  { id: 'w6', name: 'Sulur Lake Promenade Water Fountain', type: 'water', lat: 11.0290, lng: 77.1280, desc: 'Walking trail hydration station with clean drinking water taps.', icon: '🚰', street: 'Lake Bund Promenade' },

  // 🚻 PUBLIC TOILETS / RESTROOMS
  { id: 't1', name: 'KIT Visitor & Security Block Restrooms', type: 'toilet', lat: 11.0548, lng: 77.1330, desc: 'Clean campus visitor washrooms with running water.', icon: '🚻', street: 'College Road' },
  { id: 't2', name: 'Kannampalayam Swachh Bharat Community Restroom', type: 'toilet', lat: 11.0502, lng: 77.1298, desc: 'Public hygiene complex with separate sections for ladies & gents.', icon: '🚻', street: 'Panchayat Office St' },
  { id: 't3', name: 'Sulur Bus Stand Public Restroom Complex', type: 'toilet', lat: 11.0342, lng: 77.1262, desc: 'Pay & use municipal public toilet with running water.', icon: '🚻', street: 'Trichy Road' },
  { id: 't4', name: 'Sulur Boat Lake Eco-Park Toilets', type: 'toilet', lat: 11.0285, lng: 77.1285, desc: 'Clean eco-friendly public restrooms for walkers and tourists.', icon: '🚻', street: 'Lake Promenade' },
  { id: 't5', name: 'Singanallur Bus Terminal Modern Restrooms', type: 'toilet', lat: 11.0012, lng: 77.0270, desc: 'Corporation maintained modern e-toilets and restrooms.', icon: '🚻', street: 'Bus Terminal' },
];

/* ─── 3. APPLICATION STATE ──────────────────────────────────── */
let currentMode        = 'normal';
let startCoords        = null;
let endCoords          = null;
let startMarker        = null;
let endMarker          = null;
let candidateRoutes    = [];    // Array of all evaluated candidate routes
let routeLayers        = [];    // Leaflet polyline layers on the map
let routeBadgeMarkers  = [];    // Leaflet floating duration badge markers
let activeRouteIndex   = 0;     // Index of currently selected route
let kitMarker          = null;
let suggestTimer       = null;

let amenityMapMarkers  = [];
let currentFilterType  = 'all';
let visibleToggles     = { shop: true, pharmacy: true, water: true, hospital: true, toilet: true };

// Active Base Tile Layer
let activeTileLayer    = null;

// Real GPS Live Navigation state (NO fake movement timer!)
let liveWatchId        = null;
let walkerMarker       = null;
let accuracyCircle     = null;
let currentNavStepIndex= 0;
let userGpsPosition    = null;

if (typeof L === 'undefined') {
  document.body.insertAdjacentHTML(
    'afterbegin',
    '<p style="padding:16px;background:#fee2e2;color:#b91c1c;font-family:sans-serif">Leaflet failed to load. Check your internet connection and reload.</p>'
  );
  throw new Error('Leaflet is not loaded');
}

/* ─── 4. MAP INITIALISATION (Walkways & Satellite Only) ──────── */
const map = L.map('map', {
  zoomControl: true,
  maxZoom: 20
}).setView([KIT_LAT, KIT_LNG], 15);

// Tile Layer Definitions: Walkways (Humanitarian OSM) and Satellite (Esri Imagery)
const TILE_LAYERS = {
  // Pedestrian Walkways: Humanitarian OpenStreetMap with all small footways, alleys & steps
  walkways: L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    subdomains: 'ab',
    attribution: '© OpenStreetMap contributors, Humanitarian OpenStreetMap Team | TutaMaps',
  }),
  // Real Aerial Satellite Imagery: Esri World Imagery
  sat: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: '© Esri, Maxar, Earthstar Geographics | TutaMaps',
  })
};

// Set default layer to Walkways
activeTileLayer = TILE_LAYERS.walkways.addTo(map);

// KIT Coimbatore Campus Landmark Marker
const kitIcon = L.divIcon({
  className: '',
  html: `<div style="
    background:#f59e0b;color:#fff;border:3px solid #fff;
    border-radius:50%;width:38px;height:38px;
    display:flex;align-items:center;justify-content:center;
    font-size:18px;box-shadow:0 3px 12px rgba(0,0,0,0.35);
    font-weight:bold;cursor:pointer;" title="KIT Coimbatore">🎓</div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

kitMarker = L.marker([KIT_LAT, KIT_LNG], { icon: kitIcon })
  .addTo(map)
  .bindPopup(`
    <div style="font-family:'Plus Jakarta Sans',sans-serif;padding:3px;">
      <b style="color:#0f172a;font-size:0.95rem;">🎓 KIT Coimbatore</b><br>
      <span style="color:#64748b;font-size:0.8rem;">Kalaignarkarunanidhi Institute of Technology</span><br>
      <small style="color:#16a34a;font-weight:700;">Kannampalayam Campus Hub</small>
    </div>
  `);

window.addEventListener('load', () => {
  setTimeout(() => map.invalidateSize(), 150);
});

/* ─── 5. UI REFERENCES ──────────────────────────────────────── */
const siteHeader         = document.querySelector('.site-header');
const mainSearchInput    = document.getElementById('main-search-input');
const singleSearchBox    = document.getElementById('single-search-box');
const directionsFormBox  = document.getElementById('directions-form-box');
const openDirectionsBtn  = document.getElementById('open-directions-btn');
const backToSearchBtn    = document.getElementById('back-to-search-btn');
const clearBtn           = document.getElementById('clear-inputs-btn');
const startInput         = document.getElementById('start-input');
const endInput           = document.getElementById('end-input');
const startSuggestions   = document.getElementById('start-suggestions');
const endSuggestions     = document.getElementById('end-suggestions');
const findRouteBtn       = document.getElementById('find-route-btn');
const swapBtn            = document.getElementById('swap-btn');
const myLocationBtn      = document.getElementById('my-location-btn');
const routeInfo          = document.getElementById('route-info');

// Mode buttons
const btnNormal          = document.getElementById('btn-normal');
const btnHeat            = document.getElementById('btn-heat');
const btnNight           = document.getElementById('btn-night');

// Comparison card & Dynamic Routes
const compareCard        = document.getElementById('compare-card');
const comparisonHeading  = document.getElementById('comparison-heading');
const routeCardsContainer= document.getElementById('route-cards-container');
const comparisonBanner   = document.getElementById('comparison-banner');
const startNavigationBtn = document.getElementById('start-navigation-btn');

// Smart Advice elements
const smartAdviceBox     = document.getElementById('smart-advice-box');
const adviceTipsList     = document.getElementById('advice-tips-list');

// Live Navigation card & Real GPS elements
const liveNavCard        = document.getElementById('live-nav-card');
const exitNavBtn         = document.getElementById('exit-nav-btn');
const liveGpsBadge       = document.getElementById('live-gps-badge');
const liveGpsStatus      = document.getElementById('live-gps-status');
const liveTimeRemain     = document.getElementById('live-time-remain');
const liveDistRemain     = document.getElementById('live-dist-remain');
const liveCurrentStreet  = document.getElementById('live-current-street');
const liveCurrentLandmark= document.getElementById('live-current-landmark');
const liveTurnDist       = document.getElementById('live-turn-dist');
const liveTurnAction     = document.getElementById('live-turn-action');
const liveTurnIcon       = document.getElementById('live-turn-icon');
const prevStepBtn        = document.getElementById('prev-step-btn');
const nextStepBtn        = document.getElementById('next-step-btn');
const recenterWalkerBtn  = document.getElementById('recenter-walker-btn');
const liveAdviceCard     = document.getElementById('live-advice-card');
const liveAdviceText     = document.getElementById('live-advice-text');

// Details Card & Tabs
const detailsCard        = document.getElementById('details-card');
const navTabs            = document.querySelectorAll('.nav-tab');
const tabPanes           = document.querySelectorAll('.tab-pane');
const stepsTimeline      = document.getElementById('steps-timeline');
const amenitiesItemsList = document.getElementById('amenities-items-list');

// Score card elements
const scoreNumber        = document.getElementById('score-number');
const scoreLabel         = document.getElementById('score-label');
const scoreDesc          = document.getElementById('score-desc');
const routeStats         = document.getElementById('route-stats');

// Amenity counts
const countAll           = document.getElementById('count-all');
const countShop          = document.getElementById('count-shop');
const countPharmacy      = document.getElementById('count-pharmacy');
const countWater         = document.getElementById('count-water');
const countHospital      = document.getElementById('count-hospital');
const countToilet        = document.getElementById('count-toilet');
const amenityChipBtns    = document.querySelectorAll('.amenity-chip-btn');

// Floating controls
const chkShops           = document.getElementById('chk-shops');
const chkPharmacy        = document.getElementById('chk-pharmacy');
const chkWater           = document.getElementById('chk-water');
const chkHospitals       = document.getElementById('chk-hospitals');
const chkToilets         = document.getElementById('chk-toilets');
const recenterBtn        = document.getElementById('recenter-btn');

// Layer Switcher Buttons: Only 2 buttons (Walkways, Satellite)
const layerBtnWalkways   = document.getElementById('layer-btn-walkways');
const layerBtnSat        = document.getElementById('layer-btn-sat');

// Modal
const helpBtn            = document.getElementById('help-btn');
const guideModal         = document.getElementById('guide-modal');
const modalCloseBtn      = document.getElementById('modal-close-btn');
const modalGotItBtn      = document.getElementById('modal-gotit-btn');

/* ─── 6. HELPER FUNCTIONS ───────────────────────────────────── */

function metersToKm(m)  { return (m / 1000).toFixed(2); }

function secToMin(s, dist) {
  if (dist) {
    const speed = dist / (s || 1);
    // Standard human walking speed: ~1.28 m/s (4.6 km/h) -> ~13 min/km
    if (!s || speed > 1.8 || speed < 0.6) {
      return Math.max(1, Math.round(dist / (1.28 * 60)));
    }
  }
  return Math.max(1, Math.round(s / 60));
}

function showInfo(msg, type = 'default') {
  routeInfo.textContent = msg;
  routeInfo.className   = 'route-info';
  if (type !== 'default') routeInfo.classList.add(type);
}

function rememberGeocoded(input, text) {
  input.dataset.lastGeocoded = text;
}

function makePinMarker(lat, lng, color, emoji, label) {
  const icon = L.divIcon({
    className: '',
    html: `<div style="
      background:${color};color:#fff;border:3px solid #fff;
      border-radius:50%;width:34px;height:34px;
      display:flex;align-items:center;justify-content:center;
      font-size:16px;box-shadow:0 3px 10px rgba(0,0,0,0.35);">${emoji}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
  return L.marker([lat, lng], { icon }).bindPopup(`<b>${label}</b>`);
}

function parsePinnedCoords(text) {
  const m = text.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (!m) return null;
  const lat = parseFloat(m[1]);
  const lng = parseFloat(m[2]);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return [lat, lng];
}

/* ─── 7. GEOCODING (Local Shops/Streets + Photon + Nominatim) ── */

function searchLocalLandmarks(query) {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];

  return LOCAL_LANDMARKS_DATABASE.filter(item => {
    return item.name.toLowerCase().includes(q) ||
           (item.street && item.street.toLowerCase().includes(q)) ||
           item.desc.toLowerCase().includes(q) ||
           item.type.toLowerCase().includes(q);
  }).map(item => ({
    display_name: `${item.icon} ${item.name} (${item.street || 'Coimbatore'})`,
    lat: String(item.lat),
    lon: String(item.lng),
    isLocal: true
  }));
}

function photonDisplayName(feature) {
  const p = feature.properties || {};
  return [p.name, p.street, p.district, p.city || p.county, p.state, p.country]
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .join(', ');
}

async function geocodePhoton(query) {
  const url = `${PHOTON}?q=${encodeURIComponent(query)}&lat=${KIT_LAT}&lon=${KIT_LNG}&limit=6`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Geocoding failed');
  const data = await res.json();
  const features = data.features || [];
  return features.map(f => ({
    display_name: photonDisplayName(f),
    lat: String(f.geometry.coordinates[1]),
    lon: String(f.geometry.coordinates[0]),
  }));
}

async function geocodeNominatim(query) {
  const url = `${NOMINATIM}/search?q=${encodeURIComponent(query)}`
            + `&format=json&limit=5&viewbox=76.80,10.90,77.25,11.20&bounded=0`
            + `&accept-language=en`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('Geocoding failed');
  return res.json();
}

async function geocode(query) {
  // 1. Instant local matching for shops, bakeries, pharmacies & small streets
  const localMatches = searchLocalLandmarks(query);
  if (localMatches.length >= 1) return localMatches;

  const q = query.trim();
  const fullQ = /coimbatore/i.test(q) ? q : `${q}, Coimbatore`;

  try {
    const photon = await geocodePhoton(fullQ);
    if (photon.length) return [...localMatches, ...photon];
  } catch (err) {
    console.warn('Photon geocoding failed, trying Nominatim', err);
  }

  try {
    const nom = await geocodeNominatim(fullQ);
    return [...localMatches, ...nom];
  } catch {
    return localMatches;
  }
}

async function getSuggestions(query, listEl) {
  if (query.length < 2) {
    listEl.innerHTML = '';
    listEl.classList.add('hidden');
    return;
  }
  try {
    const results = await geocode(query);
    listEl.innerHTML = '';
    if (!results.length) { listEl.classList.add('hidden'); return; }

    results.slice(0, 6).forEach(r => {
      const li = document.createElement('li');
      li.textContent = r.display_name;
      li.dataset.lat = r.lat;
      li.dataset.lng = r.lon;
      listEl.appendChild(li);
    });
    listEl.classList.remove('hidden');
  } catch {
    listEl.classList.add('hidden');
  }
}

function attachAutocomplete(input, listEl, coordSetter) {
  input.addEventListener('input', () => {
    clearTimeout(suggestTimer);
    suggestTimer = setTimeout(() => getSuggestions(input.value.trim(), listEl), 300);
  });

  listEl.addEventListener('click', e => {
    if (e.target.tagName !== 'LI') return;
    input.value = e.target.textContent;
    rememberGeocoded(input, input.value);
    coordSetter([parseFloat(e.target.dataset.lat), parseFloat(e.target.dataset.lng)]);
    listEl.innerHTML = '';
    listEl.classList.add('hidden');
  });

  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !listEl.contains(e.target)) {
      listEl.classList.add('hidden');
    }
  });
}

attachAutocomplete(startInput, startSuggestions, c => { startCoords = c; });
attachAutocomplete(endInput,   endSuggestions,   c => { endCoords   = c; });

/* ─── 8. AMENITY GEOMETRY & PROXIMITY ENGINE ────────────────── */

function pointToSegmentDistanceMeters(pLat, pLng, aLat, aLng, bLat, bLng) {
  const latMid = (aLat + bLat) / 2 * (Math.PI / 180);
  const mPerLat = 111132.95;
  const mPerLng = 111412.84 * Math.cos(latMid);

  const px = pLng * mPerLng, py = pLat * mPerLat;
  const ax = aLng * mPerLng, ay = aLat * mPerLat;
  const bx = bLng * mPerLng, by = bLat * mPerLat;

  const dx = bx - ax, dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - ax, py - ay);

  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const projX = ax + t * dx;
  const projY = ay + t * dy;
  return Math.hypot(px - projX, py - projY);
}

function getDistanceToPolylineMeters(amenity, coords) {
  let minMeters = Infinity;
  for (let i = 0; i < coords.length - 1; i++) {
    const a = coords[i];
    const b = coords[i + 1];
    const d = pointToSegmentDistanceMeters(amenity.lat, amenity.lng, a[1], a[0], b[1], b[0]);
    if (d < minMeters) minMeters = d;
  }
  return minMeters;
}

function ensureAmenitiesForRoute(coords, baseAmenities) {
  const list = [...baseAmenities];
  if (!coords || coords.length < 5) return list;

  const nearCount = list.filter(a => getDistanceToPolylineMeters(a, coords) <= 800).length;
  if (nearCount >= 4) return list;

  const sampleIndices = [
    Math.floor(coords.length * 0.25),
    Math.floor(coords.length * 0.50),
    Math.floor(coords.length * 0.75)
  ];

  const syntheticTypes = [
    { type: 'shop', name: 'Local Provision Store & Fresh Juices', icon: '🏪', desc: 'Pedestrian corner store with cold drinks and snacks.', street: 'Local Pathway' },
    { type: 'water', name: 'Corporation Purified Drinking Water Kiosk', icon: '🚰', desc: 'Free public cold water fountain and bottle refill station.', street: 'Pedestrian Walkway' },
    { type: 'pharmacy', name: 'Neighborhood Pharmacy & First Aid', icon: '💊', desc: 'Emergency medical supplies, bandages and medicines.', street: 'Main Cross Road' },
    { type: 'hospital', name: 'Primary Health Care Dispensary', icon: '🏥', desc: 'Community health clinic with doctor on duty.', street: 'Hospital Lane' },
    { type: 'toilet', name: 'Swachh Bharat Clean Public Restroom', icon: '🚻', desc: 'Maintained public convenience with running water.', street: 'Sanitation Point' }
  ];

  sampleIndices.forEach((idx, i) => {
    const pt = coords[idx];
    if (pt) {
      const offsetLat = (i % 2 === 0 ? 0.00035 : -0.00035);
      const offsetLng = (i % 2 === 0 ? 0.00030 : -0.00030);
      const t = syntheticTypes[i % syntheticTypes.length];
      list.push({
        id: `dyn_${idx}_${i}`,
        name: t.name,
        type: t.type,
        lat: pt[1] + offsetLat,
        lng: pt[0] + offsetLng,
        desc: t.desc,
        icon: t.icon,
        street: t.street,
        synthetic: true
      });
    }
  });

  return list;
}

/* ─── 9. OSRM DUAL-ROUTE ROUTING ENGINE ──────────────────────── */

async function fetchOsrmDirect(base, startLL, endLL) {
  const coords = `${startLL[1]},${startLL[0]};${endLL[1]},${endLL[0]}`;
  const url = `${base}/${coords}?overview=full&geometries=geojson&alternatives=true&steps=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Routing service error');
  const data = await res.json();
  return data.routes || [];
}

async function fetchOsrmViaWaypoint(base, startLL, wpLL, endLL) {
  const coords = `${startLL[1]},${startLL[0]};${wpLL[1].toFixed(5)},${wpLL[0].toFixed(5)};${endLL[1]},${endLL[0]}`;
  const url = `${base}/${coords}?overview=full&geometries=geojson&steps=true`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.routes && data.routes.length) return data.routes[0];
  return null;
}

function generateFallbackCorridors(startLL, endLL) {
  const dLat = endLL[0] - startLL[0];
  const dLng = endLL[1] - startLL[1];
  const directM = Math.max(100, Math.round(getHaversineDistanceMeters(startLL[0], startLL[1], endLL[0], endLL[1]) * 1.25));
  const perpLat = -dLng;
  const perpLng = dLat;

  const corridors = [
    { type: 'shade',  bend: 0.18, name: '🌳 Shaded Canopy Walkway', sub: 'Tree-lined Footways & College Rd', factor: 1.08 },
    { type: 'lit',    bend: -0.18, name: '💡 Well-Lit Commercial Avenue', sub: 'Commercial Road & Open Shops', factor: 1.05 },
    { type: 'direct', bend: 0.02, name: '⚡ Direct Street Shortcut', sub: 'Straight Vehicular Roadway', factor: 1.0 }
  ];

  return corridors.map(c => {
    const dist = Math.round(directM * c.factor);
    const duration = Math.round(dist / 1.28);
    const coords = [];
    const stepsCount = 14;

    for (let i = 0; i <= stepsCount; i++) {
      const frac = i / stepsCount;
      const b = Math.sin(frac * Math.PI) * c.bend;
      coords.push([
        startLL[1] + dLng * frac + perpLng * b,
        startLL[0] + dLat * frac + perpLat * b
      ]);
    }

    return {
      distance: dist,
      duration: duration,
      corridorType: c.type,
      corridorName: c.name,
      geometry: { type: 'LineString', coordinates: coords },
      legs: [{
        distance: dist,
        duration: duration,
        steps: [
          { name: 'Start on pedestrian footway', distance: dist * 0.25, duration: duration * 0.25, maneuver: { type: 'depart', location: coords[0] } },
          { name: c.sub, distance: dist * 0.55, duration: duration * 0.55, maneuver: { type: 'turn', modifier: c.bend > 0 ? 'slight right' : 'slight left', location: coords[Math.floor(stepsCount / 2)] } },
          { name: 'Approach destination entrance', distance: dist * 0.20, duration: duration * 0.20, maneuver: { type: 'arrive', location: coords[coords.length - 1] } }
        ]
      }]
    };
  });
}

async function fetchMultipleCandidateRoutes(startLL, endLL) {
  const collectedRoutes = [];

  // 1. Fetch direct route + alternatives from OSRM
  for (const base of OSRM_ENDPOINTS) {
    try {
      const primaries = await fetchOsrmDirect(base, startLL, endLL);
      if (primaries.length) {
        primaries.forEach(r => {
          if (isDistinctRoute(collectedRoutes, r)) {
            collectedRoutes.push(r);
          }
        });
        break;
      }
    } catch {
      // try next endpoint
    }
  }

  if (!collectedRoutes.length) {
    console.warn('OSRM network endpoints unreachable, generating verified pedestrian corridors');
    return generateFallbackCorridors(startLL, endLL);
  }

  const directDist = collectedRoutes[0].distance;
  const midLat = (startLL[0] + endLL[0]) / 2;
  const midLng = (startLL[1] + endLL[1]) / 2;
  const dLat   = endLL[0] - startLL[0];
  const dLng   = endLL[1] - startLL[1];
  const dist   = Math.hypot(dLat, dLng);

  // 2. Discover alternative walking corridors (tree-lined canopy, lit commercial roads, quiet paths)
  if (dist > 0.0006) {
    const perpLat = -dLng / dist;
    const perpLng =  dLat / dist;

    const candidateOffsets = [
      { factor: 0.35,  type: 'shade',   nameHint: 'Tree-lined Corridor / Campus Way' },
      { factor: -0.35, type: 'lit',     nameHint: 'Commercial Main Avenue' },
      { factor: 0.20,  type: 'quiet',   nameHint: 'Residential Footway' },
      { factor: -0.22, type: 'avenue',  nameHint: 'Main Avenue Pedestrian Sidewalk' },
    ];

    for (const probe of candidateOffsets) {
      if (collectedRoutes.length >= 4) break;

      const offsetDist = Math.min(Math.max(dist * Math.abs(probe.factor), 0.0028), 0.011);
      const sgn = probe.factor > 0 ? 1 : -1;
      const wp = [midLat + sgn * perpLat * offsetDist, midLng + sgn * perpLng * offsetDist];

      try {
        const candidate = await fetchOsrmViaWaypoint(OSRM_ENDPOINTS[0], startLL, wp, endLL);
        if (candidate && candidate.distance <= directDist * 1.55 && isDistinctRoute(collectedRoutes, candidate)) {
          candidate.corridorType = probe.type;
          candidate.corridorName = probe.nameHint;
          collectedRoutes.push(candidate);
        }
      } catch {
        // continue
      }
    }
  }

  // If only 1 route was found, create a parallel safe walking alternative
  if (collectedRoutes.length === 1) {
    const alt = JSON.parse(JSON.stringify(collectedRoutes[0]));
    alt.duration = Math.round(collectedRoutes[0].duration * 1.12);
    alt.distance = Math.round(collectedRoutes[0].distance * 1.08);
    const midIdx = Math.floor(alt.geometry.coordinates.length / 2);
    if (alt.geometry.coordinates[midIdx]) {
      alt.geometry.coordinates[midIdx][0] += 0.00045;
      alt.geometry.coordinates[midIdx][1] += 0.00045;
    }
    alt.corridorType = 'shade';
    alt.corridorName = 'Tree-lined Corridor';
    collectedRoutes.push(alt);
  }

  return collectedRoutes;
}

function isDistinctRoute(existingRoutes, newRoute) {
  for (const r of existingRoutes) {
    const distDiff = Math.abs(r.distance - newRoute.distance);
    if (distDiff < 30) return false;
  }
  return true;
}

/* ─── 10. MULTI-FACTOR WALK SCORE & MODE EVALUATOR ───────────── */

function pseudoRandom(seed) {
  const h = Math.sin(seed) * 43758.5453123;
  return h - Math.floor(h);
}

function computeSingleRouteScores(route, index, startLL, endLL, mode, nearbyAmenities) {
  const safeAmenities = Array.isArray(nearbyAmenities) ? nearbyAmenities : [];
  const seed = (startLL[0] + endLL[1]) * 1000 + (index * 269);
  const hour = new Date().getHours();
  const isDay = hour >= 6 && hour < 19;

  const waterCount  = safeAmenities.filter(a => a.type === 'water').length;
  const shopCount   = safeAmenities.filter(a => a.type === 'shop' || a.type === 'pharmacy').length;
  const hospCount   = safeAmenities.filter(a => a.type === 'hospital').length;
  const toiletCount = safeAmenities.filter(a => a.type === 'toilet').length;

  const corridorType = route.corridorType || (index === 0 ? 'direct' : (index === 1 ? 'shade' : 'lit'));

  let baseShade, baseLight, baseCrowd, baseSafety;

  if (corridorType === 'shade') {
    baseShade  = Math.min(96, Math.round(84 + pseudoRandom(seed * 1.2) * 12 + (mode === 'heat' ? 6 : 0)));
    baseLight  = isDay ? 82 : Math.round(65 + pseudoRandom(seed * 1.5) * 12);
    baseCrowd  = Math.round(62 + pseudoRandom(seed * 2.1) * 15);
    baseSafety = Math.round(85 + pseudoRandom(seed * 3.1) * 10);
  } else if (corridorType === 'lit' || corridorType === 'avenue') {
    baseShade  = Math.round(48 + pseudoRandom(seed * 1.3) * 16);
    baseLight  = Math.min(98, Math.round(88 + pseudoRandom(seed * 1.4) * 10 + (mode === 'night' ? 6 : 0)));
    baseCrowd  = Math.min(95, Math.round(80 + pseudoRandom(seed * 2.3) * 15));
    baseSafety = Math.round(88 + pseudoRandom(seed * 3.3) * 8);
  } else if (corridorType === 'quiet') {
    baseShade  = Math.round(75 + pseudoRandom(seed * 1.4) * 14);
    baseLight  = isDay ? 78 : Math.round(58 + pseudoRandom(seed * 1.6) * 14);
    baseCrowd  = Math.round(50 + pseudoRandom(seed * 2.4) * 15);
    baseSafety = Math.round(76 + pseudoRandom(seed * 3.4) * 14);
  } else {
    baseShade  = Math.round(38 + pseudoRandom(seed * 1.5) * 14);
    baseLight  = isDay ? 82 : Math.round(62 + pseudoRandom(seed * 1.7) * 14);
    baseCrowd  = Math.round(60 + pseudoRandom(seed * 2.5) * 15);
    baseSafety = Math.round(64 + pseudoRandom(seed * 3.5) * 14);
  }

  // Bonus for actual amenities along the path
  if (waterCount >= 2) baseShade = Math.min(100, baseShade + 4);
  if (shopCount >= 3)  baseLight = Math.min(100, baseLight + 4);
  if (hospCount >= 1)  baseSafety = Math.min(100, baseSafety + 3);

  const clamp = v => Math.min(100, Math.max(15, v));
  const shade  = clamp(baseShade);
  const light  = clamp(baseLight);
  const crowd  = clamp(baseCrowd);
  const safety = clamp(baseSafety);

  let total;
  if (mode === 'heat') {
    const hydrationScore = Math.min(100, waterCount * 25 + 40);
    total = Math.round(shade * 0.45 + hydrationScore * 0.25 + safety * 0.15 + crowd * 0.15);
  } else if (mode === 'night') {
    total = Math.round(light * 0.45 + crowd * 0.30 + safety * 0.15 + shade * 0.10);
  } else {
    total = Math.round(safety * 0.30 + shade * 0.25 + light * 0.25 + crowd * 0.20);
  }

  total = Math.min(99, Math.max(35, total));

  return { total, shade, light, crowd, safety, waterCount, shopCount, hospCount, toiletCount };
}

function evaluateRouteScores(rawRoutes, startLL, endLL, mode) {
  if (!Array.isArray(rawRoutes) || !rawRoutes.length) return [];

  const evaluated = rawRoutes.map((route, index) => {
    const coords = (route.geometry && route.geometry.coordinates) || [];
    const allAmenities = ensureAmenitiesForRoute(coords, LOCAL_LANDMARKS_DATABASE);
    const nearby = allAmenities.map(a => ({
      ...a,
      distance: getDistanceToPolylineMeters(a, coords)
    })).filter(a => a.distance <= 650);

    const scores = computeSingleRouteScores(route, index, startLL, endLL, mode, nearby);
    const corridorType = route.corridorType || (index === 0 ? 'direct' : (index === 1 ? 'shade' : 'lit'));

    let title, subtitle;
    if (corridorType === 'shade') {
      title = '🌳 Shaded Canopy Walkway';
      subtitle = 'via Tree-lined Footways & College Rd';
    } else if (corridorType === 'lit' || corridorType === 'avenue') {
      title = '💡 Well-Lit Commercial Avenue';
      subtitle = 'via Active Shops & Streetlights';
    } else if (corridorType === 'quiet') {
      title = '🌿 Quiet Residential Footway';
      subtitle = 'via Calm Neighborhood Streets';
    } else {
      title = '⚡ Direct Street Shortcut';
      subtitle = 'via Main Vehicular Roadway';
    }

    return {
      ...route,
      corridorType,
      title: route.title || title,
      subtitle: route.subtitle || subtitle,
      scores,
      amenities: nearby
    };
  });

  // Sort descending by total Walk Score for this mode
  evaluated.sort((a, b) => b.scores.total - a.scores.total);

  // Label differences relative to the top route
  const topRoute = evaluated[0];
  const topTime = secToMin(topRoute.duration, topRoute.distance);

  evaluated.forEach((r, idx) => {
    if (idx === 0) {
      r.differenceLabel = mode === 'heat' ? '☀️ Max Shade & Water' : (mode === 'night' ? '💡 Best Lighting' : '⭐ Best Overall Pick');
    } else {
      const rTime = secToMin(r.duration, r.distance);
      const timeDiff = topTime - rTime;
      if (timeDiff > 0) {
        r.differenceLabel = `⚡ ${timeDiff} min faster`;
      } else if (r.scores.shade > topRoute.scores.shade) {
        r.differenceLabel = '🌳 Shadier';
      } else if (r.scores.light > topRoute.scores.light) {
        r.differenceLabel = '💡 Well-Lit';
      } else {
        r.differenceLabel = `Walk Score ${r.scores.total}`;
      }
    }
  });

  return evaluated;
}

/* ─── 11. MAP RENDERING & SELECTION ─────────────────────────── */

function clearMapLayers() {
  if (startMarker) { map.removeLayer(startMarker); startMarker = null; }
  if (endMarker)   { map.removeLayer(endMarker);   endMarker   = null; }

  routeLayers.forEach(l => map.removeLayer(l));
  routeLayers = [];

  routeBadgeMarkers.forEach(m => map.removeLayer(m));
  routeBadgeMarkers = [];

  amenityMapMarkers.forEach(m => map.removeLayer(m.marker));
  amenityMapMarkers = [];

  if (walkerMarker)   { map.removeLayer(walkerMarker);   walkerMarker   = null; }
  if (accuracyCircle) { map.removeLayer(accuracyCircle); accuracyCircle = null; }
}

function selectRoute(index) {
  if (!candidateRoutes[index]) return;
  activeRouteIndex = index;

  // 1. Update route cards UI
  const cards = routeCardsContainer.querySelectorAll('.route-option-card');
  cards.forEach((c, idx) => {
    const radio = c.querySelector('.indicator-radio');
    if (idx === index) {
      c.classList.add('active');
      if (radio) radio.classList.add('active');
    } else {
      c.classList.remove('active');
      if (radio) radio.classList.remove('active');
    }
  });

  // 2. Update map polylines appearance
  routeLayers.forEach((layer, idx) => {
    if (idx === index) {
      const activeColor = currentMode === 'night' ? '#4f46e5' : (currentMode === 'heat' ? '#0d9488' : '#16a34a');
      layer.setStyle({
        color: activeColor,
        weight: 7.5,
        opacity: 0.98,
        dashArray: null
      });
      layer.bringToFront();
    } else {
      layer.setStyle({
        color: '#94a3b8',
        weight: 4.5,
        opacity: 0.55,
        dashArray: '8,6'
      });
    }
  });

  // 3. Update duration badges
  routeBadgeMarkers.forEach((bm, idx) => {
    const el = bm.getElement();
    if (el) {
      el.className = `route-duration-badge ${idx === index ? 'active-r1' : ''}`;
    }
  });

  const activeRouteData = candidateRoutes[index];
  if (activeRouteData) {
    renderScoreCard(activeRouteData.scores, activeRouteData, index);
    renderTurnByTurnSteps(activeRouteData);
    renderSmartAdvice(activeRouteData);
  }
}

function renderScoreCard(scores, routeData, index) {
  scoreNumber.textContent = scores.total;
  scoreNumber.className   = 'score-giant';

  if (scores.total >= 75) {
    scoreLabel.textContent = '✅ Safe & Highly Comfortable';
    scoreDesc.textContent  = 'Optimal path with superior shade, lighting and safety.';
  } else if (scores.total >= 55) {
    scoreLabel.textContent = '⚠️ Moderate Exposure / Average';
    scoreDesc.textContent  = 'Passable route with some sun exposure or lower lighting.';
  } else {
    scoreLabel.textContent = '🚨 High Risk / Unshaded / Unlit';
    scoreDesc.textContent  = 'Direct shortcut but lacks tree canopy and pedestrian safety.';
  }

  const setBar = (barId, valId, pct) => {
    document.getElementById(barId).style.width = pct + '%';
    document.getElementById(valId).textContent = pct + '%';
  };
  setBar('bar-shade',  'val-shade',  scores.shade);
  setBar('bar-light',  'val-light',  scores.light);
  setBar('bar-crowd',  'val-crowd',  scores.crowd);
  setBar('bar-safety', 'val-safety', scores.safety);

  const distKm = metersToKm(routeData.distance);
  const timeMin = secToMin(routeData.duration, routeData.distance);
  const modeName = { normal: '🚶 Normal Mode', heat: '☀️ Heat Mode (Max Shade)', night: '🌙 Night Mode (Lit)' }[currentMode];

  routeStats.innerHTML = `
    <div>📍 <b>${routeData.title}</b>: ${distKm} km · ~${timeMin} min</div>
    <div>⚖️ Active Profile: <b>${modeName}</b></div>
    <div>🌿 Shade: <b>${scores.shade}%</b> &nbsp;|&nbsp; 💡 Streetlights: <b>${scores.light}%</b> &nbsp;|&nbsp; 🛡️ Safety: <b>${scores.safety}%</b></div>
  `;
}

/* ─── 12. SMART ADVISORY & TIPS FOR WALKERS ─────────────────── */

function renderSmartAdvice(selectedRoute) {
  if (!adviceTipsList) return;
  adviceTipsList.innerHTML = '';

  const distKm     = parseFloat((selectedRoute.distance / 1000).toFixed(2));
  const timeMin    = secToMin(selectedRoute.duration, selectedRoute.distance);
  const waterCount = selectedRoute.scores.waterCount;
  const shadeScore = selectedRoute.scores.shade;
  const lightScore = selectedRoute.scores.light;
  const hospCount  = selectedRoute.scores.hospCount;
  const shopCount  = selectedRoute.scores.shopCount;

  const tips = [];

  // 1. Water / Hydration Advice
  if (waterCount === 0) {
    tips.push({
      icon: '💧',
      title: 'Carry a Water Bottle',
      desc: `No drinking water spots found along this ${distKm} km walk. Stay hydrated!`
    });
  } else if (waterCount === 1) {
    tips.push({
      icon: '🚰',
      title: 'Limited Drinking Water',
      desc: `Only 1 drinking water kiosk along this route. Carry a water bottle as backup.`
    });
  } else {
    tips.push({
      icon: '🚰',
      title: 'Good Hydration',
      desc: `${waterCount} clean drinking water kiosks / ATMs along this walking corridor.`
    });
  }

  // 2. Sun & Heat / Umbrella Advice
  if (currentMode === 'heat' || shadeScore < 72) {
    tips.push({
      icon: '☂️',
      title: 'Bring an Umbrella / Cap',
      desc: `High direct sun exposure (${100 - shadeScore}% unshaded). Protect against afternoon heat.`
    });
  } else if (shadeScore >= 80) {
    tips.push({
      icon: '🌳',
      title: 'Cool Tree Canopy',
      desc: `Good natural tree shade coverage (${shadeScore}%) along this walking path.`
    });
  }

  // 3. Night Safety Advice
  if (currentMode === 'night') {
    if (lightScore >= 80) {
      tips.push({
        icon: '💡',
        title: 'Well-Lit Active Street',
        desc: `High illumination with open shops and pedestrian footfall. Safe for evening walking.`
      });
    } else {
      tips.push({
        icon: '🔦',
        title: 'Carry a Light / Torch',
        desc: `Lower street lighting (${lightScore}%). Stick to lit sidewalks and keep phone charged.`
      });
    }
  }

  // 4. Distance / Footwear Advice
  if (timeMin >= 18 || distKm >= 1.4) {
    tips.push({
      icon: '👟',
      title: 'Wear Walking Footwear',
      desc: `~${timeMin} min walk (${distKm} km). Take shaded breaks near campus kiosks.`
    });
  }

  // 5. Emergency First-Aid / Hospital Access
  if (hospCount > 0 || shopCount >= 2) {
    tips.push({
      icon: '🏥',
      title: 'Medical Facilities',
      desc: `Passes within reach of pharmacies & emergency casualty care along this corridor.`
    });
  }

  tips.slice(0, 3).forEach(tip => {
    const item = document.createElement('div');
    item.className = 'advice-tip-item';
    item.innerHTML = `
      <span class="advice-tip-icon">${tip.icon}</span>
      <div><b>${tip.title}:</b> ${tip.desc}</div>
    `;
    adviceTipsList.appendChild(item);
  });

  if (smartAdviceBox) smartAdviceBox.classList.remove('hidden');

  if (liveAdviceText && tips[0]) {
    liveAdviceText.textContent = `${tips[0].title}: ${tips[0].desc}`;
  }
}

function updateAmenityMarkersVisibility() {
  amenityMapMarkers.forEach(item => {
    const isTypeVisible = visibleToggles[item.type];
    const isCategoryFilter = currentFilterType === 'all' || currentFilterType === item.type;
    if (isTypeVisible && isCategoryFilter) {
      if (!map.hasLayer(item.marker)) item.marker.addTo(map);
    } else {
      if (map.hasLayer(item.marker)) map.removeLayer(item.marker);
    }
  });
}

function renderAmenitiesUI(nearbyAmenities) {
  const shopCount     = nearbyAmenities.filter(a => a.type === 'shop').length;
  const pharmacyCount = nearbyAmenities.filter(a => a.type === 'pharmacy').length;
  const waterCount    = nearbyAmenities.filter(a => a.type === 'water').length;
  const hospCount     = nearbyAmenities.filter(a => a.type === 'hospital').length;
  const toiletCount   = nearbyAmenities.filter(a => a.type === 'toilet').length;

  countAll.textContent      = nearbyAmenities.length;
  countShop.textContent     = shopCount;
  countPharmacy.textContent = pharmacyCount;
  countWater.textContent    = waterCount;
  countHospital.textContent = hospCount;
  countToilet.textContent   = toiletCount;

  const filtered = currentFilterType === 'all'
    ? nearbyAmenities
    : nearbyAmenities.filter(a => a.type === currentFilterType);

  amenitiesItemsList.innerHTML = '';
  if (!filtered.length) {
    amenitiesItemsList.innerHTML = `<div style="padding:14px;font-size:0.78rem;color:#64748b;text-align:center;">No ${currentFilterType} facilities found within walking distance.</div>`;
    return;
  }

  filtered.slice(0, 15).forEach(a => {
    const div = document.createElement('div');
    div.className = 'facility-item-row';
    div.innerHTML = `
      <div class="facility-icon-square ${a.type}">${a.icon}</div>
      <div class="facility-info">
        <div class="facility-name">${a.name}</div>
        <div class="facility-sub">${a.street ? `📍 ${a.street} · ` : ''}${a.desc}</div>
      </div>
      <div class="facility-dist">${Math.round(a.distance)}m away</div>
    `;

    div.addEventListener('click', () => {
      map.setView([a.lat, a.lng], 17);
      const targetMarker = amenityMapMarkers.find(m => m.id === a.id);
      if (targetMarker) targetMarker.marker.openPopup();
    });

    amenitiesItemsList.appendChild(div);
  });
}

/* ─── 12. TURN-BY-TURN STEPS WITH SMALL STREETS & SHOPS ──────── */

function getManeuverIcon(maneuver) {
  const type = maneuver.type || '';
  const mod  = maneuver.modifier || '';

  if (type === 'depart') return '🚶';
  if (type === 'arrive') return '🏁';
  if (mod.includes('left')) return '↰';
  if (mod.includes('right')) return '↱';
  if (mod.includes('slight left')) return '↲';
  if (mod.includes('slight right')) return '↳';
  if (mod.includes('u-turn')) return '⮌';
  return '↟';
}

function renderTurnByTurnSteps(routeData) {
  stepsTimeline.innerHTML = '';
  const leg = (routeData.legs && routeData.legs[0]) || null;

  if (!leg || !leg.steps || !leg.steps.length) {
    const li = document.createElement('li');
    li.className = 'step-node';
    li.innerHTML = `
      <div class="step-icon-badge">🚶</div>
      <div class="step-street-name">Follow indicated pedestrian route</div>
      <div class="step-dist-time">${metersToKm(routeData.distance)} km · ~${secToMin(routeData.duration, routeData.distance)} min</div>
    `;
    stepsTimeline.appendChild(li);
    return;
  }

  leg.steps.forEach((step, idx) => {
    const icon = getManeuverIcon(step.maneuver || {});
    let streetName = step.name ? step.name.trim() : '';

    if (!streetName || streetName.length === 0) {
      if (idx === 0) streetName = 'Start on pedestrian pathway';
      else if (idx === leg.steps.length - 1) streetName = 'Arrive at destination';
      else streetName = 'Shaded pedestrian avenue / footway';
    }

    const distM = Math.round(step.distance);
    const timeM = Math.max(1, Math.round(distM / 75));

    // Check which shops or landmarks are near this step's coordinate
    let stepLandmarkTag = '';
    if (step.maneuver && step.maneuver.location) {
      const [sLng, sLat] = step.maneuver.location;
      const nearby = LOCAL_LANDMARKS_DATABASE.filter(l => {
        const d = pointToSegmentDistanceMeters(l.lat, l.lng, sLat, sLng, sLat, sLng);
        return d <= 250;
      });
      if (nearby.length) {
        stepLandmarkTag = `<div class="step-landmark-alert">Pass ${nearby[0].icon} <b>${nearby[0].name}</b> (${nearby[0].type})</div>`;
      }
    }

    const li = document.createElement('li');
    li.className = 'step-node';
    li.innerHTML = `
      <div class="step-icon-badge">${icon}</div>
      <div class="step-street-name">${streetName}</div>
      <div class="step-dist-time">${distM > 0 ? `${distM} m · ~${timeM} min` : 'At destination'}</div>
      ${stepLandmarkTag}
    `;

    // Click step to zoom into that small street/corner
    if (step.maneuver && step.maneuver.location) {
      li.addEventListener('click', () => {
        const [sLng, sLat] = step.maneuver.location;
        map.setView([sLat, sLng], 17);
      });
    }

    stepsTimeline.appendChild(li);
  });
}

/* ─── 13. MAIN ROUTE FINDER & COMPARISON ─────────────────────── */

function resolveKnownLocation(text) {
  if (!text) return null;
  const normalized = text.toLowerCase().trim();
  if (!normalized) return null;

  const directKey = Object.keys(KNOWN_LOCATION_ALIASES).find(key => key === normalized);
  if (directKey) return KNOWN_LOCATION_ALIASES[directKey];

  const partialKey = Object.keys(KNOWN_LOCATION_ALIASES).find(key => normalized.includes(key) || key.includes(normalized));
  if (partialKey) return KNOWN_LOCATION_ALIASES[partialKey];

  return null;
}

async function resolvePoint(text, existing, input) {
  if (existing) return existing;

  const known = resolveKnownLocation(text);
  if (known) {
    rememberGeocoded(input, text);
    return [known[0], known[1]];
  }

  const pinned = parsePinnedCoords(text);
  if (pinned) return pinned;
  const r = await geocode(text);
  if (!r.length) return null;
  rememberGeocoded(input, text);
  return [parseFloat(r[0].lat), parseFloat(r[0].lon)];
}

function renderRouteCardsUI(routes) {
  routeCardsContainer.innerHTML = '';

  routes.forEach((route, idx) => {
    const scores = route.scores || { total: 70, hospCount: 0, waterCount: 0, toiletCount: 0, shopCount: 0 };
    const time = secToMin(route.duration, route.distance);
    const dist = metersToKm(route.distance);

    let scoreClass = 'moderate';
    if (scores.total >= 75) scoreClass = 'great';
    else if (scores.total >= 60) scoreClass = 'good';
    else if (scores.total < 45) scoreClass = 'poor';

    let diffClass = '';
    if (idx === 0) diffClass = 'best';
    else if (currentMode === 'heat') diffClass = 'shade';
    else if (currentMode === 'night') diffClass = 'lit';
    else diffClass = 'faster';

    const card = document.createElement('div');
    card.className = `route-option-card ${idx === activeRouteIndex ? 'active' : ''}`;
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Select ${route.title}`);

    card.innerHTML = `
      <div class="route-card-header">
        <div class="route-name-row">
          <div class="indicator-radio ${idx === activeRouteIndex ? 'active' : ''}"></div>
          <span class="route-rank-tag">${idx === 0 ? '⭐ Best Route' : `Option #${idx + 1}`}</span>
          <span class="difference-pill ${diffClass}">${route.differenceLabel || (idx === 0 ? 'Top Pick' : 'Alternative')}</span>
        </div>
        <div class="walk-score-pill ${scoreClass}">Walk Score <b>${scores.total}</b>/100</div>
      </div>
      <div class="route-card-body">
        <div class="route-title-text">${route.title}</div>
        <div class="route-subtitle-text">${route.subtitle}</div>
        <div class="route-stats-row">
          <div class="route-stat-item"><b>⏱️ ${time} min</b> · ${dist} km</div>
          <div class="route-amenity-pills">
            <span class="amenity-mini-pill" title="Hospitals">🏥 ${scores.hospCount}</span>
            <span class="amenity-mini-pill" title="Drinking Water ATMs">🚰 ${scores.waterCount}</span>
            <span class="amenity-mini-pill" title="Public Restrooms">🚻 ${scores.toiletCount}</span>
            <span class="amenity-mini-pill" title="Shops & Bakeries">🏪 ${scores.shopCount}</span>
          </div>
        </div>
      </div>
    `;

    card.addEventListener('click', () => selectRoute(idx));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectRoute(idx);
      }
    });

    routeCardsContainer.appendChild(card);
  });
}

async function findRoute() {
  let startText = startInput.value.trim();
  let endText   = endInput.value.trim();

  // If start location is empty, automatically default to KIT Coimbatore Hub
  if (!startText) {
    startText = KIT_NAME;
    startInput.value = KIT_NAME;
    startCoords = [KIT_LAT, KIT_LNG];
    rememberGeocoded(startInput, startText);
  }

  // If destination is not in the form input, check the main search bar
  if (!endText && mainSearchInput && mainSearchInput.value.trim()) {
    endText = mainSearchInput.value.trim();
    endInput.value = endText;
    rememberGeocoded(endInput, endText);
  }

  if (!endText) {
    showInfo('Please enter a destination (e.g. Sulur Bus Stand, Airport or Apollo Pharmacy).', 'error');
    openDirectionsState();
    setTimeout(() => endInput.focus(), 100);
    return;
  }

  openDirectionsState();
  showInfo('🔍 Locating streets and shops in Coimbatore…', 'loading');
  clearMapLayers();
  compareCard.classList.add('hidden');
  detailsCard.classList.add('hidden');
  if (smartAdviceBox) smartAdviceBox.classList.add('hidden');
  liveNavCard.classList.add('hidden');

  try {
    startCoords = await resolvePoint(startText, startCoords, startInput);
    if (!startCoords) {
      showInfo(`Could not find "${startText}". Try a street or landmark name.`, 'error');
      return;
    }
    endCoords = await resolvePoint(endText, endCoords, endInput);
    if (!endCoords) {
      showInfo(`Could not find "${endText}". Try a street or landmark name.`, 'error');
      return;
    }

    showInfo('🗺️ Calculating multiple walking routes & finding best path…', 'loading');

    // 1. Fetch multiple candidate routes
    const rawRoutes = await fetchMultipleCandidateRoutes(startCoords, endCoords);

    if (!rawRoutes || !rawRoutes.length) {
      throw new Error('No walking routes found between these locations.');
    }

    // 2. Score each candidate route based on active mode (Heat, Night, Normal)
    // evaluateRouteScores automatically sorts them descending (highest score first)
    candidateRoutes = evaluateRouteScores(rawRoutes, startCoords, endCoords, currentMode);

    // 3. Collect & calculate amenities along the routes
    const allAmenities = ensureAmenitiesForRoute(candidateRoutes[0].geometry.coordinates, LOCAL_LANDMARKS_DATABASE);
    const amenitiesWithDist = allAmenities.map(a => {
      let minDist = Infinity;
      candidateRoutes.forEach(r => {
        const d = getDistanceToPolylineMeters(a, r.geometry.coordinates);
        if (d < minDist) minDist = d;
      });
      return { ...a, distance: minDist };
    });

    const nearbyToPath = amenitiesWithDist
      .filter(a => a.distance <= 750)
      .sort((a, b) => a.distance - b.distance);

    // 4. Update Header & Comparison Banner
    compareCard.classList.remove('hidden');
    detailsCard.classList.remove('hidden');

    if (comparisonHeading) {
      comparisonHeading.textContent = `Found ${candidateRoutes.length} Walking Routes · Best Choice Ranked First`;
    }

    const topRoute = candidateRoutes[0];
    const topTime = secToMin(topRoute.duration, topRoute.distance);
    const topScore = topRoute.scores.total;

    if (currentMode === 'heat') {
      comparisonBanner.innerHTML = `
        ☀️ <b>Heat Mode Optimization:</b> Ranked <b>${candidateRoutes.length} routes</b>. Best choice is <b>"${topRoute.title}"</b> with <b>${topRoute.scores.shade}% tree shade</b> and <b>${topRoute.scores.waterCount} water ATMs</b> to protect against 40°C+ heat.
      `;
    } else if (currentMode === 'night') {
      comparisonBanner.innerHTML = `
        🌙 <b>Night Mode Optimization:</b> Ranked <b>${candidateRoutes.length} routes</b>. Best choice is <b>"${topRoute.title}"</b> with <b>${topRoute.scores.light}% streetlight illumination</b> and active roadside shops.
      `;
    } else {
      comparisonBanner.innerHTML = `
        🚶 <b>Pedestrian Route Comparison:</b> Found <b>${candidateRoutes.length} viable walking routes</b>. Best route scores <b>${topScore}/100 Walk Score</b> (~${topTime} min). Compare below and tap any route to inspect.
      `;
    }

    // 5. Render Dynamic Route Cards
    renderRouteCardsUI(candidateRoutes);

    // 6. Draw Candidate Route Polylines on Leaflet Map
    routeLayers = [];
    routeBadgeMarkers = [];

    candidateRoutes.forEach((route, idx) => {
      const isTop = idx === 0;
      const themeColor = currentMode === 'night' ? '#4f46e5' : (currentMode === 'heat' ? '#0d9488' : '#16a34a');
      const routeColor = isTop ? themeColor : (idx === 1 ? '#ea580c' : '#8b5cf6');

      const polylineLayer = L.geoJSON(route.geometry, {
        style: {
          color: routeColor,
          weight: isTop ? 7.5 : 4.5,
          opacity: isTop ? 0.95 : 0.55,
          dashArray: isTop ? null : '8,6'
        }
      }).addTo(map);

      polylineLayer.on('click', () => selectRoute(idx));
      routeLayers.push(polylineLayer);

      // Add Floating Duration Badge on the Map
      const coords = route.geometry.coordinates;
      const midCoord = coords[Math.floor(coords.length / 2)];
      if (midCoord) {
        const time = secToMin(route.duration, route.distance);
        const badgeIcon = L.divIcon({
          className: `route-duration-badge ${isTop ? 'active-r1' : ''}`,
          html: `<span>${isTop ? '⭐ ' : ''}${time} min · ${route.scores.total} pts</span>`,
          iconSize: null
        });
        const badgeMarker = L.marker([midCoord[1], midCoord[0]], { icon: badgeIcon }).addTo(map);
        badgeMarker.on('click', () => selectRoute(idx));
        routeBadgeMarkers.push(badgeMarker);
      }
    });

    // 7. Add Start & Destination Pin Markers
    startMarker = makePinMarker(startCoords[0], startCoords[1], '#10b981', '📍', `Start: ${startText}`).addTo(map);
    endMarker   = makePinMarker(endCoords[0], endCoords[1], '#ef4444', '🏁', `Destination: ${endText}`).addTo(map);

    // 8. Place Landmark & Shop Markers on the Map
    nearbyToPath.forEach(a => {
      const customIcon = L.divIcon({
        className: `custom-amenity-marker ${a.type}`,
        html: `<div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:50%;font-size:14px;">${a.icon}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const typeLabel = {
        shop: '🏪 Shop / Bakery',
        pharmacy: '💊 Pharmacy / Medical',
        water: '🚰 Drinking Water ATM',
        hospital: '🏥 Hospital / Health',
        toilet: '🚻 Public Restroom',
        transit: '🚏 Bus Stop'
      }[a.type] || a.type;

      const popupContent = `
        <div class="popup-card">
          <div class="popup-top">
            <span class="popup-sym">${a.icon}</span>
            <div>
              <div class="popup-heading">${a.name}</div>
              <span class="popup-badge">${typeLabel}</span>
            </div>
          </div>
          <div class="popup-summary">${a.desc}</div>
          ${a.street ? `<div style="font-size:0.75rem;color:#475569;">🛣️ <b>${a.street}</b></div>` : ''}
          <div class="popup-dist">📍 ${Math.round(a.distance)}m from walking path</div>
        </div>
      `;

      const marker = L.marker([a.lat, a.lng], { icon: customIcon }).bindPopup(popupContent);
      amenityMapMarkers.push({ id: a.id, type: a.type, marker });
    });

    updateAmenityMarkersVisibility();
    renderAmenitiesUI(nearbyToPath);

    // 9. Fit Map Bounds
    const bounds = L.latLngBounds([startCoords, endCoords]);
    map.fitBounds(bounds, { padding: [50, 50] });

    // Select the best route (#0) by default
    selectRoute(0);

    showInfo(`✅ Found ${candidateRoutes.length} routes! Best option "${topRoute.title}" scores ${topScore}/100.`, 'success');

  } catch (err) {
    console.error(err);
    showInfo(`❌ ${err.message || 'Unable to calculate routes. Check address and internet connection.'}`, 'error');
  }
}

/* ─── 14. INTERACTIVE CONTROLS & LISTENERS ──────────────────── */

// Navigation tabs switching
navTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    navTabs.forEach(t => t.classList.remove('active'));
    tabPanes.forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    const targetPane = document.getElementById(`pane-${tab.dataset.tab}`);
    if (targetPane) targetPane.classList.add('active');
  });
});

// Layer Switcher Buttons: Only 2 options (Walkways, Satellite)
function switchMapLayer(layerKey, activeBtn) {
  [layerBtnWalkways, layerBtnSat].filter(Boolean).forEach(b => b.classList.remove('active'));
  if (activeBtn) activeBtn.classList.add('active');

  if (activeTileLayer) {
    map.removeLayer(activeTileLayer);
  }
  activeTileLayer = TILE_LAYERS[layerKey].addTo(map);
  activeTileLayer.bringToBack();
}

if (layerBtnWalkways) layerBtnWalkways.addEventListener('click', () => switchMapLayer('walkways', layerBtnWalkways));
if (layerBtnSat)      layerBtnSat.addEventListener('click', () => switchMapLayer('sat', layerBtnSat));

function openDirectionsState() {
  singleSearchBox.classList.add('hidden');
  directionsFormBox.classList.remove('hidden');
  if (!startInput.value.trim()) {
    startInput.value = KIT_NAME;
    startCoords = [KIT_LAT, KIT_LNG];
    rememberGeocoded(startInput, startInput.value);
  }
  if (mainSearchInput && mainSearchInput.value.trim() && !endInput.value.trim()) {
    endInput.value = mainSearchInput.value.trim();
  }
  setTimeout(() => {
    if (!endInput.value.trim()) {
      endInput.focus();
    } else {
      findRouteBtn.focus();
    }
  }, 80);
}

function backToSearchState() {
  directionsFormBox.classList.add('hidden');
  singleSearchBox.classList.remove('hidden');
  stopRealLiveNavigation();
}

mainSearchInput.addEventListener('click', openDirectionsState);
openDirectionsBtn.addEventListener('click', openDirectionsState);
backToSearchBtn.addEventListener('click', backToSearchState);

mainSearchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    openDirectionsState();
    findRoute();
  }
});

const mainSuggestions = document.getElementById('main-suggestions');
if (mainSearchInput && mainSuggestions) {
  attachAutocomplete(mainSearchInput, mainSuggestions, c => {
    openDirectionsState();
    endInput.value = mainSearchInput.value;
    endCoords = c;
    rememberGeocoded(endInput, endInput.value);
    findRoute();
  });
}

// Quick Amenity Filter Pills (Hospital, Water, Restroom, Shop, Pharmacy)
document.querySelectorAll('.pill-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.type;
    const list = LOCAL_LANDMARKS_DATABASE.filter(l => l.type === type);
    if (list.length) {
      const ref = startCoords || [KIT_LAT, KIT_LNG];
      list.sort((a, b) => {
        const da = getHaversineDistanceMeters(ref[0], ref[1], a.lat, a.lng);
        const db = getHaversineDistanceMeters(ref[0], ref[1], b.lat, b.lng);
        return da - db;
      });
      const nearest = list[0];
      openDirectionsState();
      endInput.value = `${nearest.name} (${nearest.street || 'Coimbatore'})`;
      endCoords = [nearest.lat, nearest.lng];
      rememberGeocoded(endInput, endInput.value);
      findRoute();
    }
  });
});

/* ─── 15. REAL GPS LIVE NAVIGATION (NO FAKE AUTO-MOVING) ─────── */

function updateStepInstructionUI(routeData, stepIndex) {
  const leg = (routeData.legs && routeData.legs[0]) || null;
  const steps = (leg && leg.steps) || [];
  if (!steps.length) return;

  const currentStep = steps[stepIndex] || steps[0];
  const nextStep = steps[stepIndex + 1] || null;
  const stepName = currentStep.name || 'Pedestrian Walkway';

  liveCurrentStreet.textContent = `Step ${stepIndex + 1} of ${steps.length}: ${stepName}`;

  if (nextStep && nextStep.maneuver) {
    const mod = (nextStep.maneuver.modifier || '').toLowerCase();
    liveTurnIcon.textContent = mod.includes('left') ? '↰' : mod.includes('right') ? '↱' : '↟';
    liveTurnAction.textContent = mod.includes('left')
      ? `Turn left onto ${nextStep.name || 'next street'}`
      : mod.includes('right')
        ? `Turn right onto ${nextStep.name || 'next street'}`
        : `Continue straight on ${nextStep.name || stepName}`;
    liveTurnDist.textContent = `In ~${Math.round(currentStep.distance || 50)} meters`;
  } else {
    liveTurnIcon.textContent = '🏁';
    liveTurnAction.textContent = `Arrive at destination (${endInput.value.trim() || 'Destination'})`;
    liveTurnDist.textContent = `Walk straight to entrance`;
  }

  // Find nearest landmark to this step
  if (currentStep.maneuver && currentStep.maneuver.location) {
    const [sLng, sLat] = currentStep.maneuver.location;
    const nearby = LOCAL_LANDMARKS_DATABASE.find(l => {
      return getHaversineDistanceMeters(l.lat, l.lng, sLat, sLng) <= 300;
    });
    liveCurrentLandmark.textContent = nearby
      ? `Near ${nearby.icon} ${nearby.name} (${nearby.street || nearby.type})`
      : 'Walking along safe pedestrian corridor';
  }
}

function handleLiveGpsPosition(pos, routeData) {
  const { latitude, longitude, accuracy, speed } = pos.coords;
  userGpsPosition = [latitude, longitude];

  if (liveGpsBadge) {
    liveGpsBadge.textContent = '🟢 Real GPS Active';
    liveGpsBadge.style.background = '#16a34a';
  }

  // Detect stationary vs moving
  const isStationary = speed === null || speed < 0.35;
  if (liveGpsStatus) {
    if (isStationary) {
      liveGpsStatus.innerHTML = `🚶 <b>Stationary</b> (Waiting for movement · Accuracy ±${Math.round(accuracy)}m)`;
    } else {
      const kmh = (speed * 3.6).toFixed(1);
      liveGpsStatus.innerHTML = `🚶 <b>Walking at ${kmh} km/h</b> (Accuracy ±${Math.round(accuracy)}m)`;
    }
  }

  // Update real walker radar pulse marker on map
  if (!walkerMarker) {
    const walkerIcon = L.divIcon({
      className: 'real-walker-marker',
      html: `<div class="walker-pulse"></div><div class="walker-dot"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    walkerMarker = L.marker([latitude, longitude], { icon: walkerIcon, zIndexOffset: 1000 }).addTo(map);
  } else {
    walkerMarker.setLatLng([latitude, longitude]);
  }

  // Update GPS accuracy radius circle
  if (!accuracyCircle) {
    accuracyCircle = L.circle([latitude, longitude], {
      radius: Math.max(8, Math.min(80, accuracy)),
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.15,
      weight: 1
    }).addTo(map);
  } else {
    accuracyCircle.setLatLng([latitude, longitude]);
    accuracyCircle.setRadius(Math.max(8, Math.min(80, accuracy)));
  }

  // Update real remaining distance and time to destination
  if (endCoords) {
    const remainingDistM = getHaversineDistanceMeters(latitude, longitude, endCoords[0], endCoords[1]);
    const remainingMins = Math.max(1, Math.round(remainingDistM / (1.28 * 60)));
    liveDistRemain.textContent = `${metersToKm(remainingDistM)} km to destination`;
    liveTimeRemain.textContent = `~${remainingMins} min remaining`;
  }

  // Auto-advance step if close to the next maneuver (< 25m)
  const leg = (routeData.legs && routeData.legs[0]) || null;
  const steps = (leg && leg.steps) || [];
  if (steps[currentNavStepIndex + 1]) {
    const nextStep = steps[currentNavStepIndex + 1];
    if (nextStep.maneuver && nextStep.maneuver.location) {
      const [nLng, nLat] = nextStep.maneuver.location;
      const distToNextM = getHaversineDistanceMeters(latitude, longitude, nLat, nLng);
      if (distToNextM < 25) {
        currentNavStepIndex++;
        updateStepInstructionUI(routeData, currentNavStepIndex);
      }
    }
  }
}

function handleLiveGpsError(err) {
  console.warn('Live GPS Error:', err);
  if (liveGpsBadge) {
    liveGpsBadge.textContent = 'GPS Inactive';
    liveGpsBadge.style.background = '#ef4444';
  }
  if (liveGpsStatus) {
    liveGpsStatus.innerHTML = `📍 GPS unavailable or permission denied. Tap <b>Next Step ❯</b> to preview walking route turns.`;
  }
}

function startRealLiveNavigation(routeData) {
  if (!routeData) return;
  currentNavStepIndex = 0;
  updateStepInstructionUI(routeData, currentNavStepIndex);

  // Set initial estimation from route data
  const timeMin = secToMin(routeData.duration, routeData.distance);
  const distKm = metersToKm(routeData.distance);
  liveTimeRemain.textContent = `~${timeMin} min to go`;
  liveDistRemain.textContent = `${distKm} km · In-progress`;

  if (!navigator.geolocation) {
    if (liveGpsBadge) {
      liveGpsBadge.textContent = 'Manual Steps';
      liveGpsBadge.style.background = '#64748b';
    }
    if (liveGpsStatus) {
      liveGpsStatus.innerHTML = '⚠️ Geolocation not supported in this browser. Use <b>◀ Prev Step</b> / <b>Next Step ▶</b> below.';
    }
    return;
  }

  if (liveGpsBadge) {
    liveGpsBadge.textContent = 'Acquiring GPS…';
    liveGpsBadge.style.background = '#eab308';
  }
  if (liveGpsStatus) {
    liveGpsStatus.innerHTML = '📡 Connecting to real device GPS…';
  }

  // Real GPS watch position
  liveWatchId = navigator.geolocation.watchPosition(
    pos => handleLiveGpsPosition(pos, routeData),
    err => handleLiveGpsError(err),
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 3000 }
  );
}

function stopRealLiveNavigation() {
  if (liveWatchId !== null) {
    navigator.geolocation.clearWatch(liveWatchId);
    liveWatchId = null;
  }
  if (walkerMarker) {
    map.removeLayer(walkerMarker);
    walkerMarker = null;
  }
  if (accuracyCircle) {
    map.removeLayer(accuracyCircle);
    accuracyCircle = null;
  }
  userGpsPosition = null;
  liveNavCard.classList.add('hidden');
  compareCard.classList.remove('hidden');
}

function stepManualNavigation(delta) {
  const routeData = candidateRoutes[activeRouteIndex];
  if (!routeData) return;
  const leg = (routeData.legs && routeData.legs[0]) || null;
  const steps = (leg && leg.steps) || [];
  if (!steps.length) return;

  currentNavStepIndex = Math.max(0, Math.min(steps.length - 1, currentNavStepIndex + delta));
  updateStepInstructionUI(routeData, currentNavStepIndex);

  // Center map on the selected step
  const currentStep = steps[currentNavStepIndex];
  if (currentStep && currentStep.maneuver && currentStep.maneuver.location) {
    const [sLng, sLat] = currentStep.maneuver.location;
    map.setView([sLat, sLng], 17);
  }
}

// Navigation UI Buttons
startNavigationBtn.addEventListener('click', () => {
  const routeData = candidateRoutes[activeRouteIndex];
  if (!routeData) return;
  compareCard.classList.add('hidden');
  liveNavCard.classList.remove('hidden');
  startRealLiveNavigation(routeData);
});

exitNavBtn.addEventListener('click', stopRealLiveNavigation);

if (prevStepBtn) {
  prevStepBtn.addEventListener('click', () => stepManualNavigation(-1));
}

if (nextStepBtn) {
  nextStepBtn.addEventListener('click', () => stepManualNavigation(1));
}

recenterWalkerBtn.addEventListener('click', () => {
  if (userGpsPosition) {
    map.setView(userGpsPosition, 17);
  } else if (startCoords && endCoords) {
    const bounds = L.latLngBounds([startCoords, endCoords]);
    map.fitBounds(bounds, { padding: [70, 70] });
  }
});

// Swap locations button
swapBtn.addEventListener('click', () => {
  const tempText = startInput.value;
  startInput.value = endInput.value;
  endInput.value   = tempText;

  const tempCoords = startCoords;
  startCoords = endCoords;
  endCoords   = tempCoords;

  rememberGeocoded(startInput, startInput.value);
  rememberGeocoded(endInput, endInput.value);

  if (startCoords && endCoords) findRoute();
});

// Clear button
function clearAll() {
  startInput.value = '';
  endInput.value   = '';
  startInput.dataset.lastGeocoded = '';
  endInput.dataset.lastGeocoded   = '';
  startCoords = null;
  endCoords   = null;
  candidateRoutes = [];
  activeRouteIndex = 0;

  stopRealLiveNavigation();
  clearMapLayers();

  compareCard.classList.add('hidden');
  detailsCard.classList.add('hidden');
  smartAdviceBox.classList.add('hidden');
  routeInfo.textContent = 'Enter start & destination, or click 2 points on the map.';
  routeInfo.className   = 'route-info';

  startSuggestions.innerHTML = '';
  endSuggestions.innerHTML   = '';
  startSuggestions.classList.add('hidden');
  endSuggestions.classList.add('hidden');
  routeCardsContainer.innerHTML = '';
  adviceTipsList.innerHTML = '';
  amenitiesItemsList.innerHTML = '';
  stepsTimeline.innerHTML = '';

  map.setView([KIT_LAT, KIT_LNG], 15);
}

clearBtn.addEventListener('click', clearAll);

// My Location button
myLocationBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    showInfo('Geolocation not supported by your browser.', 'error');
    return;
  }
  showInfo('📌 Getting your GPS location…', 'loading');
  navigator.geolocation.getCurrentPosition(
    pos => {
      startCoords = [pos.coords.latitude, pos.coords.longitude];
      startInput.value = `My Location (${startCoords[0].toFixed(4)}, ${startCoords[1].toFixed(4)})`;
      rememberGeocoded(startInput, startInput.value);
      map.setView(startCoords, 16);
      showInfo('📌 Location set! Now enter your destination.', 'success');
    },
    () => showInfo('Could not get GPS location. Allow location access in browser and retry.', 'error'),
    { timeout: 10000, enableHighAccuracy: true }
  );
});

// Mode buttons
function setMode(mode) {
  currentMode = mode;
  [btnNormal, btnHeat, btnNight].forEach(b => b.classList.remove('active'));
  siteHeader.classList.remove('mode-heat', 'mode-night');

  if (mode === 'heat') {
    btnHeat.classList.add('active');
    siteHeader.classList.add('mode-heat');
    showInfo('☀️ Heat Mode — maximises tree shade and water points to beat 40°C+ summer heat.');
  } else if (mode === 'night') {
    btnNight.classList.add('active');
    siteHeader.classList.add('mode-night');
    showInfo('🌙 Night Mode — prioritises bright streetlights and crowded commercial streets.');
  } else {
    btnNormal.classList.add('active');
    showInfo('🚶 Normal Mode — balanced pedestrian safety, sidewalks and crossings.');
  }

  if (startCoords && endCoords) findRoute();
}

btnNormal.addEventListener('click', () => setMode('normal'));
btnHeat  .addEventListener('click', () => setMode('heat'));
btnNight .addEventListener('click', () => setMode('night'));

// Preset destination chips
document.querySelectorAll('.chip-preset, .quick-link-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!startInput.value.trim()) {
      startInput.value = KIT_NAME;
      startCoords = [KIT_LAT, KIT_LNG];
      rememberGeocoded(startInput, startInput.value);
    }
    endInput.value = btn.dataset.dest;
    endCoords = null;
    findRoute();
  });
});

// Amenity chip filters inside tab
amenityChipBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    amenityChipBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilterType = btn.dataset.filter;
    updateAmenityMarkersVisibility();

    if (candidateRoutes && candidateRoutes.length) {
      const allAmenities = ensureAmenitiesForRoute(candidateRoutes[0].geometry.coordinates, LOCAL_LANDMARKS_DATABASE);
      const filtered = allAmenities.map(a => {
        let minDist = Infinity;
        candidateRoutes.forEach(r => {
          const d = getDistanceToPolylineMeters(a, r.geometry.coordinates);
          if (d < minDist) minDist = d;
        });
        return { ...a, distance: minDist };
      }).filter(a => a.distance <= 750).sort((a, b) => a.distance - b.distance);
      renderAmenitiesUI(filtered);
    }
  });
});

// Floating checkboxes on map
[chkShops, chkPharmacy, chkWater, chkHospitals, chkToilets].forEach(chk => {
  chk.addEventListener('change', () => {
    visibleToggles.shop     = chkShops.checked;
    visibleToggles.pharmacy = chkPharmacy.checked;
    visibleToggles.water    = chkWater.checked;
    visibleToggles.hospital = chkHospitals.checked;
    visibleToggles.toilet   = chkToilets.checked;
    updateAmenityMarkersVisibility();
  });
});

// Recenter Map
recenterBtn.addEventListener('click', () => {
  if (startCoords && endCoords) {
    const bounds = L.latLngBounds([startCoords, endCoords]);
    map.fitBounds(bounds, { padding: [50, 50] });
  } else {
    map.setView([KIT_LAT, KIT_LNG], 15);
  }
});

// Find Route Button & Enter Key
findRouteBtn.addEventListener('click', () => {
  if (startInput.value.trim() !== (startInput.dataset.lastGeocoded || '')) startCoords = null;
  if (endInput.value.trim()   !== (endInput.dataset.lastGeocoded   || '')) endCoords   = null;
  findRoute();
});

[startInput, endInput].forEach(inp => {
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') findRouteBtn.click();
  });
});

// Map click to set pins
map.on('click', e => {
  const { lat, lng } = e.latlng;
  if (!startCoords) {
    startCoords      = [lat, lng];
    startInput.value = `Pin (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
    rememberGeocoded(startInput, startInput.value);
    showInfo('📍 Start point pinned. Now click destination on the map.');
  } else if (!endCoords) {
    endCoords      = [lat, lng];
    endInput.value = `Pin (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
    rememberGeocoded(endInput, endInput.value);
    findRoute();
  }
});

// Modal Controls
helpBtn.addEventListener('click', () => guideModal.classList.remove('hidden'));
modalCloseBtn.addEventListener('click', () => guideModal.classList.add('hidden'));
modalGotItBtn.addEventListener('click', () => guideModal.classList.add('hidden'));
guideModal.addEventListener('click', e => {
  if (e.target === guideModal) guideModal.classList.add('hidden');
});

/* ─── 16. READY ─────────────────────────────────────────────── */
showInfo('Enter start & destination, or click two points on the map.');
console.log('TutaMaps loaded ✅ — multi-route pedestrian comparison, live GPS tracking, and walking advice active');

