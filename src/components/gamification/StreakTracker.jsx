import React from 'react';
import { Card, Box, Stack, Typography, LinearProgress } from '@mui/material';
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
  const streakColor = getStreakColor();

  return (
    <Card
      sx={{
        p: 3,
        background: 'linear-gradient(135deg, #fff7ed, #fef2f2)',
        border: 1,
        borderColor: '#fed7aa',
        boxShadow: 1,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'text.primary' }}>
          Learning Streak
        </Typography>
        <LocalFireDepartmentIcon sx={{ fontSize: 24, color: streakColor }} />
      </Stack>

      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <motion.div
          key={streakDays}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8 }}
        >
          <Typography component="span" sx={{ fontSize: '3rem', fontWeight: 700, color: streakColor, lineHeight: 1 }}>
            {streakDays}
          </Typography>
          <Typography component="span" variant="body1" sx={{ color: 'text.secondary' }}>
            {streakDays === 1 ? 'day' : 'days'}
          </Typography>
        </motion.div>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          {getStreakMessage()}
        </Typography>
      </Box>

      {!isActiveToday && streakDays > 0 && (
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            bgcolor: '#fefce8',
            border: 1,
            borderColor: '#fde68a',
            borderRadius: 2,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <BoltIcon sx={{ fontSize: 16, color: '#a16207' }} />
            <Typography variant="body2" sx={{ color: '#a16207' }}>
              Complete a lesson today to maintain your streak!
            </Typography>
          </Stack>
        </Box>
      )}

      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Next milestone</Typography>
          <Typography variant="body2" fontWeight={600}>{nextMilestone} days</Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={Math.min((streakDays / nextMilestone) * 100, 100)}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: '#e5e7eb',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(to right, #f97316, #ef4444)',
              borderRadius: 4,
            },
          }}
        />
      </Stack>

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
                bgcolor: reached ? '#f97316' : 'white',
                color: reached ? 'white' : 'text.disabled',
                border: reached ? 0 : 1,
                borderColor: 'divider',
                transition: 'all 0.2s',
              }}
            >
              <Typography variant="caption" fontWeight={600}>{milestone}</Typography>
              {reached && <EmojiEventsIcon sx={{ fontSize: 12, display: 'block', mx: 'auto', mt: 0.5 }} />}
            </Box>
          );
        })}
      </Box>
    </Card>
  );
}