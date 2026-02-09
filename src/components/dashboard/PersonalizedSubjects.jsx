import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Card, Box, Typography, Button, Chip } from '@mui/material';
import { ArrowRight, BookOpen } from 'lucide-react';

const SUBJECT_COLORS = {
  mathematics: { bg: 'from-blue-500 to-blue-600', icon: '📐', color: '#3b82f6' },
  english: { bg: 'from-red-500 to-red-600', icon: '📚', color: '#ef4444' },
  biology: { bg: 'from-green-500 to-green-600', icon: '🔬', color: '#22c55e' },
  chemistry: { bg: 'from-purple-500 to-purple-600', icon: '⚗️', color: '#a855f7' },
  physics: { bg: 'from-yellow-500 to-yellow-600', icon: '⚡', color: '#eab308' },
  science: { bg: 'from-teal-500 to-teal-600', icon: '🧪', color: '#14b8a6' },
  history: { bg: 'from-amber-500 to-amber-600', icon: '📖', color: '#f59e0b' },
  geography: { bg: 'from-cyan-500 to-cyan-600', icon: '🌍', color: '#06b6d4' }
};

export default function PersonalizedSubjects({ user }) {
  const { data: enrollments = [] } = useQuery({
    queryKey: ['user-enrollments-subjects', user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ created_by: user?.email }),
    enabled: !!user?.email
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-subjects'],
    queryFn: () => base44.entities.Course.list('-created_date', 100),
  });

  // Get enrolled course categories
  const enrolledCourses = enrollments
    .map(e => courses.find(c => c.id === e.course_id))
    .filter(Boolean);

  const enrolledSubjects = [...new Set(enrolledCourses.map(c => c.category))];
  
  const subjectData = enrolledSubjects
    .filter(subject => SUBJECT_COLORS[subject])
    .map(subject => {
      const subjectCourses = enrolledCourses.filter(c => c.category === subject);
      const completedCount = enrollments
        .filter(e => subjectCourses.some(c => c.id === e.course_id) && e.is_completed)
        .length;
      const totalCount = subjectCourses.length;
      const avgProgress = subjectCourses.length > 0
        ? Math.round(
            enrollments
              .filter(e => subjectCourses.some(c => c.id === e.course_id))
              .reduce((sum, e) => sum + (e.progress_percent || 0), 0) / totalCount
          )
        : 0;

      return {
        subject,
        label: subject.charAt(0).toUpperCase() + subject.slice(1),
        courses: subjectCourses,
        completedCount,
        totalCount,
        avgProgress,
        ...SUBJECT_COLORS[subject]
      };
    });

  if (subjectData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Card sx={{ p: 4, borderRadius: 4, boxShadow: 3, border: 1, borderColor: 'divider', textAlign: 'center' }}>
          <Box sx={{ width: 64, height: 64, bgcolor: 'action.hover', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <BookOpen size={32} color="#9ca3af" />
          </Box>
          <Typography variant="h6" sx={{ mb: 1 }}>No Subjects Yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Enroll in courses to start learning</Typography>
          <Link to={createPageUrl('Explore')} style={{ textDecoration: 'none' }}>
            <Button 
              size="small"
              variant="contained"
              endIcon={<ArrowRight size={16} />}
              sx={{ borderRadius: 50 }}
            >
              Browse Courses
            </Button>
          </Link>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <Card sx={{ p: 4, borderRadius: 4, boxShadow: 3, border: 1, borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Your Subjects</Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2.5 }}>
          {subjectData.map((subject, idx) => (
            <motion.div
              key={subject.subject}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
            >
              <Link to={createPageUrl('Explore') + `?category=${subject.subject}`} style={{ textDecoration: 'none' }}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: `linear-gradient(to bottom right, ${subject.color}, ${subject.color}22)`,
                    border: 1,
                    borderColor: 'divider',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: 4,
                      borderColor: subject.color
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ fontSize: '2rem' }}>{subject.icon}</Box>
                    <Chip
                      label={`${subject.completedCount}/${subject.totalCount}`}
                      size="small"
                      sx={{
                        bgcolor: subject.color,
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.75rem'
                      }}
                    />
                  </Box>

                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                    {subject.label}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        height: 6,
                        borderRadius: 10,
                        bgcolor: 'rgba(0,0,0,0.1)',
                        overflow: 'hidden',
                        flex: 1
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          width: `${subject.avgProgress}%`,
                          bgcolor: subject.color,
                          transition: 'width 0.5s ease'
                        }}
                      />
                    </Box>
                    <Typography variant="body2" fontWeight={600} sx={{ minWidth: '40px' }}>
                      {subject.avgProgress}%
                    </Typography>
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    {subject.courses.length} course{subject.courses.length !== 1 ? 's' : ''} enrolled
                  </Typography>
                </Box>
              </Link>
            </motion.div>
          ))}
        </Box>
      </Card>
    </motion.div>
  );
}