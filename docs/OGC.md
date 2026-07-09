# OGC WMS and WFS Integration

This dashboard integrates public OGC services with the existing Trinav SpaceTech SensorThings pressure-station layer.

## WMS

- Endpoint: `https://ahocevar.com/geoserver/wms`
- Layer name: `ne:NE1_HR_LC_SR_W_DR`
- Layer description: Natural Earth raster background suitable as an environmental context layer.
- CRS used by the client: `EPSG:3857`
- WMS version: `1.1.1`
- Image format: `image/png`
- OpenLayers source: `TileWMS`

### GetCapabilities URL

```text
https://ahocevar.com/geoserver/wms?service=WMS&version=1.1.1&request=GetCapabilities
```

### GetMap Request

OpenLayers generates tiled `GetMap` requests from `TileWMS`. A representative request is:

```text
https://ahocevar.com/geoserver/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=ne%3ANE1_HR_LC_SR_W_DR&FORMAT=image%2Fpng&TRANSPARENT=true&SRS=EPSG%3A3857&BBOX={tileBbox}&WIDTH=256&HEIGHT=256
```

## WFS

- Endpoint: `https://ahocevar.com/geoserver/wfs`
- Feature type: `ne:ne_10m_admin_0_countries`
- CRS requested by the client: `EPSG:3857`
- WFS version: `1.1.0`
- Output format: `application/json`
- OpenLayers source: `VectorSource` with BBOX loading strategy.

### GetCapabilities URL

```text
https://ahocevar.com/geoserver/wfs?service=WFS&version=1.1.0&request=GetCapabilities
```

### DescribeFeatureType URL

```text
https://ahocevar.com/geoserver/wfs?service=WFS&version=1.1.0&request=DescribeFeatureType&typeName=ne%3Ane_10m_admin_0_countries
```

### GetFeature Request

The client builds `GetFeature` requests from the current map extent:

```text
https://ahocevar.com/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=ne%3Ane_10m_admin_0_countries&outputFormat=application%2Fjson&srsName=EPSG%3A3857&bbox={minX},{minY},{maxX},{maxY},EPSG%3A3857
```

## BBOX Usage

The WFS layer uses OpenLayers `bbox` loading strategy. Only features intersecting the current map extent are requested. Loaded extents are cached by rounded extent key to avoid repeated requests while panning or zooming across the same area. Failed extents are removed from the cache so retry can request them again.

## Performance and Reliability Notes

- OGC metadata requests are lazy: `GetCapabilities` and `DescribeFeatureType` run only when WMS or WFS layers are enabled.
- WMS raster loading is delegated to OpenLayers tiled rendering to avoid requesting a full-viewport image on every movement.
- WFS features are requested as GeoJSON and clipped by BBOX to avoid downloading global vectors unnecessarily.
- Network requests use timeout and retry handling.
- The layer panel exposes loading, ready, error, and retry states.
- If the public OGC service is unavailable, the base map and existing pressure-station SensorThings layer remain usable.
- Public demo OGC servers can be slower than production services and may throttle traffic. For production deployments, use an enterprise GeoServer, MapServer, ArcGIS Server, or cloud OGC endpoint with uptime and CORS guarantees.
