import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Rss, Clock, ArrowRight, Filter, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const SOURCE_BADGES = {
  BBC: 'bg-red-500',
  BBCEDUCATION: 'bg-rose-500',
  CNN: 'bg-blue-500',
  EANI: 'bg-indigo-500',
  DENI: 'bg-violet-500',
  GOVUK: 'bg-slate-500',
  UKPARLIAMENT: 'bg-emerald-500',
  OCNNI: 'bg-purple-500',
  UKHOMEOFFICE: 'bg-green-500',
  MIGRANTNI: 'bg-orange-500',
  METROWEATHER: 'bg-cyan-500',
  MSN: 'bg-teal-500',
  ANNOUNCEMENT: 'bg-yellow-500',
};

const decodeHTMLEntities = (text = '') => {
  if (typeof document === 'undefined') return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

const getTimeAgo = (dateString) => {
  if (!dateString) return '';
  const past = new Date(dateString);
  if (Number.isNaN(past.getTime())) return '';

  const now = new Date();
  const diffMs = now - past;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 60) return `${Math.max(diffMinutes, 1)}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1d';
  if (diffDays < 7) return `${diffDays}d`;
  return format(past, 'MMM d');
};

const getSafeItems = (items) => {
  if (!Array.isArray(items)) return [];

  return items.filter((item) => {
    if (!item || typeof item !== 'object') return false;
    if (!item.title || !item.link) return false;
    if (item.category === 'ANNOUNCEMENT') return true;
    if (!item.published_date) return false;

    const published = new Date(item.published_date);
    if (Number.isNaN(published.getTime())) return false;

    const daysSincePublished = (Date.now() - published.getTime()) / (1000 * 60 * 60 * 24);
    return daysSincePublished <= 14;
  });
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

  const recentItems = useMemo(() => {
    const filtered = getSafeItems(feedItems);
    if (filtered.length > 0) return filtered;
    // Fallback: if nothing is within the recency window, show the latest items anyway
    return (Array.isArray(feedItems) ? feedItems : []).filter((item) => item && item.title && item.link);
  }, [feedItems]);

  const categories = useMemo(() => {
    const values = recentItems
      .map((item) => item.category)
      .filter((category) => typeof category === 'string' && category.trim());

    return ['all', ...Array.from(new Set(values))];
  }, [recentItems]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return recentItems;
    return recentItems.filter((item) => item.category === selectedCategory);
  }, [recentItems, selectedCategory]);

  const displayedItems = filteredItems.slice(0, displayCount);
  const featuredItem = displayedItems[0] || null;
  const gridItems = displayedItems.slice(1);
  const hasMore = displayedItems.length < filteredItems.length;

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayCount((prev) => prev + 6);
      setIsLoadingMore(false);
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-96 animate-pulse rounded-2xl bg-gray-200" />
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="h-72 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (recentItems.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <Rss className="mx-auto mb-3 h-12 w-12 text-gray-300" />
        <p className="text-gray-500">No recent news items found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-foreground/60">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filter:</span>
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setDisplayCount(initialLimit);
          }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === 'all' ? 'All' : category}
            </option>
          ))}
        </select>
      </div>

      {featuredItem && (
        <a href={featuredItem.link} target="_blank" rel="noopener noreferrer" className="block group">
          <div className="overflow-hidden rounded-xl bg-card shadow transition-all duration-300 hover:shadow-2xl">
            <div className="relative h-96 overflow-hidden bg-black">
              <img
                src={featuredItem.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=600&fit=crop&auto=format&q=90'}
                alt={featuredItem.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <span className={`mb-3 inline-flex items-center rounded-md px-3 py-1 text-xs font-medium text-white ${SOURCE_BADGES[featuredItem.category] || 'bg-gray-500'}`}>
                  {featuredItem.category || 'News'}
                </span>
                <h2 className="mb-4 text-3xl font-bold leading-tight md:text-4xl">
                  {decodeHTMLEntities(featuredItem.title)}
                </h2>
                {featuredItem.description && (
                  <p className="mb-4 max-w-4xl line-clamp-2 text-sm text-white/90 md:text-base">
                    {decodeHTMLEntities(featuredItem.description)}
                  </p>
                )}
                {featuredItem.published_date && (
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Clock className="h-4 w-4" />
                    <span>{getTimeAgo(featuredItem.published_date)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </a>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {gridItems.map((item) => (
          <a key={item.id || item.link} href={item.link} target="_blank" rel="noopener noreferrer" className="block group h-full">
            <div className="flex h-full flex-col overflow-hidden rounded-xl bg-card shadow transition-all duration-300 hover:shadow-xl">
              <div className="relative h-48 overflow-hidden bg-gray-200">
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=800&h=400&fit=crop&auto=format&q=85'}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col bg-card p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs text-white ${SOURCE_BADGES[item.category] || 'bg-gray-500'}`}>
                    {item.category || 'News'}
                  </span>
                  {item.published_date && (
                    <span className="text-xs text-muted-foreground">{getTimeAgo(item.published_date)}</span>
                  )}
                </div>
                <h3 className="mb-2 line-clamp-2 text-lg font-bold text-foreground group-hover:text-blue-500">
                  {decodeHTMLEntities(item.title)}
                </h3>
                {item.description && (
                  <p className="mb-4 flex-1 line-clamp-2 text-sm text-muted-foreground">
                    {decodeHTMLEntities(item.description)}
                  </p>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-6">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 disabled:pointer-events-none disabled:opacity-50"
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
    </div>
  );
}

export default RSSFeedWidget;