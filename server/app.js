import express from 'express';
import sensorThingsRouter from './routes/sensorthings.js';
import ogcProxyRouter from './routes/ogcProxy.js';
import osmProxyRouter from './routes/osmProxy.js';

// This module builds the Express app with just the API routes — no static
// file serving and no app.listen(). That lets the same routing logic run:
//   - as a long-lived Node process on Azure App Service (server.js), and
//   - as a Vercel serverless function (api/index.js)
// without duplicating the /v1.1 and /api/ogc route wiring in two places.

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use(express.json());

app.use('/v1.1', sensorThingsRouter);
app.use('/api/ogc', ogcProxyRouter);
app.use('/api/osm', osmProxyRouter);

export default app;
