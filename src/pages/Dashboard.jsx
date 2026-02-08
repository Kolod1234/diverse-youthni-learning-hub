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
    <div className="min-h-screen bg-background">
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
                className="text-4xl md:text-5xl font-bold text-foreground mb-3"
              >
                {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Learner'}! 👋
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground text-lg"
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
            className="relative overflow-hidden text-center py-20 px-6 bg-card rounded-3xl shadow-xl border border-border"
          >
            <div className="absolute inset-0" />
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/20"
              >
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Start Your Learning Journey</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg">
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
                    <TabsList className="bg-card border border-border p-1.5 rounded-2xl shadow-lg">
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
                            <div key={i} className="bg-card rounded-2xl p-6 animate-pulse border border-border">
                              <div className="flex gap-6">
                                <div className="w-56 h-32 bg-muted rounded-xl" />
                                <div className="flex-1 space-y-4">
                                  <div className="h-6 bg-muted rounded w-2/3" />
                                  <div className="h-4 bg-muted rounded w-1/3" />
                                  <div className="h-3 bg-muted rounded" />
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
                        <div className="text-center py-16 bg-card rounded-2xl border border-border">
                           <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                             <BookOpen className="w-8 h-8 text-muted-foreground" />
                           </div>
                           <p className="text-foreground text-lg">No courses in progress</p>
                           <p className="text-muted-foreground text-sm mt-2">Start learning to see your progress here</p>
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
                        <div className="text-center py-16 bg-card rounded-2xl border border-border">
                           <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                             <Award className="w-8 h-8 text-muted-foreground" />
                           </div>
                           <p className="text-foreground text-lg">No completed courses yet</p>
                           <p className="text-muted-foreground text-sm mt-2">Complete your first course to earn achievements</p>
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
                 <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
                   <div className="flex items-center justify-between mb-6">
                     <h3 className="font-semibold text-foreground text-lg">Achievements</h3>
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
                       <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                         <Award className="w-8 h-8 text-muted-foreground" />
                       </div>
                       <p className="text-muted-foreground text-sm">
                        Complete courses to earn achievements!
                      </p>
                    </div>
                  )}
                </div>

                {/* Call to Action */}
                 <div className="relative overflow-hidden bg-primary rounded-2xl p-6 text-primary-foreground shadow-2xl">
                   <div className="relative">
                     <div className="flex items-center gap-2 mb-3">
                       <Zap className="w-5 h-5" />
                       <h3 className="font-bold text-lg">Continue Learning</h3>
                     </div>
                     <p className="text-primary-foreground/80 text-sm mb-5 leading-relaxed">
                      Discover new courses that match your interests and accelerate your growth.
                    </p>
                    <Link to={createPageUrl('Explore')}>
                      <Button className="w-full bg-primary-foreground text-primary hover:opacity-90 hover:scale-105 transition-all shadow-lg font-semibold">
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