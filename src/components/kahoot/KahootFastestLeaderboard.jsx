import React, { useMemo } from 'react';
import { Zap, Timer } from 'lucide-react';

function formatTime(ms) {
  if (typeof ms !== 'number') return '—';
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export default function KahootFastestLeaderboard({ game }) {
  const qi = game.current_question_index || 0;

  const fastestPlayers = useMemo(() => {
    return [...(game.participants || [])]
      .map((player) => {
        const answer = (player.answers || []).find((entry) => entry.question_index === qi);
        return {
          name: player.username || 'Learner',
          score: player.score || 0,
          is_correct: answer?.is_correct,
          time_taken_ms: answer?.time_taken_ms,
          points_earned: answer?.points_earned || 0,
        };
      })
      .filter((player) => player.is_correct && typeof player.time_taken_ms === 'number')
      .sort((a, b) => {
        if (a.time_taken_ms !== b.time_taken_ms) return a.time_taken_ms - b.time_taken_ms;
        return (b.points_earned || 0) - (a.points_earned || 0);
      })
      .slice(0, 5);
  }, [game.participants, qi]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1147] via-[#35146b] to-[#5a189a] flex flex-col items-center justify-between p-8 text-white">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 text-[#35146b] shadow-2xl">
          <Zap className="h-8 w-8" />
        </div>
        <h2 className="text-4xl font-black">Fastest Answers</h2>
        <p className="mt-2 text-lg text-purple-200">Top 5 quickest correct responses for question {(game.current_question_index || 0) + 1}</p>
      </div>

      <div className="w-full max-w-3xl space-y-3">
        {fastestPlayers.length > 0 ? fastestPlayers.map((player, index) => (
          <div
            key={`${player.name}-${index}`}
            className="flex items-center gap-4 rounded-[24px] bg-white/12 px-5 py-4 shadow-xl backdrop-blur-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-lg font-black text-[#35146b]">
              #{index + 1}
            </div>
            <div className="flex-1">
              <p className="text-xl font-black">{player.name}</p>
              <p className="text-sm text-purple-200">+{player.points_earned} points</p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2">
              <Timer className="h-4 w-4 text-yellow-300" />
              <span className="font-black text-lg">{formatTime(player.time_taken_ms)}</span>
            </div>
          </div>
        )) : (
          <div className="rounded-[24px] bg-white/10 px-6 py-10 text-center text-purple-100 shadow-xl backdrop-blur-sm">
            No correct answers were submitted for this question.
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-bold text-purple-100 backdrop-blur-sm">
        Moving to the next stage automatically...
      </div>
    </div>
  );
}