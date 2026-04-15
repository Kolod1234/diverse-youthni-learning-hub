import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Image as ImageIcon, Type, Clock3, Users } from 'lucide-react';
import { KAHOOT_BACKGROUND, KAHOOT_COLORS, KAHOOT_SHAPES } from '@/components/kahoot/kahootTheme';
import KahootLiveMetrics from '@/components/kahoot/KahootLiveMetrics';

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
    <div className="min-h-screen relative overflow-hidden bg-[#6f4298]">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${KAHOOT_BACKGROUND})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#7d4aa8]/90 via-[#7f58b4]/85 to-[#5f2f8b]/95" />

      <div className="relative z-10 min-h-screen px-4 py-4 md:px-8 md:py-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-white">
            <div className="rounded-2xl bg-white/12 px-4 py-2 backdrop-blur-sm">
              <span className="text-sm font-bold">Question {qi + 1} / {game.questions?.length}</span>
            </div>
            {!showResults && (
              <div className="flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-xl">
                <Clock3 className="h-5 w-5 text-[#6f4298]" />
                <span className="text-2xl font-black text-[#6f4298]">{timeLeft}</span>
              </div>
            )}
            <div className="flex items-center gap-2 rounded-2xl bg-white/12 px-4 py-2 backdrop-blur-sm">
              <Users className="h-4 w-4" />
              <span className="text-sm font-bold">{totalAnswered}/{totalPlayers} answered</span>
            </div>
          </div>

          <div className="rounded-[28px] bg-white px-6 py-5 text-center shadow-2xl md:px-10">
            <div className="mb-3 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#6f4298]">
              {question.question_type === 'image_based' && <><ImageIcon className="w-4 h-4" /> Image based</>}
              {question.question_type === 'short_answer' && <><Type className="w-4 h-4" /> Short answer</>}
              {question.question_type === 'multiple_choice' && 'Quiz'}
            </div>
            <p className="text-2xl font-black leading-tight text-gray-900 md:text-4xl">{question.question}</p>
          </div>

          <div className="mt-5 flex flex-col items-center gap-5">
            {question.image_url && (
              <div className="rounded-[28px] bg-white/10 p-3 shadow-2xl backdrop-blur-sm">
                <img src={question.image_url} alt="Question visual" className="max-h-[300px] w-full max-w-md rounded-3xl object-cover md:max-w-lg" />
              </div>
            )}

            {!showResults && !isShortAnswer && (
              <div className="w-full max-w-5xl">
                <KahootLiveMetrics
                  question={question}
                  answerCounts={answerCounts}
                  totalPlayers={totalPlayers}
                  totalAnswered={totalAnswered}
                />
              </div>
            )}

            {isShortAnswer ? (
              <div className="w-full max-w-3xl rounded-[28px] bg-white/12 p-5 text-white shadow-2xl backdrop-blur-sm">
                <div className="mb-4 text-center">
                  <p className="text-sm font-semibold text-white/70">Correct answer</p>
                  <p className="text-2xl font-black">{question.correct_text_answer || '—'}</p>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {shortAnswers.length > 0 ? shortAnswers.map((entry, index) => (
                    <div key={`${entry.name}-${index}`} className={`rounded-2xl px-4 py-3 flex items-center justify-between gap-4 ${entry.is_correct ? 'bg-green-500/35' : 'bg-white/10'}`}>
                      <span className="font-bold">{entry.name}</span>
                      <span className="text-right">{entry.text_answer}</span>
                    </div>
                  )) : (
                    <div className="rounded-2xl bg-white/10 px-4 py-6 text-center text-white/70">No answers yet</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-2">
                {question.options.map((opt, oi) => (
                  <div
                    key={oi}
                    className="rounded-[18px] px-6 py-6 text-white shadow-2xl"
                    style={{ backgroundColor: KAHOOT_COLORS[oi] }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-black">{KAHOOT_SHAPES[oi]}</div>
                      <div className="flex-1 text-left text-xl font-bold leading-snug">{opt}</div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-white/10">
                        {showResults ? (
                          oi === question.correct_answer ? <CheckCircle className="h-8 w-8 text-white" /> : <XCircle className="h-8 w-8 text-white/70" />
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-4 h-2.5 rounded-full bg-black/15">
                      <div
                        className="h-2.5 rounded-full bg-white transition-all duration-700"
                        style={{ width: totalPlayers > 0 ? `${(answerCounts[oi] / totalPlayers) * 100}%` : '0%' }}
                      />
                    </div>
                    <div className="mt-2 text-sm font-semibold text-white/90">{answerCounts[oi]} answers</div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-2 flex gap-4">
              {!showResults ? (
                <button
                  onClick={onShowResults}
                  className="rounded-2xl bg-white px-8 py-3 font-black text-[#6f4298] shadow-xl hover:bg-gray-100"
                >
                  Show Results
                </button>
              ) : (
                <button
                  onClick={onNext}
                  className="rounded-2xl bg-[#2a143f] px-10 py-4 text-lg font-black text-white shadow-xl hover:bg-[#1f0f31]"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}