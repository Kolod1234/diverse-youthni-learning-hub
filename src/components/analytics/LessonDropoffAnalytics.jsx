import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card } from '@/components/ui/card';
import { AlertTriangle, TrendingDown, Eye } from 'lucide-react';

export default function LessonDropoffAnalytics({ lessonMetrics = [] }) {
  if (!lessonMetrics || lessonMetrics.length === 0) {
    return (
      <Card className="p-8 text-center text-gray-500">
        <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No lesson metrics available</p>
      </Card>
    );
  }

  // Sort by drop-off rate to identify problematic lessons
  const sortedByDropOff = [...lessonMetrics].sort((a, b) => (b.drop_off_rate || 0) - (a.drop_off_rate || 0));
  const highRiskLessons = sortedByDropOff.filter(l => (l.drop_off_rate || 0) > 30).slice(0, 10);

  // Prepare data for charts
  const lessonComparisonData = lessonMetrics.slice(0, 15).map(lesson => ({
    name: lesson.lesson_id?.substring(0, 8) || 'Lesson',
    completion: lesson.completion_rate || 0,
    dropOff: lesson.drop_off_rate || 0,
    engagement: lesson.average_engagement_score || 0,
  }));

  const completionTrendData = lessonMetrics.map(lesson => ({
    name: lesson.lesson_id?.substring(0, 8) || 'Lesson',
    rate: lesson.completion_rate || 0,
    attempts: lesson.total_attempts || 0,
  }));

  return (
    <div className="space-y-6">
      {/* High Risk Alert */}
      {highRiskLessons.length > 0 && (
        <Card className="p-6 bg-red-50 border-red-200 border-2">
          <h3 className="font-semibold text-lg flex items-center gap-2 text-red-900 mb-3">
            <AlertTriangle className="w-5 h-5" />
            High Drop-Off Rate Lessons
          </h3>
          <div className="space-y-2">
            {highRiskLessons.map((lesson, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white rounded border border-red-100">
                <div>
                  <div className="font-medium text-gray-900">Lesson {lesson.lesson_id?.substring(0, 8)}</div>
                  <div className="text-sm text-gray-600">{lesson.total_attempts || 0} total attempts</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">{Math.round(lesson.drop_off_rate || 0)}%</div>
                  <div className="text-xs text-gray-500">Drop-off rate</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Completion vs Drop-Off */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Completion vs Drop-Off Rates</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={lessonComparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="completion" fill="#10b981" name="Completion %" />
            <Bar dataKey="dropOff" fill="#ef4444" name="Drop-Off %" />
            <Bar dataKey="engagement" fill="#3b82f6" name="Engagement %" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Completion Trend */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <TrendingDown className="w-5 h-5" />
          Completion Rate Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={completionTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis yAxisId="left" label={{ value: 'Completion Rate (%)', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Attempts', angle: 90, position: 'insideRight' }} />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2} name="Completion %" />
            <Line yAxisId="right" type="monotone" dataKey="attempts" stroke="#3b82f6" strokeWidth={2} name="Attempts" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Lesson Performance Summary */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Lesson Performance Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Lesson</th>
                <th className="px-4 py-2 text-left font-semibold">Attempts</th>
                <th className="px-4 py-2 text-left font-semibold">Completions</th>
                <th className="px-4 py-2 text-left font-semibold">Completion %</th>
                <th className="px-4 py-2 text-left font-semibold">Drop-Off %</th>
                <th className="px-4 py-2 text-left font-semibold">Avg Time</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedByDropOff.slice(0, 10).map((lesson, idx) => {
                const status =
                  lesson.drop_off_rate > 40
                    ? '🔴 Critical'
                    : lesson.drop_off_rate > 20
                    ? '🟡 Warning'
                    : '🟢 Good';

                return (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">Lesson {lesson.lesson_id?.substring(0, 8)}</td>
                    <td className="px-4 py-3">{lesson.total_attempts || 0}</td>
                    <td className="px-4 py-3">{lesson.total_completions || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${lesson.completion_rate > 70 ? 'text-green-600' : 'text-orange-600'}`}>
                        {Math.round(lesson.completion_rate || 0)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${lesson.drop_off_rate > 30 ? 'text-red-600' : 'text-gray-600'}`}>
                        {Math.round(lesson.drop_off_rate || 0)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">{Math.round((lesson.average_time_spent_seconds || 0) / 60)}m</td>
                    <td className="px-4 py-3">{status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}