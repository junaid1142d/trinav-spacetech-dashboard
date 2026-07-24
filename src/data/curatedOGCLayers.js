/**
 * Curated OGC Layers for Renewable Energy Land Suitability Assessment
 * 
 * DATA SOURCES:
 * - Solar Irradiance: NASA POWER (Prediction of Worldwide Energy Resources) v2.2.3
 *   Average daily Global Horizontal Irradiance per district centroid (2001-2020 climatology)
 * - Wind Power Density: National Institute of Wind Energy (NIWE), Chennai
 *   Based on 100m hub height wind resource maps for Tamil Nadu
 * - Grid Proximity: PGCIL (Power Grid Corporation of India) transmission network maps
 *   Estimated distance from district centroid to nearest 220kV/400kV substation
 * - Terrain/Land Use: NRSC/ISRO LULC Classification (56m resolution, 2021-22)
 * - Population: Census of India 2011 (projected estimates)
 * - Suitability Scores: Weighted composite using MCDM (Multi-Criteria Decision Making)
 *   Weights: Solar Irradiance 25%, Wind Density 25%, Land Availability 20%, Grid Access 15%, Terrain 15%
 */

// ─── Curated WMS Layers (NASA GIBS) ─────────────────
// Every layer name below was verified against the live GetCapabilities
// response at https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi
// (or GIBS's own TWMS capabilities dump) before being added here. Do not
// add a layer name from memory/guesswork -- GIBS's naming is inconsistent
// across products (e.g. "_L3_..._Monthly_Day" vs "..._Day_Monthly" vs
// "..._Daily_Day") and an unverified guess fails silently as a blank/stuck
// tile rather than a clear error.
export const CURATED_WMS_LAYERS = [
  {
    name: 'MODIS_Terra_CorrectedReflectance_TrueColor',
    title: 'Satellite Imagery (Terra True Color)',
    category: 'Base Imagery',
    relevance: 'High-resolution base imagery for visual land inspection and site verification.',
    icon: '🛰️',
  },
  {
    name: 'VIIRS_SNPP_CorrectedReflectance_TrueColor',
    title: 'Satellite Imagery (VIIRS True Color)',
    category: 'Base Imagery',
    relevance: 'VIIRS sensor provides complementary 375m-resolution coverage.',
    icon: '🛰️',
  },
  {
    name: 'MODIS_Terra_L3_NDVI_16Day',
    title: 'Vegetation Index (NDVI 16-Day)',
    category: 'Land Cover',
    relevance: 'Identifies barren/low-vegetation zones ideal for solar park placement. Low NDVI = better solar suitability.',
    icon: '🌿',
  },
  {
    name: 'MODIS_Terra_Land_Surface_Temp_Day',
    title: 'Land Surface Temperature (Day)',
    category: 'Temperature',
    relevance: 'Solar panel efficiency drops ~0.4%/°C above 25°C. Critical for panel selection and energy yield modeling.',
    icon: '🌡️',
  },
  {
    name: 'MODIS_Combined_Value_Added_AOD',
    title: 'Aerosol Optical Depth (Combined)',
    category: 'Solar Resource',
    relevance: 'Aerosol particles scatter sunlight, reducing direct normal irradiance (DNI). Relevant to CSP/solar site selection.',
    icon: '💨',
  },
];

// ─── Curated WFS Layers (GeoServer) ─────────────────
// IMPORTANT: this server (ahocevar.com/geoserver/wfs) publishes exactly
// four feature types: ne:ne_10m_populated_places, ne:ne_10m_roads,
// topp:states (US-only), and osm:water_areas (EPSG:900913, not 4326).
// Verified directly against its GetCapabilities response. Only the two
// globally-relevant, EPSG:4326-native layers are listed here — do not add
// invented typeNames (e.g. "ne:coastlines", "ne:lakes") without confirming
// they exist in that server's actual GetCapabilities first; GeoServer
// returns an HTTP 400 "unknown feature type" for anything else, and no
// amount of BBOX/axis-order fixing will change that.
export const CURATED_WFS_LAYERS = [
  {
    name: 'ne:ne_10m_populated_places',
    title: 'Populated Places (Cities & Towns)',
    category: 'Infrastructure',
    relevance: 'Urban centers indicate grid infrastructure proximity and labor availability for solar/wind park construction.',
    icon: '🏙️',
    defaultBBOX: '76.2,7.9,80.6,13.5',
    maxFeatures: 50,
  },
  {
    name: 'ne:ne_10m_roads',
    title: 'Major Roads',
    category: 'Infrastructure',
    relevance: 'Road proximity affects construction logistics and transmission line routing for solar/wind sites.',
    icon: '🛣️',
    defaultBBOX: '76.2,7.9,80.6,13.5',
    maxFeatures: 80,
  },
];

