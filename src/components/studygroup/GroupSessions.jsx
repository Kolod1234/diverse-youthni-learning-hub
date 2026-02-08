import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Plus, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import moment from 'moment';

export default function GroupSessions({ groupId }) {
  const [showCreate, setShowCreate] = useState(false);
  const [session, setSession] = useState({
    title: '',
    description: '',
    scheduled_time: '',
    duration_minutes: 60
  });

  const queryClient = useQueryClient();

  const { data: sessions = [] } = useQuery({
    queryKey: ['group-sessions', groupId],
    queryFn: () => base44.entities.GroupStudySession.filter({ group_id: groupId }, '-scheduled_time', 50)
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.GroupStudySession.create({
        ...data,
        group_id: groupId,
        organizer_email: user.email,
        organizer_name: user.full_name
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['group-sessions', groupId]);
      setShowCreate(false);
      setSession({ title: '', description: '', scheduled_time: '', duration_minutes: 60 });
      toast.success('Session scheduled!');
    }
  });

  const joinMutation = useMutation({
    mutationFn: async ({ sessionId, status }) => {
      const user = await base44.auth.me();
      const sessions = await base44.entities.GroupStudySession.filter({ id: sessionId });
      const currentSession = sessions[0];
      
      const updatedAttendees = [
        ...(currentSession.attendees || []).filter(a => a.email !== user.email),
        { email: user.email, name: user.full_name, status }
      ];

      return base44.entities.GroupStudySession.update(sessionId, {
        attendees: updatedAttendees
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['group-sessions', groupId]);
      toast.success('Response updated!');
    }
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate(session);
  };

  const upcomingSessions = sessions.filter(s => new Date(s.scheduled_time) > new Date());
  const pastSessions = sessions.filter(s => new Date(s.scheduled_time) <= new Date());

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">Study Sessions</h3>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Schedule Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Group Study Session</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  value={session.title}
                  onChange={(e) => setSession({...session, title: e.target.value})}
                  placeholder="Math Quiz Prep"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={session.description}
                  onChange={(e) => setSession({...session, description: e.target.value})}
                  placeholder="Let's prepare together..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Date & Time</label>
                  <Input
                    type="datetime-local"
                    value={session.scheduled_time}
                    onChange={(e) => setSession({...session, scheduled_time: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Duration (min)</label>
                  <Input
                    type="number"
                    value={session.duration_minutes}
                    onChange={(e) => setSession({...session, duration_minutes: parseInt(e.target.value)})}
                    min={15}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                Schedule Session
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {upcomingSessions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-gray-600">Upcoming</h4>
          {upcomingSessions.map(s => (
            <SessionCard key={s.id} session={s} onJoin={joinMutation.mutate} />
          ))}
        </div>
      )}

      {pastSessions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-gray-600">Past Sessions</h4>
          {pastSessions.slice(0, 3).map(s => (
            <SessionCard key={s.id} session={s} isPast />
          ))}
        </div>
      )}

      {sessions.length === 0 && (
        <Card className="p-8 text-center text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No sessions scheduled yet</p>
        </Card>
      )}
    </div>
  );
}

function SessionCard({ session, onJoin, isPast }) {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const userResponse = session.attendees?.find(a => a.email === user?.email);
  const joinedCount = session.attendees?.filter(a => a.status === 'joined').length || 0;

  return (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className="font-semibold">{session.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{session.description}</p>
        </div>
        {!isPast && userResponse && (
          <Badge variant={userResponse.status === 'joined' ? 'default' : 'outline'}>
            {userResponse.status}
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
        <span className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {moment(session.scheduled_time).format('MMM DD, YYYY')}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {moment(session.scheduled_time).format('h:mm A')} ({session.duration_minutes}m)
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          {joinedCount} attending
        </span>
      </div>

      <p className="text-xs text-gray-500 mb-3">Organized by {session.organizer_name}</p>

      {!isPast && (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onJoin({ sessionId: session.id, status: 'joined' })}
            disabled={userResponse?.status === 'joined'}
            className="flex-1"
          >
            <Check className="w-4 h-4 mr-1" />
            Join
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onJoin({ sessionId: session.id, status: 'maybe' })}
            disabled={userResponse?.status === 'maybe'}
            className="flex-1"
          >
            Maybe
          </Button>
        </div>
      )}
    </Card>
  );
}