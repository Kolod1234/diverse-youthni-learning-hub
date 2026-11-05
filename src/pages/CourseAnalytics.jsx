import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button, Card, LinearProgress, Tabs as MuiTabs, Tab as MuiTab, Box, Chip } from '@mui/material';
const Progress = ({ value, className }) => <LinearProgress variant="determinate" value={value || 0} className={className} sx={{ borderRadius: 1 }} />;
const Badge = ({ children, className, variant, ...props }) => <Chip label={children} size="small" variant={variant === 'outline' ? 'outlined' : 'filled'} className={className} {...props} />;
const TabsContext = React.createContext({ value: '', setValue: () => {} });
const Tabs = ({ children, defaultValue, className }) => {
  const [value, setValue] = React.useState(defaultValue);
  return <TabsContext.Provider value={{ value, setValue }}><div className={className}>{children}</div></TabsContext.Provider>;
};
const TabsList = ({ children, className }) => {
  const { value, setValue } = React.useContext(TabsContext);
  return <MuiTabs value={value} onChange={(_, v) => setValue(v)} className={className} sx={{ borderBottom: 1, borderColor: 'divider' }}>{React.Children.map(children, c => c && React.cloneElement(c))}</MuiTabs>;
};
const TabsTrigger = ({ children, value, className, ...props }) => <MuiTab value={value} label={children} className={className} {...props} />;
const TabsContent = ({ children, value, className }) => {
  const ctx = React.useContext(TabsContext);
  if (ctx.value !== value) return null;
  return <Box className={className} sx={{ pt: 2 }}>{children}</Box>;
};
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BarChartIcon from '@mui/icons-material/BarChart';
import DownloadIcon from '@mui/icons-material/Download';
import ChatIcon from '@mui/icons-material/Chat';
const _w = (I) => ({ size, color, className, style, ...r }) => <I className={className} style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const ArrowLeft = _w(ArrowBackIcon), Users = _w(PeopleIcon), TrendingUp = _w(TrendingUpIcon), Award = _w(EmojiEventsIcon);
const Brain = _w(PsychologyIcon), Clock = _w(AccessTimeIcon), CheckCircle = _w(CheckCircleIcon), XCircle = _w(CancelIcon);
const BarChart3 = _w(BarChartIcon), Download = _w(DownloadIcon), MessageSquare = _w(ChatIcon);
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { listUsers } from '@/api/listUsers';

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
    queryFn: () => listUsers({ sort: '-created_date', limit: 500 }),
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

  const COLORS = ['#6366F1', '#4f46e5', '#EC4899', '#F59E0B', '#10B981'];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('TutorDashboard')}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Course Analytics</h1>
          <p className="text-muted-foreground">{course?.title}</p>
        </div>

        {/* Stats Overview */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Students', value: totalStudents, icon: Users, color: 'bg-blue-50 dark:bg-blue-500/15', iconColor: 'text-blue-600' },
            { label: 'Avg Progress', value: `${avgProgress}%`, icon: TrendingUp, color: 'bg-indigo-50 dark:bg-indigo-500/15', iconColor: 'text-indigo-600' },
            { label: 'Completion Rate', value: `${completionRate}%`, icon: CheckCircle, color: 'bg-emerald-50 dark:bg-emerald-500/15', iconColor: 'text-emerald-600' },
            { label: 'Avg Quiz Score', value: `${avgQuizScore}%`, icon: Brain, color: 'bg-amber-50 dark:bg-amber-500/15', iconColor: 'text-amber-600' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
              >
                <Card className="p-5">
                  <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Charts and Data */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-card border border-border p-1 rounded-xl mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="quizzes">Quiz Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Progress Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={progressDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Completion Status</h3>
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
                      fill="#4f46e5"
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
                <h3 className="font-semibold text-foreground">Student Performance</h3>
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
                        <p className="font-semibold text-foreground">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
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
                        <p className="text-xs text-muted-foreground">Progress</p>
                        <p className="text-lg font-bold text-indigo-600">{student.progress}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Quizzes</p>
                        <p className="text-lg font-bold text-indigo-600">{student.quizzesTaken}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Score</p>
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
              <h3 className="font-semibold text-foreground mb-6">Quiz Performance Analysis</h3>
              
              {quizPerformance.length > 0 ? (
                <div className="space-y-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={quizPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="avgScore" fill="#4f46e5" name="Avg Score %" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="passRate" fill="#10B981" name="Pass Rate %" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="space-y-3">
                    {quizPerformance.map((quiz, idx) => (
                      <Card key={idx} className="p-4 bg-muted">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-foreground">{quiz.name}</h4>
                          <Badge variant="secondary">{quiz.attempts} attempts</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Average Score</p>
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
                            <p className="text-xs text-muted-foreground">Pass Rate</p>
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
                  <p className="text-muted-foreground">No quiz data available yet</p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}