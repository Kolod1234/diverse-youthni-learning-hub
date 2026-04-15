import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import KahootJoin from '@/components/kahoot/KahootJoin';
import KahootPlayerLobby from '@/components/kahoot/KahootPlayerLobby';
import KahootPlayerQuestion from '@/components/kahoot/KahootPlayerQuestion';
import KahootFinished from '@/components/kahoot/KahootFinished';

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
    setHasAnswered(true);

    const q = game.questions[game.current_question_index];
    const isShortAnswer = q.question_type === 'short_answer';
    const selectedIndex = isShortAnswer ? null : answerValue;
    const textAnswer = isShortAnswer ? String(answerValue || '').trim() : '';
    setLastAnswerIndex(selectedIndex);
    const isCorrect = isShortAnswer
      ? textAnswer.toLowerCase() === String(q.correct_text_answer || '').trim().toLowerCase()
      : selectedIndex === q.correct_answer;
    const startedAt = new Date(game.question_started_at).getTime();
    const timeTakenMs = Date.now() - startedAt;
    const timeLimit = (q.time_limit_seconds || 20) * 1000;
    const points = isCorrect ? Math.round(1000 * (1 - timeTakenMs / timeLimit) + 200) : 0;

    const updatedParticipants = (game.participants || []).map((p) => {
      if (p.email === playerInfo.email) {
        return {
          ...p,
          score: (p.score || 0) + points,
          answers: [
            ...(p.answers || []),
            {
              question_index: game.current_question_index,
              selected_answer: selectedIndex,
              text_answer: textAnswer,
              is_correct: isCorrect,
              time_taken_ms: timeTakenMs,
              points_earned: points,
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
      <div className="min-h-screen bg-purple-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
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
      <div className="min-h-screen bg-purple-900 flex flex-col items-center justify-center text-white p-8">
        <h2 className="text-3xl font-bold mb-2">Leaderboard</h2>
        <p className="text-purple-200 mb-8">Your rank: #{myRank} • Score: {me?.score || 0}</p>
        <div className="w-full max-w-md space-y-2">
          {sorted.slice(0, 5).map((p, i) => (
            <div key={p.email} className={`flex items-center justify-between rounded-xl px-4 py-3 font-semibold ${p.email === playerInfo.email ? 'bg-yellow-400 text-yellow-900' : 'bg-white/20'}`}>
              <span>#{i + 1} {p.name}</span>
              <span>{p.score || 0} pts</span>
            </div>
          ))}
        </div>
        <p className="mt-8 text-purple-300 animate-pulse">Waiting for host...</p>
      </div>
    );
  }

  if (game.status === 'finished') {
    return <KahootFinished game={game} playerInfo={playerInfo} onClose={() => window.location.href = '/'} />;
  }

  return null;
}