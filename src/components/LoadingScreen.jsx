import { memo } from 'react';
import { Loader2 } from 'lucide-react';

function LoadingScreen() {
  return (
    <div className="grid min-h-[58vh] place-items-center">
      <div className="glass-panel flex items-center gap-3 rounded-xl px-5 py-4 text-zinc-200">
        <Loader2 className="animate-spin" size={20} />
        Loading atmospheric telemetry
      </div>
    </div>
  );
}

export default memo(LoadingScreen);
