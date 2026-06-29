import { memo, useRef } from 'react';
import { useCountUp } from 'react-countup';
import { motion } from 'framer-motion';

function KPICard({ label, value, suffix = '', icon: Icon, decimals = 0, detail }) {
  const numeric = Number(value) || 0;
  const countRef = useRef(null);

  useCountUp({
    ref: countRef,
    end: numeric,
    decimals,
    duration: 1.1,
    separator: ',',
    suffix,
    enableReinitialize: true,
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-lg p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">{label}</p>
          <p ref={countRef} className="mt-4 text-3xl font-semibold text-white" />
        </div>
        {Icon && (
          <div className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-white/5 text-white">
            <Icon size={20} />
          </div>
        )}
      </div>
      {detail && <p className="mt-4 text-sm text-zinc-400">{detail}</p>}
    </motion.section>
  );
}

export default memo(KPICard);
