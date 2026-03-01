import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';

export default function BadgeUnlock({ badges, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (badges && badges.length > 0) {
      setVisible(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [badges]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose(), 300);
  };

  return (
    <AnimatePresence>
      {visible && badges && badges.length > 0 && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-8 max-w-md w-full relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
            >
              <Award className="w-20 h-20 text-yellow-300 mx-auto mb-4" />
            </motion.div>
            
            <h2 className="text-3xl font-bold text-white mb-2">Badge Unlocked!</h2>
            <p className="text-white/90 mb-6">You've earned a new achievement</p>

            <div className="space-y-3">
              {badges.map((badge, index) => (
                <motion.div
                  key={badge}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3"
                >
                  <span className="text-4xl">{getBadgeIcon(badge)}</span>
                  <div className="text-left flex-1">
                    <h3 className="text-white font-semibold">{formatBadgeName(badge)}</h3>
                    <p className="text-white/80 text-sm">{getBadgeDescription(badge)}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button 
              onClick={onClose}
              className="mt-6 w-full bg-white text-purple-600 hover:bg-white/90"
            >
              Awesome!
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function formatBadgeName(badge) {
  return badge.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function getBadgeIcon(badge) {
  const icons = {
    'perfect_quiz': '🏆',
    'course_complete': '🎓',
    'week_streak': '🔥',
    'month_streak': '⭐',
    'lessons_10': '📚',
    'lessons_50': '📖',
    'quizzes_20': '✅',
    'points_5k': '💎'
  };
  return icons[badge] || '🎯';
}

function getBadgeDescription(badge) {
  const descriptions = {
    'perfect_quiz': 'Scored 100% on a quiz',
    'course_complete': 'Completed an entire course',
    'week_streak': '7-day learning streak',
    'month_streak': '30-day learning streak',
    'lessons_10': 'Completed 10 lessons',
    'lessons_50': 'Completed 50 lessons',
    'quizzes_20': 'Completed 20 quizzes',
    'points_5k': 'Earned 5,000 points'
  };
  return descriptions[badge] || 'Achievement unlocked';
}