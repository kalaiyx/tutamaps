
function getAmenitySvg(type) {
  switch (type) {
    case 'hospital':
      return '<svg viewBox="0 0 24 24" width="13" height="13" stroke="#fff" fill="none" stroke-width="2.8" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
    case 'water':
      return '<svg viewBox="0 0 24 24" width="13" height="13" fill="#fff"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>';
    case 'pharmacy':
      return '<svg viewBox="0 0 24 24" width="13" height="13" stroke="#fff" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><line x1="12" y1="7" x2="12" y2="17"/><line x1="7" y1="12" x2="17" y2="12"/></svg>';
    case 'shop':
      return '<svg viewBox="0 0 24 24" width="13" height="13" stroke="#fff" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>';
    case 'toilet':
      return '<svg viewBox="0 0 24 24" width="13" height="13" fill="#fff"><circle cx="12" cy="5" r="2.2"/><path d="M7 9h10v3h-2v8h-3v-6h-2v6H7v-8H5V9z"/></svg>';
    default:
      return '<svg viewBox="0 0 24 24" width="13" height="13" fill="#fff"><circle cx="12" cy="12" r="4"/></svg>';
  }
}
/* ═══════════════════════════════════════════════════════════════
   TutaMaps — app.js (Google Maps Style Pedestrian Navigation)
   Real Small Streets · Local Shops & Pharmacies · Dual Route Comparison
   Live Solar Shade via SunCalc · Live Weather via Open-Meteo
   Team Quantuxx · KIT Coimbatore
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── 1. CONSTANTS ──────────────────────────────────────────── */

// KIT Coimbatore campus (Kannampalayam) — OSM / college disclosure point
// 10°59'57"N 77°05'03"E on Pappampatti Road. The old pin (11.055, 77.133) sat ~7 km away.
const KIT_LAT  = 10.99931;
const KIT_LNG  = 77.08428;
const KIT_NAME = 'KIT - Kalaignarkarunanidhi Institute of Technology, Kannampalayam, Coimbatore';

// Sulur Government Hospital, Trichy Road (OSM)
const SULUR_HOSP_LAT = 11.02475;
const SULUR_HOSP_LNG = 77.12286;
const SULUR_HOSP_NAME = 'Sulur Government Hospital, Sulur, Coimbatore';

const SULUR_BUS_LAT = 11.02594;
const SULUR_BUS_LNG = 77.12522;

const PHOTON = 'https://photon.komoot.io/api/';
const NOMINATIM = 'https://nominatim.openstreetmap.org';
const OSRM_ENDPOINTS = [
  'https://routing.openstreetmap.de/routed-foot/route/v1/foot',
];

const WEIGHTS = {
  normal: { shade: 0.25, light: 0.25, crowd: 0.25, safety: 0.25 },
  heat:   { shade: 0.45, light: 0.15, crowd: 0.20, safety: 0.20 },
  night:  { shade: 0.10, light: 0.45, crowd: 0.30, safety: 0.15 },
};

// Walker profile walking speeds in meters/second
const WALKER_SPEEDS = {
  normal:     1.25, // 4.5 km/h
  elderly:    0.85, // 3.0 km/h (gentle pace, senior walkers)
  kids:       1.00, // 3.6 km/h (strollers, young children)
  wheelchair: 1.10, // 4.0 km/h (accessible curb cuts)
};

const KNOWN_LOCATION_ALIASES = {
  'kit': [KIT_LAT, KIT_LNG],
  'kit college': [KIT_LAT, KIT_LNG],
  'kit college gate': [KIT_LAT, KIT_LNG],
  'kit campus': [KIT_LAT, KIT_LNG],
  'kit coimbatore': [KIT_LAT, KIT_LNG],
  'kalaignarkarunanidhi institute of technology': [KIT_LAT, KIT_LNG],
  'sulur': [SULUR_BUS_LAT, SULUR_BUS_LNG],
  'sulur bus stand': [SULUR_BUS_LAT, SULUR_BUS_LNG],
  'sulur old bus stand': [SULUR_BUS_LAT, SULUR_BUS_LNG],
  'sulur bus stop': [SULUR_BUS_LAT, SULUR_BUS_LNG],
  'sulur lake': [11.02867, 77.11442],
  'sulur government hospital': [SULUR_HOSP_LAT, SULUR_HOSP_LNG],
  'government hospital sulur': [SULUR_HOSP_LAT, SULUR_HOSP_LNG],
  'sulur hospital': [SULUR_HOSP_LAT, SULUR_HOSP_LNG],
  'kannampalayam': [10.99509, 77.09846],
  'kannampalayam pirivu': [10.99509, 77.09846],
  'apollo pharmacy': [11.02540, 77.12410],
  'apollo pharmacy sulur': [11.02540, 77.12410],
  'kr bakes': [11.02630, 77.12460],
  'kr bakes and sweets': [11.02630, 77.12460],
  'coimbatore airport': [11.03291, 77.04270],
  'airport peelamedu': [11.03291, 77.04270],
  'airport': [11.03291, 77.04270],
  'fun republic mall': [11.02435, 77.01066],
  'fun mall': [11.02435, 77.01066],
  'singanallur bus stand': [11.00228, 77.02914],
  'singanallur': [11.00228, 77.02914],
  'ondipudur': [11.00397, 77.04930],
  'peelamedu': [11.02778, 76.99862],
  'gandhipuram': [11.01827, 76.96777],
  'coimbatore railway junction': [10.99757, 76.96637],
  'railway station': [10.99757, 76.96637],
  'psg hospital': [11.01875, 77.00701],
  'psg hospitals': [11.01875, 77.00701],
  'kmch': [11.04041, 77.04088],
  'my location': null,
};

