# TutaMaps — Google Maps Style Pedestrian Navigation & Local Streets
**Team Neural Hydras · KIT Coimbatore (Kalaignarkarunanidhi Institute of Technology)**

**Live demo:** [tutamaps.vercel.app](https://tutamaps.vercel.app)
 A walking navigation web app designed like **Google Maps**, tailored for pedestrians in Coimbatore. It renders small streets, residential footways, local shops, and bakeries, compares **2 distinct routes** (Recommended vs Direct Shortcut), and maps emergency amenities (**Hospitals, Pharmacies, Drinking Water ATMs, and Restrooms**).

No API keys required.

---

## 🌟 What's New

1. **Google Maps Clean App Layout**:
   - **Modern Navigation Drawer**: Compact search input with origin/destination dots, ⇅ swap button, and 1-click popular presets.
   - **Google Maps Route Cards**: Stacked side-by-side comparison cards showing bold duration (e.g. `24 min` vs `21 min`), distance, Walk Score (0-100), and difference tags (`Recommended for Heat` vs `3 min faster · Unshaded`).
   - **Organized Tabbed Views**: Clean tabs eliminate clumsiness:
     - 🧭 **Turn-by-Turn**: Every small street, maneuver, step distance, and nearby shop landmarks passed along the way.
     - 📍 **Shops & Facilities**: Filterable catalog of nearby shops, pharmacies, drinking water points, hospitals, and restrooms.
     - 📊 **Walk Score**: Visual percentage bars for tree canopy shade, streetlights, footfall, and safety.

2. **Small Streets, Footways & Shop Names for Walkers**:
   - **Google Maps Style Base Tiles** (CartoDB Voyager) showing residential roads, building outlines, footways, and shops up to zoom level 20.
   - **Map Layer Switcher**:
     - 🗺️ **Google Style**: CartoDB Voyager pastel map with shops and building footprints.
     - 🚶 **Pedestrian Detail**: Humanitarian OSM with every small alley, pathway, and steps.
     - 🛰️ **Satellite**: Esri World Imagery high-resolution aerial photography.
   - **Local Shops, Pharmacies & Transit**:
     - 🏪 **Shops & Bakeries**: KR Bakes, Aavin Milk Parlour, Annapoorna Sweet Stall, Tea Time, Kannan Departmental Store, Nilgiris.
     - 💊 **Pharmacies**: Apollo Pharmacy, MedPlus, Jan Aushadhi generic stores, campus first-aid dispensary.
     - 🚏 **Bus Stops**: KIT Gate Bus Stop, Kannampalayam Junction, Sulur Bus Terminus.
     - 🚰 **Drinking Water ATMs**: Free municipal and Panchayat RO drinking water kiosks.
     - 🏥 **Hospitals**: 24/7 emergency casualty care, PHCs, and trauma centers.
     - 🚻 **Public Restrooms**: Swachh Bharat public convenience blocks.
   - **Instant Search**: Type small street names (e.g. "College Road", "Kamaraj Nagar") or shops ("Apollo Pharmacy", "KR Bakes", "Aavin") for instant autocomplete.

3. **Dual Route Comparison**:
   - **Route 1**: Mode-tailored (canopy shade in Heat Mode, bright streetlights in Night Mode, pedestrian paths in Normal Mode).
   - **Route 2**: Direct shortcut with lower safety/shade.
   - **Interactive Switching**: Click either card in the drawer or click the floating duration pills (`[🚶 24 min · 88 pts]`) directly on the map.

---

## How to Run

```powershell
git clone https://github.com/kalaiyx/tutamaps
cd tutamaps
python -m http.server 5500
```

Open [http://localhost:5500](http://localhost:5500) in your browser.