// ─── Data Source Attribution ─────────────────────────
export const DATA_SOURCES = [
  { metric: 'Solar Irradiance (kWh/m²/day)', source: 'NASA POWER v2.2.3', url: 'https://power.larc.nasa.gov/', method: '20-year climatological average of Global Horizontal Irradiance (GHI) at district centroid' },
  { metric: 'Wind Power Density (W/m²)', source: 'NIWE Wind Atlas', url: 'https://niwe.res.in/', method: 'Annual mean wind power density at 100m hub height from mesoscale modeling' },
  { metric: 'Grid Proximity (km)', source: 'PGCIL Network Maps', url: 'https://www.powergrid.in/', method: 'Euclidean distance from district centroid to nearest 220kV+ substation' },
  { metric: 'Land Use Classification', source: 'NRSC/ISRO LULC', url: 'https://bhuvan.nrsc.gov.in/', method: 'AWiFS 56m resolution national land use/land cover database (2021-22)' },
  { metric: 'Terrain Type', source: 'ASTER GDEM v3', url: 'https://asterweb.jpl.nasa.gov/', method: '30m resolution digital elevation model with slope/aspect classification' },
  { metric: 'Suitability Scores', source: 'MCDM Composite', url: null, method: 'Weighted scoring: Solar 25%, Wind 25%, Land 20%, Grid 15%, Terrain 15%' },
];

export const OGC_SERVICES_CONFIG = {
  WMS: {
    name: 'NASA GIBS',
    url: '/api/ogc/wms',
    version: '1.3.0',
    crs: 'EPSG:3857',
    description: 'NASA Global Imagery Browse Services — satellite imagery and derived environmental products',
  },
  WFS: {
    name: 'GeoServer (Natural Earth)',
    url: '/api/ogc/wfs',
    version: '2.0.0',
    crs: 'EPSG:4326',
    description: 'OGC WFS endpoint serving Natural Earth vector datasets for geographic context',
  },
  OSM: {
    name: 'OpenStreetMap (Overpass API)',
    url: '/api/osm/query',
    version: 'Overpass QL 0.7',
    crs: 'EPSG:4326',
    description: 'Real transportation and power infrastructure data for Tamil Nadu — not OGC WFS, a different protocol, but far more complete than the Natural Earth demo layers for a state-sized area.',
  },
};

// ─── Curated OSM Infrastructure Layers (via Overpass) ────────
// Honestly labeled as OSM/Overpass rather than WFS -- Overpass QL is a
// distinct protocol from OGC WFS, even though the output is converted to
// GeoJSON and renders identically on the map. Each `dataset` value maps to
// a query builder in server/routes/osmProxy.js.
export const CURATED_OSM_LAYERS = [
  {
    dataset: 'roads',
    title: 'Major Roads (Motorway/Trunk/Primary/Secondary)',
    category: 'Transportation',
    relevance: 'Real OSM road network, replacing the sparse Natural Earth demo layer. Distance-to-road is a standard exclusion/cost factor in solar and wind site suitability.',
    icon: '🛣️',
  },
  {
    dataset: 'substations',
    title: 'Power Substations',
    category: 'Grid Infrastructure',
    relevance: 'Grid connection cost rises sharply with distance to the nearest substation — one of the highest-weight factors in utility-scale renewable siting.',
    icon: '⚡',
  },
  {
    dataset: 'transmission_lines',
    title: 'Transmission Lines',
    category: 'Grid Infrastructure',
    relevance: 'Existing transmission corridors reduce interconnection cost for new solar/wind capacity sited nearby.',
    icon: '🔌',
  },
  {
    dataset: 'boundary',
    title: 'Tamil Nadu State Boundary',
    category: 'Administrative',
    relevance: 'Real administrative boundary from OSM, replacing the static hand-drawn rectangle previously used as a placeholder.',
    icon: '🗺️',
  },
];
