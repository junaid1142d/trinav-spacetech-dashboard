# TRINAV SPACETECH - Atmospheric Pressure Monitoring Dashboard

Internship-quality GIS dashboard for atmospheric pressure visualization, OGC interoperability, and conceptual SensorThings modeling across Tamil Nadu.

Live site: https://trinav-spacetech.vercel.app/

## Project Overview

This repository demonstrates a lightweight environmental monitoring console built with React, Leaflet, Recharts, Express, and OGC-oriented service utilities. It is intentionally scoped as a polished educational deliverable, not a production SaaS platform.

Core capabilities:

- Interactive Tamil Nadu pressure station map with search, basemaps, heatmap, boundary overlay, live cursor coordinates, scale, home, locate, fullscreen, and CSV export.
- Analytics dashboards for pressure statistics, station averages, distribution, volatility, and temporal trends.
- CSV upload, validation, search, sort, pagination, station/city filters, and export.
- OGC Explorer for WMS GetCapabilities, WMS GetMap previews, WFS GetFeature GeoJSON rendering, BBOX filtering, runtime layer discovery, and request inspection.
- OGC Compliance page with an implementation matrix and clear SensorThings scope notes.
- Conceptual SensorThings JSON entities for Things, Locations, Datastreams, Observations, ObservedProperties, Sensors, FeaturesOfInterest, and HistoricalLocations.

## Architecture

The app has a Vite React frontend and a small Express backend. The frontend owns the GIS dashboard, analytics, CSV workflows, and OGC WMS/WFS viewers. The backend serves the production build, exposes a demo OGC SensorThings-style API under `/v1.1`, and provides stable OGC proxy endpoints under `/api/ogc/wms` and `/api/ogc/wfs`.

## Folder Structure

```text
src/
  components/        Reusable dashboard, table, map, GIS, and SensorThings UI
  pages/             Dashboard, map, analytics, data explorer, OGC, compliance, settings, about
  services/          API, CSV, metrics, and OGC request helpers
  utils/             Mock observation loader and request builders
  data/              Tamil Nadu district and curated OGC layer data
server/
  app.js             Shared Express app (routes only) — used by both server.js and api/index.js
  routes/            SensorThings and OGC proxy route handlers
  sensorthings/      Conceptual SensorThings data model and OData parser
api/
  index.js           Vercel serverless entrypoint, wraps server/app.js
docs/                OGC reference and compliance notes
public/              Static icons
```

## Running Locally

```bash
npm install
npm run dev
```

In development, Vite proxies `/api/ogc/wms` and `/api/ogc/wfs` to their upstream public OGC services so WMS/WFS layers work without CORS issues.

For the full Express server and SensorThings API:

```bash
npm run build
npm start
```

Open `http://localhost:8080/` and `http://localhost:8080/v1.1/`.

## OGC Standards

Implemented for demonstration:

- WMS GetCapabilities
- WMS GetMap
- WFS GetCapabilities service utility
- WFS GetFeature
- DescribeFeatureType URL construction
- GeoJSON rendering
- BBOX filtering
- Runtime layer discovery
- Request inspector and response visibility

SensorThings support is conceptual and educational. The repository models SensorThings entities and exposes a lightweight demo API, but it is not a certified full SensorThings server.

## Deployment

The app is deployable two ways, sharing the same route logic in `server/app.js`:

### Azure App Service (primary target)

- App Service: `trinav-spacetech-junaid`
- Resource group: `trinav-spacetech-rg`
- Runtime: Node 20 (Linux), start command `npm start` → `node server.js`

Deployment is via the GitHub Actions workflow at `.github/workflows/azure-webapps-deploy.yml`, which runs on every push to `main`. It builds the frontend, prunes to production dependencies, and deploys the result with `azure/webapps-deploy@v3`.

**One-time setup required in your GitHub repo and Azure portal:**
1. In Azure Portal → App Service `trinav-spacetech-junaid` → **Get publish profile**, download the `.PublishSettings` file.
2. In GitHub → repo **Settings → Secrets and variables → Actions**, add a secret named `AZURE_WEBAPP_PUBLISH_PROFILE` with the full contents of that file.
3. (Recommended) In Azure Portal → **Configuration → Application settings**, set `SCM_DO_BUILD_DURING_DEPLOYMENT=false`. The workflow already builds and prunes dependencies before upload, so a second Oryx build on the server side is redundant and slower.

After that, `git push origin main` triggers a deploy automatically. You can also trigger it manually from the **Actions** tab (`workflow_dispatch`).

### Vercel

Vercel builds the static frontend (`vite build` → `dist/`) and runs `/api/ogc/*` and `/v1.1/*` as a single serverless function (`api/index.js`, wrapping the same `server/app.js` Express app used on Azure). `vercel.json` wires the rewrites. No extra configuration is needed beyond connecting the GitHub repo in the Vercel dashboard — it auto-detects the Vite build and the `api/` function.

### Local production build

```bash
npm install
npm run build
npm start
```

Open `http://localhost:8080/` and `http://localhost:8080/v1.1/`.

Deployment requires valid Azure CLI login or configured CI/CD credentials, and (for Vercel) a connected GitHub repo.

## Verification

Current local checks:

```bash
npm run lint
npm run build
```

Known non-blocking build notes:

- Vite reports a large JavaScript bundle because map/chart libraries are included in one client bundle.
- Leaflet CSS references marker/layer image URLs that Vite leaves for runtime resolution.

## Author

Developed by Junaid Ahmed for Trinav SpaceTech.
