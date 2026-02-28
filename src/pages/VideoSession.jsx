import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Video, Users, Calendar, Clock, ArrowLeft, 
  CheckCircle, XCircle, Trash2, PlayCircle
} from 'lucide-react';
import { format } from 'date-fns';
import CustomVideoCall from '@/components/video/CustomVideoCall';
import RealTimeChatPanel from '@/components/session/RealTimeChatPanel';
import SessionLiveChat from '@/components/chat/SessionLiveChat';

export default function VideoSession() {
  const [user, setUser] = useState(null);
  const [inSession, setInSession] = useState(false);
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('id');

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: session, isLoading: loadingSession, error: sessionError } = useQuery({
    queryKey: ['video-session', sessionId],
    queryFn: async () => {
      const sessions = await base44.entities.VideoSession.filter({ id: sessionId });
      return sessions[0];
    },
    enabled: !!sessionId,
    retry: 2,
  });

  const { data: course } = useQuery({
    queryKey: ['course', session?.course_id],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: session.course_id });
      return courses[0];
    },
    enabled: !!session?.course_id && session.course_id !== 'null',
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ sessionId, data }) => base44.entities.VideoSession.update(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['video-session']);
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId) => base44.entities.VideoSession.delete(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries(['video-session']);
      window.location.href = createPageUrl('Dashboard');
    },
  });

  const isTutor = user?.email === session?.tutor_email;
  const isInvited = session?.invited_students?.includes(user?.email);
  const canJoin = isTutor || isInvited;

  const sessionDateTime = session?.scheduled_date && session?.scheduled_time
    ? new Date(`${session.scheduled_date}T${session.scheduled_time}`)
    : null;

  const isScheduledNow = sessionDateTime && new Date() >= sessionDateTime;

  const handleStartSession = () => {
    if (isTutor && session.status === 'scheduled') {
      updateSessionMutation.mutate({
        sessionId: session.id,
        data: { status: 'live' }
      });
    }
    
    // Redirect to Google Meet if available
    if (session.meet_link) {
      window.open(session.meet_link, '_blank');
    } else {
      setInSession(true);
    }
  };

  const handleEndSession = () => {
    if (isTutor) {
      updateSessionMutation.mutate({
        sessionId: session.id,
        data: { status: 'completed' }
      });
    }
    setInSession(false);
  };

  const handleResumeSession = () => {
    if (session.meet_link) {
      window.open(session.meet_link, '_blank');
    } else if (session.status === 'live' || (isTutor && session.status === 'scheduled')) {
      setInSession(true);
    }
  };

  const handleDeleteSession = () => {
    if (confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      deleteSessionMutation.mutate(session.id);
    }
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading session...</p>
        </Card>
      </div>
    );
  }

  if (sessionError || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {sessionError ? 'Error Loading Session' : 'Session Not Found'}
          </h2>
          <p className="text-gray-600 mb-6">
            {sessionError ? 'There was an error loading the session. Please try again.' : 'This session may have been removed or doesn\'t exist.'}
          </p>
          <Link to={createPageUrl('Dashboard')}>
            <Button>Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!canJoin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You are not invited to this session.</p>
          <Link to={createPageUrl('Dashboard')}>
            <Button>Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (inSession) {
    return (
      <CustomVideoCall 
        session={session}
        course={course}
        user={user}
        onEndSession={handleEndSession}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={createPageUrl('Dashboard')}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <Card className="overflow-hidden">
          {/* Session Header */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <Video className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-1">{session.title}</h1>
                  <p className="text-purple-100">{course?.title}</p>
                </div>
              </div>
              <Badge className={
                session.status === 'live' ? 'bg-red-500' :
                session.status === 'completed' ? 'bg-gray-500' :
                session.status === 'cancelled' ? 'bg-gray-600' :
                'bg-green-500'
              }>
                {session.status === 'live' ? '🔴 Live' : session.status.charAt(0).toUpperCase() + session.status.slice(1)}
              </Badge>
            </div>

            {session.description && (
              <p className="text-purple-100 mb-4">{session.description}</p>
            )}

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <div>
                  <p className="text-xs text-purple-200">Date</p>
                  <p className="font-medium">
                    {sessionDateTime && format(sessionDateTime, 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <div>
                  <p className="text-xs text-purple-200">Time</p>
                  <p className="font-medium">
                    {session.scheduled_time} ({session.duration_minutes} min)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <div>
                  <p className="text-xs text-purple-200">Participants</p>
                  <p className="font-medium">{session.invited_students?.length || 0} students</p>
                </div>
              </div>
            </div>
          </div>

          {/* Session Content */}
          <div className="p-8">
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">About this session</h3>
              <p className="text-gray-600">
                Join this live video session to learn directly from your tutor. The session will open in Google Meet in a new tab.
              </p>
              {session.meet_link && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Google Meet link is ready
                  </p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Session Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Instructor:</span>
                  <span className="font-medium text-gray-900">{session.tutor_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Course:</span>
                  <span className="font-medium text-gray-900">{course?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium text-gray-900">{session.duration_minutes} minutes</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {session.status === 'completed' ? (
                <div className="flex-1 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <CheckCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">This session has ended</p>
                </div>
              ) : session.status === 'cancelled' ? (
                <div className="flex-1 p-4 bg-red-50 rounded-lg border border-red-200 text-center">
                  <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-red-600 font-medium">This session has been cancelled</p>
                </div>
              ) : session.status === 'live' ? (
                <Button
                  onClick={handleResumeSession}
                  className="flex-1 h-14 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <PlayCircle className="w-5 h-5 mr-2" />
                  {session.meet_link ? 'Join Google Meet' : 'Resume Session'}
                </Button>
              ) : (
                <Button
                  onClick={handleStartSession}
                  disabled={!isScheduledNow && !isTutor}
                  className="flex-1 h-14 text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  <Video className="w-5 h-5 mr-2" />
                  {isTutor ? 'Start Google Meet' : 'Join Google Meet'}
                </Button>
              )}

              {isTutor && session.status === 'scheduled' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (confirm('Cancel this session?')) {
                      updateSessionMutation.mutate({
                        sessionId: session.id,
                        data: { status: 'cancelled' }
                      });
                    }
                  }}
                  className="h-14"
                >
                  Cancel Session
                </Button>
              )}

              {isTutor && (session.status === 'completed' || session.status === 'cancelled') && (
                <Button
                  variant="destructive"
                  onClick={handleDeleteSession}
                  disabled={deleteSessionMutation.isPending}
                  className="h-14"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleteSessionMutation.isPending ? 'Deleting...' : 'Delete Session'}
                </Button>
              )}
            </div>

            {!isScheduledNow && !isTutor && session.status === 'scheduled' && (
              <p className="text-sm text-amber-600 text-center mt-4">
                ⏰ Session starts at {session.scheduled_time} on {sessionDateTime && format(sessionDateTime, 'MMM d, yyyy')}
              </p>
            )}

            {/* Live Session Chat */}
            {(session.status === 'live' || session.status === 'scheduled') && user && (
              <div className="mt-6">
                <SessionLiveChat
                  sessionId={session.id}
                  sessionTitle={session.title}
                  currentUser={user}
                  height={360}
                />
              </div>
            )}

            {/* Recording Player */}
            {session.recording_url && session.status === 'completed' && (
              <div className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Video className="w-5 h-5 text-purple-600" />
                  Session Recording Available
                </h3>
                <video 
                  controls 
                  className="w-full rounded-lg border-2 border-white shadow-lg"
                  src={session.recording_url}
                >
                  Your browser does not support video playback.
                </video>
                <div className="flex gap-3 mt-4">
                  <a 
                    href={session.recording_url} 
                    download 
                    className="flex-1 text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Download Recording
                  </a>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}