import React from 'react';
import { Card, Box, Typography } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import StarIcon from '@mui/icons-material/Star';
import BoltIcon from '@mui/icons-material/Bolt';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const iconMap = {
  trophy: EmojiEventsIcon,
  award: WorkspacePremiumIcon,
  star: StarIcon,
  zap: BoltIcon,
  target: GpsFixedIcon,
  flame: LocalFireDepartmentIcon,
  crown: WorkspacePremiumIcon,
  medal: MilitaryTechIcon,
};

const gradientMap = {
  trophy: 'linear-gradient(135deg, #fbbf24, #eab308)',
  award:  'linear-gradient(135deg, #c084fc, #8b5cf6)',
  star:   'linear-gradient(135deg, #f472b6, #f43f5e)',
  zap:    'linear-gradient(135deg, #60a5fa, #06b6d4)',
  target: 'linear-gradient(135deg, #34d399, #14b8a6)',
  flame:  'linear-gradient(135deg, #fb923c, #ef4444)',
  crown:  'linear-gradient(135deg, #f59e0b, #ea580c)',
  medal:  'linear-gradient(135deg, #818cf8, #a855f7)',
};

export default function AchievementBadge({ achievement, index = 0 }) {
  const Icon = iconMap[achievement.icon] || EmojiEventsIcon;
  const gradient = gradientMap[achievement.icon] || gradientMap.trophy;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.05, y: -5 }}
    >
      <Card sx={{ p: 2, textAlign: 'center', border: 0, boxShadow: 1, '&:hover': { boxShadow: 4 }, transition: 'box-shadow 0.3s', bgcolor: 'background.paper', borderRadius: 3 }}>
        <Box sx={{ width: 64, height: 64, mx: 'auto', borderRadius: 3, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5, boxShadow: 3 }}>
          <Icon sx={{ fontSize: 32, color: 'white' }} />
        </Box>
        <Typography variant="subtitle2" fontWeight={600} sx={{ color: 'text.primary', mb: 0.5 }}>
          {achievement.name}
        </Typography>
        <Typography variant="caption" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: 'text.secondary', mb: 1 }}>
          {achievement.description}
        </Typography>
        {achievement.earned_date && (
          <Typography variant="caption" sx={{ display: 'block', color: 'primary.main', fontWeight: 500 }}>
            {format(new Date(achievement.earned_date), 'MMM d, yyyy')}
          </Typography>
        )}
      </Card>
    </motion.div>
  );
}