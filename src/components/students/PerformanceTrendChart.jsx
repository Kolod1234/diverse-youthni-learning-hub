import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CircularProgress } from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

export default function PerformanceTrendChart({ email }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['student-performance-trend', email],
    queryFn: async () => (await base44.functions.invoke('studentPerformanceTrend', { email })).data,
    enabled: !!email
  });

  const series = data?.series || [];

  return (
    <Card className="p-6 mb-6">
      <h3 className="font-semibold mb-1">Learning Growth</h3>
      <p className="text-gray-500 text-sm mb-4">
        Cumulative best-score points over time — GCSE and A-Level.
      </p>

      {isLoading && (
        <div className="flex justify-center py-10">
          <CircularProgress size={28} />
        </div>
      )}

      {!isLoading && error && (
        <p className="text-gray-500 text-sm py-4">
          Trend unavailable: {error?.response?.data?.error || error?.message}
        </p>
      )}

      {!isLoading && !error && series.length === 0 && (
        <p className="text-gray-500 text-sm py-4">
          No topic-check history yet — the growth chart appears once the student submits their first topic check.
        </p>
      )}

      {!isLoading && !error && series.length > 0 && (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip labelFormatter={formatDate} />
              <Legend />
              <Line
                type="monotone" dataKey="gcse" name="GCSE points"
                stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }}
              />
              <Line
                type="monotone" dataKey="alevel" name="A-Level points"
                stroke="#9333ea" strokeWidth={2} dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}