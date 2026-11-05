import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rss, ExternalLink, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function RSSNotificationsWidget() {
  const { data: feeds = [], isLoading, refetch } = useQuery({
    queryKey: ['rss-feeds-widget'],
    queryFn: () => base44.entities.RSSFeed.list('-published_date', 5)
  });

  if (isLoading) {
    return (
      <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-lg animate-pulse">
        <div className="h-6 bg-slate-700 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-800/50 p-3 rounded-lg">
              <div className="h-4 bg-slate-700 rounded mb-2" />
              <div className="h-3 bg-slate-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (feeds.length === 0) return null;

  return (
    <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Rss className="w-5 h-5 text-orange-400" />
          <h3 className="font-bold text-white">Latest News</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-slate-400 hover:text-white"
            onClick={() => refetch()}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-3">
        {feeds.slice(0, 3).map((item, idx) => (
          <motion.a
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
          </motion.a>
        ))}
      </div>
      <Link to={createPageUrl('Home') + '#news'}>
        <Button variant="link" className="w-full mt-3 text-orange-400 hover:text-orange-300 text-sm">
          View All News
        </Button>
      </Link>
    </Card>
  );
}