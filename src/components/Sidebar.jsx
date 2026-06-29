import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, Database, Info, LayoutDashboard, MapPinned, X } from 'lucide-react';
import { appConfig } from '../config.js';

const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/stations', label: 'Stations', icon: MapPinned },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/explorer', label: 'Explorer', icon: Database },
  { to: '/about', label: 'About', icon: Info },
];

function Sidebar({ open, onClose }) {
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-[800] flex w-72 flex-col border-r border-white/10 bg-black/90 px-4 py-5 backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Mission</p>
            <p className="mt-1 text-lg font-semibold text-white">{appConfig.organization}</p>
          </div>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-2">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-white text-black'
                    : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Data model</p>
          <p className="mt-2 text-sm text-zinc-300">OGC SensorThings compatible observations with GIS and time-series analytics.</p>
        </div>
      </aside>
      {open && <button type="button" aria-label="Close navigation overlay" onClick={onClose} className="fixed inset-0 z-[750] bg-black/70 lg:hidden" />}
    </>
  );
}

export default memo(Sidebar);
