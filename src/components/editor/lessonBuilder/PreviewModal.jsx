import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone, Presentation, X } from 'lucide-react';
import { MathJax } from 'better-react-mathjax';

// Live HTML preview at desktop / tablet / mobile / presentation widths.
// The preview uses the SAME serialized HTML the LessonPlayer will receive,
// so what you see here is exactly what learners will get.
const DEVICES = {
  desktop:      { label: 'Desktop',      icon: Monitor,      width: 1280 },
  tablet:       { label: 'Tablet',       icon: Tablet,       width: 820 },
  mobile:       { label: 'Mobile',       icon: Smartphone,   width: 390 },
  presentation: { label: 'Presentation', icon: Presentation, width: 1600 },
};

export default function PreviewModal({ open, onClose, html }) {
  const [device, setDevice] = useState('desktop');
  if (!open) return null;
  const cfg = DEVICES[device];

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex flex-col" role="dialog" aria-modal="true" aria-label="Lesson preview">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 text-white">
        <div className="flex items-center gap-1 bg-slate-800 rounded-md p-1">
          {Object.entries(DEVICES).map(([k, v]) => {
            const Icon = v.icon;
            return (
              <button
                key={k}
                onClick={() => setDevice(k)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  device === k ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {v.label}
              </button>
            );
          })}
        </div>
        <span className="text-xs text-slate-400">{cfg.width}px</span>
        <button onClick={onClose} aria-label="Close preview" className="text-slate-300 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-slate-800 p-6">
        <div
          className="mx-auto bg-white rounded shadow-2xl overflow-hidden"
          style={{ width: '100%', maxWidth: cfg.width }}
        >
          <div className={`${device === 'presentation' ? 'p-12' : 'p-6'}`}>
            <MathJax dynamic>
              <div dangerouslySetInnerHTML={{ __html: html || '' }} />
            </MathJax>
          </div>
        </div>
      </div>
    </div>
  );
}