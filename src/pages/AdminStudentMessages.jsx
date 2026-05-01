import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Box, Container, Typography, Card, Button, TextField, Stack, Avatar, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, Checkbox, CircularProgress,
  InputAdornment, Popover
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function AdminStudentMessages() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('compose');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(null);
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [calendarAnchor, setCalendarAnchor] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getMessageableUsers', {});
      return response.data;
    },
    enabled: !!user && (user.role === 'admin' || user.is_tutor),
  });

  const { data: sentMessages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['sent-messages', user?.email],
    queryFn: () => base44.entities.Message.filter({ sender_email: user?.email }, '-created_date', 500),
    enabled: !!user?.email && activeTab === 'history',
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ studentEmail }) => {
      return await base44.functions.invoke('sendDirectMessage', {
        studentEmail, subject, body: message,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['messages']);
      queryClient.invalidateQueries(['sent-messages']);
    },
  });

  const handleSendToSelected = async () => {
    if (!subject.trim() || !message.trim()) { toast.error('Please enter subject and message'); return; }
    if (selectedStudents.length === 0) { toast.error('Please select at least one student'); return; }

    if (scheduleEnabled) {
      if (!scheduledDate) { toast.error('Please select a scheduled date'); return; }
      const [hours, minutes] = scheduledTime.split(':');
      const scheduledDateTime = new Date(scheduledDate);
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      if (scheduledDateTime <= new Date()) { toast.error('Scheduled time must be in the future'); return; }

      try {
        const promises = selectedStudents.map(email =>
          base44.entities.ScheduledMessage.create({
            recipient_email: email,
            subject: subject.trim(),
            content: message.trim(),
            scheduled_time: scheduledDateTime.toISOString(),
            sender_email: user.email,
            sender_name: user.full_name,
            status: 'pending',
          })
        );
        await Promise.all(promises);
        toast.success(`Message scheduled for ${selectedStudents.length} student(s)`);
        setSelectedStudents([]); setSubject(''); setMessage('');
        setScheduleEnabled(false); setScheduledDate(null); setScheduledTime('09:00');
      } catch {
        toast.error('Failed to schedule messages');
      }
    } else {
      const promises = selectedStudents.map(email => sendMessageMutation.mutateAsync({ studentEmail: email }));
      try {
        await Promise.all(promises);
        toast.success(`Message sent to ${selectedStudents.length} student(s)`);
        setSelectedStudents([]); setSubject(''); setMessage('');
      } catch {
        toast.error('Failed to send some messages');
      }
    }
  };

  const toggleStudent = (email) => {
    setSelectedStudents(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]);
  };

  const filteredStudents = allUsers.filter(s =>
    s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user || (user.role !== 'admin' && !user.is_tutor)) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover' }}>
        <Card sx={{ p: 3 }}>
          <Typography color="text.secondary">Access denied. Only admins and tutors can send student messages.</Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f8fafc, white)' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>Send Student Messages</Typography>
          <Typography color="text.secondary">Send direct messages to students individually or in bulk</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button variant={activeTab === 'compose' ? 'contained' : 'outlined'} startIcon={<SendIcon />} onClick={() => setActiveTab('compose')} sx={activeTab === 'compose' ? { bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' } } : {}}>
              Compose
            </Button>
            <Button variant={activeTab === 'history' ? 'contained' : 'outlined'} startIcon={<HistoryIcon />} onClick={() => setActiveTab('history')} sx={activeTab === 'history' ? { bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' } } : {}}>
              Message History
            </Button>
          </Stack>
        </Box>

        {activeTab === 'compose' ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 2fr' }, gap: 3 }}>
            {/* Student List */}
            <Card>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EmailIcon sx={{ fontSize: 20, color: '#4f46e5' }} />
                    <Typography fontWeight={600}>Students</Typography>
                  </Stack>
                  {selectedStudents.length > 0 && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="caption" color="text.secondary">{selectedStudents.length} selected</Typography>
                      <IconButton size="small" onClick={() => setSelectedStudents([])}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
                    </Stack>
                  )}
                </Stack>
                <TextField
                  fullWidth size="small" placeholder="Search students..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: 'text.disabled' }} /></InputAdornment> }}
                />
              </Box>
              <Box sx={{ height: 600, overflowY: 'auto' }}>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress size={24} /></Box>
                ) : (
                  <Box>
                    {filteredStudents.map((student) => {
                      const isSelected = selectedStudents.includes(student.email);
                      return (
                        <motion.div key={student.email} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <Box
                            onClick={() => toggleStudent(student.email)}
                            sx={{
                              p: 2, cursor: 'pointer', borderBottom: 1, borderColor: 'divider',
                              ...(isSelected
                                ? { bgcolor: '#eef2ff', borderLeft: '4px solid #4f46e5' }
                                : { '&:hover': { bgcolor: 'action.hover' } }),
                              transition: 'background-color 0.2s'
                            }}
                          >
                            <Stack direction="row" spacing={1.5} alignItems="flex-start">
                              <Avatar sx={{ width: 40, height: 40, bgcolor: '#e0e7ff', color: '#4f46e5' }}>
                                {student.full_name?.charAt(0) || 'S'}
                              </Avatar>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Typography variant="body2" fontWeight={500} noWrap>{student.full_name || 'Student'}</Typography>
                                  {isSelected && <CheckCircleIcon sx={{ fontSize: 16, color: '#4f46e5', flexShrink: 0 }} />}
                                </Stack>
                                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{student.email}</Typography>
                              </Box>
                            </Stack>
                          </Box>
                        </motion.div>
                      );
                    })}
                    {filteredStudents.length === 0 && (
                      <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>No students found</Box>
                    )}
                  </Box>
                )}
              </Box>
            </Card>

            {/* Message Composer */}
            <Card>
              <Box sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>Compose Message</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedStudents.length === 0
                      ? 'Select students from the list to send a message'
                      : `Sending to ${selectedStudents.length} student(s)`}
                  </Typography>
                </Box>
                <Stack spacing={2}>
                  <TextField label="Subject *" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Enter message subject..." fullWidth />
                  <TextField label="Message *" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your message here..." multiline rows={12} fullWidth helperText="You can use **bold** and basic markdown formatting" />

                  <FormControlLabel
                    control={<Checkbox checked={scheduleEnabled} onChange={(e) => setScheduleEnabled(e.target.checked)} />}
                    label="Schedule message for later"
                  />

                  {scheduleEnabled && (
                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" startIcon={<CalendarTodayIcon sx={{ fontSize: 16 }} />} onClick={(e) => setCalendarAnchor(e.currentTarget)} sx={{ flex: 1, justifyContent: 'flex-start' }}>
                        {scheduledDate ? format(scheduledDate, 'PPP') : 'Pick a date'}
                      </Button>
                      <Popover open={Boolean(calendarAnchor)} anchorEl={calendarAnchor} onClose={() => setCalendarAnchor(null)}>
                        <Calendar mode="single" selected={scheduledDate} onSelect={(d) => { setScheduledDate(d); setCalendarAnchor(null); }} disabled={(date) => date < new Date()} />
                      </Popover>
                      <TextField
                        type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><AccessTimeIcon sx={{ fontSize: 16 }} /></InputAdornment> }}
                      />
                    </Stack>
                  )}

                  <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 2 }}>
                    <Button variant="outlined" onClick={() => { setSubject(''); setMessage(''); setSelectedStudents([]); }}>
                      Clear
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSendToSelected}
                      disabled={!subject.trim() || !message.trim() || selectedStudents.length === 0 || sendMessageMutation.isPending}
                      startIcon={
                        sendMessageMutation.isPending
                          ? <CircularProgress size={16} sx={{ color: 'white' }} />
                          : scheduleEnabled ? <AccessTimeIcon sx={{ fontSize: 16 }} /> : <SendIcon sx={{ fontSize: 16 }} />
                      }
                      sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' } }}
                    >
                      {sendMessageMutation.isPending ? (scheduleEnabled ? 'Scheduling...' : 'Sending...') : (scheduleEnabled ? 'Schedule Message' : 'Send Message')}
                    </Button>
                  </Stack>

                  {(subject || message) && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="body2" fontWeight={500} color="text.secondary" sx={{ mb: 1.5 }}>Preview</Typography>
                      <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, p: 2 }}>
                        {subject && <Typography fontWeight={600} sx={{ mb: 1 }}>{subject}</Typography>}
                        {message && <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{message}</Typography>}
                      </Box>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Card>
          </Box>
        ) : (
          <Card>
            <Box sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight={600}>Message History</Typography>
                  <Typography variant="body2" color="text.secondary">View all messages you have sent</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {sentMessages.length} message{sentMessages.length !== 1 ? 's' : ''}
                </Typography>
              </Stack>
              {messagesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
              ) : sentMessages.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <EmailIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography color="text.secondary">No messages sent yet</Typography>
                </Box>
              ) : (
                <Box sx={{ height: 600, overflowY: 'auto' }}>
                  <Stack spacing={1.5}>
                    {sentMessages.map((msg) => (
                      <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => setSelectedMessage(msg)}>
                          <Stack direction="row" justifyContent="space-between" spacing={2}>
                            <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ flex: 1, minWidth: 0 }}>
                              <Avatar sx={{ width: 40, height: 40, bgcolor: '#e0e7ff', color: '#4f46e5' }}>
                                {msg.recipient_email?.charAt(0)?.toUpperCase() || 'R'}
                              </Avatar>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" fontWeight={500}>To: {msg.recipient_email}</Typography>
                                <Typography variant="body2" fontWeight={500} color="text.secondary" sx={{ mt: 0.5 }}>
                                  Subject: {msg.content.split('\n')[0].substring(0, 60)}
                                  {msg.content.split('\n')[0].length > 60 ? '...' : ''}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" noWrap>{msg.content}</Typography>
                                <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                                  {format(new Date(msg.created_date), 'MMM d, yyyy h:mm a')}
                                </Typography>
                              </Box>
                            </Stack>
                            <IconButton size="small"><VisibilityIcon sx={{ fontSize: 16 }} /></IconButton>
                          </Stack>
                        </Card>
                      </motion.div>
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>
          </Card>
        )}

        <Dialog open={!!selectedMessage} onClose={() => setSelectedMessage(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Message Details</DialogTitle>
          {selectedMessage && (
            <DialogContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" fontWeight={500} color="text.secondary">To:</Typography>
                  <Typography>{selectedMessage.recipient_email}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" fontWeight={500} color="text.secondary">Sent:</Typography>
                  <Typography>{format(new Date(selectedMessage.created_date), 'MMMM d, yyyy h:mm a')}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" fontWeight={500} color="text.secondary">Message:</Typography>
                  <Box sx={{ mt: 1, bgcolor: 'action.hover', borderRadius: 1, p: 2 }}>
                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>{selectedMessage.content}</Typography>
                  </Box>
                </Box>
              </Stack>
            </DialogContent>
          )}
          <DialogActions>
            <Button onClick={() => setSelectedMessage(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}