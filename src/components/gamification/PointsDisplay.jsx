import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Chip, Stack, LinearProgress } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import BoltIcon from '@mui/icons-material/Bolt';

export default function PointsDisplay({ points, level, compact = false }) {
  const pointsForNextLevel = level * 100;
  const progressToNextLevel = ((points % 100) / pointsForNextLevel) * 100;

  if (compact) {
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip
          icon={<BoltIcon sx={{ fontSize: 12, color: 'white !important' }} />}
          label={`${points} pts`}
          sx={{ background: 'linear-gradient(to right, #eab308, #f97316)', color: 'white', fontWeight: 600 }}
        />
        <Chip
          icon={<EmojiEventsIcon sx={{ fontSize: 12, color: 'white !important' }} />}
          label={`Level ${level}`}
          sx={{ background: 'linear-gradient(to right, #a855f7, #6366f1)', color: 'white', fontWeight: 600 }}
        />
      </Stack>
    );
  }

  return (
    <Box sx={{ background: 'linear-gradient(to bottom right, #eef2ff, #f3e8ff)', borderRadius: 3, p: 2, border: 1, borderColor: '#c7d2fe' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 40, height: 40, background: 'linear-gradient(to bottom right, #fbbf24, #f97316)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmojiEventsIcon sx={{ fontSize: 20, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Level {level}</Typography>
            <Typography variant="h5" fontWeight={700}>{points} pts</Typography>
          </Box>
        </Stack>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="caption" color="text.secondary">Next Level</Typography>
          <Typography variant="body2" fontWeight={600} sx={{ color: '#4f46e5' }}>
            {pointsForNextLevel - (points % 100)} pts
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 50, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressToNextLevel}%` }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ height: 8, background: 'linear-gradient(to right, #6366f1, #a855f7)', borderRadius: 50 }} />
        </motion.div>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
        {progressToNextLevel.toFixed(0)}% to Level {level + 1}
      </Typography>
    </Box>
  );
}