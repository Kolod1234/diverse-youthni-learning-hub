/**
 * useLessonPlayer
 *
 * Shared hook that consolidates ALL common lesson-player state and actions:
 *   - Fullscreen (CSS fallback for Android WebView + native API)
 *   - Per-slide notes (with export)
 *   - Bookmarks (persisted to user profile)
 *   - AI assistant (ask, summarise, define, translate)
 *   - Keyboard shortcuts
 *
 * Usage:
 *   const player = useLessonPlayer({ lessonId, containerRef, user });
 *   // then spread / destructure what you need from `player`
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function useLessonPlayer({
  lessonId,
  containerRef,   // ref to the DOM element that should go fullscreen
  user,
  onNext,         // optional: called when → / L pressed
  onPrev,         // optional: called when ← / H pressed
}) {
  // ── Fullscreen ────────────────────────────────────────────────────────────
  const [isFullscreen, setIsFullscreen] = useState(false);

  const lockLandscape = useCallback(async () => {
    if (!screen?.orientation?.lock) return;
    try {
      await screen.orientation.lock('landscape');
    } catch {
      // Silently fail - not all browsers/devices support orientation lock
    }
  }, []);

  const enterFullscreen = useCallback(async () => {
    setIsFullscreen(true);
    const el = containerRef?.current;
    if (!el) return;
    
    // Try native fullscreen
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
    if (req) {
      try {
        await req.call(el);
      } catch (err) {
        console.warn('Fullscreen request failed:', err);
      }
    }
    
    // Lock landscape after fullscreen is active
    await lockLandscape();
  }, [containerRef, lockLandscape]);

  const exitFullscreen = useCallback(() => {
    setIsFullscreen(false);
    const isNative = document.fullscreenElement || document.webkitFullscreenElement;
    if (isNative) {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      exit?.call(document).catch((err) => {
        console.warn('Exit fullscreen failed:', err);
      });
    }
    try {
      screen.orientation?.unlock?.();
    } catch (err) {
      console.warn('Unlock orientation failed:', err);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    isFullscreen ? exitFullscreen() : enterFullscreen();
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  // Sync CSS state if user exits native FS (e.g. via Esc in browser)
  useEffect(() => {
    const handler = () => {
      const native = !!(document.fullscreenElement || document.webkitFullscreenElement);
      if (!native && isFullscreen) setIsFullscreen(false);
    };
    document.addEventListener('fullscreenchange', handler);
    document.addEventListener('webkitfullscreenchange', handler);
    return () => {
      document.removeEventListener('fullscreenchange', handler);
      document.removeEventListener('webkitfullscreenchange', handler);
    };
  }, [isFullscreen]);

  // ── Notes ─────────────────────────────────────────────────────────────────
  const [notes, setNotes] = useState({});           // { slideKey: string }
  const [showNotes, setShowNotes] = useState(false);

  const saveNote = useCallback((key, text) => {
    setNotes(prev => {
      const next = { ...prev, [key]: text };
      return next;
    });
    toast.success('Note saved');
  }, []);

  const exportNotes = useCallback(() => {
    const text = Object.entries(notes)
      .sort(([a], [b]) => String(a).localeCompare(String(b), undefined, { numeric: true }))
      .map(([k, v]) => `Slide ${k}:\n${v}`)
      .join('\n\n---\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), {
      href: url,
      download: `lesson-notes-${new Date().toISOString().split('T')[0]}.txt`,
    });
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Notes exported');
  }, [notes]);

  // ── Bookmarks ─────────────────────────────────────────────────────────────
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);

  // Load from user profile on mount
  useEffect(() => {
    if (user?.lesson_bookmarks?.[lessonId]) {
      setBookmarks(user.lesson_bookmarks[lessonId]);
    }
  }, [user, lessonId]);

  const toggleBookmark = useCallback(async (key) => {
    setBookmarks(prev => {
      const next = prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key];
      // Persist async — fire-and-forget
      if (user) {
        const all = { ...(user?.lesson_bookmarks || {}), [lessonId]: next };
        base44.auth.updateMe({ lesson_bookmarks: all }).catch(() => {});
      }
      toast.success(prev.includes(key) ? 'Bookmark removed' : 'Bookmark added');
      return next;
    });
  }, [user, lessonId]);

  // ── AI Assistant ──────────────────────────────────────────────────────────
  const [showAI, setShowAI] = useState(false);
  const [aiTab, setAiTab] = useState('ask');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [aiTranslation, setAiTranslation] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('es');

  const askAI = useCallback(async (question, slideContext = '') => {
    if (!question.trim()) return;
    setAiLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a helpful tutor. Context: "${slideContext}". Student asks: "${question}". Give a clear, educational answer.`,
      });
      setAiResponse(res);
    } catch (_) {
      toast.error('AI request failed');
    } finally {
      setAiLoading(false);
    }
  }, []);

  const summariseSlide = useCallback(async (slideContext = '') => {
    setAiLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Summarise this lesson content concisely with key takeaways:\n\n${slideContext}`,
      });
      setAiSummary(res);
    } catch (_) {
      toast.error('Summary failed');
    } finally {
      setAiLoading(false);
    }
  }, []);

  const defineWord = useCallback(async (word) => {
    setAiLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Define "${word}" in simple, student-friendly language with an example.`,
        add_context_from_internet: true,
      });
      setAiResponse(res);
      setAiTab('ask');
    } catch (_) {
      toast.error('Definition failed');
    } finally {
      setAiLoading(false);
    }
  }, []);

  const translateSlide = useCallback(async (slideContext = '', language) => {
    const lang = language || targetLanguage;
    const names = { es:'Spanish', fr:'French', de:'German', zh:'Chinese', ar:'Arabic', ur:'Urdu', pl:'Polish' };
    setAiLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Translate the following educational content into ${names[lang] || lang}:\n\n${slideContext}`,
      });
      setAiTranslation(res);
    } catch (_) {
      toast.error('Translation failed');
    } finally {
      setAiLoading(false);
    }
  }, [targetLanguage]);

  // ── Keyboard Shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.shiftKey || e.ctrlKey || e.metaKey || e.target.isContentEditable || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      switch (e.key) {
        case 'ArrowRight': case 'l': case 'L': onNext?.(); break;
        case 'ArrowLeft':  case 'h': case 'H': onPrev?.(); break;
        case 'f': case 'F': toggleFullscreen(); break;
        case 'n': case 'N': setShowNotes(v => !v); break;
        case 'a': case 'A': setShowAI(v => !v); break;
        case 'b': case 'B': break; // caller must supply current key to toggleBookmark
        case 'Escape':
          if (isFullscreen) toggleFullscreen();
          else if (showNotes) setShowNotes(false);
          else if (showAI)   setShowAI(false);
          break;
        default: break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isFullscreen, showNotes, showAI, toggleFullscreen, exitFullscreen, onNext, onPrev]);

  return {
    // Fullscreen
    isFullscreen, toggleFullscreen, enterFullscreen, exitFullscreen,

    // Notes
    notes, showNotes, setShowNotes, saveNote, exportNotes,

    // Bookmarks
    bookmarks, showBookmarks, setShowBookmarks, toggleBookmark,

    // AI
    showAI, setShowAI,
    aiTab, setAiTab,
    aiLoading,
    aiResponse, setAiResponse,
    aiSummary,  setAiSummary,
    aiTranslation, setAiTranslation,
    targetLanguage, setTargetLanguage,
    askAI, summariseSlide, defineWord, translateSlide,
  };
}