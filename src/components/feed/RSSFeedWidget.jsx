import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';

import { Rss, ExternalLink, Clock, ArrowRight, Filter, Loader2, ThumbsUp, MessageCircle, Share2 } from 'lucide-react';
import { format } from 'date-fns';

const SOURCE_COLORS = {
  BBC: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-500' },
  BBCEDUCATION: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', badge: 'bg-rose-500' },
  CNN: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-500' },
  EANI: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', badge: 'bg-indigo-500' },
  DENI: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', badge: 'bg-violet-500' },
  GOVUK: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', badge: 'bg-slate-500' },
  UKPARLIAMENT: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-500' },
  OCNNI: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-500' },
  UKHOMEOFFICE: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-500' },
  MIGRANTNI: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-500' },
  METROWEATHER: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', badge: 'bg-cyan-500' },
  MSN: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', badge: 'bg-teal-500' },
  ANNOUNCEMENT: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-900', badge: 'bg-yellow-500' },
  default: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', badge: 'bg-gray-500' },
};

const decodeHTMLEntities = (text) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

const getTimeAgo = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1d';
  if (diffDays < 7) return `${diffDays}d`;
  return format(past, 'MMM d');
};

function RSSFeedWidget({ initialLimit = 6 }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [displayCount, setDisplayCount] = useState(initialLimit);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { data: feedItems = [], isLoading } = useQuery({
    queryKey: ['rss-feed'],
    queryFn: () => base44.entities.RSSFeed.list('-published_date', 100),
    refetchInterval: 300000,
  });

  useEffect(() => {
    const importAllSources = async () => {
      const sources = ['bbc', 'bbceducation', 'cnn', 'ocnni', 'ukhomeoffice', 'migrantni', 'eani', 'deni', 'govuk', 'ukparliament', 'msn'];
      try {
        for (const source of sources) {
          await base44.functions.invoke('importRSSFeeds', { source });
        }
      } catch (error) {
        console.log('Auto-refresh RSS feeds:', error.message);
      }
    };

    importAllSources();
    const interval = setInterval(importAllSources, 300000);
    return () => clearInterval(interval);
  }, []);

  const recentItems = feedItems.filter(item => {
    if (item.category === 'ANNOUNCEMENT') return true;
    const daysSincePublished = (new Date() - new Date(item.published_date)) / (1000 * 60 * 60 * 24);
    return daysSincePublished <= 3;
  });

  const categories = useMemo(() => {
    const normalizedCategories = recentItems
      .map((item) => item?.category)
      .filter((category) => typeof category === 'string' && category.trim().length > 0)
      .map((category) => category.trim());

    return ['all', ...Array.from(new Set(normalizedCategories))];
  }, [recentItems]);

  const filteredItems = selectedCategory === 'all'
    ? recentItems
    : recentItems.filter((item) => item?.category === selectedCategory);
  
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
      <div className="space-y-4">
        <div className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-72 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (feedItems.length === 0) {
    return null;
  }

  const featuredItem = displayedItems[0];
  const gridItems = displayedItems.slice(1);

  return (
    <div className="space-y-6">
      {/* Category Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-foreground/60">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filter:</span>
        </div>
        {categories.filter(Boolean).map((category, index) => (
          <button
            key={`${category}-${index}`}
            type="button"
            onClick={() => {
              setSelectedCategory(category);
              setDisplayCount(initialLimit);
            }}
            className={`inline-flex h-8 items-center justify-center whitespace-nowrap rounded-md border px-3 text-xs font-medium transition-colors ${
              selectedCategory === category
                ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
                : 'border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            {category === 'all' ? 'All' : category}
          </button>
        ))}
      </div>

      {/* Featured Story - Large Card */}
      {featuredItem && (
        <div>
          <a
            href={featuredItem.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-0">
              <div className="relative h-96 overflow-hidden bg-black">
                {featuredItem.image_url ? (
                  <img
                    src={featuredItem.image_url}
                    alt={featuredItem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=600&fit=crop&auto=format&q=90`;
                    }}
                  />
                ) : (
                  <img
                    src={`https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=600&fit=crop&auto=format&q=90`}
                    alt={featuredItem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="mb-3">
                    <span className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-medium text-white ${getSourceStyle(featuredItem.category).badge}`}>
                      {featuredItem.category || 'Newsflare'}
                    </span>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight group-hover:text-blue-300 transition-colors">
                    {decodeHTMLEntities(featuredItem.title)}
                  </h2>
                  
                  {featuredItem.description && (
                    <p className="text-white/90 text-sm md:text-base mb-4 line-clamp-2 max-w-4xl">
                      {decodeHTMLEntities(featuredItem.description)}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-6 text-white/80 text-sm">
                    <button className="flex items-center gap-2 hover:text-white transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{Math.floor(Math.random() * 500) + 100}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-white transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span>{Math.floor(Math.random() * 50) + 5}</span>
                    </button>
                    {featuredItem.published_date && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {getTimeAgo(featuredItem.published_date)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </a>
        </div>
      )}

      {/* Grid of Stories */}
      <div className="grid md:grid-cols-2 gap-4">
        {gridItems.map((item, index) => {
          if (!item) return null;
          const sourceStyle = getSourceStyle(item.category);
          return (
            <div key={item.id || `item-${index}`}>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block group h-full"
              >
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden bg-gray-200">
                    <img
                      src={item.image_url || `https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=800&h=400&fit=crop&auto=format&q=85`}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = `https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=800&h=400&fit=crop&auto=format&q=85`;
                      }}
                    />
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col bg-card">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs text-white ${sourceStyle.badge}`}>
                        {item.category || 'News'}
                      </span>
                      {item.published_date && (
                        <span className="text-xs text-muted-foreground">
                          {getTimeAgo(item.published_date)}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-blue-500 transition-colors">
                      {decodeHTMLEntities(item.title)}
                    </h3>
                    
                    {item.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                        {decodeHTMLEntities(item.description)}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-muted-foreground text-sm pt-3 border-t border-border">
                      <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{Math.floor(Math.random() * 100) + 10}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{Math.floor(Math.random() * 30) + 1}</span>
                      </button>
                    </div>
                  </div>
                </Card>
              </a>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-6">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 disabled:pointer-events-none disabled:opacity-50"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                See more
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* No Results */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Rss className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No recent news items found</p>
        </div>
      )}
    </div>
  );
}

export default RSSFeedWidget;