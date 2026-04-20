import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Renders a Manus slides public share URL inside an iframe.
 * Works for any embeddable public URL (Manus uses standard HTTPS share links).
 */
export default function ManusSlidePlayer({ url, title = 'Manus Slides' }) {
  if (!url) {
    return (
      <div className="flex items-center justify-center h-96 bg-amber-50 rounded-lg border-2 border-amber-200">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-2 text-amber-600" />
          <p className="text-amber-900 font-medium">No Manus slides URL provided</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg shadow-lg bg-black" style={{ paddingTop: '56.25%' }}>
      <iframe
        src={url}
        title={title}
        className="absolute top-0 left-0 w-full h-full border-0"
        allowFullScreen
        allow="fullscreen; autoplay; clipboard-write; encrypted-media; picture-in-picture"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}