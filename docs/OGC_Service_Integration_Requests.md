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
/api/ogc/wfs?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&typeNames=ne:populated_places
&outputFormat=application/json&srsName=EPSG:4326&count=50&bbox=76.2,7.9,80.6,13.5,EPSG:4326
```

### WFS `GetFeature` fallback (WFS 1.1.0)

```text
/api/ogc/wfs?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&typeName=ne:populated_places
&outputFormat=application/json&srsName=EPSG:4326&maxFeatures=50&bbox=76.2,7.9,80.6,13.5,EPSG:4326
```

## Curated Layers Queried

- **WMS:** MODIS/VIIRS true color, NDVI, LST, cloud fraction, AOD, ASTER relief, night lights
- **WFS:** `ne:populated_places`, `ne:coastlines`, `ne:boundary_lines_land`, `ne:rivers_lake_centerlines`, `ne:lakes`

## Bottlenecks Observed

1. WMS `GetCapabilities` can be large and slower than tile requests.  
2. WMS layer switching can feel laggy when old tiles overlap while new tiles load.  
3. WFS responses may fail on strict servers when only one WFS version/parameter style is used.

## Mitigations Implemented

1. Backend OGC proxy routes (`/api/ogc/wms`, `/api/ogc/wfs`) with timeout handling and cached capabilities responses.  
2. WMS overlay remount on layer switch with explicit loading/ready/error state.  
3. WFS request cancellation + stale-response guards + WFS 2.0.0 -> 1.1.0 fallback handling.
