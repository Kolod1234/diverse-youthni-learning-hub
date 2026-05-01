import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, Box, Button, Typography, LinearProgress, Stack } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function ProgressCard({ enrollment, course, index = 0 }) {
  const { data: courseLessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ['lessons', course?.id],
    queryFn: () => base44.entities.Lesson.filter({ course_id: course.id }, 'order', 100),
    enabled: !!course,
  });

  if (!course) return null;

  const firstLesson = courseLessons[0];
  const lessonId = enrollment?.current_lesson_id || firstLesson?.id;
  const progressPercent = Math.round(enrollment.progress_percent || 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card sx={{ overflow: 'hidden', border: 0, boxShadow: 1, '&:hover': { boxShadow: 4 }, transition: 'box-shadow 0.3s', bgcolor: 'background.paper', borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }}>
          <Box sx={{ width: { sm: 192 }, height: { xs: 128, sm: 'auto' }, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
            <Box
              component="img"
              src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'}
              alt={course.title}
              loading="lazy"
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {enrollment.is_completed && (
              <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(16, 185, 129, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
            )}
          </Box>

          <Box sx={{ flex: 1, p: 2.5 }}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight={600} noWrap sx={{ color: 'text.primary', mb: 0.5 }}>
                  {course.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                  {course.instructor}
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight={700} sx={{ color: 'primary.main' }}>
                {progressPercent}%
              </Typography>
            </Stack>

            <Box sx={{ mb: 1.5 }}>
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ color: 'text.secondary' }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: '#10b981' }} />
                  <Typography variant="caption">
                    {(enrollment.completed_lessons?.length || 0)}/{courseLessons.length} lessons
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <AccessTimeIcon sx={{ fontSize: 16 }} />
                  <Typography variant="caption">
                    {Math.round((course.duration_hours || 0) * (1 - progressPercent / 100))}h left
                  </Typography>
                </Stack>
              </Stack>

              {lessonsLoading && !enrollment?.current_lesson_id ? (
                <Button size="small" disabled startIcon={<PlayArrowIcon sx={{ fontSize: 16 }} />} sx={{ borderRadius: 50 }}>
                  Loading...
                </Button>
              ) : lessonId ? (
                <Button
                  component={Link}
                  to={createPageUrl('LessonPlayerClassic') + `?course=${course.id}&lesson=${lessonId}`}
                  size="small"
                  variant="contained"
                  startIcon={<PlayArrowIcon sx={{ fontSize: 16 }} />}
                  sx={{ borderRadius: 50 }}
                >
                  {enrollment.is_completed ? 'Review' : 'Continue'}
                </Button>
              ) : (
                <Button
                  component={Link}
                  to={createPageUrl('CourseDetails') + `?id=${course.id}`}
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: 50 }}
                >
                  View Course
                </Button>
              )}
            </Stack>
          </Box>
        </Stack>
      </Card>
    </motion.div>
  );
}