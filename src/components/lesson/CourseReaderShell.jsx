import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { CheckCircle2, Circle, Menu, ChevronRight, ArrowRight, X } from 'lucide-react';

/**
 * CourseReaderShell
 * -----------------
 * PURELY PRESENTATIONAL shell that renders the reference player chrome:
 *   • 320px sticky deep-indigo course outline (with progress + grouped modules)
 *   • Large editorial hero with "LESSON X OF Y" eyebrow
 *   • 900–1000px article column
 *   • Mobile drawer outline
 *   • Optional big black circular "next lesson" affordance
 *
 * It owns ZERO business logic. Every player variant keeps its own progress,
 * SCORM, AI, navigation, completion and data hooks. The shell only takes the
 * shape needed to render the chrome and forwards click handlers back to the
 * caller. Players can wrap their existing main content in <CourseReaderShell>
 * incrementally; nothing breaks if they don't.
 *
 * USAGE
 *   <CourseReaderShell
 *     course={course}
 *     lessons={sortedLessons}
 *     currentLessonId={lessonId}
 *     completedIds={enrollment?.completed_lessons || []}
 *     progressPercent={progressPercent}
 *     onSelectLesson={(id) => navigate(`/LessonPlayerClassic?lesson=${id}&course=${course.id}`)}
 *     onNextLesson={handleNextLesson}
 *     nextLessonAvailable={!!nextLesson}
 *     headerSlot={<ExitButton/>}      // optional right-aligned header slot
 *     hero={{ title: lesson.title, index: currentLessonIndex, total: lessons.length }}
 *   >
 *     {/* existing player content — already preserves all logic *\/}
 *   </CourseReaderShell>
 */
