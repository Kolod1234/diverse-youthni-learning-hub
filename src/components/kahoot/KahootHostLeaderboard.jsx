import React from 'react';
import { Trophy } from 'lucide-react';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function KahootHostLeaderboard({ game, onNext, isLast }) {
  const sorted = [...(game.participants || [])].sort((a, b) => (b.score || 0) - (a.score || 0));
  const top5 = sorted.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex flex-col items-center justify-between p-8">
      <div className="text-center">
        <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
        <h2 className="text-4xl font-black text-white mb-1">Leaderboard</h2>
        <p className="text-purple-300">After question {(game.current_question_index || 0) + 1}</p>
      </div>

      <div className="w-full max-w-lg space-y-3">
        {top5.map((p, i) => (
          <div
            key={p.email}
            className="flex items-center gap-4 rounded-2xl px-5 py-4 shadow-lg"
            style={{ backgroundColor: i === 0 ? '#fbbf24' : i === 1 ? '#d1d5db' : i === 2 ? '#cd7c39' : 'rgba(255,255,255,0.15)' }}
          >
            <span className="text-2xl">{MEDALS[i] || `#${i + 1}`}</span>
            <span className={`flex-1 font-black text-lg ${i < 3 ? 'text-gray-900' : 'text-white'}`}>{p.username || 'Learner'}</span>
            <span className={`font-black text-xl ${i < 3 ? 'text-gray-800' : 'text-white'}`}>{p.score || 0}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        className="w-full max-w-lg bg-yellow-400 text-yellow-900 rounded-2xl py-5 text-2xl font-black hover:bg-yellow-300 shadow-xl"
      >
        {isLast ? '🏁 Finish Game' : 'Next Question →'}
      </button>
    </div>
  );
}