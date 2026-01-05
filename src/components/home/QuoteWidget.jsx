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
    <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-0 shadow-sm">
      <Quote className="w-8 h-8 text-amber-600 mb-3" />
      <blockquote className="text-lg font-medium text-gray-900 mb-2">
        "{randomQuote.quote}"
      </blockquote>
      <p className="text-sm text-gray-600">— {randomQuote.author}</p>
    </Card>
  );
}