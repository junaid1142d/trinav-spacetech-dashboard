import React, { useState, useEffect } from 'react';
import { Terminal, Play, Copy, Check, Server, Filter, Database, ArrowRight } from 'lucide-react';

const ENDPOINTS = [
  'Things',
  'Locations',
  'HistoricalLocations',
  'Datastreams',
  'Sensors',
  'ObservedProperties',
  'FeaturesOfInterest',
  'Observations',
];

const PRESETS = [
  { label: 'All Things with Datastreams ($expand)', endpoint: 'Things', query: '$expand=Datastreams' },
  { label: 'Top 10 High Pressure Observations', endpoint: 'Observations', query: '$top=10&$orderby=result desc&$filter=result gt 1010' },
  { label: 'District Stations with Scores >= 75', endpoint: 'Things', query: '$filter=properties/overallSuitabilityScore ge 75&$select=name,properties' },
  { label: 'Locations with Count', endpoint: 'Locations', query: '$count=true&$top=5' },
  { label: 'All Sensors Metadata', endpoint: 'Sensors', query: '' },
];

export default function SensorThingsExplorer() {
  const [selectedEndpoint, setSelectedEndpoint] = useState('Things');
  const [singleId, setSingleId] = useState('');
  const [filterStr, setFilterStr] = useState('');
  const [expandStr, setExpandStr] = useState('');
  const [selectStr, setSelectStr] = useState('');
  const [orderbyStr, setOrderbyStr] = useState('');
  const [topStr, setTopStr] = useState('');
  const [skipStr, setSkipStr] = useState('');
  const [countBool, setCountBool] = useState(false);

  const [responseJson, setResponseJson] = useState(null);
  const [executionTimeMs, setExecutionTimeMs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Construct final URL
  const queryParts = [];
  if (filterStr) queryParts.push(`$filter=${encodeURIComponent(filterStr)}`);
  if (expandStr) queryParts.push(`$expand=${encodeURIComponent(expandStr)}`);
  if (selectStr) queryParts.push(`$select=${encodeURIComponent(selectStr)}`);
  if (orderbyStr) queryParts.push(`$orderby=${encodeURIComponent(orderbyStr)}`);
  if (topStr) queryParts.push(`$top=${encodeURIComponent(topStr)}`);
  if (skipStr) queryParts.push(`$skip=${encodeURIComponent(skipStr)}`);
  if (countBool) queryParts.push('$count=true');

  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  const path = singleId ? `/${selectedEndpoint}('${singleId}')` : `/${selectedEndpoint}${queryString}`;
  const fullUrl = `/v1.1${path}`;

  const executeQuery = async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const res = await fetch(fullUrl);
      const duration = Math.round(performance.now() - start);
      setExecutionTimeMs(duration);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setResponseJson(data);
    } catch (err) {
      setError(err.message);
      setResponseJson(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeQuery();
  }, [selectedEndpoint]);

  const applyPreset = (preset) => {
    setSelectedEndpoint(preset.endpoint);
    setSingleId('');
    setFilterStr(''); setExpandStr(''); setSelectStr(''); setOrderbyStr(''); setTopStr(''); setSkipStr(''); setCountBool(false);

    if (preset.query) {
      const params = new URLSearchParams(preset.query);
      if (params.has('$filter')) setFilterStr(params.get('$filter'));
      if (params.has('$expand')) setExpandStr(params.get('$expand'));
      if (params.has('$select')) setSelectStr(params.get('$select'));
      if (params.has('$orderby')) setOrderbyStr(params.get('$orderby'));
      if (params.has('$top')) setTopStr(params.get('$top'));
      if (params.has('$skip')) setSkipStr(params.get('$skip'));
      if (params.has('$count')) setCountBool(params.get('$count') === 'true');
    }
    setTimeout(executeQuery, 50);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.origin + fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-3 bg-[#0A0A0A] border border-white/[0.08] rounded-xl">
        <div>
          <p className="text-[9px] text-[#525252] font-mono uppercase tracking-wider">OGC SensorThings API 1.1</p>
          <h2 className="text-xl font-bold text-white font-display">Live REST API & OData Explorer</h2>
        </div>
        <Server className="w-5 h-5 text-[#22D3EE]" />
      </div>

      {/* Preset Queries */}
      <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-4 space-y-2">
        <p className="text-[9px] text-[#525252] font-mono uppercase tracking-wider">Preset OData Queries</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="px-2.5 py-1 bg-[#111] hover:bg-white/5 border border-white/[0.06] hover:border-white/20 text-[#737373] hover:text-white rounded-lg text-[10px] font-mono transition-all"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Query Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Controls */}
        <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-5 space-y-4 font-mono text-[10px]">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <Filter className="w-4 h-4 text-[#22D3EE]" />
            <h4 className="text-xs font-bold text-white font-display">Query Builder</h4>
          </div>

          {/* Endpoint Selector */}
          <div className="space-y-1">
            <label className="text-[#737373]">Entity Collection</label>
            <select
              value={selectedEndpoint}
              onChange={e => setSelectedEndpoint(e.target.value)}
              className="w-full px-3 py-2 bg-[#111] border border-white/10 rounded-lg text-white font-bold outline-none"
            >
              {ENDPOINTS.map(ep => (
                <option key={ep} value={ep}>{ep}</option>
              ))}
            </select>
          </div>

          {/* Single Entity ID */}
          <div className="space-y-1">
            <label className="text-[#737373]">Single Entity ID (Optional)</label>
            <input
              type="text"
              placeholder="e.g. thing-tn-ariyalur"
              value={singleId}
              onChange={e => setSingleId(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#111] border border-white/10 rounded-lg text-white outline-none"
            />
          </div>

          {!singleId && (
            <>
              <div className="space-y-1">
                <label className="text-[#737373]">$filter (OData Filter)</label>
                <input
                  type="text"
                  placeholder="e.g. result gt 1010"
                  value={filterStr}
                  onChange={e => setFilterStr(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#111] border border-white/10 rounded-lg text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#737373]">$expand (Relationships)</label>
                <input
                  type="text"
                  placeholder="e.g. Datastreams, Locations"
                  value={expandStr}
                  onChange={e => setExpandStr(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#111] border border-white/10 rounded-lg text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[#737373]">$top</label>
                  <input
                    type="number"
                    placeholder="10"
                    value={topStr}
                    onChange={e => setTopStr(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#111] border border-white/10 rounded-lg text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[#737373]">$skip</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={skipStr}
                    onChange={e => setSkipStr(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#111] border border-white/10 rounded-lg text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#737373]">$orderby</label>
                <input
                  type="text"
                  placeholder="e.g. result desc"
                  value={orderbyStr}
                  onChange={e => setOrderbyStr(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#111] border border-white/10 rounded-lg text-white outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="count"
                  checked={countBool}
                  onChange={e => setCountBool(e.target.checked)}
                  className="accent-[#22D3EE]"
                />
                <label htmlFor="count" className="text-white cursor-pointer">$count=true (Inline total count)</label>
              </div>
            </>
          )}

          <button
            onClick={executeQuery}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-white text-black font-bold text-xs rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" /> Execute Query
          </button>
        </div>

        {/* URL Bar & Response Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active URL */}
          <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-3 flex items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-2 overflow-hidden flex-1">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">GET</span>
              <span className="text-white font-semibold truncate">{fullUrl}</span>
            </div>
            <button
              onClick={copyUrl}
              className="p-1.5 rounded border border-white/10 text-[#737373] hover:text-white transition-colors"
              title="Copy Full URL"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Response Viewer */}
          <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl overflow-hidden flex flex-col h-[520px]">
            <div className="px-4 py-2.5 bg-[#111] border-b border-white/[0.06] flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#525252]">Response Payload</span>
              {executionTimeMs !== null && (
                <span className="text-[#22D3EE]">Latency: {executionTimeMs} ms</span>
              )}
            </div>

            <div className="flex-1 p-4 overflow-auto font-mono text-xs text-[#D4D4D4] bg-[#050505]">
              {loading ? (
                <div className="h-full flex items-center justify-center text-[#525252]">
                  <div className="w-6 h-6 border-2 border-[#22D3EE]/20 border-t-[#22D3EE] rounded-full animate-spin mr-2" />
                  Executing OData query...
                </div>
              ) : error ? (
                <div className="text-red-400 p-2 border border-red-500/20 rounded bg-red-950/20">
                  {error}
                </div>
              ) : (
                <pre className="text-[11px] leading-relaxed">
                  {JSON.stringify(responseJson, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
