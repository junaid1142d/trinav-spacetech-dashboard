import React from 'react';
import { AlertCircle, FileWarning, RotateCcw } from 'lucide-react';

// Skeleton card for statistics / parameters
export function SkeletonCard() {
  return (
    <div className="glass-panel p-5 rounded-2xl animate-pulse space-y-3">
      <div className="h-4 bg-brand-slate rounded w-1/3"></div>
      <div className="h-8 bg-brand-slate rounded w-2/3"></div>
      <div className="h-3 bg-brand-slate rounded w-1/2"></div>
    </div>
  );
}

// Skeleton container for charts
export function SkeletonChart() {
  return (
    <div className="glass-panel p-6 rounded-2xl animate-pulse space-y-4 w-full h-[350px] flex flex-col justify-between">
      <div className="flex justify-between items-center">
        <div className="h-5 bg-brand-slate rounded w-1/4"></div>
        <div className="h-5 bg-brand-slate rounded w-1/6"></div>
      </div>
      <div className="flex-1 flex items-end gap-3 pt-6 pb-2">
        <div className="w-full bg-brand-slate rounded" style={{ height: '30%' }}></div>
        <div className="w-full bg-brand-slate rounded" style={{ height: '55%' }}></div>
        <div className="w-full bg-brand-slate rounded" style={{ height: '40%' }}></div>
        <div className="w-full bg-brand-slate rounded" style={{ height: '75%' }}></div>
        <div className="w-full bg-brand-slate rounded" style={{ height: '50%' }}></div>
        <div className="w-full bg-brand-slate rounded" style={{ height: '90%' }}></div>
        <div className="w-full bg-brand-slate rounded" style={{ height: '65%' }}></div>
      </div>
      <div className="h-3 bg-brand-slate rounded w-full"></div>
    </div>
  );
}

// Skeleton container for tables
export function SkeletonTable() {
  return (
    <div className="glass-panel p-5 rounded-2xl animate-pulse space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="h-8 bg-brand-slate rounded w-1/4"></div>
        <div className="h-8 bg-brand-slate rounded w-1/3"></div>
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-4 items-center border-b border-white/5 py-3">
          <div className="h-4 bg-brand-slate rounded w-1/4"></div>
          <div className="h-4 bg-brand-slate rounded w-1/5"></div>
          <div className="h-4 bg-brand-slate rounded w-1/6"></div>
          <div className="h-4 bg-brand-slate rounded w-1/4"></div>
        </div>
      ))}
    </div>
  );
}

// Generic empty state placeholder
export function EmptyState({ title = "No Data Available", message = "Please upload a CSV file to populate this section.", icon: Icon = FileWarning, children }) {
  return (
    <div className="glass-panel p-10 rounded-2xl flex flex-col items-center justify-center text-center max-w-lg mx-auto my-12 border border-dashed border-brand-border">
      <div className="w-16 h-16 rounded-full bg-brand-slate flex items-center justify-center border border-brand-cyan/20 text-brand-cyan mb-4 shadow-cyan-glow">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2 font-['Outfit']">{title}</h3>
      <p className="text-brand-textSecondary text-sm mb-6 leading-relaxed">{message}</p>
      {children}
    </div>
  );
}

// Error state with retry callback
export function ErrorState({ message = "An error occurred while loading data.", onRetry }) {
  return (
    <div className="glass-panel p-8 rounded-2xl border border-red-500/20 bg-brand-navy/60 flex flex-col items-center justify-center text-center max-w-md mx-auto my-6">
      <div className="w-12 h-12 rounded-full bg-red-950/40 border border-red-500/30 text-red-400 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-lg font-semibold text-white mb-1 font-['Outfit']">Loading Failed</h4>
      <p className="text-brand-textSecondary text-sm mb-6">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-950/20 border border-red-500/40 text-red-300 hover:bg-red-500 hover:text-white transition-all text-xs font-semibold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Retry Request
        </button>
      )}
    </div>
  );
}
