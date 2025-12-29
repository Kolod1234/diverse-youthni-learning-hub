import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CourseParticipantManager from '@/components/courses/CourseParticipantManager';
import { BookOpen, Users, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CourseParticipants() {
  const [user, setUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 100),
  });

  const { data: allEnrollments = [] } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: () => base44.entities.CourseEnrollment.list('-created_date', 1000),
    enabled: user?.role === 'admin' || user?.is_coordinator,
  });

  if (!user || (user.role !== 'admin' && !user.is_coordinator)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">Only admins and coordinators can access this page.</p>
        </Card>
      </div>
    );
  }

  if (selectedCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="outline"
            onClick={() => setSelectedCourse(null)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
          <CourseParticipantManager
            courseId={selectedCourse.id}
            courseName={selectedCourse.title}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Participants</h1>
          <p className="text-gray-600">Manage participant enrollments and groups</p>
        </div>

        <div className="grid gap-4">
          {courses.map(course => {
            const enrollmentCount = allEnrollments.filter(e => e.course_id === course.id).length;
            const activeCount = allEnrollments.filter(
              e => e.course_id === course.id && e.enrollment_status === 'active'
            ).length;

            return (
              <Card
                key={course.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedCourse(course)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{course.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-indigo-100 text-indigo-700">
                          <Users className="w-3 h-3 mr-1" />
                          {enrollmentCount} enrolled
                        </Badge>
                        <Badge className="bg-green-100 text-green-700">
                          {activeCount} active
                        </Badge>
                        {course.category && (
                          <Badge variant="outline">{course.category}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button>Manage</Button>
                </div>
              </Card>
            );
          })}
        </div>

        {courses.length === 0 && (
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courses Yet</h3>
            <p className="text-gray-600 mb-4">Create courses to start managing participants</p>
            <Link to={createPageUrl('TutorDashboard')}>
              <Button>Go to Course Manager</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}