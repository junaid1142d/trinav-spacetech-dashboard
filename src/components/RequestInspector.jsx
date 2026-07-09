import React, { useState, useEffect } from 'react';
import { onRequestLog, requestLogs } from '../services/api';
import { Terminal, Copy, Check, ChevronDown, ChevronUp, Clock, Database, Wifi } from 'lucide-react';

export default function RequestInspector({ defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [logs, setLogs] = useState([...requestLogs]);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    const unsub = onRequestLog(setLogs);
    return unsub;
  }, []);

  const copyURL = (url, id) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  const statusColor = (s) => ({ success: '#22C55E', error: '#EF4444', pending: '#F59E0B' }[s] || '#737373');
  const statusBg = (s) => ({ success: 'request-log-success', error: 'request-log-error', pending: 'request-log-pending' }[s] || '');

  return (
    <div className="bg-[#050505] border border-white/[0.08] rounded-xl overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#22D3EE]" />
          <span className="text-sm font-semibold text-white">OGC Request Inspector</span>
          <span className="text-[9px] font-mono text-[#525252] bg-[#111] px-1.5 py-0.5 rounded border border-white/[0.06]">
            {logs.length} requests
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-[#737373]" /> : <ChevronDown className="w-4 h-4 text-[#737373]" />}
      </button>

      {open && (
        <div className="border-t border-white/[0.06]">
          {logs.length === 0 ? (
            <div className="p-6 text-center text-[#525252] text-xs font-mono flex flex-col items-center gap-2">
              <Wifi className="w-5 h-5" />
              No OGC requests yet. Load a WMS or WFS layer to see activity.
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto divide-y divide-white/[0.04]">
              {logs.map((log) => (
                <div key={log.id} className={`px-4 py-3 ${statusBg(log.status)} hover:bg-white/[0.02] transition-colors`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-mono font-bold uppercase" style={{ color: statusColor(log.status) }}>
                          {log.status}
                        </span>
                        {log.httpStatus && (
                          <span className="text-[9px] font-mono text-[#525252]">HTTP {log.httpStatus}</span>
                        )}
                        <span className="text-[9px] font-mono text-[#737373]">{log.label}</span>
                      </div>
                      <p className="text-[10px] font-mono text-[#525252] truncate">{log.url}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        {log.duration !== null && (
                          <span className="flex items-center gap-1 text-[9px] text-[#404040] font-mono">
                            <Clock className="w-2.5 h-2.5" />{log.duration}ms
                          </span>
                        )}
                        {log.size && (
                          <span className="flex items-center gap-1 text-[9px] text-[#404040] font-mono">
                            <Database className="w-2.5 h-2.5" />{(log.size / 1024).toFixed(1)}KB
                          </span>
                        )}
                        <span className="text-[9px] text-[#404040] font-mono">{log.ts?.split('T')[1]?.split('.')[0]}</span>
                        {log.error && <span className="text-[9px] text-red-400 font-mono">{log.error}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => copyURL(log.url, log.id)}
                      className="p-1.5 rounded border border-white/[0.08] text-[#525252] hover:text-white hover:border-white/20 transition-all flex-shrink-0"
                      title="Copy URL"
                    >
                      {copied === log.id ? <Check className="w-3 h-3 text-[#22C55E]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
