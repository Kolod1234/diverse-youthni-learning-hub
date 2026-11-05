import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus, Lock, Globe, Calendar, UserPlus, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function StudyGroups({ courseId }) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    max_members: 10,
    is_private: false,
    meeting_schedule: ''
  });
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: studyGroups = [] } = useQuery({
    queryKey: ['study-groups', courseId],
    queryFn: () => base44.entities.StudyGroup.filter({ course_id: courseId, is_active: true }, '-created_date', 50)
  });

  const { data: myMemberships = [] } = useQuery({
    queryKey: ['my-memberships', user?.email],
    queryFn: () => base44.entities.StudyGroupMember.filter({ member_email: user?.email, status: 'active' }),
    enabled: !!user?.email
  });

  const createGroupMutation = useMutation({
    mutationFn: async (groupData) => {
      const group = await base44.entities.StudyGroup.create(groupData);
      await base44.entities.StudyGroupMember.create({
        group_id: group.id,
        member_email: user.email,
        member_name: user.full_name,
        member_avatar: user.avatar,
        role: 'owner'
      });
      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['study-groups']);
      queryClient.invalidateQueries(['my-memberships']);
      setShowCreateDialog(false);
      setNewGroup({ name: '', description: '', max_members: 10, is_private: false, meeting_schedule: '' });
      toast.success('Study group created!');
    }
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (groupId) => {
      await base44.entities.StudyGroupMember.create({
        group_id: groupId,
        member_email: user.email,
        member_name: user.full_name,
        member_avatar: user.avatar
      });
      const group = studyGroups.find(g => g.id === groupId);
      await base44.entities.StudyGroup.update(groupId, {
        member_count: (group.member_count || 1) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['study-groups']);
      queryClient.invalidateQueries(['my-memberships']);
      toast.success('Joined study group!');
    }
  });

  const leaveGroupMutation = useMutation({
    mutationFn: async (groupId) => {
      const membership = myMemberships.find(m => m.group_id === groupId);
      if (membership) {
        await base44.entities.StudyGroupMember.update(membership.id, { status: 'left' });
        const group = studyGroups.find(g => g.id === groupId);
        await base44.entities.StudyGroup.update(groupId, {
          member_count: Math.max(0, (group.member_count || 1) - 1)
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['study-groups']);
      queryClient.invalidateQueries(['my-memberships']);
      toast.success('Left study group');
    }
  });

  const handleCreateGroup = () => {
    if (!newGroup.name.trim()) {
      toast.error('Please enter a group name');
      return;
    }
    createGroupMutation.mutate({
      ...newGroup,
      course_id: courseId,
      owner_email: user.email,
      owner_name: user.full_name,
      member_count: 1
    });
  };

  const isInGroup = (groupId) => myMemberships.some(m => m.group_id === groupId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Study Groups</h2>
          <p className="text-gray-600">Join or create groups to learn together</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Study Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Group name"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
              />
              <Textarea
                placeholder="Description..."
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                rows={3}
              />
              <Input
                placeholder="Meeting schedule (e.g., Mondays 7pm)"
                value={newGroup.meeting_schedule}
                onChange={(e) => setNewGroup({ ...newGroup, meeting_schedule: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Max members"
                value={newGroup.max_members}
                onChange={(e) => setNewGroup({ ...newGroup, max_members: parseInt(e.target.value) })}
                min={2}
                max={50}
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newGroup.is_private}
                  onChange={(e) => setNewGroup({ ...newGroup, is_private: e.target.checked })}
                />
                <span className="text-sm">Private group (requires approval)</span>
              </label>
              <Button onClick={handleCreateGroup} className="w-full" disabled={createGroupMutation.isPending}>
                Create Group
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studyGroups.map((group, index) => (
          <motion.div
            key={group.id}


          >
            <Card className="p-6 h-full flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  {group.is_private ? (
                    <Lock className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Globe className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {group.member_count}/{group.max_members}
                </div>
              </div>

              <h3 className="font-semibold text-lg mb-2">{group.name}</h3>
              <p className="text-gray-600 text-sm mb-4 flex-1">{group.description}</p>

              {group.meeting_schedule && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>{group.meeting_schedule}</span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">{group.owner_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Crown className="w-3 h-3 text-yellow-500" />
                  <span>{group.owner_name}</span>
                </div>
              </div>

              {isInGroup(group.id) ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => leaveGroupMutation.mutate(group.id)}
                  disabled={leaveGroupMutation.isPending}
                >
                  Leave Group
                </Button>
              ) : group.member_count >= group.max_members ? (
                <Button variant="outline" className="w-full" disabled>
                  Full
                </Button>
              ) : (
                <Button
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
                  onClick={() => joinGroupMutation.mutate(group.id)}
                  disabled={joinGroupMutation.isPending}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Join Group
                </Button>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {studyGroups.length === 0 && (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No study groups yet</h3>
          <p className="text-gray-500 mb-4">Create the first study group for this course!</p>
        </Card>
      )}
    </div>
  );
}