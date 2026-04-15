import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const COLORS = ['#e21b3c', '#1368ce', '#26890c', '#ffa602'];
const SHAPES = ['▲', '●', '■', '♦'];

export default function KahootPlayerQuestion({ game, playerInfo, hasAnswered, lastAnswerIndex, onAnswer }) {
  const qi = game.current_question_index || 0;
  const question = game.questions?.[qi];
  const [timeLeft, setTimeLeft] = useState(question?.time_limit_seconds || 20);
  const showResults = game.status === 'results';

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

  if (!question) return null;

  const myAnswer = (game.participants || [])
    .find(p => p.email === playerInfo.email)
    ?.answers?.find(a => a.question_index === qi);

  const isCorrect = myAnswer?.is_correct;

  // After answering — show waiting screen
  if (hasAnswered && !showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex flex-col items-center justify-center text-white p-8">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-5xl mb-6"
          style={{ backgroundColor: COLORS[lastAnswerIndex] }}>
          {SHAPES[lastAnswerIndex]}
        </div>
        <h2 className="text-2xl font-black mb-2">Answer submitted!</h2>
        <p className="text-purple-300 animate-pulse">Waiting for others...</p>
        <div className="mt-6 text-5xl font-black text-white">{timeLeft}s</div>
      </div>
    );
  }

  // Show results
  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex flex-col items-center justify-center text-white p-8">
        {myAnswer ? (
          <>
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${isCorrect ? 'bg-green-400' : 'bg-red-400'}`}>
              {isCorrect ? <CheckCircle className="w-14 h-14 text-white" /> : <XCircle className="w-14 h-14 text-white" />}
            </div>
            <h2 className="text-3xl font-black mb-2">{isCorrect ? 'Correct! 🎉' : 'Wrong!'}</h2>
            {isCorrect && <p className="text-yellow-300 text-xl font-bold">+{myAnswer.points_earned} points</p>}
            <p className="text-purple-300 mt-4 animate-pulse">Waiting for host...</p>
          </>
        ) : (
          <>
            <XCircle className="w-20 h-20 text-red-400 mb-4" />
            <h2 className="text-2xl font-black mb-2">Time's up!</h2>
            <p className="text-purple-300 animate-pulse">Waiting for host...</p>
          </>
        )}
      </div>
    );
  }

  // Active question — show answer buttons
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex flex-col">
      {/* Timer */}
      <div className="flex justify-center py-4">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-xl">
          <span className="text-2xl font-black text-purple-900">{timeLeft}</span>
        </div>
      </div>

      {/* Question display */}
      <div className="px-4 mb-4">
        <div className="bg-white/10 rounded-2xl px-6 py-4 text-center">
          <p className="text-white text-lg font-bold">{question.question}</p>
        </div>
      </div>

      {/* Answer buttons — big colorful Kahoot-style */}
      <div className="flex-1 grid grid-cols-2 gap-3 px-4 pb-6">
        {question.options.map((opt, oi) => (
          <button
            key={oi}
            onClick={() => onAnswer(oi)}
            disabled={hasAnswered}
            className="rounded-2xl text-white font-black text-xl flex flex-col items-center justify-center gap-2 p-4 active:scale-95 transition-transform disabled:opacity-40"
            style={{ backgroundColor: COLORS[oi], minHeight: '120px' }}
          >
            <span className="text-3xl">{SHAPES[oi]}</span>
            <span className="text-sm font-bold text-center leading-tight">{opt}</span>
          </button>
        ))}
      </div>
    </div>
  );
}