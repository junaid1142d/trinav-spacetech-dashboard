# OGC WMS and WFS Integration

This platform integrates public OGC services with the Trinav SpaceTech SensorThings pressure-station layer for renewable energy land suitability assessment across Tamil Nadu's 38 districts.

## WMS (Web Map Service)

### Endpoint
- **Provider:** NASA Global Imagery Browse Services (GIBS)
- **App proxy URL (what the client calls):** `/api/ogc/wms`
- **Upstream (what the proxy forwards to):** `https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi`
- **Version:** 1.3.0
- **CRS:** EPSG:3857

### OGC Request URLs

**GetCapabilities** — Discover all available layers:
```
/api/ogc/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities
```

**GetMap** — Render a raster tile as a PNG overlay:
```
/api/ogc/wms
  ?SERVICE=WMS
  &VERSION=1.3.0
  &REQUEST=GetMap
  &LAYERS=MODIS_Terra_CorrectedReflectance_TrueColor
  &BBOX={minx},{miny},{maxx},{maxy}
  &WIDTH=256
  &HEIGHT=256
  &CRS=EPSG:3857
  &FORMAT=image/png
  &TRANSPARENT=TRUE
  &STYLES=
```

### Implementation Notes
- Layer discovery is performed at runtime via `GetCapabilities` XML parsing.
- The user selects a layer from the parsed list; the application renders it as a `WMSTileLayer` via React Leaflet.
- Opacity is adjustable in real-time (10%–100%).
- Available layers include MODIS imagery, vegetation indices, temperature, cloud cover, and aerosol data.
- `GetCapabilities` responses are checked for an OGC `ServiceExceptionReport` before parsing. If GIBS returns an exception (e.g. malformed request), it now surfaces as a visible error in the WMS panel instead of silently showing zero layers.

---

## WFS (Web Feature Service)

### Endpoint
- **Provider:** GeoServer public demo instance (ahocevar.com)
- **App proxy URL (what the client calls):** `/api/ogc/wfs`
- **Upstream (what the proxy forwards to):** `https://ahocevar.com/geoserver/wfs`
- **Version:** 2.0.0
- **Output Format:** `application/json` (GeoJSON)

### OGC Request URLs

**GetCapabilities** — Discover feature types:
```
/api/ogc/wfs?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities
```

**GetFeature** — Query vector data with BBOX (Tamil Nadu extent):
```
/api/ogc/wfs
  ?SERVICE=WFS
  &VERSION=2.0.0
  &REQUEST=GetFeature
  &TYPENAMES=ne:ne_10m_populated_places
  &OUTPUTFORMAT=application/json
  &COUNT=100
  &BBOX=7.9,76.2,13.5,80.6,EPSG:4326
```

> **Axis order note:** WFS 2.0.0 combined with `srsName=EPSG:4326`
> technically requires the CRS authority's declared axis order — **(lat,
> lon)** for EPSG:4326, not (lon, lat) — but public GeoServer demo
> instances inconsistently honor this (many force lon/lat regardless of
> version). Rather than hard-code one assumption, the client tries, in
> order: WFS 2.0.0 with (lat,lon), WFS 2.0.0 with (lon,lat), then WFS
> 1.1.0 with (lon,lat), stopping at the first success (`wfsGetFeature()`
> in `src/services/api.js`). This only matters if you change the BBOX;
> the curated layers below already work against this server as-is.

> **Layer inventory note:** `ahocevar.com/geoserver/wfs` publishes exactly
> four feature types: `ne:ne_10m_populated_places`, `ne:ne_10m_roads`,
> `topp:states` (US-only), and `osm:water_areas` (EPSG:900913, not 4326).
> Any other `TYPENAMES` value returns an HTTP 400 "unknown feature type" —
> confirmed directly against this server's `GetCapabilities` response.
> Verify against the live `GetCapabilities` output before adding a new
> curated WFS layer, rather than assuming a Natural Earth layer name is
> published just because it exists in the Natural Earth dataset generally.

**DescribeFeatureType** — Inspect schema of a feature type:
```
/api/ogc/wfs
  ?SERVICE=WFS
  &VERSION=2.0.0
  &REQUEST=DescribeFeatureType
  &TYPENAMES=ne:ne_10m_populated_places
```

