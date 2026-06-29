import { Link } from 'react-router-dom';
import { formatCoordinate, formatDateTime, formatPressure } from '../utils/format.js';

export default function StationPopup({ station }) {
  return (
    <div className="p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Station</p>
      <h3 className="mt-1 text-lg font-semibold text-white">{station.station}</h3>
      <p className="text-sm text-zinc-400">{station.city}</p>
      <dl className="mt-4 grid gap-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-zinc-500">Pressure</dt>
          <dd className="font-medium text-white">{formatPressure(station.current)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-zinc-500">Timestamp</dt>
          <dd className="text-right font-medium text-white">{formatDateTime(station.timestamp)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-zinc-500">Coordinates</dt>
          <dd className="font-medium text-white">
            {formatCoordinate(station.latitude)}, {formatCoordinate(station.longitude)}
          </dd>
        </div>
      </dl>
      <Link
        to={`/analytics?station=${station.id}`}
        className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-white px-4 text-sm font-semibold text-black transition hover:bg-zinc-200"
      >
        View Analytics
      </Link>
    </div>
  );
}
