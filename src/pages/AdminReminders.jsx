import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Box, Container, Typography, Card, CardContent, Button, TextField, Stack, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const EMPTY_FORM = {
  title: '', reminder_type: 'assignment_submission', subject: '', message: '',
  target_audience: 'all_students', course_id: '', group_id: '', is_active: true,
  schedule_type: 'manual', scheduled_date: '', scheduled_time: '09:00',
  repeat_interval: 1, repeat_end_date: '', is_scheduled_active: false
};

const REMINDER_TYPE_LABELS = {
  assignment_submission: 'Assignment Submission',
  do_assignment: 'Do Assignment',
  upcoming_class: 'Upcoming Class',
  news: 'News',
  new_course: 'New Course Available'
};

export default function AdminReminders() {
  const [user, setUser] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [tab, setTab] = useState('active');
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const queryClient = useQueryClient();

  const { data: reminders = [] } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => base44.entities.ReminderConfig.list('-updated_date', 100),
    enabled: !!user && (user.role === 'admin' || user.is_tutor)
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 100)
  });

  const { data: studyGroups = [] } = useQuery({
    queryKey: ['study-groups'],
    queryFn: () => base44.entities.StudyGroup.list('-created_date', 100)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ReminderConfig.create({
      ...data,
      created_by_role: user.role === 'admin' ? 'admin' : 'teacher'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      resetForm();
      setShowCreateDialog(false);
      toast.success('Reminder created successfully');
    },
    onError: (error) => toast.error('Failed to create reminder: ' + error.message)
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.ReminderConfig.update(editingReminder.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      resetForm();
      setEditingReminder(null);
      setShowCreateDialog(false);
      toast.success('Reminder updated successfully');
    },
    onError: (error) => toast.error('Failed to update reminder: ' + error.message)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ReminderConfig.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Reminder deleted');
    },
    onError: (error) => toast.error('Failed to delete reminder: ' + error.message)
  });

  const sendMutation = useMutation({
    mutationFn: (reminderId) => base44.functions.invoke('sendStudentReminder', { reminderId }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success(response.data.message);
    },
    onError: () => toast.error('Failed to send reminder')
  });

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingReminder(null);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.subject || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (editingReminder) updateMutation.mutate(formData);
    else createMutation.mutate(formData);
  };

  const handleEdit = (reminder) => {
    setEditingReminder(reminder);
    setFormData({
      title: reminder.title,
      reminder_type: reminder.reminder_type,
      subject: reminder.subject,
      message: reminder.message,
      target_audience: reminder.target_audience,
      course_id: reminder.course_id || '',
      group_id: reminder.group_id || '',
      is_active: reminder.is_active,
      schedule_type: reminder.schedule_type || 'manual',
      scheduled_date: reminder.scheduled_date || '',
      scheduled_time: reminder.scheduled_time || '09:00',
      repeat_interval: reminder.repeat_interval || 1,
      repeat_end_date: reminder.repeat_end_date || '',
      is_scheduled_active: reminder.is_scheduled_active || false
    });
    setShowCreateDialog(true);
  };

  if (!user || (user.role !== 'admin' && !user.is_tutor)) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card sx={{ maxWidth: 400 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700}>Access Denied</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>Only administrators and teachers can access this page.</Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const activeReminders = reminders.filter(r => r.is_active);
  const inactiveReminders = reminders.filter(r => !r.is_active);
  const filtered = tab === 'active' ? activeReminders : inactiveReminders;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
      <Container maxWidth="lg">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <NotificationsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" fontWeight={700}>Student Reminders</Typography>
              <Typography color="text.secondary">Create and manage automated email reminders for students</Typography>
            </Box>
          </Stack>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { resetForm(); setShowCreateDialog(true); }}>
            New Reminder
          </Button>
        </Stack>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tab value="active" icon={<CheckCircleIcon sx={{ fontSize: 16 }} />} iconPosition="start" label={`Active (${activeReminders.length})`} />
          <Tab value="inactive" icon={<ErrorOutlineIcon sx={{ fontSize: 16 }} />} iconPosition="start" label={`Inactive (${inactiveReminders.length})`} />
        </Tabs>

        {filtered.length > 0 ? (
          <Stack spacing={2}>
            {filtered.map((reminder, index) => (
              <motion.div
                key={reminder.id}


              >
                <Card sx={{ opacity: tab === 'inactive' ? 0.6 : 1, '&:hover': { boxShadow: 4 }, transition: 'box-shadow 0.2s' }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>{reminder.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {REMINDER_TYPE_LABELS[reminder.reminder_type]} • {reminder.target_audience === 'all_students' ? 'All Students' : reminder.target_audience === 'specific_course' ? 'Specific Course' : 'Study Group'}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        {tab === 'active' && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<SendIcon sx={{ fontSize: 14 }} />}
                            onClick={() => sendMutation.mutate(reminder.id)}
                            disabled={sendMutation.isPending}
                          >
                            Send Now
                          </Button>
                        )}
                        <Button size="small" variant="outlined" onClick={() => handleEdit(reminder)}>
                          <EditIcon sx={{ fontSize: 16 }} />
                        </Button>
                        <Button size="small" variant="contained" color="error" onClick={() => deleteMutation.mutate(reminder.id)} disabled={deleteMutation.isPending}>
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </Button>
                      </Stack>
                    </Stack>
                    {tab === 'active' && (
                      <Stack spacing={1.5}>
                        <Box>
                          <Typography variant="caption" fontWeight={500} color="text.secondary">Subject</Typography>
                          <Typography variant="body2">{reminder.subject}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" fontWeight={500} color="text.secondary">Message Preview</Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{reminder.message?.substring(0, 150)}...</Typography>
                        </Box>
                        {reminder.schedule_type && reminder.schedule_type !== 'manual' && (
                          <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                            <Typography variant="caption" fontWeight={500}>Schedule: {reminder.schedule_type === 'once' ? 'Once' : 'Continuous'}</Typography>
                            {reminder.scheduled_date && reminder.scheduled_time && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                {new Date(reminder.scheduled_date).toLocaleDateString()} at {reminder.scheduled_time}
                                {reminder.schedule_type === 'continuous' && ` • Every ${reminder.repeat_interval} day(s)`}
                              </Typography>
                            )}
                          </Box>
                        )}
                        <Stack direction="row" spacing={2}>
                          <Typography variant="caption" color="text.secondary">Sent: {reminder.sent_count || 0} times</Typography>
                          {reminder.last_sent_date && (
                            <Typography variant="caption" color="text.secondary">Last sent: {new Date(reminder.last_sent_date).toLocaleDateString()}</Typography>
                          )}
                        </Stack>
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Stack>
        ) : (
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600}>No {tab === 'active' ? 'Active' : 'Inactive'} Reminders</Typography>
              {tab === 'active' && <Typography color="text.secondary" sx={{ mt: 1 }}>Create a new reminder to get started</Typography>}
            </CardContent>
          </Card>
        )}

        <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingReminder ? 'Edit Reminder' : 'Create New Reminder'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField label="Title *" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Assignment Submission Reminder" fullWidth />
              <FormControl fullWidth>
                <InputLabel>Reminder Type *</InputLabel>
                <Select value={formData.reminder_type} label="Reminder Type *" onChange={(e) => setFormData({ ...formData, reminder_type: e.target.value })}>
                  {Object.entries(REMINDER_TYPE_LABELS).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField label="Email Subject *" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} fullWidth />
              <TextField label="Email Message *" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} multiline rows={6} fullWidth />
              <FormControl fullWidth>
                <InputLabel>Send To *</InputLabel>
                <Select value={formData.target_audience} label="Send To *" onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}>
                  <MenuItem value="all_students">All Students</MenuItem>
                  <MenuItem value="specific_course">Specific Course</MenuItem>
                  <MenuItem value="specific_group">Study Group</MenuItem>
                </Select>
              </FormControl>
              {formData.target_audience === 'specific_course' && (
                <FormControl fullWidth>
                  <InputLabel>Select Course *</InputLabel>
                  <Select value={formData.course_id} label="Select Course *" onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}>
                    <MenuItem value="">Choose a course...</MenuItem>
                    {courses.map(c => <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>)}
                  </Select>
                </FormControl>
              )}
              {formData.target_audience === 'specific_group' && (
                <FormControl fullWidth>
                  <InputLabel>Select Study Group *</InputLabel>
                  <Select value={formData.group_id} label="Select Study Group *" onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}>
                    <MenuItem value="">Choose a study group...</MenuItem>
                    {studyGroups.map(g => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
                  </Select>
                </FormControl>
              )}
              <FormControlLabel
                control={<Checkbox checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />}
                label="Reminder is active"
              />

              <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography fontWeight={600} sx={{ mb: 1.5 }}>Schedule Settings</Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Schedule Type</InputLabel>
                  <Select value={formData.schedule_type} label="Schedule Type" onChange={(e) => setFormData({ ...formData, schedule_type: e.target.value })}>
                    <MenuItem value="manual">Manual (Send when I click)</MenuItem>
                    <MenuItem value="once">Once (Send at specific date & time)</MenuItem>
                    <MenuItem value="continuous">Continuous (Send repeatedly)</MenuItem>
                  </Select>
                </FormControl>
                {(formData.schedule_type === 'once' || formData.schedule_type === 'continuous') && (
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                    <TextField label="Date *" type="date" value={formData.scheduled_date} onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })} InputLabelProps={{ shrink: true }} />
                    <TextField label="Time *" type="time" value={formData.scheduled_time} onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })} InputLabelProps={{ shrink: true }} />
                  </Box>
                )}
                {formData.schedule_type === 'continuous' && (
                  <Stack spacing={2} sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, mb: 2 }}>
                    <TextField label="Repeat Every (days) *" type="number" inputProps={{ min: 1 }} value={formData.repeat_interval} onChange={(e) => setFormData({ ...formData, repeat_interval: parseInt(e.target.value) })} />
                    <TextField label="Stop Repeating On" type="date" value={formData.repeat_end_date} onChange={(e) => setFormData({ ...formData, repeat_end_date: e.target.value })} InputLabelProps={{ shrink: true }} helperText="Leave empty to repeat indefinitely" />
                  </Stack>
                )}
                {formData.schedule_type !== 'manual' && (
                  <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <FormControlLabel
                      control={<Checkbox checked={formData.is_scheduled_active} onChange={(e) => setFormData({ ...formData, is_scheduled_active: e.target.checked })} />}
                      label="Enable automatic scheduling"
                    />
                  </Box>
                )}
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {editingReminder ? 'Update' : 'Create'} Reminder
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}