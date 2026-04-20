import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, X, StickyNote, Maximize, Minimize,
  Keyboard, Clock, Grid3x3
} from 'lucide-react';

const TRANSITIONS = {
  slide: {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir < 0 ? 300 : -300, opacity: 0 }),
    transition: { x: { type: 'spring', stiffness: 280, damping: 30 }, opacity: { duration: 0.2 } }
  },
  fade: {
    enter: { opacity: 0, scale: 0.98 },
    center: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.02 },
    transition: { duration: 0.35, ease: 'easeInOut' }
  },
  zoom: {
    enter: { opacity: 0, scale: 0.85 },
    center: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.15 },
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

function formatClock(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatElapsed(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * FullscreenPresenter
 *
 * A focused, distraction-free presenter for delivering a slide deck.
 *
 * Props:
 *   slides: Array<{ title?: string, content?: string (HTML), speaker_notes?: string, image_url?: string }>
 *   onClose: () => void
 *   transition: 'slide' | 'fade' | 'zoom'  (default: 'fade')
 *   initialSlide: number  (default: 0)
 *   showNotesByDefault: boolean  (default: false)
 *
 * Keyboard controls:
 *   → / Space / PageDown / J  — next slide
 *   ← / PageUp / K            — previous slide
 *   Home                      — first slide
 *   End                       — last slide
 *   N                         — toggle presenter notes
 *   F                         — toggle browser fullscreen
 *   G                         — toggle slide overview
 *   ?                         — toggle shortcuts help
 *   Esc                       — exit
 */
export default function FullscreenPresenter({
  slides = [],
  onClose,
  transition = 'fade',
  initialSlide = 0,
  showNotesByDefault = false,
}) {
  const [index, setIndex] = useState(Math.min(Math.max(initialSlide, 0), Math.max(0, slides.length - 1)));
  const [direction, setDirection] = useState(0);
  const [showNotes, setShowNotes] = useState(showNotesByDefault);
  const [showHelp, setShowHelp] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [clock, setClock] = useState(new Date());
  const [elapsed, setElapsed] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideControlsTimer = useRef(null);
  const containerRef = useRef(null);

  const total = slides.length;
  const current = slides[index];
  const variants = TRANSITIONS[transition] || TRANSITIONS.fade;

  const go = useCallback((target) => {
    if (total === 0) return;
    const next = Math.min(Math.max(target, 0), total - 1);
    if (next === index) return;
    setDirection(next > index ? 1 : -1);
    setIndex(next);
  }, [index, total]);

  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  // Keyboard controls
  useEffect(() => {
    const handler = (e) => {
      // Ignore keys while typing in inputs/textareas
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return;

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'PageDown':
        case 'j':
        case 'J':
          e.preventDefault();
          next();
          break;
        case 'ArrowLeft':
        case 'PageUp':
        case 'k':
        case 'K':
          e.preventDefault();
          prev();
          break;
        case 'Home':
          e.preventDefault();
          go(0);
          break;
        case 'End':
          e.preventDefault();
          go(total - 1);
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          setShowNotes(v => !v);
          break;
        case 'g':
        case 'G':
          e.preventDefault();
          setShowOverview(v => !v);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleBrowserFullscreen();
          break;
        case '?':
          e.preventDefault();
          setShowHelp(v => !v);
          break;
        case 'Escape':
          if (showOverview) setShowOverview(false);
          else if (showHelp) setShowHelp(false);
          else onClose?.();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev, go, total, onClose, showOverview, showHelp]);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Elapsed timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Sync fullscreen state
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Auto-hide the top/bottom chrome after 2.5s of mouse inactivity
  const bumpControls = useCallback(() => {
    setControlsVisible(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => setControlsVisible(false), 2500);
  }, []);

  useEffect(() => {
    bumpControls();
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, [bumpControls, index]);

  const toggleBrowserFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen?.();
      } else {
        await document.exitFullscreen?.();
      }
    } catch {
      // Silently ignore — some browsers block without user gesture
    }
  };

  const progress = total > 0 ? ((index + 1) / total) * 100 : 0;

  const notesText = useMemo(() => current?.speaker_notes || '', [current]);

  if (total === 0) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-lg font-semibold mb-4">No slides to present</p>
          <button onClick={onClose} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black text-white select-none"
      onMouseMove={bumpControls}
    >
      {/* Top bar */}
      <div
        className={`absolute top-0 left-0 right-0 z-20 transition-opacity duration-300 ${controlsVisible || showHelp ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-semibold">{index + 1} / {total}</span>
            <span className="flex items-center gap-1.5 text-white/70">
              <Clock className="w-3.5 h-3.5" />
              {formatClock(clock)}
            </span>
            <span className="text-white/60 font-mono">Elapsed {formatElapsed(elapsed)}</span>
          </div>
          <div className="flex items-center gap-1">
            <IconButton onClick={() => setShowOverview(true)} title="Slide overview (G)">
              <Grid3x3 className="w-4 h-4" />
            </IconButton>
            <IconButton
              onClick={() => setShowNotes(v => !v)}
              title="Presenter notes (N)"
              active={showNotes}
            >
              <StickyNote className="w-4 h-4" />
            </IconButton>
            <IconButton onClick={() => setShowHelp(v => !v)} title="Keyboard shortcuts (?)" active={showHelp}>
              <Keyboard className="w-4 h-4" />
            </IconButton>
            <IconButton onClick={toggleBrowserFullscreen} title="Fullscreen (F)">
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </IconButton>
            <IconButton onClick={onClose} title="Exit (Esc)">
              <X className="w-4 h-4" />
            </IconButton>
          </div>
        </div>
      </div>

      {/* Slide stage */}
      <div className="absolute inset-0 flex items-center justify-center p-8 md:p-12">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={variants.transition}
            className="w-full h-full max-w-[1400px] max-h-full"
          >
            <SlideCanvas slide={current} slideNumber={index + 1} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav arrows */}
      <button
        onClick={prev}
        disabled={index === 0}
        className={`absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center transition-all ${
          index === 0 ? 'opacity-0 pointer-events-none' : controlsVisible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={next}
        disabled={index === total - 1}
        className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center transition-all ${
          index === total - 1 ? 'opacity-0 pointer-events-none' : controlsVisible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <motion.div
          className="h-full bg-white"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Presenter notes panel */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="absolute bottom-1 left-0 right-0 max-h-[45%] bg-slate-900/95 backdrop-blur-md border-t border-white/10 flex flex-col z-10"
          >
            <div className="px-5 py-2.5 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <StickyNote className="w-4 h-4 text-amber-400" />
                Presenter notes
                <span className="text-white/40 font-normal">— Slide {index + 1}</span>
              </div>
              <button
                onClick={() => setShowNotes(false)}
                className="text-white/60 hover:text-white text-sm"
              >
                Hide
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {notesText ? (
                <p className="text-[15px] leading-relaxed text-white/90 whitespace-pre-wrap">{notesText}</p>
              ) : (
                <p className="text-sm text-white/50 italic">
                  No notes for this slide. Add <code className="px-1.5 py-0.5 rounded bg-white/10">speaker_notes</code> to a slide to see them here.
                </p>
              )}
              {index < total - 1 && (
                <div className="mt-6 pt-4 border-t border-white/10">
                  <p className="text-xs uppercase tracking-wider text-white/40 font-semibold mb-1">Up next</p>
                  <p className="text-sm text-white/80">{slides[index + 1]?.title || `Slide ${index + 2}`}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide overview */}
      <AnimatePresence>
        {showOverview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 bg-black/95 overflow-y-auto"
            onClick={() => setShowOverview(false)}
          >
            <div className="max-w-7xl mx-auto p-8" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">All slides ({total})</h2>
                <button onClick={() => setShowOverview(false)} className="text-white/70 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {slides.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { go(i); setShowOverview(false); }}
                    className={`text-left rounded-lg overflow-hidden border-2 transition-all ${
                      i === index ? 'border-white ring-2 ring-white/30' : 'border-white/10 hover:border-white/40'
                    }`}
                  >
                    <div className="aspect-video bg-white text-slate-900 p-3 overflow-hidden">
                      <p className="text-[11px] font-bold text-slate-500 mb-1">Slide {i + 1}</p>
                      <p className="text-sm font-semibold line-clamp-2 mb-1">{s.title || 'Untitled'}</p>
                      <div
                        className="text-[10px] text-slate-600 line-clamp-4 prose prose-xs max-w-none"
                        dangerouslySetInnerHTML={{ __html: s.content || '' }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard shortcuts help */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-6 left-6 z-20 bg-slate-900/95 backdrop-blur border border-white/10 rounded-xl p-4 text-xs space-y-1.5 shadow-2xl"
          >
            <p className="text-white/50 font-semibold uppercase tracking-wider mb-2">Keyboard shortcuts</p>
            <Shortcut keys="→ Space PgDn" label="Next slide" />
            <Shortcut keys="← PgUp" label="Previous slide" />
            <Shortcut keys="Home / End" label="First / last slide" />
            <Shortcut keys="N" label="Toggle notes" />
            <Shortcut keys="G" label="Slide overview" />
            <Shortcut keys="F" label="Fullscreen" />
            <Shortcut keys="?" label="Toggle this help" />
            <Shortcut keys="Esc" label="Exit" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function IconButton({ children, onClick, title, active }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
        active ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  );
}

function Shortcut({ keys, label }) {
  return (
    <div className="flex items-center gap-3">
      <kbd className="font-mono text-white/90 min-w-[110px]">{keys}</kbd>
      <span className="text-white/70">{label}</span>
    </div>
  );
}

function SlideCanvas({ slide, slideNumber }) {
  if (!slide) return null;
  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
      <style>{`
        .presenter-slide-content img { max-width: 100%; height: auto; border-radius: 8px; }
        .presenter-slide-content h1, .presenter-slide-content h2, .presenter-slide-content h3 { color: #0f172a; }
        .presenter-slide-content p { line-height: 1.7; }
        .presenter-slide-content ul, .presenter-slide-content ol { line-height: 1.7; }
        .presenter-slide-content iframe { max-width: 100%; border-radius: 8px; }
      `}</style>
      <div className="flex-1 overflow-auto p-10 md:p-14">
        {slide.title && (
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 md:mb-8">{slide.title}</h1>
        )}
        {slide.image_url && (
          <img
            src={slide.image_url}
            alt={slide.title || `Slide ${slideNumber}`}
            className="max-w-full max-h-[55vh] mx-auto mb-6 rounded-xl object-contain"
          />
        )}
        {slide.content && (
          <div
            className="presenter-slide-content prose prose-lg md:prose-xl max-w-none text-slate-800"
            dangerouslySetInnerHTML={{ __html: slide.content }}
          />
        )}
        {!slide.title && !slide.content && !slide.image_url && (
          <p className="text-slate-400 italic">Slide {slideNumber}</p>
        )}
      </div>
    </div>
  );
}