import { useState } from 'react';
import FilterBar from '../components/FilterBar.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import PressureMap from '../components/PressureMap.jsx';
import SearchBar from '../components/SearchBar.jsx';
import StationDrawer from '../components/StationDrawer.jsx';
import StationTable from '../components/StationTable.jsx';
import { useCSVLoader } from '../hooks/useCSVLoader.js';
import { useStationFilters } from '../hooks/useStationFilters.js';
import { formatPressure } from '../utils/format.js';

export default function Stations() {
  const { loading, stations, timeseriesByStation } = useCSVLoader();
  const [selectedStation, setSelectedStation] = useState(null);
  const filters = useStationFilters(stations);

  if (loading) return <LoadingScreen />;

  return (
    <>
      <PageHeader title="Stations" eyebrow="Network inventory" description="Search, filter, sort, and inspect pressure monitoring stations across Tamil Nadu." />
      <section className="glass-panel rounded-lg p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_1.4fr]">
          <SearchBar value={filters.query} onChange={filters.setQuery} placeholder="Search station or city" />
          <FilterBar {...filters} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {filters.filteredStations.map((station) => (
          <button
            type="button"
            key={station.id}
            onClick={() => setSelectedStation(station)}
            className="glass-panel rounded-lg p-5 text-left transition hover:border-white/25 hover:bg-white/[0.06]"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">{station.city}</p>
            <h2 className="mt-2 text-lg font-semibold text-white">{station.station}</h2>
            <p className="mt-5 text-2xl font-semibold text-white">{formatPressure(station.current)}</p>
            <p className="mt-2 text-sm text-zinc-500">{station.observations} observations</p>
          </button>
        ))}
      </section>

      <PressureMap stations={filters.filteredStations} height="460px" onStationClick={setSelectedStation} selectedStationId={selectedStation?.id} />
      <StationTable stations={filters.filteredStations} />
      <StationDrawer
        station={selectedStation}
        series={selectedStation ? timeseriesByStation[selectedStation.id] ?? [] : []}
        onClose={() => setSelectedStation(null)}
      />
    </>
  );
}

function PageHeader({ eyebrow, title, description }) {
  return (
    <section className="glass-panel rounded-lg p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-semibold text-white">{title}</h1>
      <p className="mt-2 max-w-3xl text-zinc-400">{description}</p>
    </section>
  );
}
