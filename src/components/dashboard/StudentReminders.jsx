import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, Box, Typography } from '@mui/material';
import { Clock, AlertCircle, BookOpen, Zap } from 'lucide-react';

export default function StudentReminders({ user }) {
  const { data: reminders = [] } = useQuery({
    queryKey: ['student-reminders', user?.email],
    queryFn: () => base44.entities.ReminderConfig.filter({ created_by: user?.email, is_active: true }),
    enabled: !!user?.email
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['student-enrollments', user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ created_by: user?.email }),
    enabled: !!user?.email
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['student-courses-reminders', user?.email],
    queryFn: async () => {
      if (enrollments.length === 0) return [];
      const courseIds = [...new Set(enrollments.map(e => e.course_id))];
      const allCourses = await base44.entities.Course.list();
      return allCourses.filter(c => courseIds.includes(c.id));
    },
    enabled: enrollments.length > 0
  });

  // Create personalized reminders based on enrollments and progress
  const personalizedReminders = [
    ...reminders,
    ...enrollments
      .filter(e => !e.is_completed && e.progress_percent < 100)
      .slice(0, 3)
      .map((enrollment, idx) => {
        const course = courses.find(c => c.id === enrollment.course_id);
        return {
          id: `enrollment-${enrollment.id}`,
          type: 'course_progress',
          title: `Continue ${course?.title || 'your course'}`,
          description: `You're ${enrollment.progress_percent || 0}% through this course`,
          priority: enrollment.progress_percent < 30 ? 'high' : 'medium',
          icon: 'BookOpen'
        };
      })
  ];

  if (personalizedReminders.length === 0) {
    return (
      <motion.div
      >
        <Card sx={{ p: 4, borderRadius: 4, boxShadow: 3, border: 1, borderColor: 'divider', textAlign: 'center' }}>
          <Box sx={{ width: 64, height: 64, bgcolor: 'action.hover', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <Clock size={32} color="#9ca3af" />
          </Box>
          <Typography variant="h6" sx={{ mb: 1 }}>No reminders</Typography>
          <Typography variant="body2" color="text.secondary">You're all caught up!</Typography>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
    >
      <Card sx={{ p: 4, borderRadius: 4, boxShadow: 3, border: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box sx={{ width: 40, height: 40, bgcolor: '#4f46e5', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 3 }}>
            <AlertCircle size={20} color="white" />
          </Box>
          <Typography variant="h6" fontWeight={600}>Your Reminders</Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {personalizedReminders.slice(0, 5).map((reminder, index) => (
            <motion.div
              key={reminder.id}
            >
              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: 1,
                  borderColor: 'divider',
                  bgcolor: reminder.priority === 'high' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(59, 130, 246, 0.05)',
                  display: 'flex',
                  gap: 2,
                  alignItems: 'flex-start',
                  '&:hover': { bgcolor: reminder.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)' },
                  transition: 'all 0.2s'
                }}
              >
                <Box sx={{ mt: 0.5 }}>
                  {reminder.type === 'course_progress' ? (
                    <BookOpen size={20} color={reminder.priority === 'high' ? '#ef4444' : '#3b82f6'} />
                  ) : (
                    <Zap size={20} color={reminder.priority === 'high' ? '#ef4444' : '#3b82f6'} />
                  )}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" fontWeight={600}>{reminder.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{reminder.description}</Typography>
                </Box>
                {reminder.priority === 'high' && (
                  <Box sx={{ px: 2, py: 0.5, bgcolor: '#ef4444', borderRadius: 2, mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 700 }}>URGENT</Typography>
                  </Box>
                )}
              </Box>
            </motion.div>
          ))}
        </Box>
      </Card>
    </motion.div>
  );
}