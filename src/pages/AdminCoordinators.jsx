import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  UserCheck, UserX, Shield, Ban, CheckCircle, Plus, Settings, Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AdminCoordinators() {
  const [user, setUser] = useState(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.asServiceRole.entities.User.list('full_name', 1000),
  });

  const { data: coordinatorRequests = [] } = useQuery({
    queryKey: ['coordinator-requests'],
    queryFn: () => base44.entities.CoordinatorRequest.filter({ status: 'pending' }, '-created_date', 100),
  });

  const { data: siteContent = [] } = useQuery({
    queryKey: ['site-content'],
    queryFn: () => base44.entities.SiteContent.list('key', 1000),
  });

  const coordinators = allUsers.filter(u => u.is_coordinator);
  const participants = allUsers.filter(u => 
    !u.is_coordinator && 
    !u.is_tutor && 
    u.role !== 'admin'
  );

  const currentPassword = siteContent.find(c => c.key === 'coordinator_password')?.value || 'YELP26';

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }) => base44.asServiceRole.entities.User.update(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-users']);
      queryClient.invalidateQueries(['assigned-participants']);
      toast.success('User updated successfully');
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (password) => {
      const existing = siteContent.find(c => c.key === 'coordinator_password');
      if (existing) {
        await base44.entities.SiteContent.update(existing.id, { value: password });
      } else {
        await base44.entities.SiteContent.create({
          key: 'coordinator_password',
          value: password,
          category: 'security'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['site-content']);
      setShowPasswordDialog(false);
      setNewPassword('');
      toast.success('Coordinator password updated');
    },
  });

  const approveRequestMutation = useMutation({
    mutationFn: async ({ requestId, userEmail, userName }) => {
      // 1. Find the user by email
      const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
      const targetUser = users[0];

      if (!targetUser) {
        throw new Error('User not found');
      }

      // 2. Assign coordinator role
      await base44.asServiceRole.entities.User.update(targetUser.id, { is_coordinator: true });
      
      // 3. Update request status
      await base44.entities.CoordinatorRequest.update(requestId, { 
        status: 'approved',
        processed_by: user.email,
        processed_date: new Date().toISOString()
      });

      // 4. Send welcome email
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

      // 5. Check for programs that need this coordinator
      try {
        const programs = await base44.entities.Program.list('-created_date', 100);
        const programsNeedingCoordinator = programs.filter(p => 
          p.coordinator_email === userEmail
        );

        // Auto-assign to matching programs
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
    onError: (error) => {
      toast.error(`Failed to approve: ${error.message}`);
    },
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

  const toggleCoordinator = async (userId, isCoordinator) => {
    await updateUserMutation.mutateAsync({
      userId,
      data: { is_coordinator: !isCoordinator }
    });
  };

  const toggleBan = async (userId, isBanned) => {
    await updateUserMutation.mutateAsync({
      userId,
      data: { coordinator_banned: !isBanned }
    });
  };

  const assignCoordinator = async (participantId, coordinatorEmail) => {
    await updateUserMutation.mutateAsync({
      userId: participantId,
      data: { assigned_coordinator_email: coordinatorEmail }
    });
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Only</h2>
            <p className="text-gray-600">You need admin privileges to access this page.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Coordinator Management</h1>
              <p className="text-gray-500 mt-1">Manage coordinators and assign participants</p>
            </div>
            <Button
              onClick={() => setShowPasswordDialog(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Change Password
            </Button>
          </div>
        </motion.div>

        {/* Debug Info */}
        <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>Debug:</strong> Total users: {allUsers.length}, Coordinators: {coordinators.length}, Participants: {participants.length}
          </p>
        </Card>

        {/* Coordinator Requests */}
        {coordinatorRequests.length > 0 && (
          <Card className="p-6 mb-6 bg-purple-50 border-purple-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-purple-600" />
              Pending Coordinator Requests ({coordinatorRequests.length})
            </h2>
            <div className="space-y-3">
              {coordinatorRequests.map(request => (
                <div key={request.id} className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{request.user_name}</p>
                      <p className="text-sm text-gray-600">{request.user_email}</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-3 italic">"{request.reason}"</p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      onClick={() => approveRequestMutation.mutate({ 
                        requestId: request.id, 
                        userEmail: request.user_email,
                        userName: request.user_name
                      })}
                      disabled={approveRequestMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => rejectRequestMutation.mutate(request.id)}
                      disabled={rejectRequestMutation.isPending}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Coordinators List */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-purple-600" />
              Coordinators ({coordinators.length})
            </h2>
            <div className="space-y-3">
              {coordinators.map(coordinator => (
                <Card key={coordinator.email} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={coordinator.avatar} />
                        <AvatarFallback className="bg-purple-100 text-purple-700">
                          {coordinator.full_name?.charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{coordinator.full_name}</p>
                        <p className="text-xs text-gray-500">{coordinator.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {coordinator.coordinator_banned && (
                        <Badge variant="destructive">Banned</Badge>
                      )}
                      <Button
                        size="sm"
                        variant={coordinator.coordinator_banned ? "default" : "destructive"}
                        onClick={() => toggleBan(coordinator.id, coordinator.coordinator_banned)}
                      >
                        {coordinator.coordinator_banned ? 'Unban' : 'Ban'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleCoordinator(coordinator.id, true)}
                      >
                        Remove Role
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {coordinators.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No coordinators yet
                </div>
              )}
            </div>
          </Card>

          {/* Assign Participants */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" />
              Assign Participants
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {participants.map(participant => (
                <Card key={participant.email} className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback className="bg-indigo-100 text-indigo-700">
                        {participant.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{participant.full_name}</p>
                      <p className="text-xs text-gray-500 truncate">{participant.email}</p>
                    </div>
                    {!participant.is_coordinator && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleCoordinator(participant.id, false)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Make Coordinator
                      </Button>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">
                      Assigned Coordinator {participant.assigned_coordinator_email && `(Current: ${participant.assigned_coordinator_email})`}
                    </Label>
                    <select
                      value={participant.assigned_coordinator_email || ''}
                      onChange={(e) => assignCoordinator(participant.id, e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="">None</option>
                      {coordinators.map(coord => (
                        <option key={coord.email} value={coord.email}>
                          {coord.full_name} ({coord.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Password Dialog */}
      {showPasswordDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowPasswordDialog(false)}>
          <div className="bg-white rounded-2xl p-6 w-96 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Change Coordinator Password</h3>
            <p className="text-sm text-gray-600 mb-4">Current password: <strong>{currentPassword}</strong></p>
            <div className="space-y-4">
              <div>
                <Label>New Password</Label>
                <Input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => updatePasswordMutation.mutate(newPassword)}
                  disabled={!newPassword.trim()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Update Password
                </Button>
                <Button onClick={() => setShowPasswordDialog(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}