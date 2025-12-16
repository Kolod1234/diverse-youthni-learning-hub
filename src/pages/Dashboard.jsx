import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Clock, Award, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import StatsOverview from '@/components/dashboard/StatsOverview';
import ProgressCard from '@/components/dashboard/ProgressCard';
import AchievementBadge from '@/components/dashboard/AchievementBadge';
import CourseProgressWidget from '@/components/dashboard/CourseProgressWidget';

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
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 100),
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', user?.email],
    queryFn: () => base44.entities.Achievement.filter({ created_by: user?.email }, '-earned_date', 20),
    enabled: !!user?.email,
  });

  const inProgressEnrollments = enrollments.filter(e => !e.is_completed);
  const completedEnrollments = enrollments.filter(e => e.is_completed);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Learner'}! 👋
          </h1>
          <p className="text-gray-500">Track your progress and continue your learning journey.</p>
        </motion.div>

        {/* Stats Overview */}
        <div className="mb-8">
          <StatsOverview 
            enrollments={enrollments} 
            courses={courses}
            achievements={achievements}
          />
        </div>

        {enrollments.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Start Your Learning Journey</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Explore our catalog of expert-led courses and begin building new skills today.
            </p>
            <Link to={createPageUrl('Explore')}>
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-8">
                Browse Courses
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="in-progress" className="w-full">
                <TabsList className="bg-white border border-gray-200 p-1 rounded-xl">
                  <TabsTrigger 
                    value="in-progress" 
                    className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-6"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    In Progress ({inProgressEnrollments.length})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="completed"
                    className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-6"
                  >
                    <Award className="w-4 h-4 mr-2" />
                    Completed ({completedEnrollments.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="in-progress" className="mt-6">
                  {loadingEnrollments ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                          <div className="flex gap-4">
                            <div className="w-48 h-28 bg-gray-200 rounded-xl" />
                            <div className="flex-1 space-y-3">
                              <div className="h-5 bg-gray-200 rounded w-2/3" />
                              <div className="h-4 bg-gray-200 rounded w-1/3" />
                              <div className="h-2 bg-gray-200 rounded" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : inProgressEnrollments.length > 0 ? (
                    <div className="space-y-4">
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
                    <div className="text-center py-12 bg-white rounded-2xl">
                      <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No courses in progress</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="completed" className="mt-6">
                  {completedEnrollments.length > 0 ? (
                    <div className="space-y-4">
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
                    <div className="text-center py-12 bg-white rounded-2xl">
                      <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No completed courses yet</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Progress Widget */}
              <CourseProgressWidget enrollments={inProgressEnrollments} courses={courses} />

              {/* Achievements */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900">Achievements</h3>
                  <Award className="w-5 h-5 text-indigo-600" />
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
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Award className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">
                      Complete courses to earn achievements!
                    </p>
                  </div>
                )}
              </div>

              {/* Recommended */}
              <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
                <h3 className="font-semibold mb-2">Continue Learning</h3>
                <p className="text-indigo-100 text-sm mb-4">
                  Discover new courses that match your interests.
                </p>
                <Link to={createPageUrl('Explore')}>
                  <Button className="w-full bg-white text-indigo-600 hover:bg-gray-100">
                    Explore More
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}