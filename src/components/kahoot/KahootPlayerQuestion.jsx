import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Image as ImageIcon, Clock3 } from 'lucide-react';
import { KAHOOT_BACKGROUND } from '@/components/kahoot/kahootTheme';

const COLORS = ['#e21b3c', '#1368ce', '#26890c', '#ffa602'];
const SHAPES = ['▲', '●', '■', '♦'];

export default function KahootPlayerQuestion({ game, playerInfo, hasAnswered, lastAnswerIndex, onAnswer }) {
  const qi = game.current_question_index || 0;
  const question = game.questions?.[qi];
  const [timeLeft, setTimeLeft] = useState(question?.time_limit_seconds || 20);
  const [shortAnswer, setShortAnswer] = useState('');
  const showResults = game.status === 'results';
  const isShortAnswer = question?.question_type === 'short_answer';

  useEffect(() => {
    if (showResults) return;
    const start = new Date(game.question_started_at).getTime();
    const limit = (question?.time_limit_seconds || 20) * 1000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, Math.ceil((limit - elapsed) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 200);

    return () => clearInterval(interval);
  }, [game.question_started_at, showResults]);

  useEffect(() => {
    setShortAnswer('');
  }, [qi]);

  if (!question) return null;

  const myAnswer = (game.participants || [])
    .find(p => p.email === playerInfo.email)
    ?.answers?.find(a => a.question_index === qi);

  const isCorrect = myAnswer?.is_correct;

  // After answering — show waiting screen
  if (hasAnswered && !showResults) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-[#6f4298] text-white">
        <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: `url(${KAHOOT_BACKGROUND})` }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[#14d9e6]/70 via-[#2ec5ff]/45 to-[#ffb347]/60" />
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <div className="rounded-[32px] bg-white/18 p-10 shadow-2xl backdrop-blur-md">
            {lastAnswerIndex != null && (
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full text-5xl shadow-2xl" style={{ backgroundColor: COLORS[lastAnswerIndex] }}>
                {SHAPES[lastAnswerIndex]}
              </div>
            )}
            <h2 className="text-4xl font-black text-white">Answer submitted!</h2>
            <p className="mt-3 text-lg font-semibold text-white/85 animate-pulse">Waiting for others...</p>
            <div className="mt-6 inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 shadow-xl">
              <Clock3 className="h-5 w-5 text-[#6f4298]" />
              <span className="text-3xl font-black text-[#6f4298]">{timeLeft}s</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show results
  if (showResults) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-[#6f4298] text-white">
        <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: `url(${KAHOOT_BACKGROUND})` }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[#14d9e6]/70 via-[#2ec5ff]/45 to-[#ffb347]/60" />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">
          <div className="w-full max-w-2xl rounded-[36px] bg-white/18 p-8 text-center shadow-2xl backdrop-blur-md md:p-10">
            {myAnswer ? (
              <>
                <div className={`mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full shadow-2xl ${isCorrect ? 'bg-green-400' : 'bg-red-400'}`}>
                  {isCorrect ? <CheckCircle className="h-16 w-16 text-white" /> : <XCircle className="h-16 w-16 text-white" />}
                </div>
                <h2 className="text-4xl font-black text-white">{isCorrect ? 'Correct!' : 'Not quite!'}</h2>
                {question.question_type === 'short_answer' && myAnswer?.text_answer && (
                  <p className="mt-3 text-lg font-semibold text-white/85">Your answer: {myAnswer.text_answer}</p>
                )}
                {isCorrect && <p className="mt-4 text-2xl font-black text-yellow-200">+{myAnswer.points_earned} points</p>}
                <p className="mt-6 text-lg font-semibold text-white/80 animate-pulse">Waiting for host...</p>
              </>
            ) : (
              <>
                <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-red-400 shadow-2xl">
                  <XCircle className="h-16 w-16 text-white" />
                </div>
                <h2 className="text-4xl font-black text-white">Time’s up!</h2>
                <p className="mt-6 text-lg font-semibold text-white/80 animate-pulse">Waiting for host...</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Active question — show answer buttons
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#6f4298] text-white">
      <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${KAHOOT_BACKGROUND})` }} />
      <div className="absolute inset-0 bg-gradient-to-br from-[#14d9e6]/70 via-[#2ec5ff]/45 to-[#ffb347]/60" />

      <div className="relative z-10 flex min-h-screen flex-col px-3 py-3 md:px-6 md:py-5">
        <div className="mb-3 flex items-center justify-center">
          <div className="inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 shadow-2xl">
            <Clock3 className="h-5 w-5 text-[#6f4298]" />
            <span className="text-3xl font-black text-[#6f4298]">{timeLeft}</span>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-4">
          <div className="rounded-[34px] bg-white/14 p-4 shadow-2xl backdrop-blur-md md:p-6">
            <div className="rounded-[30px] bg-white/18 p-4 text-center backdrop-blur-sm md:p-6">
              {question.image_url && (
                <div className="mb-4 flex justify-center">
                  <img src={question.image_url} alt="Question visual" className="max-h-[42vh] w-full max-w-2xl rounded-[28px] object-cover shadow-2xl" />
                </div>
              )}
              {question.question_type === 'image_based' && (
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-white">
                  <ImageIcon className="h-4 w-4" /> Image question
                </div>
              )}
              <div className="inline-block rounded-2xl bg-[#fff6cf] px-5 py-3 shadow-lg">
                <p className="text-xl font-black text-[#3b2b1a] md:text-3xl">{question.question}</p>
              </div>
            </div>
          </div>

          {isShortAnswer ? (
            <div className="mx-auto w-full max-w-2xl rounded-[32px] bg-white p-6 shadow-2xl md:p-8">
              <input
                className="mb-4 w-full rounded-2xl border-2 border-gray-200 px-5 py-4 text-xl font-bold text-center text-gray-900 focus:border-[#6f4298] focus:outline-none"
                placeholder="Type your answer"
                value={shortAnswer}
                onChange={(e) => setShortAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && shortAnswer.trim() && onAnswer(shortAnswer)}
                disabled={hasAnswered}
              />
              <button
                onClick={() => onAnswer(shortAnswer)}
                disabled={hasAnswered || !shortAnswer.trim()}
                className="w-full rounded-2xl bg-[#6f4298] py-4 text-lg font-black text-white shadow-xl hover:bg-[#5c347f] disabled:opacity-40"
              >
                Submit Answer
              </button>
            </div>
          ) : (
            <div className={`grid gap-3 pb-2 ${question.options?.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
              {question.options.map((opt, oi) => (
                <button
                  key={oi}
                  onClick={() => onAnswer(oi)}
                  disabled={hasAnswered}
                  className="flex min-h-[120px] items-center justify-center rounded-[24px] px-4 py-5 text-center text-white shadow-2xl transition-transform active:scale-95 disabled:opacity-40 md:min-h-[140px]"
                  style={{ backgroundColor: COLORS[oi] }}
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-3xl font-black md:text-4xl">{SHAPES[oi]}</span>
                    <span className="text-lg font-black leading-tight md:text-2xl">{opt}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}