import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, Users, Video, MessageSquare, TrendingUp, 
  Award, ArrowRight, Calendar, FileText, BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function TutorDashboardOverview() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: myCourses = [] } = useQuery({
    queryKey: ['my-courses', user?.email],
    queryFn: () => base44.entities.Course.filter({ created_by: user?.email }, '-created_date', 100),
    enabled: !!user?.email,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['course-enrollments'],
    queryFn: () => base44.entities.Enrollment.list('-created_date', 1000),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['tutor-messages', user?.email],
    queryFn: () => base44.entities.Message.filter({ recipient_email: user?.email, is_read: false }),
    enabled: !!user?.email,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['tutor-sessions', user?.email],
    queryFn: () => base44.entities.VideoSession.filter({ tutor_email: user?.email }),
    enabled: !!user?.email,
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['pending-submissions'],
    queryFn: () => base44.entities.Submission.filter({ is_graded: false }),
  });

  // Calculate stats
  const totalStudents = enrollments.filter(e => 
    myCourses.some(c => c.id === e.course_id)
  ).length;

  const avgCompletionRate = enrollments.filter(e => 
    myCourses.some(c => c.id === e.course_id)
  ).reduce((acc, e) => acc + (e.progress_percent || 0), 0) / totalStudents || 0;

  const upcomingSessions = sessions.filter(s => 
    s.status === 'scheduled' && new Date(s.scheduled_date) >= new Date()
  );

  const pendingSubmissions = submissions.filter(sub =>
    myCourses.some(c => {
      // Check if submission is for an assignment in tutor's courses
      return true; // You'd need assignment course mapping
    })
  );

  const stats = [
    { label: 'Active Courses', value: myCourses.length, icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Students', value: totalStudents, icon: Users, color: 'bg-purple-50 text-purple-600' },
    { label: 'Avg Completion', value: `${Math.round(avgCompletionRate)}%`, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
    { label: 'Upcoming Sessions', value: upcomingSessions.length, icon: Video, color: 'bg-orange-50 text-orange-600' },
  ];

  if (!user || !user.is_tutor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tutor Access Only</h2>
            <p className="text-gray-600">You need tutor privileges to access this page.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.full_name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500">Here's an overview of your teaching activities</p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-4">
                  <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Courses */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>
                <Link to={createPageUrl('TutorDashboard')}>
                  <Button variant="outline" size="sm">
                    Manage All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              
              {myCourses.length > 0 ? (
                <div className="space-y-3">
                  {myCourses.slice(0, 3).map((course) => {
                    const courseEnrollments = enrollments.filter(e => e.course_id === course.id);
                    const avgProgress = courseEnrollments.reduce((acc, e) => acc + (e.progress_percent || 0), 0) / courseEnrollments.length || 0;
                    
                    return (
                      <Link key={course.id} to={createPageUrl('TutorCourseManager') + `?courseId=${course.id}`}>
                        <Card className="p-4 hover:shadow-md transition-all cursor-pointer">
                          <div className="flex gap-4">
                            <img src={course.thumbnail} alt={course.title} className="w-16 h-16 rounded-lg object-cover" />
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 mb-1">{course.title}</h3>
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  {courseEnrollments.length} students
                                </span>
                                <span>•</span>
                                <span>{Math.round(avgProgress)}% avg completion</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No courses yet</p>
                  <Link to={createPageUrl('TutorDashboard')}>
                    <Button className="mt-4">Create Your First Course</Button>
                  </Link>
                </div>
              )}
            </Card>

            {/* Upcoming Sessions */}
            {upcomingSessions.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Upcoming Sessions</h2>
                  <Link to={createPageUrl('TutorSessionsDashboard')}>
                    <Button variant="outline" size="sm">
                      View All
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
                
                <div className="space-y-3">
                  {upcomingSessions.slice(0, 3).map((session) => (
                    <Card key={session.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 mb-1">{session.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            {session.scheduled_date} at {session.scheduled_time}
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700">
                          {session.invited_students?.length || 0} students
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link to={createPageUrl('TutorDashboard')}>
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Create Course
                  </Button>
                </Link>
                <Link to={createPageUrl('ScheduleSession')}>
                  <Button variant="outline" className="w-full justify-start">
                    <Video className="w-4 h-4 mr-2" />
                    Schedule Session
                  </Button>
                </Link>
                <Link to={createPageUrl('MessageCenter')}>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Messages
                    {messages.length > 0 && (
                      <Badge className="ml-auto bg-red-500">{messages.length}</Badge>
                    )}
                  </Button>
                </Link>
                <Link to={createPageUrl('TutorDashboard') + '#analytics'}>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Pending Tasks */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Pending Tasks</h3>
              <div className="space-y-3">
                {messages.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700">Unread Messages</span>
                    </div>
                    <Badge>{messages.length}</Badge>
                  </div>
                )}
                {pendingSubmissions.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-gray-700">Assignments to Grade</span>
                    </div>
                    <Badge>{pendingSubmissions.length}</Badge>
                  </div>
                )}
                {messages.length === 0 && pendingSubmissions.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    All caught up! 🎉
                  </p>
                )}
              </div>
            </Card>

            {/* Performance */}
            <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Keep it up!</p>
                  <p className="text-sm text-gray-600">Your courses are doing great</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-indigo-600 mb-1">
                {Math.round(avgCompletionRate)}%
              </div>
              <p className="text-sm text-gray-600">Average student completion rate</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}