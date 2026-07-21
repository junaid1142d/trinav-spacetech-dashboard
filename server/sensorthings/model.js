/**
 * OGC SensorThings API v1.1 Data Store & Models
 *
 * Implements standard OGC SensorThings API 1.1 Entities:
 * - Things (Weather / Telemetry Stations)
 * - Locations (Geospatial Point / Polygon)
 * - HistoricalLocations (Movement tracking)
 * - Datastreams (Timeseries of observations)
 * - Sensors (Atmospheric pressure & weather sensor hardware specs)
 * - ObservedProperties (Barometric Pressure, Temperature, Humidity, Wind Speed)
 * - FeaturesOfInterest (Observed spatial domain e.g. Tamil Nadu Atmosphere)
 * - Observations (Live/Historical readings)
 */

import tamilnaduDistricts from '../../src/data/tamilnaduDistricts.js';

// ── 1. OBSERVED PROPERTIES ──────────────────────────────────────────
export const observedProperties = [
  {
    '@iot.id': 'op-pressure',
    '@iot.selfLink': '/v1.1/ObservedProperties("op-pressure")',
    name: 'Barometric Pressure',
    description: 'Atmospheric pressure measured in hectopascals (hPa)',
    definition: 'http://vocab.nerc.ac.uk/collection/P07/current/CFSN0015/',
    Datastreams: [],
  },
  {
    '@iot.id': 'op-solar',
    '@iot.selfLink': '/v1.1/ObservedProperties("op-solar")',
    name: 'Global Horizontal Irradiance',
    description: 'Solar irradiance measured in kWh/m²/day',
    definition: 'http://vocab.nerc.ac.uk/collection/P07/current/CFSN0017/',
    Datastreams: [],
  },
  {
    '@iot.id': 'op-wind',
    '@iot.selfLink': '/v1.1/ObservedProperties("op-wind")',
    name: 'Wind Power Density',
    description: 'Wind power density measured in W/m² at 100m hub height',
    definition: 'http://vocab.nerc.ac.uk/collection/P07/current/CFSN0020/',
    Datastreams: [],
  },
];

// ── 2. SENSORS ──────────────────────────────────────────────────────
export const sensors = [
  {
    '@iot.id': 'sensor-bmp390',
    '@iot.selfLink': '/v1.1/Sensors("sensor-bmp390")',
    name: 'Bosch BMP390 High-Precision Barometric Pressure Sensor',
    description: 'High-accuracy MEMS pressure sensor with ±0.03 hPa relative accuracy',
    encodingType: 'application/pdf',
    metadata: 'https://www.bosch-sensortec.com/products/environmental-sensors/pressure-sensors/bmp390/',
    properties: {
      manufacturer: 'Bosch Sensortec',
      model: 'BMP390',
      measurementRange: '300-1250 hPa',
      accuracy: '±0.03 hPa',
      operatingTemperature: '-40 to +85 °C',
    },
    Datastreams: [],
  },
  {
    '@iot.id': 'sensor-pyranometer',
    '@iot.selfLink': '/v1.1/Sensors("sensor-pyranometer")',
    name: 'SR30-D1 Digital Secondary Standard Pyranometer',
    description: 'Solar radiation sensor for professional photovoltaic & meteorological monitoring',
    encodingType: 'application/pdf',
    metadata: 'https://www.hukseflux.com/products/solar-radiation-sensors/',
    properties: {
      manufacturer: 'Hukseflux',
      model: 'SR30-D1',
      spectralRange: '285 to 3000 nm',
      calibrationUncertainty: '<1.2%',
    },
    Datastreams: [],
  },
];

// ── 3. FEATURES OF INTEREST ─────────────────────────────────────────
export const featuresOfInterest = [
  {
    '@iot.id': 'foi-tn-atmosphere',
    '@iot.selfLink': '/v1.1/FeaturesOfInterest("foi-tn-atmosphere")',
    name: 'Tamil Nadu Regional Troposphere',
    description: 'Lower atmospheric air column across the 38 districts of Tamil Nadu State, India',
    encodingType: 'application/geo+json',
    feature: {
      type: 'Polygon',
      coordinates: [
        [
          [76.2, 7.9],
          [80.6, 7.9],
          [80.6, 13.5],
          [76.2, 13.5],
          [76.2, 7.9],
        ],
      ],
    },
    Observations: [],
  },
];

// Generate Entities from 38 Districts
export const things = [];
export const locations = [];
export const historicalLocations = [];
export const datastreams = [];
export const observations = [];

let obsIdCounter = 1000;

