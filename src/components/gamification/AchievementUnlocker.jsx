import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Trophy, Star, Zap, Target, Crown, Flame, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const ACHIEVEMENT_CONFIGS = {
  first_lesson: { icon: Sparkles, color: 'blue', title: 'First Steps', description: 'Complete your first lesson' },
  five_lessons: { icon: Star, color: 'purple', title: 'Rising Star', description: 'Complete 5 lessons' },
  ten_lessons: { icon: Zap, color: 'yellow', title: 'Power Learner', description: 'Complete 10 lessons' },
  first_quiz: { icon: Target, color: 'green', title: 'Quiz Master', description: 'Pass your first quiz' },
  perfect_quiz: { icon: Trophy, color: 'gold', title: 'Perfect Score', description: 'Get 100% on a quiz' },
  week_streak: { icon: Flame, color: 'orange', title: 'Week Warrior', description: '7-day learning streak' },
  month_streak: { icon: Crown, color: 'red', title: 'Dedicated Scholar', description: '30-day learning streak' },
  course_complete: { icon: Award, color: 'indigo', title: 'Course Champion', description: 'Complete your first course' },
  five_courses: { icon: Trophy, color: 'emerald', title: 'Knowledge Seeker', description: 'Complete 5 courses' },
  level_5: { icon: Star, color: 'violet', title: 'Rising Expert', description: 'Reach Level 5' },
  level_10: { icon: Crown, color: 'amber', title: 'Master Learner', description: 'Reach Level 10' },
  top_ten: { icon: Trophy, color: 'yellow', title: 'Top 10', description: 'Enter the top 10 leaderboard' },
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
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onComplete}
        >
          <motion.div
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.5, rotate: 10 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="bg-card rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className={`w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-${config.color}-400 to-${config.color}-600 rounded-full flex items-center justify-center shadow-lg`}
            >
              <Icon className="w-12 h-12 text-white" />
            </motion.div>

            <motion.h2
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              Achievement Unlocked!
            </motion.h2>

            <motion.h3
              className="text-xl font-semibold text-indigo-600 mb-2"
            >
              {config.title}
            </motion.h3>

            <motion.p
              className="text-gray-600 mb-6"
            >
              {config.description}
            </motion.p>

            <motion.button
              onClick={onComplete}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
            >
              Continue Learning
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}