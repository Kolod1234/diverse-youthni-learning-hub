import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Play, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function UpcomingLessonsWidget() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: enrollments = [], isLoading } = useQuery({
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

  if (isLoading) {
    return (
      <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-lg animate-pulse">
        <div className="h-6 bg-slate-700 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-slate-800/50 p-3 rounded-lg">
              <div className="h-4 bg-slate-700 rounded mb-2" />
              <div className="h-3 bg-slate-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!user || upcomingLessons.length === 0) {
    return (
      <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-white">Upcoming Lessons</h3>
        </div>
        <p className="text-slate-300 text-sm mb-3">No upcoming lessons. Explore courses to get started!</p>
        <Link to={createPageUrl('Explore')}>
          <Button variant="outline" size="sm" className="w-full bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
            Browse Courses
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-emerald-400" />
        <h3 className="font-bold text-white">Upcoming Lessons</h3>
      </div>
      <div className="space-y-2">
        {upcomingLessons.map((lesson, idx) => (
          <motion.div
            key={lesson.id}


          >
            <Link
              to={`${createPageUrl('LessonPlayer')}?course=${lesson.course_id}&lesson=${lesson.id}`}
              className="block"
            >
              <div className="bg-slate-800/50 hover:bg-slate-700/50 p-3 rounded-lg transition-all group">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-white line-clamp-1 group-hover:text-emerald-400 flex-1">
                    {lesson.title}
                  </p>
                  <Button 
                    size="icon" 
                    className="h-7 w-7 bg-emerald-600 hover:bg-emerald-500 ml-2 flex-shrink-0"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `${createPageUrl('LessonPlayer')}?course=${lesson.course_id}&lesson=${lesson.id}`;
                    }}
                  >
                    <Play className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {lesson.duration_minutes || 10} min
                  </span>
                  <div className="flex items-center gap-1">
                    Continue
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      <Link to={createPageUrl('Dashboard')}>
        <Button variant="link" className="w-full mt-3 text-emerald-400 hover:text-emerald-300 text-sm">
          View All Courses
        </Button>
      </Link>
    </Card>
  );
}