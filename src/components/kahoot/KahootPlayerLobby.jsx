import React from 'react';
import { Zap, Users, PlayCircle } from 'lucide-react';
import { KAHOOT_BACKGROUND } from '@/components/kahoot/kahootTheme';

export default function KahootPlayerLobby({ game, playerInfo }) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#6f4298] p-8 text-white">
      <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: `url(${KAHOOT_BACKGROUND})` }} />
      <div className="absolute inset-0 bg-gradient-to-br from-[#14d9e6]/70 via-[#2ec5ff]/45 to-[#ffb347]/60" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-yellow-400 shadow-2xl">
          <Zap className="h-12 w-12 text-yellow-900" />
        </div>
        <p className="mb-2 text-sm font-black uppercase tracking-[0.35em] text-white/75">Lobby</p>
        <h1 className="text-4xl font-black md:text-6xl">{game.title}</h1>
        <p className="mt-3 text-lg font-semibold text-white/85">Get ready for the next question!</p>

        <div className="mt-8 w-full max-w-xl rounded-[36px] bg-white/18 p-8 shadow-2xl backdrop-blur-md">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-white/70">You joined as</p>
          <p className="mt-3 text-4xl font-black md:text-5xl">{playerInfo.name}</p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-white/12 p-5">
              <Users className="mx-auto mb-2 h-7 w-7 text-white/85" />
              <p className="text-sm font-semibold text-white/70">Players in lobby</p>
              <p className="mt-1 text-3xl font-black">{(game.participants || []).length}</p>
            </div>
            <div className="rounded-3xl bg-white/12 p-5">
              <PlayCircle className="mx-auto mb-2 h-7 w-7 text-white/85" />
              <p className="text-sm font-semibold text-white/70">Status</p>
              <p className="mt-1 text-2xl font-black">Waiting</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-lg font-semibold text-white/85 animate-pulse">
          Waiting for host to start...
        </div>
      </div>
    </div>
  );
}