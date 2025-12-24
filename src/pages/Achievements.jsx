import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Award, Star, Zap, Target, Crown, Flame, Sparkles, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

const ACHIEVEMENT_CONFIGS = {
  first_lesson: { icon: Sparkles, color: 'from-blue-400 to-blue-600', title: 'First Steps', description: 'Complete your first lesson', points: 10 },
  five_lessons: { icon: Star, color: 'from-purple-400 to-purple-600', title: 'Rising Star', description: 'Complete 5 lessons', points: 25 },
  ten_lessons: { icon: Zap, color: 'from-yellow-400 to-yellow-600', title: 'Power Learner', description: 'Complete 10 lessons', points: 50 },
  first_quiz: { icon: Target, color: 'from-green-400 to-green-600', title: 'Quiz Master', description: 'Pass your first quiz', points: 15 },
  perfect_quiz: { icon: Trophy, color: 'from-amber-400 to-amber-600', title: 'Perfect Score', description: 'Get 100% on a quiz', points: 50 },
  week_streak: { icon: Flame, color: 'from-orange-400 to-red-500', title: 'Week Warrior', description: '7-day learning streak', points: 30 },
  month_streak: { icon: Crown, color: 'from-red-500 to-pink-600', title: 'Dedicated Scholar', description: '30-day learning streak', points: 100 },
  course_complete: { icon: Award, color: 'from-indigo-400 to-indigo-600', title: 'Course Champion', description: 'Complete your first course', points: 100 },
  five_courses: { icon: Trophy, color: 'from-emerald-400 to-emerald-600', title: 'Knowledge Seeker', description: 'Complete 5 courses', points: 250 },
  level_5: { icon: Star, color: 'from-violet-400 to-violet-600', title: 'Rising Expert', description: 'Reach Level 5', points: 0 },
  level_10: { icon: Crown, color: 'from-amber-400 to-yellow-500', title: 'Master Learner', description: 'Reach Level 10', points: 0 },
  top_ten: { icon: Trophy, color: 'from-yellow-400 to-orange-500', title: 'Top 10', description: 'Enter the top 10 leaderboard', points: 50 },
  instructor_bonus: { icon: Award, color: 'from-pink-400 to-rose-600', title: 'Instructor Recognition', description: 'Recognized for outstanding contribution', points: 0 },
};

export default function Achievements() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', user?.email],
    queryFn: () => base44.entities.Achievement.filter({ created_by: user?.email }, '-earned_date', 100),
    enabled: !!user?.email,
  });

  const { data: userProgress } = useQuery({
    queryKey: ['user-progress', user?.email],
    queryFn: async () => {
      const progressList = await base44.entities.UserProgress.filter({ created_by: user?.email });
      return progressList[0] || { points: 0, level: 1, streak_days: 0, total_lessons_completed: 0, total_quizzes_completed: 0 };
    },
    enabled: !!user?.email,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ created_by: user?.email, is_completed: true }),
    enabled: !!user?.email,
  });

  const allAchievements = Object.entries(ACHIEVEMENT_CONFIGS).map(([key, config]) => ({
    key,
    ...config,
    earned: achievements.some(a => a.icon === key),
    earnedDate: achievements.find(a => a.icon === key)?.earned_date,
  }));

  const earnedCount = allAchievements.filter(a => a.earned).length;
  const totalCount = allAchievements.length;
  const completionPercent = (earnedCount / totalCount) * 100;

  const milestones = [
    { name: 'Lessons Completed', current: userProgress?.total_lessons_completed || 0, target: 50, icon: Sparkles },
    { name: 'Quizzes Passed', current: userProgress?.total_quizzes_completed || 0, target: 20, icon: Target },
    { name: 'Courses Finished', current: enrollments.length, target: 5, icon: Trophy },
    { name: 'Current Streak', current: userProgress?.streak_days || 0, target: 30, icon: Flame },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Banner */}
      <div className="relative h-64 mb-8 overflow-hidden">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69418fc30769c7d951368216/565ae72b8_image.png"
          alt="Diverse Youth NI Learning Hub"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-4xl font-bold text-white mb-2">Your Achievements</h1>
              <p className="text-white/90 text-lg">Track your learning milestones and unlock badges</p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">

        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 mb-8 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {earnedCount} / {totalCount} Achievements
                </h2>
                <p className="text-sm text-gray-600">Keep learning to unlock more!</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">{userProgress?.points || 0}</div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
            </div>
            <Progress value={completionPercent} className="h-3" />
          </Card>
        </motion.div>

        {/* Milestones */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {milestones.map((milestone, idx) => {
            const Icon = milestone.icon;
            const progress = Math.min((milestone.current / milestone.target) * 100, 100);
            
            return (
              <motion.div
                key={milestone.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
              >
                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-pink-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{milestone.name}</p>
                      <p className="text-xs text-gray-500">
                        {milestone.current} / {milestone.target}
                      </p>
                    </div>
                  </div>
                  <Progress value={progress} className="h-2" />
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Achievements Grid */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-xl mb-6">
            <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-600 data-[state=active]:text-white">
              All ({totalCount})
            </TabsTrigger>
            <TabsTrigger value="earned" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-600 data-[state=active]:text-white">
              Earned ({earnedCount})
            </TabsTrigger>
            <TabsTrigger value="locked" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-600 data-[state=active]:text-white">
              Locked ({totalCount - earnedCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {allAchievements.map((achievement, idx) => (
                <AchievementCard key={achievement.key} achievement={achievement} index={idx} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="earned">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {allAchievements.filter(a => a.earned).map((achievement, idx) => (
                <AchievementCard key={achievement.key} achievement={achievement} index={idx} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="locked">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {allAchievements.filter(a => !a.earned).map((achievement, idx) => (
                <AchievementCard key={achievement.key} achievement={achievement} index={idx} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AchievementCard({ achievement, index }) {
  const Icon = achievement.icon;
  const isEarned = achievement.earned;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={`p-6 text-center transition-all ${
        isEarned 
          ? 'bg-white border-2 border-orange-200 hover:shadow-xl hover:scale-105' 
          : 'bg-gray-50 border-gray-200 opacity-60'
      }`}>
        <div className="mb-4">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
            isEarned 
              ? `bg-gradient-to-br ${achievement.color} shadow-lg` 
              : 'bg-gray-200'
          }`}>
            {isEarned ? (
              <Icon className="w-10 h-10 text-white" />
            ) : (
              <Lock className="w-10 h-10 text-gray-400" />
            )}
          </div>
        </div>

        <h3 className={`font-bold text-lg mb-1 ${isEarned ? 'text-gray-900' : 'text-gray-500'}`}>
          {achievement.title}
        </h3>
        <p className={`text-sm mb-3 ${isEarned ? 'text-gray-600' : 'text-gray-400'}`}>
          {achievement.description}
        </p>

        {isEarned && achievement.earnedDate && (
          <Badge variant="secondary" className="text-xs">
            Earned {new Date(achievement.earnedDate).toLocaleDateString()}
          </Badge>
        )}

        {!isEarned && achievement.points > 0 && (
          <div className="mt-3 flex items-center justify-center gap-1 text-sm text-gray-500">
            <Zap className="w-3 h-3" />
            <span>{achievement.points} points</span>
          </div>
        )}
      </Card>
    </motion.div>
  );
}