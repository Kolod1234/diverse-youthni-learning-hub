import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, Chip, Button, Box, Typography, IconButton, ButtonGroup, CircularProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
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
      const sources = ['bbc', 'bbceducation', 'cnn', 'ocnni', 'ukhomeoffice', 'migrantni', 'eani', 'deni', 'govuk', 'ukparliament'];
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ height: 384, bgcolor: 'grey.200', borderRadius: 4 }} className="animate-pulse" />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
          {[...Array(4)].map((_, i) => (
            <Box key={i} sx={{ height: 288, bgcolor: 'grey.200', borderRadius: 3 }} className="animate-pulse" />
          ))}
        </Box>
      </Box>
    );
  }

  if (feedItems.length === 0) {
    return null;
  }

  const featuredItem = displayedItems[0];
  const gridItems = displayedItems.slice(1);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
          <Filter size={16} />
          <Typography variant="body2" fontWeight={500}>Filter:</Typography>
        </Box>
        <ButtonGroup size="small">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'contained' : 'outlined'}
              onClick={() => {
                setSelectedCategory(category);
                setDisplayCount(initialLimit);
              }}
              sx={{ 
                bgcolor: selectedCategory === category ? '#2563eb' : 'transparent',
                color: selectedCategory === category ? 'white' : 'text.primary',
                '&:hover': { bgcolor: selectedCategory === category ? '#1d4ed8' : 'grey.100' }
              }}
            >
              {category === 'all' ? 'All' : category}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      <AnimatePresence mode="popLayout">
        {featuredItem && (
          <motion.div
            key="featured-item"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              component="a"
              href={featuredItem.link}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ display: 'block', textDecoration: 'none', '&:hover': { '& img': { transform: 'scale(1.05)' }, '& .MuiCard-root': { boxShadow: 12 } } }}
            >
              <Card sx={{ overflow: 'hidden', transition: 'all 0.3s', border: 0, boxShadow: 4 }}>
                <Box sx={{ position: 'relative', height: 384, overflow: 'hidden', bgcolor: 'black' }}>
                  <Box
                    component="img"
                    src={featuredItem.image_url || `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=600&fit=crop&auto=format&q=90`}
                    alt={featuredItem.title}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                    onError={(e) => {
                      e.target.src = `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=600&fit=crop&auto=format&q=90`;
                    }}
                  />
                  
                  <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.4), transparent)' }} />
                  
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 4, color: 'white' }}>
                    <Box sx={{ mb: 1.5 }}>
                      <Chip
                        label={featuredItem.category || 'Newsflare'}
                        size="small"
                        sx={{ bgcolor: getSourceStyle(featuredItem.category).badge.replace('bg-', '#'), color: 'white', fontWeight: 500, fontSize: '0.75rem' }}
                      />
                    </Box>
                    
                    <Typography variant="h4" sx={{ fontSize: { xs: '1.875rem', md: '2.25rem' }, fontWeight: 700, mb: 2, lineHeight: 1.2, '&:hover': { color: '#93c5fd' }, transition: 'color 0.3s' }}>
                      {decodeHTMLEntities(featuredItem.title)}
                    </Typography>
                    
                    {featuredItem.description && (
                      <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: { xs: '0.875rem', md: '1rem' }, mb: 2, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', maxWidth: 1024 }}>
                        {decodeHTMLEntities(featuredItem.description)}
                      </Typography>
                    )}
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                      <Box component="button" sx={{ display: 'flex', alignItems: 'center', gap: 1, background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', '&:hover': { color: 'white' }, transition: 'color 0.3s' }}>
                        <ThumbsUp size={16} />
                        <Typography variant="body2">{Math.floor(Math.random() * 500) + 100}</Typography>
                      </Box>
                      <Box component="button" sx={{ display: 'flex', alignItems: 'center', gap: 1, background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', '&:hover': { color: 'white' }, transition: 'color 0.3s' }}>
                        <MessageCircle size={16} />
                        <Typography variant="body2">{Math.floor(Math.random() * 50) + 5}</Typography>
                      </Box>
                      {featuredItem.published_date && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Clock size={16} />
                          <Typography variant="body2">{getTimeAgo(featuredItem.published_date)}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Card>
            </Box>
          </motion.div>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
          {gridItems.map((item, index) => {
            const sourceStyle = getSourceStyle(item.category);
            return (
              <motion.div
                key={item.id || `item-${index}`}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Box
                  component="a"
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ display: 'block', textDecoration: 'none', height: '100%', '&:hover': { '& img': { transform: 'scale(1.05)' }, '& .MuiCard-root': { boxShadow: 8 } } }}
                >
                  <Card sx={{ overflow: 'hidden', transition: 'all 0.3s', border: 0, height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 2 }}>
                    <Box sx={{ position: 'relative', height: 192, overflow: 'hidden', bgcolor: 'grey.200' }}>
                      <Box
                        component="img"
                        src={item.image_url || `https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=800&h=400&fit=crop&auto=format&q=85`}
                        alt={item.title}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                        onError={(e) => {
                          e.target.src = `https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=800&h=400&fit=crop&auto=format&q=85`;
                        }}
                      />
                    </Box>
                    
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Chip
                          label={item.category || 'News'}
                          size="small"
                          sx={{ bgcolor: sourceStyle.badge.replace('bg-', '#'), color: 'white', fontSize: '0.75rem', height: 20 }}
                        />
                        {item.published_date && (
                          <Typography variant="caption" color="text.secondary">
                            {getTimeAgo(item.published_date)}
                          </Typography>
                        )}
                      </Box>
                      
                      <Typography variant="h6" sx={{ fontSize: '1.125rem', fontWeight: 700, color: 'grey.900', mb: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', '&:hover': { color: '#2563eb' }, transition: 'color 0.3s' }}>
                        {decodeHTMLEntities(item.title)}
                      </Typography>
                      
                      {item.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {decodeHTMLEntities(item.description)}
                        </Typography>
                      )}
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary', fontSize: '0.875rem', pt: 1.5, borderTop: 1, borderColor: 'grey.100' }}>
                        <Box component="button" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', '&:hover': { color: '#2563eb' }, transition: 'color 0.3s' }}>
                          <ThumbsUp size={14} />
                          <Typography variant="caption">{Math.floor(Math.random() * 100) + 10}</Typography>
                        </Box>
                        <Box component="button" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', '&:hover': { color: '#2563eb' }, transition: 'color 0.3s' }}>
                          <MessageCircle size={14} />
                          <Typography variant="caption">{Math.floor(Math.random() * 30) + 1}</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </motion.div>
            );
          })}
        </Box>
      </AnimatePresence>

      {hasMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 3 }}>
          <Button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            variant="outlined"
            size="large"
            endIcon={isLoadingMore ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            sx={{ '&:hover': { bgcolor: '#eff6ff', color: '#1d4ed8', borderColor: '#93c5fd' } }}
          >
            {isLoadingMore ? 'Loading...' : 'See more'}
          </Button>
        </Box>
      )}

      {filteredItems.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Rss size={48} color="#d1d5db" style={{ margin: '0 auto 12px' }} />
          <Typography color="text.secondary">No recent news items found</Typography>
        </Box>
      )}
    </Box>
  );
}

export default RSSFeedWidget;