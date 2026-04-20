import React from 'react';
import { AlertCircle, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Manus share pages block iframe embedding (X-Frame-Options) AND load their
 * slide images client-side via JavaScript, so we can't embed or scrape them.
 * Instead we show a clear "Open in Manus" launch card.
 *
 * If you want slides embedded directly in the lesson, export from Manus as
 * PPTX/PDF and upload via the Document Upload flow instead.
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
    <div className="w-full rounded-lg overflow-hidden shadow-lg bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 text-white">
      <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 min-h-[360px]">
        <Sparkles className="w-14 h-14 mb-4 text-yellow-300" />
        <h3 className="text-2xl sm:text-3xl font-bold mb-2">{title}</h3>
        <p className="text-purple-100 mb-6 max-w-md">
          This lesson uses a Manus slide deck. Click below to open the presentation in a new tab.
        </p>
        <a href={url} target="_blank" rel="noopener noreferrer">
          <Button size="lg" className="bg-white text-purple-700 hover:bg-purple-50 font-semibold">
            <ExternalLink className="w-5 h-5 mr-2" />
            Open Manus Slides
          </Button>
        </a>
        <p className="mt-6 text-xs text-purple-200 max-w-md">
          Tip: for fully embedded slides, export your Manus deck as PPTX or PDF and upload it under "Upload Document".
        </p>
      </div>
    </div>
  );
}