import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen.jsx';
import StatisticsCard from '../components/StatisticsCard.jsx';
import TimeSeriesChart from '../components/TimeSeriesChart.jsx';
import { useCSVLoader } from '../hooks/useCSVLoader.js';
import { formatDateTime, formatPressure, trendLabel } from '../utils/format.js';

export default function Analytics() {
  const { loading, stations, timeseriesByStation } = useCSVLoader();
  const [searchParams, setSearchParams] = useSearchParams();
  const stationId = searchParams.get('station');
  const [fallbackStationId, setFallbackStationId] = useState('');
  const selectedId = stationId || fallbackStationId || stations[0]?.id;
  const station = stations.find((item) => item.id === selectedId) ?? stations[0];
  const series = station ? timeseriesByStation[station.id] ?? [] : [];

  const networkSeries = useMemo(
    () =>
      Object.values(timeseriesByStation)
        .flat()
        .sort((a, b) => a.timestampMs - b.timestampMs),
    [timeseriesByStation],
  );

  if (loading) return <LoadingScreen />;

  const handleStationChange = (id) => {
    setFallbackStationId(id);
    setSearchParams({ station: id });
  };

  return (
    <>
      <section className="glass-panel rounded-lg p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Analytics</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Pressure intelligence panel</h1>
            <p className="mt-2 max-w-3xl text-zinc-400">
              Select a station to inspect current pressure, envelope statistics, and temporal movement.
            </p>
          </div>
          <label className="min-w-[260px] rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-400">
            Station
            <select
              value={station?.id ?? ''}
              onChange={(event) => handleStationChange(event.target.value)}
              className="mt-1 w-full bg-transparent text-white outline-none"
            >
              {stations.map((item) => (
                <option className="bg-zinc-950" key={item.id} value={item.id}>
                  {item.station}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {station && (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Metric label="Current" value={formatPressure(station.current)} />
            <Metric label="Average" value={formatPressure(station.average)} />
            <Metric label="Maximum" value={formatPressure(station.max)} />
            <Metric label="Minimum" value={formatPressure(station.min)} />
            <Metric label="Trend" value={trendLabel(station.trend)} detail={`${station.trend.toFixed(2)} hPa`} />
          </section>
          <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <TimeSeriesChart data={series} title={`${station.station} pressure vs time`} />
            <div className="grid content-start gap-6">
              <StatisticsCard title="Pressure statistics" station={station} />
              <section className="glass-panel rounded-lg p-5">
                <h2 className="text-lg font-semibold text-white">Station context</h2>
                <dl className="mt-4 grid gap-3 text-sm">
                  <Row label="City" value={station.city} />
                  <Row label="Last update" value={formatDateTime(station.timestamp)} />
                  <Row label="Observations" value={String(series.length)} />
                  <Row label="Network samples" value={String(networkSeries.length)} />
                </dl>
              </section>
            </div>
          </section>
        </>
      )}
    </>
  );
}

function Metric({ label, value, detail }) {
  return (
    <section className="glass-panel rounded-lg p-5">
      <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      {detail && <p className="mt-2 text-sm text-zinc-500">{detail}</p>}
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="text-right font-medium text-white">{value}</dd>
    </div>
  );
}
