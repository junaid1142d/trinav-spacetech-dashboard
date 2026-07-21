import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sensorThingsRouter from './server/routes/sensorthings.js';
import ogcProxyRouter from './server/routes/ogcProxy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// CORS & JSON Body Parsing
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use(express.json());

// ── Mount OGC SensorThings API v1.1 Router ─────────────────────────
app.use('/v1.1', sensorThingsRouter);
app.use('/api/ogc', ogcProxyRouter);

// ── Serve Production Built Frontend ────────────────────────────────
app.use(express.static(join(__dirname, 'dist')));

// SPA Catchall
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`[Trinav SpaceTech] Server listening on port ${port}`);
  console.log(`[OGC SensorThings] API 1.1 available at http://localhost:${port}/v1.1/`);
});
