import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, Target, Brain, Calendar, Award, 
  ArrowLeft, BarChart3, PieChart, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import LearningPathVisualization from '@/components/analytics/LearningPathVisualization';
import QuizPerformanceAnalysis from '@/components/analytics/QuizPerformanceAnalysis';
import PersonalizedFeedback from '@/components/analytics/PersonalizedFeedback';
import PointsDisplay from '@/components/gamification/PointsDisplay';

export default function Analytics() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: quizAttempts = [] } = useQuery({
    queryKey: ['quiz-attempts', user?.email],
    queryFn: () => base44.entities.QuizAttempt.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const { data: userProgress } = useQuery({
    queryKey: ['user-progress', user?.email],
    queryFn: async () => {
      const progressList = await base44.entities.UserProgress.filter({ created_by: user?.email });
      return progressList[0] || { points: 0, level: 1, streak_days: 0 };
    },
    enabled: !!user?.email,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', user?.email],
    queryFn: () => base44.entities.Achievement.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const completedCourses = enrollments.filter(e => e.is_completed).length;
  const totalCourses = enrollments.length;
  const avgProgress = enrollments.length > 0 
    ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress_percent || 0), 0) / enrollments.length)
    : 0;
  
  const totalQuizzes = quizAttempts.length;
  const passedQuizzes = quizAttempts.filter(a => a.passed).length;
  const avgScore = quizAttempts.length > 0
    ? Math.round(quizAttempts.reduce((sum, a) => sum + a.score, 0) / quizAttempts.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Learning Analytics 📊
              </h1>
              <p className="text-gray-500">
                Detailed insights into your learning journey and performance
              </p>
            </motion.div>
          </div>
          <PointsDisplay 
            points={userProgress?.points || 0} 
            level={userProgress?.level || 1}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{avgProgress}%</p>
                  <p className="text-xs text-gray-600">Avg Progress</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{completedCourses}/{totalCourses}</p>
                  <p className="text-xs text-gray-600">Completed</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{avgScore}%</p>
                  <p className="text-xs text-gray-600">Quiz Average</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{userProgress?.streak_days || 0}</p>
                  <p className="text-xs text-gray-600">Day Streak</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{achievements.length}</p>
                  <p className="text-xs text-gray-600">Achievements</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-xl mb-6">
            <TabsTrigger 
              value="overview" 
              className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-6"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Learning Path
            </TabsTrigger>
            <TabsTrigger 
              value="performance"
              className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-6"
            >
              <PieChart className="w-4 h-4 mr-2" />
              Quiz Performance
            </TabsTrigger>
            <TabsTrigger 
              value="feedback"
              className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-6"
            >
              <Brain className="w-4 h-4 mr-2" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <LearningPathVisualization 
              enrollments={enrollments}
              courses={courses}
              userProgress={userProgress}
            />
          </TabsContent>

          <TabsContent value="performance">
            <QuizPerformanceAnalysis 
              quizAttempts={quizAttempts}
              enrollments={enrollments}
              courses={courses}
            />
          </TabsContent>

          <TabsContent value="feedback">
            <PersonalizedFeedback 
              enrollments={enrollments}
              quizAttempts={quizAttempts}
              courses={courses}
              userProgress={userProgress}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}