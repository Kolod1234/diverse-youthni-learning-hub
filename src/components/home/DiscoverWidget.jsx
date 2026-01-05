import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function DiscoverWidget() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: content = [] } = useQuery({
    queryKey: ['discover-content'],
    queryFn: () => base44.entities.DiscoverContent.filter({ is_active: true })
  });

  useEffect(() => {
    if (content.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % content.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [content.length]);

  if (content.length === 0) return null;

  const current = content[currentIndex];
  const categoryColors = {
    tech_news: 'bg-blue-500 text-white',
    gossip: 'bg-pink-500 text-white',
    announcement: 'bg-purple-500 text-white'
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-lg h-full">
      {current.image_url && (
        <div className="absolute inset-0 opacity-20">
          <img src={current.image_url} alt={current.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="relative p-4 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-white">Discover</h3>
        </div>
        
        <Badge className={`${categoryColors[current.category]} mb-3 w-fit`}>
          {current.category.replace('_', ' ')}
        </Badge>
        
        <h4 className="text-lg font-bold text-white mb-2 line-clamp-2">{current.title}</h4>
        {current.description && (
          <p className="text-sm text-slate-300 mb-4 line-clamp-3">{current.description}</p>
        )}
        
        <div className="flex items-center gap-2 mt-auto">
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + content.length) % content.length)}
            className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <div className="flex-1 flex justify-center gap-1">
            {content.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentIndex ? 'w-6 bg-purple-400' : 'w-1.5 bg-slate-600'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % content.length)}
            className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </Card>
  );
}