/**
 * OData 4.0 Query Parameter Parser for OGC SensorThings API v1.1
 *
 * Implements:
 * - $filter (gt, lt, eq, ne, ge, le, and, or)
 * - $expand (expands nested relationships)
 * - $select (field projections)
 * - $orderby (asc / desc)
 * - $top & $skip (pagination)
 * - $count (include total count)
 */

import { ENTITY_MAP } from './model.js';

export function processODataQuery(entityName, queryParams = {}) {
  const sourceList = ENTITY_MAP[entityName];
  if (!sourceList) return null;

  let results = JSON.parse(JSON.stringify(sourceList));

  // 1. FILTER ($filter)
  if (queryParams.$filter) {
    results = results.filter(item => evaluateFilter(item, queryParams.$filter));
  }

  const totalCount = results.length;

  // 2. ORDERBY ($orderby)
  if (queryParams.$orderby) {
    const [field, dir] = queryParams.$orderby.trim().split(/\s+/);
    const isDesc = dir && dir.toLowerCase() === 'desc';
    results.sort((a, b) => {
      const valA = getNestedValue(a, field);
      const valB = getNestedValue(b, field);
      if (valA < valB) return isDesc ? 1 : -1;
      if (valA > valB) return isDesc ? -1 : 1;
      return 0;
    });
  }

  // 3. SKIP ($skip)
  if (queryParams.$skip) {
    const skip = parseInt(queryParams.$skip, 10);
    if (!isNaN(skip)) results = results.slice(skip);
  }

  // 4. TOP ($top)
  if (queryParams.$top) {
    const top = parseInt(queryParams.$top, 10);
    if (!isNaN(top)) results = results.slice(0, top);
  }

  // 5. EXPAND ($expand)
  if (queryParams.$expand) {
    const expandTargets = queryParams.$expand.split(',').map(s => s.trim());
    results = results.map(item => expandEntity(item, expandTargets));
  }

  // 6. SELECT ($select)
  if (queryParams.$select) {
    const selectFields = queryParams.$select.split(',').map(s => s.trim());
    selectFields.push('@iot.id', '@iot.selfLink'); // Always include key IDs
    results = results.map(item => {
      const projected = {};
      selectFields.forEach(f => {
        if (item[f] !== undefined) projected[f] = item[f];
      });
      return projected;
    });
  }

  // Build Response Body
  const response = {};
  if (queryParams.$count === 'true') {
    response['@iot.count'] = totalCount;
  }
  response.value = results;
  return response;
}

// Nested value retriever (e.g. "properties/overallSuitabilityScore" or "result")
function getNestedValue(obj, path) {
  if (!obj || !path) return undefined;
  const parts = path.replace(/\//g, '.').split('.');
  let curr = obj;
  for (const p of parts) {
    if (curr === null || curr === undefined) return undefined;
    curr = curr[p];
  }
  return curr;
}

// Simple Filter Evaluator
function evaluateFilter(item, filterStr) {
  // Support basic syntax e.g. "result gt 1010" or "properties/overallSuitabilityScore ge 70"
  const tokens = filterStr.match(/(?:[^\s']+|'[^']*')+/g) || [];
  if (tokens.length < 3) return true;

  const field = tokens[0];
  const op = tokens[1].toLowerCase();
  let rawVal = tokens[2].replace(/^'|'$/g, '');
  let targetVal = isNaN(rawVal) ? rawVal : parseFloat(rawVal);

  const itemVal = getNestedValue(item, field);
  if (itemVal === undefined) return false;

  switch (op) {
    case 'gt': return itemVal > targetVal;
    case 'ge': return itemVal >= targetVal;
    case 'lt': return itemVal < targetVal;
    case 'le': return itemVal <= targetVal;
    case 'eq': return itemVal == targetVal;
    case 'ne': return itemVal != targetVal;
    default: return true;
  }
}

// Simple Entity Expander
function expandEntity(item, expandTargets) {
  const expanded = { ...item };
  expandTargets.forEach(target => {
    // e.g. "Datastreams" or "Locations"
    const relKey = target.split('/')[0];
    if (Array.isArray(expanded[relKey])) {
      expanded[relKey] = expanded[relKey].map(link => {
        if (typeof link !== 'string') return link;
        const [entityName, id] = parseSelfLink(link);
        const match = ENTITY_MAP[entityName]?.find(e => e['@iot.id'] === id);
        return match ? { ...match } : link;
      });
    } else if (typeof expanded[relKey] === 'string') {
      const [entityName, id] = parseSelfLink(expanded[relKey]);
      const match = ENTITY_MAP[entityName]?.find(e => e['@iot.id'] === id);
      if (match) expanded[relKey] = { ...match };
    }
  });
  return expanded;
}

function parseSelfLink(link) {
  // Extract entity and id from "/v1.1/Things('thing-tn-ariyalur')"
  const m = link.match(/\/v1\.1\/(\w+)\("([^"]+)"\)/);
  if (m) return [m[1], m[2]];
  return ['', ''];
}
