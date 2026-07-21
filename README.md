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
  routes/            SensorThings route handlers
  sensorthings/      Conceptual SensorThings data model and OData parser
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

The app can be hosted as a Node/Express app on Azure App Service after running `npm run build`. The configured target from the project brief is:

- App Service: `trinav-spacetech-junaid`
- Resource group: `trinav-spacetech-rg`

Deployment requires valid Azure CLI login or configured CI/CD credentials.

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
