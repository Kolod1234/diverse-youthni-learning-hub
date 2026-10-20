import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Box, Container, Typography, Button, Card, CardContent, TextField,
  MenuItem, Select, FormControl, InputLabel, Chip, Alert, LinearProgress,
  Divider, Avatar, IconButton, Tab, Tabs, Switch, FormControlLabel, Tooltip
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SendIcon from '@mui/icons-material/Send';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MailIcon from '@mui/icons-material/Mail';
import VisibilityIcon from '@mui/icons-material/Visibility';
const _w = (I) => ({ size, color, style, ...r }) => <I style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const Bell = _w(NotificationsIcon), Send = _w(SendIcon), Users = _w(PeopleIcon), User = _w(PersonIcon);
const Trash2 = _w(DeleteIcon), CheckCircle = _w(CheckCircleIcon), Mail = _w(MailIcon), Eye = _w(VisibilityIcon);
import { format } from 'date-fns';

const ROLES = [
  { value: 'all', label: 'All Users' },
  { value: 'user', label: 'Students (role: user)' },
  { value: 'admin', label: 'Admins only' },
  { value: 'tutors', label: 'Approved Tutors' },
  { value: 'coordinators', label: 'Approved Coordinators' },
];

const TYPES = [
  { value: 'announcement', label: 'Announcement' },
  { value: 'general', label: 'General' },
  { value: 'session_reminder', label: 'Session Reminder' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'program', label: 'Programme' },
];

