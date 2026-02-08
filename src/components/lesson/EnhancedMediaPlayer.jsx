import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, 
  SkipForward, SkipBack, Loader2, Settings, ChevronRight, Gauge
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function EnhancedMediaPlayer({ 
  type = 'video', // 'video', 'google-slides', 'iframe'
  src, 
  className = '',
  chapters = [], // [{time: 0, title: "Intro"}, {time: 60, title: "Main"}]
  subtitles = null, // URL to .vtt file
  slides = [], // For slide thumbnails [{url: "", title: ""}]
  onSlideChange = null // Callback for slide navigation
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSubtitles, setShowSubtitles] = useState(false);
  
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || type !== 'video') return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
      // Update active chapter
      if (chapters.length > 0) {
        const activeChapter = chapters.reduce((prev, curr) => 
          curr.time <= video.currentTime ? curr : prev
        );
      }
    };
    const updateDuration = () => {
      setDuration(video.duration);
      setLoading(false);
    };
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [type, chapters]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch(e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(10);
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case '1':
          e.preventDefault();
          changePlaybackRate(0.5);
          break;
        case '2':
          e.preventDefault();
          changePlaybackRate(1);
          break;
        case '3':
          e.preventDefault();
          changePlaybackRate(1.5);
          break;
        case '4':
          e.preventDefault();
          changePlaybackRate(2);
          break;
        case 'c':
          e.preventDefault();
          setShowSubtitles(!showSubtitles);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, showSubtitles]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const skip = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
    }
  };

  const changePlaybackRate = (rate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const jumpToChapter = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleSlideClick = (index) => {
    setCurrentSlide(index);
    if (onSlideChange) {
      onSlideChange(index);
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
        
        // Lock to landscape on mobile for all media types
        if (window.screen?.orientation?.lock) {
          try {
            await window.screen.orientation.lock('landscape');
          } catch (err) {
            console.log('Orientation lock not supported:', err);
          }
        }
        
        // Enable zooming in fullscreen
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('data-original-content', viewport.getAttribute('content'));
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
        }
      } catch (err) {
        console.error('Fullscreen error:', err);
      }
    } else {
      // Restore viewport settings
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport && viewport.getAttribute('data-original-content')) {
        viewport.setAttribute('content', viewport.getAttribute('data-original-content'));
        viewport.removeAttribute('data-original-content');
      }
      
      // Unlock orientation when exiting fullscreen
      if (window.screen?.orientation?.unlock) {
        try {
          window.screen.orientation.unlock();
        } catch (err) {
          console.log('Orientation unlock error:', err);
        }
      }
      document.exitFullscreen();
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (type === 'google-slides' || type === 'iframe') {
    return (
      <div className={`relative ${className}`}>
        <div className="flex gap-4">
          {/* Thumbnail Navigation */}
          {slides.length > 0 && !isFullscreen && (
            <div className="hidden lg:block w-48 flex-shrink-0">
              <ScrollArea className="h-[500px] bg-gray-100 rounded-lg p-2">
                <div className="space-y-2">
                  {slides.map((slide, index) => (
                    <button
                      key={index}
                      onClick={() => handleSlideClick(index)}
                      className={`w-full aspect-video rounded border-2 transition-all overflow-hidden ${
                        currentSlide === index 
                          ? 'border-blue-600 ring-2 ring-blue-200' 
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {slide.thumbnail ? (
                        <img src={slide.thumbnail} alt={slide.title || `Slide ${index + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-400">{index + 1}</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Main Slide Display */}
          <div 
            ref={containerRef} 
            className={`flex-1 relative bg-black rounded-lg sm:rounded-2xl overflow-hidden ${isFullscreen ? 'w-screen h-screen' : ''}`}
          >
            <div 
              className="relative w-full" 
              style={isFullscreen ? { height: '100vh' } : { paddingTop: '56.25%' }}
            >
              <iframe 
                src={src}
                className="absolute top-0 left-0 w-full h-full"
                allowFullScreen
                allow="fullscreen"
                title="Media Content"
                onLoad={() => setLoading(false)}
              />
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>
            
            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-10 flex gap-2">
              {slides.length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowThumbnails(!showThumbnails)}
                  className="bg-white/90 hover:bg-white shadow-lg h-8 sm:h-9 px-3 lg:hidden"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={toggleFullscreen}
                className="bg-white/90 hover:bg-white shadow-lg h-8 w-8 sm:h-9 sm:w-9 p-0"
              >
                {isFullscreen ? <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />}
              </Button>
            </div>

            {/* Mobile Thumbnail Sheet */}
            {showThumbnails && slides.length > 0 && (
              <div className="lg:hidden absolute inset-y-0 right-0 w-32 bg-black/95 backdrop-blur-sm p-2 overflow-y-auto">
                <div className="space-y-2">
                  {slides.map((slide, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        handleSlideClick(index);
                        setShowThumbnails(false);
                      }}
                      className={`w-full aspect-video rounded border transition-all ${
                        currentSlide === index ? 'border-blue-400 ring-1 ring-blue-300' : 'border-white/30'
                      }`}
                    >
                      {slide.thumbnail ? (
                        <img src={slide.thumbnail} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                          <span className="text-xs text-white">{index + 1}</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative bg-black rounded-lg sm:rounded-2xl overflow-hidden group ${className}`}>
      <video
        ref={videoRef}
        src={src}
        className="w-full h-auto max-h-[60vh] sm:max-h-none"
        onClick={togglePlay}
        onLoadStart={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        playsInline
        controls={false}
        crossOrigin="anonymous"
      >
        {subtitles && showSubtitles && (
          <track
            kind="subtitles"
            src={subtitles}
            srcLang="en"
            label="English"
            default
          />
        )}
      </video>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}

      {/* Custom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2 sm:p-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        {/* Progress Bar */}
        <div className="mb-2 sm:mb-3">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          />
          <div className="flex justify-between text-xs text-white mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 p-0"
            >
              {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => skip(-10)}
              className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 p-0 hidden xs:inline-flex"
            >
              <SkipBack className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => skip(10)}
              className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 p-0 hidden xs:inline-flex"
            >
              <SkipForward className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>

            <div className="flex items-center gap-1 sm:gap-2 ml-1 sm:ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 p-0"
              >
                {isMuted ? <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" /> : <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />}
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-12 sm:w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white hidden sm:inline-block"
              />
            </div>

            {/* Playback Speed */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 h-8 sm:h-9 px-2 hidden sm:inline-flex"
                >
                  <Gauge className="w-4 h-4 mr-1" />
                  <span className="text-xs">{playbackRate}x</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                  <DropdownMenuItem 
                    key={rate}
                    onClick={() => changePlaybackRate(rate)}
                    className={playbackRate === rate ? 'bg-blue-50' : ''}
                  >
                    {rate}x {rate === 1 && '(Normal)'}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Subtitles */}
            {subtitles && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSubtitles(!showSubtitles)}
                className={`text-white hover:bg-white/20 h-8 sm:h-9 px-2 hidden sm:inline-flex ${showSubtitles ? 'bg-white/20' : ''}`}
              >
                <span className="text-xs font-bold">CC</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Chapters Menu */}
            {chapters.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 p-0"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">Chapters</div>
                  {chapters.map((chapter, index) => (
                    <DropdownMenuItem 
                      key={index}
                      onClick={() => jumpToChapter(chapter.time)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm">{chapter.title}</span>
                        <span className="text-xs text-gray-500">{formatTime(chapter.time)}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 p-0"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Play/Pause Overlay */}
      {!isPlaying && !loading && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
          onClick={togglePlay}
        >
          <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl hover:bg-white transition-colors">
            <Play className="w-10 h-10 text-gray-900 ml-1" />
          </div>
        </div>
      )}

      {/* Chapter Markers on Progress Bar */}
      {chapters.length > 0 && (
        <div className="absolute bottom-14 left-2 right-2 sm:bottom-16 sm:left-4 sm:right-4 h-1 pointer-events-none">
          {chapters.map((chapter, index) => (
            <div
              key={index}
              className="absolute w-0.5 h-2 bg-yellow-400 rounded-full"
              style={{ left: `${(chapter.time / duration) * 100}%` }}
              title={chapter.title}
            />
          ))}
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="absolute top-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block">
        Space: Play/Pause • ←→: Skip • M: Mute • F: Fullscreen • 1-4: Speed • C: Subtitles
      </div>
    </div>
  );
}