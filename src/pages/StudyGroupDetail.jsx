import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import GroupLeaderboard from '@/components/studygroup/GroupLeaderboard';
import GroupChat from '@/components/studygroup/GroupChat';
import GroupSessions from '@/components/studygroup/GroupSessions';
import GroupProgress from '@/components/studygroup/GroupProgress';
import ChallengeCreator from '@/components/challenges/ChallengeCreator';
import ChallengeCard from '@/components/challenges/ChallengeCard';
import { ArrowLeft, Users, Trophy, Plus, MessageSquare, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function StudyGroupDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const groupId = params.get('id');
  const [showChallengeCreator, setShowChallengeCreator] = useState(false);

  const queryClient = useQueryClient();

  const { data: group } = useQuery({
    queryKey: ['study-group', groupId],
    queryFn: async () => {
      const groups = await base44.entities.StudyGroup.filter({ id: groupId });
      return groups[0];
    },
    enabled: !!groupId
  });

  const { data: members = [] } = useQuery({
    queryKey: ['group-members', groupId],
    queryFn: () => base44.entities.StudyGroupMember.filter({ group_id: groupId, status: 'active' }),
    enabled: !!groupId
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['group-challenges', groupId],
    queryFn: () => base44.entities.Challenge.filter({ study_group_id: groupId }),
    enabled: !!groupId
  });

  const { data: currentMember } = useQuery({
    queryKey: ['my-membership', groupId],
    queryFn: async () => {
      const user = await base44.auth.me();
      const membership = await base44.entities.StudyGroupMember.filter({ 
        group_id: groupId, 
        member_email: user.email 
      });
      return membership[0];
    },
    enabled: !!groupId
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.StudyGroupMember.create({
        group_id: groupId,
        member_email: user.email,
        member_name: user.full_name,
        member_avatar: user.avatar,
        status: group.is_private ? 'pending' : 'active'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-membership', groupId]);
      queryClient.invalidateQueries(['group-members', groupId]);
      toast.success(group.is_private ? 'Join request sent!' : 'Joined group!');
    }
  });

  if (!group) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const isMember = currentMember?.status === 'active';
  const isPending = currentMember?.status === 'pending';
  const isOwner = currentMember?.role === 'owner';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl('SocialHub'))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Study Groups
        </Button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
              <p className="text-gray-600">{group.description}</p>
            </div>
            <div className="flex gap-2">
              {group.is_private && <Badge variant="outline">Private</Badge>}
              {isMember && <Badge className="bg-green-600">Member</Badge>}
              {isPending && <Badge variant="outline">Pending</Badge>}
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {members.length} / {group.max_members} members
            </span>
            <span className="flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              {challenges.length} challenges
            </span>
            {group.meeting_schedule && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {group.meeting_schedule}
              </span>
            )}
          </div>

          {!isMember && !isPending && (
            <Button 
              onClick={() => joinMutation.mutate()} 
              className="mt-4"
              disabled={joinMutation.isPending || members.length >= group.max_members}
            >
              {group.is_private ? 'Request to Join' : 'Join Group'}
            </Button>
          )}

          {isPending && (
            <p className="mt-4 text-sm text-yellow-600">Your join request is pending approval</p>
          )}
        </div>

        {isMember && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">
                <TrendingUp className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="challenges">
                <Trophy className="w-4 h-4 mr-2" />
                Challenges
              </TabsTrigger>
              <TabsTrigger value="chat">
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="sessions">
                <Calendar className="w-4 h-4 mr-2" />
                Sessions
              </TabsTrigger>
              <TabsTrigger value="leaderboard">
                <Trophy className="w-4 h-4 mr-2" />
                Leaderboard
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid lg:grid-cols-2 gap-6">
                <GroupProgress groupId={groupId} />
                <div>
                  <GroupLeaderboard groupId={groupId} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="challenges">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Group Challenges</h2>
                <Dialog open={showChallengeCreator} onOpenChange={setShowChallengeCreator}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Challenge
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create Group Challenge</DialogTitle>
                    </DialogHeader>
                    <ChallengeCreator 
                      studyGroupId={groupId} 
                      onSuccess={() => setShowChallengeCreator(false)} 
                    />
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {challenges.map(challenge => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </div>

              {challenges.length === 0 && (
                <div className="text-center py-16 bg-white rounded-lg">
                  <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No group challenges yet</p>
                  <Button className="mt-4" onClick={() => setShowChallengeCreator(true)}>
                    Create First Challenge
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="chat">
              <GroupChat groupId={groupId} />
            </TabsContent>

            <TabsContent value="sessions">
              <GroupSessions groupId={groupId} />
            </TabsContent>

            <TabsContent value="leaderboard">
              <GroupLeaderboard groupId={groupId} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}