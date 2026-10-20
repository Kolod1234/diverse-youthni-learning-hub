import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Card, Chip, Typography } from '@mui/material';
import { createPageUrl } from '@/utils';

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=640&q=75';

const label = (v) => (v ? String(v).replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '');

// Redesign course card: real cover, one subject tag, title, one line of facts.
export default function CourseCardV2({ course }) {
  const facts = [
    course.total_lessons ? `${course.total_lessons} lessons` : null,
    course.qualification_type ? String(course.qualification_type).toUpperCase().replace('ALEVEL', 'A-Level') : null,
    course.rating ? `★ ${Number(course.rating).toFixed(1)}` : null,
  ].filter(Boolean).join(' · ');

  return (
    <Card component={Link} to={`${createPageUrl('CourseDetails')}?id=${course.id}`}
      sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', color: 'text.primary', textDecoration: 'none',
        transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 14px rgba(0,0,0,0.12)' } }}>
      <Box component="img" src={course.thumbnail || FALLBACK_COVER} alt="" loading="lazy"
        sx={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', display: 'block', bgcolor: 'action.hover' }} />
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1 }}>
        {course.category && (
          <Chip label={label(course.category)} size="small"
            sx={{ alignSelf: 'flex-start', bgcolor: 'rgba(79,70,229,0.10)', color: 'primary.main', fontWeight: 700 }} />
        )}
        <Typography component="h3" sx={{ fontWeight: 700, fontSize: '1.0625rem', lineHeight: 1.3 }}>{course.title}</Typography>
        {facts && <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>{facts}</Typography>}
      </Box>
    </Card>
  );
}
