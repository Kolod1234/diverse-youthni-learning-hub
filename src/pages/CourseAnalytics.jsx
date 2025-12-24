import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Users, TrendingUp, Award, Brain, Clock, 
  CheckCircle, XCircle, BarChart3, Download, MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function CourseAnalytics() {
  const [user, setUser] = useState(null);
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('courseId');

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0];
    },
    enabled: !!courseId,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['course-enrollments', courseId],
    queryFn: () => base44.entities.Enrollment.filter({ course_id: courseId }),
    enabled: !!courseId,
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => base44.entities.Lesson.filter({ course_id: courseId }, 'order', 100),
    enabled: !!courseId,
  });

  const { data: quizAttempts = [] } = useQuery({
    queryKey: ['quiz-attempts', courseId],
    queryFn: () => base44.entities.QuizAttempt.filter({ course_id: courseId }),
    enabled: !!courseId,
  });

  const { data: quizzes = [] } = useQuery({
    queryKey: ['quizzes', courseId],
    queryFn: () => base44.entities.Quiz.filter({ course_id: courseId }),
    enabled: !!courseId,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list('-created_date', 500),
  });

  // Statistics
  const totalStudents = enrollments.length;
  const completedStudents = enrollments.filter(e => e.is_completed).length;
  const completionRate = totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0;
  const avgProgress = totalStudents > 0 
    ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress_percent || 0), 0) / totalStudents)
    : 0;
  const avgQuizScore = quizAttempts.length > 0
    ? Math.round(quizAttempts.reduce((sum, a) => sum + a.score, 0) / quizAttempts.length)
    : 0;

  // Engagement data
  const engagementData = enrollments.map(e => {
    const student = users.find(u => u.email === e.created_by);
    const studentAttempts = quizAttempts.filter(a => a.created_by === e.created_by);
    const avgScore = studentAttempts.length > 0
      ? Math.round(studentAttempts.reduce((sum, a) => sum + a.score, 0) / studentAttempts.length)
      : 0;

    return {
      id: e.id,
      name: student?.full_name || 'Unknown',
      email: e.created_by,
      progress: e.progress_percent || 0,
      completed: e.is_completed,
      quizzesTaken: studentAttempts.length,
      avgQuizScore: avgScore,
      lastActive: e.updated_date,
    };
  }).sort((a, b) => b.progress - a.progress);

  // Progress distribution
  const progressDistribution = [
    { name: '0-25%', count: enrollments.filter(e => (e.progress_percent || 0) < 25).length },
    { name: '25-50%', count: enrollments.filter(e => (e.progress_percent || 0) >= 25 && (e.progress_percent || 0) < 50).length },
    { name: '50-75%', count: enrollments.filter(e => (e.progress_percent || 0) >= 50 && (e.progress_percent || 0) < 75).length },
    { name: '75-99%', count: enrollments.filter(e => (e.progress_percent || 0) >= 75 && (e.progress_percent || 0) < 100).length },
    { name: '100%', count: enrollments.filter(e => (e.progress_percent || 0) === 100).length },
  ];

  // Quiz performance by quiz
  const quizPerformance = quizzes.map(quiz => {
    const attempts = quizAttempts.filter(a => a.quiz_id === quiz.id);
    const avgScore = attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
      : 0;
    const passRate = attempts.length > 0
      ? Math.round((attempts.filter(a => a.passed).length / attempts.length) * 100)
      : 0;

    return {
      name: quiz.title,
      avgScore,
      passRate,
      attempts: attempts.length,
    };
  });

  const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('TutorDashboard')}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Analytics</h1>
          <p className="text-gray-500">{course?.title}</p>
        </div>

        {/* Stats Overview */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Students', value: totalStudents, icon: Users, color: 'bg-blue-50', iconColor: 'text-blue-600' },
            { label: 'Avg Progress', value: `${avgProgress}%`, icon: TrendingUp, color: 'bg-purple-50', iconColor: 'text-purple-600' },
            { label: 'Completion Rate', value: `${completionRate}%`, icon: CheckCircle, color: 'bg-emerald-50', iconColor: 'text-emerald-600' },
            { label: 'Avg Quiz Score', value: `${avgQuizScore}%`, icon: Brain, color: 'bg-amber-50', iconColor: 'text-amber-600' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-5">
                  <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Charts and Data */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-xl mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="quizzes">Quiz Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Progress Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={progressDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366F1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Completion Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Completed', value: completedStudents },
                        { name: 'In Progress', value: totalStudents - completedStudents },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Completed', value: completedStudents },
                        { name: 'In Progress', value: totalStudents - completedStudents },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">Student Performance</h3>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              <div className="space-y-3">
                {engagementData.map((student) => (
                  <Card key={student.id} className="p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                      <Link to={createPageUrl('StudentAnalytics') + `?studentEmail=${student.email}&courseId=${courseId}`}>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                      </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Progress</p>
                        <p className="text-lg font-bold text-indigo-600">{student.progress}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Quizzes</p>
                        <p className="text-lg font-bold text-purple-600">{student.quizzesTaken}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Avg Score</p>
                        <p className="text-lg font-bold text-emerald-600">{student.avgQuizScore}%</p>
                      </div>
                    </div>

                    <Progress value={student.progress} className="h-2" />
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="quizzes">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Quiz Performance Analysis</h3>
              
              {quizPerformance.length > 0 ? (
                <div className="space-y-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={quizPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="avgScore" fill="#6366F1" name="Avg Score %" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="passRate" fill="#10B981" name="Pass Rate %" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="space-y-3">
                    {quizPerformance.map((quiz, idx) => (
                      <Card key={idx} className="p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{quiz.name}</h4>
                          <Badge variant="secondary">{quiz.attempts} attempts</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Average Score</p>
                            <div className="flex items-center gap-2">
                              <p className="text-xl font-bold text-indigo-600">{quiz.avgScore}%</p>
                              {quiz.avgScore >= 70 ? (
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Pass Rate</p>
                            <p className="text-xl font-bold text-emerald-600">{quiz.passRate}%</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Brain className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No quiz data available yet</p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}