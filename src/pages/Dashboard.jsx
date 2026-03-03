import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import usePullToRefresh from '@/components/lesson/usePullToRefresh';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button, Tabs, Tab, Card, Box, Typography, Container } from '@mui/material';
import { BookOpen, Clock, Award, ArrowRight, Sparkles, TrendingUp, Target, Zap, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import StatsOverview from '@/components/dashboard/StatsOverview';
import ProgressCard from '@/components/dashboard/ProgressCard';
import AchievementBadge from '@/components/dashboard/AchievementBadge';
import CourseProgressWidget from '@/components/dashboard/CourseProgressWidget';
import PointsDisplay from '@/components/gamification/PointsDisplay';
import Leaderboard from '@/components/gamification/Leaderboard';
import StreakTracker from '@/components/gamification/StreakTracker';
import UpcomingSessionsWidget from '@/components/sessions/UpcomingSessionsWidget';
import RecommendedCourses from '@/components/dashboard/RecommendedCourses';
import PersonalizedSubjects from '@/components/dashboard/PersonalizedSubjects';
import StudentReminders from '@/components/dashboard/StudentReminders';
import StudentAssignments from '@/components/dashboard/StudentAssignments';
import StudentQuizzes from '@/components/dashboard/StudentQuizzes';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [tabValue, setTabValue] = useState('in-progress');
  const [studentTab, setStudentTab] = useState('courses');
  const [accessDenied, setAccessDenied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
      
      // Redirect tutors to their dashboard instead of showing access denied
      if (userData?.is_tutor && userData?.role !== 'admin') {
        navigate(createPageUrl('TutorDashboardOverview'), { replace: true });
        return;
      }
      
      if (userData?.is_coordinator && !userData?.is_tutor) {
        setAccessDenied(true);
      }
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

  // Block tutors from accessing student dashboard
  if (accessDenied) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="sm">
          <Card sx={{ textAlign: 'center', py: 10, px: 4, borderRadius: 6, boxShadow: 4, border: 1, borderColor: 'divider' }}>
            <Box sx={{ width: 96, height: 96, background: 'linear-gradient(to bottom right, #ef4444, #dc2626)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 4, boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.2)' }}>
              <BookOpen size={48} color="white" />
            </Box>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>Access Denied</Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mb: 4 }}>
              This dashboard is for students only. You can access student information through the messaging system or your tutor dashboard.
            </Typography>
            <Link to={createPageUrl('Home')} style={{ textDecoration: 'none' }}>
              <Button 
                size="large"
                variant="contained"
                endIcon={<ArrowRight size={20} />}
                sx={{
                  background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
                  color: 'white',
                  borderRadius: 50,
                  px: 5,
                  py: 2,
                  fontSize: '1.125rem',
                  boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(to right, #4338ca, #6d28d9)',
                    boxShadow: 4
                  }
                }}
              >
                Back to Home
              </Button>
            </Link>
          </Card>
        </Container>
      </Box>
    );
  }

  const { isPulling, pullDistance } = usePullToRefresh(() => {
    queryClient?.invalidateQueries();
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 5 }}>
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ mb: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: 1 }}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Typography variant="h3" fontWeight={700} sx={{ mb: 1.5, fontSize: { xs: '2rem', md: '3rem' } }}>
                    {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Learner'}! 👋
                  </Typography>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Typography variant="h6" color="text.secondary">
                    Track your progress and continue your learning journey.
                  </Typography>
                </motion.div>
              </Box>
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
            </Box>
          </Box>
        </motion.div>

        {enrollments.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card sx={{ position: 'relative', overflow: 'hidden', textAlign: 'center', py: 10, px: 3, borderRadius: 6, boxShadow: 4, border: 1, borderColor: 'divider' }}>
              <Box sx={{ position: 'relative' }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <Box sx={{ width: 96, height: 96, background: 'linear-gradient(to bottom right, #6366f1, #7c3aed)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 4, boxShadow: '0 20px 25px -5px rgba(99, 102, 241, 0.2)' }}>
                    <Sparkles size={48} color="white" />
                  </Box>
                </motion.div>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>Start Your Learning Journey</Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 450, mx: 'auto', mb: 4 }}>
                  Explore our catalog of expert-led courses and begin building new skills today.
                </Typography>
                <Link to={createPageUrl('Explore')} style={{ textDecoration: 'none' }}>
                  <Button 
                    size="large"
                    variant="contained"
                    endIcon={<ArrowRight size={20} />}
                    sx={{
                      background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
                      color: 'white',
                      borderRadius: 50,
                      px: 5,
                      py: 2,
                      fontSize: '1.125rem',
                      boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(to right, #4338ca, #6d28d9)',
                        boxShadow: 4
                      }
                    }}
                  >
                    Browse Courses
                  </Button>
                </Link>
              </Box>
            </Card>
          </motion.div>
        ) : (
          <>
            {/* Personalized Subjects & Reminders */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 4, mb: 4 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <PersonalizedSubjects user={user} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <StudentReminders user={user} />
              </motion.div>
            </Box>

            {/* Stats Overview */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-10"
            >
              <StatsOverview 
                enrollments={enrollments} 
                courses={courses}
                achievements={achievements}
              />
            </motion.div>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 4 }}>
              {/* Main Content */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 4, boxShadow: 3 }}>
                    {/* Top-level student tabs */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                      {[
                        { key: 'courses', label: 'My Courses' },
                        { key: 'assignments', label: 'Assignments' },
                        { key: 'quizzes', label: 'Quizzes' },
                      ].map(tab => (
                        <button
                          key={tab.key}
                          onClick={() => setStudentTab(tab.key)}
                          style={{
                            padding: '8px 20px',
                            borderRadius: 20,
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: 14,
                            background: studentTab === tab.key ? '#4f46e5' : '#f3f4f6',
                            color: studentTab === tab.key ? '#fff' : '#374151',
                            transition: 'all 0.2s',
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </Box>

                    {studentTab === 'assignments' && (
                      <StudentAssignments enrollments={enrollments} user={user} />
                    )}

                    {studentTab === 'quizzes' && (
                      <StudentQuizzes enrollments={enrollments} user={user} />
                    )}

                    {studentTab === 'courses' && (
                      <>
                        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
                          <Tab 
                            value="in-progress"
                            icon={<Clock size={16} />}
                            iconPosition="start"
                            label={`In Progress (${inProgressEnrollments.length})`}
                            sx={{ fontWeight: 500, px: 3, py: 1.5 }}
                          />
                          <Tab 
                            value="completed"
                            icon={<Award size={16} />}
                            iconPosition="start"
                            label={`Completed (${completedEnrollments.length})`}
                            sx={{ fontWeight: 500, px: 3, py: 1.5 }}
                          />
                        </Tabs>

                        {tabValue === 'in-progress' && (
                          <Box sx={{ mt: 3 }}>
                            {loadingEnrollments ? (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                {[1, 2, 3].map(i => (
                                  <Card key={i} sx={{ p: 3, borderRadius: 4, border: 1, borderColor: 'divider' }} className="animate-pulse">
                                    <Box sx={{ display: 'flex', gap: 3 }}>
                                      <Box sx={{ width: 224, height: 128, bgcolor: 'action.hover', borderRadius: 3 }} />
                                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box sx={{ height: 24, bgcolor: 'action.hover', borderRadius: 1, width: '66%' }} />
                                        <Box sx={{ height: 16, bgcolor: 'action.hover', borderRadius: 1, width: '33%' }} />
                                        <Box sx={{ height: 12, bgcolor: 'action.hover', borderRadius: 1 }} />
                                      </Box>
                                    </Box>
                                  </Card>
                                ))}
                              </Box>
                            ) : inProgressEnrollments.length > 0 ? (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                {inProgressEnrollments.map((enrollment, index) => (
                                  <ProgressCard
                                    key={enrollment.id}
                                    enrollment={enrollment}
                                    course={courses.find(c => c.id === enrollment.course_id)}
                                    index={index}
                                  />
                                ))}
                              </Box>
                            ) : (
                              <Card sx={{ textAlign: 'center', py: 8, borderRadius: 4, border: 1, borderColor: 'divider' }}>
                                <Box sx={{ width: 64, height: 64, bgcolor: 'action.hover', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                                  <BookOpen size={32} color="#9ca3af" />
                                </Box>
                                <Typography variant="h6" sx={{ mb: 1 }}>No courses in progress</Typography>
                                <Typography variant="body2" color="text.secondary">Start learning to see your progress here</Typography>
                              </Card>
                            )}
                          </Box>
                        )}

                        {tabValue === 'completed' && (
                          <Box sx={{ mt: 3 }}>
                            {completedEnrollments.length > 0 ? (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                {completedEnrollments.map((enrollment, index) => (
                                  <ProgressCard
                                    key={enrollment.id}
                                    enrollment={enrollment}
                                    course={courses.find(c => c.id === enrollment.course_id)}
                                    index={index}
                                  />
                                ))}
                              </Box>
                            ) : (
                              <Card sx={{ textAlign: 'center', py: 8, borderRadius: 4, border: 1, borderColor: 'divider' }}>
                                <Box sx={{ width: 64, height: 64, bgcolor: 'action.hover', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                                  <Award size={32} color="#9ca3af" />
                                </Box>
                                <Typography variant="h6" sx={{ mb: 1 }}>No completed courses yet</Typography>
                                <Typography variant="body2" color="text.secondary">Complete your first course to earn achievements</Typography>
                              </Card>
                            )}
                          </Box>
                        )}
                      </>
                    )}
                  </Card>
                </motion.div>
              </Box>

              {/* Sidebar */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                  <Card sx={{ p: 3, borderRadius: 4, boxShadow: 3, border: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                      <Typography variant="h6" fontWeight={600}>Achievements</Typography>
                      <Box sx={{ width: 40, height: 40, background: 'linear-gradient(to bottom right, #f59e0b, #ea580c)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 3 }}>
                        <Award size={20} color="white" />
                      </Box>
                    </Box>
                    
                    {achievements.length > 0 ? (
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                        {achievements.slice(0, 6).map((achievement, index) => (
                          <AchievementBadge 
                            key={achievement.id} 
                            achievement={achievement}
                            index={index}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Box sx={{ width: 64, height: 64, bgcolor: 'action.hover', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                          <Award size={32} color="#9ca3af" />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Complete courses to earn achievements!
                        </Typography>
                      </Box>
                    )}
                  </Card>

                  {/* Message Center Quick Access */}
                  <Card sx={{ p: 3, borderRadius: 4, border: 1, borderColor: 'divider', boxShadow: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                      <Box sx={{ width: 36, height: 36, bgcolor: '#eef2ff', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MessageSquare size={18} color="#4f46e5" />
                      </Box>
                      <Typography variant="subtitle1" fontWeight={600}>Messages</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Chat with your tutors and coordinators directly.
                    </Typography>
                    <Link to={createPageUrl('MessageCenter')} style={{ textDecoration: 'none' }}>
                      <Button fullWidth variant="outlined" sx={{ borderRadius: 2 }}>
                        Open Message Center
                      </Button>
                    </Link>
                  </Card>

              {/* Call to Action */}
                  <Card sx={{ position: 'relative', overflow: 'hidden', bgcolor: 'primary.main', color: 'primary.contrastText', p: 3, borderRadius: 4, boxShadow: 6 }}>
                    <Box sx={{ position: 'relative' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Zap size={20} />
                        <Typography variant="h6" fontWeight={700}>Continue Learning</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2.5, lineHeight: 1.6 }}>
                        Discover new courses that match your interests and accelerate your growth.
                      </Typography>
                      <Link to={createPageUrl('Explore')} style={{ textDecoration: 'none' }}>
                        <Button 
                          fullWidth
                          variant="contained"
                          endIcon={<ArrowRight size={16} />}
                          sx={{
                            bgcolor: 'background.paper',
                            color: 'primary.main',
                            fontWeight: 600,
                            boxShadow: 3,
                            '&:hover': {
                              bgcolor: 'background.paper',
                              opacity: 0.9,
                              transform: 'scale(1.05)'
                            }
                          }}
                        >
                          Explore More
                        </Button>
                      </Link>
                    </Box>
                  </Card>
                </Box>
              </motion.div>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}