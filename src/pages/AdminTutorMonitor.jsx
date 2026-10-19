import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Box, Container, Typography, Card, Button, TextField, Chip, Avatar, Stack, Tabs, Tab,
  IconButton, CircularProgress
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ChatIcon from '@mui/icons-material/Chat';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SendIcon from '@mui/icons-material/Send';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminTutorMonitor() {
  const queryClient = useQueryClient();
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [reminderOpen, setReminderOpen] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');
  const [reminderSubject, setReminderSubject] = useState('');
  const [tab, setTab] = useState('courses');

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users-for-monitor'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getAllTutors');
      return res.data?.users || [];
    },
  });

  const tutors = allUsers.filter(u => u.is_tutor || u.role === 'admin');

  const { data: courses = [] } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 500),
  });

  const { data: availability = [] } = useQuery({
    queryKey: ['all-tutor-availability'],
    queryFn: () => base44.entities.TutorAvailability.list('-created_date', 500),
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['all-bookings'],
    queryFn: () => base44.entities.SessionBooking.list('-created_date', 500),
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['ungraded-submissions'],
    queryFn: () => base44.entities.Submission.filter({ is_graded: false }, '-created_date', 200),
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['all-assignments'],
    queryFn: () => base44.entities.Assignment.list('-created_date', 200),
  });

  const sendChatMutation = useMutation({
    mutationFn: async ({ tutorEmail, tutorName, message }) => {
      const existing = await base44.entities.ChatRoom.filter({ type: 'direct' }, '-created_date', 500);
      let room = existing.find(r =>
        r.participant_emails?.includes(tutorEmail) && r.participant_emails?.includes('admin')
      );
      if (!room) {
        room = await base44.entities.ChatRoom.create({
          type: 'direct',
          participant_emails: ['admin', tutorEmail],
          title: `Admin ↔ ${tutorName}`
        });
      }
      const me = await base44.auth.me();
      await base44.entities.ChatMessage.create({
        room_id: room.id,
        sender_email: me.email,
        sender_name: me.full_name || 'Admin',
        content: message,
        type: 'text'
      });
      await base44.entities.ChatRoom.update(room.id, {
        last_message: message,
        last_message_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      toast.success('Message sent to tutor');
      setChatMessage('');
      setChatOpen(false);
    },
    onError: () => toast.error('Failed to send message'),
  });

  const sendReminderMutation = useMutation({
    mutationFn: async ({ tutorEmail, subject, body }) => {
      await base44.integrations.Core.SendEmail({
        to: tutorEmail, subject, body, from_name: 'Diverse Youth NI Admin'
      });
    },
    onSuccess: () => {
      toast.success('Reminder sent!');
      setReminderMessage(''); setReminderSubject(''); setReminderOpen(false);
    },
    onError: () => toast.error('Failed to send reminder'),
  });

  const getTutorCourses = (email) => courses.filter(c => c.assigned_tutors?.includes(email));
  const getTutorAvailability = (email) => availability.filter(a => a.tutor_email === email);
  const getTutorBookings = (email) => bookings.filter(b => b.tutor_email === email);
  const getTutorUngradedCount = (email) => {
    const ids = getTutorCourses(email).map(c => c.id);
    const aids = assignments.filter(a => ids.includes(a.course_id)).map(a => a.id);
    return submissions.filter(s => aids.includes(s.assignment_id)).length;
  };

  const openChat = (tutor) => { setSelectedTutor(tutor); setChatOpen(true); setReminderOpen(false); };
  const openReminder = (tutor) => {
    setSelectedTutor(tutor); setReminderOpen(true); setChatOpen(false);
    const count = getTutorUngradedCount(tutor.email);
    setReminderSubject('Reminder: Student Coursework Needs Assessment');
    setReminderMessage(`Hi ${tutor.full_name},\n\nThis is a reminder that you currently have ${count} ungraded student submission(s) awaiting your assessment.\n\nPlease log in to the platform and review the outstanding work at your earliest convenience.\n\nThank you,\nAdmin Team`);
  };

  const renderStat = (label, value, Icon, bgcolor, color) => (
    <Card sx={{ p: 2 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ width: 40, height: 40, bgcolor, color }}>
          <Icon sx={{ fontSize: 20 }} />
        </Avatar>
        <Box>
          <Typography variant="caption" color="text.secondary">{label}</Typography>
          <Typography variant="h5" fontWeight={700}>{value}</Typography>
        </Box>
      </Stack>
    </Card>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>Tutor Monitor</Typography>
          <Typography variant="body2" color="text.secondary">Monitor tutor activity, calendars, and communicate with tutors</Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
          {renderStat('Active Tutors', tutors.length, SchoolIcon, '#f3e8ff', '#9333ea')}
          {renderStat('Total Bookings', bookings.length, CalendarTodayIcon, '#dbeafe', '#2563eb')}
          {renderStat('Ungraded Submissions', submissions.length, ErrorOutlineIcon, '#fee2e2', '#dc2626')}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 2fr' }, gap: 3 }}>
          <Box>
            <Typography variant="caption" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary', mb: 1.5, display: 'block' }}>
              Tutors
            </Typography>
            {tutors.length === 0 && (
              <Card sx={{ p: 2, textAlign: 'center', color: 'text.disabled' }}>No tutors found</Card>
            )}
            <Stack spacing={1.5}>
              {tutors.map(tutor => {
                const ungraded = getTutorUngradedCount(tutor.email);
                const courseCount = getTutorCourses(tutor.email).length;
                const isSelected = selectedTutor?.id === tutor.id;
                return (
                  <Card
                    key={tutor.id}
                    onClick={() => { setSelectedTutor(tutor); setChatOpen(false); setReminderOpen(false); }}
                    sx={{
                      p: 1.5, cursor: 'pointer', border: 2, transition: 'all 0.2s',
                      borderColor: isSelected ? '#6366f1' : 'transparent',
                      bgcolor: isSelected ? '#eef2ff' : 'background.paper',
                      '&:hover': { borderColor: isSelected ? '#6366f1' : '#c7d2fe' }
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar src={tutor.avatar} sx={{ bgcolor: '#e0e7ff', color: '#4338ca' }}>
                        {tutor.full_name?.charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={500} noWrap>{tutor.full_name}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{tutor.email}</Typography>
                        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                          <Chip label={`${courseCount} courses`} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                          {ungraded > 0 && <Chip label={`${ungraded} ungraded`} size="small" sx={{ bgcolor: '#fee2e2', color: '#b91c1c', height: 18, fontSize: '0.65rem' }} />}
                        </Stack>
                      </Box>
                      <ChevronRightIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                    </Stack>
                  </Card>
                );
              })}
            </Stack>
          </Box>

          <Box>
            {!selectedTutor ? (
              <Card sx={{ p: 5, textAlign: 'center', color: 'text.disabled' }}>
                <SchoolIcon sx={{ fontSize: 48, mb: 1.5, opacity: 0.3 }} />
                <Typography>Select a tutor to view their activity</Typography>
              </Card>
            ) : (
              <Stack spacing={2}>
                <Card sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" spacing={1.5}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar src={selectedTutor.avatar} sx={{ width: 48, height: 48, bgcolor: '#e0e7ff', color: '#4338ca' }}>
                        {selectedTutor.full_name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={700}>{selectedTutor.full_name}</Typography>
                        <Typography variant="body2" color="text.secondary">{selectedTutor.email}</Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="outlined" startIcon={<ChatIcon sx={{ fontSize: 16 }} />} onClick={() => openChat(selectedTutor)}>Chat</Button>
                      <Button size="small" variant="contained" startIcon={<NotificationsIcon sx={{ fontSize: 16 }} />} onClick={() => openReminder(selectedTutor)} sx={{ bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' } }}>
                        Send Reminder
                      </Button>
                    </Stack>
                  </Stack>
                </Card>

                {chatOpen && (
                  <Card sx={{ p: 2, border: 1, borderColor: '#c7d2fe', bgcolor: '#eef2ff' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <ChatIcon sx={{ fontSize: 16, color: '#4f46e5' }} />
                        <Typography variant="body2" fontWeight={600}>Send Message to {selectedTutor.full_name}</Typography>
                      </Stack>
                      <IconButton size="small" onClick={() => setChatOpen(false)}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
                    </Stack>
                    <TextField
                      multiline rows={3} fullWidth placeholder="Type your message..."
                      value={chatMessage} onChange={(e) => setChatMessage(e.target.value)}
                      sx={{ mb: 1.5, bgcolor: 'background.paper' }}
                    />
                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                      <Button size="small" variant="outlined" onClick={() => setChatOpen(false)}>Cancel</Button>
                      <Button
                        size="small" variant="contained"
                        startIcon={sendChatMutation.isPending ? <CircularProgress size={14} sx={{ color: 'white' }} /> : <SendIcon sx={{ fontSize: 14 }} />}
                        disabled={!chatMessage.trim() || sendChatMutation.isPending}
                        onClick={() => sendChatMutation.mutate({ tutorEmail: selectedTutor.email, tutorName: selectedTutor.full_name, message: chatMessage })}
                        sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' } }}
                      >
                        Send
                      </Button>
                    </Stack>
                  </Card>
                )}

                {reminderOpen && (
                  <Card sx={{ p: 2, border: 1, borderColor: '#fde68a', bgcolor: '#fefce8' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <NotificationsIcon sx={{ fontSize: 16, color: '#d97706' }} />
                        <Typography variant="body2" fontWeight={600}>Assessment Reminder for {selectedTutor.full_name}</Typography>
                      </Stack>
                      <IconButton size="small" onClick={() => setReminderOpen(false)}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
                    </Stack>
                    <TextField
                      placeholder="Email subject" fullWidth value={reminderSubject}
                      onChange={(e) => setReminderSubject(e.target.value)} sx={{ mb: 1, bgcolor: 'background.paper' }}
                    />
                    <TextField
                      multiline rows={5} placeholder="Reminder message..." fullWidth value={reminderMessage}
                      onChange={(e) => setReminderMessage(e.target.value)} sx={{ mb: 1.5, bgcolor: 'background.paper' }}
                    />
                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                      <Button size="small" variant="outlined" onClick={() => setReminderOpen(false)}>Cancel</Button>
                      <Button
                        size="small" variant="contained"
                        startIcon={sendReminderMutation.isPending ? <CircularProgress size={14} sx={{ color: 'white' }} /> : <NotificationsIcon sx={{ fontSize: 14 }} />}
                        disabled={!reminderMessage.trim() || sendReminderMutation.isPending}
                        onClick={() => sendReminderMutation.mutate({ tutorEmail: selectedTutor.email, subject: reminderSubject, body: reminderMessage })}
                        sx={{ bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' } }}
                      >
                        Send Email Reminder
                      </Button>
                    </Stack>
                  </Card>
                )}

                <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tab value="courses" icon={<MenuBookIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Courses" />
                  <Tab value="availability" icon={<AccessTimeIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Availability" />
                  <Tab value="bookings" icon={<CalendarTodayIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Bookings" />
                  <Tab value="coursework" icon={<ErrorOutlineIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Coursework" />
                </Tabs>

                <Stack spacing={1}>
                  {tab === 'courses' && (getTutorCourses(selectedTutor.email).length === 0 ? (
                    <Card sx={{ p: 4, textAlign: 'center', color: 'text.disabled' }}>No courses assigned to this tutor</Card>
                  ) : getTutorCourses(selectedTutor.email).map(course => (
                    <Card key={course.id} sx={{ p: 1.5 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        {course.thumbnail && <Box component="img" src={course.thumbnail} sx={{ width: 48, height: 40, objectFit: 'cover', borderRadius: 1 }} />}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={500}>{course.title}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                            {course.category?.replace(/_/g, ' ')} • {course.enrolled_count || 0} students
                          </Typography>
                        </Box>
                        <Chip label={course.qualification_type?.toUpperCase()} size="small" variant="outlined" />
                      </Stack>
                    </Card>
                  )))}

                  {tab === 'availability' && (getTutorAvailability(selectedTutor.email).length === 0 ? (
                    <Card sx={{ p: 4, textAlign: 'center', color: 'text.disabled' }}>No availability slots configured</Card>
                  ) : getTutorAvailability(selectedTutor.email).map(slot => (
                    <Card key={slot.id} sx={{ p: 1.5 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <AccessTimeIcon sx={{ fontSize: 16, color: '#6366f1' }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={500}>{slot.day_of_week} — {slot.start_time} to {slot.end_time}</Typography>
                          <Typography variant="caption" color="text.secondary">{slot.session_type || 'Any'} • {slot.max_students || 1} student(s)</Typography>
                        </Box>
                        <Chip
                          label={slot.is_active !== false ? 'Active' : 'Paused'}
                          size="small"
                          sx={{ bgcolor: slot.is_active !== false ? '#dcfce7' : '#f3f4f6', color: slot.is_active !== false ? '#15803d' : '#6b7280' }}
                        />
                      </Stack>
                    </Card>
                  )))}

                  {tab === 'bookings' && (getTutorBookings(selectedTutor.email).length === 0 ? (
                    <Card sx={{ p: 4, textAlign: 'center', color: 'text.disabled' }}>No bookings found for this tutor</Card>
                  ) : getTutorBookings(selectedTutor.email).map(booking => (
                    <Card key={booking.id} sx={{ p: 1.5 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <CalendarTodayIcon sx={{ fontSize: 16, color: '#3b82f6' }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={500}>{booking.student_name || booking.student_email}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {booking.session_date ? format(new Date(booking.session_date), 'MMM d, yyyy') : 'Date TBD'}
                            {booking.session_time ? ` at ${booking.session_time}` : ''}
                          </Typography>
                        </Box>
                        <Chip
                          label={booking.status || 'pending'}
                          size="small"
                          sx={{
                            bgcolor: booking.status === 'confirmed' ? '#dcfce7' : booking.status === 'pending' ? '#fef9c3' : '#f3f4f6',
                            color: booking.status === 'confirmed' ? '#15803d' : booking.status === 'pending' ? '#854d0e' : '#4b5563'
                          }}
                        />
                      </Stack>
                    </Card>
                  )))}

                  {tab === 'coursework' && (() => {
                    const ids = getTutorCourses(selectedTutor.email).map(c => c.id);
                    const aids = assignments.filter(a => ids.includes(a.course_id)).map(a => a.id);
                    const ungraded = submissions.filter(s => aids.includes(s.assignment_id));
                    return ungraded.length === 0 ? (
                      <Card sx={{ p: 4, textAlign: 'center' }}>
                        <CheckCircleIcon sx={{ fontSize: 32, color: '#86efac', mb: 1 }} />
                        <Typography color="text.disabled">All submissions graded — great work!</Typography>
                      </Card>
                    ) : ungraded.map(sub => {
                      const assignment = assignments.find(a => a.id === sub.assignment_id);
                      return (
                        <Card key={sub.id} sx={{ p: 1.5, border: 1, borderColor: '#fee2e2' }}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <ErrorOutlineIcon sx={{ fontSize: 16, color: '#ef4444' }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" fontWeight={500}>{sub.student_name || sub.student_email}</Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{assignment?.title || 'Assignment'}</Typography>
                              <Typography variant="caption" color="text.disabled">
                                Submitted: {sub.submitted_date ? format(new Date(sub.submitted_date), 'MMM d, yyyy') : 'Unknown'}
                              </Typography>
                            </Box>
                            <Chip label="Ungraded" size="small" sx={{ bgcolor: '#fee2e2', color: '#b91c1c' }} />
                          </Stack>
                        </Card>
                      );
                    });
                  })()}
                </Stack>
              </Stack>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}