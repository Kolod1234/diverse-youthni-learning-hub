import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Image as ImageIcon, Type } from 'lucide-react';

const COLORS = ['#e21b3c', '#1368ce', '#26890c', '#ffa602'];
const SHAPES = ['▲', '●', '■', '♦'];

export default function KahootHostQuestion({ game, showResults, onShowResults, onNext }) {
  const qi = game.current_question_index || 0;
  const question = game.questions?.[qi];
  const [timeLeft, setTimeLeft] = useState(question?.time_limit_seconds || 20);

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

  const isShortAnswer = question.question_type === 'short_answer';
  const answerCounts = [0, 0, 0, 0];
  const shortAnswers = [];
  (game.participants || []).forEach(p => {
    const ans = (p.answers || []).find(a => a.question_index === qi);
    if (ans && ans.selected_answer != null) {
      answerCounts[ans.selected_answer] = (answerCounts[ans.selected_answer] || 0) + 1;
    }
    if (ans && ans.text_answer) {
      shortAnswers.push({ name: p.name, text_answer: ans.text_answer, is_correct: ans.is_correct });
    }
  });
  const totalAnswered = isShortAnswer ? shortAnswers.length : answerCounts.reduce((a, b) => a + b, 0);
  const totalPlayers = (game.participants || []).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <span className="text-white/70 font-semibold">Question {qi + 1} / {game.questions?.length}</span>
        {!showResults && (
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
            <span className="text-2xl font-black text-purple-900">{timeLeft}</span>
          </div>
        )}
        <span className="text-white/70 font-semibold">{totalAnswered}/{totalPlayers} answered</span>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {question.image_url && (
          <img src={question.image_url} alt="" className="max-h-40 rounded-2xl mb-4 object-contain" />
        )}
        <div className="bg-white rounded-3xl px-8 py-6 max-w-2xl w-full text-center shadow-2xl mb-8">
          <div className="mb-3 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wide text-purple-700">
            {question.question_type === 'image_based' && <><ImageIcon className="w-4 h-4" /> Image-based</>}
            {question.question_type === 'short_answer' && <><Type className="w-4 h-4" /> Short answer</>}
            {question.question_type === 'multiple_choice' && 'Multiple choice'}
          </div>
          <p className="text-2xl font-black text-gray-900">{question.question}</p>
        </div>

        {isShortAnswer ? (
          <div className="w-full max-w-2xl rounded-3xl bg-white/10 p-5 text-white">
            <div className="mb-4 text-center">
              <p className="text-sm text-white/70">Correct answer</p>
              <p className="text-2xl font-black">{question.correct_text_answer || '—'}</p>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {shortAnswers.length > 0 ? shortAnswers.map((entry, index) => (
                <div key={`${entry.name}-${index}`} className={`rounded-2xl px-4 py-3 flex items-center justify-between ${entry.is_correct ? 'bg-green-500/30' : 'bg-white/10'}`}>
                  <span className="font-bold">{entry.name}</span>
                  <span className="text-right">{entry.text_answer}</span>
                </div>
              )) : (
                <div className="rounded-2xl bg-white/10 px-4 py-6 text-center text-white/70">No answers yet</div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 w-full max-w-2xl">
            {question.options.map((opt, oi) => (
              <div
                key={oi}
                className="rounded-2xl p-4 text-white font-bold flex flex-col gap-2"
                style={{ backgroundColor: COLORS[oi] }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{SHAPES[oi]}</span>
                  <span className="flex-1">{opt}</span>
                  {showResults && oi === question.correct_answer && (
                    <CheckCircle className="w-5 h-5 text-white" />
                  )}
                  {showResults && oi !== question.correct_answer && (
                    <XCircle className="w-5 h-5 text-white/60" />
                  )}
                </div>
                <div className="bg-black/20 rounded-full h-2 w-full">
                  <div
                    className="bg-white rounded-full h-2 transition-all duration-700"
                    style={{ width: totalPlayers > 0 ? `${(answerCounts[oi] / totalPlayers) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-sm text-white/80">{answerCounts[oi]} answers</span>
              </div>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="mt-6 flex gap-4">
          {!showResults ? (
            <button
              onClick={onShowResults}
              className="bg-white text-purple-900 rounded-2xl px-8 py-3 font-black hover:bg-gray-100 shadow-xl"
            >
              Skip Timer & Show Results
            </button>
          ) : (
            <button
              onClick={onNext}
              className="bg-yellow-400 text-yellow-900 rounded-2xl px-10 py-4 text-lg font-black hover:bg-yellow-300 shadow-xl"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}