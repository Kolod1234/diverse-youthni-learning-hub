import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, Button, Tabs, Tab, Box, Typography, Container } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import PsychologyIcon from '@mui/icons-material/Psychology';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TimelineIcon from '@mui/icons-material/Timeline';
const _w = (I) => ({ size, color, className, style, ...r }) => <I className={className} style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const TrendingUp = _w(TrendingUpIcon), Target = _w(GpsFixedIcon), Brain = _w(PsychologyIcon), Award = _w(EmojiEventsIcon);
const ArrowLeft = _w(ArrowBackIcon), BarChart3 = _w(BarChartIcon), PieChart = _w(PieChartIcon), Activity = _w(TimelineIcon);
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

  const [tabValue, setTabValue] = useState('overview');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="text" startIcon={<ArrowLeft size={16} />} sx={{ mb: 2 }}>
                Back to Dashboard
              </Button>
            </Link>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                Learning Analytics 📊
              </Typography>
              <Typography color="text.secondary">
                Detailed insights into your learning journey and performance
              </Typography>
            </motion.div>
          </Box>
          <PointsDisplay 
            points={userProgress?.points || 0} 
            level={userProgress?.level || 1}
          />
        </Box>

        {/* Quick Stats */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' }, gap: 2, mb: 4 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card sx={{ p: 2, bgcolor: 'action.hover', border: 1, borderColor: '#60a5fa' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 40, height: 40, bgcolor: '#dbeafe', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={20} color="#2563eb" />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700}>{avgProgress}%</Typography>
                  <Typography variant="caption" color="text.secondary">Avg Progress</Typography>
                </Box>
              </Box>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-4 bg-indigo-50 dark:bg-indigo-500/15 border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-500/15 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{completedCourses}/{totalCourses}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-4 bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/15 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{avgScore}%</p>
                  <p className="text-xs text-muted-foreground">Quiz Average</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-4 bg-indigo-50 dark:bg-indigo-500/15 border-orange-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-500/15 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{userProgress?.streak_days || 0}</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-4 bg-indigo-50 dark:bg-indigo-500/15 border-pink-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-500/15 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{achievements.length}</p>
                  <p className="text-xs text-muted-foreground">Achievements</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </Box>

        {/* Main Content */}
        <Box>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tab value="overview" icon={<BarChart3 size={16} />} iconPosition="start" label="Learning Path" />
            <Tab value="performance" icon={<PieChart size={16} />} iconPosition="start" label="Quiz Performance" />
            <Tab value="feedback" icon={<Brain size={16} />} iconPosition="start" label="AI Insights" />
          </Tabs>

          {tabValue === 'overview' && (
            <LearningPathVisualization 
              enrollments={enrollments}
              courses={courses}
              userProgress={userProgress}
            />
          )}

          {tabValue === 'performance' && (
            <QuizPerformanceAnalysis 
              quizAttempts={quizAttempts}
              enrollments={enrollments}
              courses={courses}
            />
          )}

          {tabValue === 'feedback' && (
            <PersonalizedFeedback 
              enrollments={enrollments}
              quizAttempts={quizAttempts}
              courses={courses}
              userProgress={userProgress}
            />
          )}
        </Box>
      </Container>
    </Box>
  );
}