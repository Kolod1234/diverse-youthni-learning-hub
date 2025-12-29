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
    queryFn: () => base44.entities.User.list('full_name', 1000),
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
    mutationFn: ({ email, data }) => base44.entities.User.update(email, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-users']);
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

  const toggleCoordinator = async (userEmail, isCoordinator) => {
    await updateUserMutation.mutateAsync({
      email: userEmail,
      data: { is_coordinator: !isCoordinator }
    });
  };

  const toggleBan = async (userEmail, isBanned) => {
    await updateUserMutation.mutateAsync({
      email: userEmail,
      data: { coordinator_banned: !isBanned }
    });
  };

  const assignCoordinator = async (participantEmail, coordinatorEmail) => {
    await updateUserMutation.mutateAsync({
      email: participantEmail,
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
                        onClick={() => toggleBan(coordinator.email, coordinator.coordinator_banned)}
                      >
                        {coordinator.coordinator_banned ? 'Unban' : 'Ban'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleCoordinator(coordinator.email, true)}
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
                        onClick={() => toggleCoordinator(participant.email, false)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Make Coordinator
                      </Button>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 mb-1 block">Assigned Coordinator</Label>
                    <select
                      value={participant.assigned_coordinator_email || ''}
                      onChange={(e) => assignCoordinator(participant.email, e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="">None</option>
                      {coordinators.map(coord => (
                        <option key={coord.email} value={coord.email}>
                          {coord.full_name}
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