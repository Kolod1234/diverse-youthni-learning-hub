import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users } from 'lucide-react';
import { KAHOOT_COLORS, KAHOOT_SHAPES } from '@/components/kahoot/kahootTheme';

export default function KahootLiveMetrics({ question, answerCounts, totalPlayers, totalAnswered }) {
  if (!question || question.question_type === 'short_answer') return null;

  const chartData = (question.options || []).map((option, index) => ({
    name: `${KAHOOT_SHAPES[index]} ${option || `Answer ${index + 1}`}`,
    shortName: KAHOOT_SHAPES[index],
    answers: answerCounts[index] || 0,
    color: KAHOOT_COLORS[index],
  }));

  return (
    <div className="w-full rounded-[28px] bg-white/12 p-5 text-white shadow-2xl backdrop-blur-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">Live participation</p>
          <h3 className="text-2xl font-black">Answer distribution</h3>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2">
          <Users className="h-4 w-4" />
          <span className="text-sm font-bold">{totalAnswered} of {totalPlayers} answered</span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
            <XAxis dataKey="shortName" stroke="rgba(255,255,255,0.75)" tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} stroke="rgba(255,255,255,0.75)" tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.08)' }}
              contentStyle={{ background: '#2a143f', border: 'none', borderRadius: 16, color: '#fff' }}
              formatter={(value, _name, entry) => [value, entry.payload.name]}
            />
            <Bar dataKey="answers" radius={[12, 12, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}