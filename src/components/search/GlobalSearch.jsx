import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, InputBase, Chip, CircularProgress, Paper, Divider } from '@mui/material';
import { Search, X, BookOpen, Users, FileText, Calendar, GraduationCap } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { activateOnKey } from '@/lib/a11y';

const SECTIONS = [
  { key: 'courses',  label: 'Courses',  icon: BookOpen,      color: '#7c3aed' },
  { key: 'lessons',  label: 'Lessons',  icon: FileText,      color: '#2563eb' },
  { key: 'events',   label: 'Events',   icon: Calendar,      color: '#16a34a' },
  { key: 'tutors',   label: 'Tutors',   icon: GraduationCap, color: '#ea580c' },
];

function highlight(text, query) {
  if (!text || !query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <Box component="mark" sx={{ bgcolor: '#fef08a', borderRadius: 0.5, px: 0.25 }}>{text.slice(idx, idx + query.length)}</Box>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function GlobalSearch({ onClose }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const { data: results, isFetching } = useQuery({
    queryKey: ['global-search', debouncedQuery],
    queryFn: async () => {
      if (debouncedQuery.length < 2) return null;
      const q = debouncedQuery.toLowerCase();

      const [courses, lessons, events, users] = await Promise.all([
        base44.entities.Course.list('-created_date', 200),
        base44.entities.Lesson.list('-created_date', 300),
        base44.entities.Event.filter({ is_published: true }, 'date', 200),
        base44.functions.invoke('getAllTutors').then(r => r.data?.users || []),
      ]);

      return {
        courses: courses.filter(c => c.title?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q)).slice(0, 5),
        lessons: lessons.filter(l => l.title?.toLowerCase().includes(q) || l.section?.toLowerCase().includes(q)).slice(0, 5),
        events: events.filter(e => e.title?.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q)).slice(0, 5),
        tutors: users.filter(u => (u.is_tutor || u.role === 'admin') && (u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))).slice(0, 5),
      };
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 10000,
  });

  const totalResults = results ? Object.values(results).reduce((s, a) => s + a.length, 0) : 0;

  const getHref = (key, item) => {
    if (key === 'courses') return createPageUrl('CourseDetails') + `?id=${item.id}`;
    if (key === 'lessons') return createPageUrl('LessonEditor') + `?id=${item.id}`;
    if (key === 'events')  return createPageUrl('Events');
    if (key === 'tutors')  return createPageUrl('Tutors');
    return '#';
  };

  const getTitle = (key, item) => item.title || item.full_name || item.name || '';
  const getSub = (key, item) => {
    if (key === 'courses') return item.category;
    if (key === 'lessons') return item.section;
    if (key === 'events') return item.date ? new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    if (key === 'tutors') return item.email;
    return '';
  };

  return (
    <Box
      onClick={onClose}
      sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.5)', zIndex: 1400, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', pt: { xs: 8, md: 16 }, px: 2 }}
    >
      <Paper
        onClick={(e) => e.stopPropagation()}
        elevation={8}
        sx={{ width: '100%', maxWidth: 620, borderRadius: 3, overflow: 'hidden' }}
      >
        {/* Input */}
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          {isFetching
            ? <CircularProgress size={20} sx={{ mr: 1.5, flexShrink: 0 }} />
            : <Search size={20} color="#9ca3af" style={{ marginRight: 12, flexShrink: 0 }} />
          }
          <InputBase
            inputRef={inputRef}
            fullWidth
            placeholder="Search courses, lessons, events, tutors…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ fontSize: '1rem' }}
          />
          {query && (
            <Box role="button" tabIndex={0} onKeyDown={activateOnKey} onClick={() => setQuery('')} sx={{ cursor: 'pointer', color: 'text.disabled', ml: 1 }}>
              <X size={18} />
            </Box>
          )}
        </Box>

        {/* Body */}
        <Box sx={{ maxHeight: 480, overflowY: 'auto', p: debouncedQuery.length >= 2 ? 1 : 0 }}>
          {debouncedQuery.length < 2 ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Search size={40} color="#d1d5db" style={{ margin: '0 auto 12px' }} />
              <Typography color="text.secondary">Type at least 2 characters to search</Typography>
            </Box>
          ) : isFetching ? null : totalResults === 0 ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography color="text.secondary">No results for "<strong>{debouncedQuery}</strong>"</Typography>
            </Box>
          ) : SECTIONS.map(({ key, label, icon: Icon, color }) => {
            const items = results?.[key] || [];
            if (!items.length) return null;
            return (
              <Box key={key} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75 }}>
                  <Icon size={14} color={color} />
                  <Typography variant="caption" fontWeight={700} sx={{ color, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {label}
                  </Typography>
                  <Chip label={items.length} size="small" sx={{ height: 16, fontSize: '0.65rem', ml: 'auto' }} />
                </Box>
                {items.map((item, i) => (
                  <Link key={item.id || i} to={getHref(key, item)} onClick={onClose} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Box sx={{ px: 1.5, py: 1, borderRadius: 1.5, mx: 0.5, '&:hover': { bgcolor: 'action.hover' }, cursor: 'pointer' }}>
                      <Typography variant="body2" fontWeight={500} noWrap>
                        {highlight(getTitle(key, item), debouncedQuery)}
                      </Typography>
                      {getSub(key, item) && (
                        <Typography variant="caption" color="text.secondary">
                          {highlight(getSub(key, item), debouncedQuery)}
                        </Typography>
                      )}
                    </Box>
                  </Link>
                ))}
                <Divider sx={{ mt: 0.5 }} />
              </Box>
            );
          })}
        </Box>

        {/* Footer hint */}
        <Box sx={{ px: 2, py: 1, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 2 }}>
          <Typography variant="caption" color="text.disabled">↵ to select</Typography>
          <Typography variant="caption" color="text.disabled">Esc to close</Typography>
        </Box>
      </Paper>
    </Box>
  );
}