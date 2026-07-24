import express from 'express';

const router = express.Router();

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const REQUEST_TIMEOUT_MS = 20000;

// Query builders. All scoped to a bbox (south,west,north,east — Overpass's
// native order) and kept deliberately narrow (major roads only, not every
// residential street) to keep payload size and query time reasonable for a
// state-sized bounding box.
const QUERY_BUILDERS = {
  roads: (bbox) => `
    [out:json][timeout:25];
    way["highway"~"^(motorway|trunk|primary|secondary)$"](${bbox});
    out geom;
  `,
  substations: (bbox) => `
    [out:json][timeout:25];
    (
      node["power"="substation"](${bbox});
      way["power"="substation"](${bbox});
    );
    out geom;
  `,
  transmission_lines: (bbox) => `
    [out:json][timeout:25];
    way["power"="line"](${bbox});
    out geom;
  `,
  boundary: (bbox) => `
    [out:json][timeout:25];
    relation["admin_level"="4"]["name"="Tamil Nadu"](${bbox});
    out geom;
  `,
};

// Converts Overpass JSON ("out geom;" response, which inlines lat/lon per
// node so no separate node-resolution pass is needed) into a standard
// GeoJSON FeatureCollection.
function overpassToGeoJSON(overpassJson) {
  const features = [];

  for (const el of overpassJson.elements || []) {
    if (el.type === 'node' && el.lat != null && el.lon != null) {
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [el.lon, el.lat] },
        properties: el.tags || {},
      });
    } else if (el.type === 'way' && Array.isArray(el.geometry)) {
      const coords = el.geometry.map((pt) => [pt.lon, pt.lat]);
      const isClosed = coords.length > 2 &&
        coords[0][0] === coords[coords.length - 1][0] &&
        coords[0][1] === coords[coords.length - 1][1];
      features.push({
        type: 'Feature',
        geometry: isClosed
          ? { type: 'Polygon', coordinates: [coords] }
          : { type: 'LineString', coordinates: coords },
        properties: el.tags || {},
      });
    } else if (el.type === 'relation' && Array.isArray(el.members)) {
      // Relations (e.g. admin boundaries) carry geometry on their member
      // ways, not on the relation itself. Flatten member way geometries
      // into a MultiLineString rather than attempting full polygon ring
      // assembly, which Overpass doesn't do for us.
      const lines = el.members
        .filter((m) => m.type === 'way' && Array.isArray(m.geometry))
        .map((m) => m.geometry.map((pt) => [pt.lon, pt.lat]));
      if (lines.length) {
        features.push({
          type: 'Feature',
          geometry: { type: 'MultiLineString', coordinates: lines },
          properties: el.tags || {},
        });
      }
    }
  }

  return { type: 'FeatureCollection', features };
}

router.get('/query', async (req, res) => {
  const { dataset, bbox } = req.query;

  const builder = QUERY_BUILDERS[dataset];
  if (!builder) {
    res.status(400).json({ error: `Unknown OSM dataset '${dataset}'. Valid: ${Object.keys(QUERY_BUILDERS).join(', ')}` });
    return;
  }
  if (!bbox) {
    res.status(400).json({ error: 'bbox query param is required (format: south,west,north,east)' });
    return;
  }

  const query = builder(bbox);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const upstreamResponse = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });

    if (!upstreamResponse.ok) {
      const text = await upstreamResponse.text();
      res.status(upstreamResponse.status).json({ error: `Overpass API error: ${text.slice(0, 300)}` });
      return;
    }

    const overpassJson = await upstreamResponse.json();
    const geojson = overpassToGeoJSON(overpassJson);
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.status(200).json(geojson);
  } catch (error) {
    const timeoutError = error?.name === 'AbortError';
    res.status(timeoutError ? 504 : 502).json({
      error: timeoutError ? 'Overpass request timed out.' : `Failed to reach Overpass API: ${error.message}`,
    });
  } finally {
    clearTimeout(timeout);
  }
});

export default router;
