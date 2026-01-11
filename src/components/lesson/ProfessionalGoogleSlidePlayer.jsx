import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Maximize, Minimize, RotateCcw } from 'lucide-react';

export default function ProfessionalGoogleSlidePlayer({ googleSlidesUrl }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight') setCurrentSlide(prev => prev + 1);
      if (e.key === 'ArrowLeft') setCurrentSlide(prev => Math.max(1, prev - 1));
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
      if (e.key === 'Escape' && isFullscreen) exitFullscreen();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    const elem = document.getElementById('slide-container');
    if (!document.fullscreenElement) {
      elem?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleReload = () => {
    setIframeKey(prev => prev + 1);
  };

  if (!googleSlidesUrl) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No Google Slides presentation available</p>
      </div>
    );
  }

  const presentationId = googleSlidesUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
  if (!presentationId) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <p className="text-red-500">Invalid Google Slides URL</p>
      </div>
    );
  }

  const embedUrl = `https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false&delayms=3000&slide=${currentSlide}`;

  return (
    <div className="w-full h-full">
      <style dangerouslySetInnerHTML={{ __html: `
        #slide-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #000;
        }

        #slide-container.fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
        }

        .slide-wrapper {
          flex: 1;
          position: relative;
          width: 100%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1a1a1a;
        }

        .slide-iframe {
          width: 100%;
          height: 100%;
          border: none;
          max-width: 100%;
          max-height: 100%;
        }

        @media (orientation: portrait) and (max-width: 768px) {
          .slide-iframe {
            height: 60vh;
          }
        }

        @media (orientation: landscape) {
          .slide-iframe {
            height: 100%;
          }
        }

        @media (min-width: 1024px) {
          .slide-wrapper {
            padding: 2rem;
          }
          
          .slide-iframe {
            max-width: 90%;
            max-height: 90%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            border-radius: 8px;
          }
        }

        .controls-bar {
          background: rgba(0,0,0,0.9);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(255,255,255,0.1);
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        @media (max-width: 640px) {
          .controls-bar {
            padding: 0.5rem;
            gap: 0.5rem;
          }
        }

        .control-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1rem;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 6px;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
        }

        .control-btn:hover {
          background: rgba(255,255,255,0.2);
          border-color: rgba(255,255,255,0.3);
        }

        .control-btn:active {
          transform: scale(0.95);
        }

        @media (max-width: 640px) {
          .control-btn {
            padding: 0.4rem 0.6rem;
            font-size: 0.75rem;
          }
          
          .control-btn svg {
            width: 16px;
            height: 16px;
          }
        }

        .slide-counter {
          color: rgba(255,255,255,0.8);
          font-size: 0.875rem;
          font-weight: 500;
          padding: 0.5rem 1rem;
          background: rgba(255,255,255,0.05);
          border-radius: 6px;
        }

        @media (max-width: 640px) {
          .slide-counter {
            padding: 0.4rem 0.6rem;
            font-size: 0.75rem;
          }
        }
      `}} />

      <div id="slide-container" className={isFullscreen ? 'fullscreen' : ''}>
        <div className="slide-wrapper">
          <iframe 
            key={iframeKey}
            src={embedUrl}
            className="slide-iframe"
            allowFullScreen={true}
            allow="fullscreen"
          />
        </div>

        <div className="controls-bar">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentSlide(prev => Math.max(1, prev - 1))}
              className="control-btn"
              disabled={currentSlide === 1}
              style={{ opacity: currentSlide === 1 ? 0.5 : 1 }}
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline ml-1">Previous</span>
            </button>

            <button 
              onClick={() => setCurrentSlide(prev => prev + 1)}
              className="control-btn"
            >
              <span className="hidden sm:inline mr-1">Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="slide-counter">
            Slide {currentSlide}
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleReload}
              className="control-btn"
              title="Reload slide"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button 
              onClick={toggleFullscreen}
              className="control-btn"
              title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              <span className="hidden sm:inline ml-1">
                {isFullscreen ? 'Exit' : 'Fullscreen'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}