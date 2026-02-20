import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container, Card, Box, Typography, Button, TextField, Grid,
  Select, MenuItem, FormControl, InputLabel, Chip, List, ListItem,
  ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  Video, Users, Settings, Play, Square, MonitorUp, MessageSquare,
  FileText, BarChart3, Clock, Calendar, Plus, Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import CustomVideoCall from '@/components/video/CustomVideoCall';

export default function LiveSessionHost() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = new URLSearchParams(location.search);
  const sessionId = params.get('id');

  const [user, setUser] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    scheduled_date: '',
    scheduled_time: '',
    duration_minutes: 60,
    course_id: ''
  });

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: session, refetch: refetchSession } = useQuery({
    queryKey: ['video-session', sessionId],
    queryFn: () => base44.entities.VideoSession.get(sessionId),
    enabled: !!sessionId
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['my-courses', user?.email],
    queryFn: async () => {
      const allCourses = await base44.entities.Course.list();
      return allCourses.filter(c => c.created_by === user.email || user.role === 'admin');
    },
    enabled: !!user
  });

  const { data: participants = [] } = useQuery({
    queryKey: ['session-participants', sessionId],
    queryFn: () => base44.entities.SessionParticipant.filter({ session_id: sessionId }),
    enabled: !!sessionId && sessionActive
  });

  const startSessionMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.VideoSession.update(sessionId, {
        status: 'live'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['video-session']);
      setSessionActive(true);
      toast.success('Session started!');
    }
  });

  const endSessionMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.VideoSession.update(sessionId, {
        status: 'completed'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['video-session']);
      setSessionActive(false);
      toast.success('Session ended');
      navigate('/Sessions');
    }
  });

  const scheduleSessionMutation = useMutation({
    mutationFn: async (data) => {
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return await base44.entities.VideoSession.create({
        ...data,
        tutor_email: user.email,
        tutor_name: user.full_name,
        meeting_room_id: roomId,
        status: 'scheduled'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['video-sessions']);
      toast.success('Session scheduled!');
      setShowScheduleDialog(false);
    }
  });

  if (sessionActive && session) {
    return (
      <CustomVideoCall
        session={session}
        course={courses.find(c => c.id === session.course_id)}
        user={user}
        onEndSession={() => endSessionMutation.mutate()}
      />
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          Live Session Host Dashboard
        </Typography>
        <Typography color="text.secondary">
          Manage your live webinars and Q&A sessions
        </Typography>
      </Box>

      {sessionId && session ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Typography variant="h5" fontWeight="bold">{session.title}</Typography>
                  <Typography color="text.secondary">{session.description}</Typography>
                </Box>
                <Chip
                  label={session.status}
                  color={session.status === 'live' ? 'error' : session.status === 'completed' ? 'default' : 'primary'}
                />
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <Typography variant="body2">{session.scheduled_date}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Clock className="w-4 h-4 text-gray-500" />
                    <Typography variant="body2">{session.scheduled_time}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Users className="w-4 h-4 text-gray-500" />
                    <Typography variant="body2">{session.invited_students?.length || 0} invited</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Clock className="w-4 h-4 text-gray-500" />
                    <Typography variant="body2">{session.duration_minutes} min</Typography>
                  </Box>
                </Grid>
              </Grid>

              {session.status === 'scheduled' && (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Play className="w-5 h-5" />}
                  onClick={() => startSessionMutation.mutate()}
                  fullWidth
                  sx={{ bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}
                >
                  Start Live Session
                </Button>
              )}

              {session.status === 'live' && (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Square className="w-5 h-5" />}
                  onClick={() => endSessionMutation.mutate()}
                  fullWidth
                  color="error"
                >
                  End Session
                </Button>
              )}

              {session.recording_url && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Session Recording</Typography>
                  <video
                    src={session.recording_url}
                    controls
                    className="w-full rounded-lg"
                  />
                </Box>
              )}
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Session Tools</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button variant="outlined" startIcon={<MessageSquare className="w-4 h-4" />}>
                  Chat History
                </Button>
                <Button variant="outlined" startIcon={<FileText className="w-4 h-4" />}>
                  Session Notes
                </Button>
                <Button variant="outlined" startIcon={<BarChart3 className="w-4 h-4" />}>
                  Attendance Report
                </Button>
                <Button variant="outlined" startIcon={<Users className="w-4 h-4" />}>
                  Manage Participants
                </Button>
              </Box>
            </Card>

            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Quick Actions</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowScheduleDialog(true)}
                >
                  Schedule New Session
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Video className="w-16 h-16 mx-auto mb-3 text-gray-400" />
          <Typography variant="h6" sx={{ mb: 2 }}>No Active Session</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Schedule or start a new live session to begin
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowScheduleDialog(true)}
          >
            Schedule Session
          </Button>
        </Card>
      )}

      <Dialog open={showScheduleDialog} onClose={() => setShowScheduleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Live Session</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Session Title"
              value={newSession.title}
              onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              multiline
              rows={2}
              value={newSession.description}
              onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Course</InputLabel>
              <Select
                value={newSession.course_id}
                onChange={(e) => setNewSession({ ...newSession, course_id: e.target.value })}
                label="Course"
              >
                {courses.map(course => (
                  <MenuItem key={course.id} value={course.id}>{course.title}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Date"
              type="date"
              value={newSession.scheduled_date}
              onChange={(e) => setNewSession({ ...newSession, scheduled_date: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Time"
              type="time"
              value={newSession.scheduled_time}
              onChange={(e) => setNewSession({ ...newSession, scheduled_time: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Duration (minutes)"
              type="number"
              value={newSession.duration_minutes}
              onChange={(e) => setNewSession({ ...newSession, duration_minutes: parseInt(e.target.value) })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => scheduleSessionMutation.mutate(newSession)}
            disabled={scheduleSessionMutation.isPending}
          >
            {scheduleSessionMutation.isPending ? 'Scheduling...' : 'Schedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}