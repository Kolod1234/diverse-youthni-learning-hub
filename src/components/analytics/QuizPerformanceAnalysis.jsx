import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  TrendingUp, TrendingDown, AlertCircle, CheckCircle, 
  Target, Brain, BarChart3 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function QuizPerformanceAnalysis({ quizAttempts, enrollments, courses }) {
  const { data: quizzes = [] } = useQuery({
    queryKey: ['all-quizzes'],
    queryFn: () => base44.entities.Quiz.list(),
  });

  const performanceData = useMemo(() => {
    // Group attempts by quiz
    const quizPerformance = {};
    
    quizAttempts.forEach(attempt => {
      if (!quizPerformance[attempt.quiz_id]) {
        quizPerformance[attempt.quiz_id] = {
          attempts: [],
          totalScore: 0,
          passed: 0,
          failed: 0,
        };
      }
      
      quizPerformance[attempt.quiz_id].attempts.push(attempt);
      quizPerformance[attempt.quiz_id].totalScore += attempt.score;
      if (attempt.passed) {
        quizPerformance[attempt.quiz_id].passed++;
      } else {
        quizPerformance[attempt.quiz_id].failed++;
      }
    });

    // Calculate averages and identify weak areas
    const weakAreas = [];
    const strongAreas = [];
    
    Object.entries(quizPerformance).forEach(([quizId, data]) => {
      const quiz = quizzes.find(q => q.id === quizId);
      const avgScore = data.totalScore / data.attempts.length;
      const course = courses.find(c => c.id === quiz?.course_id);
      
      const quizData = {
        quizId,
        quiz,
        course,
        avgScore: Math.round(avgScore),
        attempts: data.attempts.length,
        passed: data.passed,
        failed: data.failed,
        trend: data.attempts.length > 1 
          ? data.attempts[data.attempts.length - 1].score - data.attempts[0].score
          : 0,
      };

      if (avgScore < 70) {
        weakAreas.push(quizData);
      } else if (avgScore >= 85) {
        strongAreas.push(quizData);
      }
    });

    // Analyze question-level performance
    const questionAnalysis = {};
    quizAttempts.forEach(attempt => {
      attempt.answers?.forEach(answer => {
        const key = `${attempt.quiz_id}_${answer.question_index}`;
        if (!questionAnalysis[key]) {
          questionAnalysis[key] = {
            quizId: attempt.quiz_id,
            questionIndex: answer.question_index,
            correct: 0,
            total: 0,
          };
        }
        questionAnalysis[key].total++;
        if (answer.is_correct) {
          questionAnalysis[key].correct++;
        }
      });
    });

    const difficultQuestions = Object.values(questionAnalysis)
      .filter(q => q.total >= 2 && (q.correct / q.total) < 0.6)
      .sort((a, b) => (a.correct / a.total) - (b.correct / b.total))
      .slice(0, 5);

    return {
      weakAreas: weakAreas.sort((a, b) => a.avgScore - b.avgScore),
      strongAreas: strongAreas.sort((a, b) => b.avgScore - a.avgScore),
      difficultQuestions,
      totalQuizzes: Object.keys(quizPerformance).length,
    };
  }, [quizAttempts, quizzes, courses]);

  const overallPassRate = quizAttempts.length > 0
    ? Math.round((quizAttempts.filter(a => a.passed).length / quizAttempts.length) * 100)
    : 0;

  const avgScore = quizAttempts.length > 0
    ? Math.round(quizAttempts.reduce((sum, a) => sum + a.score, 0) / quizAttempts.length)
    : 0;

  const improvement = useMemo(() => {
    if (quizAttempts.length < 2) return 0;
    const recent = quizAttempts.slice(-5);
    const older = quizAttempts.slice(0, Math.min(5, quizAttempts.length - 5));
    const recentAvg = recent.reduce((sum, a) => sum + a.score, 0) / recent.length;
    const olderAvg = older.length > 0 
      ? older.reduce((sum, a) => sum + a.score, 0) / older.length
      : recentAvg;
    return Math.round(recentAvg - olderAvg);
  }, [quizAttempts]);

  if (quizAttempts.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Quiz Data Yet</h3>
        <p className="text-gray-500">
          Complete some quizzes to see your performance analysis
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Average Score</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">{avgScore}%</p>
          <p className="text-sm text-gray-600 mt-1">Across {quizAttempts.length} attempts</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Pass Rate</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{overallPassRate}%</p>
          <p className="text-sm text-gray-600 mt-1">Overall success rate</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              {improvement >= 0 ? (
                <TrendingUp className="w-5 h-5 text-purple-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-purple-600" />
              )}
            </div>
            <h3 className="font-semibold text-gray-900">Improvement</h3>
          </div>
          <p className={`text-3xl font-bold ${improvement >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
            {improvement >= 0 ? '+' : ''}{improvement}%
          </p>
          <p className="text-sm text-gray-600 mt-1">Recent vs older attempts</p>
        </Card>
      </div>

      {/* Weak Areas */}
      {performanceData.weakAreas.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <h3 className="text-xl font-bold text-gray-900">Areas Needing Attention</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Focus on these topics to improve your understanding
          </p>
          
          <div className="space-y-4">
            {performanceData.weakAreas.map((area, index) => (
              <motion.div
                key={area.quizId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-orange-50 border border-orange-200 rounded-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{area.quiz?.title}</h4>
                      <Badge className="bg-orange-100 text-orange-800">
                        {area.avgScore}% avg
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {area.course?.title}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">
                        {area.attempts} attempt{area.attempts > 1 ? 's' : ''}
                      </span>
                      <span className="text-green-600">
                        {area.passed} passed
                      </span>
                      <span className="text-red-600">
                        {area.failed} failed
                      </span>
                      {area.trend !== 0 && (
                        <span className={area.trend > 0 ? 'text-green-600' : 'text-red-600'}>
                          {area.trend > 0 ? '↑' : '↓'} {Math.abs(area.trend)}%
                        </span>
                      )}
                    </div>

                    <div className="mt-3">
                      <Progress 
                        value={area.avgScore} 
                        className="h-2 [&>div]:bg-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Strong Areas */}
      {performanceData.strongAreas.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="text-xl font-bold text-gray-900">Your Strengths</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            You're excelling in these areas!
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {performanceData.strongAreas.slice(0, 4).map((area, index) => (
              <motion.div
                key={area.quizId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <h4 className="font-semibold text-gray-900 text-sm">{area.quiz?.title}</h4>
                </div>
                <p className="text-xs text-gray-600 mb-2">{area.course?.title}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">{area.avgScore}%</span>
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    {area.attempts} attempt{area.attempts > 1 ? 's' : ''}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-indigo-600" />
          <h3 className="text-xl font-bold text-gray-900">Recommendations</h3>
        </div>
        
        <div className="space-y-3">
          {performanceData.weakAreas.length > 0 && (
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-indigo-600">1</span>
              </div>
              <p className="text-sm text-gray-700">
                Review the content for <strong>{performanceData.weakAreas[0]?.course?.title}</strong> 
                {' '}where you scored {performanceData.weakAreas[0]?.avgScore}%
              </p>
            </div>
          )}
          
          {improvement < 0 && (
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-indigo-600">2</span>
              </div>
              <p className="text-sm text-gray-700">
                Your scores have decreased recently. Take a break and review fundamentals before continuing.
              </p>
            </div>
          )}
          
          {quizAttempts.filter(a => !a.passed).length > 0 && (
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-indigo-600">3</span>
              </div>
              <p className="text-sm text-gray-700">
                Retake failed quizzes after reviewing the lesson materials to reinforce your understanding.
              </p>
            </div>
          )}

          {overallPassRate > 80 && (
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-green-600">✓</span>
              </div>
              <p className="text-sm text-gray-700">
                Excellent work! You're doing great. Challenge yourself with more advanced topics.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}