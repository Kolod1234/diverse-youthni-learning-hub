import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import KahootSetup from '@/components/kahoot/KahootSetup';
import KahootLobby from '@/components/kahoot/KahootLobby';
import KahootHostQuestion from '@/components/kahoot/KahootHostQuestion';
import KahootHostLeaderboard from '@/components/kahoot/KahootHostLeaderboard';
import KahootFinished from '@/components/kahoot/KahootFinished';

export default function KahootHost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [gameId, setGameId] = useState(null);
  const timerRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['auth-me'],
    queryFn: () => base44.auth.me(),
    staleTime: 30000,
  });

  const { data: game } = useQuery({
    queryKey: ['kahoot-game', gameId],
    queryFn: () => base44.entities.KahootGame.get(gameId),
    enabled: !!gameId,
    refetchInterval: 1000,
  });

  // Subscribe to real-time updates
  useEffect(() => {
    if (!gameId) return;
    const unsub = base44.entities.KahootGame.subscribe((event) => {
      if (event.id === gameId) {
        queryClient.invalidateQueries(['kahoot-game', gameId]);
      }
    });
    return unsub;
  }, [gameId, queryClient]);

  const updateGame = useMutation({
    mutationFn: (data) => base44.entities.KahootGame.update(gameId, data),
    onSuccess: () => queryClient.invalidateQueries(['kahoot-game', gameId]),
  });

  const handleGameCreated = (id) => {
    setGameId(id);
  };

  const handleStartQuestion = (index) => {
    clearTimeout(timerRef.current);
    const q = game.questions[index];
    const timeLimit = q.time_limit_seconds || 20;

    updateGame.mutate({
      status: 'question',
      current_question_index: index,
      question_started_at: new Date().toISOString(),
    });

    timerRef.current = setTimeout(() => {
      updateGame.mutate({ status: 'results' });
    }, timeLimit * 1000);
  };

  const handleShowLeaderboard = () => {
    updateGame.mutate({ status: 'leaderboard' });
  };

  const handleNextQuestion = () => {
    const nextIndex = (game.current_question_index || 0) + 1;
    if (nextIndex >= game.questions.length) {
      updateGame.mutate({ status: 'finished' });
    } else {
      handleStartQuestion(nextIndex);
    }
  };

  const handleFinish = () => {
    updateGame.mutate({ status: 'finished' });
  };

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  if (!gameId) {
    return <KahootSetup user={user} onGameCreated={handleGameCreated} />;
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-purple-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (game.status === 'lobby') {
    return <KahootLobby game={game} isHost onStart={() => handleStartQuestion(0)} />;
  }

  if (game.status === 'question') {
    return (
      <KahootHostQuestion
        game={game}
        onShowResults={() => {
          clearTimeout(timerRef.current);
          updateGame.mutate({ status: 'results' });
        }}
      />
    );
  }

  if (game.status === 'results') {
    return (
      <KahootHostQuestion
        game={game}
        showResults
        onNext={handleShowLeaderboard}
      />
    );
  }

  if (game.status === 'leaderboard') {
    const isLast = (game.current_question_index || 0) >= game.questions.length - 1;
    return (
      <KahootHostLeaderboard
        game={game}
        onNext={isLast ? handleFinish : handleNextQuestion}
        isLast={isLast}
      />
    );
  }

  if (game.status === 'finished') {
    return <KahootFinished game={game} isHost onClose={() => navigate('/')} />;
  }

  return null;
}