/* ─── 2. LOCAL SHOPS, SMALL STREETS & ESSENTIAL FACILITIES ─── */
const LOCAL_LANDMARKS_DATABASE = [
  // 🏪 LOCAL SHOPS, BAKERIES & TEA STALLS
  { id: 's1', name: 'KR Bakes & Sweets, Trichy Road, Sulur', type: 'shop', lat: 11.02630, lng: 77.12460, desc: 'Bakery and snacks on Trichy Road beside Sulur bus stand.', icon: '🏪', street: 'Trichy Road' },
  { id: 's2', name: 'Aavin Milk Parlour, KIT Gate', type: 'shop', lat: 10.99905, lng: 77.08470, desc: 'Milk booth and cold drinks at the campus approach on Pappampatti Road.', icon: '🏪', street: 'Pappampatti Road' },
  { id: 's3', name: 'Sri Annapoorna Sweet Stall & Bakery, Sulur', type: 'shop', lat: 11.02570, lng: 77.12500, desc: 'Vegetarian bakery and tea stall along the Sulur bus stand road.', icon: '🏪', street: 'Trichy Road' },
  { id: 's4', name: 'Tea Time & Snacks Corner, Kannampalayam', type: 'shop', lat: 10.99540, lng: 77.09810, desc: 'Tea stall and cold drinks at Kannampalayam junction.', icon: '🏪', street: 'Kannampalayam Road' },
  { id: 's5', name: 'Kannan Departmental Store, Sulur', type: 'shop', lat: 11.02520, lng: 77.12550, desc: 'Groceries, snacks and bottled drinks near Sulur bus stand.', icon: '🏪', street: 'Trichy Road' },
  { id: 's6', name: 'Tender Coconut Stall, KIT Approach', type: 'shop', lat: 10.99880, lng: 77.08490, desc: 'Tender coconut and juice stall on the road outside KIT gate.', icon: '🏪', street: 'Pappampatti Road' },
  { id: 's7', name: 'Nilgiris Supermarket, Singanallur', type: 'shop', lat: 11.00280, lng: 77.02870, desc: 'Supermarket with bakery and cold drinks near Singanallur bus stand.', icon: '🏪', street: 'Kamarajar Road' },
  { id: 's8', name: 'Shanthi Social Services Canteen, Ondipudur', type: 'shop', lat: 11.00440, lng: 77.04880, desc: 'Budget canteen and drinking water on Trichy Road, Ondipudur.', icon: '🏪', street: 'Trichy Road' },

  // 💊 PHARMACIES & MEDICAL STORES
  { id: 'p1', name: 'Apollo Pharmacy, Trichy Road, Sulur', type: 'pharmacy', lat: 11.02540, lng: 77.12410, desc: 'Pharmacy with first-aid, emergency medicines and electrolytes near Sulur bus stand.', icon: '💊', street: 'Trichy Road' },
  { id: 'p2', name: 'MedPlus Pharmacy, Kannampalayam', type: 'pharmacy', lat: 10.99520, lng: 77.09880, desc: 'Prescription medicines, ORS and first-aid at Kannampalayam.', icon: '💊', street: 'Kannampalayam Road' },
  { id: 'p3', name: 'Jan Aushadhi Generic Medical Store, Sulur', type: 'pharmacy', lat: 11.02440, lng: 77.12340, desc: 'Government subsidized generic medical store beside Sulur GH.', icon: '💊', street: 'Trichy Road' },
  { id: 'p4', name: 'Thulasi Pharmacies, Singanallur', type: 'pharmacy', lat: 11.00190, lng: 77.02950, desc: 'Prescription pharmacy near Singanallur bus stand.', icon: '💊', street: 'Kamarajar Road' },
  { id: 'p5', name: 'KIT Campus Medical & First Aid Dispensary', type: 'pharmacy', lat: 10.99955, lng: 77.08395, desc: 'On-campus medicine station and first-aid supplies.', icon: '💊', street: 'KIT Campus' },

  // 🚏 BUS STOPS & TRANSIT
  { id: 'b1', name: 'KIT College Main Gate Bus Stop', type: 'transit', lat: 10.99895, lng: 77.08455, desc: 'Bus stop on Pappampatti Road at the KIT campus gate.', icon: '🚏', street: 'Pappampatti Road' },
  { id: 'b2', name: 'Kannampalayam Junction Bus Stop', type: 'transit', lat: 10.99509, lng: 77.09846, desc: 'Town bus stop connecting Kannampalayam, Sulur and Singanallur.', icon: '🚏', street: 'Kannampalayam Road' },
  { id: 'b3', name: 'Sulur Bus Stand', type: 'transit', lat: SULUR_BUS_LAT, lng: SULUR_BUS_LNG, desc: 'Sulur bus stand on Trichy Road, with waiting shelters.', icon: '🚏', street: 'Trichy Road' },
  { id: 'b4', name: 'Neelambur Bypass Bus Stop', type: 'transit', lat: 11.05840, lng: 77.09010, desc: 'Bus shelter on the Coimbatore bypass near Royal Care.', icon: '🚏', street: 'Coimbatore Bypass' },

  // 🏥 HOSPITALS & HEALTH CENTRES
  { id: 'h1', name: 'KIT Student Health & Emergency Centre', type: 'hospital', lat: 10.99960, lng: 77.08380, desc: 'On-campus emergency medical room and first aid.', icon: '🏥', street: 'KIT Campus' },
  { id: 'h2', name: 'Kannampalayam Primary Health Centre (PHC)', type: 'hospital', lat: 10.99480, lng: 77.09820, desc: 'Government PHC for Kannampalayam.', icon: '🏥', street: 'Kannampalayam Road' },
  { id: 'h3', name: 'Sulur Government Taluk Hospital', type: 'hospital', lat: SULUR_HOSP_LAT, lng: SULUR_HOSP_LNG, desc: 'Government hospital on Trichy Road, Sulur, with emergency care.', icon: '🏥', street: 'Trichy Road' },
  { id: 'h4', name: 'Royal Care Super Speciality Hospital, Neelambur', type: 'hospital', lat: 11.05904, lng: 77.08974, desc: 'Multi-speciality hospital on the Coimbatore bypass, Neelambur.', icon: '🏥', street: 'Coimbatore Bypass' },
  { id: 'h5', name: 'Kovai Medical Center & Hospital (KMCH)', type: 'hospital', lat: 11.04041, lng: 77.04088, desc: '24/7 trauma hospital on Avinashi Road.', icon: '🏥', street: 'Avinashi Road' },
  { id: 'h6', name: 'PSG Hospitals, Peelamedu', type: 'hospital', lat: 11.01875, lng: 77.00701, desc: 'Teaching hospital with 24/7 emergency medicine, Peelamedu.', icon: '🏥', street: 'Avinashi Road' },
  { id: 'h7', name: 'ESI Hospital, Singanallur', type: 'hospital', lat: 11.00928, lng: 77.02405, desc: 'ESI hospital on Kamarajar Road, Singanallur.', icon: '🏥', street: 'Kamarajar Road' },
  { id: 'h8', name: 'Coimbatore Medical College Hospital (CMCH)', type: 'hospital', lat: 10.99642, lng: 76.97020, desc: 'District general hospital on Trichy Road.', icon: '🏥', street: 'Trichy Road' },

  // 🚰 DRINKING WATER / WATER ATMS
  { id: 'w1', name: 'KIT Main Gate RO Drinking Water Kiosk', type: 'water', lat: 10.99915, lng: 77.08445, desc: 'RO drinking water at the KIT gate for students and pedestrians.', icon: '🚰', street: 'Pappampatti Road' },
  { id: 'w2', name: 'Kannampalayam Panchayat RO Water ATM', type: 'water', lat: 10.99530, lng: 77.09855, desc: 'Panchayat RO drinking water point at Kannampalayam.', icon: '🚰', street: 'Kannampalayam Road' },
  { id: 'w3', name: 'Trichy Road Public Water Station (Ondipudur)', type: 'water', lat: 11.00410, lng: 77.04910, desc: 'Municipal drinking water post at Ondipudur.', icon: '🚰', street: 'Trichy Road' },
  { id: 'w4', name: 'Sulur Bus Stand Free Water Cooler', type: 'water', lat: 11.02580, lng: 77.12505, desc: 'Drinking water at Sulur bus stand.', icon: '🚰', street: 'Trichy Road' },
  { id: 'w5', name: 'Singanallur Bus Terminal Water Cooler', type: 'water', lat: 11.00210, lng: 77.02920, desc: 'Drinking water at Singanallur bus stand.', icon: '🚰', street: 'Kamarajar Road' },
  { id: 'w6', name: 'Sulur Lake Promenade Water Point', type: 'water', lat: 11.02867, lng: 77.11442, desc: 'Water point on the Sulur lake walking side.', icon: '🚰', street: 'Sulur Lake' },

  // 🚻 PUBLIC TOILETS / RESTROOMS
  { id: 't1', name: 'KIT Visitor & Security Block Restrooms', type: 'toilet', lat: 10.99920, lng: 77.08410, desc: 'Campus visitor washrooms at the security block.', icon: '🚻', street: 'KIT Campus' },
  { id: 't2', name: 'Kannampalayam Community Restroom', type: 'toilet', lat: 10.99490, lng: 77.09870, desc: 'Public restroom at Kannampalayam.', icon: '🚻', street: 'Kannampalayam Road' },
  { id: 't3', name: 'Sulur Bus Stand Public Restroom', type: 'toilet', lat: 11.02605, lng: 77.12530, desc: 'Public toilet at Sulur bus stand.', icon: '🚻', street: 'Trichy Road' },
  { id: 't4', name: 'Sulur Lake Public Restroom', type: 'toilet', lat: 11.02840, lng: 77.11480, desc: 'Public restroom on the Sulur lake side.', icon: '🚻', street: 'Sulur Lake' },
  { id: 't5', name: 'Singanallur Bus Terminal Restrooms', type: 'toilet', lat: 11.00190, lng: 77.02900, desc: 'Restrooms at Singanallur bus stand.', icon: '🚻', street: 'Kamarajar Road' },
];

/* ─── 3. APPLICATION STATE ──────────────────────────────────── */
let currentMode          = 'normal'; // 'normal' | 'heat' | 'night'
let currentWalkerProfile = 'normal'; // 'normal' | 'elderly' | 'kids' | 'wheelchair'
let simulatedHour        = null;     // null = live real time, or integer 9, 12, 16, 20
let currentLang          = 'en';     // 'en' | 'ta'

