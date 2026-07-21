# TRINAV SPACETECH — Atmospheric Pressure Monitoring & Renewable Energy Platform

**OGC SensorThings API 1.1 Compliant | Azure Data Explorer Ready | QGIS Interoperable**

Developed by **Junaid Ahmed** ([LinkedIn](https://www.linkedin.com/in/junaid-ahmed-442025280/)) for **Trinav SpaceTech**.

---

## 🌟 Platform Highlights

- **OGC SensorThings API 1.1 REST Server**: Full Node.js/Express backend exposing `/v1.1/Things`, `Locations`, `HistoricalLocations`, `Datastreams`, `Sensors`, `ObservedProperties`, `FeaturesOfInterest`, and `Observations`.
- **OData 4.0 Query Engine**: Server-side support for `$filter`, `$expand`, `$select`, `$orderby`, `$top`, `$skip`, and `$count`.
- **Tamil Nilam–Inspired GIS Usability**:
  - Grouped Layer Tree with basemap provider switcher (CartoDB Dark, OpenStreetMap, ESRI Satellite).
  - Operational 38-District Tamil Nadu Suitability Layer with MCDM scores (Solar, Wind, Grid, Terrain).
  - GIS Toolbar with line distance measurement, area estimator, mouse coordinate tracker, scale bar, and quick regional bookmarks.
  - NASA GIBS WMS (Web Map Service) & GeoServer WFS (Web Feature Service) integration with BBOX filtering.
- **Atmospheric Analytics**: Real-time timeseries graphs, barometric distribution histograms, anomaly alert monitors, and temporal playback simulation.

---

## 🚀 Quick Start

### 1. Local Development
```bash
# Install dependencies
npm install

# Build frontend & start server
npm run build
npm start
```

Access the platform:
- **Web Console**: `http://localhost:8080/`
- **SensorThings API Root**: `http://localhost:8080/v1.1/`

---

## 📡 OGC SensorThings API 1.1 Specification

### Base Endpoint
`GET /v1.1/`

### Resource Endpoints
- `GET /v1.1/Things` — List all 38 district telemetry nodes
- `GET /v1.1/Locations` — Geospatial site coordinates (GeoJSON)
- `GET /v1.1/HistoricalLocations` — Station location movement history
- `GET /v1.1/Datastreams` — Barometric timeseries datastreams
- `GET /v1.1/Sensors` — Sensor hardware specifications (Bosch BMP390, Pyranometer)
- `GET /v1.1/ObservedProperties` — Observed physical parameters
- `GET /v1.1/FeaturesOfInterest` — Regional atmospheric domain
- `GET /v1.1/Observations` — Individual barometric pressure observations

### OData Query Examples
```http
# Filter observations greater than 1012 hPa
GET /v1.1/Observations?$filter=result gt 1012

# Expand Datastreams & Observations inside Things
GET /v1.1/Things?$expand=Datastreams/Observations

# Top 5 suitability scores sorted descending
GET /v1.1/Things?$orderby=properties/overallSuitabilityScore desc&$top=5

# Count total locations with inline count
GET /v1.1/Locations?$count=true&$top=10
```

---

## 🗺️ OGC WMS & WFS Endpoints

- **WMS (NASA GIBS)**: `https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi`
- **WFS (GeoServer)**: `https://ahocevar.com/geoserver/wfs`

---

## 📜 Documentation

- [OGC Compliance Matrix](docs/OGC_Compliance_Matrix.md)
- [OGC WMS/WFS Reference](docs/OGC.md)

---

## 🛡️ License & Copyright
Developed by Junaid Ahmed. Trinav SpaceTech © 2026.
