import Papa from 'papaparse';
import { appConfig } from '../config.js';

let cachedPayload = null;

const parseNumber = (value) => {
  const numeric = Number.parseFloat(String(value ?? '').trim());
  return Number.isFinite(numeric) ? numeric : null;
};

const normalizeRecord = (row, index) => {
  const station = String(row.Station ?? '').trim();
  const city = String(row.City ?? '').trim();
  const timestamp = String(row.Timestamp ?? '').trim();

  return {
    id: station.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    station,
    city,
    latitude: parseNumber(row.Latitude),
    longitude: parseNumber(row.Longitude),
    timestamp,
    timestampMs: Date.parse(timestamp),
    pressure: parseNumber(row.Pressure_hPa),
    sourceIndex: index,
  };
};

const readCsv = async (url) => {
  const response = await fetch(url, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error(`Unable to load ${url}: ${response.status} ${response.statusText}`);
  }

  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: ({ data, errors }) => {
        if (errors.length) {
          reject(new Error(errors.map((error) => error.message).join('; ')));
          return;
        }

        resolve(
          data
            .map(normalizeRecord)
            .filter(
              (record) =>
                record.station &&
                Number.isFinite(record.latitude) &&
                Number.isFinite(record.longitude) &&
                Number.isFinite(record.pressure),
            ),
        );
      },
      error: reject,
    });
  });
};

const groupTimeseriesByStation = (records) =>
  records.reduce((groups, record) => {
    const key = record.id;
    const nextGroup = groups[key] ? [...groups[key], record] : [record];
    nextGroup.sort((a, b) => a.timestampMs - b.timestampMs);
    return { ...groups, [key]: nextGroup };
  }, {});

const computeStationMetrics = (latest, timeseriesByStation) =>
  latest.map((station) => {
    const series = timeseriesByStation[station.id] ?? [];
    const pressures = series.map((item) => item.pressure).filter(Number.isFinite);
    const first = series[0]?.pressure ?? station.pressure;
    const last = series.at(-1)?.pressure ?? station.pressure;
    const average =
      pressures.length > 0
        ? pressures.reduce((total, pressure) => total + pressure, 0) / pressures.length
        : station.pressure;

    return {
      ...station,
      current: station.pressure,
      average,
      max: pressures.length ? Math.max(...pressures) : station.pressure,
      min: pressures.length ? Math.min(...pressures) : station.pressure,
      trend: Number((last - first).toFixed(2)),
      observations: Math.max(series.length, 1),
    };
  });

export const csvService = {
  async loadPressureData({ forceRefresh = false } = {}) {
    if (cachedPayload && !forceRefresh) {
      return cachedPayload;
    }

    const [latestRaw, timeseries] = await Promise.all([
      readCsv(appConfig.dataSources.latest),
      readCsv(appConfig.dataSources.timeseries),
    ]);

    const latest = latestRaw.sort((a, b) => a.station.localeCompare(b.station));
    const timeseriesByStation = groupTimeseriesByStation(timeseries);
    const stations = computeStationMetrics(latest, timeseriesByStation);
    const observations = timeseries.length || latest.length;
    const latestUpdate = latest.reduce(
      (max, item) => (item.timestampMs > max ? item.timestampMs : max),
      0,
    );
    const averagePressure =
      stations.reduce((total, station) => total + station.current, 0) / Math.max(stations.length, 1);

    cachedPayload = {
      stations,
      latest,
      timeseries,
      timeseriesByStation,
      summary: {
        stationCount: stations.length,
        observationCount: observations,
        averagePressure,
        latestUpdate,
      },
    };

    return cachedPayload;
  },
  clearCache() {
    cachedPayload = null;
  },
};
