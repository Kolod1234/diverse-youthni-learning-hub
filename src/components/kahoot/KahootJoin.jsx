import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Zap } from 'lucide-react';

export default function KahootJoin({ onJoined }) {
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState('pin'); // 'pin' | 'name'
  const [game, setGame] = useState(null);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);

  const handleFindGame = async () => {
    setError('');
    setJoining(true);
    const games = await base44.entities.KahootGame.filter({ pin: pin.trim(), status: 'lobby' });
    if (games.length === 0) {
      setError('No active game found with that PIN. Make sure the host has started a lobby.');
      setJoining(false);
      return;
    }
    setGame(games[0]);
    setStep('name');
    setJoining(false);
  };

  const handleJoin = async () => {
    if (!name.trim()) return;
    setJoining(true);

    let userEmail;
    try {
      const me = await base44.auth.me();
      userEmail = me.email;
    } catch {
      userEmail = `guest_${Date.now()}@kahoot.local`;
    }

    // Check not already joined
    const existing = (game.participants || []).find(p => p.email === userEmail);
    if (!existing) {
      const updatedParticipants = [
        ...(game.participants || []),
        { name: name.trim(), email: userEmail, score: 0, answers: [] },
      ];
      await base44.entities.KahootGame.update(game.id, { participants: updatedParticipants });
    }

    onJoined(game.id, { name: name.trim(), email: userEmail });
    setJoining(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex flex-col items-center justify-center p-6">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center">
          <Zap className="w-8 h-8 text-yellow-900" />
        </div>
        <span className="text-white text-4xl font-black">KAHOOT!</span>
      </div>

      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
        {step === 'pin' ? (
          <>
            <h2 className="text-2xl font-black text-gray-900 mb-1 text-center">Enter Game PIN</h2>
            <p className="text-gray-400 text-center text-sm mb-6">Ask your host for the PIN</p>
            <input
              className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 text-3xl font-black text-center tracking-widest focus:outline-none focus:border-purple-500 mb-3"
              placeholder="000000"
              maxLength={6}
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => e.key === 'Enter' && pin.length === 6 && handleFindGame()}
            />
            {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}
            <button
              onClick={handleFindGame}
              disabled={pin.length !== 6 || joining}
              className="w-full bg-purple-600 text-white rounded-2xl py-4 text-lg font-black hover:bg-purple-700 disabled:opacity-40"
            >
              {joining ? 'Searching...' : 'Find Game'}
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-black text-gray-900 mb-1 text-center">What's your name?</h2>
            <p className="text-gray-400 text-center text-sm mb-6">This will show on the leaderboard</p>
            <input
              className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 text-xl font-bold text-center focus:outline-none focus:border-purple-500 mb-4"
              placeholder="Your name"
              value={name}
              autoFocus
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && name.trim() && handleJoin()}
            />
            <button
              onClick={handleJoin}
              disabled={!name.trim() || joining}
              className="w-full bg-purple-600 text-white rounded-2xl py-4 text-lg font-black hover:bg-purple-700 disabled:opacity-40"
            >
              {joining ? 'Joining...' : "Let's Go! 🎉"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}