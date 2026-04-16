import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Trophy, Sparkles } from 'lucide-react';
import KahootJoin from '@/components/kahoot/KahootJoin';
import KahootPlayerLobby from '@/components/kahoot/KahootPlayerLobby';
import KahootPlayerQuestion from '@/components/kahoot/KahootPlayerQuestion';
import KahootFinished from '@/components/kahoot/KahootFinished';
import { KAHOOT_BACKGROUND } from '@/components/kahoot/kahootTheme';

export default function KahootPlay() {
  const queryClient = useQueryClient();
  const [gameId, setGameId] = useState(null);
  const [playerInfo, setPlayerInfo] = useState(null); // { name, email }
  const [hasAnswered, setHasAnswered] = useState(false);
  const [lastAnswerIndex, setLastAnswerIndex] = useState(null);

  const { data: game } = useQuery({
    queryKey: ['kahoot-game-play', gameId],
    queryFn: () => base44.entities.KahootGame.get(gameId),
    enabled: !!gameId,
    refetchInterval: 1000,
  });

  // Reset answered state when question changes
  useEffect(() => {
    if (game?.status === 'question') {
      setHasAnswered(false);
      setLastAnswerIndex(null);
    }
  }, [game?.current_question_index, game?.status]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!gameId) return;
    const unsub = base44.entities.KahootGame.subscribe((event) => {
      if (event.id === gameId) {
        queryClient.invalidateQueries(['kahoot-game-play', gameId]);
      }
    });
    return unsub;
  }, [gameId, queryClient]);

  const handleJoined = (id, info) => {
    setGameId(id);
    setPlayerInfo(info);
  };

  const handleAnswer = async (answerValue) => {
    if (hasAnswered || !game || !playerInfo) return;
    if (answerValue === '__skip__') {
      setHasAnswered(true);
      setLastAnswerIndex(null);
      queryClient.invalidateQueries(['kahoot-game-play', gameId]);
      return;
    }

    setHasAnswered(true);

    const q = game.questions[game.current_question_index];
    const participant = (game.participants || []).find((p) => p.email === playerInfo.email);
    const isShortAnswer = q.question_type === 'short_answer';
    const selectedIndex = isShortAnswer ? null : answerValue;
    const textAnswer = isShortAnswer ? String(answerValue || '').trim() : '';
    const activePowerUp = participant?.active_power_up || '';
    setLastAnswerIndex(selectedIndex);
    const rawCorrect = isShortAnswer
      ? textAnswer.toLowerCase() === String(q.correct_text_answer || '').trim().toLowerCase()
      : selectedIndex === q.correct_answer;
    const isCorrect = activePowerUp === 'shield' ? true : rawCorrect;
    const startedAt = new Date(game.question_started_at).getTime();
    const timeTakenMs = Date.now() - startedAt;
    const timeLimit = (q.time_limit_seconds || 20) * 1000;
    const basePoints = isCorrect ? Math.round(1000 * (1 - timeTakenMs / timeLimit) + 200) : 0;
    const points = activePowerUp === 'double_points' ? basePoints * 2 : basePoints;

    const updatedParticipants = (game.participants || []).map((p) => {
      if (p.email === playerInfo.email) {
        const nextPowerUps = {
          double_points: p.power_ups?.double_points || 0,
          shield: p.power_ups?.shield || 0,
          skip_question: p.power_ups?.skip_question || 0,
          fifty_fifty: p.power_ups?.fifty_fifty || 0,
        };
        return {
          ...p,
          score: (p.score || 0) + points,
          active_power_up: '',
          power_ups: {
            ...nextPowerUps,
            double_points: nextPowerUps.double_points + (isCorrect && (game.current_question_index + 1) % 3 === 0 ? 1 : 0),
            shield: nextPowerUps.shield + (isCorrect && (game.current_question_index + 1) % 4 === 0 ? 1 : 0),
            skip_question: nextPowerUps.skip_question + (isCorrect && (game.current_question_index + 1) % 5 === 0 ? 1 : 0),
            fifty_fifty: nextPowerUps.fifty_fifty + (isCorrect && (game.current_question_index + 1) % 2 === 0 ? 1 : 0),
          },
          answers: [
            ...(p.answers || []),
            {
              question_index: game.current_question_index,
              selected_answer: selectedIndex,
              text_answer: textAnswer,
              is_correct: isCorrect,
              time_taken_ms: timeTakenMs,
              points_earned: points,
              used_power_up: activePowerUp,
            },
          ],
        };
      }
      return p;
    });

    await base44.entities.KahootGame.update(game.id, { participants: updatedParticipants });
    queryClient.invalidateQueries(['kahoot-game-play', gameId]);
  };

  if (!gameId || !playerInfo) {
    return <KahootJoin onJoined={handleJoined} />;
  }

  if (!game) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-[#6f4298]">
        <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: `url(${KAHOOT_BACKGROUND})` }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[#14d9e6]/70 via-[#2ec5ff]/45 to-[#ffb347]/60" />
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center text-white">
          <div className="mb-5 h-14 w-14 rounded-full border-4 border-white border-t-transparent animate-spin" />
          <p className="text-lg font-black uppercase tracking-[0.25em] text-white/80">Loading game</p>
        </div>
      </div>
    );
  }

  if (game.status === 'lobby') {
    return <KahootPlayerLobby game={game} playerInfo={playerInfo} />;
  }

  if (game.status === 'question' || game.status === 'results') {
    return (
      <KahootPlayerQuestion
        game={game}
        playerInfo={playerInfo}
        hasAnswered={hasAnswered}
        lastAnswerIndex={lastAnswerIndex}
        onAnswer={handleAnswer}
      />
    );
  }

  if (game.status === 'leaderboard') {
    const me = (game.participants || []).find(p => p.email === playerInfo.email);
    const sorted = [...(game.participants || [])].sort((a, b) => (b.score || 0) - (a.score || 0));
    const myRank = sorted.findIndex(p => p.email === playerInfo.email) + 1;
    return (
      <div className="min-h-screen relative overflow-hidden bg-[#6f4298] p-6 text-white">
        <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: `url(${KAHOOT_BACKGROUND})` }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[#14d9e6]/70 via-[#2ec5ff]/45 to-[#ffb347]/60" />
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center">
          <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-yellow-400 shadow-2xl">
            <Trophy className="h-12 w-12 text-yellow-900" />
          </div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-white/75">Leaderboard</p>
          <h2 className="mt-2 text-4xl font-black md:text-5xl">You’re #{myRank}</h2>
          <p className="mt-3 rounded-full bg-white/18 px-5 py-2 text-lg font-bold shadow-xl backdrop-blur-sm">Score: {me?.score || 0} pts</p>

          <div className="mt-8 w-full max-w-xl space-y-3 rounded-[36px] bg-white/14 p-5 shadow-2xl backdrop-blur-md md:p-6">
            {sorted.slice(0, 5).map((p, i) => (
              <div key={p.email} className={`flex items-center justify-between rounded-3xl px-5 py-4 font-bold shadow-lg ${p.email === playerInfo.email ? 'bg-yellow-400 text-yellow-900' : 'bg-white/14 text-white'}`}>
                <span>#{i + 1} {p.name}</span>
                <span>{p.score || 0} pts</span>
              </div>
            ))}
          </div>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/14 px-5 py-3 text-white/85 shadow-xl backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            <span className="font-semibold animate-pulse">Waiting for host...</span>
          </div>
        </div>
      </div>
    );
  }

  if (game.status === 'finished') {
    return <KahootFinished game={game} playerInfo={playerInfo} onClose={() => window.location.href = '/'} />;
  }

  return null;
}