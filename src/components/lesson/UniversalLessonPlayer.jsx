import React from 'react';
import ProfessionalGoogleSlidePlayer from './ProfessionalGoogleSlidePlayer';

/**
 * UniversalLessonPlayer
 * Intelligently routes to the correct renderer based on lesson content_type,
 * with graceful fallbacks for older lessons that lack an explicit content_type.
 *
 * Supported content types:
 *   - googleslides  → ProfessionalGoogleSlidePlayer (full-featured)
 *   - video         → inline <video> / YouTube / Vimeo iframe
 *   - richtext      → rendered HTML slides (handled by the parent player's existing logic)
 *   - document      → PDF / file iframe
 *
 * NOTE: richtext (internal slides) is intentionally NOT rendered here — the parent
 * player pages already contain that logic and should continue to own it.
 * This component is only invoked when the lesson has external-embed content
 * (google slides, video, document file).
 */
export default function UniversalLessonPlayer({ lesson, totalSlides, toggleFullscreen, isFullscreen }) {
  if (!lesson) return null;

  // ── Derive effective content type ──────────────────────────────────────────
  let type = lesson.content_type;

  if (!type) {
    if (lesson.google_slides_url) type = 'googleslides';
    else if (lesson.video_url)       type = 'video';
    else if (lesson.file_url)        type = 'document';
    else                             type = 'unknown';
  }

  // ── Google Slides ───────────────────────────────────────────────────────────
  if (type === 'googleslides' && lesson.google_slides_url) {
    return (
      <ProfessionalGoogleSlidePlayer
        googleSlidesUrl={lesson.google_slides_url}
        lessonId={lesson.id}
        totalSlides={totalSlides || lesson.slides?.length || 20}
        toggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
      />
    );
  }

  // ── Video ───────────────────────────────────────────────────────────────────
  if (type === 'video' && lesson.video_url) {
    return <VideoPlayer url={lesson.video_url} title={lesson.title} />;
  }

  // ── Document / file ─────────────────────────────────────────────────────────
  if (type === 'document' && lesson.file_url) {
    return <DocumentPlayer url={lesson.file_url} />;
  }

  // ── Fallback ─────────────────────────────────────────────────────────────────
  return null;
}

// ──────────────────────────────────────────────────────────────────────────────
// Sub-renderers (kept small, self-contained)
// ──────────────────────────────────────────────────────────────────────────────

function VideoPlayer({ url, title }) {
  const embedUrl = getVideoEmbedUrl(url);
  const isDirect = embedUrl === url;

  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <div className="w-full" style={{ aspectRatio: '16/9' }}>
        {isDirect ? (
          <video
            src={url}
            controls
            className="w-full h-full"
            controlsList="nodownload"
            title={title}
          />
        ) : (
          <iframe
            src={embedUrl}
            title={title || 'Lesson Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-none"
          />
        )}
      </div>
    </div>
  );
}

function DocumentPlayer({ url }) {
  return (
    <div className="w-full h-full min-h-[60vh]">
      <iframe
        src={url}
        title="Lesson Document"
        className="w-full h-full border-none"
        allowFullScreen
      />
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getVideoEmbedUrl(url) {
  if (!url) return url;
  // YouTube watch → embed
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // Vimeo → embed
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  // Return as-is (direct video file or already an embed URL)
  return url;
}