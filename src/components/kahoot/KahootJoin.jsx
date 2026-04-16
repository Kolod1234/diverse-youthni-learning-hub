import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Zap, Hash, User2 } from 'lucide-react';
import { KAHOOT_BACKGROUND } from '@/components/kahoot/kahootTheme';

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
    <div className="min-h-screen relative overflow-hidden bg-[#6f4298] p-6">
      <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: `url(${KAHOOT_BACKGROUND})` }} />
      <div className="absolute inset-0 bg-gradient-to-br from-[#14d9e6]/70 via-[#2ec5ff]/45 to-[#ffb347]/60" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-yellow-400 shadow-2xl">
            <Zap className="h-9 w-9 text-yellow-900" />
          </div>
          <div className="text-white">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-white/75">Join game</p>
            <span className="text-4xl font-black">STRANDS OF IDEAS</span>
          </div>
        </div>

        <div className="w-full max-w-md rounded-[36px] bg-white/95 p-8 shadow-2xl backdrop-blur-md md:p-10">
          {step === 'pin' ? (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ede9fe] text-[#6f4298]">
                  <Hash className="h-7 w-7" />
                </div>
                <h2 className="text-3xl font-black text-gray-900">Enter Strands of Ideas PIN</h2>
                <p className="mt-2 text-sm font-medium text-gray-500">Ask your host for the 6-digit PIN</p>
              </div>
              <input
                className="mb-3 w-full rounded-3xl border-2 border-gray-200 px-5 py-5 text-center text-4xl font-black tracking-[0.35em] text-gray-900 focus:border-[#6f4298] focus:outline-none"
                placeholder="000000"
                maxLength={6}
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => e.key === 'Enter' && pin.length === 6 && handleFindGame()}
              />
              {error && <p className="mb-3 text-center text-sm font-semibold text-red-500">{error}</p>}
              <button
                onClick={handleFindGame}
                disabled={pin.length !== 6 || joining}
                className="w-full rounded-3xl bg-[#6f4298] py-4 text-lg font-black text-white shadow-xl hover:bg-[#5c347f] disabled:opacity-40"
              >
                {joining ? 'Searching...' : 'Find Session'}
              </button>
            </>
          ) : (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#dbeafe] text-[#1368ce]">
                  <User2 className="h-7 w-7" />
                </div>
                <h2 className="text-3xl font-black text-gray-900">What’s your name?</h2>
                <p className="mt-2 text-sm font-medium text-gray-500">You’ll appear on the live leaderboard</p>
              </div>
              <input
                className="mb-4 w-full rounded-3xl border-2 border-gray-200 px-5 py-4 text-center text-2xl font-black text-gray-900 focus:border-[#6f4298] focus:outline-none"
                placeholder="Your name"
                value={name}
                autoFocus
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && name.trim() && handleJoin()}
              />
              <button
                onClick={handleJoin}
                disabled={!name.trim() || joining}
                className="w-full rounded-3xl bg-[#1368ce] py-4 text-lg font-black text-white shadow-xl hover:bg-[#0f56ab] disabled:opacity-40"
              >
                {joining ? 'Joining...' : 'Join Session'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}