### Implementation Notes
- Feature type discovery via `GetCapabilities` XML parsing.
- `GetFeature` requests use a bounding box scoped to Tamil Nadu (76.2°E–80.6°E, 7.9°N–13.5°N); the client tries multiple axis orders per the note above rather than assuming one.
- Response is parsed as GeoJSON and rendered as interactive vector layers on the map via React Leaflet `GeoJSON` component.
- Users can click on any vector feature to inspect its attributes in the detail panel.
- The Request Inspector logs every OGC HTTP call with status code, latency (ms), response size (KB), and URL for debugging — including every fallback attempt, so a layer that needed a retry is visible, not hidden.

---

## Tamil Nadu District Dataset

### Source
- 38 district centroids with renewable energy suitability attributes.
- Data model follows OGC SensorThings `Thing` → `Datastream` → `Observation` pattern.

### Attributes per District
| Field | Type | Description |
|-------|------|-------------|
| `name` | string | District name |
| `hq` | string | District headquarters city |
| `area_sqkm` | number | District area in km² |
| `population` | number | Census population |
| `solar_irradiance_kwh` | number | Daily solar irradiance (kWh/m²/day) |
| `wind_density_wm2` | number | Wind power density (W/m²) |
| `terrain` | string | Terrain classification |
| `land_use` | string | Primary land use category |
| `grid_proximity_km` | number | Distance to nearest power grid connection (km) |
| `suitability_solar` | number | Solar park suitability score (0–100) |
| `suitability_wind` | number | Wind park suitability score (0–100) |
| `overall_score` | number | Combined renewable energy suitability (0–100) |
| `zone` | string | Geographic zone classification |

### Suitability Scale
| Score | Rating | Color |
|-------|--------|-------|
| 85–100 | Excellent | Green |
| 70–84 | Good | Lime |
| 55–69 | Moderate | Yellow |
| 40–54 | Low | Orange |
| 0–39 | Poor | Red |

---

## Performance & Error Handling

### Network Error Handling
- All OGC HTTP requests use `AbortController` for cancellation on component unmount or new requests.
- Timeout and network errors are caught and displayed inline with error details.
- The Request Inspector logs all requests with `success`, `error`, or `pending` status.

### Bottlenecks Observed
- **NASA GIBS GetCapabilities**: Large XML response (~1–3 MB). Parsing takes 500–2000ms depending on connection. Limited to first 60 layers in the UI.
- **GeoServer WFS GetFeature**: Response size scales with feature count and geometry complexity. BBOX filtering reduces payload significantly.
- **WMS tile loading**: Individual tile requests are fast (<200ms) but initial layer activation may show brief loading state as tiles populate the viewport.

### Mitigation Strategies
- XML parsing is done in the main thread using `DOMParser` (future: Web Worker offloading for large responses).
- Feature counts are capped (`COUNT=100`) to prevent excessive payloads.
- Layer lists are truncated to manageable sizes in the UI.
- All requests are logged with timing data for performance auditing.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  ┌───────────┐  ┌───────────┐  ┌──────────────────────┐ │
│  │  OGC      │  │  Request  │  │  Tamil Nadu District  │ │
│  │  Manager  │  │  Logger   │  │  Dataset (GeoJSON)    │ │
│  └─────┬─────┘  └─────┬─────┘  └──────────┬───────────┘ │
│        │              │                    │              │
│  ┌─────┴──────────────┴────────────────────┴───────────┐ │
│  │              React Leaflet Map Container            │ │
│  │  ┌────────┐  ┌──────────┐  ┌──────────────────────┐ │ │
│  │  │ WMS    │  │ WFS      │  │ CircleMarker Layer   │ │ │
│  │  │ Tiles  │  │ GeoJSON  │  │ (38 Districts)       │ │ │
│  │  └────────┘  └──────────┘  └──────────────────────┘ │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────┬──────────────────────┬────────────────────────┘
           │                      │
    ┌──────┴──────┐       ┌──────┴──────┐
    │  NASA GIBS  │       │  GeoServer  │
    │  WMS 1.3.0  │       │  WFS 2.0.0  │
    └─────────────┘       └─────────────┘
```
