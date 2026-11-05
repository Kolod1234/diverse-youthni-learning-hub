import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Loader2, Save, Play, Settings2, Sparkles, MoreVertical, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import SlideEditor from '@/components/editor/SlideEditor';
import FullscreenPresenter from '@/components/presentation/FullscreenPresenter';
import LessonMetadataPanel from '@/components/editor/lessonBuilder/LessonMetadataPanel';
import { isCourseExplicitlyAssignedToTutor } from '@/components/tutor/tutorAccess';

export default function LessonEditor() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = new URLSearchParams(location.search);
  const lessonId = params.get('id');
  const courseId = params.get('courseId');
  const [user, setUser] = useState(null);
  const [lessonForm, setLessonFormState] = useState({});
  const lessonFormRef = useRef(lessonForm);
  // Update the draft ref synchronously, before React batches the next render.
  // Save can then read edits flushed by the active builder in the same event.
  const setLessonForm = useCallback((update) => {
    const next = typeof update === 'function' ? update(lessonFormRef.current) : update;
    lessonFormRef.current = next;
    setLessonFormState(next);
  }, []);
  const loadedLessonRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [convertingPptx, setConvertingPptx] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Accessible save-error message rendered near the Save button. Cleared on
  // every new save attempt; preserved otherwise so the form (draft slides,
  // title, etc.) is never lost on failure.
  const [saveError, setSaveError] = useState(null);
  // Synchronous flush handle exposed by the active VisualLessonBuilder. Called
  // before save so any blocks pending in the autosave debounce window are
  // serialised into slide.content BEFORE we read lessonForm.slides. Without
  // this, a Save click within ~1.2s of a block edit silently drops that edit.
  const builderFlushRef = useRef(null);
  // Ref-based double-submit guard. react-query's `isPending` already prevents
  // re-firing the mutation, but an extra synchronous guard protects against
  // the (rare) case of a parallel programmatic call before React re-renders.
  const submittingRef = useRef(false);

  // Auto-open the settings drawer for brand-new drafts so the tutor must
  // supply the required title/course before the SlideEditor is the only
  // visible workspace. This preserves the existing required-field gate
  // without re-introducing the old above-the-fold metadata cards.
  useEffect(() => {
    if (!lessonId && !lessonForm.title) {
      setSettingsOpen(true);
    }
    // intentionally only on lessonId so we don't re-trigger while typing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
      if (userData.role !== 'admin' && !userData.is_tutor) {
        toast.error('Unauthorized access');
        navigate(createPageUrl('Dashboard'));
        return;
      }
      // If a courseId is provided, verify the tutor is explicitly assigned to it.
      // Approved subjects do NOT grant access.
      if (courseId && userData.role !== 'admin') {
        const courses = await base44.entities.Course.filter({ id: courseId });
        const course = courses[0];
        if (course && !isCourseExplicitlyAssignedToTutor(course, userData)) {
          toast.error('You are not assigned to this course. Please contact an admin.');
          navigate(createPageUrl('TutorDashboardOverview'));
        }
      }
    };
    loadUser();
  }, []);

  // Course picker: only courses explicitly assigned to this tutor (or all for admins).
  const { data: tutorCourses = [] } = useQuery({
    queryKey: ['tutor-assigned-courses-for-lesson-editor-v2', user?.email, user?.role],
    queryFn: async () => {
      if (!user) return [];
      if (user.role === 'admin') {
        return base44.entities.Course.list('title', 5000);
      }
      return base44.entities.Course.filter({ assigned_tutors: user.email }, 'title', 200);
    },
    enabled: !!user,
  });

  // Resolve the course referenced by the URL `courseId`, if any. Used to:
  //  - validate it against the authorised list (never trust the URL),
  //  - show its title in the settings drawer (so the tutor can SEE the
  //    binding instead of guessing), and
  //  - seed lessonForm.course_id once when the draft is new.
  // This is a separate query from the tutorCourses one because a tutor's
  // assigned list is paginated to 200 and a URL course may not appear in it
  // (which itself is a signal that the URL course is unauthorised).
  const { data: urlCourse = null } = useQuery({
    queryKey: ['lesson-editor-url-course', courseId],
    queryFn: async () => {
      if (!courseId) return null;
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0] || null;
    },
    enabled: !!courseId,
  });

  // urlCourseValid ⇔ the URL course exists AND the user is authorised to
  // author lessons in it. Admins are always authorised. Tutors must be in
  // the course's `assigned_tutors` list (the same rule the rest of the app
  // uses via isCourseExplicitlyAssignedToTutor).
  const urlCourseValid = useMemo(() => {
    if (!courseId || !user || !urlCourse) return false;
    if (user.role === 'admin') return true;
    return isCourseExplicitlyAssignedToTutor(urlCourse, user);
  }, [courseId, user, urlCourse]);

  // Seed lessonForm.course_id once from a valid URL courseId on a new draft.
  // Idempotent — only runs while course_id is unset on a brand-new draft,
  // never overrides an explicit pick or an edit of an existing lesson.
  useEffect(() => {
    if (lessonId) return;            // editing existing — its course is fixed
    if (lessonForm.course_id) return; // already chosen
    if (!urlCourseValid) return;     // URL course missing/invalid — force pick
    setLessonForm((f) => ({ ...f, course_id: courseId }));
  }, [lessonId, urlCourseValid, courseId, lessonForm.course_id]);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      if (!lessonId) return null;
      const lessons = await base44.entities.Lesson.filter({ id: lessonId });
      return lessons[0];
    },
    enabled: !!lessonId,
  });

  // When editing an existing lesson, verify the tutor is assigned to that lesson's course.
  // Blocks URL tampering with ?id=<otherLessonId>.
  useEffect(() => {
    if (!user || !lesson || user.role === 'admin') return;
    (async () => {
      const courses = await base44.entities.Course.filter({ id: lesson.course_id });
      const lessonCourse = courses[0];
      if (lessonCourse && !isCourseExplicitlyAssignedToTutor(lessonCourse, user)) {
        toast.error('You are not assigned to this course. Please contact an admin.');
        navigate(createPageUrl('TutorDashboardOverview'));
      }
    })();
  }, [user, lesson]);

  useEffect(() => {
    // Background refetches must not replace a tutor's unsaved draft.
    if (lesson?.id === lessonId && loadedLessonRef.current !== lessonId) {
      loadedLessonRef.current = lessonId;
      setLessonForm(lesson);
    }
  }, [lesson, lessonId, setLessonForm]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Flush the active editor, then read the synchronous draft snapshot.
      // If serialization fails, preserve the draft and report the save error.
      builderFlushRef.current?.();
      const form = lessonFormRef.current;

      // 3. Resolve the effective course id. Editing → use the lesson's
      //    course_id (immutable here). Creating → form > URL.
      const effectiveCourseId = lessonId
        ? (lesson?.course_id || form.course_id)
        : (form.course_id || (urlCourseValid ? courseId : null));

      // 4. Validate required fields. Throw structured errors with codes so
      //    the onError handler can surface accessible, specific messages.
      const title = (form.title || '').trim();
      if (!title) {
        const e = new Error('Add a lesson title before saving.');
        e.code = 'missing_title';
        throw e;
      }
      if (!effectiveCourseId) {
        const e = new Error('Choose a course in Lesson settings before saving.');
        e.code = 'missing_course';
        throw e;
      }

      // 5. Re-verify the user is authorised for the target course at write
      //    time (admins skip). This guards against URL tampering AND against
      //    a course being unassigned between page load and save.
      if (user?.role !== 'admin') {
        const courses = await base44.entities.Course.filter({ id: effectiveCourseId });
        const targetCourse = courses[0];
        if (!targetCourse) {
          const e = new Error('That course no longer exists.');
          e.code = 'course_missing';
          throw e;
        }
        if (!isCourseExplicitlyAssignedToTutor(targetCourse, user)) {
          const e = new Error('You are not assigned to this course. Please contact an admin.');
          e.code = 'not_assigned';
          throw e;
        }
      }

      // 6. Persist — update existing lesson or create a new one. Await the
      //    real server response; only on resolve do we navigate.
      if (lessonId) {
        const updated = await base44.entities.Lesson.update(lessonId, { ...form, title });
        return { lessonId, courseId: effectiveCourseId, lesson: updated };
      }
      const created = await base44.entities.Lesson.create({
        ...form,
        title,
        course_id: effectiveCourseId,
        order: form.order || 0,
        content_type: form.content_type || 'richtext',
      });
      return { lessonId: created?.id, courseId: effectiveCourseId, lesson: created };
    },
    onMutate: () => {
      setSaveError(null);
    },
    onSuccess: ({ lessonId: savedLessonId, courseId: savedCourseId }) => {
      // Invalidate the exact query keys the destination pages read from so
      // the saved lesson appears immediately without a manual refresh.
      // - CourseDetails reads ['lessons', courseId]
      // - TutorCourseManager reads ['lessons', courseId]
      // - The editor itself reads ['lesson', lessonId]
      queryClient.invalidateQueries({ queryKey: ['lesson', savedLessonId] });
      queryClient.invalidateQueries({ queryKey: ['lessons', savedCourseId] });
      queryClient.invalidateQueries({ queryKey: ['course', savedCourseId] });
      toast.success('Lesson saved');
      // Navigate to the real course management/details route with the
      // Lessons list visible. Tutors land on TutorCourseManager (their
      // course management surface, which lists lessons under "Course
      // Structure"); admins land on CourseDetails (Curriculum tab, which
      // also lists lessons). The `newLesson` query param makes the saved
      // lesson identifiable for downstream highlighting if added later.
      const target = (user?.role === 'admin')
        ? `${createPageUrl('CourseDetails')}?id=${savedCourseId}&newLesson=${savedLessonId || ''}`
        : `${createPageUrl('TutorCourseManager')}?courseId=${savedCourseId}&newLesson=${savedLessonId || ''}`;
      navigate(target);
    },
    onError: (error) => {
      // NEVER navigate on failure. Surface an accessible error message near
      // the Save button and via toast so screen-reader users get both. The
      // draft (slides, title, etc.) is fully preserved in lessonForm.
      const msg = error?.message || 'Failed to save lesson';
      setSaveError(msg);
      toast.error(msg);
    },
    onSettled: () => {
      submittingRef.current = false;
    },
  });

  // Single entry point for Save. Double-submit safe via two layers:
  //  - synchronous ref guard (rejects re-entries before React re-renders),
  //  - react-query `isPending` (disables the button in the UI).
  const handleSave = () => {
    if (submittingRef.current || saveMutation.isPending) return;
    submittingRef.current = true;
    saveMutation.mutate();
  };

  // Upload + convert handlers now live inside LessonMetadataPanel, which
  // receives setUploading/setConverting/setConvertingPptx via props so this
  // page can still gate Save while uploads are in flight.

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen max-h-screen flex flex-col bg-muted overflow-x-hidden overflow-y-hidden">
      {/* Calm, immersive editor header — owns the viewport (Layout hides public chrome).
          At <sm we collapse to: [Back] [Title — truncated] [Save] [⋯ overflow]
          so the primary Save action is never clipped at 390px, and settings/present
          remain reachable through the overflow menu. ≥sm preserves the full inline row. */}
      {/* Redesign (wireframe L2): navy toolbar, white outline buttons, solid white Save. */}
      <div className="shrink-0 z-20 bg-[#0b2f5c] text-white">
        <div className="w-full max-w-screen-2xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" onClick={() => navigate(-1)} size="sm" className="shrink-0 text-white/85 hover:text-white hover:bg-white/10 px-2 sm:px-3">
            <ArrowLeft className="w-4 h-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="hidden sm:flex items-center gap-2 text-xs text-white/50 shrink-0" aria-hidden="true">
            <span>/</span>
            <span className="text-white/70">Lesson editor</span>
            <span>/</span>
          </div>
          <h1 className="flex-1 min-w-0 text-sm sm:text-base font-semibold text-white truncate">
            {lessonId ? (lessonForm.title || 'Edit Lesson') : 'Create New Lesson'}
          </h1>
          <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/15 border border-amber-200 rounded-full px-2 py-0.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {lessonId ? 'Unsaved changes' : 'Not yet saved — use Save Lesson to persist'}
          </span>

          {/* Desktop / tablet — original inline buttons preserved verbatim */}
          <div className="hidden sm:flex gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="bg-transparent border-white/70 text-white hover:bg-white/10 hover:text-white"
              onClick={() => setSettingsOpen(true)}
              title="Lesson settings (title, description, video, document, objectives…)"
            >
              <Settings2 className="w-4 h-4 mr-2" />
              Lesson settings
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="bg-transparent border-white/70 text-white hover:bg-white/10 hover:text-white"
              onClick={() => setPresenting(true)}
              disabled={!(lessonForm.slides || []).length}
              title={(lessonForm.slides || []).length ? 'Launch full-screen presenter' : 'Add slides to present'}
            >
              <Play className="w-4 h-4 mr-2" />
              Present
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={
                !((lessonForm.title || '').trim())
                || (!lessonId && !lessonForm.course_id && !urlCourseValid)
                || saveMutation.isPending
              }
              className="bg-card text-[#0b2f5c] font-bold hover:bg-indigo-50"
              aria-describedby={saveError ? 'lesson-editor-save-error' : undefined}
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Lesson
                </>
              )}
            </Button>
          </div>

          {/* Mobile — compact Save + overflow. Save must never be clipped. */}
          <div className="flex sm:hidden gap-1.5 shrink-0">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={
                !((lessonForm.title || '').trim())
                || (!lessonId && !lessonForm.course_id && !urlCourseValid)
                || saveMutation.isPending
              }
              className="bg-card text-[#0b2f5c] font-bold hover:bg-indigo-50 px-3"
              aria-label="Save lesson"
              aria-describedby={saveError ? 'lesson-editor-save-error' : undefined}
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 sm:mr-2" />
                  <span className="ml-1.5 text-xs font-semibold">Save</span>
                </>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="px-2 bg-transparent border-white/70 text-white hover:bg-white/10 hover:text-white" aria-label="More actions">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                  <Settings2 className="w-4 h-4 mr-2" />
                  Lesson settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setPresenting(true)}
                  disabled={!(lessonForm.slides || []).length}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Present
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Lesson settings drawer — owns ALL metadata, description, media URLs,
          uploads, objectives, options. Behaviour identical to the previous
          stacked cards; only the location changes so the slide builder owns
          the editor's primary fold per the reference. */}
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent
          side="right"
          // [&>button]:z-20 lifts the Radix-default close (X at right-4/top-4)
          // ABOVE our sticky header (z-10), so a click at the X coordinate
          // hits the close button instead of being absorbed by the sticky bar.
          className="w-full sm:max-w-md md:max-w-lg overflow-y-auto bg-muted p-0 [&>button]:z-30"
          // Stop pointer-down inside the panel from bubbling to background
          // template cards (which sit under the overlay). Radix already
          // intercepts outside-clicks at the overlay layer, but a defensive
          // stopPropagation here means even if a template card's click
          // listener somehow attached to a bubbling phase ancestor, the
          // sheet would not leak clicks through to it.
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 bg-card border-b border-slate-200 px-6 py-4 flex items-start justify-between gap-3">
            <SheetHeader className="flex-1 min-w-0">
              <SheetTitle className="flex items-center gap-2 text-base">
                <Settings2 className="w-4 h-4 text-indigo-600" />
                Lesson settings
              </SheetTitle>
              <p className="text-xs text-slate-500">
                Edits stay in this draft until you click Save Lesson.
              </p>
            </SheetHeader>
            {/* Visible header Close — wrapped in SheetClose asChild so Radix
                wires the native open-state change. This is the PRIMARY
                labelled close for mouse + keyboard; the absolute X in the
                top-right corner remains as a secondary affordance.
                `type="button"` + onClick stopPropagation prevents the click
                from bubbling to anything underneath. Tabindex is implicit
                via the native button so Enter/Space activate it. */}
            <SheetClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label="Close lesson settings"
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 h-8 px-2 text-slate-600 hover:text-slate-900 hover:bg-muted -mr-2"
              >
                Close
              </Button>
            </SheetClose>
          </div>
          <div className="px-4 sm:px-5 py-5">
            <LessonMetadataPanel
              lessonForm={lessonForm}
              setLessonForm={setLessonForm}
              lessonId={lessonId}
              courseId={courseId}
              tutorCourses={tutorCourses}
              uploading={uploading}
              setUploading={setUploading}
              converting={converting}
              setConverting={setConverting}
              convertingPptx={convertingPptx}
              setConvertingPptx={setConvertingPptx}
              urlCourseValid={urlCourseValid}
              urlCourseTitle={urlCourse?.title || ''}
            />
          </div>
        </SheetContent>
      </Sheet>

      {presenting && (
        <FullscreenPresenter
          slides={lessonForm.slides || []}
          onClose={() => setPresenting(false)}
          transition="fade"
          showNotesByDefault={false}
        />
      )}

      {/* Optional banners — sit between the header and the workspace and
          take only their natural height; they never steal from the
          workspace stage area. */}
      {!lessonForm.title && (
        <div className="shrink-0 px-3 sm:px-6 pt-2">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50/70 px-4 py-2 text-sm">
            <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Add a lesson title and course in <strong>Lesson settings</strong> before saving.</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => setSettingsOpen(true)} className="shrink-0 border-indigo-300 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100">
              Open settings
            </Button>
          </div>
        </div>
      )}

      {saveError && (
        <div className="shrink-0 px-3 sm:px-6 pt-2">
          <div
            id="lesson-editor-save-error"
            role="alert"
            aria-live="assertive"
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 dark:bg-red-500/15 px-4 py-2 text-sm text-red-900 dark:text-red-300"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 text-red-600 shrink-0" />
            <div className="flex-1">
              <span className="font-medium">Couldn't save the lesson.</span>{' '}
              <span>{saveError}</span>
              <span className="block text-xs text-red-700/80 mt-0.5">
                Your draft is preserved — fix the issue above and try Save Lesson again.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Primary authoring workspace — owns the remaining viewport height
          via flex-1. The shell renders ribbon, thumbnail rail, grey
          pasteboard, centred 16:9 slide and bottom status bar. */}
      <div className="flex-1 min-h-0 min-w-0 w-full">
        <SlideEditor
          slides={lessonForm.slides || []}
          onChange={(slides) => setLessonForm(form => ({ ...form, slides }))}
          isPersisted={!!lessonId}
          builderFlushRef={builderFlushRef}
        />
      </div>
    </div>
  );
}