export default function CourseReaderShell({
  course,
  lessons = [],
  currentLessonId,
  completedIds = [],
  progressPercent = 0,
  onSelectLesson,
  onNextLesson,
  nextLessonAvailable = false,
  headerSlot,
  hero,
  children,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop sticky course outline — 320px deep indigo */}
      <CourseOutline
        course={course}
        lessons={lessons}
        currentLessonId={currentLessonId}
        completedIds={completedIds}
        progressPercent={progressPercent}
        onSelectLesson={onSelectLesson}
        className="hidden lg:flex"
      />

      {/* Main reader column */}
      <div className="flex-1 min-w-0 flex flex-col relative">
        {/* Compact top bar — only shown when caller provides a headerSlot or on mobile (drawer trigger) */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Mobile drawer trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="lg:hidden inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 px-2 py-1.5 rounded-md hover:bg-slate-100"
                aria-label="Open course outline"
              >
                <Menu className="w-4 h-4" />
                <span>Lessons</span>
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[88%] sm:max-w-[340px] bg-[#1e1b4b] text-white border-r-0">
              <CourseOutline
                course={course}
                lessons={lessons}
                currentLessonId={currentLessonId}
                completedIds={completedIds}
                progressPercent={progressPercent}
                onSelectLesson={(id) => { onSelectLesson?.(id); setMobileOpen(false); }}
                className="flex h-full"
                embedded
              />
            </SheetContent>
          </Sheet>

          <div className="hidden lg:block text-xs text-slate-400 font-medium tracking-wide uppercase">
            {course?.title || ''}
          </div>
          <div className="flex items-center gap-2">{headerSlot}</div>
        </div>

        {/* Hero */}
        {hero && (
          <header className="bg-white border-b border-slate-100 px-4 sm:px-8 py-10 sm:py-14">
            <div className="mx-auto" style={{ maxWidth: 960 }}>
              {typeof hero.index === 'number' && typeof hero.total === 'number' && hero.total > 0 && (
                <div className="text-xs sm:text-[13px] font-semibold tracking-[0.2em] text-indigo-600 mb-3 uppercase">
                  Lesson {hero.index + 1} of {hero.total}
                </div>
              )}
              {hero.title && (
                <h1
                  className="font-bold text-slate-900 leading-tight"
                  style={{
                    fontFamily: '"Source Serif Pro", "Lora", Georgia, serif',
                    fontSize: 'clamp(1.875rem, 2.6vw + 1rem, 3rem)',
                  }}
                >
                  {hero.title}
                </h1>
              )}
              {hero.subtitle && (
                <p className="mt-3 text-slate-600 text-base sm:text-lg leading-relaxed">{hero.subtitle}</p>
              )}
            </div>
          </header>
        )}

        {/* Article column — caller-rendered content untouched.
            Constraining width here gives every player the reference reading column
            without us modifying any player internals. */}
        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-10">
          <div className="mx-auto course-reader-article" style={{ maxWidth: 960 }}>
            {children}
          </div>
        </main>

        {/* Next lesson — large black circular CTA on the right edge (desktop) */}
        {nextLessonAvailable && onNextLesson && (
          <button
            type="button"
            onClick={onNextLesson}
            aria-label="Next lesson"
            className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-14 h-14 rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Course outline (desktop sticky + mobile drawer)                            */
/* -------------------------------------------------------------------------- */
function CourseOutline({
  course,
  lessons,
  currentLessonId,
  completedIds,
  progressPercent,
  onSelectLesson,
  className = '',
  embedded = false,
}) {
  // Group by section/module
  const groups = lessons.reduce((acc, l) => {
    const key = l.section || 'Lessons';
    if (!acc[key]) acc[key] = [];
    acc[key].push(l);
    return acc;
  }, {});

  const pct = Math.max(0, Math.min(100, Math.round(progressPercent || 0)));

  return (
    <aside
      className={`${className} w-[320px] shrink-0 ${embedded ? '' : 'sticky top-0 h-screen'} flex-col bg-[#1e1b4b] text-white`}
    >
      {/* Header */}
      <div className="px-5 pt-6 pb-5 border-b border-white/10">
        <div className="text-[11px] tracking-[0.18em] text-indigo-300 font-semibold uppercase mb-1.5">Course</div>
        <h2 className="text-lg font-semibold leading-snug" style={{ fontFamily: '"Source Serif Pro", Georgia, serif' }}>
          {course?.title || 'Course Content'}
        </h2>
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] text-indigo-200 mb-1.5">
            <span className="font-semibold tracking-wide">{pct}% COMPLETE</span>
            <span>{completedIds.length}/{lessons.length}</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
            <div className="h-full bg-indigo-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Scrollable list */}
      <nav className="flex-1 overflow-y-auto py-3" aria-label="Course lessons">
        {Object.entries(groups).map(([section, sectionLessons]) => (
          <div key={section} className="mb-4">
            <div className="px-5 pb-2 text-[11px] tracking-[0.15em] font-semibold text-indigo-300 uppercase">
              {section}
            </div>
            <ul className="space-y-0.5 px-2">
              {sectionLessons.map((l) => {
                const completed = completedIds.includes(l.id);
                const active = l.id === currentLessonId;
                return (
                  <li key={l.id}>
                    <button
                      type="button"
                      onClick={() => onSelectLesson?.(l.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 text-sm transition ${
                        active
                          ? 'bg-white/15 text-white font-semibold'
                          : 'text-indigo-100/90 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="shrink-0">
                        {completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        ) : (
                          <Circle className={`w-4 h-4 ${active ? 'text-white' : 'text-indigo-300/60'}`} />
                        )}
                      </span>
                      <span className="flex-1 line-clamp-2">{l.title}</span>
                      {active && <ChevronRight className="w-3.5 h-3.5 text-indigo-300 shrink-0" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/* Reusable reader content primitives                                          */
/* These are exported so the LessonEditor preview and the players can share    */
/* the same typography/layout for a true WYSIWYG feel — without changing       */
/* slide.content serialisation.                                                */
/* -------------------------------------------------------------------------- */

export function MediaCard({ children, title, caption }) {
  return (
    <figure className="my-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden border-l-4 border-l-indigo-500">
      {title && (
        <div className="px-5 pt-4 pb-2">
          <h3 className="text-lg font-semibold text-slate-900" style={{ fontFamily: '"Source Serif Pro", Georgia, serif' }}>
            {title}
          </h3>
        </div>
      )}
      <div className="w-full bg-slate-100" style={{ aspectRatio: '16/9' }}>
        {children}
      </div>
      {caption && <figcaption className="px-5 py-3 text-sm text-slate-600 border-t border-slate-100">{caption}</figcaption>}
    </figure>
  );
}

export function SectionBand({ alt = false, children, className = '' }) {
  return (
    <section className={`-mx-4 sm:-mx-8 px-4 sm:px-8 py-8 sm:py-10 ${alt ? 'bg-slate-50' : 'bg-white'} ${className}`}>
      <div className="mx-auto" style={{ maxWidth: 960 }}>{children}</div>
    </section>
  );
}

export function NumberedConceptCard({ number, title, children }) {
  return (
    <article className="my-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex gap-5">
      <div className="shrink-0 w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-bold shadow-sm">
        {number}
      </div>
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-2" style={{ fontFamily: '"Source Serif Pro", Georgia, serif' }}>
            {title}
          </h3>
        )}
        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed">{children}</div>
      </div>
    </article>
  );
}