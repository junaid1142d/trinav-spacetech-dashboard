import { createContext, createElement, useContext, useEffect, useMemo, useState } from 'react';
import { csvService } from '../services/csvService.js';

const DataContext = createContext(null);

export function useCSVLoader() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useCSVLoader must be used inside DataProvider');
  }
  return context;
}

export function DataProvider({ children }) {
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null,
  });

  const reload = async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await csvService.loadPressureData({ forceRefresh: true });
      setState({ loading: false, error: null, data });
    } catch (error) {
      setState({ loading: false, error, data: null });
    }
  };

  useEffect(() => {
    let active = true;

    csvService
      .loadPressureData()
      .then((data) => {
        if (active) {
          setState({ loading: false, error: null, data });
        }
      })
      .catch((error) => {
        if (active) {
          setState({ loading: false, error, data: null });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      reload,
      stations: state.data?.stations ?? [],
      latest: state.data?.latest ?? [],
      timeseries: state.data?.timeseries ?? [],
      timeseriesByStation: state.data?.timeseriesByStation ?? {},
      summary: state.data?.summary ?? {
        stationCount: 0,
        observationCount: 0,
        averagePressure: 0,
        latestUpdate: 0,
      },
    }),
    [state],
  );

  return createElement(DataContext.Provider, { value }, children);
}
