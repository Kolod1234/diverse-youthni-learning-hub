import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Clock, CheckCircle, XCircle, AlertCircle, Trophy, 
  ArrowLeft, ArrowRight, RefreshCw, Award, Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PointsAnimation from '@/components/gamification/PointsAnimation';
import confetti from 'canvas-confetti';

export default function Quiz() {
  const [user, setUser] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  const quizId = urlParams.get('quizId') || urlParams.get('id');

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: quiz, isLoading: loadingQuiz } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      const quizzes = await base44.entities.Quiz.filter({ id: quizId });
      return quizzes[0];
    },
    enabled: !!quizId,
  });

  const { data: attempts = [] } = useQuery({
    queryKey: ['quiz-attempts', quizId, user?.email],
    queryFn: () => base44.entities.QuizAttempt.filter({ 
      quiz_id: quizId, 
      created_by: user?.email 
    }, '-created_date', 10),
    enabled: !!quizId && !!user?.email,
  });

  const { data: course } = useQuery({
    queryKey: ['course', quiz?.course_id],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: quiz.course_id });
      return courses[0];
    },
    enabled: !!quiz?.course_id,
  });

  useEffect(() => {
    if (quiz?.time_limit_minutes && !showResults && startTime === null) {
      setTimeLeft(quiz.time_limit_minutes * 60);
      setStartTime(Date.now());
    }
  }, [quiz, showResults, startTime]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, showResults]);

  const submitAttemptMutation = useMutation({
    mutationFn: (attemptData) => base44.entities.QuizAttempt.create(attemptData),
    onSuccess: async (newAttempt) => {
      queryClient.invalidateQueries(['quiz-attempts', quizId]);
      
      // Trigger AI analysis and recommendations
      try {
        await base44.functions.invoke('analyzeQuizAndProvideRecommendations', {
          quizAttemptId: newAttempt.id
        });
      } catch (error) {
        console.error('Failed to generate recommendations:', error);
      }
    },
  });

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    const answersArray = quiz.questions.map((q, idx) => ({
      question_index: idx,
      selected_answer: answers[idx] ?? -1,
      is_correct: answers[idx] === q.correct_answer
    }));

    const correctCount = answersArray.filter(a => a.is_correct).length;
    const score = (correctCount / quiz.questions.length) * 100;
    const passed = score >= (quiz.passing_score || 70);

    submitAttemptMutation.mutate({
      quiz_id: quizId,
      course_id: quiz.course_id,
      score: Math.round(score),
      passed,
      answers: answersArray,
      time_taken_seconds: timeTaken,
      attempt_number: attempts.length + 1,
    });

    if (passed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Award points
      await awardPoints(20);
    }

    setShowResults(true);
  };

  const awardPoints = async (points) => {
    try {
      const progressList = await base44.entities.UserProgress.filter({ created_by: user?.email });
      
      if (progressList.length > 0) {
        const progress = progressList[0];
        const newPoints = (progress.points || 0) + points;
        const newLevel = Math.floor(newPoints / 100) + 1;
        
        await base44.entities.UserProgress.update(progress.id, {
          points: newPoints,
          level: newLevel,
          total_quizzes_completed: (progress.total_quizzes_completed || 0) + 1,
          last_activity_date: new Date().toISOString().split('T')[0]
        });
      } else {
        await base44.entities.UserProgress.create({
          points: points,
          level: 1,
          total_quizzes_completed: 1,
          last_activity_date: new Date().toISOString().split('T')[0]
        });
      }
      
      setPointsEarned(points);
      setShowPointsAnimation(true);
    } catch (error) {
      console.error('Failed to award points:', error);
    }
  };

  const handleRetake = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setTimeLeft(quiz?.time_limit_minutes ? quiz.time_limit_minutes * 60 : null);
    setStartTime(Date.now());
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loadingQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Loading quiz...</p>
        </Card>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Quiz not found</h2>
          <p className="text-gray-500 mb-6">This quiz may have been removed or doesn't exist.</p>
          <Link to={createPageUrl('Dashboard')}>
            <Button>Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (showResults) {
    const lastAttempt = attempts[0];
    const correctCount = lastAttempt?.answers?.filter(a => a.is_correct).length || 0;
    const totalQuestions = quiz.questions.length;
    const score = lastAttempt?.score || 0;
    const passed = lastAttempt?.passed || false;

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="overflow-hidden border-0 shadow-lg">
              {/* Results Header */}
              <div className={`p-8 text-center ${passed ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-orange-500 to-red-600'} text-white`}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                >
                  {passed ? (
                    <Trophy className="w-20 h-20 mx-auto mb-4" />
                  ) : (
                    <Target className="w-20 h-20 mx-auto mb-4" />
                  )}
                </motion.div>
                <h1 className="text-3xl font-bold mb-2">
                  {passed ? 'Congratulations! 🎉' : 'Keep Practicing! 💪'}
                </h1>
                <p className="text-white/90 text-lg">
                  {passed 
                    ? `You passed with ${score}%!` 
                    : `You scored ${score}%. Need ${quiz.passing_score}% to pass.`}
                </p>
              </div>

              {/* Score Details */}
              <div className="p-8">
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-1">{score}%</div>
                    <div className="text-sm text-gray-500">Your Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600 mb-1">{correctCount}/{totalQuestions}</div>
                    <div className="text-sm text-gray-500">Correct</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600 mb-1">{attempts.length}</div>
                    <div className="text-sm text-gray-500">Attempts</div>
                  </div>
                </div>

                {/* Question Review */}
                <div className="space-y-4 mb-8">
                  <h3 className="font-semibold text-gray-900 text-lg">Review Your Answers</h3>
                  {quiz.questions.map((question, idx) => {
                    const userAnswer = lastAttempt?.answers?.find(a => a.question_index === idx);
                    const isCorrect = userAnswer?.is_correct;
                    const selectedAnswer = userAnswer?.selected_answer;

                    return (
                      <Card key={idx} className={`p-4 border-2 ${isCorrect ? 'border-emerald-200 bg-emerald-50/30' : 'border-red-200 bg-red-50/30'}`}>
                        <div className="flex items-start gap-3 mb-3">
                          {isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 mb-2">
                              Question {idx + 1}: {question.question}
                            </p>
                            <div className="space-y-2">
                              {question.options.map((option, optIdx) => (
                                <div
                                  key={optIdx}
                                  className={`p-2 rounded-lg text-sm ${
                                    optIdx === question.correct_answer
                                      ? 'bg-emerald-100 text-emerald-800 font-medium'
                                      : selectedAnswer === optIdx && !isCorrect
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-white text-gray-600'
                                  }`}
                                >
                                  {optIdx === question.correct_answer && '✓ '}
                                  {selectedAnswer === optIdx && optIdx !== question.correct_answer && '✗ '}
                                  {option}
                                </div>
                              ))}
                            </div>
                            {question.explanation && (
                              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-900">
                                  <strong>Explanation:</strong> {question.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button
                    onClick={handleRetake}
                    variant="outline"
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retake Quiz
                  </Button>
                  <Link to={createPageUrl('CourseDetails') + `?id=${quiz.course_id}`}>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                      Back to Course
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;
  const hasAnswered = answers[currentQuestion] !== undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to={createPageUrl('CourseDetails') + `?id=${quiz.course_id}`}>
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          {timeLeft !== null && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              timeLeft < 60 ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'
            }`}>
              <Clock className="w-5 h-5" />
              <span className="font-semibold">{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card className="p-8 border-0 shadow-lg mb-6">
            {/* Quiz Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
                <Badge className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
                  {currentQuestion + 1} / {quiz.questions.length}
                </Badge>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Question */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {question.question}
              </h2>

              <RadioGroup
                value={answers[currentQuestion]?.toString()}
                onValueChange={(value) => handleAnswerSelect(currentQuestion, parseInt(value))}
              >
                <div className="space-y-3">
                  {question.options.map((option, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        answers[currentQuestion] === idx
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <RadioGroupItem value={idx.toString()} id={`option-${idx}`} className="mt-1" />
                      <Label htmlFor={`option-${idx}`} className="ml-3 flex-1 cursor-pointer text-gray-700">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(prev => prev - 1)}
                disabled={currentQuestion === 0}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>

              {isLastQuestion ? (
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(answers).length !== quiz.questions.length}
                  className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                >
                  Submit Quiz
                  <CheckCircle className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestion(prev => prev + 1)}
                  disabled={!hasAnswered}
                  className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Quiz Info */}
        <Card className="p-6 bg-gray-50 border-0">
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Course</p>
              <p className="font-medium text-gray-900">{course?.title}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Passing Score</p>
              <p className="font-medium text-gray-900">{quiz.passing_score || 70}%</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Total Questions</p>
              <p className="font-medium text-gray-900">{quiz.questions.length}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Your Attempts</p>
              <p className="font-medium text-gray-900">{attempts.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {showPointsAnimation && (
        <PointsAnimation 
          points={pointsEarned}
          onComplete={() => setShowPointsAnimation(false)}
        />
      )}
    </div>
  );
}

function Badge({ children, className }) {
  return <span className={className}>{children}</span>;
}