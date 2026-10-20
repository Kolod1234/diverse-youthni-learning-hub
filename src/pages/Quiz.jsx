import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button, Card, LinearProgress, Radio, RadioGroup as MuiRadioGroup, FormControlLabel } from '@mui/material';
const Progress = ({ value, className }) => <LinearProgress variant="determinate" value={value || 0} className={className} sx={{ borderRadius: 1 }} />;
const RadioGroup = ({ value, onValueChange, disabled, children }) => (
  <MuiRadioGroup value={value ?? ''} onChange={(e) => !disabled && onValueChange?.(e.target.value)}>{children}</MuiRadioGroup>
);
const RadioGroupItem = ({ value, id, className }) => <Radio value={value} id={id} size="small" className={className} />;
const Label = ({ children, className, htmlFor, ...props }) => <label htmlFor={htmlFor} className={className} {...props}>{children}</label>;
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RefreshIcon from '@mui/icons-material/Refresh';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
const _w = (I) => ({ size, color, className, style, ...r }) => <I className={className} style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const Clock = _w(AccessTimeIcon), CheckCircle = _w(CheckCircleIcon), XCircle = _w(CancelIcon), AlertCircle = _w(ErrorOutlineIcon);
const Trophy = _w(EmojiEventsIcon), ArrowLeft = _w(ArrowBackIcon), ArrowRight = _w(ArrowForwardIcon);
const RefreshCw = _w(RefreshIcon), Award = _w(MilitaryTechIcon), Target = _w(GpsFixedIcon);
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
  const [showFeedback, setShowFeedback] = useState(false);
  const [questionStates, setQuestionStates] = useState({});
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
    enabled: !!quiz?.course_id && quiz.course_id !== 'null',
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
    
    // Show immediate feedback
    const isCorrect = quiz.questions[questionIndex].correct_answer === answerIndex;
    setQuestionStates(prev => ({
      ...prev,
      [questionIndex]: { answered: true, correct: isCorrect }
    }));
    setShowFeedback(true);
    
    // Auto-advance after 1.5 seconds on correct answer
    if (isCorrect && questionIndex < quiz.questions.length - 1) {
      setTimeout(() => {
        setShowFeedback(false);
        setCurrentQuestion(prev => prev + 1);
      }, 1500);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    const answersArray = quiz.questions.map((q, idx) => {
      const userAnswer = answers[idx];
      
      // Handle fill-in-the-blank questions
      if (q.type === 'fill_in_blank') {
        const isCorrect = Array.isArray(userAnswer) && Array.isArray(q.correct_answers) &&
          userAnswer.every((ans, i) => ans?.trim().toLowerCase() === q.correct_answers[i]?.trim().toLowerCase());
        return {
          question_index: idx,
          selected_answer: userAnswer,
          is_correct: isCorrect
        };
      }
      
      // Handle regular multiple choice questions
      return {
        question_index: idx,
        selected_answer: userAnswer ?? -1,
        is_correct: userAnswer === q.correct_answer
      };
    });

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

      // Award points - extra for perfect score
      const bonusPoints = score === 100 ? 30 : 20;
      await awardPoints(bonusPoints);

      // Perfect score achievement
      if (score === 100) {
        const today = new Date().toISOString().split('T')[0];
        await base44.entities.Achievement.create({
          type: 'badge',
          name: 'Perfect Score',
          description: 'Get 100% on a quiz',
          icon: 'perfect_quiz',
          earned_date: today,
        });
      }
    }

    setShowResults(true);
  };

  const awardPoints = async (points) => {
    try {
      const progressList = await base44.entities.UserProgress.filter({ created_by: user?.email });
      const today = new Date().toISOString().split('T')[0];
      
      if (progressList.length > 0) {
        const progress = progressList[0];
        const newPoints = (progress.points || 0) + points;
        const newLevel = Math.floor(newPoints / 100) + 1;
        
        // Calculate streak
        let newStreak = progress.streak_days || 0;
        const lastActivity = progress.last_activity_date;
        
        if (lastActivity) {
          const lastDate = new Date(lastActivity);
          const todayDate = new Date(today);
          const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }
        
        await base44.entities.UserProgress.update(progress.id, {
          points: newPoints,
          level: newLevel,
          total_quizzes_completed: (progress.total_quizzes_completed || 0) + 1,
          last_activity_date: today,
          streak_days: newStreak,
        });

        // Check for quiz achievements
        if (progress.total_quizzes_completed === 0) {
          await base44.entities.Achievement.create({
            type: 'badge',
            name: 'Quiz Master',
            description: 'Pass your first quiz',
            icon: 'first_quiz',
            earned_date: today,
          });
        }
      } else {
        await base44.entities.UserProgress.create({
          points: points,
          level: 1,
          total_quizzes_completed: 1,
          last_activity_date: today,
          streak_days: 1,
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
    setShowFeedback(false);
    setQuestionStates({});
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loadingQuiz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading quiz...</p>
        </Card>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Quiz not found</h2>
          <p className="text-muted-foreground mb-6">This quiz may have been removed or doesn't exist.</p>
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
      <div className="min-h-screen bg-background p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="overflow-hidden border-0 shadow-lg">
              {/* Results Header */}
              <div className={`p-8 text-center ${passed ? 'bg-indigo-600' : 'bg-indigo-600'} text-white`}>
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
                    <div className="text-3xl font-bold text-foreground mb-1">{score}%</div>
                    <div className="text-sm text-muted-foreground">Your Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600 mb-1">{correctCount}/{totalQuestions}</div>
                    <div className="text-sm text-muted-foreground">Correct</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600 mb-1">{attempts.length}</div>
                    <div className="text-sm text-muted-foreground">Attempts</div>
                  </div>
                </div>

                {/* Question Review */}
                <div className="space-y-4 mb-8">
                  <h3 className="font-semibold text-foreground text-lg">Review Your Answers</h3>
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
                            <p className="font-medium text-foreground mb-2">
                              Question {idx + 1}: {question.question}
                            </p>
                            <div className="space-y-2">
                              {question.options.map((option, optIdx) => (
                                <div
                                  key={optIdx}
                                  className={`p-2 rounded-lg text-sm ${
                                    optIdx === question.correct_answer
                                      ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-medium'
                                      : selectedAnswer === optIdx && !isCorrect
                                      ? 'bg-red-100 dark:bg-red-500/15 text-red-800 dark:text-red-300'
                                      : 'bg-card text-muted-foreground'
                                  }`}
                                >
                                  {optIdx === question.correct_answer && '✓ '}
                                  {selectedAnswer === optIdx && optIdx !== question.correct_answer && '✗ '}
                                  {option}
                                </div>
                              ))}
                            </div>
                            {question.explanation && (
                              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-500/15 rounded-lg">
                                <p className="text-sm text-blue-900 dark:text-blue-300">
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
  const hasAnswered = question.type === 'fill_in_blank' 
    ? (Array.isArray(answers[currentQuestion]) && answers[currentQuestion].some(a => a?.trim()))
    : answers[currentQuestion] !== undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Redesign (wireframe L9): navy quiz bar with exit, title, question count and progress */}
      <div className="bg-[#0b2f5c] text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-2 flex items-center gap-3">
          <Link to={createPageUrl('CourseDetails') + `?id=${quiz.course_id}`} className="inline-flex items-center gap-2 min-h-11 font-medium text-white no-underline">
            <ArrowLeft className="w-4 h-4" />
            Exit quiz
          </Link>
          <h1 className="flex-1 min-w-0 text-center font-bold text-base sm:text-lg truncate">{quiz.title}</h1>
          {timeLeft !== null && (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-semibold ${timeLeft < 60 ? 'bg-red-600' : 'bg-white/15'}`}>
              <Clock className="w-4 h-4" />{formatTime(timeLeft)}
            </span>
          )}
          <span className="text-sm text-[#dbe4f0] whitespace-nowrap">Question {currentQuestion + 1} of {quiz.questions.length}</span>
        </div>
        <div className="h-1.5 bg-white/15" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Quiz progress">
          <div className="h-full bg-green-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="max-w-3xl mx-auto p-4 sm:p-8">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card className="p-8 border-0 shadow-lg mb-6">
            {/* Question */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground flex-1">
                  {question.question}
                </h2>
                {question.marks && (
                  <Badge className="bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full text-sm ml-4">
                    {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
                  </Badge>
                )}
              </div>

              {question.image_url && (
                <img 
                  src={question.image_url} 
                  alt="Question diagram"
                  className="w-full max-w-md mx-auto rounded-lg mb-6 shadow-md"
                />
              )}

              {question.type === 'fill_in_blank' ? (
                <div className="space-y-4">
                  {question.text?.split('______').map((part, idx, arr) => (
                    <div key={idx} className="flex flex-wrap items-center gap-2">
                      <span className="text-foreground">{part}</span>
                      {idx < arr.length - 1 && (
                        <input
                          type="text"
                          className="border-2 border-border rounded-lg px-3 py-2 min-w-[200px] focus:border-indigo-500 focus:outline-none"
                          placeholder={`Blank ${idx + 1}`}
                          value={answers[currentQuestion]?.[idx] || ''}
                          onChange={(e) => {
                            const newAnswers = { ...answers };
                            if (!newAnswers[currentQuestion]) newAnswers[currentQuestion] = [];
                            newAnswers[currentQuestion][idx] = e.target.value;
                            setAnswers(newAnswers);
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <RadioGroup
                  value={answers[currentQuestion]?.toString()}
                  onValueChange={(value) => handleAnswerSelect(currentQuestion, parseInt(value))}
                  disabled={showFeedback}
                >
                  <div className="space-y-3">
                    {question.options.map((option, idx) => {
                      const isSelected = answers[currentQuestion] === idx;
                      const isCorrect = question.correct_answer === idx;
                      const showResult = showFeedback && isSelected;
                      
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            showResult && isCorrect
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15'
                              : showResult && !isCorrect
                              ? 'border-red-500 bg-red-50 dark:bg-red-500/15'
                              : isSelected
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/15'
                              : 'border-border hover:border-gray-300 bg-card'
                          }`}
                        >
                          <RadioGroupItem value={idx.toString()} id={`option-${idx}`} className="mt-1" />
                          <Label htmlFor={`option-${idx}`} className="ml-3 flex-1 cursor-pointer text-foreground">
                            {option}
                          </Label>
                          {showResult && isCorrect && (
                            <CheckCircle className="w-5 h-5 text-emerald-600 ml-2" />
                          )}
                          {showResult && !isCorrect && (
                            <XCircle className="w-5 h-5 text-red-600 ml-2" />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </RadioGroup>
              )}

              {showFeedback && question.explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-blue-50 dark:bg-blue-500/15 border border-blue-200 rounded-lg"
                >
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">💡 Explanation:</p>
                  <p className="text-sm text-blue-800 dark:text-blue-300">{question.explanation}</p>
                </motion.div>
              )}
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
                  onClick={() => {
                    setShowFeedback(false);
                    setCurrentQuestion(prev => prev + 1);
                  }}
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

        {/* Progress Tracker */}
        <Card className="p-6 bg-muted border-0 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Progress</h3>
            <span className="text-sm text-muted-foreground">
              {Object.keys(questionStates).filter(k => questionStates[k].correct).length} correct
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {quiz.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentQuestion(idx);
                  setShowFeedback(false);
                }}
                className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                  idx === currentQuestion
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                    : questionStates[idx]?.correct
                    ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    : questionStates[idx]?.answered
                    ? 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300'
                    : answers[idx] !== undefined
                    ? 'bg-gray-300 text-foreground'
                    : 'bg-muted text-gray-400'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </Card>

        {/* Quiz Info */}
        <Card className="p-6 bg-muted border-0">
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Course</p>
              <p className="font-medium text-foreground">{course?.title}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Passing Score</p>
              <p className="font-medium text-foreground">{quiz.passing_score || 70}%</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Total Questions</p>
              <p className="font-medium text-foreground">{quiz.questions.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Your Attempts</p>
              <p className="font-medium text-foreground">{attempts.length}</p>
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