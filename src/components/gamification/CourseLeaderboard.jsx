import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Award, TrendingUp, Flame, Zap, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CourseLeaderboard({ courseId }) {
  const [timeRange, setTimeRange] = useState('all-time');

  const { data: enrollments = [] } = useQuery({
    queryKey: ['course-enrollments', courseId],
    queryFn: () => base44.entities.Enrollment.filter({ course_id: courseId }, '-progress_percent', 100),
    enabled: !!courseId,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list('-created_date', 500),
    staleTime: 5 * 60 * 1000,
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ['user-progress-list'],
    queryFn: () => base44.entities.UserProgress.list('-points', 100),
  });

  const leaderboardData = enrollments
    .map(enrollment => {
      const user = users.find(u => u.email === enrollment.created_by);
      const progress = userProgress.find(p => p.created_by === enrollment.created_by);
      
      // Get name from enrollment.created_by if user not found
      let displayName = user?.full_name || 'Unknown';
      if (displayName === 'Unknown' && enrollment.created_by) {
        // Extract name from email (before @)
        displayName = enrollment.created_by.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
      
      return {
        ...enrollment,
        name: displayName,
        avatar: user?.avatar,
        points: progress?.points || 0,
        streak: progress?.streak_days || 0,
        level: progress?.level || 1,
      };
    })
    .sort((a, b) => b.progress_percent - a.progress_percent);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-semibold text-gray-500">#{rank}</span>;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'from-yellow-50 to-orange-50 border-yellow-200';
    if (rank === 2) return 'from-gray-50 to-slate-50 border-gray-200';
    if (rank === 3) return 'from-amber-50 to-orange-50 border-amber-200';
    return 'from-white to-gray-50 border-gray-200';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">Course Leaderboard</h3>
        <Badge variant="secondary" className="ml-auto">
          {leaderboardData.length} learners
        </Badge>
      </div>

      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="w-full bg-gray-100">
          <TabsTrigger value="progress" className="flex-1">
            <BookOpen className="w-4 h-4 mr-2" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="points" className="flex-1">
            <Zap className="w-4 h-4 mr-2" />
            Points
          </TabsTrigger>
          <TabsTrigger value="streak" className="flex-1">
            <Flame className="w-4 h-4 mr-2" />
            Streaks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="mt-4">
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {leaderboardData.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className={`p-4 rounded-lg border bg-gradient-to-r ${getRankColor(index + 1)} transition-all hover:shadow-md`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center">
                        {getRankIcon(index + 1)}
                      </div>
                      
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        {entry.avatar ? (
                          <img src={entry.avatar} alt={entry.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <span className="text-indigo-600 font-semibold">{entry.name?.charAt(0)}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{entry.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-indigo-600 h-1.5 rounded-full" 
                              style={{ width: `${entry.progress_percent}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-10 text-right">
                            {entry.progress_percent}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="points" className="mt-4">
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {[...leaderboardData].sort((a, b) => b.points - a.points).map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className={`p-4 rounded-lg border bg-gradient-to-r ${getRankColor(index + 1)} transition-all hover:shadow-md`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center">
                        {getRankIcon(index + 1)}
                      </div>
                      
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        {entry.avatar ? (
                          <img src={entry.avatar} alt={entry.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <span className="text-indigo-600 font-semibold">{entry.name?.charAt(0)}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{entry.name}</p>
                        <p className="text-xs text-gray-500">Level {entry.level}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-indigo-600">{entry.points}</p>
                        <p className="text-xs text-gray-500">points</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="streak" className="mt-4">
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {[...leaderboardData].sort((a, b) => b.streak - a.streak).map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className={`p-4 rounded-lg border bg-gradient-to-r ${getRankColor(index + 1)} transition-all hover:shadow-md`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center">
                        {getRankIcon(index + 1)}
                      </div>
                      
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        {entry.avatar ? (
                          <img src={entry.avatar} alt={entry.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <span className="text-indigo-600 font-semibold">{entry.name?.charAt(0)}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{entry.name}</p>
                        <p className="text-xs text-gray-500">{entry.progress_percent}% complete</p>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        <Flame className={`w-5 h-5 ${entry.streak > 0 ? 'text-orange-500' : 'text-gray-300'}`} />
                        <div>
                          <p className="text-lg font-bold text-orange-600">{entry.streak}</p>
                          <p className="text-xs text-gray-500">days</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
}