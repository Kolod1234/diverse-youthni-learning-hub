import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, Box, Button, Typography, LinearProgress, Stack } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function CourseProgressWidget({ enrollments, courses }) {
  const inProgressEnrollments = enrollments.filter(e => !e.is_completed && (e.progress_percent || 0) > 0);
  const topCourse = inProgressEnrollments[0];
  const course = courses.find(c => c.id === topCourse?.course_id);

  const { data: courseLessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ['lessons', course?.id],
    queryFn: () => base44.entities.Lesson.filter({ course_id: course.id }, 'order', 100),
    enabled: !!course,
  });

  if (inProgressEnrollments.length === 0 || !course) return null;

  const firstLesson = courseLessons[0];
  const lessonId = topCourse.current_lesson_id || firstLesson?.id;
  const progressPercent = Math.round(topCourse.progress_percent || 0);
  const lessonsLeft = (course.total_lessons || 0) - (topCourse.completed_lessons?.length || 0);

  return (
    <motion.div


    >
      <Card sx={{ p: 3, border: 0, boxShadow: 1, background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)', borderRadius: 3 }}>
        <Stack direction="row" alignItems="flex-start" spacing={1.5} sx={{ mb: 2 }}>
          <Box sx={{ width: 48, height: 48, bgcolor: '#4f46e5', borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <TrendingUpIcon sx={{ fontSize: 24, color: 'white' }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'text.primary', mb: 0.5 }}>
              Continue Your Progress
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              You're {progressPercent}% through {course.title}
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'text.secondary' }}>
              <GpsFixedIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption">{lessonsLeft} lessons remaining</Typography>
            </Stack>
            <Typography variant="caption" fontWeight={600} sx={{ color: '#4f46e5' }}>
              {progressPercent}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{ height: 12, borderRadius: 6 }}
          />
        </Box>

        {lessonsLoading ? (
          <Button fullWidth disabled startIcon={<PlayArrowIcon />}>
            Loading...
          </Button>
        ) : lessonId ? (
          <Button
            component={Link}
            to={createPageUrl('LessonPlayer') + `?course=${course.id}&lesson=${lessonId}`}
            fullWidth
            variant="contained"
            startIcon={<PlayArrowIcon />}
            sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' } }}
          >
            Continue Learning
          </Button>
        ) : (
          <Button
            component={Link}
            to={createPageUrl('CourseDetails') + `?id=${course.id}`}
            fullWidth
            variant="contained"
            sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' } }}
          >
            View Course
          </Button>
        )}
      </Card>
    </motion.div>
  );
}