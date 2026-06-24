import React, { useEffect } from 'react';
import { Play, Pause, FastForward, RotateCcw, CalendarClock } from 'lucide-react';

export default function TemporalPlayback({ 
  timestamps, 
  currentIndex, 
  setCurrentIndex, 
  isPlaying, 
  setIsPlaying, 
  playbackSpeed, 
  setPlaybackSpeed 
}) {
  
  // Timer effect for playback ticks
  useEffect(() => {
    let intervalId = null;
    
    if (isPlaying && timestamps.length > 0) {
      // Base delay is 800ms, scaled by playback speed (1x, 2x, 5x, etc.)
      const delay = Math.max(100, Math.round(1000 / playbackSpeed));
      
      intervalId = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          if (prevIndex >= timestamps.length - 1) {
            // Loop back to start or stop
            return 0; 
          }
          return prevIndex + 1;
        });
      }, delay);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, timestamps, playbackSpeed, setCurrentIndex]);

  const handleSliderChange = (e) => {
    setCurrentIndex(parseInt(e.target.value));
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const resetPlayback = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  if (!timestamps || timestamps.length === 0) return null;

  const currentTimestamp = timestamps[currentIndex] || '';
  const dateParts = currentTimestamp.split(' ');
  const displayDate = dateParts[0] || '';
  const displayTime = dateParts[1] || '';

  return (
    <div className="glass-panel p-5 rounded-2xl border border-brand-border bg-brand-navy/60 select-none">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
        {/* LCD Telemetry Clock */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-slate flex items-center justify-center border border-brand-cyan/20 text-brand-cyan shadow-cyan-glow">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-brand-textMuted uppercase font-mono block">Simulation Timestamp</span>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-sm font-bold text-white">{displayDate}</span>
              <span className="text-sm font-extrabold text-brand-cyan tracking-wider bg-brand-dark/80 px-2 py-0.5 rounded border border-brand-border/40 min-w-[70px] text-center shadow-inner">
                {displayTime || '00:00:00'}
              </span>
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex-1 w-full flex items-center gap-4">
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={togglePlay}
              className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                isPlaying 
                  ? 'bg-amber-500 hover:bg-amber-400 text-brand-navy shadow-[0_0_12px_rgba(245,158,11,0.3)]' 
                  : 'bg-brand-cyan hover:bg-brand-cyan/80 text-brand-navy shadow-cyan-glow'
              }`}
              title={isPlaying ? "Pause Telemetry" : "Play Telemetry"}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-brand-navy" /> : <Play className="w-4 h-4 fill-brand-navy" />}
            </button>
            
            <button 
              onClick={resetPlayback}
              className="p-3 rounded-xl border border-brand-border bg-brand-dark/40 hover:bg-brand-slate text-brand-textSecondary hover:text-white transition-all"
              title="Reset Timeline"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Timeline Slider */}
          <div className="flex-1 flex flex-col gap-1">
            <input 
              type="range" 
              min="0" 
              max={timestamps.length - 1} 
              value={currentIndex}
              onChange={handleSliderChange}
              className="w-full accent-brand-cyan bg-brand-slate h-1.5 rounded-lg cursor-pointer transition-all"
            />
            <div className="flex justify-between text-[9px] text-brand-textMuted font-mono">
              <span>START ({timestamps[0]?.split(' ')[0]})</span>
              <span>INDEX: {currentIndex + 1} / {timestamps.length}</span>
              <span>END ({timestamps[timestamps.length - 1]?.split(' ')[0]})</span>
            </div>
          </div>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-2 border-l-0 lg:border-l border-brand-border/40 pl-0 lg:pl-4">
          <span className="text-[10px] text-brand-textSecondary font-mono uppercase">Speed</span>
          <div className="flex bg-brand-dark/60 rounded-xl p-0.5 border border-brand-border/60">
            {[1, 2, 5, 10].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                  playbackSpeed === speed 
                    ? 'bg-brand-cyan text-brand-navy shadow-cyan-glow' 
                    : 'text-brand-textSecondary hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
