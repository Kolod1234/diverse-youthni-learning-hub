import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Container, Box, Typography, Card, CardContent, LinearProgress, Grid, Chip, Avatar } from '@mui/material';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, Calendar, BookOpen, Award, Users, ClipboardList, 
  Target, Clock, ArrowRight, Zap, CheckCircle, AlertCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { format, isAfter, isBefore, addDays } from 'date-fns';

export default function PersonalDashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const interestType = user?.interest_type || 'learning';

  // Fetch data based on pathway
  const { data: enrollments = [] } = useQuery({
    queryKey: ['user-enrollments'],
    queryFn: () => base44.entities.Enrollment.filter({ created_by: user?.email }),
    enabled: !!user && interestType === 'learning',
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['user-courses'],
    queryFn: async () => {
      if (enrollments.length === 0) return [];
      const courseIds = enrollments.map(e => e.course_id);
      return base44.entities.Course.list('-created_date', 1000).then(courses => 
        courses.filter(c => courseIds.includes(c.id))
      );
    },
    enabled: enrollments.length > 0,
  });

  const { data: participations = [] } = useQuery({
    queryKey: ['user-participations'],
    queryFn: () => base44.entities.ProgramParticipant.filter({ participant_email: user?.email }),
    enabled: !!user && interestType === 'leadership',
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['user-programs'],
    queryFn: async () => {
      if (participations.length === 0) return [];
      const programIds = participations.map(p => p.program_id);
      const allPrograms = await base44.entities.Program.list('-created_date', 1000);
      return allPrograms.filter(p => programIds.includes(p.id));
    },
    enabled: participations.length > 0,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['upcoming-activities'],
    queryFn: async () => {
      if (participations.length === 0) return [];
      const programIds = participations.map(p => p.program_id);
      const allActivities = await base44.entities.Activity.list('-activity_date', 50);
      const today = new Date();
      const nextWeek = addDays(today, 7);
      return allActivities.filter(a => {
        const activityDate = new Date(a.activity_date);
        return programIds.includes(a.program_id) && 
               isAfter(activityDate, today) && 
               isBefore(activityDate, nextWeek);
      });
    },
    enabled: participations.length > 0,
  });

  const { data: userProgress } = useQuery({
    queryKey: ['user-progress', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ created_by: user?.email }).then(p => p[0]),
    enabled: !!user,
  });

  const { data: logbooks = [] } = useQuery({
    queryKey: ['user-logbooks'],
    queryFn: () => base44.entities.Logbook.filter({ participant_email: user?.email }, '-created_date', 10),
    enabled: !!user && interestType === 'leadership',
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['user-messages'],
    queryFn: async () => {
      const received = await base44.entities.Message.filter({ recipient_email: user?.email }, '-created_date', 5);
      return received.filter(m => !m.is_read);
    },
    enabled: !!user && interestType === 'leadership',
  });

  const { data: qualifications = [] } = useQuery({
    queryKey: ['user-qualifications'],
    queryFn: () => base44.entities.YouthWorkQualification.filter({ created_by: user?.email }),
    enabled: !!user && interestType === 'youth_work',
  });

  const pendingLogbooks = logbooks.filter(l => !l.is_approved).length;
  const approvedLogbooks = logbooks.filter(l => l.is_approved).length;

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  const getPathwayConfig = () => {
    switch (interestType) {
      case 'leadership':
        return {
          title: 'Leadership Development',
          icon: Users,
          color: '#4f46e5',
          gradient: '#4f46e5',
          stats: [
            { label: 'My Programs', value: programs.length, icon: ClipboardList },
            { label: 'Upcoming Activities', value: activities.length, icon: Calendar },
            { label: 'Logbooks Approved', value: approvedLogbooks, icon: CheckCircle },
            { label: 'Pending Review', value: pendingLogbooks, icon: Clock },
            { label: 'Unread Messages', value: messages.length, icon: AlertCircle },
          ],
        };
      case 'youth_work':
        return {
          title: 'Youth Work (OCN)',
          icon: Award,
          color: '#10b981',
          gradient: '#4f46e5',
          stats: [
            { label: 'Qualifications', value: qualifications.length, icon: Award },
            { label: 'Units Completed', value: qualifications.filter(q => q.status === 'completed').length, icon: CheckCircle },
            { label: 'In Progress', value: qualifications.filter(q => q.status === 'in_progress').length, icon: Clock },
          ],
        };
      default:
        return {
          title: 'GCSE & A-Level Learning',
          icon: BookOpen,
          color: '#3b82f6',
          gradient: '#4f46e5',
          stats: [
            { label: 'Enrolled Courses', value: enrollments.length, icon: BookOpen },
            { label: 'Lessons Completed', value: userProgress?.total_lessons_completed || 0, icon: CheckCircle },
            { label: 'Current Streak', value: `${userProgress?.streak_days || 0} days`, icon: Zap },
          ],
        };
    }
  };

  const config = getPathwayConfig();
  const PathwayIcon = config.icon;

  const getQuickActions = () => {
    switch (interestType) {
      case 'leadership':
        return [
          { label: 'My Programs', icon: Users, path: 'Programs', color: '#4f46e5' },
          { label: 'View Schedule', icon: Calendar, path: 'Programs', color: '#c026d3' },
          { label: 'Submit Logbook', icon: ClipboardList, path: 'Programs', color: '#4f46e5' },
          { label: 'Messages', icon: AlertCircle, path: 'MessageCenter', color: '#ec4899' },
        ];
      case 'youth_work':
        return [
          { label: 'My Workbooks', icon: BookOpen, path: 'YouthWorkWorkbook', color: '#10b981' },
          { label: 'Attendance', icon: CheckCircle, path: 'YouthWork', color: '#059669' },
          { label: 'Certificates', icon: Award, path: 'YouthWork', color: '#34d399' },
        ];
      default:
        return [
          { label: 'Browse Courses', icon: BookOpen, path: 'Explore', color: '#3b82f6' },
          { label: 'My Learning', icon: TrendingUp, path: 'Dashboard', color: '#06b6d4' },
          { label: 'Library', icon: BookOpen, path: 'Library', color: '#0ea5e9' },
        ];
    }
  };

  const quickActions = getQuickActions();

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <motion.div>
          <Box sx={{ mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: config.color, width: 56, height: 56 }}>
                <PathwayIcon size={28} color="white" />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Welcome back, {user.full_name}!
                </Typography>
                <Chip 
                  label={config.title} 
                  sx={{ mt: 1, background: config.gradient, color: 'white', fontWeight: 600 }}
                />
              </Box>
            </Box>
          </Box>
        </motion.div>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {config.stats.slice(0, 3).map((stat, index) => {
            const StatIcon = stat.icon;
            return (
              <Grid size={{ xs: 12, md: 4 }} key={stat.label}>
                <motion.div


                >
                  <Card sx={{ boxShadow: 3, '&:hover': { boxShadow: 6 }, transition: 'all 0.3s' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
                            {stat.label}
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {stat.value}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 3,
                            background: config.gradient,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <StatIcon size={28} color="white" />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>

        {/* Quick Actions */}
        <motion.div>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Quick Actions</Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {quickActions.map((action, index) => {
              const ActionIcon = action.icon;
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={action.label}>
                  <Link to={createPageUrl(action.path)} style={{ textDecoration: 'none' }}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer', 
                        transition: 'all 0.3s',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2,
                              bgcolor: action.color + '20',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <ActionIcon size={24} color={action.color} />
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                            {action.label}
                          </Typography>
                          <ArrowRight size={20} color={action.color} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Link>
                </Grid>
              );
            })}
          </Grid>
        </motion.div>

        {/* My Programs Section */}
        {interestType === 'leadership' && programs.length > 0 && (
          <motion.div>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>My Programs</Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {programs.map((program) => {
                const participation = participations.find(p => p.program_id === program.id);
                return (
                  <Grid size={{ xs: 12, md: 6 }} key={program.id}>
                    <Card sx={{ boxShadow: 3, '&:hover': { boxShadow: 6 }, transition: 'all 0.3s' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', mb: 2 }}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                              {program.name}
                            </Typography>
                            <Chip 
                              label={program.status} 
                              size="small"
                              sx={{ bgcolor: '#10b981', color: 'white' }}
                            />
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {program.description}
                        </Typography>
                        {participation?.current_task && (
                          <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 2, mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">Current Task:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {participation.current_task}
                            </Typography>
                          </Box>
                        )}
                        <Link to={createPageUrl('Programs')} style={{ textDecoration: 'none' }}>
                          <Button size="sm" className="w-full">
                            View Details <ArrowRight className="ml-2" size={16} />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </motion.div>
        )}

        {/* Recent Logbooks */}
        {interestType === 'leadership' && logbooks.length > 0 && (
          <motion.div>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Recent Logbooks</Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {logbooks.slice(0, 3).map((logbook) => (
                <Grid size={{ xs: 12, md: 4 }} key={logbook.id}>
                  <Card sx={{ boxShadow: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <ClipboardList size={20} color={logbook.is_approved ? '#10b981' : '#f59e0b'} />
                        <Chip 
                          label={logbook.is_approved ? 'Approved' : 'Pending Review'}
                          size="small"
                          sx={{ 
                            bgcolor: logbook.is_approved ? '#10b981' : '#f59e0b',
                            color: 'white'
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Week {logbook.week_number} • {format(new Date(logbook.entry_date), 'MMM d, yyyy')}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Duty:</strong> {logbook.duty_for_week}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {logbook.hours_per_week} hours
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}

        {/* Pathway-Specific Content */}
        {interestType === 'leadership' && activities.length > 0 && (
          <motion.div>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Upcoming Activities</Typography>
            <Grid container spacing={3}>
              {activities.slice(0, 3).map((activity) => (
                <Grid size={{ xs: 12, md: 4 }} key={activity.id}>
                  <Card sx={{ boxShadow: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Calendar size={20} color="#7c3aed" />
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(activity.activity_date), 'MMM d, yyyy')}
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {activity.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {activity.description?.substring(0, 100)}...
                      </Typography>
                      {activity.location && (
                        <Typography variant="caption" color="text.secondary">
                          📍 {activity.location}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}

        {interestType === 'learning' && enrollments.length > 0 && (
          <motion.div>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Continue Learning</Typography>
            <Grid container spacing={3}>
              {courses.slice(0, 3).map((course) => {
                const enrollment = enrollments.find(e => e.course_id === course.id);
                return (
                  <Grid size={{ xs: 12, md: 4 }} key={course.id}>
                    <Link to={createPageUrl(`CourseDetails?id=${course.id}`)} style={{ textDecoration: 'none' }}>
                      <Card sx={{ boxShadow: 3, '&:hover': { boxShadow: 6 }, transition: 'all 0.3s' }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            {course.title}
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" color="text.secondary">Progress</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {enrollment?.progress_percent || 0}%
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={enrollment?.progress_percent || 0}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                          <Button size="sm" className="w-full">
                            Continue <ArrowRight className="ml-2" size={16} />
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
                  </Grid>
                );
              })}
            </Grid>
          </motion.div>
        )}
      </Container>
    </Box>
  );
}