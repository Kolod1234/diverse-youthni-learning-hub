import React from 'react';
import { Zap } from 'lucide-react';

export default function KahootPlayerLobby({ game, playerInfo }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex flex-col items-center justify-center p-8 text-white">
      <Zap className="w-16 h-16 text-yellow-400 mb-4" />
      <h1 className="text-3xl font-black mb-2">{game.title}</h1>
      <p className="text-purple-300 mb-8">Get ready!</p>

      <div className="bg-white/20 rounded-3xl px-10 py-6 text-center mb-8">
        <p className="text-purple-200 text-sm font-bold mb-1">You joined as</p>
        <p className="text-4xl font-black">{playerInfo.name}</p>
      </div>

      <div className="animate-pulse text-purple-300 text-lg font-semibold">
        Waiting for host to start...
      </div>

      <div className="mt-8 text-purple-400 text-sm">
        {(game.participants || []).length} player{(game.participants || []).length !== 1 ? 's' : ''} in lobby
      </div>
    </div>
  );
}