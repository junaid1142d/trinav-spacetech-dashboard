# OGC Service Integration Requests

This document lists the live OGC endpoints and request patterns used by the interactive map's integrated OGC Explorer.

## Endpoints Used

- **WMS (Raster):** NASA GIBS  
  Upstream: `https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi`  
  App proxy: `/api/ogc/wms`

- **WFS (Vector):** GeoServer Natural Earth Demo  
  Upstream: `https://ahocevar.com/geoserver/wfs`  
  App proxy: `/api/ogc/wfs`

## OGC Request URLs

### WMS `GetCapabilities`

```text
/api/ogc/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities
```

### WMS `GetMap` (Leaflet WMSTileLayer pattern)

```text
/api/ogc/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=MODIS_Terra_CorrectedReflectance_TrueColor
&STYLES=&FORMAT=image/png&TRANSPARENT=true&CRS=EPSG:3857&BBOX={bbox-epsg3857}&WIDTH=256&HEIGHT=256
```

### WFS `GetCapabilities`

```text
/api/ogc/wfs?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities
```

### WFS `GetFeature` (primary, WFS 2.0.0)

```text
/api/ogc/wfs?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&typeNames=ne:ne_10m_populated_places
&outputFormat=application/json&srsName=EPSG:4326&count=50&bbox=76.2,7.9,80.6,13.5,EPSG:4326
```

### WFS `GetFeature` fallback (WFS 1.1.0)

```text
/api/ogc/wfs?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&typeName=ne:ne_10m_populated_places
&outputFormat=application/json&srsName=EPSG:4326&maxFeatures=50&bbox=76.2,7.9,80.6,13.5,EPSG:4326
```

## Curated Layers Queried

- **WMS:** MODIS true color, NDVI 8-day, land surface temperature (day) — three layers, all confirmed against NASA GIBS documentation.
- **WFS:** `ne:ne_10m_populated_places`, `ne:ne_10m_roads` — the only two globally-relevant, EPSG:4326-native feature types this GeoServer demo actually publishes. Verified directly against its `GetCapabilities` response on 2026-07-22; do not add other typeNames without re-checking that response first.

## Bottlenecks Observed

1. WMS `GetCapabilities` can be large and slower than tile requests.  
2. WMS layer switching can feel laggy when old tiles overlap while new tiles load.  
3. **Invalid WFS typeNames returned HTTP 400 with no fallback.** Five of the original curated WFS layers referenced feature type names (`ne:coastlines`, `ne:boundary_lines_land`, `ne:rivers_lake_centerlines`, `ne:lakes`, and an incorrectly-named `ne:populated_places`) that do not exist on `ahocevar.com/geoserver/wfs` at all — confirmed by inspecting its actual `GetCapabilities` response, which publishes only `ne:ne_10m_populated_places`, `ne:ne_10m_roads`, `topp:states`, and `osm:water_areas`. GeoServer's "unknown feature type" response is an HTTP 400, which the original fallback logic didn't catch (see below), so requests failed with no retry and no clear error message.
4. **WFS fallback logic swallowed HTTP errors.** The original `wfsGetFeature()` implementation called the WFS 2.0.0 request outside its try/catch block, so any non-2xx response threw immediately and skipped the WFS 1.1.0 fallback entirely — the fallback only ever triggered on a 200 response containing unparseable JSON (e.g. an OGC exception body), never on an actual HTTP error status.
5. **Serverless timeout mismatch on Vercel.** The OGC proxy's internal upstream timeout (originally 20s) exceeded Vercel's default serverless function execution limit, so slow upstream responses could be killed by the platform before the proxy's own timeout fired — surfacing in the UI as tiles stuck on "loading" indefinitely with no error.

## Mitigations Implemented

1. Backend OGC proxy routes (`/api/ogc/wms`, `/api/ogc/wfs`) with timeout handling and cached capabilities responses.  
2. WMS overlay remount on layer switch with explicit loading/ready/error state.  
3. WFS request cancellation + stale-response guards + tries WFS 2.0.0 (lat,lon), WFS 2.0.0 (lon,lat), then WFS 1.1.0 (lon,lat) in sequence, since different GeoServer deployments handle EPSG:4326 axis order inconsistently.
4. Curated layer lists trimmed to only WMS/WFS layers independently verified against the upstream server's actual `GetCapabilities` response, rather than assumed-correct identifiers.
