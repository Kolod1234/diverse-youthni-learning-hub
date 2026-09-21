import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Award, TrendingUp, Flame, Zap, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CourseLeaderboard({ courseId }) {

  const { data: leaderboardData = [] } = useQuery({
    queryKey: ['public-course-scoreboard', courseId],
    queryFn: async () => {
      const response = await base44.functions.invoke('publicScoreboardData', { type: 'course', scopeId: courseId });
      return (response.data.entries || []).sort((a, b) => b.progress - a.progress || b.points - a.points);
    },
    enabled: !!courseId,
  });

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

      <p className="mb-3 text-sm text-muted-foreground">Course points use your best topic-check scores. Retakes add only improvements.</p>
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
                        <span className="text-indigo-600 font-semibold">{entry.username?.charAt(0) || 'L'}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{entry.username}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-indigo-600 h-1.5 rounded-full" 
                              style={{ width: `${entry.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-10 text-right">
                            {entry.progress}%
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
                        <span className="text-indigo-600 font-semibold">{entry.username?.charAt(0) || 'L'}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{entry.username}</p>
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
                        <span className="text-indigo-600 font-semibold">{entry.username?.charAt(0) || 'L'}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{entry.username}</p>
                        <p className="text-xs text-gray-500">{entry.progress}% complete</p>
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
