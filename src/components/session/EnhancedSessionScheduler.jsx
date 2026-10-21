import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Card, Box, Typography, TextField, Button, FormControl,
  InputLabel, Select, MenuItem, Chip, Stack, Switch, FormControlLabel
} from '@mui/material';
import { Calendar, Clock, Users, Repeat, Video } from 'lucide-react';
import { toast } from 'sonner';
import { listUsers } from '@/api/listUsers';

export default function EnhancedSessionScheduler({ onScheduled }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_id: '',
    scheduled_date: '',
    scheduled_time: '',
    duration_minutes: 60,
    is_recurring: false,
    recurrence_pattern: 'weekly',
    recurrence_end_date: '',
    invited_students: []
  });

  React.useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: courses = [] } = useQuery({
    queryKey: ['my-courses'],
    queryFn: async () => {
      const allCourses = await base44.entities.Course.list();
      return allCourses;
    }
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const users = await listUsers();
      return users.filter(u => u.role !== 'admin');
    }
  });

  const scheduleSessionMutation = useMutation({
    mutationFn: async (data) => {
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const sessionData = {
        ...data,
        tutor_email: user.email,
        tutor_name: user.full_name,
        meeting_room_id: roomId,
        status: 'scheduled'
      };

      const session = await base44.entities.VideoSession.create(sessionData);

      // If recurring, create future sessions
      if (data.is_recurring && data.recurrence_pattern) {
        const response = await base44.functions.invoke('createRecurringSessions', {
          baseSession: sessionData,
          pattern: data.recurrence_pattern,
          endDate: data.recurrence_end_date
        });
      }

      return session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['video-sessions']);
      toast.success('Session scheduled successfully!');
      onScheduled?.();
    }
  });

  const handleSchedule = () => {
    if (!formData.title || !formData.scheduled_date || !formData.scheduled_time) {
      toast.error('Please fill in required fields');
      return;
    }

    scheduleSessionMutation.mutate(formData);
  };

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>Schedule Live Session</Typography>

      <Stack spacing={3}>
        <TextField
          label="Session Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          fullWidth
          required
        />

        <TextField
          label="Description"
          multiline
          rows={2}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel>Course (Optional)</InputLabel>
          <Select
            value={formData.course_id}
            onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
            label="Course (Optional)"
          >
            <MenuItem value="">None</MenuItem>
            {courses.map(course => (
              <MenuItem key={course.id} value={course.id}>{course.title}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <TextField
            label="Date"
            type="date"
            value={formData.scheduled_date}
            onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            label="Time"
            type="time"
            value={formData.scheduled_time}
            onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Box>

        <TextField
          label="Duration (minutes)"
          type="number"
          value={formData.duration_minutes}
          onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
          fullWidth
        />

        <FormControlLabel
          control={
            <Switch
              checked={formData.is_recurring}
              onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
            />
          }
          label="Recurring Session"
        />

        {formData.is_recurring && (
          <>
            <FormControl fullWidth>
              <InputLabel>Recurrence Pattern</InputLabel>
              <Select
                value={formData.recurrence_pattern}
                onChange={(e) => setFormData({ ...formData, recurrence_pattern: e.target.value })}
                label="Recurrence Pattern"
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="biweekly">Bi-weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="End Date"
              type="date"
              value={formData.recurrence_end_date}
              onChange={(e) => setFormData({ ...formData, recurrence_end_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </>
        )}

        <Button
          variant="contained"
          size="large"
          onClick={handleSchedule}
          disabled={scheduleSessionMutation.isPending}
          startIcon={<Video className="w-5 h-5" />}
        >
          {scheduleSessionMutation.isPending ? 'Scheduling...' : 'Schedule Session'}
        </Button>
      </Stack>
    </Card>
  );
}