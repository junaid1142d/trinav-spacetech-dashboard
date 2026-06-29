import { memo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatDateTime, formatPressure } from '../utils/format.js';

function TimeSeriesChart({ data, title = 'Pressure vs Time' }) {
  const chartData = data.map((item) => ({
    ...item,
    displayTime: new Date(item.timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }));

  return (
    <section className="glass-panel rounded-lg p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="text-sm text-zinc-500">{chartData.length} observations</p>
        </div>
      </div>
      <div className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 12, right: 14, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="pressureFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#ffffff" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="displayTime" tick={{ fill: '#a1a1aa', fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis
              domain={['dataMin - 2', 'dataMax + 2']}
              tick={{ fill: '#a1a1aa', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => Number(value).toFixed(0)}
            />
            <Tooltip
              cursor={{ stroke: 'rgba(255,255,255,0.28)' }}
              contentStyle={{
                background: '#111113',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                color: '#fff',
              }}
              labelFormatter={(_, payload) => formatDateTime(payload?.[0]?.payload?.timestamp)}
              formatter={(value) => [formatPressure(Number(value)), 'Pressure']}
            />
            <Area
              type="monotone"
              dataKey="pressure"
              stroke="#ffffff"
              strokeWidth={2}
              fill="url(#pressureFill)"
              animationDuration={900}
              dot={{ fill: '#0a0a0a', stroke: '#ffffff', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, fill: '#ffffff', stroke: '#0a0a0a' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default memo(TimeSeriesChart);
