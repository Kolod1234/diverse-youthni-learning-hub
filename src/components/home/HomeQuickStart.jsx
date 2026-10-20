import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Card, Container, Typography } from '@mui/material';
import CourseCardV2 from '@/components/courses/CourseCardV2';
import { createPageUrl } from '@/utils';

// Redesign: stat cards overlapping the hero, popular courses, how it works.
export default function HomeQuickStart({ courses = [] }) {
  const subjects = new Set(courses.map(c => c.category).filter(Boolean)).size;
  const popular = [...courses].sort((a, b) => (b.enrolled_count || 0) - (a.enrolled_count || 0)).slice(0, 4);
  const stats = [
    { value: courses.length || '—', label: 'Courses' },
    { value: subjects || '—', label: 'Subjects' },
    { value: 'Free', label: 'For every learner' },
  ];
  const steps = [
    { title: 'Pick a course', text: 'Maths, sciences, English and more, aligned to CCEA.' },
    { title: 'Learn in short lessons', text: 'Slides, worked examples and quick checks.' },
    { title: 'Track your progress', text: "See what you've finished and what's next." },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: -5, md: -6 }, mb: 6, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>
        {stats.map(s => (
          <Card key={s.label} sx={{ p: 2.5 }}>
            <Typography sx={{ fontSize: '1.875rem', fontWeight: 700 }}>{s.value}</Typography>
            <Typography color="text.secondary">{s.label}</Typography>
          </Card>
        ))}
      </Box>

      {popular.length > 0 && (
        <Box component="section" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 1 }}>
            <Typography component="h2" sx={{ fontSize: '1.625rem', fontWeight: 700 }}>Popular courses</Typography>
            <Button component={Link} to={createPageUrl('Explore')} variant="text">See all courses</Button>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: 2 }}>
            {popular.map(course => <CourseCardV2 key={course.id} course={course} />)}
          </Box>
        </Box>
      )}

      <Card component="section" sx={{ p: { xs: 3, md: 4 } }}>
        <Typography component="h2" sx={{ fontSize: '1.625rem', fontWeight: 700, mb: 2.5 }}>How it works</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 3 }}>
          {steps.map((s, i) => (
            <Box key={s.title}>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'primary.main' }}>{i + 1}</Typography>
              <Typography sx={{ fontWeight: 700 }}>{s.title}</Typography>
              <Typography color="text.secondary">{s.text}</Typography>
            </Box>
          ))}
        </Box>
      </Card>

    </Container>
  );
}
