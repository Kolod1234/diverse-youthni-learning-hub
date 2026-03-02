import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import {
  X, Zap, Brain, Trophy, Clock, RefreshCw, Star, Loader2,
  ChevronRight, CheckCircle, XCircle, RotateCcw, Award, Flame
} from 'lucide-react';
import InteractiveQuiz from '@/components/lesson/InteractiveQuiz';
import TrueFalseQuiz from '@/components/lesson/TrueFalseQuiz';
import ShortAnswerQuiz from '@/components/lesson/ShortAnswerQuiz';
import FlashCards from '@/components/lesson/FlashCards';
import EssayQuestion from '@/components/lesson/EssayQuestion';

const QUIZ_TYPES = [
  { id: 'mcq', label: 'MCQ', icon: '🧠', desc: 'Multiple choice questions' },
  { id: 'true_false', label: 'True/False', icon: '⚡', desc: 'True or false statements' },
  { id: 'short_answer', label: 'Short Answer', icon: '✍️', desc: 'Brief written responses' },
  { id: 'essay', label: 'Essay', icon: '📝', desc: 'AI-graded extended writing' },
  { id: 'flashcards', label: 'Flashcards', icon: '🎴', desc: 'Flip-card study mode' },
];

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', color: 'text-green-400 border-green-500/40 bg-green-500/10' },
  { id: 'intermediate', label: 'Medium', color: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10' },
  { id: 'hard', label: 'Hard', color: 'text-red-400 border-red-500/40 bg-red-500/10' },
];

const TIME_LIMITS = [
  { id: 0, label: 'No Limit' },
  { id: 5, label: '5 min' },
  { id: 10, label: '10 min' },
  { id: 15, label: '15 min' },
  { id: 30, label: '30 min' },
];

