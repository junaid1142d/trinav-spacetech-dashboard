import express from 'express';
import { ENTITY_MAP } from '../sensorthings/model.js';
import { processODataQuery } from '../sensorthings/odataParser.js';

const router = express.Router();

// Root Capabilities Document
router.get('/', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}/v1.1`;
  res.json({
    name: 'Trinav SpaceTech OGC SensorThings API 1.1 Server',
    serverVersion: '1.1.0',
    complianceLevel: 'Core + OData Query + HistoricalLocations',
    value: [
      { name: 'Things', url: `${baseUrl}/Things` },
      { name: 'Locations', url: `${baseUrl}/Locations` },
      { name: 'HistoricalLocations', url: `${baseUrl}/HistoricalLocations` },
      { name: 'Datastreams', url: `${baseUrl}/Datastreams` },
      { name: 'Sensors', url: `${baseUrl}/Sensors` },
      { name: 'ObservedProperties', url: `${baseUrl}/ObservedProperties` },
      { name: 'FeaturesOfInterest', url: `${baseUrl}/FeaturesOfInterest` },
      { name: 'Observations', url: `${baseUrl}/Observations` },
    ],
  });
});

// Entity Collection Handler
const handleCollection = (entityName) => (req, res) => {
  const result = processODataQuery(entityName, req.query);
  if (!result) {
    return res.status(404).json({ error: `Entity collection '${entityName}' not found.` });
  }
  res.setHeader('Content-Type', 'application/json');
  res.json(result);
};

// Single Entity Handler
const handleSingleEntity = (entityName) => (req, res) => {
  const id = req.params.id;
  const list = ENTITY_MAP[entityName];
  const item = list?.find(e => e['@iot.id'] === id);
  if (!item) {
    return res.status(404).json({ error: `${entityName} with @iot.id '${id}' not found.` });
  }
  res.json(item);
};

// Register Routes for all 8 SensorThings Entities
const entities = [
  'Things',
  'Locations',
  'HistoricalLocations',
  'Datastreams',
  'Sensors',
  'ObservedProperties',
  'FeaturesOfInterest',
  'Observations',
];

entities.forEach(entity => {
  router.get(`/${entity}`, handleCollection(entity));
  router.get(`/${entity}\\(:id\\)`, handleSingleEntity(entity));
  router.get(`/${entity}/:id`, handleSingleEntity(entity));
});

export default router;
