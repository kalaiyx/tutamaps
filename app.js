// ─────────────────────────────────────────────────────────
//  TutaMaps — app.js
//  Phase 1: Map initialisation + UI wiring
//  Phases 2-6 will build on top of this file.
// ─────────────────────────────────────────────────────────

// ── 1. Initialise the map ─────────────────────────────────
// Default view: New York City. Change lat/lng to your city.
const DEFAULT_LAT = 40.7128;
const DEFAULT_LNG = -74.0060;
const DEFAULT_ZOOM = 13;

const map = L.map('map').setView([DEFAULT_LAT, DEFAULT_LNG], DEFAULT_ZOOM);

// OpenStreetMap tile layer (free, no API key needed)
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);


// ── 2. Grab UI elements ───────────────────────────────────
const startInput    = document.getElementById('start-input');
const endInput      = document.getElementById('end-input');
const findRouteBtn  = document.getElementById('find-route-btn');
const clearBtn      = document.getElementById('clear-btn');
const routeInfo     = document.getElementById('route-info');


// ── 3. State ──────────────────────────────────────────────
let startMarker = null;
let endMarker   = null;
let routeLayer  = null;


// ── 4. Helper: show messages in the info box ──────────────
function showInfo(message, type = 'default') {
  routeInfo.textContent = message;
  routeInfo.className = 'route-info'; // reset classes
  if (type === 'error')   routeInfo.classList.add('error');
  if (type === 'success') routeInfo.classList.add('success');
}


// ── 5. Helper: clear markers and route from the map ───────
function clearMap() {
  if (startMarker) { map.removeLayer(startMarker); startMarker = null; }
  if (endMarker)   { map.removeLayer(endMarker);   endMarker   = null; }
  if (routeLayer)  { map.removeLayer(routeLayer);  routeLayer  = null; }
}


// ── 6. "Find Route" button click handler ─────────────────
findRouteBtn.addEventListener('click', () => {
  const start = startInput.value.trim();
  const end   = endInput.value.trim();

  // Basic validation
  if (!start || !end) {
    showInfo('Please enter both a start and an end point.', 'error');
    return;
  }

  showInfo('🔍 Searching for route…');

  // TODO (Phase 4): geocode start and end addresses
  // TODO (Phase 5): fetch walking route from OpenRouteService
  // TODO (Phase 6): apply safe/scenic scoring to the route
  console.log('Finding route from:', start, '→', end);
});


// ── 7. "Clear" button click handler ──────────────────────
clearBtn.addEventListener('click', () => {
  startInput.value = '';
  endInput.value   = '';
  clearMap();
  routeInfo.textContent = '';
  routeInfo.className   = 'route-info';
});


// ── 8. Allow pressing Enter in inputs to trigger search ──
[startInput, endInput].forEach((input) => {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') findRouteBtn.click();
  });
});


// ── 9. Ready ──────────────────────────────────────────────
console.log('TutaMaps loaded ✅');
