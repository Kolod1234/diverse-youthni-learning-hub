import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Flame, Trophy, Zap, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import StyledIcon from '@/components/ui/StyledIcon';

export default function QuickStatsCard({ user }) {
  const { data: userProgress } = useQuery({
    queryKey: ['user-progress', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ created_by: user.email }).then(r => r[0]),
    enabled: !!user?.email
  });

  const { data: streak } = useQuery({
    queryKey: ['study-streak', user?.email],
    queryFn: () => base44.entities.StudyStreak.filter({ created_by: user.email }).then(r => r[0]),
    enabled: !!user?.email
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['user-enrollments-stats', user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ created_by: user.email }),
    enabled: !!user?.email
  });

  const completedCourses = enrollments.filter(e => e.is_completed).length;
  const inProgressCourses = enrollments.filter(e => !e.is_completed).length;
  const totalXP = userProgress?.total_xp || 0;
  const streakDays = streak?.current_streak || 0;
  const longestStreak = streak?.longest_streak || 0;

  return (
    <motion.div



      className="grid grid-cols-2 sm:grid-cols-4 gap-4"
    >
      {/* Total XP */}
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-white border border-border rounded-xl p-5 text-center hover:shadow-lg transition-all"
      >
        <div className="flex justify-center mb-3">
          <StyledIcon Icon={Zap} colorFrom="from-amber-500" colorTo="to-orange-600" size="md" />
        </div>
        <div className="text-2xl font-bold text-foreground">{totalXP.toLocaleString()}</div>
        <div className="text-xs text-muted-foreground font-semibold">Total XP</div>
      </motion.div>

      {/* Current Streak */}
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-white border border-border rounded-xl p-5 text-center hover:shadow-lg transition-all"
      >
        <div className="flex justify-center mb-3">
          <StyledIcon Icon={Flame} colorFrom="from-red-500" colorTo="to-orange-600" size="md" />
        </div>
        <div className="text-2xl font-bold text-foreground">{streakDays}</div>
        <div className="text-xs text-muted-foreground font-semibold">Day Streak 🔥</div>
      </motion.div>

      {/* Courses Completed */}
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-white border border-border rounded-xl p-5 text-center hover:shadow-lg transition-all"
      >
        <div className="flex justify-center mb-3">
          <StyledIcon Icon={Award} colorFrom="from-green-500" colorTo="to-emerald-600" size="md" />
        </div>
        <div className="text-2xl font-bold text-foreground">{completedCourses}</div>
        <div className="text-xs text-muted-foreground font-semibold">Completed</div>
      </motion.div>

      {/* In Progress */}
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-white border border-border rounded-xl p-5 text-center hover:shadow-lg transition-all"
      >
        <div className="flex justify-center mb-3">
          <StyledIcon Icon={Trophy} colorFrom="from-blue-500" colorTo="to-indigo-600" size="md" />
        </div>
        <div className="text-2xl font-bold text-foreground">{inProgressCourses}</div>
        <div className="text-xs text-muted-foreground font-semibold">In Progress</div>
      </motion.div>
    </motion.div>
  );
}