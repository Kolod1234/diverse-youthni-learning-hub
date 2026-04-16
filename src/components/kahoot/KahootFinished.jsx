import React from 'react';
import { Trophy, Star } from 'lucide-react';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function KahootFinished({ game, isHost, playerInfo, onClose }) {
  const sorted = [...(game.participants || [])].sort((a, b) => (b.score || 0) - (a.score || 0));
  const myRank = playerInfo ? sorted.findIndex(p => p.email === playerInfo.email) + 1 : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex flex-col items-center justify-between p-8 text-white">
      <div className="text-center">
        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-3" />
        <h1 className="text-4xl font-black mb-1">Strands of Ideas Complete!</h1>
        <p className="text-purple-300 text-lg">{game.title}</p>
        {!isHost && myRank && (
          <div className="mt-4 bg-white/20 rounded-2xl px-6 py-3 inline-block">
            <p className="text-yellow-300 font-black text-2xl">Your rank: #{myRank}</p>
          </div>
        )}
      </div>

      {/* Top 3 podium */}
      <div className="w-full max-w-lg">
        <h3 className="text-xl font-black text-center mb-4 text-purple-200">Final Results</h3>
        <div className="space-y-3">
          {sorted.slice(0, 10).map((p, i) => (
            <div
              key={p.email}
              className={`flex items-center gap-4 rounded-2xl px-5 py-4 ${
                playerInfo && p.email === playerInfo.email
                  ? 'bg-yellow-400 text-yellow-900'
                  : i < 3 ? 'bg-white/30' : 'bg-white/10'
              }`}
            >
              <span className="text-2xl">{MEDALS[i] || `#${i + 1}`}</span>
              <span className="flex-1 font-black text-lg">{p.name}</span>
              <div className="text-right">
                <span className="font-black text-xl">{p.score || 0}</span>
                <span className="text-xs opacity-70 ml-1">pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full max-w-lg bg-white text-purple-900 rounded-2xl py-4 text-xl font-black hover:bg-gray-100 shadow-xl"
      >
        {isHost ? '✓ Close Game' : '🏠 Go Home'}
      </button>
    </div>
  );
}