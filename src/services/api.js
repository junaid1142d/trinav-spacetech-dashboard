/**
 * OGC Service Manager
 * Handles WMS (NASA GIBS) and WFS (GeoServer) requests
 * Implements GetCapabilities, GetMap, GetFeature, DescribeFeatureType
 */

export const OGC_SERVICES = {
  NASA_GIBS: {
    name: 'NASA GIBS (WMS)',
    url: 'https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi',
    type: 'WMS',
    version: '1.3.0',
  },
  GEOSERVER: {
    name: 'GeoServer WFS Demo',
    url: 'https://ahocevar.com/geoserver/wfs',
    type: 'WFS',
    version: '2.0.0',
  },
};

// Request log store (module-level reactive array)
export const requestLogs = [];
let logListeners = [];
export const onRequestLog = (fn) => { logListeners.push(fn); return () => { logListeners = logListeners.filter(l => l !== fn); }; };
const pushLog = (log) => { requestLogs.unshift({ ...log, id: Date.now() + Math.random() }); if (requestLogs.length > 50) requestLogs.pop(); logListeners.forEach(fn => fn([...requestLogs])); };

function buildOgcUrl(serviceUrl, params) {
  const resolved = new URL(serviceUrl, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === '') return;
    resolved.searchParams.set(key, String(value));
  });
  return resolved.toString();
}

function getDirectChildText(node, localName) {
  const child = Array.from(node.children || []).find((item) => item.localName === localName);
  return child?.textContent?.trim() || '';
}

// Fetch with timing, error handling, and logging
async function timedFetch(url, label, signal) {
  const start = Date.now();
  pushLog({ url, label, status: 'pending', duration: null, size: null, ts: new Date().toISOString() });
  try {
    const res = await fetch(url, { signal });
    const duration = Date.now() - start;
    const text = await res.text();
    const size = new Blob([text]).size;
    pushLog({ url, label, status: res.ok ? 'success' : 'error', httpStatus: res.status, duration, size, ts: new Date().toISOString() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return text;
  } catch (err) {
    const duration = Date.now() - start;
    pushLog({ url, label, status: 'error', httpStatus: null, duration, size: null, error: err.message, ts: new Date().toISOString() });
    throw err;
  }
}

// ─── WMS: Parse GetCapabilities ─────────────────────────────
export async function wmsGetCapabilities(serviceUrl, signal) {
  const url = buildOgcUrl(serviceUrl, {
    SERVICE: 'WMS',
    VERSION: '1.3.0',
    REQUEST: 'GetCapabilities',
  });
  const xml = await timedFetch(url, 'WMS GetCapabilities', signal);
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');

  const layerNodes = Array.from(doc.getElementsByTagNameNS('*', 'Layer'));
  const layers = [];
  const seen = new Set();
  layerNodes.forEach((node) => {
    const name = getDirectChildText(node, 'Name');
    const title = getDirectChildText(node, 'Title');
    const abstract = getDirectChildText(node, 'Abstract');
    if (name && title) {
      if (seen.has(name)) return;
      seen.add(name);
      layers.push({ name, title, abstract, serviceUrl, type: 'WMS' });
    }
  });
  return layers;
}

// ─── WFS: Parse GetCapabilities ─────────────────────────────
export async function wfsGetCapabilities(serviceUrl, signal) {
  const url = buildOgcUrl(serviceUrl, {
    SERVICE: 'WFS',
    VERSION: '2.0.0',
    REQUEST: 'GetCapabilities',
  });
  const xml = await timedFetch(url, 'WFS GetCapabilities', signal);
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');

  const featureTypes = Array.from(doc.getElementsByTagNameNS('*', 'FeatureType'));
  const layers = [];
  const seen = new Set();
  featureTypes.forEach((ft) => {
    const name = getDirectChildText(ft, 'Name');
    const title = getDirectChildText(ft, 'Title');
    const abstract = getDirectChildText(ft, 'Abstract');
    if (name && title) {
      if (seen.has(name)) return;
      seen.add(name);
      layers.push({ name, title, abstract, serviceUrl, type: 'WFS' });
    }
  });
  return layers;
}

// ─── WFS: GetFeature (GeoJSON, BBOX) ────────────────────────
export async function wfsGetFeature(serviceUrl, typeName, bbox, signal, maxFeatures = 200) {
  const requestParams = {
    SERVICE: 'WFS',
    VERSION: '2.0.0',
    REQUEST: 'GetFeature',
    typeNames: typeName,
    outputFormat: 'application/json',
    srsName: 'EPSG:4326',
    count: maxFeatures,
  };
  if (bbox) requestParams.bbox = `${bbox},EPSG:4326`;

  const url = buildOgcUrl(serviceUrl, requestParams);
  const text = await timedFetch(url, `WFS GetFeature: ${typeName}`, signal);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Invalid GeoJSON response from WFS');
  }
}

// ─── WMS: Build GetMap URL ───────────────────────────────────
export function buildWmsGetMapUrl(serviceUrl, layerName, bbox, width = 256, height = 256, crs = 'EPSG:3857') {
  return `${serviceUrl}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=${layerName}&BBOX=${bbox}&WIDTH=${width}&HEIGHT=${height}&CRS=${crs}&FORMAT=image/png&TRANSPARENT=TRUE&STYLES=`;
}

// ─── CSV Parser ──────────────────────────────────────────────
import Papa from 'papaparse';

export const parseCSVData = (file, onComplete, onError) => {
  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: (results) => onComplete(results.data),
    error: (error) => onError(error),
  });
};

export const validateCSVColumns = (headers) => {
  const required = ['Station', 'City', 'Latitude', 'Longitude', 'Timestamp', 'Pressure_hPa'];
  const missing = required.filter(f => !headers.includes(f));
  return { isValid: missing.length === 0, missingFields: missing };
};

export const calculateMetrics = (observations) => {
  if (!observations || observations.length === 0) {
    return { totalRecords: 0, totalStations: 0, avgPressure: 0, minPressure: 0, maxPressure: 0, dateRange: { start: '-', end: '-' } };
  }
  const stations = new Set();
  let total = 0, minP = Infinity, maxP = -Infinity;
  let minDate = new Date('9999-12-31'), maxDate = new Date('1000-01-01');
  observations.forEach(obs => {
    stations.add(obs.Station);
    const p = obs.Pressure_hPa;
    if (p < minP) minP = p;
    if (p > maxP) maxP = p;
    total += p;
    const d = new Date(obs.Timestamp);
    if (!isNaN(d)) { if (d < minDate) minDate = d; if (d > maxDate) maxDate = d; }
  });
  const fmt = (d) => d.getFullYear() === 9999 || d.getFullYear() === 1000 ? '-' : d.toISOString().split('T')[0];
  return {
    totalRecords: observations.length,
    totalStations: stations.size,
    avgPressure: parseFloat((total / observations.length).toFixed(2)),
    minPressure: minP === Infinity ? 0 : minP,
    maxPressure: maxP === -Infinity ? 0 : maxP,
    dateRange: { start: fmt(minDate), end: fmt(maxDate) },
  };
};

// Future Azure API placeholders
export const apiService = {
  async getStations() { console.log('[Azure Placeholder] GET /api/stations'); return null; },
  async getStationById(id) { console.log(`[Azure Placeholder] GET /api/station/${id}`); return null; },
  async getTimeseries(id, params = {}) { console.log(`[Azure Placeholder] GET /api/timeseries/${id}`, params); return null; },
};
