import { memo } from 'react';
import { CheckCircle2, Server, ShieldCheck, Wifi } from 'lucide-react';

const statuses = [
  { label: 'CSV ingestion', value: 'Operational', icon: CheckCircle2 },
  { label: 'GIS rendering', value: 'Online', icon: Wifi },
  { label: 'ADX gateway', value: 'Ready', icon: Server },
  { label: 'Sensor model', value: 'Compatible', icon: ShieldCheck },
];

function StatusCard() {
  return (
    <section className="glass-panel rounded-lg p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">System status</h2>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
          Nominal
        </span>
      </div>
      <div className="grid gap-3">
        {statuses.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="flex items-center gap-3">
              <Icon size={18} className="text-white" />
              <span className="text-sm text-zinc-300">{label}</span>
            </div>
            <span className="text-sm font-medium text-white">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default memo(StatusCard);
