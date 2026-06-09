import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, Chip, Button, Box, Typography, Divider, Stack } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { motion } from 'framer-motion';
import RequestToTeachButton from '@/components/tutor/RequestToTeachButton';

const levelColors = {
  beginner: { bgcolor: '#dcfce7', color: '#15803d' },
  intermediate: { bgcolor: '#fef9c3', color: '#a16207' },
  advanced: { bgcolor: '#fee2e2', color: '#b91c1c' },
};

const getCategoryBgColor = (category) => {
  const colors = {
    mathematics: { bgcolor: '#dbeafe', color: '#1d4ed8' },
    english: { bgcolor: '#f3e8ff', color: '#7e22ce' },
    biology: { bgcolor: '#d1fae5', color: '#047857' },
    chemistry: { bgcolor: '#fef3c7', color: '#b45309' },
    physics: { bgcolor: '#e0e7ff', color: '#4338ca' },
    history: { bgcolor: '#ffe4e6', color: '#be123c' },
    geography: { bgcolor: '#ccfbf1', color: '#0f766e' },
  };
  return colors[category] || { bgcolor: '#f3f4f6', color: '#4b5563' };
};

export default function CourseCard({ course, index = 0, user = null }) {
  const animDelay = Math.min(index, 6) * 0.03;
  const isAboveFold = index < 6;

  const categoryStyle = getCategoryBgColor(course.category);
  const levelStyle = levelColors[course.level] || levelColors.beginner;

  // Tutors (not admins acting as tutors) see the "Request to Teach" action
  // alongside "View Course". Learners and admins see the original single CTA.
  const isTutor = user?.is_tutor === true && user?.role !== 'admin';

  const courseHref = createPageUrl('CourseDetails') + `?id=${course.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: animDelay }}
      style={{ height: '100%' }}
    >
      <Card
        sx={{
          borderRadius: 6,
          overflow: 'hidden',
          boxShadow: 3,
          border: '2px solid transparent',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.5s',
          '&:hover': {
            boxShadow: 8,
            borderColor: 'primary.main',
            '& .course-card-img': { transform: 'scale(1.1)' },
          },
        }}
      >
        {/* Image Section — clickable link to course details */}
        <Link to={courseHref} style={{ textDecoration: 'none', display: 'block' }}>
          <Box sx={{ position: 'relative', aspectRatio: '16/9', background: 'linear-gradient(to bottom right, #e5e7eb, #d1d5db)', overflow: 'hidden' }}>
            <Box
              component="img"
              className="course-card-img"
              src={course.thumbnail || (course.category === 'biology' ? 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69418fc30769c7d951368216/0071eb5e0_Biology.jpg' : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=640&q=75')}
              alt={course.title}
              loading={isAboveFold ? 'eager' : 'lazy'}
              sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s' }}
            />
            <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent, transparent)' }} />

            {/* Top-left badges */}
            <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {course.is_featured && (
                <Chip
                  label="⭐ Featured"
                  size="small"
                  sx={{ background: 'linear-gradient(to right, #f59e0b, #f97316)', color: 'white', fontWeight: 700, fontSize: '0.7rem', boxShadow: 2, border: 0 }}
                />
              )}
              <Chip
                label={course.category}
                size="small"
                sx={{ ...categoryStyle, textTransform: 'capitalize', fontWeight: 600, fontSize: '0.7rem', boxShadow: 1, border: 0 }}
              />
            </Box>

            {/* Top-right badges */}
            <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
              <Chip
                label={course.level}
                size="small"
                sx={{ ...levelStyle, textTransform: 'capitalize', fontWeight: 600, boxShadow: 1, border: 0 }}
              />
              {!course.price || course.price === 0 ? (
                <Chip label="Free" size="small" sx={{ bgcolor: '#22c55e', color: 'white', fontWeight: 700, fontSize: '0.7rem', boxShadow: 2, border: 0 }} />
              ) : (
                <Chip label={`£${course.price}`} size="small" sx={{ bgcolor: '#4f46e5', color: 'white', fontWeight: 700, fontSize: '0.7rem', boxShadow: 2, border: 0 }} />
              )}
            </Box>
          </Box>
        </Link>

        {/* Content Section */}
        <CardContent sx={{ p: 3, position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Link to={courseHref} style={{ textDecoration: 'none' }}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  mb: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  color: 'text.primary',
                  transition: 'color 0.2s',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                {course.title}
              </Typography>
            </Link>

            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {course.description}
            </Typography>

            {/* Stats Row */}
            <Box sx={{ display: 'flex', mb: 2 }}>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="body2" fontWeight={700}>{course.duration_hours || 0}h</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: 'text.secondary' }}>
                  <AccessTimeIcon sx={{ fontSize: 12 }} />
                  <Typography variant="caption">Duration</Typography>
                </Box>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="body2" fontWeight={700}>{course.lesson_count || course.total_lessons || 0}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: 'text.secondary' }}>
                  <MenuBookIcon sx={{ fontSize: 12 }} />
                  <Typography variant="caption">Lessons</Typography>
                </Box>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                {course.rating ? (
                  <>
                    <Typography variant="body2" fontWeight={700}>{course.rating.toFixed(1)}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: '#f59e0b' }}>
                      <StarIcon sx={{ fontSize: 12 }} />
                      <Typography variant="caption">Rating</Typography>
                    </Box>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" fontWeight={700} sx={{ color: 'text.disabled' }}>N/A</Typography>
                    <Typography variant="caption" color="text.secondary">No Rating</Typography>
                  </>
                )}
              </Box>
            </Box>

            {/* Enrollment count */}
            {course.enrolled_count > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2, py: 1, bgcolor: 'action.hover', borderRadius: 3 }}>
                <PeopleIcon sx={{ fontSize: 16, color: '#4f46e5' }} />
                <Typography variant="body2" fontWeight={600}>{course.enrolled_count.toLocaleString()}</Typography>
                <Typography variant="body2" color="text.secondary">students enrolled</Typography>
              </Box>
            )}

            {/* CTA actions — pinned to bottom so cards align in the grid */}
            <Box sx={{ mt: 'auto' }}>
              <Stack spacing={1}>
                <Button
                  component={Link}
                  to={courseHref}
                  variant="contained"
                  fullWidth
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderRadius: 3,
                    fontWeight: 700,
                    background: 'linear-gradient(to right, #003366, #1d4ed8)',
                    color: 'white',
                    boxShadow: 2,
                    '&:hover': {
                      background: 'linear-gradient(to right, #002244, #1e3a8a)',
                      boxShadow: 4,
                    },
                    transition: 'all 0.3s',
                  }}
                >
                  View Course →
                </Button>
                {isTutor && (
                  <RequestToTeachButton course={course} user={user} />
                )}
              </Stack>
            </Box>
          </CardContent>
      </Card>
    </motion.div>
  );
}