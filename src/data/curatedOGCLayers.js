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
// Only layers relevant to solar/wind energy site assessment
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
    relevance: 'VIIRS sensor provides complementary coverage with 375m resolution.',
    icon: '🛰️',
  },
  {
    name: 'MODIS_Terra_NDVI_8Day',
    title: 'Vegetation Index (NDVI 8-Day)',
    category: 'Land Cover',
    relevance: 'Identifies barren/low-vegetation zones ideal for solar park placement. Low NDVI = better solar suitability.',
    icon: '🌿',
  },
  {
    name: 'MODIS_Terra_Land_Surface_Temp_Day_Monthly',
    title: 'Land Surface Temperature (Day)',
    category: 'Temperature',
    relevance: 'Solar panel efficiency drops ~0.4%/°C above 25°C. Critical for panel selection and energy yield modeling.',
    icon: '🌡️',
  },
  {
    name: 'MODIS_Aqua_Cloud_Fraction_Day_Monthly',
    title: 'Cloud Fraction (Monthly)',
    category: 'Solar Resource',
    relevance: 'Cloud cover directly reduces solar irradiance. Districts with <30% cloud fraction are preferred for solar parks.',
    icon: '☁️',
  },
  {
    name: 'MODIS_Combined_Value_Added_AOD',
    title: 'Aerosol Optical Depth',
    category: 'Solar Resource',
    relevance: 'Aerosol particles scatter sunlight, reducing direct normal irradiance (DNI). Critical for CSP technology selection.',
    icon: '💨',
  },
  {
    name: 'ASTER_GDEM_Color_Shaded_Relief',
    title: 'Terrain Elevation (ASTER)',
    category: 'Topography',
    relevance: 'Elevation and slope analysis for wind turbine placement. Ridge lines and elevated plateaus have higher wind speeds.',
    icon: '⛰️',
  },
  {
    name: 'VIIRS_SNPP_DayNightBand_At_Sensor_Radiance',
    title: 'Night Lights (VIIRS Day/Night)',
    category: 'Infrastructure',
    relevance: 'Night light intensity correlates with grid infrastructure density and urbanization. Identifies transmission corridors.',
    icon: '🔦',
  },
];

// ─── Curated WFS Layers (GeoServer) ─────────────────
// Layers filtered for Tamil Nadu renewable energy context
export const CURATED_WFS_LAYERS = [
  {
    name: 'ne:populated_places',
    title: 'Populated Places (Cities & Towns)',
    category: 'Infrastructure',
    relevance: 'Urban centers indicate grid infrastructure proximity and labor availability for solar/wind park construction.',
    icon: '🏙️',
    defaultBBOX: '76.2,7.9,80.6,13.5',
    maxFeatures: 50,
  },
  {
    name: 'ne:coastlines',
    title: 'Coastline Boundaries',
    category: 'Geography',
    relevance: 'Coastal zones have highest wind potential. Identifies offshore wind opportunity zones along Tamil Nadu coast.',
    icon: '🌊',
    defaultBBOX: '76.0,7.5,81.0,14.0',
    maxFeatures: 50,
  },
  {
    name: 'ne:boundary_lines_land',
    title: 'Land Boundaries (Administrative)',
    category: 'Administrative',
    relevance: 'State and international boundaries define regulatory jurisdictions for renewable energy permits.',
    icon: '🗺️',
    defaultBBOX: '76.0,7.5,81.0,14.0',
    maxFeatures: 30,
  },
  {
    name: 'ne:rivers_lake_centerlines',
    title: 'Rivers & Lake Centerlines',
    category: 'Hydrology',
    relevance: 'Water bodies are exclusion zones for solar parks. River corridors indicate flood risk for ground-mounted PV.',
    icon: '🏞️',
    defaultBBOX: '76.2,7.9,80.6,13.5',
    maxFeatures: 80,
  },
  {
    name: 'ne:lakes',
    title: 'Lakes & Reservoirs',
    category: 'Hydrology',
    relevance: 'Large water bodies are exclusion zones but floating solar (FSPV) opportunities exist on reservoirs.',
    icon: '💧',
    defaultBBOX: '76.2,7.9,80.6,13.5',
    maxFeatures: 50,
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
    url: 'https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi',
    version: '1.3.0',
    crs: 'EPSG:3857',
    description: 'NASA Global Imagery Browse Services — satellite imagery and derived environmental products',
  },
  WFS: {
    name: 'GeoServer (Natural Earth)',
    url: 'https://ahocevar.com/geoserver/wfs',
    version: '2.0.0',
    crs: 'EPSG:4326',
    description: 'OGC WFS endpoint serving Natural Earth vector datasets for geographic context',
  },
};
