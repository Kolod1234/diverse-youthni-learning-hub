import React from 'react';
import { Users, Zap } from 'lucide-react';

export default function KahootLobby({ game, isHost, onStart }) {
  const participants = game.participants || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex flex-col items-center justify-between p-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className="w-8 h-8 text-yellow-400" />
          <span className="text-white text-2xl font-black">KAHOOT!</span>
        </div>
        <h1 className="text-white text-3xl font-black mb-2">{game.title}</h1>
        <p className="text-purple-300">{game.questions?.length || 0} questions</p>
      </div>

      {/* PIN */}
      <div className="bg-white rounded-3xl px-12 py-8 text-center shadow-2xl">
        <p className="text-gray-500 font-bold text-sm mb-1 uppercase tracking-widest">Game PIN</p>
        <p className="text-6xl font-black text-purple-900 tracking-widest">{game.pin}</p>
        <p className="text-gray-400 text-sm mt-2">Go to the Play page and enter this PIN</p>
      </div>

      {/* Players */}
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-2 text-white mb-4 justify-center">
          <Users className="w-5 h-5" />
          <span className="font-bold">{participants.length} player{participants.length !== 1 ? 's' : ''} joined</span>
        </div>
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {participants.map((p, i) => (
            <div key={i} className="bg-white/20 text-white px-4 py-2 rounded-xl font-semibold text-sm">
              {p.username || 'Learner'}
            </div>
          ))}
        </div>

        {isHost && (
          <button
            onClick={onStart}
            disabled={participants.length === 0}
            className="w-full bg-yellow-400 text-yellow-900 rounded-2xl py-4 text-2xl font-black hover:bg-yellow-300 disabled:opacity-40 shadow-xl"
          >
            Start Game →
          </button>
        )}
      </div>
    </div>
  );
}