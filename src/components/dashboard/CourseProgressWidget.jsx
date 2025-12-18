import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Play, TrendingUp, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function CourseProgressWidget({ enrollments, courses }) {
  const { data: allLessons = [] } = useQuery({
    queryKey: ['all-lessons'],
    queryFn: async () => {
      const courseIds = enrollments.map(e => e.course_id);
      if (courseIds.length === 0) return [];
      const lessons = await Promise.all(
        courseIds.map(id => base44.entities.Lesson.filter({ course_id: id }, 'order', 100))
      );
      return lessons.flat();
    },
    enabled: enrollments.length > 0,
  });

  const inProgressEnrollments = enrollments.filter(e => !e.is_completed && (e.progress_percent || 0) > 0);
  
  if (inProgressEnrollments.length === 0) return null;

  const topCourse = inProgressEnrollments[0];
  const course = courses.find(c => c.id === topCourse.course_id);
  
  if (!course) return null;

  const courseLessons = allLessons.filter(l => l.course_id === course.id);
  const firstLesson = courseLessons[0];
  const lessonId = topCourse.current_lesson_id || firstLesson?.id;

  if (!lessonId) return null;

  const progressPercent = Math.round(topCourse.progress_percent || 0);
  const lessonsLeft = (course.total_lessons || 0) - (topCourse.completed_lessons?.length || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="p-6 border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-violet-50">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Continue Your Progress</h3>
            <p className="text-sm text-gray-600">You're {progressPercent}% through {course.title}</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              {lessonsLeft} lessons remaining
            </span>
            <span className="font-semibold text-indigo-600">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </div>

        <Link to={createPageUrl('LessonPlayer') + `?courseId=${course.id}&lessonId=${lessonId}`}>
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
            <Play className="w-4 h-4 mr-2" />
            Continue Learning
          </Button>
        </Link>
      </Card>
    </motion.div>
  );
}