import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Rss, ExternalLink, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function RSSFeedWidget({ limit = 6 }) {
  const { data: feedItems = [], isLoading } = useQuery({
    queryKey: ['rss-feed'],
    queryFn: () => base44.entities.RSSFeed.list('-published_date', limit),
  });

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4" />
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </Card>
        ))}
      </div>
    );
  }

  if (feedItems.length === 0) {
    return null;
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {feedItems.map((item, idx) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 group">
            {item.image_url && (
              <div className="aspect-video overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                {item.category && (
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                )}
                {item.is_featured && (
                  <Badge className="bg-yellow-400 text-gray-900 text-xs">
                    Featured
                  </Badge>
                )}
                {item.published_date && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 ml-auto">
                    <Clock className="w-3 h-3" />
                    {format(new Date(item.published_date), 'MMM d, yyyy')}
                  </div>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {item.description}
              </p>
              
              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm group-hover:gap-3 transition-all"
                >
                  Read more
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}