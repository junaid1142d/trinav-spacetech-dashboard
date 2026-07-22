import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import app from './server/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const port = process.env.PORT || 8080;

// ── Serve Production Built Frontend ────────────────────────────────
app.use(express.static(join(__dirname, 'dist')));

// SPA Catchall
// NOTE: Express 5 (path-to-regexp v8) rejects a bare '*' route pattern —
// it throws a PathError at process startup, before the server can bind to
// a port. Since this handler is last in the stack anyway, a path-less
// app.use() serves as the catch-all without needing wildcard syntax.
app.use((req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`[Trinav SpaceTech] Server listening on port ${port}`);
  console.log(`[OGC SensorThings] API 1.1 available at http://localhost:${port}/v1.1/`);
});
