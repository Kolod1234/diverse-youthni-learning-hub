import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, CheckCircle, Clock, Trophy, RefreshCw, Play } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentQuizzes({ enrollments, user }) {
  const courseIds = enrollments.map(e => e.course_id);

  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ['student-quizzes', courseIds.join(',')],
    queryFn: async () => {
      if (courseIds.length === 0) return [];
      const results = await Promise.all(
        courseIds.map(id => base44.entities.Quiz.filter({ course_id: id, is_published: true }, '-created_date', 50))
      );
      return results.flat();
    },
    enabled: courseIds.length > 0,
  });

  const { data: attempts = [] } = useQuery({
    queryKey: ['student-quiz-attempts', user?.email],
    queryFn: () => base44.entities.QuizAttempt.filter({ created_by: user?.email }, '-created_date', 200),
    enabled: !!user?.email,
  });

  const getAttemptsForQuiz = (quizId) => attempts.filter(a => a.quiz_id === quizId);
  const getBestScore = (quizId) => {
    const quizAttempts = getAttemptsForQuiz(quizId);
    if (quizAttempts.length === 0) return null;
    return Math.max(...quizAttempts.map(a => a.score || 0));
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-14 bg-gray-50 rounded-2xl">
        <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="font-medium text-gray-600">No quizzes available</p>
        <p className="text-sm text-gray-400 mt-1">Quizzes from your enrolled courses will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {quizzes.map((quiz, i) => {
        const quizAttempts = getAttemptsForQuiz(quiz.id);
        const bestScore = getBestScore(quiz.id);
        const passed = bestScore !== null && bestScore >= (quiz.passing_score || 70);
        const attempted = quizAttempts.length > 0;

        return (
          <motion.div
            key={quiz.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={`p-4 border ${passed ? 'border-green-200' : attempted ? 'border-amber-200' : 'border-gray-200'} hover:shadow-md transition-shadow`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  passed ? 'bg-green-100' : attempted ? 'bg-amber-100' : 'bg-indigo-100'
                }`}>
                  {passed ? (
                    <Trophy className="w-5 h-5 text-green-600" />
                  ) : attempted ? (
                    <RefreshCw className="w-5 h-5 text-amber-600" />
                  ) : (
                    <HelpCircle className="w-5 h-5 text-indigo-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 truncate">{quiz.title}</h3>
                    {passed ? (
                      <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" /> Passed
                      </Badge>
                    ) : attempted ? (
                      <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">Attempted</Badge>
                    ) : (
                      <Badge className="bg-indigo-100 text-indigo-700 border-0 text-xs">Not Started</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                    <span>{quiz.questions?.length || 0} questions</span>
                    {quiz.time_limit_minutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {quiz.time_limit_minutes} min
                      </span>
                    )}
                    <span>Pass: {quiz.passing_score || 70}%</span>
                    {bestScore !== null && (
                      <span className={`font-semibold ${passed ? 'text-green-600' : 'text-amber-600'}`}>
                        Best: {bestScore}%
                      </span>
                    )}
                    {quizAttempts.length > 0 && (
                      <span>{quizAttempts.length} attempt{quizAttempts.length !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>

                <Link to={createPageUrl('Quiz') + `?quizId=${quiz.id}`} className="flex-shrink-0">
                  <Button
                    size="sm"
                    className={attempted
                      ? 'bg-amber-600 hover:bg-amber-700 gap-1.5'
                      : 'bg-indigo-600 hover:bg-indigo-700 gap-1.5'
                    }
                  >
                    {attempted ? (
                      <><RefreshCw className="w-3.5 h-3.5" /> Retake</>
                    ) : (
                      <><Play className="w-3.5 h-3.5" /> Start</>
                    )}
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}