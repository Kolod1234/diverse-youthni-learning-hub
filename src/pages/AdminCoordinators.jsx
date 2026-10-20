import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Box, Container, Typography, Card, Button, Avatar, Chip, Select, MenuItem,
  FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, Stack
} from '@mui/material';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import ShieldIcon from '@mui/icons-material/Shield';
import LockIcon from '@mui/icons-material/Lock';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AdminCoordinators() {
  const [user, setUser] = useState(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => (await base44.functions.invoke('adminListUsers', { sort: 'full_name', limit: 1000 })).data.users,
  });

  const { data: coordinatorRequests = [] } = useQuery({
    queryKey: ['coordinator-requests'],
    queryFn: () => base44.entities.CoordinatorRequest.filter({ status: 'pending' }, '-created_date', 100),
  });

  const coordinators = allUsers.filter(u => u.is_coordinator);
  const participants = allUsers.filter(u => !u.is_coordinator && !u.is_tutor && u.role !== 'admin');

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }) => base44.functions.invoke('adminUpdateUser', { userId, data }),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-users']);
      queryClient.invalidateQueries(['assigned-participants']);
      toast.success('User updated successfully');
    },
  });

  const approveRequestMutation = useMutation({
    mutationFn: async ({ requestId, userEmail, userName }) => {
      await base44.functions.invoke('adminUpdateUser', { email: userEmail, data: { is_coordinator: true } });
      await base44.entities.CoordinatorRequest.update(requestId, {
        status: 'approved',
        processed_by: user.email,
        processed_date: new Date().toISOString()
      });

      try {
        await base44.functions.invoke('sendNotification', {
          recipient_email: userEmail,
          title: 'Welcome as a Coordinator!',
          message: `Congratulations ${userName}! Your coordinator request has been approved. You can now access the Coordinators Dashboard to manage participants, approve logbooks, and send messages. Use the coordinator password to access your dashboard.`,
          type: 'general',
          send_email: true,
        });
      } catch (err) {
        console.error('Failed to send welcome email:', err);
      }

      try {
        const programs = await base44.entities.Program.list('-created_date', 100);
        const programsNeedingCoordinator = programs.filter(p => p.coordinator_email === userEmail);
        for (const program of programsNeedingCoordinator) {
          await base44.entities.Program.update(program.id, {
            coordinator: userName,
            coordinator_email: userEmail
          });
        }
      } catch (err) {
        console.error('Failed to assign programs:', err);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['coordinator-requests']);
      queryClient.invalidateQueries(['all-users']);
      queryClient.invalidateQueries(['programs']);
      toast.success('Coordinator approved and welcome email sent!');
    },
    onError: (error) => toast.error(`Failed to approve: ${error.message}`),
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (requestId) => {
      await base44.entities.CoordinatorRequest.update(requestId, {
        status: 'rejected',
        processed_by: user.email,
        processed_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['coordinator-requests']);
      toast.success('Request rejected');
    },
  });

  const toggleCoordinator = (userId, isCoordinator) =>
    updateUserMutation.mutate({ userId, data: { is_coordinator: !isCoordinator } });
  const toggleBan = (userId, isBanned) =>
    updateUserMutation.mutate({ userId, data: { coordinator_banned: !isBanned } });
  const assignCoordinator = (participantId, coordinatorEmail) =>
    updateUserMutation.mutate({ userId: participantId, data: { assigned_coordinator_email: coordinatorEmail } });

  if (!user || user.role !== 'admin') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover' }}>
        <Card sx={{ p: 5, maxWidth: 400, textAlign: 'center' }}>
          <ShieldIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>Admin Only</Typography>
          <Typography color="text.secondary">You need admin privileges to access this page.</Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f8fafc, white)' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
            <Box>
              <Typography variant="h4" fontWeight={700}>Coordinator Management</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>Manage coordinators and assign participants</Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<LockIcon sx={{ fontSize: 16 }} />}
              onClick={() => setShowPasswordDialog(true)}
            >
              Change Password
            </Button>
          </Stack>
        </motion.div>


        {coordinatorRequests.length > 0 && (
          <Card sx={{ p: 3, mb: 3, bgcolor: '#faf5ff', border: 1, borderColor: '#e9d5ff' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <HowToRegIcon sx={{ color: '#9333ea' }} />
              <Typography variant="h6" fontWeight={700}>
                Pending Coordinator Requests ({coordinatorRequests.length})
              </Typography>
            </Stack>
            <Stack spacing={1.5}>
              {coordinatorRequests.map(request => (
                <Card key={request.id} sx={{ p: 2, border: 1, borderColor: '#e9d5ff' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                    <Box>
                      <Typography fontWeight={600}>{request.user_name}</Typography>
                      <Typography variant="body2" color="text.secondary">{request.user_email}</Typography>
                    </Box>
                    <Chip label="Pending" size="small" sx={{ bgcolor: '#fef9c3', color: '#854d0e' }} />
                  </Stack>
                  <Typography variant="body2" sx={{ mb: 1.5, fontStyle: 'italic', color: 'text.secondary' }}>
                    "{request.reason}"
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => approveRequestMutation.mutate({
                        requestId: request.id,
                        userEmail: request.user_email,
                        userName: request.user_name
                      })}
                      disabled={approveRequestMutation.isPending}
                      sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => rejectRequestMutation.mutate(request.id)}
                      disabled={rejectRequestMutation.isPending}
                    >
                      Reject
                    </Button>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Card>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3 }}>
          {/* Coordinators */}
          <Card sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <HowToRegIcon sx={{ color: '#9333ea' }} />
              <Typography variant="h6" fontWeight={700}>Coordinators ({coordinators.length})</Typography>
            </Stack>
            <Stack spacing={1.5}>
              {coordinators.map(coordinator => (
                <Card key={coordinator.email} sx={{ p: 2 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar src={coordinator.avatar} sx={{ bgcolor: '#f3e8ff', color: '#7e22ce' }}>
                        {coordinator.full_name?.charAt(0) || 'C'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>{coordinator.full_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{coordinator.email}</Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      {coordinator.coordinator_banned && (
                        <Chip label="Banned" size="small" color="error" />
                      )}
                      <Button
                        size="small"
                        variant={coordinator.coordinator_banned ? 'contained' : 'outlined'}
                        color={coordinator.coordinator_banned ? 'primary' : 'error'}
                        onClick={() => toggleBan(coordinator.id, coordinator.coordinator_banned)}
                      >
                        {coordinator.coordinator_banned ? 'Unban' : 'Ban'}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => toggleCoordinator(coordinator.id, true)}
                      >
                        Remove Role
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              ))}
              {coordinators.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>No coordinators yet</Box>
              )}
            </Stack>
          </Card>

          {/* Assign Participants */}
          <Card sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <SettingsIcon sx={{ color: '#4f46e5' }} />
              <Typography variant="h6" fontWeight={700}>Assign Participants</Typography>
            </Stack>
            <Stack spacing={1.5} sx={{ maxHeight: 600, overflowY: 'auto' }}>
              {participants.map(participant => (
                <Card key={participant.email} sx={{ p: 2, flexShrink: 0 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
                    <Avatar src={participant.avatar} sx={{ bgcolor: '#e0e7ff', color: '#4338ca', width: 40, height: 40 }}>
                      {participant.full_name?.charAt(0) || 'U'}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={500} noWrap>{participant.full_name}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{participant.email}</Typography>
                    </Box>
                    {!participant.is_coordinator && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AddIcon sx={{ fontSize: 12 }} />}
                        onClick={() => toggleCoordinator(participant.id, false)}
                      >
                        Make Coordinator
                      </Button>
                    )}
                  </Stack>
                  <FormControl fullWidth size="small">
                    <InputLabel>
                      Assigned Coordinator{participant.assigned_coordinator_email && ` (Current: ${participant.assigned_coordinator_email})`}
                    </InputLabel>
                    <Select
                      value={participant.assigned_coordinator_email || ''}
                      label={`Assigned Coordinator${participant.assigned_coordinator_email ? ` (Current: ${participant.assigned_coordinator_email})` : ''}`}
                      onChange={(e) => assignCoordinator(participant.id, e.target.value)}
                    >
                      <MenuItem value="">None</MenuItem>
                      {coordinators.map(coord => (
                        <MenuItem key={coord.email} value={coord.email}>
                          {coord.full_name} ({coord.email})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Card>
              ))}
            </Stack>
          </Card>
        </Box>
      </Container>

      <Dialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Coordinator Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            The coordinator password is stored securely as the Base44 secret <strong>COORDINATOR_ACCESS_CODE</strong> and
            is checked on the server. To change it, update that secret in Base44 (Secrets). Coordinators who have
            already entered it keep their access.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordDialog(false)} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}