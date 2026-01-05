import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { BookOpen, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function UpcomingLessonsWidget() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: enrollments = [] } = useQuery({
    queryKey: ['my-enrollments', user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ created_by: user?.email }),
    enabled: !!user
  });

  const { data: allLessons = [] } = useQuery({
    queryKey: ['all-lessons'],
    queryFn: () => base44.entities.Lesson.list('order', 1000)
  });

  const upcomingLessons = enrollments.flatMap(enrollment => {
    const courseLessons = allLessons.filter(l => l.course_id === enrollment.course_id);
    const nextLesson = courseLessons.find(l => !enrollment.completed_lessons?.includes(l.id));
    return nextLesson ? [{ ...nextLesson, enrollment }] : [];
  }).slice(0, 3);

  if (!user || upcomingLessons.length === 0) return null;

  return (
    <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-emerald-400" />
        <h3 className="font-bold text-white">Upcoming Lessons</h3>
      </div>
      <div className="space-y-2">
        {upcomingLessons.map((lesson) => (
          <Link
            key={lesson.id}
            to={`${createPageUrl('LessonPlayer')}?course=${lesson.course_id}&lesson=${lesson.id}`}
          >
            <div className="bg-slate-800/50 hover:bg-slate-700/50 p-3 rounded-lg transition-all cursor-pointer group">
              <p className="text-sm font-medium text-white mb-1 line-clamp-1 group-hover:text-emerald-400">
                {lesson.title}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {lesson.duration_minutes || 10} min
                </span>
                <ChevronRight className="w-4 h-4 group-hover:text-emerald-400" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}