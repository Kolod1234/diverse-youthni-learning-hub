import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Clock, Award, ArrowRight, Sparkles, TrendingUp, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import StatsOverview from '@/components/dashboard/StatsOverview';
import ProgressCard from '@/components/dashboard/ProgressCard';
import AchievementBadge from '@/components/dashboard/AchievementBadge';
import CourseProgressWidget from '@/components/dashboard/CourseProgressWidget';
import PointsDisplay from '@/components/gamification/PointsDisplay';
import Leaderboard from '@/components/gamification/Leaderboard';
import StreakTracker from '@/components/gamification/StreakTracker';
import UpcomingSessionsWidget from '@/components/sessions/UpcomingSessionsWidget';
import RecommendedCourses from '@/components/dashboard/RecommendedCourses';

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: enrollments = [], isLoading: loadingEnrollments } = useQuery({
    queryKey: ['enrollments', user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ created_by: user?.email }, '-updated_date', 50),
    enabled: !!user?.email,
    staleTime: 2 * 60 * 1000,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const courses = await base44.entities.Course.list('-created_date', 100);
      // Fetch lesson counts for all courses
      const coursesWithCounts = await Promise.all(
        courses.map(async (course) => {
          const lessons = await base44.entities.Lesson.filter({ course_id: course.id });
          return { ...course, lesson_count: lessons.length };
        })
      );
      return coursesWithCounts;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', user?.email],
    queryFn: () => base44.entities.Achievement.filter({ created_by: user?.email }, '-earned_date', 20),
    enabled: !!user?.email,
    staleTime: 3 * 60 * 1000,
  });

  const { data: userProgress } = useQuery({
    queryKey: ['user-progress', user?.email],
    queryFn: async () => {
      const progressList = await base44.entities.UserProgress.filter({ created_by: user?.email });
      return progressList[0] || { points: 0, level: 1, streak_days: 0 };
    },
    enabled: !!user?.email,
    staleTime: 2 * 60 * 1000,
  });

  const { data: upcomingSessions = [] } = useQuery({
    queryKey: ['upcoming-sessions', user?.email],
    queryFn: async () => {
      const allSessions = await base44.entities.VideoSession.filter({ status: 'scheduled' }, 'scheduled_date', 20);
      return allSessions.filter(s => s.invited_students?.includes(user?.email) || s.tutor_email === user?.email);
    },
    enabled: !!user?.email,
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const inProgressEnrollments = enrollments.filter(e => !e.is_completed);
  const completedEnrollments = enrollments.filter(e => e.is_completed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-violet-400/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex-1">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-violet-900 bg-clip-text text-transparent mb-3"
              >
                {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Learner'}! 👋
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-gray-600 text-lg"
              >
                Track your progress and continue your learning journey.
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <PointsDisplay 
                points={userProgress?.points || 0} 
                level={userProgress?.level || 1}
              />
            </motion.div>
          </div>
        </motion.div>

        {enrollments.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden text-center py-20 px-6 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-pink-500/5" />
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/20"
              >
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Start Your Learning Journey</h2>
              <p className="text-gray-600 max-w-md mx-auto mb-8 text-lg">
                Explore our catalog of expert-led courses and begin building new skills today.
              </p>
              <Link to={createPageUrl('Explore')}>
                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-full px-10 py-6 text-lg shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all">
                  Browse Courses
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Stats Overview */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-10"
            >
              <StatsOverview 
                enrollments={enrollments} 
                courses={courses}
                achievements={achievements}
              />
            </motion.div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Tabs defaultValue="in-progress" className="w-full">
                    <TabsList className="bg-white/80 backdrop-blur-xl border border-white/20 p-1.5 rounded-2xl shadow-lg">
                      <TabsTrigger 
                        value="in-progress" 
                        className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg px-6 py-2.5 font-medium transition-all"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        In Progress ({inProgressEnrollments.length})
                      </TabsTrigger>
                      <TabsTrigger 
                        value="completed"
                        className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg px-6 py-2.5 font-medium transition-all"
                      >
                        <Award className="w-4 h-4 mr-2" />
                        Completed ({completedEnrollments.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="in-progress" className="mt-6">
                      {loadingEnrollments ? (
                        <div className="space-y-5">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 animate-pulse border border-white/20">
                              <div className="flex gap-6">
                                <div className="w-56 h-32 bg-gray-200 rounded-xl" />
                                <div className="flex-1 space-y-4">
                                  <div className="h-6 bg-gray-200 rounded w-2/3" />
                                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                                  <div className="h-3 bg-gray-200 rounded" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : inProgressEnrollments.length > 0 ? (
                        <div className="space-y-5">
                          {inProgressEnrollments.map((enrollment, index) => (
                            <ProgressCard
                              key={enrollment.id}
                              enrollment={enrollment}
                              course={courses.find(c => c.id === enrollment.course_id)}
                              index={index}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-16 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20">
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 text-lg">No courses in progress</p>
                          <p className="text-gray-400 text-sm mt-2">Start learning to see your progress here</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="completed" className="mt-6">
                      {completedEnrollments.length > 0 ? (
                        <div className="space-y-5">
                          {completedEnrollments.map((enrollment, index) => (
                            <ProgressCard
                              key={enrollment.id}
                              enrollment={enrollment}
                              course={courses.find(c => c.id === enrollment.course_id)}
                              index={index}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-16 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Award className="w-8 h-8 text-green-600" />
                          </div>
                          <p className="text-gray-500 text-lg">No completed courses yet</p>
                          <p className="text-gray-400 text-sm mt-2">Complete your first course to earn achievements</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </motion.div>
              </div>

              {/* Sidebar */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-6"
              >
                {/* Streak Tracker */}
                <StreakTracker 
                  streakDays={userProgress?.streak_days || 0}
                  lastActivityDate={userProgress?.last_activity_date}
                />

                {/* Upcoming Sessions Widget */}
                <UpcomingSessionsWidget user={user} />

                {/* Quick Progress Widget */}
                <CourseProgressWidget enrollments={inProgressEnrollments} courses={courses} />

                {/* Leaderboard */}
                <Leaderboard limit={5} />

                {/* Recommended Courses */}
                <RecommendedCourses userEnrollments={enrollments} />

                {/* Achievements */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-gray-900 text-lg">Achievements</h3>
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  
                  {achievements.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {achievements.slice(0, 6).map((achievement, index) => (
                        <AchievementBadge 
                          key={achievement.id} 
                          achievement={achievement}
                          index={index}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Award className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm">
                        Complete courses to earn achievements!
                      </p>
                    </div>
                  )}
                </div>

                {/* Call to Action */}
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 rounded-2xl p-6 text-white shadow-2xl">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-5 h-5" />
                      <h3 className="font-bold text-lg">Continue Learning</h3>
                    </div>
                    <p className="text-indigo-100 text-sm mb-5 leading-relaxed">
                      Discover new courses that match your interests and accelerate your growth.
                    </p>
                    <Link to={createPageUrl('Explore')}>
                      <Button className="w-full bg-white text-indigo-600 hover:bg-gray-100 hover:scale-105 transition-all shadow-lg font-semibold">
                        Explore More
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}