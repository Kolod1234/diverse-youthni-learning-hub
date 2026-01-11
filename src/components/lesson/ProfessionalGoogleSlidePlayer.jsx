import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, Maximize, Minimize, RotateCcw, StickyNote, Sparkles, Keyboard, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ProfessionalGoogleSlidePlayer({ googleSlidesUrl, lessonId }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [notes, setNotes] = useState({});
  const [currentNote, setCurrentNote] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    setCurrentNote(notes[currentSlide] || '');
  }, [currentSlide, notes]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      
      if (e.key === 'ArrowRight' || e.key === 'l' || e.key === 'L') setCurrentSlide(prev => prev + 1);
      if (e.key === 'ArrowLeft' || e.key === 'h' || e.key === 'H') setCurrentSlide(prev => Math.max(1, prev - 1));
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
      if (e.key === 'n' || e.key === 'N') setShowNotes(true);
      if (e.key === 'a' || e.key === 'A') setShowAI(true);
      if (e.key === '?' || e.key === '/') setShowKeyboardHelp(true);
      if (e.key === 'Escape') {
        if (isFullscreen) exitFullscreen();
        else if (showNotes) setShowNotes(false);
        else if (showAI) setShowAI(false);
        else if (showKeyboardHelp) setShowKeyboardHelp(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen, showNotes, showAI, showKeyboardHelp]);

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
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  };

  const handleSaveNote = () => {
    setNotes(prev => ({ ...prev, [currentSlide]: currentNote }));
    toast.success('Note saved for this slide');
  };

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;
    
    setAiLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are helping a student understand slide ${currentSlide} of their lesson. The student asks: "${aiQuestion}". Provide a clear, educational response that helps them learn.`,
        add_context_from_internet: false
      });
      setAiResponse(response);
      setAiQuestion('');
    } catch (error) {
      toast.error('Failed to get AI response');
    } finally {
      setAiLoading(false);
    }
  };

  // Touch gesture handling
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) setCurrentSlide(prev => prev + 1);
    if (isRightSwipe) setCurrentSlide(prev => Math.max(1, prev - 1));
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
          transition: opacity 0.3s;
        }

        .slide-iframe.loading {
          opacity: 0.5;
        }

        .loading-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
        }

        @media (orientation: portrait) and (max-width: 768px) {
          .slide-wrapper {
            min-height: 50vh;
          }
          .slide-iframe {
            height: 100%;
            min-height: 50vh;
          }
        }

        @media (orientation: landscape) and (max-width: 768px) {
          .slide-iframe {
            height: 100%;
          }
        }

        @media (min-width: 768px) and (max-width: 1024px) {
          .slide-wrapper {
            padding: 1rem;
          }
          .slide-iframe {
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
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
          background: rgba(0,0,0,0.95);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(255,255,255,0.1);
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
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
          white-space: nowrap;
        }

        .control-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.2);
          border-color: rgba(255,255,255,0.3);
          transform: translateY(-1px);
        }

        .control-btn:active:not(:disabled) {
          transform: scale(0.95);
        }

        .control-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
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
          color: rgba(255,255,255,0.9);
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          background: rgba(255,255,255,0.08);
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 640px) {
          .slide-counter {
            padding: 0.4rem 0.6rem;
            font-size: 0.75rem;
          }
        }
      `}} />

      <div 
        id="slide-container" 
        className={isFullscreen ? 'fullscreen' : ''}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="slide-wrapper">
          {isLoading && (
            <div className="loading-overlay">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
            </div>
          )}
          <iframe 
            ref={iframeRef}
            key={iframeKey}
            src={embedUrl}
            className={`slide-iframe ${isLoading ? 'loading' : ''}`}
            allowFullScreen={true}
            allow="fullscreen"
            onLoad={() => setIsLoading(false)}
            aria-label={`Slide ${currentSlide}`}
          />
        </div>

        <div className="controls-bar">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentSlide(prev => Math.max(1, prev - 1))}
              className="control-btn"
              disabled={currentSlide === 1}
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline ml-1">Previous</span>
            </button>

            <button 
              onClick={() => setCurrentSlide(prev => prev + 1)}
              className="control-btn"
              aria-label="Next slide"
            >
              <span className="hidden sm:inline mr-1">Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="slide-counter" role="status" aria-live="polite">
            Slide {currentSlide}
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowNotes(true)}
              className="control-btn"
              title="Notes (N)"
              aria-label="Open notes"
            >
              <StickyNote className="w-5 h-5" />
            </button>

            <button 
              onClick={() => setShowAI(true)}
              className="control-btn"
              title="AI Assistant (A)"
              aria-label="Open AI assistant"
            >
              <Sparkles className="w-5 h-5" />
            </button>

            <button 
              onClick={handleReload}
              className="control-btn"
              title="Reload slide (R)"
              aria-label="Reload slide"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button 
              onClick={() => setShowKeyboardHelp(true)}
              className="control-btn hidden md:flex"
              title="Keyboard shortcuts (?)"
              aria-label="Show keyboard shortcuts"
            >
              <Keyboard className="w-5 h-5" />
            </button>

            <button 
              onClick={toggleFullscreen}
              className="control-btn"
              title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen (F)'}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              <span className="hidden lg:inline ml-1">
                {isFullscreen ? 'Exit' : 'Full'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Notes Dialog */}
      <Dialog open={showNotes} onOpenChange={setShowNotes}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="w-5 h-5 text-blue-500" />
              Notes for Slide {currentSlide}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder="Add your notes for this slide..."
              className="min-h-[150px]"
              aria-label="Slide notes"
            />
            <Button onClick={handleSaveNote} className="w-full">
              Save Note
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Assistant Dialog */}
      <Dialog open={showAI} onOpenChange={setShowAI}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              AI Assistant - Slide {currentSlide}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Textarea
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Ask a question about this slide..."
                className="flex-1"
                aria-label="AI question"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAskAI();
                  }
                }}
              />
            </div>
            <Button 
              onClick={handleAskAI} 
              disabled={aiLoading || !aiQuestion.trim()}
              className="w-full"
            >
              {aiLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Thinking...
                </>
              ) : (
                'Ask AI'
              )}
            </Button>
            {aiResponse && (
              <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{aiResponse}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Keyboard Shortcuts Help */}
      <Dialog open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-blue-500" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {[
              { keys: ['←', 'H'], action: 'Previous slide' },
              { keys: ['→', 'L'], action: 'Next slide' },
              { keys: ['F'], action: 'Toggle fullscreen' },
              { keys: ['N'], action: 'Open notes' },
              { keys: ['A'], action: 'AI assistant' },
              { keys: ['?', '/'], action: 'Show shortcuts' },
              { keys: ['Esc'], action: 'Close/Exit' }
            ].map((shortcut, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex gap-2">
                  {shortcut.keys.map((key, i) => (
                    <kbd key={i} className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
                      {key}
                    </kbd>
                  ))}
                </div>
                <span className="text-sm text-gray-600">{shortcut.action}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}