let startCoords          = null;
let endCoords            = null;
let startMarker          = null;
let endMarker            = null;
let candidateRoutes      = [];       // Array of all evaluated candidate routes
let routeLayers          = [];       // Leaflet polyline layers on the map
let routeBadgeMarkers    = [];       // Leaflet floating duration badge markers
let activeRouteIndex     = 0;        // Index of currently selected route
let kitMarker            = null;
let suggestTimer         = null;

let amenityMapMarkers    = [];
let currentFilterType    = 'all';
let visibleToggles       = { shop: true, pharmacy: true, water: true, hospital: true, toilet: true };

// Active Base Tile Layer
let activeTileLayer      = null;

// Real GPS Live Navigation state
let liveWatchId          = null;
let walkerMarker         = null;
let accuracyCircle       = null;
let currentNavStepIndex  = 0;
let userGpsPosition      = null;

// Live Weather Cache
let liveWeather          = { temp: 30, feelsLike: 34, uv: 7.9, rain: 0 };

if (typeof L === 'undefined') {
  document.body.insertAdjacentHTML(
    'afterbegin',
    '<p style="padding:16px;background:#fee2e2;color:#b91c1c;font-family:sans-serif">Leaflet failed to load. Check your internet connection and reload.</p>'
  );
  throw new Error('Leaflet is not loaded');
}

/* ─── 4. MAP INITIALISATION (Walkways & Satellite) ───────────── */
const map = L.map('map', {
  zoomControl: true,
  maxZoom: 20
}).setView([KIT_LAT, KIT_LNG], 15);

const TILE_LAYERS = {
  walkways: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    subdomains: ['a', 'b', 'c'],
    attribution: '© OpenStreetMap contributors | TutaMaps',
  }),
  sat: L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['0', '1', '2', '3'],
    attribution: '© Google Maps | TutaMaps',
  }),
  satEsri: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: '© Esri | TutaMaps',
  })
};

activeTileLayer = TILE_LAYERS.walkways.addTo(map);

// KIT Coimbatore Campus Hub Marker
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
const siteHeader           = document.querySelector('.site-header');
const mainSearchInput      = document.getElementById('main-search-input');
const singleSearchBox      = document.getElementById('single-search-box');
const directionsFormBox    = document.getElementById('directions-form-box');
const openDirectionsBtn    = document.getElementById('open-directions-btn');
const backToSearchBtn      = document.getElementById('back-to-search-btn');
const clearBtn             = document.getElementById('clear-inputs-btn');
const startInput           = document.getElementById('start-input');
const endInput             = document.getElementById('end-input');
const startSuggestions     = document.getElementById('start-suggestions');
const endSuggestions       = document.getElementById('end-suggestions');
const findRouteBtn         = document.getElementById('find-route-btn');
const swapBtn              = document.getElementById('swap-btn');
const myLocationBtn        = document.getElementById('my-location-btn');
const routeInfo            = document.getElementById('route-info');

// Mode Buttons
const btnNormal            = document.getElementById('btn-normal');
const btnHeat              = document.getElementById('btn-heat');
const btnNight             = document.getElementById('btn-night');

// SOS
const sosBtn               = document.getElementById('sos-btn');
const sosModal             = document.getElementById('sos-modal');
const sosCloseBtn          = document.getElementById('sos-close-btn');
const whatsappShareBtn     = document.getElementById('whatsapp-share-btn');

// Proof Modal
const proofModal           = document.getElementById('proof-modal');
const openScoreProofBtn    = document.getElementById('open-score-proof-btn');
const proofCloseBtn        = document.getElementById('proof-close-btn');
const proofGotItBtn        = document.getElementById('proof-gotit-btn');

// Candidate Routes
const compareCard          = document.getElementById('compare-card');
const comparisonHeading    = document.getElementById('comparison-heading');
const routeCardsContainer  = document.getElementById('route-cards-container');
const comparisonBanner     = document.getElementById('comparison-banner');
const startNavigationBtn   = document.getElementById('start-navigation-btn');

// Route Summary Chips
const sumChipWater         = document.getElementById('sum-chip-water');
const sumChipPharmacy      = document.getElementById('sum-chip-pharmacy');
const sumChipHospital      = document.getElementById('sum-chip-hospital');
const sumChipShade         = document.getElementById('sum-chip-shade');

// Smart Advice
const smartAdviceBox       = document.getElementById('smart-advice-box');
const adviceTipsList       = document.getElementById('advice-tips-list');

// Live Nav elements
const liveNavCard          = document.getElementById('live-nav-card');
const exitNavBtn           = document.getElementById('exit-nav-btn');
const liveGpsBadge         = document.getElementById('live-gps-badge');
const liveGpsStatus        = document.getElementById('live-gps-status');
const liveTimeRemain       = document.getElementById('live-time-remain');
const liveDistRemain       = document.getElementById('live-dist-remain');
const liveCurrentStreet    = document.getElementById('live-current-street');
const liveCurrentLandmark  = document.getElementById('live-current-landmark');
const liveTurnDist         = document.getElementById('live-turn-dist');
const liveTurnAction       = document.getElementById('live-turn-action');
const liveTurnIcon         = document.getElementById('live-turn-icon');
const prevStepBtn          = document.getElementById('prev-step-btn');
const nextStepBtn          = document.getElementById('next-step-btn');
const recenterWalkerBtn    = document.getElementById('recenter-walker-btn');
const liveAdviceCard       = document.getElementById('live-advice-card');
const liveAdviceText       = document.getElementById('live-advice-text');

// Details Card & Tabs
const detailsCard          = document.getElementById('details-card');
const navTabs              = document.querySelectorAll('.nav-tab');
const tabPanes             = document.querySelectorAll('.tab-pane');
const stepsTimeline        = document.getElementById('steps-timeline');
const amenitiesItemsList   = document.getElementById('amenities-items-list');
const countAllBadge        = document.getElementById('count-all-badge');

// Score card elements
const scoreNumber          = document.getElementById('score-number');
const scoreLabel           = document.getElementById('score-label');
const scoreDesc            = document.getElementById('score-desc');
const routeStats           = document.getElementById('route-stats');

// Fun Stats
const statSteps            = document.getElementById('stat-steps');
const statCalories         = document.getElementById('stat-calories');
const statCo2              = document.getElementById('stat-co2');
const statFare             = document.getElementById('stat-fare');
const statWater            = document.getElementById('stat-water');
const statIncline          = document.getElementById('stat-incline');

// Voice Controls (Executive Light Theme)
const voiceNavBtn          = document.getElementById('voice-nav-btn');
const voiceIcon            = document.getElementById('voice-icon');

// Amenity chip filters inside tab
const amenityChipBtns      = document.querySelectorAll('.amenity-chip-btn');

// Floating controls on Map
const chkShops             = document.getElementById('chk-shops');
const chkPharmacy          = document.getElementById('chk-pharmacy');
const chkWater             = document.getElementById('chk-water');
const chkHospitals         = document.getElementById('chk-hospitals');
const chkToilets           = document.getElementById('chk-toilets');
const recenterBtn          = document.getElementById('recenter-btn');
const layerBtnWalkways     = document.getElementById('layer-btn-walkways');
const layerBtnSat          = document.getElementById('layer-btn-sat');

// Weather Chips
const headerWeatherChip    = document.getElementById('header-weather-chip');
const weatherText          = document.getElementById('weather-text');
const mapWeatherText       = document.getElementById('map-weather-text');

// Solar Simulator Elements (Removed from UI)

// Walker Profile Chips
const profileChips         = document.querySelectorAll('.profile-chip');

// Guide Modal
const helpBtn              = document.getElementById('help-btn');
const guideModal           = document.getElementById('guide-modal');
const modalCloseBtn        = document.getElementById('modal-close-btn');
const modalGotItBtn        = document.getElementById('modal-gotit-btn');
const toastContainer       = document.getElementById('toast-container');

/* ─── 6. HELPER FUNCTIONS & TOAST ───────────────────────────── */

