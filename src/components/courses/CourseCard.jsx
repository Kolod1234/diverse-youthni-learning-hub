import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardMedia, CardContent, Chip, Box, Typography, Button, Stack, Divider } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { motion } from 'framer-motion';

const levelColors = {
  beginner: { bgcolor: '#dcfce7', color: '#15803d' },
  intermediate: { bgcolor: '#fef3c7', color: '#a16207' },
  advanced: { bgcolor: '#fee2e2', color: '#b91c1c' },
};

const getCategoryBgColor = (category) => {
  const colors = {
    mathematics: { bgcolor: 'rgba(37,99,235,0.1)', color: '#2563eb' },
    english: { bgcolor: 'rgba(147,51,234,0.1)', color: '#9333ea' },
    biology: { bgcolor: 'rgba(5,150,105,0.1)', color: '#059669' },
    chemistry: { bgcolor: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
    physics: { bgcolor: 'rgba(79,70,229,0.1)', color: '#4f46e5' },
    history: { bgcolor: 'rgba(244,63,94,0.1)', color: '#f43f5e' },
    geography: { bgcolor: 'rgba(20,184,166,0.1)', color: '#14b8a6' },
  };
  return colors[category] || { bgcolor: '#f3f4f6', color: '#4b5563' };
};

export default function CourseCard({ course, index = 0 }) {
  // ✅ PERF: cap stagger so the 50th card doesn't wait 5s. Also keep the
  // animation short so cards become visible almost immediately.
  const animDelay = Math.min(index, 6) * 0.03;
  // First few visible cards load eagerly; the rest defer until they scroll into view.
  const isAboveFold = index < 6;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: animDelay }}
    >
      <Link to={createPageUrl('CourseDetails') + `?id=${course.id}`} style={{ textDecoration: 'none' }}>
        <Card 
          sx={{ 
            borderRadius: 4, 
            overflow: 'hidden', 
            boxShadow: 2, 
            border: 2, 
            borderColor: 'transparent',
            position: 'relative',
            height: '100%',
            '&:hover': { 
              boxShadow: 6,
              borderColor: 'primary.main',
              '& img': { transform: 'scale(1.1)' }
            },
            transition: 'all 0.5s'
          }}
        >
          {/* Image Section */}
          <CardMedia
            component="div"
            sx={{ position: 'relative', paddingTop: '56.25%', background: 'linear-gradient(to bottom right, #e5e7eb, #d1d5db)' }}
          >
            <img
              src={course.thumbnail || (course.category === 'biology' ? 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69418fc30769c7d951368216/0071eb5e0_Biology.jpg' : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=640&q=75')}
              alt={course.title}
              loading={isAboveFold ? 'eager' : 'lazy'}
              decoding="async"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s' }}
            />
            <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent, transparent)' }} />
            
            {/* Top-left badges */}
            <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {course.is_featured && (
                <Chip 
                  label="⭐ Featured" 
                  sx={{ 
                    background: 'linear-gradient(to right, #f59e0b, #f97316)', 
                    color: 'white', 
                    fontWeight: 700, 
                    fontSize: '0.75rem',
                    boxShadow: 3 
                  }} 
                />
              )}
              <Chip 
                label={course.category} 
                sx={{ 
                  ...getCategoryBgColor(course.category), 
                  border: 0, 
                  textTransform: 'capitalize', 
                  fontWeight: 600, 
                  fontSize: '0.75rem',
                  boxShadow: 2 
                }} 
              />
            </Box>
            
            {/* Top-right badges */}
            <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
              <Chip 
                label={course.level} 
                sx={{ 
                  bgcolor: levelColors[course.level]?.bgcolor || levelColors.beginner.bgcolor,
                  color: levelColors[course.level]?.color || levelColors.beginner.color,
                  border: 0, 
                  textTransform: 'capitalize', 
                  fontWeight: 600,
                  boxShadow: 2 
                }} 
              />
              {!course.price || course.price === 0 ? (
                <Chip label="Free" sx={{ bgcolor: '#22c55e', color: 'white', fontWeight: 700, fontSize: '0.75rem', boxShadow: 3 }} />
              ) : (
                <Chip label={`£${course.price}`} sx={{ bgcolor: '#4f46e5', color: 'white', fontWeight: 700, fontSize: '0.75rem', boxShadow: 3 }} />
              )}
            </Box>
          </CardMedia>
          
          {/* Content Section */}
          <CardContent sx={{ p: 3, position: 'relative', zIndex: 10 }}>
            {/* Title */}
            <Typography 
              variant="h6" 
              fontWeight={700} 
              sx={{ 
                mb: 1, 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                '&:hover': { color: 'primary.main' },
                transition: 'color 0.3s'
              }}
            >
              {course.title}
            </Typography>
            
            {/* Description */}
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {course.description}
            </Typography>
            

            {/* Stats Row 1 */}
            <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} sx={{ mb: 2 }}>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="body2" fontWeight={700}>{course.duration_hours || 0}h</Typography>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                  <AccessTimeIcon sx={{ fontSize: 12, color: '#6b7280' }} />
                  <Typography variant="caption" color="text.secondary">Duration</Typography>
                </Stack>
              </Box>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="body2" fontWeight={700}>{course.lesson_count || course.total_lessons || 0}</Typography>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                  <MenuBookIcon sx={{ fontSize: 12, color: '#6b7280' }} />
                  <Typography variant="caption" color="text.secondary">Lessons</Typography>
                </Stack>
              </Box>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                {course.rating ? (
                  <>
                    <Typography variant="body2" fontWeight={700}>{course.rating.toFixed(1)}</Typography>
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                      <StarIcon sx={{ fontSize: 12, color: '#f59e0b' }} />
                      <Typography variant="caption" sx={{ color: '#f59e0b' }}>Rating</Typography>
                    </Stack>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" fontWeight={700} color="text.disabled">N/A</Typography>
                    <Typography variant="caption" color="text.secondary">No Rating</Typography>
                  </>
                )}
              </Box>
            </Stack>
            
            {/* Enrollment count */}
            {course.enrolled_count > 0 && (
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 2, py: 1, bgcolor: '#f9fafb', borderRadius: 2 }}>
                <GroupIcon sx={{ fontSize: 16, color: '#4f46e5' }} />
                <Typography variant="body2" fontWeight={600}>{course.enrolled_count.toLocaleString()}</Typography>
                <Typography variant="body2" color="text.secondary">students enrolled</Typography>
              </Stack>
            )}
            
            {/* CTA Button */}
            <Button
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
                  boxShadow: 3,
                  transform: 'scale(1.02)'
                },
                transition: 'all 0.3s'
              }}
            >
              View Course →
            </Button>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}