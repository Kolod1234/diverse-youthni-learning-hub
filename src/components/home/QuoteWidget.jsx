import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Quote } from 'lucide-react';

export default function QuoteWidget() {
  const { data: quotes = [] } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => base44.entities.InspirationalQuote.filter({ is_active: true })
  });

  const randomQuote = quotes.length > 0 ? quotes[Math.floor(Math.random() * quotes.length)] : null;

  if (!randomQuote) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-lg">
      <Quote className="w-8 h-8 text-amber-400 mb-3" />
      <blockquote className="text-base font-medium text-white mb-2 leading-relaxed">
        "{randomQuote.quote}"
      </blockquote>
      <p className="text-sm text-slate-400">— {randomQuote.author}</p>
    </Card>
  );
}