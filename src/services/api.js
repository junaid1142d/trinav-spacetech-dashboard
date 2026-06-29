import { csvService } from './csvService.js';

export const api = {
  async getStations() {
    const { stations } = await csvService.loadPressureData();
    return stations;
  },
  async getStation(id) {
    const { stations } = await csvService.loadPressureData();
    return stations.find((station) => station.id === id);
  },
  async getTimeseries(id) {
    const { timeseriesByStation } = await csvService.loadPressureData();
    return timeseriesByStation[id] ?? [];
  },
  endpoints: {
    stations: '/api/stations',
    station: '/api/station/{id}',
    timeseries: '/api/timeseries/{id}',
  },
};
