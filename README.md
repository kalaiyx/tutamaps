# 🗺️ TutaMaps

> Walk the safer, cooler route.

TutaMaps is a walking-route website that shows you the safest and most interesting path between two points — not just the shortest one.

---

## Project Structure

```
tutamap/
├── index.html        # Main page — map + search panel
├── style.css         # All styles
├── app.js            # Map logic and UI wiring
├── .env.template     # Copy this to .env and add your API keys
└── README.md         # You are here
```

---

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/tutamap.git
cd tutamap
```

### 2. Set up environment variables
```bash
# Copy the template
cp .env.template .env

# Open .env and fill in your API keys
```

### 3. Open the app
No build step needed for Phase 1. Just open `index.html` in your browser:

```bash
# Option A — double-click index.html in your file explorer

# Option B — use VS Code Live Server extension (recommended)
# Install: https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer
# Then right-click index.html → "Open with Live Server"
```

You should see a map of New York City with a search panel on the left.

---

## Tech Stack

| Layer     | Tool                  | Why                          |
|-----------|-----------------------|------------------------------|
| Map tiles | Leaflet + OpenStreetMap | Free, no API key needed     |
| Geocoding | Nominatim             | Free address → coordinates   |
| Routing   | OpenRouteService      | Free walking directions      |
| Frontend  | Vanilla HTML/CSS/JS   | No framework needed for v1   |

---

## Build Phases

- [x] **Phase 1** — Project setup & file structure
- [ ] **Phase 2** — Display a map
- [ ] **Phase 3** — Search UI
- [ ] **Phase 4** — Geocoding (address → coordinates)
- [ ] **Phase 5** — Walking route on the map
- [ ] **Phase 6** — Safe & scenic route scoring
- [ ] **Phase 7** — UI polish
- [ ] **Phase 8** — Deploy

---

## Contributing

1. Create a branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Open a pull request — describe what you changed and why

---

## License

MIT