function showToast(message) {
  if (!toastContainer) return;
  const toast = document.createElement('div');
  toast.className = 'app-toast';
  toast.innerHTML = `<span>🔔</span> <span>${message}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 350);
  }, 3200);
}

function metersToKm(m) { return (m / 1000).toFixed(2); }

function secToMin(s, dist) {
  const currentSpeed = WALKER_SPEEDS[currentWalkerProfile] || 1.25;
  if (dist) {
    return Math.max(1, Math.round(dist / (currentSpeed * 60)));
  }
  return Math.max(1, Math.round(s / 60));
}

function showInfo(msg, type = 'default') {
  if (!msg) {
    routeInfo.textContent = '';
    routeInfo.className   = 'route-info hidden';
    return;
  }
  routeInfo.textContent = msg;
  routeInfo.className   = 'route-info';
  if (type !== 'default') routeInfo.classList.add(type);
  routeInfo.classList.remove('hidden');
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

function getHaversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/* ─── 8. LIVE SUNCALC & TIME-OF-DAY SOLAR SHADE ENGINE ───────── */

function getActiveSimulatedDate() {
  const now = new Date();
  if (simulatedHour !== null) {
    const d = new Date(now);
    d.setHours(simulatedHour, 0, 0, 0);
    return d;
  }
  return now;
}

function computeLiveSolarMetrics() {
  if (typeof SunCalc === 'undefined') {
    return { altitude: 55, azimuth: 180, isDay: true, label: 'Midday' };
  }
  const date = getActiveSimulatedDate();
  const sunPos = SunCalc.getPosition(date, KIT_LAT, KIT_LNG);
  const altitudeDeg = sunPos.altitude * 180 / Math.PI;
  const azimuthDeg = (sunPos.azimuth * 180 / Math.PI + 180) % 360;
  const isDay = altitudeDeg > 0;

  let label = 'High Noon (Max Solar Heat)';
  if (altitudeDeg <= 0) label = 'Night (Streetlights Active)';
  else if (altitudeDeg < 25) label = 'Angled Sun (Long Shadows)';
  else if (altitudeDeg < 55) label = 'Moderate Sun';

  return {
    altitude: altitudeDeg,
    azimuth: azimuthDeg,
    isDay,
    label
  };
}

/* ─── 9. LIVE WEATHER & UV API (Open-Meteo Free API) ────────── */

async function fetchLiveWeather() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${KIT_LAT}&longitude=${KIT_LNG}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,uv_index&timezone=Asia%2FKolkata`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather API error');
    const data = await res.json();
    const curr = data.current || {};

    liveWeather = {
      temp: curr.temperature_2m || 30,
      feelsLike: curr.apparent_temperature || 34,
      uv: curr.uv_index || 7.8,
      rain: curr.precipitation || 0
    };

    const str = `Coimbatore ${liveWeather.temp}°C · UV ${liveWeather.uv}`;
    if (weatherText) weatherText.textContent = str;
    if (mapWeatherText) mapWeatherText.textContent = `${liveWeather.temp}°C · UV ${liveWeather.uv}`;

    // Auto-advise if extreme heat
    if (liveWeather.temp >= 32 || liveWeather.uv >= 7.0) {
      if (headerWeatherChip) {
        headerWeatherChip.title = `High Heat (${liveWeather.temp}°C, UV ${liveWeather.uv}). Heat Mode recommended!`;
      }
    }
  } catch (err) {
    console.warn('Open-Meteo weather fetch failed, using realistic Coimbatore fallback:', err);
    if (weatherText) weatherText.textContent = `Coimbatore 30°C · UV 7.9 (High)`;
  }
}

fetchLiveWeather();

/* ─── 10. WALKER PROFILE SELECTOR ───────────────────────────── */

profileChips.forEach(chip => {
  chip.addEventListener('click', () => {
    profileChips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentWalkerProfile = chip.dataset.profile;

    if (candidateRoutes && candidateRoutes.length) {
      renderRouteCardsUI(candidateRoutes);
      selectRoute(activeRouteIndex);
    }
    showToast(`Walker profile: ${chip.textContent.trim()}`);
  });
});

/* ─── 11. GEOCODING ENGINE (Local Shops + Photon + Nominatim) ── */

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
  const q = query.trim();
  const localMatches = searchLocalLandmarks(q);
  const fullQ = /coimbatore|sulur|kannampalayam|peelamedu|singanallur/i.test(q) ? q : `${q}, Coimbatore`;

  let remote = [];
  try {
    remote = await geocodePhoton(fullQ);
  } catch (err) {
    console.warn('Photon geocoding failed, trying Nominatim', err);
    try {
      remote = await geocodeNominatim(fullQ);
    } catch {
      remote = [];
    }
  }

  // A single local shop used to block the live geocoder, so "Sulur" snapped to the wrong pin.
  const seen = new Set();
  const merged = [];
  [...localMatches, ...remote].forEach(item => {
    const key = `${Number(item.lat).toFixed(4)},${Number(item.lon).toFixed(4)}`;
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(item);
  });
  return merged;
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

/* ─── 12. AMENITY GEOMETRY ENGINE ───────────────────────────── */

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

function ensureAmenitiesForRoute(_coords, baseAmenities) {
  // Only mapped places. Invented pins were landing off the real street and made the route look wrong.
  return Array.isArray(baseAmenities) ? baseAmenities : [];
}

/* ─── 13. OSRM MULTI-ROUTE PEDESTRIAN ROUTING ENGINE ──────────── */

function isDistinctRoute(existingRoutes, newRoute) {
  for (const r of existingRoutes) {
    const distDiff = Math.abs(r.distance - newRoute.distance);
    if (distDiff < 30) return false;
  }
  return true;
}

function generateFallbackCorridors(startLL, endLL) {
  const dLat = endLL[0] - startLL[0];
  const dLng = endLL[1] - startLL[1];
  const directM = Math.max(100, Math.round(getHaversineDistanceMeters(startLL[0], startLL[1], endLL[0], endLL[1]) * 1.15));

  const corridors = [
    { type: 'shade',  name: '🌳 Shaded Canopy Walkway', sub: 'via Tree-lined Pedestrian Way', factor: 1.0 },
    { type: 'lit',    name: '💡 Well-Lit Commercial Avenue', sub: 'via Commercial Footway & Open Shops', factor: 1.04 },
    { type: 'direct', name: '⚡ Direct Street Shortcut', sub: 'via Direct Pedestrian Street', factor: 1.0 }
  ];

  return corridors.map(c => {
    const dist = Math.round(directM * c.factor);
    const duration = Math.round(dist / 1.25);
    const coords = [];
    const stepsCount = 12;

    for (let i = 0; i <= stepsCount; i++) {
      const frac = i / stepsCount;
      coords.push([
        startLL[1] + dLng * frac,
        startLL[0] + dLat * frac
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
          { name: 'Start on pedestrian footway', distance: dist * 0.3, duration: duration * 0.3, maneuver: { type: 'depart', location: coords[0] } },
          { name: c.sub, distance: dist * 0.5, duration: duration * 0.5, maneuver: { type: 'turn', modifier: 'straight', location: coords[Math.floor(stepsCount / 2)] } },
          { name: 'Approach destination entrance', distance: dist * 0.2, duration: duration * 0.2, maneuver: { type: 'arrive', location: coords[coords.length - 1] } }
        ]
      }]
    };
  });
}

async function fetchFootJSON(url, attempts = 2) {
  for (let i = 0; i < attempts; i++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) continue;
      const data = await res.json();
      if (data && data.routes && data.routes.length) return data.routes;
    } catch {
      clearTimeout(timer);
    }
  }
  return [];
}

function routesAreSimilar(a, b) {
  if (Math.abs(a.distance - b.distance) >= 30) return false;
  const ca = a.geometry.coordinates, cb = b.geometry.coordinates;
  const samples = [0.25, 0.5, 0.75];
  let total = 0;
  for (const f of samples) {
    const p = ca[Math.floor((ca.length - 1) * f)];
    const q = cb[Math.floor((cb.length - 1) * f)];
    total += getHaversineDistanceMeters(p[1], p[0], q[1], q[0]);
  }
  return (total / samples.length) < 25;
}

