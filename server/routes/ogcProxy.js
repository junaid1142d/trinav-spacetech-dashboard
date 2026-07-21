import express from 'express';

const router = express.Router();

const OGC_UPSTREAMS = {
  wms: {
    baseUrl: 'https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi',
    service: 'WMS',
    version: '1.3.0',
  },
  wfs: {
    baseUrl: 'https://ahocevar.com/geoserver/wfs',
    service: 'WFS',
    version: '2.0.0',
  },
};

const REQUEST_TIMEOUT_MS = 20000;
const CAPABILITIES_CACHE_TTL_MS = 5 * 60 * 1000;
const capabilitiesCache = new Map();

function normalizeQuery(query) {
  const normalized = {};
  Object.entries(query).forEach(([key, value]) => {
    const finalValue = Array.isArray(value) ? value[value.length - 1] : value;
    normalized[key.toLowerCase()] = finalValue;
  });
  return normalized;
}

function appendQueryParams(url, query) {
  const next = new URL(url);
  Object.entries(query).forEach(([key, value]) => {
    if (value == null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((item) => next.searchParams.append(key, String(item)));
      return;
    }
    next.searchParams.set(key, String(value));
  });
  return next.toString();
}

function createCacheKey(target, query) {
  const pairs = Object.entries(query)
    .map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : String(value)])
    .sort(([a], [b]) => a.localeCompare(b));
  return `${target}:${new URLSearchParams(pairs).toString()}`;
}

async function proxyRequest(req, res, target) {
  const upstream = OGC_UPSTREAMS[target];
  if (!upstream) {
    res.status(500).json({ error: 'Unsupported OGC proxy target.' });
    return;
  }

  const query = { ...req.query };
  const normalized = normalizeQuery(query);
  const requestType = (normalized.request || '').toUpperCase();
  const isGetCapabilities = requestType === 'GETCAPABILITIES';

  if (!normalized.service) query.SERVICE = upstream.service;
  if (!normalized.version) query.VERSION = upstream.version;

  const cacheKey = isGetCapabilities ? createCacheKey(target, query) : null;
  if (cacheKey && capabilitiesCache.has(cacheKey)) {
    const cached = capabilitiesCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CAPABILITIES_CACHE_TTL_MS) {
      res.setHeader('Content-Type', cached.contentType);
      res.setHeader('Cache-Control', 'public, max-age=120');
      res.setHeader('X-OGC-Proxy-Cache', 'HIT');
      res.status(200).send(cached.buffer);
      return;
    }
    capabilitiesCache.delete(cacheKey);
  }

  const upstreamUrl = appendQueryParams(upstream.baseUrl, query);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let upstreamResponse;
  try {
    upstreamResponse = await fetch(upstreamUrl, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
    });
  } catch (error) {
    clearTimeout(timeout);
    const timeoutError = error?.name === 'AbortError';
    res.status(timeoutError ? 504 : 502).json({
      error: timeoutError ? 'Upstream OGC request timed out.' : 'Failed to reach upstream OGC service.',
    });
    return;
  }

  clearTimeout(timeout);
  const buffer = Buffer.from(await upstreamResponse.arrayBuffer());
  const contentType =
    upstreamResponse.headers.get('content-type') ||
    (target === 'wms' ? 'application/xml; charset=utf-8' : 'application/json; charset=utf-8');

  if (cacheKey && upstreamResponse.ok) {
    capabilitiesCache.set(cacheKey, { timestamp: Date.now(), buffer, contentType });
  }

  res.setHeader('Content-Type', contentType);
  res.setHeader('X-OGC-Proxy-Cache', cacheKey ? 'MISS' : 'BYPASS');
  res.setHeader('X-OGC-Upstream', upstream.baseUrl);
  res.setHeader('Cache-Control', cacheKey ? 'public, max-age=120' : 'no-store');
  res.status(upstreamResponse.status).send(buffer);
}

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    services: {
      wms: OGC_UPSTREAMS.wms.baseUrl,
      wfs: OGC_UPSTREAMS.wfs.baseUrl,
    },
    timestamp: new Date().toISOString(),
  });
});

router.get('/wms', (req, res) => proxyRequest(req, res, 'wms'));
router.get('/wfs', (req, res) => proxyRequest(req, res, 'wfs'));

export default router;
