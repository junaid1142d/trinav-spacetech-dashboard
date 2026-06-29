import { useMemo, useState } from 'react';
import { Activity, Clock, Database, Gauge } from 'lucide-react';
import { appConfig } from '../config.js';
import KPICard from '../components/KPICard.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import PressureMap from '../components/PressureMap.jsx';
import StationDrawer from '../components/StationDrawer.jsx';
import StatusCard from '../components/StatusCard.jsx';
import { useCSVLoader } from '../hooks/useCSVLoader.js';
import { formatDateTime, formatPressure } from '../utils/format.js';

export default function Dashboard() {
  const { loading, error, stations, summary, timeseriesByStation } = useCSVLoader();
  const [selectedStation, setSelectedStation] = useState(null);
  const recent = useMemo(
    () =>
      [...stations]
        .sort((a, b) => b.timestampMs - a.timestampMs)
        .slice(0, 7),
    [stations],
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorPanel message={error.message} />;

  return (
    <>
      <section className="glass-panel rounded-lg p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-zinc-500">
          {appConfig.organization}
        </p>
        <div className="mt-3 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <h1 className="max-w-4xl text-3xl font-semibold text-white sm:text-5xl">
              {appConfig.title}
            </h1>
            <p className="mt-3 text-zinc-400">{appConfig.subtitle}</p>
          </div>
          <p className="max-w-xl text-sm leading-6 text-zinc-400">
            Enterprise geospatial telemetry for pressure observations across Tamil Nadu, optimized for
            operational scanning, station diagnostics, and time-series analysis.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Stations" value={summary.stationCount} icon={Gauge} detail="Active monitoring locations" />
        <KPICard label="Observations" value={summary.observationCount} icon={Database} detail="CSV telemetry records" />
        <KPICard label="Average pressure" value={summary.averagePressure} suffix=" hPa" decimals={1} icon={Activity} detail="Latest station mean" />
        <KPICard label="Latest update" value={new Date(summary.latestUpdate).getHours()} suffix=" h" icon={Clock} detail={formatDateTime(summary.latestUpdate)} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <PressureMap
          stations={stations}
          selectedStationId={selectedStation?.id}
          onStationClick={setSelectedStation}
        />
        <div className="grid content-start gap-6">
          <RecentObservations observations={recent} />
          <StatusCard />
        </div>
      </section>

      <StationDrawer
        station={selectedStation}
        series={selectedStation ? timeseriesByStation[selectedStation.id] ?? [] : []}
        onClose={() => setSelectedStation(null)}
      />
    </>
  );
}

function RecentObservations({ observations }) {
  return (
    <section className="glass-panel rounded-lg p-5">
      <h2 className="text-lg font-semibold text-white">Recent observations</h2>
      <div className="mt-4 grid gap-3">
        {observations.map((station) => (
          <div key={station.id} className="rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-white">{station.station}</p>
                <p className="text-sm text-zinc-500">{station.city}</p>
              </div>
              <p className="text-sm font-semibold text-white">{formatPressure(station.current)}</p>
            </div>
            <p className="mt-2 text-xs text-zinc-500">{formatDateTime(station.timestamp)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ErrorPanel({ message }) {
  return (
    <section className="glass-panel rounded-lg p-6">
      <h1 className="text-xl font-semibold text-white">Data loading failed</h1>
      <p className="mt-2 text-zinc-400">{message}</p>
    </section>
  );
}
