import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Rss, ExternalLink, Clock, ArrowRight, Filter, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const SOURCE_COLORS = {
  BBC: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'bg-red-100' },
  CNN: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'bg-blue-100' },
  OCNNI: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'bg-purple-100' },
  UKHOMEOFFICE: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'bg-green-100' },
  MIGRANTNI: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'bg-orange-100' },
  ANNOUNCEMENT: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-900', icon: 'bg-yellow-200' },
  default: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', icon: 'bg-gray-100' },
};

const getTimeAgo = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return format(past, 'MMM d');
};

export default function RSSFeedWidget({ initialLimit = 6 }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [displayCount, setDisplayCount] = useState(initialLimit);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { data: feedItems = [], isLoading } = useQuery({
    queryKey: ['rss-feed'],
    queryFn: () => base44.entities.RSSFeed.list('-published_date', 100),
  });

  // Filter to show only recent news (last 3 days) and custom announcements
  const recentItems = feedItems.filter(item => {
    if (item.category === 'ANNOUNCEMENT') return true; // Always show announcements
    const daysSincePublished = (new Date() - new Date(item.published_date)) / (1000 * 60 * 60 * 24);
    return daysSincePublished <= 3; // Only show news from last 3 days
  });

  const categories = ['all', ...new Set(recentItems.map(item => item.category).filter(Boolean))];
  
  const filteredItems = selectedCategory === 'all' 
    ? recentItems 
    : recentItems.filter(item => item.category === selectedCategory);
  
  const displayedItems = filteredItems.slice(0, displayCount);
  const hasMore = displayedItems.length < filteredItems.length;

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayCount(prev => prev + 6);
      setIsLoadingMore(false);
    }, 300);
  };

  const getSourceStyle = (category) => SOURCE_COLORS[category] || SOURCE_COLORS.default;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-2 flex-wrap">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 w-24 bg-gray-200 rounded-full animate-pulse" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4" />
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (feedItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Category Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-gray-600">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filter by source:</span>
        </div>
        {categories.map((category) => (
          <Button
            key={category}
            size="sm"
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => {
              setSelectedCategory(category);
              setDisplayCount(initialLimit);
            }}
            className={`transition-all ${
              selectedCategory === category 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'hover:bg-gray-100'
            }`}
          >
            {category === 'all' ? 'All Sources' : category}
          </Button>
        ))}
      </div>

      {/* Feed Items Grid */}
      <AnimatePresence mode="popLayout">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedItems.map((item, idx) => {
            const sourceStyle = getSourceStyle(item.category);
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`h-full overflow-hidden hover:shadow-xl transition-all duration-300 group border-2 ${sourceStyle.border}`}>
                  {item.image_url && (
                    <div className="aspect-video overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className={`p-6 ${sourceStyle.bg}`}>
                    <div className="flex items-center gap-2 mb-3">
                      {item.category && (
                        <Badge className={`text-xs ${sourceStyle.icon} ${sourceStyle.text} border-0`}>
                          {item.category === 'ANNOUNCEMENT' ? '📢' : <Rss className="w-3 h-3 mr-1" />}
                          {item.category === 'ANNOUNCEMENT' ? 'Announcement' : item.category}
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
                          {getTimeAgo(item.published_date)}
                        </div>
                      )}
                    </div>
                    
                    <h3 className={`text-lg font-bold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors ${sourceStyle.text}`}>
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
                        className={`inline-flex items-center gap-2 hover:text-blue-700 font-semibold text-sm group-hover:gap-3 transition-all ${sourceStyle.text}`}
                      >
                        Read more
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-6">
          <Button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            variant="outline"
            size="lg"
            className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Load More News
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      )}

      {/* No Results */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Rss className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No recent news items found</p>
          <p className="text-sm text-gray-400 mt-2">Showing news from the last 3 days</p>
        </div>
      )}
      
      {/* Info Banner */}
      {feedItems.length > 0 && recentItems.length < feedItems.length && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            Showing {recentItems.length} recent items from the last 3 days
          </p>
        </div>
      )}
    </div>
  );
}