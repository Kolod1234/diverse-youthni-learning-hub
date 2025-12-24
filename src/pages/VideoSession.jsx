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
  CheckCircle, XCircle, LogOut, Mic, MicOff, VideoOff,
  MessageSquare, ThumbsUp, Hand, Heart, Smile, MonitorUp,
  FileText, Send, UserPlus, Settings, MoreVertical, Maximize
} from 'lucide-react';
import { format } from 'date-fns';

export default function VideoSession() {
  const [user, setUser] = useState(null);
  const [inSession, setInSession] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
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

  const { data: session } = useQuery({
    queryKey: ['video-session', sessionId],
    queryFn: async () => {
      const sessions = await base44.entities.VideoSession.filter({ id: sessionId });
      return sessions[0];
    },
    enabled: !!sessionId,
  });

  const { data: course } = useQuery({
    queryKey: ['course', session?.course_id],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: session.course_id });
      return courses[0];
    },
    enabled: !!session?.course_id,
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ sessionId, data }) => base44.entities.VideoSession.update(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['video-session']);
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
    setInSession(true);
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

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      sender: user?.full_name || 'You',
      message: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setNewMessage('');
  };

  const handleReaction = (emoji) => {
    // Show reaction animation
    const reactionEl = document.createElement('div');
    reactionEl.textContent = emoji;
    reactionEl.className = 'fixed text-4xl animate-bounce z-50';
    reactionEl.style.left = Math.random() * 80 + 10 + '%';
    reactionEl.style.bottom = '20%';
    document.body.appendChild(reactionEl);
    setTimeout(() => reactionEl.remove(), 2000);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <Card className="p-8 text-center">
          <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Session not found</h2>
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
    const jitsiDomain = 'meet.jit.si';
    const roomName = session.meeting_room_id;
    const displayName = user?.full_name || 'User';

    return (
      <div className="fixed inset-0 bg-gray-900 flex flex-col">
        {/* Top Bar - Zoom Style */}
        <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">{session.title}</h2>
              <p className="text-xs text-gray-400">{course?.title}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className="bg-red-500 text-white animate-pulse">
              🔴 LIVE
            </Badge>
            <span className="text-xs text-gray-400">
              {session.invited_students?.length || 0} participants
            </span>
          </div>

          <Button
            onClick={handleEndSession}
            size="sm"
            className="bg-red-600 hover:bg-red-700"
          >
            <LogOut className="w-3 h-3 mr-1" />
            End
          </Button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Video Area */}
          <div className="flex-1 relative">
            <iframe
              src={`https://${jitsiDomain}/${roomName}#config.prejoinPageEnabled=false&userInfo.displayName="${encodeURIComponent(displayName)}"&config.startWithVideoMuted=${isVideoOff}&config.startWithAudioMuted=${isMuted}`}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              className="w-full h-full"
            />

            {/* Zoom-Style Control Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="max-w-4xl mx-auto flex items-center justify-between">
                {/* Left Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setIsMuted(!isMuted)}
                    size="sm"
                    className={`${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'} rounded-full h-12 w-12`}
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </Button>
                  <Button
                    onClick={() => setIsVideoOff(!isVideoOff)}
                    size="sm"
                    className={`${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'} rounded-full h-12 w-12`}
                  >
                    {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                  </Button>
                </div>

                {/* Center Controls - Reactions & Features */}
                <div className="flex items-center gap-2">
                  {isTutor && (
                    <>
                      <Button
                        size="sm"
                        className="bg-gray-700 hover:bg-gray-600 rounded-full h-12 px-4"
                        title="Share Screen"
                      >
                        <MonitorUp className="w-5 h-5 mr-2" />
                        Share
                      </Button>
                      <Button
                        size="sm"
                        className="bg-gray-700 hover:bg-gray-600 rounded-full h-12 px-4"
                        title="Share Slides"
                      >
                        <FileText className="w-5 h-5 mr-2" />
                        Slides
                      </Button>
                    </>
                  )}
                  
                  {/* Reactions */}
                  <div className="flex items-center gap-1 bg-gray-800 rounded-full px-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-10 w-10 rounded-full hover:bg-gray-700"
                      onClick={() => handleReaction('👍')}
                      title="Thumbs up"
                    >
                      👍
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-10 w-10 rounded-full hover:bg-gray-700"
                      onClick={() => handleReaction('❤️')}
                      title="Love"
                    >
                      ❤️
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-10 w-10 rounded-full hover:bg-gray-700"
                      onClick={() => handleReaction('👏')}
                      title="Clap"
                    >
                      👏
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-10 w-10 rounded-full hover:bg-gray-700"
                      onClick={() => handleReaction('✋')}
                      title="Raise hand"
                    >
                      ✋
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-10 w-10 rounded-full hover:bg-gray-700"
                      onClick={() => handleReaction('😂')}
                      title="Laugh"
                    >
                      😂
                    </Button>
                  </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowParticipants(!showParticipants)}
                    size="sm"
                    className={`${showParticipants ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-gray-600 rounded-full h-12 px-4`}
                  >
                    <Users className="w-5 h-5 mr-2" />
                    {session.invited_students?.length || 0}
                  </Button>
                  <Button
                    onClick={() => setShowChat(!showChat)}
                    size="sm"
                    className={`${showChat ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-gray-600 rounded-full h-12 px-4`}
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Chat
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gray-700 hover:bg-gray-600 rounded-full h-12 w-12"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Sidebar - Zoom Style */}
          {showChat && (
            <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">
                    No messages yet. Start the conversation!
                  </p>
                ) : (
                  chatMessages.map(msg => (
                    <div key={msg.id} className="bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium text-sm">{msg.sender}</span>
                        <span className="text-gray-400 text-xs">{msg.timestamp}</span>
                      </div>
                      <p className="text-gray-200 text-sm">{msg.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 rounded-lg px-4"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Participants Sidebar */}
          {showParticipants && (
            <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Participants ({session.invited_students?.length || 0})
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <div className="flex items-center gap-3 p-2 bg-gray-700 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {session.tutor_name?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{session.tutor_name}</p>
                    <p className="text-gray-400 text-xs">Host</p>
                  </div>
                  <Badge className="bg-blue-600 text-xs">Host</Badge>
                </div>

                {session.invited_students?.map((email, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded-lg">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
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
                Join this live video session to learn directly from your tutor. Make sure you have a stable internet connection and your camera/microphone ready.
              </p>
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
              ) : (
                <Button
                  onClick={handleStartSession}
                  disabled={!isScheduledNow && !isTutor}
                  className="flex-1 h-14 text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  <Video className="w-5 h-5 mr-2" />
                  {isTutor ? 'Start Session' : 'Join Session'}
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
            </div>

            {!isScheduledNow && !isTutor && session.status === 'scheduled' && (
              <p className="text-sm text-amber-600 text-center mt-4">
                ⏰ Session starts at {session.scheduled_time} on {sessionDateTime && format(sessionDateTime, 'MMM d, yyyy')}
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}