import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, AlertCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function WebcamSession() {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [quality, setQuality] = useState('hd');
  const streamRef = useRef(null);

  const qualitySettings = {
    sd: { width: { ideal: 640 }, height: { ideal: 480 }, label: 'SD (480p)' },
    hd: { width: { ideal: 1280 }, height: { ideal: 720 }, label: 'HD (720p)' },
    fhd: { width: { ideal: 1920 }, height: { ideal: 1080 }, label: 'Full HD (1080p)' }
  };

  const startCamera = async () => {
    setError(null);
    try {
      const constraints = {
        video: {
          ...qualitySettings[quality],
          frameRate: { ideal: 30 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.autoplay = true;
        videoRef.current.playsInline = true;
        
        // Wait for video to be ready and play
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
        
        setIsCameraOn(true);
        
        // Log actual resolution
        const videoTrack = stream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();
        console.log('Camera started:', settings);
      }
    } catch (err) {
      console.error("Webcam Error:", err);
      setError(`Could not access camera: ${err.message}\n\nPlease:\n1. Allow camera access\n2. Close other apps using camera\n3. Try refreshing`);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  const changeQuality = async (newQuality) => {
    const wasOn = isCameraOn;
    if (wasOn) {
      stopCamera();
    }
    setQuality(newQuality);
    if (wasOn) {
      // Wait a bit before restarting
      setTimeout(() => startCamera(), 100);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="flex flex-col items-center bg-gray-900 p-4 rounded-xl">
      <div className="relative aspect-video w-full max-w-2xl bg-black rounded-lg overflow-hidden shadow-2xl">
        {!isCameraOn && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <Camera className="w-12 h-12 mb-2" />
            <p>Camera is off</p>
            <p className="text-sm mt-1 text-gray-500">Quality: {qualitySettings[quality].label}</p>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 p-4 text-center">
            <AlertCircle className="w-12 h-12 mb-2" />
            <p className="text-sm whitespace-pre-line">{error}</p>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ transform: 'scaleX(-1)' }}
          className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : 'block'}`}
        />
      </div>

      <div className="flex gap-4 mt-4">
        <Button
          onClick={isCameraOn ? stopCamera : startCamera}
          className={`flex items-center gap-2 ${
            isCameraOn 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-[#FF8C00] hover:bg-[#CC7000]'
          }`}
        >
          {isCameraOn ? <CameraOff size={18} /> : <Camera size={18} />}
          {isCameraOn ? 'Stop Camera' : 'Start Camera'}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Settings size={18} />
              Quality: {qualitySettings[quality].label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {Object.entries(qualitySettings).map(([key, value]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => changeQuality(key)}
                className={quality === key ? 'bg-gray-100' : ''}
              >
                {value.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}