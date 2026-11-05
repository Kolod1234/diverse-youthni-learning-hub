import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Lock, Unlock, Key, ChevronRight, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function UnlockLessonsView({ courses }) {
  const queryClient = useQueryClient();
  const [expandedCourseId, setExpandedCourseId] = React.useState(null);

  const { data: allLessons = [] } = useQuery({
    queryKey: ['unlock-lessons-all', courses.map(c => c.id).join(',')],
    queryFn: async () => {
      if (courses.length === 0) return [];
      const results = await Promise.all(
        courses.map(c => base44.entities.Lesson.filter({ course_id: c.id }, 'order', 100))
      );
      return results.flat();
    },
    enabled: courses.length > 0,
  });

  const updateLessonMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lesson.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['unlock-lessons-all']);
      toast.success('Lesson updated!');
    },
  });

  const togglePreview = (lesson) => {
    updateLessonMutation.mutate({ id: lesson.id, data: { is_preview: !lesson.is_preview } });
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Unlock Lessons</h1>
      <p className="text-gray-500 mb-6">Control which lessons students can access for free preview vs. requiring enrolment. You can only manage lessons in your assigned courses.</p>

      {courses.length === 0 ? (
        <div className="bg-card border border-gray-200 rounded-xl p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No courses assigned to you yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map(course => {
            const courseLessons = allLessons.filter(l => l.course_id === course.id).sort((a, b) => (a.order || 0) - (b.order || 0));
            const unlockedCount = courseLessons.filter(l => l.is_preview).length;
            const isExpanded = expandedCourseId === course.id;

            return (
              <div key={course.id} className="bg-card border border-gray-200 rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-500 capitalize">{course.category?.replace(/_/g, ' ')} · {courseLessons.length} lessons · {unlockedCount} unlocked</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-200">
                    {courseLessons.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">No lessons in this course yet.</p>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {courseLessons.map((lesson, idx) => (
                          <div key={lesson.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-400 w-5">{idx + 1}</span>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{lesson.title}</p>
                                <p className="text-xs text-gray-500">{lesson.section || 'General'} · {lesson.duration_minutes || 10} min</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {lesson.is_preview ? (
                                <span className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                  <Unlock className="w-3 h-3" /> Free Preview
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                  <Lock className="w-3 h-3" /> Enrolled Only
                                </span>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => togglePreview(lesson)}
                                disabled={updateLessonMutation.isPending}
                                className={lesson.is_preview ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-green-600 border-green-200 hover:bg-green-50'}
                              >
                                {lesson.is_preview ? <><Lock className="w-3 h-3 mr-1" />Lock</> : <><Unlock className="w-3 h-3 mr-1" />Unlock</>}
                              </Button>
                              <Link to={createPageUrl('LessonEditor') + `?id=${lesson.id}`}>
                                <Button size="sm" variant="ghost" className="text-xs text-blue-600">Edit</Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                      <Link to={createPageUrl('TutorCourseManager') + `?courseId=${course.id}`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          <Key className="w-3 h-3 mr-1" /> Manage Full Course Content
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}