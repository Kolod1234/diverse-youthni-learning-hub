import React from 'react';
import { Box, Card, Typography } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { motion } from 'framer-motion';

export default function StatsOverview({ enrollments, courses, achievements }) {
  const completedCourses = enrollments?.filter(e => e.is_completed).length || 0;
  const totalHoursLearned = enrollments?.reduce((acc, e) => {
    const course = courses?.find(c => c.id === e.course_id);
    return acc + ((course?.duration_hours || 0) * (e.progress_percent || 0) / 100);
  }, 0) || 0;
  const averageProgress = enrollments?.length > 0
    ? enrollments.reduce((acc, e) => acc + (e.progress_percent || 0), 0) / enrollments.length
    : 0;

  const stats = [
    {
      label: 'Courses Enrolled',
      value: enrollments?.length || 0,
      icon: MenuBookIcon,
      iconBg: '#dbeafe',
      iconColor: '#2563eb',
    },
    {
      label: 'Hours Learned',
      value: Math.round(totalHoursLearned),
      icon: AccessTimeIcon,
      iconBg: '#f3e8ff',
      iconColor: '#9333ea',
    },
    {
      label: 'Completed',
      value: completedCourses,
      icon: EmojiEventsIcon,
      iconBg: '#d1fae5',
      iconColor: '#059669',
    },
    {
      label: 'Avg Progress',
      value: `${Math.round(averageProgress)}%`,
      icon: TrendingUpIcon,
      iconBg: '#ffedd5',
      iconColor: '#ea580c',
    },
  ];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
          >
            <Card sx={{ p: 2.5, border: 0, boxShadow: 1, '&:hover': { boxShadow: 3 }, transition: 'box-shadow 0.2s', bgcolor: 'background.paper', borderRadius: 3 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: stat.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <Icon sx={{ fontSize: 24, color: stat.iconColor }} />
              </Box>
              <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary', mb: 0.5 }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {stat.label}
              </Typography>
            </Card>
          </motion.div>
        );
      })}
    </Box>
  );
}