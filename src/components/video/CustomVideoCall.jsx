import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Video, VideoOff, Mic, MicOff, MonitorUp, MonitorOff,
  MessageSquare, Users, LogOut, MoreVertical, Send,
  Maximize, Settings, Phone, Pencil, Bell, Check, X as XIcon, Image as ImageIcon
} from 'lucide-react';
import BreakoutRoomManager from './BreakoutRoomManager';
import Whiteboard from './Whiteboard';

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
  const [breakoutRooms, setBreakoutRooms] = useState([]);
  const [currentBreakoutRoom, setCurrentBreakoutRoom] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [showBreakoutManager, setShowBreakoutManager] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [waitingParticipants, setWaitingParticipants] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [virtualBackground, setVirtualBackground] = useState('none');
  const [audioNoiseSuppress, setAudioNoiseSuppress] = useState(true);

  const localVideoRef = useRef(null);
  const screenVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const peerConnections = useRef(new Map());
  const mediaRecorderRef = useRef(null);
  const animationFrameRef = useRef(null);
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
      console.log('Requesting HD media access...');
      
      // Request permissions first
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        },
        video: { 
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          frameRate: { ideal: 30 },
          facingMode: 'user'
        }
      });
      
      console.log('HD Media stream obtained:', {
        tracks: stream.getTracks().map(t => ({
          kind: t.kind,
          enabled: t.enabled,
          settings: t.getSettings()
        }))
      });
      
      setLocalStream(stream);
    } catch (error) {
      console.error('Error accessing HD media devices:', error);
      setError(`Camera/Microphone Error: ${error.message}\n\nPlease:\n1. Allow camera/mic access\n2. Close other apps using camera\n3. Refresh the page`);
      throw error;
    }
  };

  const joinRoom = async () => {
    if (!roomId || !session.id) {
      console.warn('Skipping join: roomId or sessionId is missing');
      setError('Invalid session configuration. Please refresh and try again.');
      return;
    }

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

      // Poll for new participants and messages (every 5 seconds to avoid rate limiting)
      const interval = setInterval(async () => {
        if (!roomId || !session.id) {
          console.warn('Skipping poll: roomId or sessionId is missing');
          return;
        }

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
          if (err.status === 429) {
            console.warn('Rate limited, skipping this poll cycle');
          } else {
            console.error('Error polling updates:', err);
          }
        }
      }, 5000);

      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  };

  // Effect to attach local stream to video element when it's available
  useEffect(() => {
    const attachStream = async () => {
      if (localStream && localVideoRef.current) {
        try {
          // Make sure video element is ready
          if (localVideoRef.current.srcObject !== localStream) {
            localVideoRef.current.srcObject = localStream;
          }
          localVideoRef.current.muted = true;
          localVideoRef.current.autoplay = true;
          localVideoRef.current.playsInline = true;
          
          // Force play with error handling
          try {
            await localVideoRef.current.play();
            console.log('✅ Video attached and playing');
          } catch (playError) {
            console.error('Play error:', playError);
            // Try again after a short delay
            setTimeout(async () => {
              try {
                await localVideoRef.current.play();
                console.log('✅ Video playing after retry');
              } catch (retryError) {
                console.error('Retry play error:', retryError);
              }
            }, 500);
          }
        } catch (err) {
          console.error('Error attaching video:', err);
        }
      }
    };

    attachStream();
  }, [localStream]);

  // Virtual background effect
  useEffect(() => {
    if (!localStream || !localVideoRef.current || !canvasRef.current || virtualBackground === 'none') {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    const video = localVideoRef.current;
    const ctx = canvas.getContext('2d');

    const applyBackground = () => {
      if (video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (virtualBackground === 'blur') {
          ctx.filter = 'blur(10px)';
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          ctx.filter = 'none';
          ctx.drawImage(video, canvas.width * 0.2, canvas.height * 0.2, canvas.width * 0.6, canvas.height * 0.6);
        } else if (virtualBackground !== 'none') {
          ctx.fillStyle = virtualBackground;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.globalAlpha = 0.8;
          ctx.drawImage(video, canvas.width * 0.1, canvas.height * 0.1, canvas.width * 0.8, canvas.height * 0.8);
          ctx.globalAlpha = 1.0;
        }
      }

      animationFrameRef.current = requestAnimationFrame(applyBackground);
    };

    applyBackground();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [localStream, virtualBackground]);

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
      console.log('Starting screen share...');
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          cursor: 'always',
          displaySurface: 'monitor'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      console.log('Screen share stream obtained');
      setScreenStream(stream);
      setIsScreenSharing(true);
      
      // Set stream with delay
      setTimeout(() => {
        if (screenVideoRef.current && stream) {
          screenVideoRef.current.srcObject = stream;
          screenVideoRef.current.play().catch(err => console.error('Screen play error:', err));
        }
      }, 100);

      // Auto stop when user stops sharing
      stream.getVideoTracks()[0].onended = () => {
        console.log('Screen share ended');
        setScreenStream(null);
        setIsScreenSharing(false);
      };
    } catch (error) {
      console.error('Error sharing screen:', error);
      if (error.name === 'NotAllowedError') {
        alert('Screen sharing denied. Please try again and allow access.');
      }
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!roomId || !session.id) {
      console.warn('Cannot send message: roomId or sessionId is missing');
      return;
    }

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

  const startRecording = async () => {
    try {
      // Create a canvas to capture both video and screen if sharing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const displayStream = isScreenSharing ? screenStream : localStream;

      if (!displayStream) {
        alert('No media stream available');
        return;
      }

      // Set canvas size
      const video = document.createElement('video');
      video.srcObject = displayStream;
      video.muted = true;
      await video.play();

      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      // Capture canvas stream
      const canvasStream = canvas.captureStream(30);
      
      // Add audio track from local stream
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        canvasStream.addTrack(audioTrack);
      }

      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm;codecs=vp8,opus';
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options.mimeType = 'video/webm';
        }
      }

      const mediaRecorder = new MediaRecorder(canvasStream, options);
      const chunks = [];

      // Draw video frames to canvas
      const drawFrame = () => {
        if (mediaRecorder.state === 'recording') {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(drawFrame);
        }
      };

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        await saveRecording(blob);
        video.pause();
      };

      mediaRecorder.start(1000);
      drawFrame();
      mediaRecorderRef.current = mediaRecorder;
      setRecordedChunks(chunks);
      setIsRecording(true);
      
      console.log('Recording started with enhanced capture');
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording: ' + error.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log('Recording stopped');
    }
  };

  const saveRecording = async (blob) => {
    try {
      // Convert blob to file
      const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'video/webm' });
      
      // Upload to storage
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Update session with recording URL
      await base44.entities.VideoSession.update(session.id, {
        recording_url: file_url,
        is_recorded: true
      });
      
      alert('Recording saved successfully!');
    } catch (error) {
      console.error('Error saving recording:', error);
      alert('Failed to save recording: ' + error.message);
    }
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
    <div className="fixed inset-0 bg-gray-900 flex flex-col z-50">
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-200px) scale(1.5); opacity: 0; }
        }
      `}</style>

      {/* Top Bar */}
      <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between border-b border-gray-700 relative z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">{session.title}</h2>
            <p className="text-xs text-gray-400">{course?.title}</p>
          </div>
          {currentBreakoutRoom && (
            <Badge className="bg-purple-600 text-white">
              📍 Room: {currentBreakoutRoom}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className="bg-red-500 text-white animate-pulse">🔴 LIVE</Badge>
          <span className="text-xs text-gray-400">{participants.length} participants</span>
          {isTutor && waitingParticipants.length > 0 && (
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 animate-pulse"
              onClick={() => {/* Handle waiting list */}}
            >
              <Bell className="w-3 h-3 mr-1" />
              {waitingParticipants.length} Waiting
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isTutor && (
            <Button
              onClick={() => setShowBreakoutManager(true)}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Users className="w-3 h-3 mr-1" />
              Breakout Rooms
            </Button>
          )}
          <Button
            onClick={onEndSession}
            size="sm"
            className="bg-red-600 hover:bg-red-700 relative z-50"
          >
            <LogOut className="w-3 h-3 mr-1" />
            End
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative z-10">
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
          <div className={`${isScreenSharing ? 'absolute bottom-20 right-4 w-64 h-48 z-30' : 'w-full h-full'} bg-gray-800 rounded-lg overflow-hidden relative`}>
            {localStream ? (
              <>
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full object-cover ${virtualBackground !== 'none' ? 'hidden' : ''}`}
                  style={{ transform: 'scaleX(-1)' }}
                  onLoadedMetadata={() => console.log('✅ Video metadata loaded')}
                  onCanPlay={() => console.log('✅ Video can play')}
                  onPlay={() => console.log('✅ Video is playing')}
                />
                {virtualBackground !== 'none' && (
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center">
                  <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-white">Starting camera...</p>
                </div>
              </div>
            )}
            {isVideoOff && localStream && (
              <div className="absolute inset-0 bg-gray-700 flex items-center justify-center z-10">
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
            <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs z-20">
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
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-40">
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
                  <>
                    <Button
                      onClick={startScreenShare}
                      size="sm"
                      className={`${isScreenSharing ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-gray-600 rounded-full h-12 px-4`}
                    >
                      {isScreenSharing ? <MonitorOff className="w-5 h-5 mr-2" /> : <MonitorUp className="w-5 h-5 mr-2" />}
                      {isScreenSharing ? 'Stop' : 'Share'}
                    </Button>
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      size="sm"
                      className={`${isRecording ? 'bg-red-600 animate-pulse' : 'bg-gray-700'} hover:bg-gray-600 rounded-full h-12 px-4`}
                    >
                      <div className={`w-3 h-3 rounded-full mr-2 ${isRecording ? 'bg-white' : 'bg-red-500'}`} />
                      {isRecording ? 'Recording...' : 'Record'}
                    </Button>
                    <Button
                      onClick={() => setShowWhiteboard(true)}
                      size="sm"
                      className="bg-gray-700 hover:bg-gray-600 rounded-full h-12 px-4"
                    >
                      <Pencil className="w-5 h-5 mr-2" />
                      Whiteboard
                    </Button>
                  </>
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
                  onClick={() => setShowSettings(!showSettings)}
                  size="sm"
                  className={`${showSettings ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-gray-600 rounded-full h-12 w-12`}
                >
                  <Settings className="w-5 h-5" />
                </Button>
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
              {participants.map((participant) => {
                const participantRoom = participant.breakoutRoom || currentBreakoutRoom;
                return (
                  <div key={participant.userId} className="flex items-center gap-3 p-2 bg-gray-700 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {participant.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{participant.name}</p>
                      <p className="text-gray-400 text-xs">{participant.email}</p>
                      {participantRoom && (
                        <Badge className="bg-purple-600 text-xs mt-1">📍 {participantRoom}</Badge>
                      )}
                    </div>
                    {participant.email === session.tutor_email && (
                      <Badge className="bg-blue-600 text-xs">Host</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Breakout Room Manager Dialog */}
      {showBreakoutManager && (
        <BreakoutRoomManager
          participants={participants}
          currentRooms={breakoutRooms}
          isTutor={isTutor}
          currentUserRoom={currentBreakoutRoom}
          onCreateRooms={(rooms) => {
            setBreakoutRooms(rooms);
          }}
          onAssignParticipant={(participantEmail, roomName) => {
            // Update participant's room assignment
            setParticipants(prev => prev.map(p => 
              p.email === participantEmail ? { ...p, breakoutRoom: roomName } : p
            ));
          }}
          onJoinRoom={(roomName) => {
            setCurrentBreakoutRoom(roomName);
          }}
          onLeaveRoom={() => {
            setCurrentBreakoutRoom(null);
          }}
          onCloseRoom={(roomName) => {
            setBreakoutRooms(prev => prev.filter(r => r.name !== roomName));
            setParticipants(prev => prev.map(p => 
              p.breakoutRoom === roomName ? { ...p, breakoutRoom: null } : p
            ));
            if (currentBreakoutRoom === roomName) {
              setCurrentBreakoutRoom(null);
            }
          }}
          onClose={() => setShowBreakoutManager(false)}
        />
      )}

      {/* Whiteboard */}
      {showWhiteboard && (
        <Whiteboard onClose={() => setShowWhiteboard(false)} />
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed bottom-24 right-4 z-[60] w-80 animate-slide-in">
          <Card className="p-4 bg-white shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Video Settings
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSettings(false)}
              >
                <XIcon className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Virtual Background */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Virtual Background
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setVirtualBackground('none')}
                    className={`p-2 rounded-lg border-2 transition ${
                      virtualBackground === 'none' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-full h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">None</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setVirtualBackground('blur')}
                    className={`p-2 rounded-lg border-2 transition ${
                      virtualBackground === 'blur' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-full h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded flex items-center justify-center backdrop-blur">
                      <span className="text-xs font-medium text-white">Blur</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setVirtualBackground('linear-gradient(135deg, #667eea 0%, #764ba2 100%)')}
                    className={`p-2 rounded-lg border-2 transition ${
                      virtualBackground.includes('667eea') 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-full h-12 rounded" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} />
                  </button>
                  <button
                    onClick={() => setVirtualBackground('linear-gradient(135deg, #f093fb 0%, #f5576c 100%)')}
                    className={`p-2 rounded-lg border-2 transition ${
                      virtualBackground.includes('f093fb') 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-full h-12 rounded" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }} />
                  </button>
                  <button
                    onClick={() => setVirtualBackground('linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)')}
                    className={`p-2 rounded-lg border-2 transition ${
                      virtualBackground.includes('4facfe') 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-full h-12 rounded" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }} />
                  </button>
                  <button
                    onClick={() => setVirtualBackground('linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)')}
                    className={`p-2 rounded-lg border-2 transition ${
                      virtualBackground.includes('43e97b') 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-full h-12 rounded" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }} />
                  </button>
                </div>
              </div>

              {/* Audio Enhancement */}
              <div>
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Enhanced Noise Suppression</span>
                  <button
                    onClick={() => setAudioNoiseSuppress(!audioNoiseSuppress)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      audioNoiseSuppress ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        audioNoiseSuppress ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Reduces background noise for clearer audio
                </p>
              </div>

              {/* Recording Info */}
              {isRecording && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                    Recording in progress
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    All video and audio is being captured
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Waiting Room Notifications */}
      {isTutor && waitingParticipants.length > 0 && (
        <div className="fixed top-20 right-4 z-[60] space-y-2">
          {waitingParticipants.map(participant => (
            <Card key={participant.email} className="p-4 bg-white shadow-lg border-l-4 border-amber-500 animate-slide-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <Bell className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{participant.name}</p>
                  <p className="text-xs text-gray-500">wants to join the session</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setWaitingParticipants(prev => prev.filter(p => p.email !== participant.email));
                      setParticipants(prev => [...prev, { ...participant, approved: true }]);
                    }}
                    className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setWaitingParticipants(prev => prev.filter(p => p.email !== participant.email));
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <XIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}