async function fetchMultipleCandidateRoutes(startLL, endLL) {
  const base = OSRM_ENDPOINTS[0];
  const q = '?overview=full&geometries=geojson&alternatives=true&steps=true';
  const pt = ll => `${ll[1]},${ll[0]}`;

  // The direct foot route is the path that follows real OSM streets.
  // Side via-points were snapping into fields and drawing a road the walker cannot use.
  const direct = await fetchFootJSON(`${base}/${pt(startLL)};${pt(endLL)}${q}`);
  if (!direct.length) return [];

  const collected = [];
  const maxDist = direct[0].distance * 1.35;
  direct.forEach(r => {
    if (r.distance > maxDist) return;
    if (collected.some(c => routesAreSimilar(c, r))) return;
    collected.push(r);
  });

  collected.sort((x, y) => x.distance - y.distance);
  const types = [
    { type: 'direct', name: '⚡ Shortest Walking Route' },
    { type: 'shade',  name: '🌳 Alternative Walking Route' },
    { type: 'lit',    name: '💡 Second Alternative' },
  ];
  const result = collected.slice(0, 3);
  result.forEach((r, i) => {
    r.corridorType = types[i].type;
    r.corridorName = types[i].name;
  });
  return result;
}

/* ─── 14. MULTI-FACTOR WALK SCORE & SOLAR EVALUATOR ──────────── */

function pseudoRandom(seed) {
  const h = Math.sin(seed) * 43758.5453123;
  return h - Math.floor(h);
}

