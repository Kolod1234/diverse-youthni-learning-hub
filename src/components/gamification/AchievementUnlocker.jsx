import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography, Button, Stack } from '@mui/material';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import BoltIcon from '@mui/icons-material/Bolt';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import confetti from 'canvas-confetti';

const ACHIEVEMENT_CONFIGS = {
  first_lesson:    { icon: AutoAwesomeIcon,         gradient: 'linear-gradient(135deg, #60a5fa, #2563eb)', title: 'First Steps',       description: 'Complete your first lesson' },
  five_lessons:    { icon: StarIcon,                gradient: 'linear-gradient(135deg, #c084fc, #9333ea)', title: 'Rising Star',        description: 'Complete 5 lessons' },
  ten_lessons:     { icon: BoltIcon,                gradient: 'linear-gradient(135deg, #facc15, #ca8a04)', title: 'Power Learner',      description: 'Complete 10 lessons' },
  first_quiz:      { icon: GpsFixedIcon,            gradient: 'linear-gradient(135deg, #4ade80, #16a34a)', title: 'Quiz Master',        description: 'Pass your first quiz' },
  perfect_quiz:    { icon: EmojiEventsIcon,         gradient: 'linear-gradient(135deg, #fcd34d, #f59e0b)', title: 'Perfect Score',      description: 'Get 100% on a quiz' },
  week_streak:     { icon: LocalFireDepartmentIcon, gradient: 'linear-gradient(135deg, #fb923c, #ea580c)', title: 'Week Warrior',       description: '7-day learning streak' },
  month_streak:    { icon: WorkspacePremiumIcon,    gradient: 'linear-gradient(135deg, #f87171, #dc2626)', title: 'Dedicated Scholar',  description: '30-day learning streak' },
  course_complete: { icon: WorkspacePremiumIcon,    gradient: 'linear-gradient(135deg, #818cf8, #4f46e5)', title: 'Course Champion',    description: 'Complete your first course' },
  five_courses:    { icon: EmojiEventsIcon,         gradient: 'linear-gradient(135deg, #34d399, #059669)', title: 'Knowledge Seeker',   description: 'Complete 5 courses' },
  level_5:         { icon: StarIcon,                gradient: 'linear-gradient(135deg, #a78bfa, #7c3aed)', title: 'Rising Expert',      description: 'Reach Level 5' },
  level_10:        { icon: WorkspacePremiumIcon,    gradient: 'linear-gradient(135deg, #fbbf24, #d97706)', title: 'Master Learner',     description: 'Reach Level 10' },
  top_ten:         { icon: EmojiEventsIcon,         gradient: 'linear-gradient(135deg, #facc15, #eab308)', title: 'Top 10',             description: 'Enter the top 10 leaderboard' },
};

export default function AchievementUnlocker({ achievement, show, onComplete }) {
  const config = ACHIEVEMENT_CONFIGS[achievement?.icon] || ACHIEVEMENT_CONFIGS.first_lesson;
  const Icon = config.icon;

  React.useEffect(() => {
    if (show) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#A855F7']
      });
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onComplete}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1500,
            padding: 16,
          }}
        >
          <motion.div
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.5, rotate: 10 }}
            transition={{ type: 'spring', duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 448, width: '100%' }}
          >
            <Box
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 6,
                p: 4,
                textAlign: 'center',
                boxShadow: 24,
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}
              >
                <Box
                  sx={{
                    width: 96,
                    height: 96,
                    background: config.gradient,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 6,
                  }}
                >
                  <Icon sx={{ fontSize: 48, color: 'white' }} />
                </Box>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary', mb: 1 }}>
                  Achievement Unlocked!
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Typography variant="h6" fontWeight={600} sx={{ color: '#4f46e5', mb: 1 }}>
                  {config.title}
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                  {config.description}
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  onClick={onComplete}
                  variant="contained"
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    background: 'linear-gradient(to right, #4f46e5, #9333ea)',
                    color: 'white',
                    borderRadius: 50,
                    fontWeight: 600,
                    boxShadow: 4,
                    '&:hover': {
                      background: 'linear-gradient(to right, #4338ca, #7e22ce)',
                    },
                  }}
                >
                  Continue Learning
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}