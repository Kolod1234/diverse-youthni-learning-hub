import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { BookOpen, Award, Clock } from 'lucide-react';

export default function EnrolledCourses({ user }) {
  const { data: enrollments = [] } = useQuery({
    queryKey: ['user-enrollments', user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ created_by: user.email }),
    enabled: !!user?.email,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 100),
  });

  const enrolledCourses = enrollments.map(enrollment => {
    const course = courses.find(c => c.id === enrollment.course_id);
    return { ...enrollment, course };
  }).filter(e => e.course);

  const inProgress = enrolledCourses.filter(e => !e.is_completed);
  const completed = enrolledCourses.filter(e => e.is_completed);

  return (
    <div className="space-y-6">
      {inProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>In Progress ({inProgress.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {inProgress.map(({ course, progress_percent, completed_lessons }) => (
              <div key={course.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-indigo-600 flex-shrink-0">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{course.instructor}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{Math.round(progress_percent || 0)}%</span>
                    </div>
                    <Progress value={progress_percent || 0} className="h-2" />
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {completed_lessons?.length || 0} lessons completed
                      </span>
                    </div>
                  </div>
                  <Link to={createPageUrl('CourseDetails') + `?id=${course.id}`}>
                    <Button size="sm" className="mt-3">Continue Learning</Button>
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {completed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              Completed ({completed.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {completed.map(({ course, completed_date }) => (
              <div key={course.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-indigo-600 flex-shrink-0">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                      <p className="text-sm text-gray-500">{course.instructor}</p>
                      {completed_date && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Completed {new Date(completed_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                      Completed
                    </div>
                  </div>
                  <Link to={createPageUrl('CourseDetails') + `?id=${course.id}`}>
                    <Button size="sm" variant="outline" className="mt-3">Review Course</Button>
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {enrolledCourses.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Enrolled Courses</h3>
            <p className="text-gray-500 mb-4">Start your learning journey today!</p>
            <Link to={createPageUrl('Explore')}>
              <Button>Browse Courses</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}