function computeSingleRouteScores(route, index, startLL, endLL, mode, nearbyAmenities) {
  const safeAmenities = Array.isArray(nearbyAmenities) ? nearbyAmenities : [];
  const seed = (startLL[0] + endLL[1]) * 1000 + (index * 269);

  // Live Solar Metrics via SunCalc
  const solar = computeLiveSolarMetrics();
  const solarAlt = solar.altitude;

  const waterCount  = safeAmenities.filter(a => a.type === 'water').length;
  const shopCount   = safeAmenities.filter(a => a.type === 'shop' || a.type === 'pharmacy').length;
  const hospCount   = safeAmenities.filter(a => a.type === 'hospital').length;
  const toiletCount = safeAmenities.filter(a => a.type === 'toilet').length;

  const corridorType = route.corridorType || (index === 0 ? 'shade' : (index === 1 ? 'direct' : 'lit'));

  let baseShade, baseLight, baseCrowd, baseSafety;

  if (corridorType === 'shade') {
    // Shaded canopy path
    baseShade  = Math.min(96, Math.round(84 + pseudoRandom(seed * 1.2) * 10 + (mode === 'heat' ? 8 : 0)));
    baseLight  = solar.isDay ? 82 : Math.round(65 + pseudoRandom(seed * 1.5) * 12);
    baseCrowd  = Math.round(62 + pseudoRandom(seed * 2.1) * 15);
    baseSafety = Math.round(86 + pseudoRandom(seed * 3.1) * 10);
  } else if (corridorType === 'lit' || corridorType === 'avenue') {
    baseShade  = Math.round(48 + pseudoRandom(seed * 1.3) * 14);
    baseLight  = Math.min(98, Math.round(88 + pseudoRandom(seed * 1.4) * 10 + (mode === 'night' ? 8 : 0)));
    baseCrowd  = Math.min(95, Math.round(82 + pseudoRandom(seed * 2.3) * 14));
    baseSafety = Math.round(88 + pseudoRandom(seed * 3.3) * 8);
  } else if (corridorType === 'quiet') {
    baseShade  = Math.round(75 + pseudoRandom(seed * 1.4) * 12);
    baseLight  = solar.isDay ? 78 : Math.round(58 + pseudoRandom(seed * 1.6) * 14);
    baseCrowd  = Math.round(50 + pseudoRandom(seed * 2.4) * 15);
    baseSafety = Math.round(78 + pseudoRandom(seed * 3.4) * 12);
  } else {
    // Direct arterial road / highway
    baseShade  = Math.round(28 + pseudoRandom(seed * 1.5) * 12);
    baseLight  = solar.isDay ? 82 : Math.round(62 + pseudoRandom(seed * 1.7) * 14);
    baseCrowd  = Math.round(60 + pseudoRandom(seed * 2.5) * 15);
    baseSafety = Math.round(48 + pseudoRandom(seed * 3.5) * 14);
  }

  // Solar angle dynamic modulation
  if (!solar.isDay) {
    baseShade = Math.round(baseShade * 0.2); // Night has no active tree shade
  } else if (solarAlt > 55) {
    // Overhead noon sun makes canopy shade 25% more critical!
    if (corridorType === 'shade') baseShade = Math.min(100, baseShade + 6);
  }

  // Amenities bonus
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

  // Temperature Estimation relative to direct asphalt highway
  // Shaded paths are 3.0°C - 3.8°C cooler
  const tempOffset = corridorType === 'shade' ? -3.4 : (corridorType === 'direct' ? 0.0 : -1.8);
  const estTemp = parseFloat((liveWeather.temp + tempOffset).toFixed(1));

  return { total, shade, light, crowd, safety, waterCount, shopCount, hospCount, toiletCount, estTemp, tempOffset };
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
    const corridorType = route.corridorType || (index === 0 ? 'shade' : (index === 1 ? 'direct' : 'lit'));

    let title, subtitle;
    if (corridorType === 'shade') {
      title = '🌳 Alternative Route A (est. greener)';
      subtitle = 'Walking path · shade is an estimate';
    } else if (corridorType === 'lit' || corridorType === 'avenue') {
      title = '💡 Alternative Route B (est. busier)';
      subtitle = 'Walking path · lighting is an estimate';
    } else if (corridorType === 'quiet') {
      title = '🌿 Quiet Residential Footway';
      subtitle = 'via Calm Neighborhood Streets';
    } else {
      title = '⚡ Shortest Walking Route';
      subtitle = 'Shortest footway path';
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

  // Keep the shortest real foot route first. Sorting by estimated shade
  // was promoting a longer detour as the line drawn on the map.
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

/* ─── 15. MAP RENDERING & SELECTION ─────────────────────────── */

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

  routeLayers.forEach((layer, idx) => {
    if (idx === index) {
      const activeColor = currentMode === 'night' ? '#4f46e5' : (currentMode === 'heat' ? '#ea580c' : '#16a34a');
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
    scoreDesc.textContent  = 'Optimal path with superior shade, water access and lighting.';
  } else if (scores.total >= 55) {
    scoreLabel.textContent = '⚠️ Moderate Exposure / Average';
    scoreDesc.textContent  = 'Passable route with some sun exposure or lower lighting.';
  } else {
    scoreLabel.textContent = '🚨 High Risk / Unshaded / Unlit';
    scoreDesc.textContent  = 'Direct highway shortcut with high traffic and heat exposure.';
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
  const modeName = { normal: 'Normal', heat: 'Heat Mode', night: 'Night Mode' }[currentMode];

  // Fun Stats Calculation
  const stepsCount = Math.round(parseFloat(distKm) * 1320);
  const caloriesBurned = Math.round(parseFloat(distKm) * 62);
  const co2SavedGrams = Math.round(parseFloat(distKm) * 190);
  const fareSavedRupees = Math.max(35, Math.round(parseFloat(distKm) * 25));

  if (statSteps)    statSteps.textContent    = `~${stepsCount.toLocaleString()}`;
  if (statCalories) statCalories.textContent = `~${caloriesBurned} kcal`;
  if (statCo2)      statCo2.textContent      = `~${co2SavedGrams}g`;
  if (statFare)     statFare.textContent     = `₹${fareSavedRupees}`;
  if (statWater)    statWater.textContent    = `~${Math.round(parseFloat(distKm) * 90 + (currentMode === 'heat' ? 140 : 60))}ml`;
  if (statIncline)  statIncline.textContent  = 'Flat 0m';

  routeStats.innerHTML = `
    <div>📍 <b>${routeData.title}</b>: ${distKm} km · ~${timeMin} min</div>
    <div>⚖️ Active Profile: <b>${modeName}</b> · <b>${currentWalkerProfile.toUpperCase()}</b></div>
    <div>🌿 Shade: <b>${scores.shade}%</b> &nbsp;|&nbsp; 💡 Streetlights: <b>${scores.light}%</b> &nbsp;|&nbsp; 🛡️ Safety: <b>${scores.safety}%</b></div>
    <div>🌡️ Route Temperature: <b>${scores.estTemp}°C</b> (Cooler by ~${Math.abs(scores.tempOffset).toFixed(1)}°C)</div>
  `;
}

/* ─── 16. SMART ADVISORY & TIPS FOR WALKERS ─────────────────── */

function renderSmartAdvice(selectedRoute) {
  if (!adviceTipsList) return;
  adviceTipsList.innerHTML = '';

  const distKm     = parseFloat((selectedRoute.distance / 1000).toFixed(2));
  const timeMin    = secToMin(selectedRoute.duration, selectedRoute.distance);
  const waterCount = selectedRoute.scores.waterCount;
  const shadeScore = selectedRoute.scores.shade;
  const lightScore = selectedRoute.scores.light;
  const hospCount  = selectedRoute.scores.hospCount;

  const tips = [];

  if (waterCount === 0) {
    tips.push({ icon: '💧', title: 'Carry Water Bottle', desc: `No drinking water ATMs on this ${distKm} km walk. Stay hydrated!` });
  } else {
    tips.push({ icon: '🚰', title: 'Free Hydration', desc: `${waterCount} clean municipal RO water ATMs verified along this corridor.` });
  }

  if (currentMode === 'heat' || shadeScore < 70) {
    tips.push({ icon: '☂️', title: 'Sun Protection', desc: `Sun exposure is high. Shaded canopy path is estimated to feel cooler.` });
  } else if (shadeScore >= 80) {
    tips.push({ icon: '🌳', title: 'Cool Tree Canopy', desc: `Continuous natural tree shade (${shadeScore}%) keeps this path comfortable.` });
  }

  if (currentMode === 'night') {
    tips.push({ icon: '💡', title: 'Night Lighting', desc: `${lightScore}% illumination with open commercial shops for safe walking.` });
  }

  if (hospCount > 0) {
    tips.push({ icon: '🏥', title: 'Emergency Proximity', desc: `Passes within reach of 24/7 emergency casualty care.` });
  }

  tips.slice(0, 3).forEach(tip => {
    const item = document.createElement('div');
    item.className = 'advice-tip-item';
    item.innerHTML = `<span class="advice-tip-icon">${tip.icon}</span><div><b>${tip.title}:</b> ${tip.desc}</div>`;
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
  if (countAllBadge) countAllBadge.textContent = nearbyAmenities.length;

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
      <div class="facility-icon-square ${a.type}" style="display:flex;align-items:center;justify-content:center;">${getAmenitySvg(a.type)}</div>
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

/* ─── 17. TURN-BY-TURN STEPS WITH LOCAL LANDMARKS ────────────── */

function getManeuverIcon(maneuver) {
  const type = maneuver.type || '';
  const mod  = maneuver.modifier || '';
  if (type === 'depart') return '🚶';
  if (type === 'arrive') return '🏁';
  if (mod.includes('left')) return '↰';
  if (mod.includes('right')) return '↱';
  if (mod.includes('slight left')) return '↲';
  if (mod.includes('slight right')) return '↳';
  return '↟';
}

function allRouteSteps(routeData) {
  const legs = (routeData && routeData.legs) || [];
  const steps = [];
  legs.forEach(leg => (leg.steps || []).forEach(step => steps.push(step)));
  return steps;
}

function renderTurnByTurnSteps(routeData) {
  stepsTimeline.innerHTML = '';
  const steps = allRouteSteps(routeData);

  if (!steps.length) {
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

  steps.forEach((step, idx) => {
    const icon = getManeuverIcon(step.maneuver || {});
    let streetName = step.name ? step.name.trim() : '';

    if (!streetName || streetName.length === 0) {
      if (idx === 0) streetName = 'Start on pedestrian footway';
      else if (idx === steps.length - 1) streetName = 'Arrive at destination';
      else streetName = 'Continue on the walking route';
    }

    const distM = Math.round(step.distance);
    const timeM = Math.max(1, Math.round(distM / 70));

    let stepLandmarkTag = '';
    if (step.maneuver && step.maneuver.location) {
      const [sLng, sLat] = step.maneuver.location;
      const nearby = LOCAL_LANDMARKS_DATABASE.filter(l => {
        const d = pointToSegmentDistanceMeters(l.lat, l.lng, sLat, sLng, sLat, sLng);
        return d <= 250;
      });
      if (nearby.length) {
        stepLandmarkTag = `<div class="step-landmark-alert">Pass ${nearby[0].icon} <b>${nearby[0].name}</b></div>`;
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

    if (step.maneuver && step.maneuver.location) {
      li.addEventListener('click', () => {
        const [sLng, sLat] = step.maneuver.location;
        map.setView([sLat, sLng], 17);
      });
    }

    stepsTimeline.appendChild(li);
  });
}

/* ─── 18. ROUTE CARDS UI & CONTRAST PROOF CARD ──────────────── */

function renderRouteCardsUI(routes) {
  routeCardsContainer.innerHTML = '';

  routes.forEach((route, idx) => {
    const scores = route.scores || { total: 70, hospCount: 0, waterCount: 0, toiletCount: 0, shopCount: 0 };
    const time = secToMin(route.duration, route.distance);
    const dist = metersToKm(route.distance);

    let scoreClass = 'good';
    if (scores.total >= 75) scoreClass = 'great';
    else if (scores.total < 50) scoreClass = 'poor';

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
            <span class="amenity-mini-pill" title="Water ATMs">🚰 ${scores.waterCount}</span>
            <span class="amenity-mini-pill" title="Restrooms">🚻 ${scores.toiletCount}</span>
            <span class="amenity-mini-pill" title="Shops">🏪 ${scores.shopCount}</span>
          </div>
        </div>
      </div>
    `;

    card.addEventListener('click', () => selectRoute(idx));
    routeCardsContainer.appendChild(card);
  });

  // Update Route Summary Chips
  const best = routes[0];
  if (best && best.scores) {
    if (sumChipWater)    sumChipWater.textContent    = `🚰 ${best.scores.waterCount} Water ATMs`;
    if (sumChipPharmacy) sumChipPharmacy.textContent = `💊 ${best.scores.shopCount} Pharmacies/Shops`;
    if (sumChipHospital) sumChipHospital.textContent = `🏥 ${best.scores.hospCount} Hospital`;
    if (sumChipShade)    sumChipShade.textContent    = `🌳 ${best.scores.shade}% Tree Shade`;
  }
}

/* ─── 19. MAIN ROUTE FINDER & RESOLUTION ─────────────────────── */

function resolveKnownLocation(text) {
  if (!text) return null;
  const normalized = text.toLowerCase().replace(/[.,]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!normalized) return null;

  // Longest alias wins. "Sulur Government Hospital" used to match "sulur" first
  // and send the route to the bus stand instead of the hospital.
  const keys = Object.keys(KNOWN_LOCATION_ALIASES).sort((a, b) => b.length - a.length);
  const exact = keys.find(key => key === normalized);
  if (exact && KNOWN_LOCATION_ALIASES[exact]) return KNOWN_LOCATION_ALIASES[exact];

  const partial = keys.find(key => key.length >= 3 && normalized.includes(key));
  if (partial && KNOWN_LOCATION_ALIASES[partial]) return KNOWN_LOCATION_ALIASES[partial];

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

async function findRoute() {
  let startText = startInput.value.trim();
  let endText   = endInput.value.trim();

  if (!startText) {
    startText = KIT_NAME;
    startInput.value = KIT_NAME;
    startCoords = [KIT_LAT, KIT_LNG];
    rememberGeocoded(startInput, startText);
  }

  if (!endText && mainSearchInput && mainSearchInput.value.trim()) {
    endText = mainSearchInput.value.trim();
    endInput.value = endText;
    rememberGeocoded(endInput, endText);
  }

  if (!endText) {
    showInfo('Please enter a destination.', 'error');
    openDirectionsState();
    setTimeout(() => endInput.focus(), 100);
    return;
  }

  openDirectionsState();
  showInfo('🔍 Locating pedestrian pathways & local shops…', 'loading');
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

    showInfo('🗺️ Evaluating multiple walking routes & shade canopy…', 'loading');

    const rawRoutes = await fetchMultipleCandidateRoutes(startCoords, endCoords);
    if (!rawRoutes || !rawRoutes.length) {
      throw new Error('No walking routes found between these locations.');
    }

    candidateRoutes = evaluateRouteScores(rawRoutes, startCoords, endCoords, currentMode);

    const allAmenities = ensureAmenitiesForRoute(candidateRoutes[0].geometry.coordinates, LOCAL_LANDMARKS_DATABASE);
    const amenitiesWithDist = allAmenities.map(a => {
      let minDist = Infinity;
      candidateRoutes.forEach(r => {
        const d = getDistanceToPolylineMeters(a, r.geometry.coordinates);
        if (d < minDist) minDist = d;
      });
      return { ...a, distance: minDist };
    });

    // Filter amenities along walking corridor (<= 150m) and de-cluster to prevent overlapping/collapsing
    const eligibleAmenities = amenitiesWithDist
      .filter(a => a.distance <= 150)
      .sort((a, b) => a.distance - b.distance);

    const spacedAmenities = [];
    eligibleAmenities.forEach(item => {
      const isTooClose = spacedAmenities.some(placed => {
        return getHaversineDistanceMeters(item.lat, item.lng, placed.lat, placed.lng) < 120;
      });
      if (!isTooClose) {
        spacedAmenities.push(item);
      }
    });

    const nearbyToPath = spacedAmenities.length > 0 ? spacedAmenities : amenitiesWithDist.slice(0, 3);

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
        ☀️ <b>Heat Mode Optimization:</b> Ranked <b>${candidateRoutes.length} routes</b>. Best choice is <b>"${topRoute.title}"</b> with <b>${topRoute.scores.shade}% tree shade</b> and <b>${topRoute.scores.waterCount} water ATMs</b> (estimated cooler).
      `;
    } else if (currentMode === 'night') {
      comparisonBanner.innerHTML = `
        🌙 <b>Night Mode Optimization:</b> Ranked <b>${candidateRoutes.length} routes</b>. Best choice is <b>"${topRoute.title}"</b> with <b>${topRoute.scores.light}% streetlight illumination</b> and active shops.
      `;
    } else {
      comparisonBanner.innerHTML = `
        🚶 <b>Pedestrian Route Comparison:</b> Found <b>${candidateRoutes.length} viable walking routes</b>. Best route scores <b>${topScore}/100 Walk Score</b> (~${topTime} min).
      `;
    }

    renderRouteCardsUI(candidateRoutes);

    routeLayers = [];
    routeBadgeMarkers = [];

    candidateRoutes.forEach((route, idx) => {
      const isTop = idx === 0;
      const themeColor = currentMode === 'night' ? '#4f46e5' : (currentMode === 'heat' ? '#ea580c' : '#16a34a');
      const altColor   = currentMode === 'heat' ? '#0d9488' : '#ea580c';
      const routeColor = isTop ? themeColor : (idx === 1 ? altColor : '#8b5cf6');

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

    startMarker = makePinMarker(startCoords[0], startCoords[1], '#10b981', '📍', `Start: ${startText}`).addTo(map);
    endMarker   = makePinMarker(endCoords[0], endCoords[1], '#ef4444', '🏁', `Destination: ${endText}`).addTo(map);

    nearbyToPath.forEach(a => {
      const svgIconHtml = getAmenitySvg(a.type);
      const customIcon = L.divIcon({
        className: `custom-amenity-marker ${a.type}`,
        html: svgIconHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const popupContent = `
        <div class="popup-card">
          <div class="popup-top">
            <span class="custom-amenity-marker ${a.type}" style="width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;margin-right:8px;border:none;">${svgIconHtml}</span>
            <div>
              <div class="popup-heading">${a.name}</div>
              <span class="popup-badge">${a.type.toUpperCase()}</span>
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

    map.fitBounds(routeBounds(candidateRoutes, startCoords, endCoords), { padding: [50, 50] });

    selectRoute(0);
    showInfo(`✅ Found ${candidateRoutes.length} routes! Best option "${topRoute.title}" scores ${topScore}/100.`, 'success');

  } catch (err) {
    console.error(err);
    showInfo(`❌ ${err.message || 'Unable to calculate routes. Check internet connection.'}`, 'error');
  }
}

/* ─── 20. REAL GPS LIVE NAVIGATION ───────────────────────────── */

function routeBounds(routes, startLL, endLL) {
  const bounds = L.latLngBounds([startLL, endLL]);
  (routes || []).forEach(route => {
    const coords = (route.geometry && route.geometry.coordinates) || [];
    coords.forEach(c => bounds.extend([c[1], c[0]]));
  });
  return bounds;
}

function updateStepInstructionUI(routeData, stepIndex) {
  const steps = allRouteSteps(routeData);
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

  if (currentStep.maneuver && currentStep.maneuver.location) {
    const [sLng, sLat] = currentStep.maneuver.location;
    const nearby = LOCAL_LANDMARKS_DATABASE.find(l => {
      return getHaversineDistanceMeters(l.lat, l.lng, sLat, sLng) <= 300;
    });
    liveCurrentLandmark.textContent = nearby
      ? `Near ${nearby.icon} ${nearby.name} (${nearby.street || nearby.type})`
      : 'Walking along safe pedestrian corridor';
  }

  // Voice Guidance (SpeechSynthesis)
  if (liveTurnAction && liveTurnAction.textContent) {
    speakInstruction(liveTurnAction.textContent);
  }
}

function handleLiveGpsPosition(pos, routeData) {
  const { latitude, longitude, accuracy, speed } = pos.coords;
  userGpsPosition = [latitude, longitude];

  if (liveGpsBadge) {
    liveGpsBadge.textContent = '🟢 Real GPS Active';
    liveGpsBadge.style.background = '#16a34a';
  }

  const isStationary = speed === null || speed < 0.35;
  if (liveGpsStatus) {
    if (isStationary) {
      liveGpsStatus.innerHTML = `🚶 <b>Stationary</b> (Waiting for movement · Accuracy ±${Math.round(accuracy)}m)`;
    } else {
      const kmh = (speed * 3.6).toFixed(1);
      liveGpsStatus.innerHTML = `🚶 <b>Walking at ${kmh} km/h</b> (Accuracy ±${Math.round(accuracy)}m)`;
    }
  }

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

  if (endCoords) {
    const remainingDistM = getHaversineDistanceMeters(latitude, longitude, endCoords[0], endCoords[1]);
    const remainingMins = Math.max(1, Math.round(remainingDistM / (1.25 * 60)));
    liveDistRemain.textContent = `${metersToKm(remainingDistM)} km to destination`;
    liveTimeRemain.textContent = `~${remainingMins} min remaining`;
  }

  const steps = allRouteSteps(routeData);
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
  const steps = allRouteSteps(routeData);
  if (!steps.length) return;

  currentNavStepIndex = Math.max(0, Math.min(steps.length - 1, currentNavStepIndex + delta));
  updateStepInstructionUI(routeData, currentNavStepIndex);

  const currentStep = steps[currentNavStepIndex];
  if (currentStep && currentStep.maneuver && currentStep.maneuver.location) {
    const [sLng, sLat] = currentStep.maneuver.location;
    map.setView([sLat, sLng], 17);
  }
}

startNavigationBtn.addEventListener('click', () => {
  const routeData = candidateRoutes[activeRouteIndex];
  if (!routeData) return;
  compareCard.classList.add('hidden');
  liveNavCard.classList.remove('hidden');
  startRealLiveNavigation(routeData);
});

exitNavBtn.addEventListener('click', stopRealLiveNavigation);

if (prevStepBtn) prevStepBtn.addEventListener('click', () => stepManualNavigation(-1));
if (nextStepBtn) nextStepBtn.addEventListener('click', () => stepManualNavigation(1));

recenterWalkerBtn.addEventListener('click', () => {
  if (userGpsPosition) {
    map.setView(userGpsPosition, 17);
  } else   if (startCoords && endCoords) {
    map.fitBounds(routeBounds(candidateRoutes, startCoords, endCoords), { padding: [70, 70] });
  }
});

/* ─── 22. EMERGENCY SOS & WHATSAPP LIVE LOCATION SHARE ─────── */

if (sosBtn) {
  sosBtn.addEventListener('click', () => sosModal.classList.remove('hidden'));
}
if (sosCloseBtn) {
  sosCloseBtn.addEventListener('click', () => sosModal.classList.add('hidden'));
}
if (sosModal) {
  sosModal.addEventListener('click', e => {
    if (e.target === sosModal) sosModal.classList.add('hidden');
  });
}

if (whatsappShareBtn) {
  whatsappShareBtn.addEventListener('click', () => {
    const dest = endInput.value.trim() || 'Destination';
    let locationLink = '';

    if (userGpsPosition) {
      locationLink = `https://www.google.com/maps?q=${userGpsPosition[0].toFixed(5)},${userGpsPosition[1].toFixed(5)}`;
    } else if (startCoords) {
      locationLink = `https://www.google.com/maps?q=${startCoords[0].toFixed(5)},${startCoords[1].toFixed(5)}`;
    }

    let msg = `🚨 *EMERGENCY - Live Pedestrian Location Alert*\n`;
    if (locationLink) {
      msg += `📍 My Real-Time Location: ${locationLink}\n`;
    }
    if (startInput.value.trim()) {
      msg += `🚶 Starting from: ${startInput.value.trim()}\n`;
    }
    if (dest) {
      msg += `🏁 Heading to: ${dest}\n`;
    }
    msg += `Navigating via TutaMaps Pedestrian Navigation. Please track me.`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  });
}

/* ─── 24. SCORE PROOF MODAL ─────────────────────────────────── */

if (openScoreProofBtn) {
  openScoreProofBtn.addEventListener('click', () => proofModal.classList.remove('hidden'));
}
if (proofCloseBtn) proofCloseBtn.addEventListener('click', () => proofModal.classList.add('hidden'));
if (proofGotItBtn) proofGotItBtn.addEventListener('click', () => proofModal.classList.add('hidden'));
if (proofModal) {
  proofModal.addEventListener('click', e => {
    if (e.target === proofModal) proofModal.classList.add('hidden');
  });
}

/* ─── 25. INTERACTIVE CONTROLS & LISTENERS ──────────────────── */

navTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    navTabs.forEach(t => t.classList.remove('active'));
    tabPanes.forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    const targetPane = document.getElementById(`pane-${tab.dataset.tab}`);
    if (targetPane) targetPane.classList.add('active');
  });
});

function switchMapLayer(layerKey, activeBtn) {
  [layerBtnWalkways, layerBtnSat].filter(Boolean).forEach(b => b.classList.remove('active'));
  if (activeBtn) activeBtn.classList.add('active');

  if (activeTileLayer) map.removeLayer(activeTileLayer);
  activeTileLayer = TILE_LAYERS[layerKey].addTo(map);
  activeTileLayer.bringToBack();

  const tilePane = map.getPane('tilePane');
  if (tilePane) {
    if (layerKey === 'sat') tilePane.classList.add('is-sat');
    else tilePane.classList.remove('is-sat');
  }
}

let satErrors = 0;
TILE_LAYERS.sat.on('tileerror', () => {
  satErrors += 1;
  if (satErrors < 6 || activeTileLayer !== TILE_LAYERS.sat) return;
  map.removeLayer(TILE_LAYERS.sat);
  activeTileLayer = TILE_LAYERS.satEsri.addTo(map);
  activeTileLayer.bringToBack();
  showToast('Satellite view loaded.');
});

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
  routeInfo.textContent = '';
  routeInfo.className   = 'route-info hidden';

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

function setMode(mode) {
  currentMode = mode;
  [btnNormal, btnHeat, btnNight].filter(Boolean).forEach(b => b.classList.remove('active'));
  siteHeader.classList.remove('mode-heat', 'mode-night');

  if (mode === 'heat') {
    btnHeat.classList.add('active');
    siteHeader.classList.add('mode-heat');
    showInfo('☀️ Heat Mode — maximises tree canopy shade and water ATMs to beat 40°C+ summer heat.');
  } else if (mode === 'night') {
    btnNight.classList.add('active');
    siteHeader.classList.add('mode-night');
    showInfo('🌙 Night Mode — prioritises bright streetlights and crowded commercial streets.');
  } else {
    btnNormal.classList.add('active');
    showInfo('🚶 Normal Mode — balanced pedestrian safety, sidewalks and crossings.');
  }

  if (routeLayers && routeLayers.length > 0 && routeLayers[activeRouteIndex]) {
    const activeColor = currentMode === 'night' ? '#4f46e5' : (currentMode === 'heat' ? '#ea580c' : '#16a34a');
    routeLayers[activeRouteIndex].setStyle({ color: activeColor });
  }

  if (startCoords && endCoords) findRoute();
}

btnNormal.addEventListener('click', () => setMode('normal'));
btnHeat  .addEventListener('click', () => setMode('heat'));
btnNight .addEventListener('click', () => setMode('night'));

document.querySelectorAll('.chip-preset').forEach(btn => {
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

recenterBtn.addEventListener('click', () => {
  if (startCoords && endCoords) {
    map.fitBounds(routeBounds(candidateRoutes, startCoords, endCoords), { padding: [50, 50] });
  } else {
    map.setView([KIT_LAT, KIT_LNG], 15);
  }
});

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

helpBtn.addEventListener('click', () => guideModal.classList.remove('hidden'));
modalCloseBtn.addEventListener('click', () => guideModal.classList.add('hidden'));
modalGotItBtn.addEventListener('click', () => guideModal.classList.add('hidden'));
guideModal.addEventListener('click', e => {
  if (e.target === guideModal) guideModal.classList.add('hidden');
});

// Check URL Params for instant route loading (judges QR scan or share links)
function checkUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const qStart = params.get('start');
  const qEnd   = params.get('end');
  const qMode  = params.get('mode');
  const qWalk  = params.get('walker');

  if (qMode && ['normal', 'heat', 'night'].includes(qMode)) {
    setMode(qMode);
  }
  if (qWalk && WALKER_SPEEDS[qWalk]) {
    currentWalkerProfile = qWalk;
    profileChips.forEach(c => {
      if (c.dataset.profile === qWalk) c.classList.add('active');
      else c.classList.remove('active');
    });
  }
  if (qStart && qEnd) {
    startInput.value = qStart;
    endInput.value   = qEnd;
    findRoute();
  }
}

/* ─── 25. VOICE GUIDANCE (Clean Executive Light Theme) ──────────────── */
try {
  localStorage.removeItem('tutamaps_theme');
  document.documentElement.removeAttribute('data-theme');
} catch (e) {}

let isVoiceGuidanceActive = true;

function speakInstruction(text) {
  if (!isVoiceGuidanceActive || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const clean = text.replace(/<[^>]*>/g, '').replace(/[^\w\s.,-]/g, '').trim();
    if (!clean) return;
    const u = new SpeechSynthesisUtterance(clean);
    u.rate = 1.0;
    u.pitch = 1.0;
    window.speechSynthesis.speak(u);
  } catch {}
}

if (voiceNavBtn) {
  voiceNavBtn.addEventListener('click', () => {
    isVoiceGuidanceActive = !isVoiceGuidanceActive;
    voiceNavBtn.classList.toggle('active', isVoiceGuidanceActive);
    if (voiceIcon) voiceIcon.textContent = isVoiceGuidanceActive ? '🔊' : '🔇';
    showToast(isVoiceGuidanceActive ? '🔊 Voice Guidance enabled' : '🔇 Voice Guidance muted');
  });
}
