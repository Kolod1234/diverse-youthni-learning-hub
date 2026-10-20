import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Container, Typography, Card, CardContent, Button, TextField, Chip, Avatar,
  Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, IconButton,
  CircularProgress, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ShieldIcon from '@mui/icons-material/Shield';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SendIcon from '@mui/icons-material/Send';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PeopleIcon from '@mui/icons-material/People';
import { format } from 'date-fns';

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [showInvite, setShowInvite] = useState(false);
  const [messageUser, setMessageUser] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkEmail, setShowBulkEmail] = useState(false);

  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list('-created_date', 500),
  });

  const inviteMutation = useMutation({
    mutationFn: (data) => base44.users.inviteUser(data.email, data.role),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-users']);
      setInviteEmail('');
      setShowInvite(false);
      alert('User invited successfully!');
    },
    onError: (error) => {
      alert(`Failed to invite user: ${error.message}`);
    },
  });

  const banMutation = useMutation({
    mutationFn: ({ user, banned }) => base44.functions.invoke('adminUpdateUser', { email: user.email, data: { account_banned: banned, ban_reason: banned ? 'Your account has been restricted by an administrator.' : '', ...(banned ? { banned_at: new Date().toISOString() } : {}) } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['all-users'] }),
    onError: (error) => alert(`Unable to update access: ${error.response?.data?.error || error.message}`),
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (data) => {
      await base44.integrations.Core.SendEmail({
        to: data.email,
        subject: data.subject,
        body: data.body,
        from_name: 'Diverse Youth NI Admin'
      });
    },
    onSuccess: () => {
      setMessageUser(null);
      setEmailSubject('');
      setEmailBody('');
      alert('Email sent successfully!');
    },
    onError: (error) => {
      alert(`Failed to send email: ${error.message}`);
    },
  });

  const handleInvite = () => {
    if (!inviteEmail) {
      alert('Please enter an email address');
      return;
    }
    inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  const handleSendEmail = () => {
    if (!emailSubject || !emailBody) {
      alert('Please enter subject and message');
      return;
    }
    sendEmailMutation.mutate({
      email: messageUser.email,
      subject: emailSubject,
      body: emailBody
    });
  };

  const handleBulkEmail = async () => {
    if (!emailSubject || !emailBody || selectedUsers.length === 0) {
      alert('Please select users and enter subject and message');
      return;
    }
    try {
      for (const user of selectedUsers) {
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: emailSubject,
          body: emailBody,
          from_name: 'Diverse Youth NI Admin'
        });
      }
      setShowBulkEmail(false);
      setSelectedUsers([]);
      setEmailSubject('');
      setEmailBody('');
      alert(`Email sent to ${selectedUsers.length} users!`);
    } catch (error) {
      alert(`Failed to send bulk email: ${error.message}`);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Card sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>User Management</Typography>
              <Typography color="text.secondary">Manage all users registered on the platform</Typography>
            </Box>
            <Button
              onClick={() => setShowInvite(!showInvite)}
              variant="contained"
              startIcon={<PersonAddIcon />}
              sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#c2410c' } }}
            >
              Invite User
            </Button>
          </Box>

          {showInvite && (
            <Box sx={{ bgcolor: '#fff7ed', border: 1, borderColor: '#fed7aa', borderRadius: 2, p: 2, mb: 3 }}>
              <Typography fontWeight={600} sx={{ mb: 1.5 }}>Invite New User</Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  sx={{ flex: 1, minWidth: 200 }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  onClick={handleInvite}
                  disabled={inviteMutation.isPending}
                  variant="contained"
                  sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#c2410c' } }}
                >
                  {inviteMutation.isPending ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Invite'}
                </Button>
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: 1, minWidth: 200 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Role</InputLabel>
              <Select value={roleFilter} label="Role" onChange={(e) => setRoleFilter(e.target.value)}>
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Card>

        {/* Stats */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 3 }}>
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#dbeafe', color: '#2563eb', width: 48, height: 48 }}><PersonIcon /></Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Total Users</Typography>
                <Typography variant="h5" fontWeight={700}>{users.length}</Typography>
              </Box>
            </Box>
          </Card>
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#ffedd5', color: '#4f46e5', width: 48, height: 48 }}><ShieldIcon /></Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Admins</Typography>
                <Typography variant="h5" fontWeight={700}>{users.filter(u => u.role === 'admin').length}</Typography>
              </Box>
            </Box>
          </Card>
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#dcfce7', color: '#16a34a', width: 48, height: 48 }}><PersonIcon /></Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">Regular Users</Typography>
                <Typography variant="h5" fontWeight={700}>{users.filter(u => u.role === 'user').length}</Typography>
              </Box>
            </Box>
          </Card>
        </Box>

        {/* Users Table */}
        <Card sx={{ overflow: 'hidden' }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : filteredUsers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <PersonIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">No users found</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell>USER</TableCell>
                    <TableCell>EMAIL</TableCell>
                    <TableCell>ROLE</TableCell>
                    <TableCell sx={{ display: { xs: 'none', xl: 'table-cell' } }}>REGISTERED</TableCell>
                    <TableCell>STATUS</TableCell>
                    <TableCell align="right">ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar src={user.avatar} sx={{ bgcolor: 'rgba(79,70,229,0.12)', color: 'primary.main' }}>
                            {user.full_name?.charAt(0) || 'U'}
                          </Avatar>
                          <Typography variant="body2" fontWeight={500}>{user.full_name || 'Unknown'}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                          <EmailIcon sx={{ fontSize: 16 }} />
                          <Typography variant="body2">{user.email}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={user.role === 'admin' ? <ShieldIcon sx={{ fontSize: 12 }} /> : <PersonIcon sx={{ fontSize: 12 }} />}
                          label={user.role}
                          size="small"
                          sx={{
                            bgcolor: user.role === 'admin' ? 'rgba(79,70,229,0.12)' : 'action.hover',
                            color: user.role === 'admin' ? 'primary.main' : 'text.secondary',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', xl: 'table-cell' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                          <CalendarTodayIcon sx={{ fontSize: 14 }} />
                          <Typography variant="body2">
                            {user.created_date ? format(new Date(user.created_date), 'MMM d, yyyy') : 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {user.is_tutor && <Chip label="Tutor" size="small" variant="outlined" />}
                          {user.is_coordinator && <Chip label="Coordinator" size="small" variant="outlined" />}
                          {user.account_banned && <Chip label="Banned" size="small" color="error" />}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button
                            component={Link}
                            to={createPageUrl('AdminUserProfile') + `?userId=${user.id}`}
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon sx={{ fontSize: 16 }} />}
                          >
                            Profile
                          </Button>
                          {user.role !== 'admin' && <Button size="small" color={user.account_banned ? 'success' : 'error'} variant="outlined" onClick={() => { if (window.confirm(`${user.account_banned ? 'Restore' : 'Restrict'} access for ${user.full_name || user.email}?`)) banMutation.mutate({ user, banned: !user.account_banned }); }}>{user.account_banned ? 'Unban' : 'Ban'}</Button>}
                          <IconButton size="small" aria-label={`Message ${user.full_name || user.email}`} onClick={() => setMessageUser(user)} sx={{ border: 1, borderColor: 'divider' }}>
                            <SendIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
          Showing {filteredUsers.length} of {users.length} users
        </Typography>
      </Container>

      {/* Email Dialog */}
      <Dialog open={!!messageUser} onClose={() => setMessageUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: '#ffedd5', color: '#4f46e5', width: 40, height: 40 }}><SendIcon /></Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>Send Email</Typography>
              <Typography variant="caption" color="text.secondary">
                To: {messageUser?.full_name} ({messageUser?.email})
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Email subject..."
              fullWidth
            />
            <TextField
              label="Message"
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Type your message..."
              multiline
              rows={8}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => { setMessageUser(null); setEmailSubject(''); setEmailBody(''); }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendEmail}
            disabled={sendEmailMutation.isPending}
            variant="contained"
            startIcon={sendEmailMutation.isPending ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <SendIcon />}
            sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#c2410c' } }}
          >
            {sendEmailMutation.isPending ? 'Sending...' : 'Send Email'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Email Dialog */}
      <Dialog open={showBulkEmail} onClose={() => setShowBulkEmail(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: '#ffedd5', color: '#4f46e5', width: 40, height: 40 }}><PeopleIcon /></Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>Send Bulk Email</Typography>
              <Typography variant="caption" color="text.secondary">To {selectedUsers.length} selected users</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              fullWidth
            />
            <TextField
              label="Message"
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              multiline
              rows={8}
              fullWidth
            />
            <Box sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 1.5 }}>
              <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 1 }}>
                Recipients ({selectedUsers.length}):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selectedUsers.slice(0, 10).map((user) => (
                  <Chip key={user.id} label={user.full_name} size="small" variant="outlined" />
                ))}
                {selectedUsers.length > 10 && (
                  <Chip label={`+${selectedUsers.length - 10} more`} size="small" variant="outlined" />
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => { setShowBulkEmail(false); setEmailSubject(''); setEmailBody(''); }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBulkEmail}
            variant="contained"
            startIcon={<SendIcon />}
            sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#c2410c' } }}
          >
            Send to All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}