import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardMedia, CardContent, Chip, Box, Typography, Button } from '@mui/material';
import { Star, Clock, Users, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const categoryColors = {
  mathematics: 'bg-blue-500/10 text-blue-600',
  english: 'bg-purple-500/10 text-purple-600',
  biology: 'bg-emerald-500/10 text-emerald-600',
  chemistry: 'bg-amber-500/10 text-amber-600',
  physics: 'bg-indigo-500/10 text-indigo-600',
  history: 'bg-rose-500/10 text-rose-600',
  geography: 'bg-teal-500/10 text-teal-600',
};

const levelColors = {
  beginner: { bgcolor: '#dcfce7', color: '#15803d' },
  intermediate: { bgcolor: '#fef3c7', color: '#a16207' },
  advanced: { bgcolor: '#fee2e2', color: '#b91c1c' },
};

export default function CourseCard({ course }) {
  const getCategoryColor = (category) => {
    const colors = {
      mathematics: 'from-blue-600 to-blue-400',
      english: 'from-purple-600 to-purple-400',
      biology: 'from-emerald-600 to-emerald-400',
      chemistry: 'from-amber-600 to-amber-400',
      physics: 'from-indigo-600 to-indigo-400',
      history: 'from-rose-600 to-rose-400',
      geography: 'from-teal-600 to-teal-400',
    };
    return colors[category] || 'from-gray-600 to-gray-400';
  };

  const getCategoryBgColor = (category) => {
    const colors = {
      mathematics: 'bg-blue-500/10 text-blue-600',
      english: 'bg-purple-500/10 text-purple-600',
      biology: 'bg-emerald-500/10 text-emerald-600',
      chemistry: 'bg-amber-500/10 text-amber-600',
      physics: 'bg-indigo-500/10 text-indigo-600',
      history: 'bg-rose-500/10 text-rose-600',
      geography: 'bg-teal-500/10 text-teal-600',
    };
    return colors[category] || 'bg-gray-100 text-gray-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
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
              src={course.thumbnail || (course.category === 'biology' ? 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69418fc30769c7d951368216/0071eb5e0_Biology.jpg' : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80')}
              alt={course.title}
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
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mb: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" fontWeight={700}>{course.duration_hours || 0}h</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                  <Clock size={12} color="#6b7280" />
                  <Typography variant="caption" color="text.secondary">Duration</Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" fontWeight={700}>{course.lesson_count || course.total_lessons || 0}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                  <BookOpen size={12} color="#6b7280" />
                  <Typography variant="caption" color="text.secondary">Lessons</Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                {course.rating ? (
                  <>
                    <Typography variant="body2" fontWeight={700}>{course.rating.toFixed(1)}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <Typography variant="caption" sx={{ color: '#f59e0b' }}>Rating</Typography>
                    </Box>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" fontWeight={700} color="text.disabled">N/A</Typography>
                    <Typography variant="caption" color="text.secondary">No Rating</Typography>
                  </>
                )}
              </Box>
            </Box>
            
            {/* Enrollment count */}
            {course.enrolled_count > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2, py: 1, bgcolor: '#f9fafb', borderRadius: 2 }}>
                <Users size={16} color="#4f46e5" />
                <Typography variant="body2" fontWeight={600}>{course.enrolled_count.toLocaleString()}</Typography>
                <Typography variant="body2" color="text.secondary">students enrolled</Typography>
              </Box>
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