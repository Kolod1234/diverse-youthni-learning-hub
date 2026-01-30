import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from '@/components/ui/card';
import { CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

export default function QuizPerformanceMetrics({ quizData = [] }) {
  if (!quizData || quizData.length === 0) {
    return (
      <Card className="p-8 text-center text-gray-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No quiz data available</p>
      </Card>
    );
  }

  // Calculate aggregate metrics
  const totalAttempts = quizData.length;
  const passedCount = quizData.filter(q => q.passed).length;
  const failedCount = totalAttempts - passedCount;
  const averageScore = Math.round(quizData.reduce((sum, q) => sum + q.score_percentage, 0) / totalAttempts);
  const averageTimeSeconds = Math.round(quizData.reduce((sum, q) => sum + (q.time_spent_seconds || 0), 0) / totalAttempts);

  // Prepare data for charts
  const scoreDistribution = quizData.map((item, idx) => ({
    name: `Attempt ${idx + 1}`,
    score: item.score_percentage,
    time: Math.round(item.time_spent_seconds / 60),
  }));

  const passFailData = [
    { name: 'Passed', value: passedCount, percentage: Math.round((passedCount / totalAttempts) * 100) },
    { name: 'Failed', value: failedCount, percentage: Math.round((failedCount / totalAttempts) * 100) },
  ];

  // Question performance analysis
  const questionStats = {};
  quizData.forEach(attempt => {
    if (attempt.question_performance && Array.isArray(attempt.question_performance)) {
      attempt.question_performance.forEach(qp => {
        const qIdx = qp.question_index;
        if (!questionStats[qIdx]) {
          questionStats[qIdx] = { correct: 0, total: 0 };
        }
        questionStats[qIdx].total += 1;
        if (qp.correct) questionStats[qIdx].correct += 1;
      });
    }
  });

  const questionPerformanceData = Object.entries(questionStats).map(([qIdx, stats]) => ({
    name: `Q${parseInt(qIdx) + 1}`,
    accuracy: Math.round((stats.correct / stats.total) * 100),
  })).sort((a, b) => a.accuracy - b.accuracy);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-2">Pass Rate</div>
          <div className="text-3xl font-bold text-green-600">{passFailData[0].percentage}%</div>
          <div className="text-xs text-gray-500 mt-2">{passedCount} of {totalAttempts}</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-2">Avg Score</div>
          <div className="text-3xl font-bold text-blue-600">{averageScore}%</div>
          <div className="text-xs text-gray-500 mt-2">Across all attempts</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-2">Avg Time</div>
          <div className="text-3xl font-bold text-purple-600">{Math.round(averageTimeSeconds / 60)}m</div>
          <div className="text-xs text-gray-500 mt-2">Per attempt</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-2">Attempts</div>
          <div className="text-3xl font-bold text-orange-600">{totalAttempts}</div>
          <div className="text-xs text-gray-500 mt-2">Total quiz attempts</div>
        </Card>
      </div>

      {/* Score Trend */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Score Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={scoreDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Time (min)', angle: 90, position: 'insideRight' }} />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} name="Score %" />
            <Line yAxisId="right" type="monotone" dataKey="time" stroke="#ef4444" strokeWidth={2} name="Time (min)" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Pass/Fail Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Pass/Fail Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={passFailData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Question Difficulty */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Question Difficulty</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={questionPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="accuracy" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Detailed Attempt History */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Attempt History</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {quizData.map((attempt, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition">
              <div className="flex items-center gap-3">
                {attempt.passed ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <div>
                  <div className="font-medium text-gray-900">Attempt {idx + 1}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(attempt.attempted_at).toLocaleDateString()} • {Math.round(attempt.time_spent_seconds / 60)}m
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{attempt.score_percentage}%</div>
                <div className="text-xs text-gray-500">{attempt.questions_correct}/{attempt.questions_answered} correct</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}