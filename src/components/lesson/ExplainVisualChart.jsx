import React from 'react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

const COLORS = ['#f97316', '#0ea5e9', '#10b981', '#a855f7'];

/**
 * Renders a small chart (line, bar or scatter) inside the Explain-this popup,
 * built from data the assistant returns with its explanation.
 */
export default function ExplainVisualChart({ chart }) {
  const series = chart.series || [];
  const rowCount = Math.max(0, ...series.map(s => (s.points || []).length));
  if (!rowCount) return null;

  // One table row per point index; x values come from the first series.
  const data = Array.from({ length: rowCount }, (_, i) => {
    const row = { name: String(series[0].points?.[i]?.x ?? i + 1) };
    series.forEach((s, si) => { row[s.name || `Series ${si + 1}`] = s.points?.[i]?.y; });
    return row;
  });

  const axes = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
      <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
      {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
    </>
  );

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {chart.chart_type === 'bar' ? (
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
            {axes}
            {series.map((s, i) => (
              <Bar key={i} dataKey={s.name || `Series ${i + 1}`} fill={COLORS[i % COLORS.length]} radius={[3, 3, 0, 0]} />
            ))}
          </BarChart>
        ) : chart.chart_type === 'scatter' ? (
          <ScatterChart margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
            {axes}
            {series.map((s, i) => (
              <Scatter key={i} name={s.name || `Series ${i + 1}`} data={data} fill={COLORS[i % COLORS.length]} />
            ))}
          </ScatterChart>
        ) : (
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
            {axes}
            {series.map((s, i) => (
              <Line key={i} type="monotone" dataKey={s.name || `Series ${i + 1}`} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}