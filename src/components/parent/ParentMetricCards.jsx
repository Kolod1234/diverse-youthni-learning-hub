import React from 'react';
import { BookOpen, Clock3, ClipboardList, Trophy } from 'lucide-react';

export default function ParentMetricCards({ child }) {
  const metrics = [
    ['Study hours', child?.study_hours || 0, Clock3],
    ['Lessons completed', child?.completed_lessons || 0, BookOpen],
    ['Outstanding work', child?.outstanding_assignments?.length || 0, ClipboardList],
    ['Average quiz score', `${child?.average_quiz_score || 0}%`, Trophy],
  ];
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value, Icon]) => <div key={label} className="rounded-2xl border bg-card p-5 shadow-sm"><Icon className="mb-3 h-5 w-5 text-primary"/><p className="text-2xl font-bold">{value}</p><p className="text-sm text-muted-foreground">{label}</p></div>)}</div>;
}