import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Play, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function ProgressCard({ enrollment, course, index = 0 }) {
  const { data: courseLessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ['lessons', course?.id],
    queryFn: () => base44.entities.Lesson.filter({ course_id: course.id }, 'order', 100),
    enabled: !!course?.id,
  });

  if (!course) return null;

  const firstLesson = courseLessons[0];
  const lessonId = enrollment?.current_lesson_id || firstLesson?.id;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white">
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-48 h-32 sm:h-auto relative overflow-hidden">
            <img
              src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            {enrollment.is_completed && (
              <div className="absolute inset-0 bg-emerald-500/90 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  {course.instructor}
                </p>
              </div>
              <span className="text-sm font-bold text-indigo-600">
                {Math.round(enrollment.progress_percent || 0)}%
              </span>
            </div>
            
            <div className="mb-3">
              <Progress 
                value={enrollment.progress_percent || 0} 
                className="h-2.5"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  {(enrollment.completed_lessons?.length || 0)}/{course.total_lessons || 0} lessons
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {Math.round((course.duration_hours || 0) * (1 - (enrollment.progress_percent || 0) / 100))}h left
                </span>
              </div>
              
              {lessonsLoading ? (
                <Button size="sm" className="bg-gray-300 rounded-full" disabled>
                  <Play className="w-4 h-4 mr-1" />
                  Loading...
                </Button>
              ) : lessonId ? (
                <Link to={createPageUrl('LessonPlayer') + `?courseId=${course.id}&lessonId=${lessonId}`}>
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 rounded-full">
                    <Play className="w-4 h-4 mr-1" />
                    {enrollment.is_completed ? 'Review' : 'Continue'}
                  </Button>
                </Link>
              ) : (
                <Link to={createPageUrl('CourseDetails') + `?id=${course.id}`}>
                  <Button size="sm" variant="outline" className="rounded-full">
                    View Course
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}