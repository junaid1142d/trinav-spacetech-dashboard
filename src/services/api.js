import axios from 'axios';
import Papa from 'papaparse';

// Base URL placeholder for future Azure Functions / ADX endpoints
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * FUTURE AZURE API INTEGRATION INTERFACES
 * Currently, these are prepared with placeholder implementations that log requests
 * and fallback to client-side data operations.
 */

export const apiService = {
  /**
   * GET /api/stations
   * OGC SensorThings: Datastreams / Things with Location
   */
  async getStations() {
    console.log(`[Azure API Call Placeholder] GET ${API_BASE_URL}/stations`);
    // In production with backend, uncomment below:
    // const response = await axios.get(`${API_BASE_URL}/stations`);
    // return response.data;
    return null; // Return null so frontend knows to use CSV/mock state
  },

  /**
   * GET /api/station/{id}
   * OGC SensorThings: Retrieve details of specific Datastream/Thing
   */
  async getStationById(id) {
    console.log(`[Azure API Call Placeholder] GET ${API_BASE_URL}/station/${id}`);
    // const response = await axios.get(`${API_BASE_URL}/station/${id}`);
    // return response.data;
    return null;
  },

  /**
   * GET /api/timeseries/{id}
   * OGC SensorThings: Retrieve Observations for specific Datastream
   */
  async getTimeseries(id, params = {}) {
    console.log(`[Azure API Call Placeholder] GET ${API_BASE_URL}/timeseries/${id}`, params);
    // const response = await axios.get(`${API_BASE_URL}/timeseries/${id}`, { params });
    // return response.data;
    return null;
  }
};

/**
 * CLIENT-SIDE CSV PARSING & DATA HANDLING
 */

export const parseCSVData = (file, onProgress, onComplete, onError) => {
  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    chunk: (results, parser) => {
      // Stream parsing if required for large datasets
    },
    complete: (results) => {
      onComplete(results.data);
    },
    error: (error) => {
      onError(error);
    }
  });
};

export const validateCSVColumns = (headers) => {
  const required = ['Station', 'City', 'Latitude', 'Longitude', 'Timestamp', 'Pressure_hPa'];
  const missing = required.filter(field => !headers.includes(field));
  return {
    isValid: missing.length === 0,
    missingFields: missing
  };
};

/**
 * Helper to compute general metrics from a dataset
 */
export const calculateMetrics = (observations) => {
  if (!observations || observations.length === 0) {
    return {
      totalRecords: 0,
      totalStations: 0,
      avgPressure: 0,
      minPressure: 0,
      maxPressure: 0,
      dateRange: { start: '-', end: '-' }
    };
  }

  const stations = new Set();
  let totalPressure = 0;
  let minPressure = Infinity;
  let maxPressure = -Infinity;
  let minDate = new Date('9999-12-31');
  let maxDate = new Date('1000-01-01');

  observations.forEach(obs => {
    stations.add(obs.Station);
    const press = obs.Pressure_hPa;
    if (press < minPressure) minPressure = press;
    if (press > maxPressure) maxPressure = press;
    totalPressure += press;

    const date = new Date(obs.Timestamp);
    if (!isNaN(date.getTime())) {
      if (date < minDate) minDate = date;
      if (date > maxDate) maxDate = date;
    }
  });

  const formatDate = (d) => {
    if (d.getFullYear() === 9999 || d.getFullYear() === 1000) return '-';
    return d.toISOString().split('T')[0];
  };

  return {
    totalRecords: observations.length,
    totalStations: stations.size,
    avgPressure: parseFloat((totalPressure / observations.length).toFixed(2)),
    minPressure: minPressure === Infinity ? 0 : minPressure,
    maxPressure: maxPressure === -Infinity ? 0 : maxPressure,
    dateRange: {
      start: formatDate(minDate),
      end: formatDate(maxDate)
    }
  };
};
