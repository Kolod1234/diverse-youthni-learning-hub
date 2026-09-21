import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Box, Container, Typography, Card, Button, Chip, Avatar, Stack, Tabs, Tab, LinearProgress, CircularProgress
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ChatIcon from '@mui/icons-material/Chat';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MailIcon from '@mui/icons-material/Mail';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PointsBreakdownPanel from '@/components/students/PointsBreakdownPanel';

export default function AdminUserProfile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState('enrollments');
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('userId');

  useEffect(() => {
    base44.auth.me().then((userData) => {
      if (userData.role !== 'admin') {
        window.location.href = createPageUrl('Home');
        return;
      }
      setCurrentUser(userData);
    });
  }, []);

  const { data: targetUser } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      const users = await base44.entities.User.filter({ id: userId });
      return users[0];
    },
    enabled: !!userId,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['user-enrollments', targetUser?.email],
    queryFn: () => base44.entities.Enrollment.filter({ created_by: targetUser.email }),
    enabled: !!targetUser?.email,
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ['user-certificates', targetUser?.email],
    queryFn: () => base44.entities.Certificate.filter({ student_name: targetUser.full_name }),
    enabled: !!targetUser?.full_name,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['user-reviews', targetUser?.email],
    queryFn: () => base44.entities.Review.filter({ created_by: targetUser.email }),
    enabled: !!targetUser?.email,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['user-messages', targetUser?.email],
    queryFn: () => base44.entities.Message.filter({ sender_email: targetUser.email }),
    enabled: !!targetUser?.email,
  });

  const { data: allCourses = [] } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 500),
  });

  if (!currentUser || !targetUser) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#ea580c' }} />
      </Box>
    );
  }

  const completedEnrollments = enrollments.filter(e => e.is_completed);
  const totalProgress = enrollments.length > 0
    ? enrollments.reduce((sum, e) => sum + (e.progress_percent || 0), 0) / enrollments.length
    : 0;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Button component={Link} to={createPageUrl('AdminUsers')} startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />} sx={{ mb: 2 }}>
            Back to Users
          </Button>
          <Card sx={{ p: 3 }}>
            <Stack direction="row" spacing={3} alignItems="flex-start">
              <Avatar src={targetUser.avatar} sx={{ width: 96, height: 96, bgcolor: '#ffedd5', color: '#ea580c', fontSize: '2rem' }}>
                {targetUser.full_name?.charAt(0) || 'U'}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>{targetUser.full_name}</Typography>
                    <Typography color="text.secondary" sx={{ mb: 1.5 }}>{targetUser.email}</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {targetUser.role === 'admin' && <Chip label="Admin" size="small" sx={{ bgcolor: '#fee2e2', color: '#991b1b' }} />}
                      {targetUser.is_tutor && <Chip label="Tutor" size="small" sx={{ bgcolor: '#f3e8ff', color: '#6b21a8' }} />}
                      {targetUser.is_coordinator && <Chip label="Coordinator" size="small" sx={{ bgcolor: '#dbeafe', color: '#1d4ed8' }} />}
                      {targetUser.is_suspended && <Chip label="Suspended" size="small" color="error" />}
                    </Stack>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary">Joined</Typography>
                    <Typography fontWeight={500}>{new Date(targetUser.created_date).toLocaleDateString()}</Typography>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </Card>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
          {[
            { label: 'Enrolled Courses', value: enrollments.length, Icon: MenuBookIcon, bg: '#dbeafe', color: '#2563eb' },
            { label: 'Completed', value: completedEnrollments.length, Icon: EmojiEventsIcon, bg: '#dcfce7', color: '#16a34a' },
            { label: 'Avg Progress', value: `${Math.round(totalProgress)}%`, Icon: TrendingUpIcon, bg: '#f3e8ff', color: '#9333ea' },
            { label: 'Messages Sent', value: messages.length, Icon: ChatIcon, bg: '#fef3c7', color: '#d97706' },
          ].map((s) => (
            <Card key={s.label} sx={{ p: 2 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.Icon sx={{ fontSize: 20, color: s.color }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700}>{s.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                </Box>
              </Stack>
            </Card>
          ))}
        </Box>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tab value="enrollments" label={`Enrollments (${enrollments.length})`} />
          <Tab value="certificates" label={`Certificates (${certificates.length})`} />
          <Tab value="reviews" label={`Reviews (${reviews.length})`} />
          <Tab value="points" label="Points Breakdown" />
          <Tab value="activity" label="Activity" />
        </Tabs>

        {tab === 'enrollments' && (
          <Stack spacing={1.5}>
            {enrollments.map((enrollment) => {
              const course = allCourses.find(c => c.id === enrollment.course_id);
              return (
                <Card key={enrollment.id} sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={600} sx={{ mb: 1 }}>{course?.title || 'Unknown Course'}</Typography>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ maxWidth: 400 }}>
                        <LinearProgress variant="determinate" value={enrollment.progress_percent || 0} sx={{ flex: 1, height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { bgcolor: '#ea580c' } }} />
                        <Typography variant="body2" fontWeight={500}>{enrollment.progress_percent || 0}%</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Chip label={`${enrollment.completed_lessons?.length || 0} lessons completed`} size="small" variant="outlined" />
                        {enrollment.is_completed && <Chip label="Completed" size="small" sx={{ bgcolor: '#dcfce7', color: '#15803d' }} />}
                      </Stack>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" color="text.secondary">Enrolled</Typography>
                      <Typography variant="body2" fontWeight={500}>{new Date(enrollment.created_date).toLocaleDateString()}</Typography>
                    </Box>
                  </Stack>
                </Card>
              );
            })}
            {enrollments.length === 0 && (
              <Card sx={{ p: 6, textAlign: 'center' }}>
                <MenuBookIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
                <Typography color="text.secondary">No course enrollments</Typography>
              </Card>
            )}
          </Stack>
        )}

        {tab === 'certificates' && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
            {certificates.map((cert) => (
              <Card key={cert.id} sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar sx={{ bgcolor: '#fef3c7', color: '#d97706', width: 48, height: 48 }}>
                    <EmojiEventsIcon />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={600} sx={{ mb: 0.5 }}>{cert.course_title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Certificate #{cert.certificate_number}</Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'text.secondary' }}>
                      <CalendarTodayIcon sx={{ fontSize: 16 }} />
                      <Typography variant="body2">Issued {new Date(cert.issue_date).toLocaleDateString()}</Typography>
                    </Stack>
                    {cert.final_score && (
                      <Typography variant="body2" fontWeight={500} sx={{ color: '#16a34a', mt: 1 }}>
                        Final Score: {cert.final_score}%
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Card>
            ))}
            {certificates.length === 0 && (
              <Card sx={{ gridColumn: '1 / -1', p: 6, textAlign: 'center' }}>
                <EmojiEventsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
                <Typography color="text.secondary">No certificates issued</Typography>
              </Card>
            )}
          </Box>
        )}

        {tab === 'reviews' && (
          <Stack spacing={1.5}>
            {reviews.map((review) => {
              const course = allCourses.find(c => c.id === review.course_id);
              return (
                <Card key={review.id} sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                    <Box>
                      <Typography fontWeight={600}>{course?.title || 'Unknown Course'}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                        <Box sx={{ display: 'flex' }}>
                          {[...Array(5)].map((_, i) => (
                            <span key={i} style={{ color: i < review.rating ? '#fbbf24' : '#d1d5db' }}>★</span>
                          ))}
                        </Box>
                        <Chip label={review.rating_type} size="small" variant="outlined" sx={{ textTransform: 'capitalize' }} />
                      </Stack>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(review.created_date).toLocaleDateString()}
                    </Typography>
                  </Stack>
                  {review.comment && <Typography variant="body2" color="text.secondary">{review.comment}</Typography>}
                </Card>
              );
            })}
            {reviews.length === 0 && (
              <Card sx={{ p: 6, textAlign: 'center' }}>
                <ChatIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
                <Typography color="text.secondary">No reviews submitted</Typography>
              </Card>
            )}
          </Stack>
        )}

        {tab === 'points' && (
          <Card sx={{ p: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <EmojiEventsIcon sx={{ fontSize: 22, color: '#ea580c' }} />
              <Typography fontWeight={700}>Ranking Points Breakdown</Typography>
            </Stack>
            <PointsBreakdownPanel userId={userId} />
          </Card>
        )}

        {tab === 'activity' && (
          <Stack spacing={1.5}>
            {messages.map((msg) => (
              <Card key={msg.id} sx={{ p: 2 }}>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <MailIcon sx={{ fontSize: 20, color: 'text.disabled', mt: 0.5 }} />
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={500}>Sent message to {msg.recipient_email}</Typography>
                      <Typography variant="caption" color="text.secondary">{new Date(msg.created_date).toLocaleDateString()}</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">{msg.content}</Typography>
                  </Box>
                </Stack>
              </Card>
            ))}
            {messages.length === 0 && (
              <Card sx={{ p: 6, textAlign: 'center' }}>
                <AccessTimeIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
                <Typography color="text.secondary">No recent activity</Typography>
              </Card>
            )}
          </Stack>
        )}
      </Container>
    </Box>
  );
}