tamilnaduDistricts.features.forEach((feature, idx) => {
  const p = feature.properties;
  const [lng, lat] = feature.geometry.coordinates;

  const thingId = `thing-tn-${p.name.toLowerCase().replace(/\s+/g, '-')}`;
  const locId = `location-tn-${p.name.toLowerCase().replace(/\s+/g, '-')}`;
  const histLocId = `histloc-tn-${p.name.toLowerCase().replace(/\s+/g, '-')}`;
  const dsPressureId = `ds-pressure-${p.name.toLowerCase().replace(/\s+/g, '-')}`;

  // Location
  const location = {
    '@iot.id': locId,
    '@iot.selfLink': `/v1.1/Locations("${locId}")`,
    name: `${p.name} Monitoring Site Location`,
    description: `Geospatial coordinate centroid of ${p.name} district, ${p.zone} zone`,
    encodingType: 'application/geo+json',
    location: {
      type: 'Point',
      coordinates: [lng, lat],
    },
    properties: {
      district: p.name,
      headquarters: p.hq,
      zone: p.zone,
    },
    Things: [`/v1.1/Things("${thingId}")`],
  };
  locations.push(location);

  // HistoricalLocation
  const histLoc = {
    '@iot.id': histLocId,
    '@iot.selfLink': `/v1.1/HistoricalLocations("${histLocId}")`,
    time: '2024-01-01T00:00:00.000Z',
    Thing: `/v1.1/Things("${thingId}")`,
    Locations: [`/v1.1/Locations("${locId}")`],
  };
  historicalLocations.push(histLoc);

  // Datastream (Pressure)
  const datastream = {
    '@iot.id': dsPressureId,
    '@iot.selfLink': `/v1.1/Datastreams("${dsPressureId}")`,
    name: `${p.name} Atmospheric Pressure Datastream`,
    description: `Continuous barometric pressure observations for ${p.name} station (${p.hq})`,
    observationType: 'http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement',
    unitOfMeasurement: {
      name: 'Hectopascal',
      symbol: 'hPa',
      definition: 'http://unitsofmeasure.org/ucum.html#para-hPa',
    },
    observedArea: {
      type: 'Point',
      coordinates: [lng, lat],
    },
    phenomenonTime: '2026-06-01T00:00:00.000Z/2026-07-21T23:59:59.000Z',
    resultTime: '2026-07-21T12:00:00.000Z',
    Thing: `/v1.1/Things("${thingId}")`,
    Sensor: '/v1.1/Sensors("sensor-bmp390")',
    ObservedProperty: '/v1.1/ObservedProperties("op-pressure")',
    Observations: [],
  };

  // Generate 10 historical Observations for each station
  const baseP = 1010 + (Math.sin(idx) * 6);
  for (let i = 9; i >= 0; i--) {
    const obsId = `obs-${obsIdCounter++}`;
    const d = new Date('2026-07-21T12:00:00Z');
    d.setHours(d.getHours() - i * 3);

    const noise = Math.sin(idx + i) * 1.8;
    const value = parseFloat((baseP + noise).toFixed(2));

    const obs = {
      '@iot.id': obsId,
      '@iot.selfLink': `/v1.1/Observations("${obsId}")`,
      phenomenonTime: d.toISOString(),
      resultTime: d.toISOString(),
      result: value,
      Datastream: `/v1.1/Datastreams("${dsPressureId}")`,
      FeatureOfInterest: '/v1.1/FeaturesOfInterest("foi-tn-atmosphere")',
      parameters: {
        solarIrradiance_kwh: p.solar_irradiance_kwh,
        windDensity_wm2: p.wind_density_wm2,
        gridProximity_km: p.grid_proximity_km,
        suitabilityScore: p.overall_score,
      },
    };
    observations.push(obs);
    datastream.Observations.push(`/v1.1/Observations("${obsId}")`);
  }

  datastreams.push(datastream);

  // Thing
  const thing = {
    '@iot.id': thingId,
    '@iot.selfLink': `/v1.1/Things("${thingId}")`,
    name: `${p.name} Atmospheric & Solar Telemetry Node`,
    description: `OGC SensorThings telemetry station in ${p.name} (${p.zone}), Tamil Nadu`,
    properties: {
      stationId: `TN-ST-${String(idx + 1).padStart(3, '0')}`,
      district: p.name,
      headquarters: p.hq,
      zone: p.zone,
      terrain: p.terrain,
      landUse: p.land_use,
      areaSqKm: p.area_sqkm,
      population: p.population,
      solarIrradiance_kwh: p.solar_irradiance_kwh,
      windDensity_wm2: p.wind_density_wm2,
      gridProximity_km: p.grid_proximity_km,
      suitabilitySolar: p.suitability_solar,
      suitabilityWind: p.suitability_wind,
      overallSuitabilityScore: p.overall_score,
    },
    Locations: [`/v1.1/Locations("${locId}")`],
    HistoricalLocations: [`/v1.1/HistoricalLocations("${histLocId}")`],
    Datastreams: [`/v1.1/Datastreams("${dsPressureId}")`],
  };
  things.push(thing);
});

// Update cross references
sensors[0].Datastreams = datastreams.map(d => d['@iot.selfLink']);
observedProperties[0].Datastreams = datastreams.map(d => d['@iot.selfLink']);
featuresOfInterest[0].Observations = observations.map(o => o['@iot.selfLink']);

export const ENTITY_MAP = {
  Things: things,
  Locations: locations,
  HistoricalLocations: historicalLocations,
  Datastreams: datastreams,
  Sensors: sensors,
  ObservedProperties: observedProperties,
  FeaturesOfInterest: featuresOfInterest,
  Observations: observations,
};