function ScoreDisplay({ score, total, quizType, timeUsed, onRetry, onNewQuiz }) {
  const pct = total > 0 ? Math.round((score / total) * 100) : score;
  const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-full py-8 px-6 text-center"
    >
      <div className="text-6xl mb-3">
        {stars === 3 ? '🏆' : stars === 2 ? '🥈' : stars === 1 ? '🥉' : '📚'}
      </div>
      <h3 className="text-xl font-bold text-white mb-1">Quiz Complete!</h3>
      <div className="text-5xl font-extrabold text-orange-400 my-3">{pct}%</div>
      <div className="flex gap-1 mb-3">
        {[1, 2, 3].map(s => (
          <Star key={s} className={`w-7 h-7 ${s <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
        ))}
      </div>
      {quizType !== 'essay' && quizType !== 'flashcards' && (
        <p className="text-slate-400 text-sm mb-1">{score} / {total} correct</p>
      )}
      {timeUsed > 0 && (
        <p className="text-slate-500 text-xs mb-4 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {Math.floor(timeUsed / 60)}m {timeUsed % 60}s
        </p>
      )}
      <div className="space-y-2 w-full">
        <button
          onClick={onRetry}
          className="w-full px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Try Again
        </button>
        <button
          onClick={onNewQuiz}
          className="w-full px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" /> New Quiz
        </button>
      </div>
    </motion.div>
  );
}

export default function QuizGeneratorPanel({ lesson, onClose }) {
  const [quizType, setQuizType] = useState('mcq');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [timeLimit, setTimeLimit] = useState(0);

  const [phase, setPhase] = useState('config'); // config | generating | quiz | result
  const [quizData, setQuizData] = useState(null);

  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timeUsed, setTimeUsed] = useState(0);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Timer countdown
  useEffect(() => {
    if (phase === 'quiz' && timeLimit > 0) {
      setTimeRemaining(timeLimit * 60);
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleQuizComplete(score, total, true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase, timeLimit]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleGenerate = async () => {
    setPhase('generating');
    const typeMap = {
      mcq: ['multiple_choice'],
      true_false: ['true_false'],
      short_answer: ['short_answer'],
      essay: ['essay'],
      flashcards: ['fill_blanks'],
    };

    try {
      const response = await base44.functions.invoke('generateLessonInteractives', {
        lessonId: lesson.id,
        difficulty,
        questionTypes: typeMap[quizType],
        keywords: lesson.learning_objectives || []
      });

      if (response.data.success) {
        setQuizData(response.data);
        setPhase('quiz');
      } else {
        toast.error('Failed to generate quiz. Try again.');
        setPhase('config');
      }
    } catch (err) {
      toast.error('Error generating quiz.');
      setPhase('config');
    }
  };

  const handleQuizComplete = (sc, tot, timedOut = false) => {
    clearInterval(timerRef.current);
    const elapsed = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;
    setTimeUsed(elapsed);
    setScore(sc);
    setTotal(tot);
    if (timedOut) toast.warning("Time's up!");
    setPhase('result');
  };

  const handleRetry = () => {
    setPhase('quiz');
    setScore(0);
    setTotal(0);
    setTimeRemaining(timeLimit * 60);
    startTimeRef.current = Date.now();
  };

  const handleNewQuiz = () => {
    setQuizData(null);
    setPhase('config');
    setScore(0);
    setTotal(0);
    clearInterval(timerRef.current);
  };

  return (
    <motion.div
      initial={{ x: 400 }}
      animate={{ x: 0 }}
      exit={{ x: 400 }}
      className="w-96 bg-slate-900 border-l border-slate-700 flex flex-col overflow-hidden flex-shrink-0"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-800/60">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-orange-400" />
          <h3 className="font-bold text-white text-sm">Quiz Generator</h3>
        </div>
        <div className="flex items-center gap-2">
          {phase === 'quiz' && timeLimit > 0 && (
            <span className={`text-xs font-mono font-bold px-2 py-1 rounded ${timeRemaining < 60 ? 'text-red-400 bg-red-500/10' : 'text-green-400 bg-green-500/10'}`}>
              <Clock className="w-3 h-3 inline mr-1" />{formatTime(timeRemaining)}
            </span>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded transition">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">

          {/* Config Phase */}
          {phase === 'config' && (
            <motion.div key="config" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-5">
              {/* Quiz Type */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Quiz Type</p>
                <div className="space-y-2">
                  {QUIZ_TYPES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setQuizType(t.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition flex items-center gap-3 ${
                        quizType === t.id
                          ? 'border-orange-500/60 bg-orange-500/10 text-white'
                          : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <span className="text-lg">{t.icon}</span>
                      <div>
                        <div className="font-medium">{t.label}</div>
                        <div className="text-xs text-slate-500">{t.desc}</div>
                      </div>
                      {quizType === t.id && <CheckCircle className="w-4 h-4 text-orange-400 ml-auto flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Difficulty</p>
                <div className="flex gap-2">
                  {DIFFICULTIES.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setDifficulty(d.id)}
                      className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition ${
                        difficulty === d.id ? d.color : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Limit */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Time Limit</p>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_LIMITS.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTimeLimit(t.id)}
                      className={`py-2 rounded-lg border text-xs font-medium transition ${
                        timeLimit === t.id
                          ? 'border-blue-500/60 bg-blue-500/10 text-blue-300'
                          : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm transition flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Generate Quiz
              </button>
            </motion.div>
          )}

          {/* Generating Phase */}
          {phase === 'generating' && (
            <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-64 gap-4 p-8"
            >
              <Loader2 className="w-10 h-10 text-orange-400 animate-spin" />
              <p className="text-slate-300 text-sm font-medium text-center">
                Generating your {QUIZ_TYPES.find(t => t.id === quizType)?.label} quiz...
              </p>
              <p className="text-slate-500 text-xs text-center">AI is crafting questions based on this lesson</p>
            </motion.div>
          )}

          {/* Quiz Phase */}
          {phase === 'quiz' && quizData && (
            <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-3">
              {quizType === 'mcq' && quizData.quizQuestions?.length > 0 && (
                <InteractiveQuiz
                  questions={quizData.quizQuestions}
                  onComplete={(sc) => handleQuizComplete(sc, quizData.quizQuestions.length)}
                />
              )}
              {quizType === 'true_false' && quizData.trueFalseQuestions?.length > 0 && (
                <TrueFalseQuiz
                  questions={quizData.trueFalseQuestions}
                  onComplete={(correct) => handleQuizComplete(correct, quizData.trueFalseQuestions.length)}
                />
              )}
              {quizType === 'short_answer' && quizData.shortAnswerQuestions?.length > 0 && (
                <ShortAnswerQuiz
                  questions={quizData.shortAnswerQuestions}
                  onComplete={(correct) => handleQuizComplete(correct, quizData.shortAnswerQuestions.length)}
                />
              )}
              {quizType === 'essay' && quizData.essayQuestions?.length > 0 && (
                <EssayQuestion
                  questions={quizData.essayQuestions}
                  onComplete={(count) => handleQuizComplete(count, quizData.essayQuestions.length)}
                />
              )}
              {quizType === 'flashcards' && quizData.flashCards?.length > 0 && (
                <div>
                  <FlashCards cards={quizData.flashCards} />
                  <button
                    onClick={() => handleQuizComplete(quizData.flashCards.length, quizData.flashCards.length)}
                    className="w-full mt-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition"
                  >
                    Done Studying ✓
                  </button>
                </div>
              )}
              {/* Fallback: no content matched */}
              {!quizData.quizQuestions?.length && !quizData.trueFalseQuestions?.length &&
                !quizData.shortAnswerQuestions?.length && !quizData.essayQuestions?.length &&
                !quizData.flashCards?.length && (
                <div className="text-center py-10 text-slate-400">
                  <p className="mb-3">No content generated. Try again.</p>
                  <button onClick={handleNewQuiz} className="text-orange-400 text-sm hover:underline">← Back</button>
                </div>
              )}
            </motion.div>
          )}

          {/* Result Phase */}
          {phase === 'result' && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <ScoreDisplay
                score={score}
                total={total}
                quizType={quizType}
                timeUsed={timeUsed}
                onRetry={handleRetry}
                onNewQuiz={handleNewQuiz}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
}