import React, { useMemo } from 'react';
import { Users, Timer, AlertTriangle, Target } from 'lucide-react';

function formatMs(ms) {
  if (!ms || Number.isNaN(ms)) return '—';
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

function StatCard({ icon: IconComponent, label, value, subtext }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <IconComponent className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="text-2xl font-black text-slate-900">{value}</p>
        </div>
      </div>
      {subtext && <p className="mt-3 text-sm text-slate-500">{subtext}</p>}
    </div>
  );
}

export default function KahootAnalyticsSummary({ game }) {
  const analytics = useMemo(() => {
    const participants = game?.participants || [];
    const questions = game?.questions || [];
    const totalPlayers = participants.length;

    const perQuestion = questions.map((question, index) => {
      const answers = participants
        .map((participant) => (participant.answers || []).find((item) => item.question_index === index))
        .filter(Boolean);

      const participationCount = answers.length;
      const participationPercent = totalPlayers > 0 ? Math.round((participationCount / totalPlayers) * 100) : 0;
      const validTimes = answers
        .map((answer) => answer.time_taken_ms)
        .filter((value) => typeof value === 'number' && value > 0);
      const averageResponseTime = validTimes.length > 0
        ? validTimes.reduce((sum, value) => sum + value, 0) / validTimes.length
        : null;
      const incorrectCount = answers.filter((answer) => !answer.is_correct).length;
      const missedPercent = participationCount > 0 ? Math.round((incorrectCount / participationCount) * 100) : 0;

      return {
        index,
        question: question.question,
        questionType: question.question_type,
        participationCount,
        participationPercent,
        averageResponseTime,
        incorrectCount,
        missedPercent,
      };
    });

    const answeredQuestions = perQuestion.filter((item) => item.participationCount > 0);
    const overallParticipation = answeredQuestions.length > 0
      ? Math.round(answeredQuestions.reduce((sum, item) => sum + item.participationPercent, 0) / answeredQuestions.length)
      : 0;
    const allTimes = answeredQuestions
      .map((item) => item.averageResponseTime)
      .filter((value) => typeof value === 'number');
    const averageResponseOverall = allTimes.length > 0
      ? allTimes.reduce((sum, value) => sum + value, 0) / allTimes.length
      : null;
    const mostMissed = [...perQuestion]
      .filter((item) => item.incorrectCount > 0)
      .sort((a, b) => b.incorrectCount - a.incorrectCount || b.missedPercent - a.missedPercent)
      .slice(0, 5);

    return {
      totalPlayers,
      totalQuestions: questions.length,
      overallParticipation,
      averageResponseOverall,
      mostMissed,
      perQuestion,
    };
  }, [game]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Users} label="Average participation" value={`${analytics.overallParticipation}%`} subtext={`${analytics.totalPlayers} players across ${analytics.totalQuestions} questions`} />
        <StatCard icon={Timer} label="Average response time" value={formatMs(analytics.averageResponseOverall)} subtext="Across answered questions" />
        <StatCard icon={AlertTriangle} label="Learning gap alerts" value={analytics.mostMissed.length} subtext="Questions most often answered incorrectly" />
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
        <div className="mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-black text-slate-900">Most frequently missed questions</h2>
        </div>
        <div className="space-y-3">
          {analytics.mostMissed.length > 0 ? analytics.mostMissed.map((item) => (
            <div key={item.index} className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Question {item.index + 1}</p>
                  <p className="text-base font-bold text-slate-900">{item.question}</p>
                </div>
                <div className="flex gap-2 text-sm font-bold text-slate-600">
                  <span>{item.incorrectCount} missed</span>
                  <span>•</span>
                  <span>{item.missedPercent}% missed</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500 border border-slate-200">
              No missed-question data yet.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
        <h2 className="mb-4 text-xl font-black text-slate-900">Per-question analytics</h2>
        <div className="space-y-3">
          {analytics.perQuestion.map((item) => (
            <div key={item.index} className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Question {item.index + 1}</p>
                  <p className="text-base font-bold text-slate-900">{item.question}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-primary">
                  {String(item.questionType || 'multiple_choice').replaceAll('_', ' ')}
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Participation</p>
                  <p className="mt-1 text-lg font-black text-slate-900">{item.participationPercent}%</p>
                  <p className="text-sm text-slate-500">{item.participationCount} player responses</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Average response time</p>
                  <p className="mt-1 text-lg font-black text-slate-900">{formatMs(item.averageResponseTime)}</p>
                  <p className="text-sm text-slate-500">Based on submitted answers</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Missed answers</p>
                  <p className="mt-1 text-lg font-black text-slate-900">{item.incorrectCount}</p>
                  <p className="text-sm text-slate-500">{item.missedPercent}% of respondents</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}