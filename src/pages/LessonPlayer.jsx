import React, { useState, useRef, useEffect } from 'react';
import { Presentation, Video, Users, Play, Maximize, Minimize, Camera } from 'lucide-react';

export default function IntegratedLessonPlayer({ slideEmbedUrl, onlineUsers = [] }) {
  // 1. ALL HOOKS AT THE TOP
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const playerRef = useRef(null);
  const videoRef = useRef(null);

  // Sync Fullscreen state
  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleCamera = async () => {
    try {
      if (!isCameraOn) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setIsCameraOn(true);
      } else {
        const stream = videoRef.current.srcObject;
        stream.getTracks().forEach(track => track.stop());
        setIsCameraOn(false);
      }
    } catch (err) {
      alert("Camera access failed. Please check permissions.");
    }
  };

  return (
    <div ref={playerRef} className="fixed inset-0 flex flex-col bg-slate-950 text-white overflow-hidden">
      
      {/* 2. RESPONSIVE HEADER */}
      <header className="h-14 flex items-center justify-between px-4 bg-slate-900 border-b border-slate-800 flex-none z-10">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="bg-red-600 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">LIVE</span>
          <h1 className="text-sm font-medium truncate">Cell Structure & Function</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-xs flex items-center gap-1">
            <Users size={14} /> Join
          </button>
          <button onClick={toggleFullScreen} className="p-1.5 hover:bg-white/10 rounded">
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </header>

      {/* 3. MAIN WORKSPACE: SIDEBAR + CONTENT */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* LEFT PANEL: Users & Webcam */}
        <aside className="hidden lg:flex w-72 bg-slate-900/50 border-r border-slate-800 flex-col flex-none">
          <div className="p-4 border-b border-slate-800 font-bold text-xs uppercase tracking-widest text-slate-500">
            Participants ({onlineUsers.length})
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {onlineUsers.map((user, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500" /> {user.name}
              </div>
            ))}
          </div>
          {/* Webcam Preview in Sidebar */}
          <div className="p-2 bg-black border-t border-slate-800 relative aspect-video">
            <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover rounded ${!isCameraOn && 'hidden'}`} />
            {!isCameraOn && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-600 bg-slate-900">
                <Video size={32} />
              </div>
            )}
          </div>
        </aside>

        {/* MAIN STAGE: SLIDES (The No-Overflow Fix) */}
        <main className="flex-1 flex flex-col relative bg-black overflow-hidden">
          {!showQuiz ? (
            <div className="flex-1 flex flex-col p-2 sm:p-4">
              {/* Responsive Slide Wrapper */}
              <div className="flex-1 w-full relative bg-white rounded-xl overflow-hidden shadow-2xl">
                <iframe 
                  src={slideEmbedUrl} 
                  className="absolute top-0 left-0 w-full h-full border-0"
                  allowFullScreen
                  title="Lesson Slides"
                />
              </div>

              {/* Player Navigation/Controls */}
              <div className="h-16 flex items-center justify-between px-2 flex-none">
                <button onClick={handleCamera} className="text-xs text-slate-400 hover:text-white flex items-center gap-2">
                  <Camera size={16} /> {isCameraOn ? 'Stop Camera' : 'Start Camera'}
                </button>
                
                <button 
                  onClick={() => setShowQuiz(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-transform active:scale-95"
                >
                  Take Quiz <Play size={16} fill="currentColor" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="bg-slate-900 border border-slate-800 p-10 rounded-3xl max-w-lg w-full text-center">
                <h2 className="text-2xl font-bold mb-4">Ready for the Quiz?</h2>
                <p className="text-slate-400 mb-8">Test your understanding of the cell structures we just covered.</p>
                <div className="flex flex-col gap-3">
                  <button className="bg-blue-600 py-3 rounded-xl font-bold">Start Now</button>
                  <button onClick={() => setShowQuiz(false)} className="text-slate-500 hover:text-white text-sm">Review Slides Again</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}