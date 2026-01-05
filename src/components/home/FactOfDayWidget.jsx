import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

export default function FactOfDayWidget() {
  const { data: facts = [] } = useQuery({
    queryKey: ['daily-facts'],
    queryFn: () => base44.entities.DailyFact.filter({ is_active: true })
  });

  const randomFact = facts.length > 0 ? facts[Math.floor(Math.random() * facts.length)] : null;

  if (!randomFact) return null;

  return (
    <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-5 h-5 text-yellow-400" />
        <h3 className="font-bold text-white text-sm">Fact of the Day</h3>
      </div>
      <p className="text-sm text-slate-300 leading-relaxed">{randomFact.fact}</p>
      <p className="text-xs text-slate-500 mt-2 uppercase tracking-wide">{randomFact.category}</p>
    </Card>
  );
}