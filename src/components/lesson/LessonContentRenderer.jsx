import React from 'react';
import { AlertCircle, FileText, Film, PuzzleIcon, Zap } from 'lucide-react';
import DocumentViewer from './DocumentViewer';
import GoogleSlidePlayer from './GoogleSlidePlayer';
import ManusSlidePlayer from './ManusSlidePlayer';

/**
 * Unified content renderer for different lesson content types
 * Supports: richtext, googleslides, document, video, quiz, simulation
 */
export default function LessonContentRenderer({ lesson, className = "" }) {
  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
        <div className="text-center text-slate-500">
          <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No lesson content available</p>
        </div>
      </div>
    );
  }

  const contentType = lesson.content_type || 'richtext';

  return (
    <div className={`lesson-content-renderer ${className}`}>
      {/* Google Slides */}
      {contentType === 'googleslides' && lesson.google_slides_url && (
        <div className="w-full h-full rounded-lg overflow-hidden shadow-lg">
          <GoogleSlidePlayer url={lesson.google_slides_url} />
        </div>
      )}

      {/* Manus Slides */}
      {contentType === 'manusslides' && lesson.manus_slides_url && (
        <ManusSlidePlayer url={lesson.manus_slides_url} title={lesson.title} />
      )}

      {/* Document (PPTX, PDF, Word) */}
      {contentType === 'document' && lesson.file_url && (
        <DocumentViewer 
          fileUrl={lesson.file_url} 
          fileType={lesson.file_type}
          className="w-full rounded-lg shadow-lg"
        />
      )}

      {/* Video Lecture */}
      {contentType === 'video' && lesson.video_url && (
        <VideoLectureRenderer url={lesson.video_url} title={lesson.title} />
      )}

      {/* Interactive Quiz */}
      {contentType === 'quiz' && lesson.h5p_content_url && (
        <InteractiveQuizRenderer url={lesson.h5p_content_url} />
      )}

      {/* Interactive Simulation/H5P */}
      {contentType === 'simulation' && lesson.h5p_content_url && (
        <SimulationRenderer url={lesson.h5p_content_url} title={lesson.title} />
      )}

      {/* Rich Text Content */}
      {contentType === 'richtext' && (
        <RichTextRenderer slides={lesson.slides} />
      )}

      {/* Fallback - no content */}
      {!hasContent(lesson, contentType) && (
        <MissingContentPlaceholder contentType={contentType} />
      )}
    </div>
  );
}

function VideoLectureRenderer({ url, title }) {
  return (
    <div className="w-full bg-black rounded-lg overflow-hidden shadow-lg aspect-video">
      <iframe
        src={url}
        title={title || 'Video Lecture'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}

function InteractiveQuizRenderer({ url }) {
  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-4 border border-slate-200">
      <div className="flex items-center gap-3 mb-4">
        <PuzzleIcon className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-slate-800">Interactive Quiz</h3>
      </div>
      <iframe
        src={url}
        title="Interactive Quiz"
        className="w-full min-h-96 rounded-md border border-slate-200"
        frameBorder="0"
        allow="geolocation *; microphone *; camera *; midi *; payment *; vr *; xr-spatial-tracking *; gyroscope *; magnetometer *;"
        allowFullScreen
      />
    </div>
  );
}

function SimulationRenderer({ url, title }) {
  return (
    <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200">
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-slate-200">
        <Zap className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-slate-800">Interactive Simulation</h3>
      </div>
      <iframe
        src={url}
        title={title || 'Interactive Simulation'}
        className="w-full min-h-96"
        frameBorder="0"
        allow="geolocation *; microphone *; camera *; midi *; payment *; vr *; xr-spatial-tracking *; gyroscope *; magnetometer *;"
        allowFullScreen
      />
    </div>
  );
}

function RichTextRenderer({ slides }) {
  if (!slides || slides.length === 0) {
    return (
      <div className="prose prose-slate max-w-none p-6 bg-white rounded-lg shadow-sm">
        <p className="text-slate-600">Rich text content coming soon.</p>
      </div>
    );
  }

  const cleanHTML = (html) => {
    if (typeof html !== 'string') return html;
    
    return html
      // Decode HTML entities
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      // Remove duplicate consecutive headings
      .replace(/(<h[1-6][^>]*>.*?<\/h[1-6]>)\s*\1/gi, '$1')
      // Fix broken bullet points
      .replace(/<li>\s*<\/li>/g, '')
      .replace(/(<p>)\s*•\s*/g, '<ul><li>')
      .replace(/\n\s*•\s*/g, '</li><li>')
      .replace(/(<\/li>)(?!\s*<li>|\s*<\/ul>)/g, '$1</ul>')
      // Remove random bold tags in middle of sentences
      .replace(/(<\/(strong|b)>)\s*(<(strong|b)>)/gi, ' ')
      // Clean up whitespace
      .replace(/\s{2,}/g, ' ')
      .replace(/<p>\s*<\/p>/g, '')
      .replace(/<br\s*\/?>\s*<br\s*\/?>/g, '<br/>')
      // Merge consecutive lists
      .replace(/<\/ul>\s*<ul>/g, '')
      .replace(/<\/ol>\s*<ol>/g, '');
  };

  return (
    <div className="space-y-6">
      {slides.map((slide, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          {slide.title && <h2 className="text-2xl font-bold mb-4 text-slate-900">{slide.title}</h2>}
          <div 
            className="prose prose-slate max-w-none prose-headings:mb-3 prose-p:mb-2 prose-li:mb-1 prose-ul:my-3 prose-ol:my-3"
            dangerouslySetInnerHTML={{ 
              __html: cleanHTML(slide.content)
            }}
          />
        </div>
      ))}
    </div>
  );
}

function MissingContentPlaceholder({ contentType }) {
  return (
    <div className="flex items-center justify-center h-96 bg-amber-50 rounded-lg border-2 border-amber-200">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-2 text-amber-600" />
        <p className="text-amber-900 font-medium">Content Not Available</p>
        <p className="text-sm text-amber-700">This {contentType} lesson hasn't been set up yet.</p>
      </div>
    </div>
  );
}

function hasContent(lesson, contentType) {
  switch (contentType) {
    case 'googleslides':
      return !!lesson.google_slides_url;
    case 'manusslides':
      return !!lesson.manus_slides_url;
    case 'document':
      return !!lesson.file_url;
    case 'video':
      return !!lesson.video_url;
    case 'quiz':
    case 'simulation':
      return !!lesson.h5p_content_url;
    case 'richtext':
      return !!lesson.slides?.length;
    default:
      return false;
  }
}