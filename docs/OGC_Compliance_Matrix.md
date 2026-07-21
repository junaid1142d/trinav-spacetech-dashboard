# OGC Compliance Matrix & Specifications Report

**Platform:** TRINAV SPACETECH — Atmospheric Pressure Monitoring Dashboard  
**Developer:** Junaid Ahmed  
**Compliance Target:** OGC SensorThings API 1.1 | OGC WMS 1.3.0 | OGC WFS 2.0.0  
**Backend:** Node.js / Express REST API  
**Data Storage & Telemetry:** Azure Data Explorer (ADX) Ready  

---

## 1. OGC SensorThings API v1.1 Conformance Summary

| Entity / Function | OGC Spec Requirement | Implementation Status | Implementation Details |
| :--- | :--- | :--- | :--- |
| **Things** | Core Entity | ✅ Compliant | Represents 38 Tamil Nadu telemetry nodes with district metadata (`/v1.1/Things`) |
| **Locations** | Core Entity | ✅ Compliant | Geospatial centroid GeoJSON Points (`/v1.1/Locations`) |
| **HistoricalLocations**| Extension | ✅ Compliant | Tracks movement / timeline history of sensors (`/v1.1/HistoricalLocations`) |
| **Datastreams** | Core Entity | ✅ Compliant | Links Things → Sensors → ObservedProperties (`/v1.1/Datastreams`) |
| **Sensors** | Core Entity | ✅ Compliant | Bosch BMP390 & Pyranometer metadata (`/v1.1/Sensors`) |
| **ObservedProperties** | Core Entity | ✅ Compliant | Barometric Pressure (hPa), GHI (kWh/m²/day), Wind Power Density (`/v1.1/ObservedProperties`) |
| **FeaturesOfInterest**| Core Entity | ✅ Compliant | Regional Tamil Nadu Troposphere air column (`/v1.1/FeaturesOfInterest`) |
| **Observations** | Core Entity | ✅ Compliant | Barometric timeseries measurements linked to Datastreams (`/v1.1/Observations`) |

---

## 2. OData 4.0 Query Capabilities

| OData Query Option | Spec Description | Status | Example Query Endpoint |
| :--- | :--- | :--- | :--- |
| `$filter` | Filter by comparison/logical ops | ✅ Implemented | `/v1.1/Observations?$filter=result gt 1010` |
| `$expand` | Expand related entities | ✅ Implemented | `/v1.1/Things?$expand=Datastreams/Observations` |
| `$select` | Field projections | ✅ Implemented | `/v1.1/Things?$select=name,properties` |
| `$orderby` | Sort ascending / descending | ✅ Implemented | `/v1.1/Observations?$orderby=result desc` |
| `$top` | Page size limit | ✅ Implemented | `/v1.1/Observations?$top=10` |
| `$skip` | Pagination offset | ✅ Implemented | `/v1.1/Observations?$skip=20&$top=10` |
| `$count` | Inline total entity count | ✅ Implemented | `/v1.1/Locations?$count=true` |

---

## 3. OGC WMS & WFS Interoperability

| Protocol | Operation | Status | Live Endpoint Used |
| :--- | :--- | :--- | :--- |
| **WMS 1.3.0** | `GetCapabilities` | ✅ Live XML Parsing | NASA GIBS (`gibs.earthdata.nasa.gov`) |
| **WMS 1.3.0** | `GetMap` | ✅ Live Overlay | MODIS, VIIRS, AOD, Cloud Fraction, Elevation |
| **WFS 2.0.0** | `GetCapabilities` | ✅ Live Feature Discovery | GeoServer (`ahocevar.com/geoserver/wfs`) |
| **WFS 2.0.0** | `GetFeature` | ✅ BBOX GeoJSON Vector | Populated Places, Coastlines, Boundaries, Rivers |
| **WFS 2.0.0** | `DescribeFeatureType` | ✅ Schema Query | XML Schema discovery |

---

## 4. Architecture Diagram

```
┌───────────────────────────────────────────────────────────┐
│                     Client Dashboard                      │
│ ┌──────────────────────┐ ┌──────────────┐ ┌─────────────┐ │
│ │ Tamil Nilam GIS Maps │ │ Analytics UI │ │ OData UI    │ │
│ └──────────┬───────────┘ └──────┬───────┘ └──────┬──────┘ │
└────────────┼────────────────────┼────────────────┼────────┘
             │                    │                │
             ▼                    ▼                ▼
┌───────────────────────────────────────────────────────────┐
│           Node.js / Express Server (server.js)            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ OGC SensorThings v1.1 Router (/v1.1/*)              │  │
│  │ ├─ /Things                   ├─ /Locations          │  │
│  │ ├─ /Datastreams              ├─ /Sensors            │  │
│  │ ├─ /ObservedProperties       ├─ /Observations       │  │
│  │ └─ /FeaturesOfInterest       └─ /HistoricalLocations│  │
│  └──────────────────────────┬──────────────────────────┘  │
│                             │                             │
│  ┌──────────────────────────┴──────────────────────────┐  │
│  │ OData Query Parser ($filter, $expand, $select, etc) │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────┬─────────────────────────────┘
                              │
             ┌────────────────┴────────────────┐
             ▼                                 ▼
┌──────────────────────────┐     ┌──────────────────────────┐
│  Tamil Nadu 38-District  │     │   Azure Data Explorer    │
│  Geospatial Telemetry    │     │   (ADX Cluster KQL)      │
└──────────────────────────┘     └──────────────────────────┘
```
