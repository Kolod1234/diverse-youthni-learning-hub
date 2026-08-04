import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Brain, Loader2, Sparkles, X } from 'lucide-react';
import InteractiveQuiz from '@/components/lesson/InteractiveQuiz';

export default function TopicQuizModal({
  open,
  lesson,
  questions = [],
  loading = false,
  hasNextTopic = false,
  onClose,
  onContinue
}) {
  const shouldReduceMotion = useReducedMotion();
  const [quizScore, setQuizScore] = useState(null);
  const [quizRunKey, setQuizRunKey] = useState(0);
  const onCloseRef = useRef(onClose);
  const topicQuestions = useMemo(() => questions.slice(0, 5), [questions]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;

    setQuizScore(null);
    setQuizRunKey(value => value + 1);

    const handleEscape = (event) => {
      if (event.key === 'Escape') onCloseRef.current?.();
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, lesson?.id]);

  const handleComplete = (score) => {
    setQuizScore({
      score,
      total: topicQuestions.length,
      percentage: topicQuestions.length > 0 ? Math.round((score / topicQuestions.length) * 100) : 0
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#071326]/80 p-3 backdrop-blur-sm sm:p-6"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={shouldReduceMotion ? undefined : { opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose?.();
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="topic-quiz-title"
            className="flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-white text-slate-900 shadow-2xl"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: 'easeOut' }}
          >
            <header className="flex shrink-0 items-start justify-between gap-4 bg-[#071326] px-5 py-4 text-white sm:px-7 sm:py-5">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-[#071326]">
                  <Brain className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-orange-300">
                    <Sparkles className="h-3.5 w-3.5" /> Topic check
                  </p>
                  <h2 id="topic-quiz-title" className="mt-1 truncate font-serif text-xl font-bold sm:text-2xl">
                    {lesson?.title || 'Check your understanding'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-300">
                    Answer a few questions before continuing.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white"
                aria-label="Close topic quiz"
                title="Close topic quiz"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6">
              {loading ? (
                <div className="flex min-h-72 flex-col items-center justify-center text-center">
                  <Loader2 className="mb-4 h-10 w-10 animate-spin text-orange-500" />
                  <h3 className="font-serif text-xl font-bold text-[#0b1b32]">Preparing your topic check</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                    Questions are being created from this lesson's content and learning objectives.
                  </p>
                </div>
              ) : topicQuestions.length > 0 ? (
                <div>
                  <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
                    <span className="font-semibold">{topicQuestions.length} lesson-based question{topicQuestions.length === 1 ? '' : 's'}</span>
                    {quizScore && <span className="font-bold">Score: {quizScore.score}/{quizScore.total} ({quizScore.percentage}%)</span>}
                  </div>
                  <InteractiveQuiz
                    key={quizRunKey}
                    questions={topicQuestions}
                    onComplete={handleComplete}
                  />
                </div>
              ) : (
                <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                  <Brain className="mb-4 h-10 w-10 text-slate-400" />
                  <h3 className="font-serif text-xl font-bold text-[#0b1b32]">Topic check unavailable</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                    No questions were returned for this lesson. You can continue and try the Practice tool later.
                  </p>
                </div>
              )}
            </div>

            <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
              <button
                type="button"
                onClick={onClose}
                className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {quizScore ? 'Review topic' : 'Not now'}
              </button>
              <button
                type="button"
                onClick={onContinue}
                disabled={loading || (topicQuestions.length > 0 && !quizScore)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 text-sm font-bold text-[#071326] shadow-sm hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {hasNextTopic ? 'Continue to next topic' : 'Finish topic'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </footer>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
