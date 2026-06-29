import { useMemo, useState } from 'react';

export function useStationFilters(stations) {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('station');
  const [pressureBand, setPressureBand] = useState('all');

  const cities = useMemo(
    () => [...new Set(stations.map((station) => station.city))].filter(Boolean).sort(),
    [stations],
  );

  const filteredStations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return stations
      .filter((station) => {
        const matchesText =
          !normalizedQuery ||
          `${station.station} ${station.city}`.toLowerCase().includes(normalizedQuery);
        const matchesBand =
          pressureBand === 'all' ||
          (pressureBand === 'high' && station.current >= 1013) ||
          (pressureBand === 'normal' && station.current >= 1008 && station.current < 1013) ||
          (pressureBand === 'low' && station.current < 1008);

        return matchesText && matchesBand;
      })
      .sort((a, b) => {
        if (sortBy === 'pressure-desc') return b.current - a.current;
        if (sortBy === 'pressure-asc') return a.current - b.current;
        if (sortBy === 'city') return a.city.localeCompare(b.city);
        return a.station.localeCompare(b.station);
      });
  }, [stations, query, sortBy, pressureBand]);

  return {
    cities,
    filteredStations,
    query,
    setQuery,
    sortBy,
    setSortBy,
    pressureBand,
    setPressureBand,
  };
}
