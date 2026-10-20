import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, Clock } from 'lucide-react';

export default function DetailedProgressChart({ progressData = [] }) {
  if (!progressData || progressData.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No progress data available</p>
      </Card>
    );
  }

  // Prepare data for different visualizations
  const timeProgressData = progressData.map((item, idx) => ({
    name: `User ${idx + 1}`,
    timeSpent: item.time_spent_seconds / 60, // Convert to minutes
    slideCount: item.total_slides_viewed,
  }));

  const completionTrend = progressData.map((item) => ({
    name: item.user_email?.split('@')[0] || 'User',
    engagement: item.engagement_score || 0,
    slides: item.total_slides_viewed || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Time Spent vs Slides Viewed */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Time Spent vs Engagement
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timeSpent" name="Time Spent (min)" />
            <YAxis dataKey="slideCount" name="Slides Viewed" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="User Progress" data={timeProgressData} fill="#3b82f6" />
          </ScatterChart>
        </ResponsiveContainer>
      </Card>

      {/* Engagement Score Distribution */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Engagement Scores
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={completionTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="engagement" fill="#8b5cf6" name="Engagement Score" />
            <Bar dataKey="slides" fill="#ec4899" name="Slides Viewed" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Detailed User Progress Table */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">User Progress Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">User</th>
                <th className="px-4 py-2 text-left font-semibold">Time Spent</th>
                <th className="px-4 py-2 text-left font-semibold">Slides Viewed</th>
                <th className="px-4 py-2 text-left font-semibold">Engagement</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {progressData.map((item, idx) => {
                const minutes = Math.round(item.time_spent_seconds / 60);
                const status = item.completion_status === 'completed' ? '✓ Complete' : 'In Progress';
                const statusColor = item.completion_status === 'completed' ? 'text-green-600' : 'text-blue-600';

                return (
                  <tr key={idx} className="border-b border-border hover:bg-muted">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {item.user_email?.split('@')[0] || 'User'}
                    </td>
                    <td className="px-4 py-3">{minutes}m</td>
                    <td className="px-4 py-3">{item.total_slides_viewed || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${item.engagement_score || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold">{Math.round(item.engagement_score || 0)}%</span>
                      </div>
                    </td>
                    <td className={`px-4 py-3 font-medium ${statusColor}`}>{status}</td>
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