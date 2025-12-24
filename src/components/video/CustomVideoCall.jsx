import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Video, VideoOff, Mic, MicOff, MonitorUp, MonitorOff,
  MessageSquare, Users, LogOut, MoreVertical, Send,
  Maximize, Settings, Phone
} from 'lucide-react';

export default function CustomVideoCall({ session, course, user, onEndSession }) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [screenStream, setScreenStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const localVideoRef = useRef(null);
  const screenVideoRef = useRef(null);
  const peerConnections = useRef(new Map());
  const roomId = session.meeting_room_id;
  const userId = user?.email || 'guest';
  const isTutor = user?.email === session.tutor_email;

  // STUN/TURN servers configuration
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  };

  // Initialize media
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeMedia();
        await joinRoom();
        setIsLoading(false);
      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to initialize video session. Please refresh and try again.');
        setIsLoading(false);
      }
    };
    
    initialize();

    return () => {
      cleanup();
    };
  }, []);

  const initializeMedia = async () => {
    try {
      console.log('Requesting media access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      console.log('Media access granted', stream);
      setLocalStream(stream);
      
      // Ensure video element is ready
      setTimeout(() => {
        if (localVideoRef.current && stream) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(err => {
            console.error('Error playing video:', err);
          });
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert(`Camera/Microphone Error: ${error.message}\n\nPlease:\n1. Allow camera and microphone access\n2. Make sure no other app is using them\n3. Refresh and try again`);
    }
  };

  const joinRoom = async () => {
    try {
      const response = await base44.functions.invoke('videoSignaling', {
        action: 'join',
        roomId,
        sessionId: session.id,
        userId
      });
      
      if (response.data.participants) {
        setParticipants(response.data.participants);
      }

      // Poll for new participants and messages
      const interval = setInterval(async () => {
        try {
          const [participantsRes, messagesRes] = await Promise.all([
            base44.functions.invoke('videoSignaling', {
              action: 'get-participants',
              roomId,
              sessionId: session.id,
              userId
            }),
            base44.functions.invoke('videoSignaling', {
              action: 'get-messages',
              roomId,
              sessionId: session.id,
              userId
            })
          ]);

          if (participantsRes.data.participants) {
            setParticipants(participantsRes.data.participants);
          }
          if (messagesRes.data.messages) {
            setChatMessages(messagesRes.data.messages);
          }
        } catch (err) {
          console.error('Error polling updates:', err);
        }
      }, 2000);

      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  };

  const cleanup = async () => {
    // Stop all tracks
    localStream?.getTracks().forEach(track => track.stop());
    screenStream?.getTracks().forEach(track => track.stop());
    
    // Close peer connections
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();

    // Leave room
    try {
      await base44.functions.invoke('videoSignaling', {
        action: 'leave',
        roomId,
        sessionId: session.id,
        userId
      });
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const startScreenShare = async () => {
    if (isScreenSharing) {
      screenStream?.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false
      });

      setScreenStream(stream);
      setIsScreenSharing(true);
      
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
      }

      // Auto stop when user stops sharing
      stream.getVideoTracks()[0].onended = () => {
        setScreenStream(null);
        setIsScreenSharing(false);
      };
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await base44.functions.invoke('videoSignaling', {
        action: 'send-message',
        roomId,
        sessionId: session.id,
        userId,
        message: newMessage
      });

      if (response.data.message) {
        setChatMessages(prev => [...prev, response.data.message]);
      }
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      // Still clear input to prevent confusion
      setNewMessage('');
    }
  };

  const handleReaction = (emoji) => {
    const reactionEl = document.createElement('div');
    reactionEl.textContent = emoji;
    reactionEl.className = 'fixed text-4xl z-50';
    reactionEl.style.cssText = `
      left: ${Math.random() * 80 + 10}%;
      bottom: 20%;
      animation: float-up 2s ease-out forwards;
    `;
    document.body.appendChild(reactionEl);
    setTimeout(() => reactionEl.remove(), 2000);
  };

  // Show error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
              Retry
            </Button>
            <Button onClick={onEndSession} variant="outline">
              Exit Session
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Connecting to session...</p>
          <p className="text-gray-400 text-sm mt-2">Please allow camera and microphone access</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col">
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-200px) scale(1.5); opacity: 0; }
        }
      `}</style>

      {/* Top Bar */}
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
          <Badge className="bg-red-500 text-white animate-pulse">🔴 LIVE</Badge>
          <span className="text-xs text-gray-400">{participants.length} participants</span>
        </div>

        <Button
          onClick={onEndSession}
          size="sm"
          className="bg-red-600 hover:bg-red-700"
        >
          <LogOut className="w-3 h-3 mr-1" />
          End
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 relative bg-black">
          {/* Screen Share View */}
          {isScreenSharing && (
            <div className="absolute inset-0 flex items-center justify-center">
              <video
                ref={screenVideoRef}
                autoPlay
                playsInline
                className="max-w-full max-h-full"
              />
              <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <MonitorUp className="w-4 h-4" />
                <span className="text-sm font-medium">You are sharing your screen</span>
              </div>
            </div>
          )}

          {/* Local Video (Picture-in-Picture when screen sharing) */}
          <div className={`${isScreenSharing ? 'absolute bottom-20 right-4 w-64 h-48' : 'w-full h-full'} bg-gray-800 rounded-lg overflow-hidden`}>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            {isVideoOff && (
              <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white text-2xl font-bold">
                      {user?.full_name?.charAt(0) || 'Y'}
                    </span>
                  </div>
                  <p className="text-white text-sm">Camera Off</p>
                </div>
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
              You {isMuted && '(muted)'}
            </div>
          </div>

          {/* Remote Videos Grid */}
          {!isScreenSharing && remoteStreams.size > 0 && (
            <div className={`absolute top-4 right-4 grid gap-2 ${
              remoteStreams.size === 1 ? 'grid-cols-1' : 
              remoteStreams.size <= 4 ? 'grid-cols-2' : 'grid-cols-3'
            }`}>
              {Array.from(remoteStreams.entries()).map(([peerId, stream]) => (
                <div key={peerId} className="w-40 h-32 bg-gray-800 rounded-lg overflow-hidden relative">
                  <video
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    ref={(el) => {
                      if (el) el.srcObject = stream;
                    }}
                  />
                  <div className="absolute bottom-1 left-1 bg-black/60 text-white px-2 py-0.5 rounded text-xs">
                    Participant
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Control Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              {/* Left Controls */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={toggleMute}
                  size="sm"
                  className={`${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'} rounded-full h-12 w-12`}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
                <Button
                  onClick={toggleVideo}
                  size="sm"
                  className={`${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'} rounded-full h-12 w-12`}
                >
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </Button>
              </div>

              {/* Center Controls */}
              <div className="flex items-center gap-2">
                {isTutor && (
                  <Button
                    onClick={startScreenShare}
                    size="sm"
                    className={`${isScreenSharing ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-gray-600 rounded-full h-12 px-4`}
                  >
                    {isScreenSharing ? <MonitorOff className="w-5 h-5 mr-2" /> : <MonitorUp className="w-5 h-5 mr-2" />}
                    {isScreenSharing ? 'Stop' : 'Share'}
                  </Button>
                )}
                
                {/* Reactions */}
                <div className="flex items-center gap-1 bg-gray-800 rounded-full px-2">
                  {['👍', '❤️', '👏', '✋', '😂'].map(emoji => (
                    <Button
                      key={emoji}
                      size="sm"
                      variant="ghost"
                      className="h-10 w-10 rounded-full hover:bg-gray-700"
                      onClick={() => handleReaction(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
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
                  {participants.length}
                </Button>
                <Button
                  onClick={() => setShowChat(!showChat)}
                  size="sm"
                  className={`${showChat ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-gray-600 rounded-full h-12 px-4`}
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Chat
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
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
                Participants ({participants.length})
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {participants.map((participant) => (
                <div key={participant.userId} className="flex items-center gap-3 p-2 bg-gray-700 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {participant.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{participant.name}</p>
                    <p className="text-gray-400 text-xs">{participant.email}</p>
                  </div>
                  {participant.email === session.tutor_email && (
                    <Badge className="bg-blue-600 text-xs">Host</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}