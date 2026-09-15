import React, { useEffect, useState } from 'react';
import { Minus, Plus, RotateCcw, X } from 'lucide-react';

export default function LessonImageZoom({ image, onClose }) {
  const [scale, setScale] = useState(1.25);

  useEffect(() => {
    if (!image) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [image, onClose]);

  if (!image) return null;
  const changeScale = (amount) => setScale(value => Math.min(3, Math.max(0.75, value + amount)));

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-slate-950/95" role="dialog" aria-modal="true" aria-label={`Enlarged diagram: ${image.alt}`}>
      <div className="flex min-h-16 items-center justify-between gap-3 border-b border-white/15 px-3 text-white sm:px-5">
        <p className="min-w-0 truncate text-sm font-medium">{image.alt || 'Lesson diagram'}</p>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={() => changeScale(-0.25)} className="inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-white/10" aria-label="Zoom out"><Minus className="h-5 w-5" /></button>
          <span className="w-14 text-center text-xs" aria-live="polite">{Math.round(scale * 100)}%</span>
          <button type="button" onClick={() => changeScale(0.25)} className="inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-white/10" aria-label="Zoom in"><Plus className="h-5 w-5" /></button>
          <button type="button" onClick={() => setScale(1.25)} className="inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-white/10" aria-label="Reset zoom"><RotateCcw className="h-5 w-5" /></button>
          <button type="button" onClick={onClose} className="inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-white/10" aria-label="Close enlarged diagram"><X className="h-6 w-6" /></button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-6">
        <img src={image.src} alt={image.alt} className="mx-auto h-auto bg-white object-contain shadow-2xl" style={{ width: `${scale * 100}%`, maxWidth: 'none' }} />
      </div>
    </div>
  );
}