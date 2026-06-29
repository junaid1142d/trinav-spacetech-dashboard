import { memo } from 'react';
import { Activity, Menu, RefreshCw } from 'lucide-react';
import { appConfig } from '../config.js';
import { useCSVLoader } from '../hooks/useCSVLoader.js';
import { formatDateTime } from '../utils/format.js';

function Navbar({ onMenu }) {
  const { summary, reload, loading } = useCSVLoader();

  return (
    <header className="sticky top-0 z-[650] border-b border-white/10 bg-black/70 backdrop-blur-2xl">
      <div className="mx-auto flex h-20 max-w-[1680px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={onMenu}
            className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/5 text-white lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-white text-black">
            <Activity size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-400">
              {appConfig.organization}
            </p>
            <h1 className="text-base font-semibold text-white sm:text-xl">{appConfig.title}</h1>
          </div>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <div className="text-right">
            <p className="text-xs text-zinc-500">Latest update</p>
            <p className="text-sm font-medium text-zinc-200">{formatDateTime(summary.latestUpdate)}</p>
          </div>
          <button
            type="button"
            onClick={reload}
            disabled={loading}
            className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/5 text-zinc-100 transition hover:bg-white/10 disabled:cursor-wait disabled:opacity-60"
            title="Refresh CSV data"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default memo(Navbar);
