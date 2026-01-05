import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Rss, ExternalLink } from 'lucide-react';

export default function RSSNotificationsWidget() {
  const { data: feeds = [] } = useQuery({
    queryKey: ['rss-feeds-widget'],
    queryFn: () => base44.entities.RSSFeed.list('-published_date', 5)
  });

  if (feeds.length === 0) return null;

  return (
    <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Rss className="w-5 h-5 text-orange-400" />
        <h3 className="font-bold text-white">Latest News</h3>
      </div>
      <div className="space-y-3">
        {feeds.slice(0, 3).map((item) => (
          <a
            key={item.id}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-slate-800/50 hover:bg-slate-700/50 p-3 rounded-lg transition-all group"
          >
            <p className="text-sm font-medium text-white mb-1 line-clamp-2 group-hover:text-orange-400">
              {item.title}
            </p>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{new Date(item.published_date).toLocaleDateString()}</span>
              <ExternalLink className="w-3 h-3 group-hover:text-orange-400" />
            </div>
          </a>
        ))}
      </div>
    </Card>
  );
}