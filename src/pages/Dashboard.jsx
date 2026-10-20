import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import usePullToRefresh from '@/components/lesson/usePullToRefresh';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button, Tabs, Tab, Card, Box, Typography, Container, Chip } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import BoltIcon from '@mui/icons-material/Bolt';
import ChatIcon from '@mui/icons-material/Chat';
const iconWrap = (IconCmp) => ({ size, color, ...rest }) => <IconCmp sx={{ fontSize: size || 16, color: color || 'inherit' }} {...rest} />;
const BookOpen = iconWrap(MenuBookIcon);
const Clock = iconWrap(AccessTimeIcon);
const Award = iconWrap(EmojiEventsIcon);
const ArrowRight = iconWrap(ArrowForwardIcon);
const Sparkles = iconWrap(AutoAwesomeIcon);
const TrendingUp = iconWrap(TrendingUpIcon);
const Target = iconWrap(GpsFixedIcon);
const Zap = iconWrap(BoltIcon);
const MessageSquare = iconWrap(ChatIcon);
import AchievementBadge from '@/components/dashboard/AchievementBadge';
import Leaderboard from '@/components/gamification/Leaderboard';
import UpcomingSessionsWidget from '@/components/sessions/UpcomingSessionsWidget';
import RecommendedCourses from '@/components/dashboard/RecommendedCourses';
import PersonalizedSubjects from '@/components/dashboard/PersonalizedSubjects';
import StudentReminders from '@/components/dashboard/StudentReminders';
import StudentAssignments from '@/components/dashboard/StudentAssignments';
import StudentQuizzes from '@/components/dashboard/StudentQuizzes';
import ParentalConsentCountdown from '@/components/dashboard/ParentalConsentCountdown';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [tabValue, setTabValue] = useState('in-progress');
  const [studentTab, setStudentTab] = useState('courses');
  const [accessDenied, setAccessDenied] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isPulling, pullDistance } = usePullToRefresh(() => {
    queryClient.invalidateQueries();
  });

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

  const { data: topicPoints } = useQuery({
    queryKey: ['topic-points', user?.id],
    enabled: !!user?.id,
    queryFn: async () => (await base44.functions.invoke('publicScoreboardData', { type: 'points', qualification: 'gcse', limit: 1 })).data.totals,
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



  // Redesign (wireframe M5): one big "pick up where you left off" card, simple stats,
  // course progress rows, and the existing helper widgets in a calm sidebar.
  const resumeEnrollment = inProgressEnrollments[0];
  const resumeCourse = resumeEnrollment && courses.find(c => c.id === resumeEnrollment.course_id);
  const resumeHref = resumeCourse
    ? (resumeEnrollment.current_lesson_id
        ? `${createPageUrl('LessonPlayerClassic')}?course=${resumeCourse.id}&lesson=${resumeEnrollment.current_lesson_id}`
        : `${createPageUrl('CourseDetails')}?id=${resumeCourse.id}`)
    : null;
  const pct = (e) => Math.min(100, Math.round(e?.progress_percent || 0));
  const statTiles = [
    { label: 'In progress', value: inProgressEnrollments.length },
    { label: 'Completed', value: completedEnrollments.length },
    { label: 'Study streak', value: `${userProgress?.streak_days || 0} days` },
    { label: 'Achievements', value: achievements.length },
  ];
  const listed = tabValue === 'completed' ? completedEnrollments : inProgressEnrollments;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography component="h1" sx={{ fontSize: { xs: '1.75rem', md: '2rem' }, fontWeight: 700 }}>
              {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Learner'}
            </Typography>
            <Typography color="text.secondary">Here's where you are with your learning.</Typography>
          </Box>
          <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <Typography variant="body2" color="text.secondary">Topic-check points (best score per topic)</Typography>
            <Typography fontWeight={700}>GCSE {topicPoints?.gcse?.toLocaleString() ?? '—'} · A-level {topicPoints?.alevel?.toLocaleString() ?? '—'}</Typography>
          </Box>
        </Box>

        <ParentalConsentCountdown user={user} />

        {enrollments.length === 0 && !loadingEnrollments ? (
          <Card sx={{ textAlign: 'center', py: 8, px: 3 }}>
            <BookOpen size={48} color="#4f46e5" />
            <Typography variant="h5" fontWeight={700} sx={{ mt: 2, mb: 1 }}>Start your learning journey</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>Pick a free course to begin. Your progress will show here.</Typography>
            <Button component={Link} to={createPageUrl('Explore')} variant="contained">Browse courses</Button>
          </Card>
        ) : (
          <>
            {resumeCourse && (
              <Box component={Link} to={resumeHref}
                sx={{ bgcolor: '#0b2f5c', color: '#fff', borderRadius: '14px', p: { xs: 2.5, md: 3 }, textDecoration: 'none', display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between',
                  '&:hover': { bgcolor: '#12396b' } }}>
                <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: '#dbe4f0' }}>PICK UP WHERE YOU LEFT OFF</Typography>
                  <Typography sx={{ fontSize: '1.375rem', fontWeight: 700, my: 0.5 }}>{resumeCourse.title}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, maxWidth: 420 }}>
                    <Box sx={{ flexGrow: 1, height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', width: `${pct(resumeEnrollment)}%`, bgcolor: '#16a34a' }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#dbe4f0' }}>{pct(resumeEnrollment)}%</Typography>
                  </Box>
                </Box>
                <Box sx={{ minHeight: 48, px: 3, display: 'inline-flex', alignItems: 'center', borderRadius: '10px', bgcolor: '#fff', color: '#0b2f5c', fontWeight: 700 }}>Continue</Box>
              </Box>
            )}

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: 2 }}>
              {statTiles.map(s => (
                <Card key={s.label} sx={{ p: 2.25 }}>
                  <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 700 }}>{s.value}</Typography>
                </Card>
              ))}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 3 }}>
              <PersonalizedSubjects user={user} />
              <StudentReminders user={user} />
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'flex-start' }}>
              <Card sx={{ flex: '999 1 520px', minWidth: 0, p: { xs: 2, md: 3 } }}>
                <Tabs value={studentTab} onChange={(e, v) => setStudentTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Tab value="courses" label="My courses" />
                  <Tab value="assignments" label="Assignments" />
                  <Tab value="quizzes" label="Quizzes" />
                </Tabs>

                {studentTab === 'assignments' && <StudentAssignments enrollments={enrollments} user={user} />}
                {studentTab === 'quizzes' && <StudentQuizzes enrollments={enrollments} user={user} />}

                {studentTab === 'courses' && (
                  <>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                      {[['in-progress', `In progress (${inProgressEnrollments.length})`], ['completed', `Completed (${completedEnrollments.length})`]].map(([v, l]) => (
                        <Chip key={v} label={l} onClick={() => setTabValue(v)} color={tabValue === v ? 'primary' : 'default'} variant={tabValue === v ? 'filled' : 'outlined'} sx={{ height: 36 }} />
                      ))}
                    </Box>
                    {loadingEnrollments ? (
                      [1, 2, 3].map(i => <Box key={i} sx={{ height: 56, my: 1, borderRadius: 2, bgcolor: 'action.hover' }} />)
                    ) : listed.length > 0 ? (
                      listed.map(e => {
                        const c = courses.find(x => x.id === e.course_id);
                        if (!c) return null;
                        return (
                          <Box key={e.id} component={Link} to={`${createPageUrl('CourseDetails')}?id=${c.id}`}
                            sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, py: 1.5, borderTop: 1, borderColor: 'divider', color: 'text.primary', textDecoration: 'none', '&:hover .title': { color: 'primary.main' } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                              <Typography className="title" fontWeight={500}>{c.title}</Typography>
                              <Typography color="text.secondary">{tabValue === 'completed' ? 'Done' : `${pct(e)}%`}</Typography>
                            </Box>
                            <Box sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover', overflow: 'hidden' }}>
                              <Box sx={{ height: '100%', width: `${tabValue === 'completed' ? 100 : pct(e)}%`, bgcolor: 'success.main' }} />
                            </Box>
                          </Box>
                        );
                      })
                    ) : (
                      <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                        {tabValue === 'completed' ? 'No completed courses yet.' : 'No courses in progress.'}
                      </Typography>
                    )}
                  </>
                )}
              </Card>

              <Box sx={{ flex: '1 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <UpcomingSessionsWidget user={user} />
                <Card sx={{ p: 2.5 }}>
                  <Typography component="h2" sx={{ fontSize: '1.125rem', fontWeight: 700, mb: 1.5 }}>Achievements</Typography>
                  {achievements.length > 0 ? (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.5 }}>
                      {achievements.slice(0, 6).map((a, i) => <AchievementBadge key={a.id} achievement={a} index={i} />)}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">Finish lessons and topic checks to earn your first badge.</Typography>
                  )}
                </Card>
                <Leaderboard limit={5} />
                <RecommendedCourses userEnrollments={enrollments} />
                <Card sx={{ p: 2.5 }}>
                  <Typography component="h2" sx={{ fontSize: '1.125rem', fontWeight: 700, mb: 0.5 }}>Messages</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Chat with your tutors and coordinators.</Typography>
                  <Button component={Link} to={createPageUrl('MessageCenter')} fullWidth variant="outlined">Open messages</Button>
                </Card>
              </Box>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}
