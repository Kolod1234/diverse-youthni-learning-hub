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
  const inProgressEnrollments = enrollments.filter(e => !e.is_completed && (e.progress_percent || 0) > 0);
  const topCourse = inProgressEnrollments[0];
  const course = courses.find(c => c.id === topCourse?.course_id);

  if (inProgressEnrollments.length === 0 || !course) return null;

  const { data: courseLessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ['lessons', course.id],
    queryFn: () => base44.entities.Lesson.filter({ course_id: course.id }, 'order', 100),
  });

  const firstLesson = courseLessons[0];
  const lessonId = topCourse?.current_lesson_id || firstLesson?.id;

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

        {lessonsLoading ? (
          <Button className="w-full bg-gray-300" disabled>
            <Play className="w-4 h-4 mr-2" />
            Loading...
          </Button>
        ) : lessonId ? (
          <Link to={createPageUrl('LessonPlayer') + `?courseId=${course.id}&lessonId=${lessonId}`}>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
              <Play className="w-4 h-4 mr-2" />
              Continue Learning
            </Button>
          </Link>
        ) : (
          <Link to={createPageUrl('CourseDetails') + `?id=${course.id}`}>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
              View Course
            </Button>
          </Link>
        )}
      </Card>
    </motion.div>
  );
}