import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Database, 
  LineChart, 
  Settings, 
  Info,
  ChevronLeft,
  ChevronRight,
  Radio,
  User
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage, sidebarOpen, setSidebarOpen }) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', name: 'Map', icon: Map },
    { id: 'analytics', name: 'Analytics', icon: LineChart },
    { id: 'explorer', name: 'Data Explorer', icon: Database },
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'about', name: 'About', icon: Info },
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-20'
      } glass-panel border-r border-brand-border bg-brand-navy flex flex-col justify-between`}
    >
      {/* Sidebar Header */}
      <div>
        <div className="flex items-center justify-between p-4 border-b border-brand-border h-16">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-cyan to-brand-blue flex items-center justify-center shadow-cyan-glow">
              <Radio className="w-5 h-5 text-brand-navy" />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col select-none">
                <span className="font-extrabold text-sm tracking-wider text-white font-['Outfit']">TRINAV SPACETECH</span>
                <span className="text-[10px] text-brand-cyan tracking-widest font-mono">GEOSPATIAL</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg border border-brand-border bg-brand-dark/50 hover:bg-brand-cyan/20 hover:text-brand-cyan transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-brand-cyan/15 to-brand-blue/5 border-l-2 border-brand-cyan text-brand-cyan shadow-cyan-glow' 
                    : 'text-brand-textSecondary hover:bg-white/5 hover:text-white border-l-2 border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-brand-cyan' : 'text-brand-textSecondary group-hover:text-brand-blue'
                }`} />
                {sidebarOpen && (
                  <span className="font-medium text-sm text-left">{item.name}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-brand-border">
        {sidebarOpen ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-brand-dark/40 border border-brand-border/40">
              <div className="w-8 h-8 rounded-full bg-brand-slate flex items-center justify-center border border-brand-cyan/30 text-brand-cyan">
                <User className="w-4 h-4" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[11px] text-brand-textMuted uppercase tracking-wider font-mono">DEVELOPER</span>
                <span className="text-xs font-semibold text-white truncate font-['Outfit']">Junaid Ahmed</span>
              </div>
            </div>
            <div className="text-[9px] text-brand-textMuted text-center font-mono space-y-1 pt-1">
              <div>OGC SensorThings Compliant</div>
              <div className="text-brand-cyan/60">Azure Data Explorer Ready</div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center group relative">
            <div className="w-8 h-8 rounded-full bg-brand-slate flex items-center justify-center border border-brand-cyan/30 text-brand-cyan cursor-help">
              <User className="w-4 h-4" />
            </div>
            {/* Tooltip */}
            <div className="absolute left-14 bottom-1 bg-brand-navy border border-brand-cyan/40 px-2 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              Junaid Ahmed
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
