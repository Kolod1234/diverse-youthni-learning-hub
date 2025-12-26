import React, { useState, useEffect, useRef } from 'react';
import { Users, Camera, Maximize, Minimize, X, Play } from 'lucide-react';

export default function LessonPlayer({ children, onlineUsers = [] }) {
  // 1. ALL HOOKS AT THE TOP (Prevents the "more hooks than previous render" error)
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  // Sync fullscreen state with browser events
  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // 2. LOGIC FUNCTIONS
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsCameraOn(true);
    } catch (err) {
      alert("Camera access denied. Please check permissions.");
    }
  };

  // 3. RENDER LOGIC
  return (
    <div ref={playerRef} className="fixed inset-0 flex flex-col bg-slate-950 text-white overflow-hidden">
      
      {/* HEADER: Responsive with Live/Join Buttons */}
      <header className="h-14 flex items-center justify-between px-4 bg-slate-900 border-b border-slate-800 flex-none">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="bg-red-600 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">LIVE</span>
          <h1 className="text-sm font-medium truncate">Cell Structure and Function</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="hidden sm:flex bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs">Present</button>
          <button className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-xs">Join</button>
          <button onClick={toggleFullScreen} className="p-1.5 hover:bg-white/10 rounded">
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </header>

      {/* MAIN WORKSPACE: Sidebar + Content Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT PANEL: Users (Hidden on very small mobile screens if desired) */}
        <aside className="hidden md:flex w-64 bg-slate-900/50 border-r border-slate-800 flex-col flex-none">
          <div className="p-4 border-b border-slate-800 flex items-center gap-2">
            <Users size={16} className="text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Online Users</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {onlineUsers.map((u, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                <div className="w-2 h-2 rounded-full bg-green-500" /> {u.name}
              </div>
            ))}
          </div>
          {/* Webcam Preview in Sidebar */}
          {isCameraOn && (
            <div className="p-2 border-t border-slate-800">
              <video ref={videoRef} autoPlay playsInline muted className="rounded-lg bg-black aspect-video w-full object-cover" />
            </div>
          )}
        </aside>

        {/* CONTENT AREA: No Horizontal Overflow */}
        <main className="flex-1 relative flex flex-col bg-black overflow-hidden justify-center items-center p-4">
          {!showQuiz ? (
            <div className="w-full h-full max-w-full max-h-full flex flex-col items-center">
              {/* Slide Container: Use iFrame or children here */}
              <div className="flex-1 w-full bg-white rounded-xl shadow-2xl overflow-hidden relative">
                <div className="p-8 text-slate-900 h-full overflow-y-auto">
                   {children} 
                </div>
              </div>
              
              {/* Footer Controls */}
              <div className="w-full mt-4 flex justify-between items-center px-2">
                <button onClick={startCamera} className="text-xs flex items-center gap-2 text-slate-400 hover:text-white">
                  <Camera size={16} /> {isCameraOn ? 'Stop Camera' : 'Start Camera'}
                </button>
                <button 
                  onClick={() => setShowQuiz(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"
                >
                  Take Quiz <Play size={16} fill="currentColor" />
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-md w-full bg-slate-900 p-8 rounded-2xl border border-slate-800">
              <h2 className="text-xl font-bold mb-4">Lesson Quiz</h2>
              <p className="text-slate-400 mb-6">Test your knowledge of Cell Structures.</p>
              <button onClick={() => setShowQuiz(false)} className="text-blue-400 text-sm">Back to Slides</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}