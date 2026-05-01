import React from 'react';
import { motion } from 'framer-motion';
import { Box, Chip, Stack, Typography, LinearProgress } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import BoltIcon from '@mui/icons-material/Bolt';

export default function PointsDisplay({ points, level, compact = false }) {
  const pointsForNextLevel = level * 100;
  const progressToNextLevel = ((points % 100) / pointsForNextLevel) * 100;

  if (compact) {
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip
          icon={<BoltIcon sx={{ fontSize: '14px !important', color: 'white !important' }} />}
          label={`${points} pts`}
          size="small"
          sx={{
            background: 'linear-gradient(to right, #eab308, #f97316)',
            color: 'white',
            fontWeight: 600,
            '& .MuiChip-label': { color: 'white' },
          }}
        />
        <Chip
          icon={<EmojiEventsIcon sx={{ fontSize: '14px !important', color: 'white !important' }} />}
          label={`Level ${level}`}
          size="small"
          sx={{
            background: 'linear-gradient(to right, #a855f7, #6366f1)',
            color: 'white',
            fontWeight: 600,
            '& .MuiChip-label': { color: 'white' },
          }}
        />
      </Stack>
    );
  }

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)',
        borderRadius: 3,
        p: 2,
        border: 1,
        borderColor: '#c7d2fe',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #facc15, #f97316)',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <EmojiEventsIcon sx={{ fontSize: 20, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Level {level}
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ color: 'text.primary' }}>
              {points} pts
            </Typography>
          </Box>
        </Stack>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            Next Level
          </Typography>
          <Typography variant="body2" fontWeight={600} sx={{ color: '#4f46e5' }}>
            {pointsForNextLevel - (points % 100)} pts
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ position: 'relative' }}>
        <LinearProgress
          variant="determinate"
          value={progressToNextLevel}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: 'white',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(to right, #6366f1, #a855f7)',
              borderRadius: 4,
            },
          }}
        />
      </Box>
      <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled', mt: 0.5, textAlign: 'center' }}>
        {progressToNextLevel.toFixed(0)}% to Level {level + 1}
      </Typography>
    </Box>
  );
}