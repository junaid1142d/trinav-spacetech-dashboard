import React, { useEffect } from 'react';
import { Play, Pause, RotateCcw, CalendarClock } from 'lucide-react';

export default function TemporalPlayback({ timestamps, currentIndex, setCurrentIndex, isPlaying, setIsPlaying, playbackSpeed, setPlaybackSpeed }) {
  useEffect(() => {
    if (!isPlaying || !timestamps.length) return;
    const delay = Math.max(80, Math.round(800 / playbackSpeed));
    const id = setInterval(() => {
      setCurrentIndex(i => (i >= timestamps.length - 1 ? 0 : i + 1));
    }, delay);
    return () => clearInterval(id);
  }, [isPlaying, timestamps, playbackSpeed, setCurrentIndex]);

  if (!timestamps?.length) return null;

  const ts = timestamps[currentIndex] || '';
  const [date, time] = ts.split(' ');

  return (
    <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-4">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
        {/* Clock */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-[#737373]">
            <CalendarClock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[8px] text-[#525252] font-mono uppercase tracking-wider">Simulation Time</p>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-[11px] text-[#737373]">{date}</span>
              <span className="text-sm font-bold text-[#22D3EE] bg-[#111] border border-white/10 px-2 py-0.5 rounded min-w-[60px] text-center">
                {time || '00:00:00'}
              </span>
            </div>
          </div>
        </div>

        {/* Slider */}
        <div className="flex-1 flex items-center gap-3 w-full">
          <button
            onClick={() => setIsPlaying(v => !v)}
            className={`p-2 rounded-lg flex-shrink-0 transition-all ${isPlaying ? 'bg-[#EAB308] text-black' : 'bg-white text-black'} hover:opacity-90`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => { setCurrentIndex(0); setIsPlaying(false); }}
            className="p-2 rounded-lg border border-white/10 text-[#737373] hover:text-white hover:border-white/25 transition-all flex-shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="flex-1 flex flex-col gap-1">
            <input
              type="range"
              min="0"
              max={timestamps.length - 1}
              value={currentIndex}
              onChange={e => setCurrentIndex(+e.target.value)}
              className="w-full accent-[#22D3EE] cursor-pointer"
              style={{ height: '3px' }}
            />
            <div className="flex justify-between text-[8px] text-[#404040] font-mono">
              <span>{timestamps[0]?.split(' ')[0]}</span>
              <span className="text-[#525252]">{currentIndex + 1}/{timestamps.length}</span>
              <span>{timestamps[timestamps.length - 1]?.split(' ')[0]}</span>
            </div>
          </div>
        </div>

        {/* Speed */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[9px] text-[#525252] font-mono uppercase">Speed</span>
          <div className="flex bg-[#111] rounded-lg p-0.5 border border-white/[0.06]">
            {[1, 2, 5, 10].map(s => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                className={`px-2 py-1 rounded-md text-[9px] font-mono font-bold transition-all ${playbackSpeed === s ? 'bg-white text-black' : 'text-[#525252] hover:text-white'}`}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