export default function AdminNotifications() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState(0);
  const [status, setStatus] = useState(null);
  const [sendEmail, setSendEmail] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    target: 'all',
    specific_email: '',
    type: 'announcement',
    action_url: '',
  });

  const { data: users = [] } = useQuery({
    queryKey: ['admin-all-users'],
    queryFn: () => base44.entities.User.list('full_name', 500),
  });

  const { data: sentHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ['admin-notifications-history'],
    queryFn: () => base44.entities.Notification.filter({ sent_by: '__admin__' }, '-created_date', 100),
    // We can't easily filter by sent_by without it being a known value; fetch recent and filter
  });

  const { data: allNotifications = [], isLoading: notifLoading } = useQuery({
    queryKey: ['all-admin-notifications'],
    queryFn: () => base44.entities.Notification.list('-created_date', 200),
  });

  const adminNotifications = allNotifications.filter(n => n.sent_by);

  const sendMutation = useMutation({
    mutationFn: (payload) => base44.functions.invoke('sendAdminNotification', payload),
    onSuccess: (res) => {
      const count = res.data?.sent_count || 0;
      setStatus(`success:${count}`);
      queryClient.invalidateQueries({ queryKey: ['all-admin-notifications'] });
      setForm({ title: '', message: '', target: 'all', specific_email: '', type: 'announcement', action_url: '' });
    },
    onError: () => setStatus('error'),
  });

  const deleteNotifMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['all-admin-notifications'] }),
  });

  const handleSend = () => {
    if (!form.title || !form.message) return;
    setStatus('sending');
    sendMutation.mutate({ ...form, send_email: sendEmail });
  };

  // Group admin-sent notifications to show unique "broadcasts"
  const broadcasts = adminNotifications.reduce((acc, n) => {
    const key = `${n.title}__${n.created_date?.substring(0, 16)}`;
    if (!acc[key]) {
      acc[key] = { ...n, count: 1 };
    } else {
      acc[key].count++;
    }
    return acc;
  }, {});
  const broadcastList = Object.values(broadcasts).sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Bell size={28} color="#0b2f5c" />
        <Box>
          <Typography variant="h4" fontWeight={700}>Notification Centre</Typography>
          <Typography color="text.secondary">Send targeted in-app notifications and email digests to users</Typography>
        </Box>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Send Notification" icon={<Send size={16} />} iconPosition="start" />
        <Tab label={`Sent History (${broadcastList.length})`} icon={<Eye size={16} />} iconPosition="start" />
      </Tabs>

      {tab === 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
          {/* Form */}
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, p: 3 }}>
              <Typography variant="h6" fontWeight={700}>Compose Notification</Typography>

              {status?.startsWith('success:') && (
                <Alert severity="success" onClose={() => setStatus(null)}>
                  Sent to {status.split(':')[1]} user(s) successfully!
                </Alert>
              )}
              {status === 'error' && (
                <Alert severity="error" onClose={() => setStatus(null)}>Failed to send. Please try again.</Alert>
              )}
              {status === 'sending' && <Alert severity="info">Sending notifications...</Alert>}

              <FormControl fullWidth size="small">
                <InputLabel>Target Audience</InputLabel>
                <Select
                  value={form.target}
                  label="Target Audience"
                  onChange={e => setForm(f => ({ ...f, target: e.target.value, specific_email: '' }))}
                >
                  {ROLES.map(r => (
                    <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                  ))}
                  <MenuItem value="specific">Specific User (by email)</MenuItem>
                </Select>
              </FormControl>

              {form.target === 'specific' && (
                <FormControl fullWidth size="small">
                  <InputLabel>Select User</InputLabel>
                  <Select
                    value={form.specific_email}
                    label="Select User"
                    onChange={e => setForm(f => ({ ...f, specific_email: e.target.value }))}
                  >
                    {users.map(u => (
                      <MenuItem key={u.id} value={u.email}>
                        {u.full_name} ({u.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <FormControl fullWidth size="small">
                <InputLabel>Notification Type</InputLabel>
                <Select
                  value={form.type}
                  label="Notification Type"
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                >
                  {TYPES.map(t => (
                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Title"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                fullWidth
                size="small"
                placeholder="e.g. New course available!"
              />
              <TextField
                label="Message"
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                fullWidth
                multiline
                rows={4}
                size="small"
                placeholder="Write your notification message..."
              />
              <TextField
                label="Action URL (optional)"
                value={form.action_url}
                onChange={e => setForm(f => ({ ...f, action_url: e.target.value }))}
                fullWidth
                size="small"
                placeholder="e.g. /Explore or full URL"
              />

              <Divider />

              <Tooltip title="Also sends an email to each targeted user with this notification content">
                <FormControlLabel
                  control={<Switch checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} color="primary" />}
                  label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Mail size={16} /><Typography variant="body2">Also send email digest</Typography></Box>}
                />
              </Tooltip>

              <Button
                variant="contained"
                startIcon={<Send size={18} />}
                onClick={handleSend}
                disabled={!form.title || !form.message || (form.target === 'specific' && !form.specific_email) || sendMutation.isPending}
                sx={{ bgcolor: '#0b2f5c', '&:hover': { bgcolor: '#12396b' } }}
              >
                Send Notification
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Live Preview</Typography>
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ bgcolor: '#0b2f5c', color: 'white', px: 2, py: 1 }}>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>Notification Bell → User sees:</Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: '#eff6ff' }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#2563eb', mt: 0.75, flexShrink: 0 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={700} sx={{ color: '#1e293b' }}>
                        {form.title || 'Your notification title...'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {form.message || 'Your notification message will appear here.'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                        <Chip label={form.type} size="small" sx={{ fontSize: '0.65rem', height: 18 }} />
                        <Typography variant="caption" color="text.secondary">Just now</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Target summary</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">Audience</Typography>
                    <Typography variant="caption" fontWeight={600}>
                      {ROLES.find(r => r.value === form.target)?.label || (form.specific_email || '—')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">Type</Typography>
                    <Typography variant="caption" fontWeight={600}>{form.type}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">Email digest</Typography>
                    <Typography variant="caption" fontWeight={600}>{sendEmail ? 'Yes' : 'No'}</Typography>
                  </Box>
                  {form.action_url && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">Links to</Typography>
                      <Typography variant="caption" fontWeight={600} sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{form.action_url}</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {tab === 1 && (
        <Box>
          {notifLoading ? (
            <LinearProgress />
          ) : broadcastList.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <Bell size={48} color="#d1d5db" style={{ margin: '0 auto 12px' }} />
                <Typography color="text.secondary">No notifications sent yet.</Typography>
              </CardContent>
            </Card>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {broadcastList.map((n, idx) => (
                <Card key={idx}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                          <Typography variant="body1" fontWeight={700}>{n.title}</Typography>
                          <Chip label={n.type} size="small" variant="outlined" />
                          <Chip label={`${n.count} recipient${n.count > 1 ? 's' : ''}`} size="small" color="primary" />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{n.message}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Sent {format(new Date(n.created_date), 'MMM d, yyyy · h:mm a')}
                          {n.sent_by && ` · by ${n.sent_by}`}
                        </Typography>
                        {n.action_url && (
                          <Typography variant="caption" color="primary.main" sx={{ display: 'block' }}>
                            → {n.action_url}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
}