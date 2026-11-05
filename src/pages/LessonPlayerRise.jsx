import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
const _w = (I) => ({ size, color, className, style, ...r }) => <I className={className} style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const ArrowLeft = _w(ArrowBackIcon), X = _w(CloseIcon);
import { createPageUrl } from '@/utils';
import RiseLessonSidebar from '@/components/lesson/RiseLessonSidebar';
import RiseLessonContent from '@/components/lesson/RiseLessonContent';
import RiseLessonHeader from '@/components/lesson/RiseLessonHeader';
import { useSCORMTracking } from '@/components/lesson/SCORMTracker';
import { useLessonProgressTracking } from '@/components/analytics/ProgressTracker';

export default function LessonPlayerRise() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  
  // Accept both param spellings: this page links to itself with ?lessonId/?courseId,
  // but LessonPlayer and the rest of the app navigate with ?lesson/?course.
  const lessonId = searchParams.get('lessonId') || searchParams.get('lesson');
  const courseId = searchParams.get('courseId') || searchParams.get('course');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState({});
  const { scormReady, trackProgress, markComplete: scormMarkComplete } = useSCORMTracking(lessonId, courseId);
  const { recordSlideView, recordSectionExpanded, recordInteraction, markLessonComplete } = useLessonProgressTracking(lessonId, courseId);

  // Fetch lesson data
  const { data: lesson, isLoading: lessonLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => base44.entities.Lesson.filter({ id: lessonId }),
    enabled: !!lessonId,
    select: (data) => data?.[0],
  });

  // Fetch course data
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => base44.entities.Course.filter({ id: courseId }),
    enabled: !!courseId,
    select: (data) => data?.[0],
  });

  // Fetch all course lessons for sidebar
  const { data: courseLessons = [] } = useQuery({
    queryKey: ['courseLessons', courseId],
    queryFn: () => base44.entities.Lesson.filter({ course_id: courseId }, 'order', 100),
    enabled: !!courseId,
  });

  // Fetch user enrollment
  const { data: enrollment, refetch: refetchEnrollment } = useQuery({
    queryKey: ['enrollment', courseId],
    queryFn: async () => {
      const user = await base44.auth.me();
      const enrollments = await base44.entities.Enrollment.filter({ course_id: courseId, created_by: user.email });
      return enrollments?.[0];
    },
    enabled: !!courseId,
  });

  // Mark lesson complete
  const markCompleteMutation = useMutation({
    mutationFn: async () => {
      if (!enrollment) return;
      const completedLessons = enrollment.completed_lessons || [];
      if (!completedLessons.includes(lessonId)) {
        await base44.entities.Enrollment.update(enrollment.id, {
          completed_lessons: [...completedLessons, lessonId],
          progress_percent: Math.round(((completedLessons.length + 1) / courseLessons.length) * 100),
          current_lesson_id: lessonId,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollment', courseId]);
    }
  });

  // Track progress when slide changes
  useEffect(() => {
    if (scormReady && lesson?.slides) {
      trackProgress(currentSlideIndex + 1, lesson.slides.length);
    }
    // Record slide view for analytics
    recordSlideView(currentSlideIndex);
  }, [currentSlideIndex, scormReady, lesson?.slides, trackProgress, recordSlideView]);

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
    // Record interaction
    recordInteraction();
    recordSectionExpanded(sectionKey);
  };

  const handleNextLesson = () => {
    const currentIndex = courseLessons.findIndex(l => l.id === lessonId);
    if (currentIndex < courseLessons.length - 1) {
      // Track completion in SCORM
      if (scormReady) {
        scormMarkComplete(100);
      }
      // Track analytics
      markLessonComplete();
      markCompleteMutation.mutate();
      const nextLesson = courseLessons[currentIndex + 1];
      navigate(`${createPageUrl('LessonPlayerRise')}?lessonId=${nextLesson.id}&courseId=${courseId}`);
    }
  };

  const handlePrevLesson = () => {
    const currentIndex = courseLessons.findIndex(l => l.id === lessonId);
    if (currentIndex > 0) {
      const prevLesson = courseLessons[currentIndex - 1];
      navigate(`${createPageUrl('LessonPlayerRise')}?lessonId=${prevLesson.id}&courseId=${courseId}`);
    }
  };

  if (lessonLoading || courseLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson || !course) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-muted-foreground">Lesson not found</p>
      </div>
    );
  }

  const currentLessonIndex = courseLessons.findIndex(l => l.id === lessonId);
  const isLastLesson = currentLessonIndex === courseLessons.length - 1;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <RiseLessonSidebar 
        course={course}
        lessons={courseLessons}
        currentLessonId={lessonId}
        enrollment={enrollment}
        onLessonSelect={(newLessonId) => {
          navigate(`${createPageUrl('LessonPlayerRise')}?lessonId=${newLessonId}&courseId=${courseId}`);
        }}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <RiseLessonHeader 
          course={course}
          lesson={lesson}
          currentIndex={currentLessonIndex}
          totalLessons={courseLessons.length}
          onBackClick={() => navigate(createPageUrl('CourseDetails') + `?id=${courseId}`)}
          onExitClick={() => navigate(createPageUrl('Dashboard'))}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-card">
          <RiseLessonContent 
            lesson={lesson}
            expandedSections={expandedSections}
            onToggleSection={toggleSection}
          />
        </div>

        {/* Footer Navigation */}
        <div className="bg-card border-t border-gray-200 px-6 py-4 flex justify-between items-center">
          <button
            onClick={handlePrevLesson}
            disabled={currentLessonIndex === 0}
            className="px-6 py-2 text-muted-foreground hover:bg-gray-100 disabled:opacity-50 rounded-lg transition"
          >
            ← Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Lesson {currentLessonIndex + 1} of {courseLessons.length}
          </span>
          <button
            onClick={handleNextLesson}
            className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition"
          >
            {isLastLesson ? 'Complete Course' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}