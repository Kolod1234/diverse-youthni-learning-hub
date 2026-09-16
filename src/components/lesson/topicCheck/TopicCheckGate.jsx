import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

const players = new Set(['LessonPlayer', 'LessonPlayerClassic', 'LessonPlayerPowerPoint', 'LessonPlayerRise']);
export default function TopicCheckGate({ page, children }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const id = page === 'LessonPlayerRise' ? params.get('lessonId') || params.get('lesson') : params.get('lesson');
  const enabled = players.has(page) && !!id;
  const check = useQuery({ queryKey: ['topic-access', id], enabled, queryFn: async () => (await base44.functions.invoke('topicCheck', { action: 'access', lessonId: id })).data, staleTime: 0, retry: false });
  if (!enabled) return children;
  if (check.isPending) return <div className="flex min-h-screen items-center justify-center bg-background text-foreground" role="status">Checking topic access…</div>;
  if (check.isError) return <div className="space-y-4 p-8 text-foreground"><p role="alert">Topic access could not be checked. Please try again.</p><Button onClick={() => check.refetch()}>Retry access check</Button></div>;
  if (!check.data?.allowed) return <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground"><section className="max-w-lg space-y-5 rounded-xl border bg-card p-8"><h1 className="text-2xl font-bold">Pass the previous topic first</h1><p>Score at least 70% in <strong>{check.data?.prerequisite?.title}</strong> before opening this topic. You can reread that lesson or retry its topic check.</p><Button asChild><Link to={'/LessonPlayerClassic?lesson=' + check.data.prerequisite.id + '&course=' + check.data.prerequisite.course_id}>Return to required lesson</Link></Button></section></main>;
  return children;
}