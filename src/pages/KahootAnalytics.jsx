import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import KahootAnalyticsSummary from '@/components/kahoot/KahootAnalyticsSummary';

export default function KahootAnalytics() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get('gameId');

  const { data: game, isLoading } = useQuery({
    queryKey: ['kahoot-analytics', gameId],
    queryFn: () => base44.entities.KahootGame.get(gameId),
    enabled: !!gameId,
  });

  if (!gameId) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-5xl rounded-3xl bg-card p-8 shadow-sm">
          <p className="text-lg font-bold text-foreground">No game selected.</p>
        </div>
      </div>
    );
  }

  if (isLoading || !game) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl bg-card p-6 shadow-sm border border-slate-200 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-primary">
              <BarChart3 className="h-4 w-4" /> Game analytics
            </div>
            <h1 className="text-3xl font-black text-foreground">{game.title}</h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground">Tutor insights for participation, speed, and learning gaps.</p>
          </div>
          <button
            onClick={() => navigate('/kahoot-host')}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" /> Back to host
          </button>
        </div>

        <KahootAnalyticsSummary game={game} />
      </div>
    </div>
  );
}