import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Loader2, Save, Play, Settings2, Sparkles, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import SlideEditor from '@/components/editor/SlideEditor';
import AILessonAssistant from '@/components/lesson/AILessonAssistant';
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
  const [lessonForm, setLessonForm] = useState({});
  const [uploading, setUploading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [convertingPptx, setConvertingPptx] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
    if (lesson) {
      setLessonForm(lesson);
    }
  }, [lesson]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const targetCourseId = lessonForm.course_id || courseId || lesson?.course_id;
      // Defence in depth: re-check the tutor is assigned to the target course
      // before writing, so that even tampered form state cannot save into a
      // course the tutor does not own.
      if (user?.role !== 'admin' && targetCourseId) {
        const courses = await base44.entities.Course.filter({ id: targetCourseId });
        const targetCourse = courses[0];
        if (targetCourse && !isCourseExplicitlyAssignedToTutor(targetCourse, user)) {
          throw new Error('You are not assigned to this course. Please contact an admin.');
        }
      }
      if (lessonId) {
        await base44.entities.Lesson.update(lessonId, lessonForm);
      } else {
        if (!courseId && !lessonForm.course_id) {
          throw new Error('Course ID is required');
        }
        await base44.entities.Lesson.create({
          ...lessonForm,
          course_id: lessonForm.course_id || courseId,
          order: 0,
          content_type: lessonForm.content_type || 'richtext'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lesson', lessonId]);
      queryClient.invalidateQueries(['all-lessons']);
      queryClient.invalidateQueries(['tutor-courses']);
      toast.success('Lesson saved successfully!');
      navigate(-1);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save lesson');
    }
  });

  // Upload + convert handlers now live inside LessonMetadataPanel, which
  // receives setUploading/setConverting/setConvertingPptx via props so this
  // page can still gate Save while uploads are in flight.

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Calm, immersive editor header — owns the viewport (Layout hides public chrome).
          At <sm we collapse to: [Back] [Title — truncated] [Save] [⋯ overflow]
          so the primary Save action is never clipped at 390px, and settings/present
          remain reachable through the overflow menu. ≥sm preserves the full inline row. */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="w-full max-w-screen-2xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" onClick={() => navigate(-1)} size="sm" className="shrink-0 text-slate-600 hover:text-slate-900 px-2 sm:px-3">
            <ArrowLeft className="w-4 h-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 shrink-0" aria-hidden="true">
            <span>/</span>
            <span className="text-slate-500">Lesson Editor</span>
            <span>/</span>
          </div>
          <h1 className="flex-1 min-w-0 text-sm sm:text-base font-semibold text-slate-900 truncate">
            {lessonId ? (lessonForm.title || 'Edit Lesson') : 'Create New Lesson'}
          </h1>
          <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {lessonId ? 'Unsaved changes' : 'Not yet saved — use Save Lesson to persist'}
          </span>

          {/* Desktop / tablet — original inline buttons preserved verbatim */}
          <div className="hidden sm:flex gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
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
              onClick={() => setPresenting(true)}
              disabled={!(lessonForm.slides || []).length}
              title={(lessonForm.slides || []).length ? 'Launch full-screen presenter' : 'Add slides to present'}
            >
              <Play className="w-4 h-4 mr-2" />
              Present
            </Button>
            <Button
              size="sm"
              onClick={() => saveMutation.mutate()}
              disabled={!lessonForm.title || (!lessonId && !courseId && !lessonForm.course_id) || saveMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
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
              onClick={() => saveMutation.mutate()}
              disabled={!lessonForm.title || (!lessonId && !courseId && !lessonForm.course_id) || saveMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 px-3"
              aria-label="Save lesson"
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
                <Button variant="outline" size="sm" className="px-2" aria-label="More actions">
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
          className="w-full sm:max-w-md md:max-w-lg overflow-y-auto bg-slate-50 p-0"
        >
          <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-base">
                <Settings2 className="w-4 h-4 text-indigo-600" />
                Lesson settings
              </SheetTitle>
              <p className="text-xs text-slate-500">
                Edits stay in this draft until you click Save Lesson.
              </p>
            </SheetHeader>
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

      {/* Primary authoring workspace — slide builder is THE first thing the
          tutor sees. All metadata lives in the Lesson settings drawer above.
          Reference image 1 = this layout. */}
      <div className="w-full max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        {/* Title strip — current lesson title acts as the hero, no extra cards.
            If the tutor hasn't named the lesson yet, prompt them gently to
            open the settings drawer without blocking the canvas. */}
        {!lessonForm.title && (
          <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50/70 px-4 py-2.5 text-sm">
            <div className="flex items-center gap-2 text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Add a lesson title and course in <strong>Lesson settings</strong> before saving.</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => setSettingsOpen(true)} className="shrink-0 border-indigo-300 text-indigo-700 hover:bg-indigo-100">
              Open settings
            </Button>
          </div>
        )}

        {/* Slide builder — primary workspace (must be in initial viewport at 1440x900). */}
        <SlideEditor
          slides={lessonForm.slides || []}
          onChange={(slides) => setLessonForm({ ...lessonForm, slides })}
          isPersisted={!!lessonId}
        />

        {/* AI assistant — secondary, below the canvas (kept available, not stacked above). */}
        <div className="mt-6">
          <AILessonAssistant
            lessonTitle={lessonForm.title}
            lessonContent={lessonForm.description}
            learningObjectives={lessonForm.learning_objectives}
            existingSlides={lessonForm.slides || []}
            onSlidesGenerated={(slides) => setLessonForm({ ...lessonForm, slides })}
          />
        </div>
      </div>
    </div>
  );
}