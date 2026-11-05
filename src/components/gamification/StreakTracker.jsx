import React from 'react';
import { Card, Box, Typography, Stack } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import BoltIcon from '@mui/icons-material/Bolt';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { motion } from 'framer-motion';

export default function StreakTracker({ streakDays = 0, lastActivityDate }) {
  const isActiveToday = lastActivityDate === new Date().toISOString().split('T')[0];

  const getStreakMessage = () => {
    if (streakDays === 0) return "Start your streak today!";
    if (streakDays < 7) return "Keep it going!";
    if (streakDays < 30) return "You're on fire! 🔥";
    if (streakDays < 100) return "Incredible dedication!";
    return "Legendary streak! 🏆";
  };

  const getStreakColor = () => {
    if (streakDays === 0) return '#9ca3af';
    if (streakDays < 7) return '#f97316';
    if (streakDays < 30) return '#ea580c';
    return '#ef4444';
  };

  const milestones = [7, 14, 30, 60, 100, 365];
  const nextMilestone = milestones.find(m => m > streakDays) || 365;
  const flameColor = getStreakColor();

  return (
    <Card sx={{ p: 3, background: 'linear-gradient(to bottom right, #ffedd5, #fee2e2)', border: 1, borderColor: '#fed7aa' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>Learning Streak</Typography>
        <LocalFireDepartmentIcon sx={{ fontSize: 24, color: flameColor }} />
      </Stack>

      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <motion.div
          key={streakDays}
        >
          <Stack direction="row" spacing={1} alignItems="baseline" justifyContent="center">
            <Typography sx={{ fontSize: '3rem', fontWeight: 700, color: flameColor, lineHeight: 1 }}>
              {streakDays}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {streakDays === 1 ? 'day' : 'days'}
            </Typography>
          </Stack>
        </motion.div>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{getStreakMessage()}</Typography>
      </Box>

      {!isActiveToday && streakDays > 0 && (
        <Box sx={{ mb: 2, p: 1.5, bgcolor: '#fef9c3', border: 1, borderColor: '#fde68a', borderRadius: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <BoltIcon sx={{ fontSize: 16, color: '#854d0e' }} />
            <Typography variant="body2" sx={{ color: '#854d0e' }}>
              Complete a lesson today to maintain your streak!
            </Typography>
          </Stack>
        </Box>
      )}

      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary">Next milestone</Typography>
          <Typography variant="body2" fontWeight={600}>{nextMilestone} days</Typography>
        </Stack>
        <Box sx={{ width: '100%', bgcolor: '#e5e7eb', borderRadius: 50, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(streakDays / nextMilestone) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <Box sx={{ height: 8, background: 'linear-gradient(to right, #f97316, #ef4444)', borderRadius: 50 }} />
          </motion.div>
        </Box>
      </Box>

      <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
        {[7, 30, 100].map(milestone => {
          const reached = streakDays >= milestone;
          return (
            <Box
              key={milestone}
              sx={{
                p: 1,
                borderRadius: 2,
                textAlign: 'center',
                transition: 'all 0.2s',
                ...(reached
                  ? { bgcolor: '#f97316', color: 'white' }
                  : { bgcolor: 'background.paper', border: 1, borderColor: 'divider', color: '#9ca3af' })
              }}
            >
              <Typography variant="caption" fontWeight={600} sx={{ display: 'block' }}>{milestone}</Typography>
              {reached && <EmojiEventsIcon sx={{ fontSize: 12, mt: 0.5 }} />}
            </Box>
          );
        })}
      </Box>
    </Card>
  );
}