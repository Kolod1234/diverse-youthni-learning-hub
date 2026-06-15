import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen, Users, Video, MessageSquare, TrendingUp, Award,
  ArrowRight, Calendar, FileText, BarChart3, Plus, Clock,
  CheckCircle2, Star, GraduationCap, Zap, ChevronRight,
  BookMarked, UserCheck, Lock, Unlock, Key
} from 'lucide-react';
import { motion } from 'framer-motion';
import TutorGoogleConnect from '@/components/tutor/TutorGoogleConnect';
import { classifySessions, getTodayActiveSessions } from '@/components/tutor/sessionClassifier';


export default function TutorDashboardOverview() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(userData => {
      setUser(userData);
      if (userData?.is_tutor && !userData?.onboarding_completed && userData?.role !== 'admin') {
        navigate(createPageUrl('TutorOnboarding'));
      }
    });
  }, []);

  // Only courses the admin explicitly assigned to this tutor (via course.assigned_tutors).
  // Approved subjects do NOT auto-add courses here.
  // Query key v2 to bust any stale cache from older filter logic.
  const { data: allCourses = [] } = useQuery({
    queryKey: ['tutor-assigned-courses-v2', user?.email, user?.role],
    queryFn: async () => {
      if (user?.role === 'admin') {
        return base44.entities.Course.list('-created_date', 200);
      }
      // Server-side filter is the source of truth — only fetch courses where
      // this tutor's email is in assigned_tutors. No client-side broadening.
      return base44.entities.Course.filter({ assigned_tutors: user.email }, '-created_date', 200);
    },
    enabled: !!user,
  });

  const myCourses = allCourses;

  const { data: lessonsByCourse = {} } = useQuery({
    queryKey: ['tutor-course-lessons', myCourses.map(c => c.id).join(',')],
    queryFn: async () => {
      if (myCourses.length === 0) return {};
      const results = await Promise.all(
        myCourses.map(async (course) => {
          const lessons = await base44.entities.Lesson.filter({ course_id: course.id }, 'order', 500);
          return [course.id, lessons];
        })
      );
      return Object.fromEntries(results);
    },
    enabled: myCourses.length > 0,
  });

  // Enrollments across tutor's courses
  const { data: enrollments = [] } = useQuery({
    queryKey: ['tutor-course-enrollments', myCourses.map(c => c.id).join(',')],
    queryFn: async () => {
      if (myCourses.length === 0) return [];
      const results = await Promise.all(
        myCourses.map(c => base44.entities.Enrollment.filter({ course_id: c.id }, '-created_date', 200))
      );
      return results.flat();
    },
    enabled: myCourses.length > 0,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['tutor-unread-messages', user?.email],
    queryFn: () => base44.entities.Message.filter({ recipient_email: user?.email, is_read: false }),
    enabled: !!user?.email,
  });

  // Tutor Home is strictly personal: every viewer (including admins who also teach)
  // sees only sessions/bookings where tutor_email matches their own email.
  // Do NOT broaden to all sessions for admin role here — that's TutorSessionsDashboard's job.
  const { data: sessions = [] } = useQuery({
    queryKey: ['tutor-sessions', user?.email],
    queryFn: () => base44.entities.VideoSession.filter({ tutor_email: user?.email }, '-scheduled_date', 50),
    enabled: !!user?.email,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['tutor-bookings', user?.email],
    queryFn: () => base44.entities.SessionBooking.filter({ tutor_email: user?.email }, '-created_date', 50),
    enabled: !!user?.email,
  });

  // Derived stats
  const myCourseIds = myCourses.map(c => c.id);
  const myEnrollments = enrollments;
  const totalStudents = new Set(myEnrollments.map(e => e.created_by)).size;
  const completedCount = myEnrollments.filter(e => e.is_completed).length;
  const avgCompletion = myEnrollments.length > 0
    ? Math.round(myEnrollments.reduce((s, e) => s + (e.progress_percent || 0), 0) / myEnrollments.length)
    : 0;

  // Shared classifier — includes currently running 'live' sessions and uses
  // start+duration to drop expired records. See components/tutor/sessionClassifier.js
  const { upcoming: allUpcomingSessions } = classifySessions(sessions);
  const upcomingSessions = allUpcomingSessions.slice(0, 5);

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  // Today banner must only count active/upcoming sessions dated today —
  // never completed, cancelled, or already-ended.
  const todaySessions = getTodayActiveSessions(sessions);

  if (!user) return null;

  const isTutor = user.is_tutor || user.role === 'admin';
  if (!isTutor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tutor Access Only</h2>
          <p className="text-gray-500">You need tutor privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Assigned Courses', value: myCourses.length, icon: BookOpen, color: 'from-blue-500 to-blue-600' },
    { label: 'Total Students', value: totalStudents, icon: Users, color: 'from-violet-500 to-purple-600' },
    { label: 'Avg Completion', value: `${avgCompletion}%`, icon: TrendingUp, color: 'from-emerald-500 to-green-600' },
    { label: 'Upcoming Sessions', value: allUpcomingSessions.length, icon: Video, color: 'from-orange-500 to-amber-500' },
  ];

  const quickActions = [
    { label: 'Schedule Session', icon: Video, href: createPageUrl('ScheduleSession'), color: 'bg-purple-600 hover:bg-purple-700 text-white' },
    { label: 'Manage Bookings', icon: Calendar, href: createPageUrl('TutorBookingManager'), color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
    { label: 'Lesson Editor', icon: FileText, href: createPageUrl('LessonEditor'), color: 'bg-amber-600 hover:bg-amber-700 text-white' },
    { label: 'Quiz Generator', icon: Zap, href: createPageUrl('QuizGenerator'), color: 'bg-pink-600 hover:bg-pink-700 text-white' },
    { label: 'Unlock Lessons', icon: Key, href: createPageUrl('TutorDashboard') + '?view=unlock', color: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
    { label: 'Messages', icon: MessageSquare, href: createPageUrl('MessageCenter'), color: 'bg-slate-700 hover:bg-slate-800 text-white', badge: messages.length || null },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-blue-300 text-sm font-medium mb-1">Tutor Home</p>
                <h1 className="text-3xl font-bold">
                  Welcome, {user?.full_name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-slate-300 mt-1 text-sm">
                  {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>

              </div>
              <div className="flex gap-3 flex-wrap">
                <Link to={createPageUrl('TutorDashboard')}>
                  <Button className="bg-white text-slate-900 hover:bg-slate-100 font-semibold">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Course Dashboard
                  </Button>
                </Link>
                <Link to={createPageUrl('TutorSetup')}>
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stat Pills */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5"
                  >
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} mb-3`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-blue-200 text-sm mt-0.5">{stat.label}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT / MAIN */}
          <div className="lg:col-span-2 space-y-6">

            {/* Today's Sessions Alert */}
            {todaySessions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-5 text-white flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold">You have {todaySessions.length} session{todaySessions.length > 1 ? 's' : ''} today!</p>
                    <p className="text-emerald-100 text-sm">{todaySessions[0]?.title} at {todaySessions[0]?.scheduled_time}</p>
                  </div>
                </div>
                <Link to={createPageUrl('TutorSessionsDashboard')}>
                  <Button className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold" size="sm">View</Button>
                </Link>
              </motion.div>
            )}

            {/* Pending Bookings Alert */}
            {pendingBookings.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-900">{pendingBookings.length} booking request{pendingBookings.length > 1 ? 's' : ''} pending</p>
                    <p className="text-amber-600 text-sm">Students are waiting for your confirmation</p>
                  </div>
                </div>
                <Link to={createPageUrl('TutorBookingManager')}>
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white" size="sm">Review</Button>
                </Link>
              </div>
            )}

            {/* My Assigned Courses */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">My Assigned Courses</h2>
                  <p className="text-sm text-gray-500">{myCourses.length} course{myCourses.length !== 1 ? 's' : ''} to teach</p>
                </div>
                <Link to={createPageUrl('TutorDashboard')}>
                  <Button variant="outline" size="sm" className="gap-1">
                    Manage All <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>

              {myCourses.length === 0 ? (
                <div className="py-14 px-6 text-center text-gray-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="font-medium text-gray-600">No courses assigned</p>
                  <p className="text-sm mt-1 text-gray-500 max-w-md mx-auto">
                    Contact an admin to be assigned to a course, or open a course on{' '}
                    <Link to={createPageUrl('Explore')} className="text-blue-600 hover:underline">Explore</Link>
                    {' '}and use <strong>Request to Teach</strong>.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {myCourses.slice(0, 6).map((course, i) => {
                    const courseEnrollments = enrollments.filter(e => e.course_id === course.id);
                    const courseLessons = lessonsByCourse[course.id] || [];
                    const avgProg = courseEnrollments.length > 0
                      ? Math.round(courseEnrollments.reduce((s, e) => s + (e.progress_percent || 0), 0) / courseEnrollments.length)
                      : 0;
                    return (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {course.thumbnail
                            ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                            : <BookMarked className="w-6 h-6 text-blue-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{course.title}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-1">
                            <span className="text-xs text-gray-500 capitalize">{course.category?.replace(/_/g, ' ')}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{courseLessons.length} lesson{courseLessons.length !== 1 ? 's' : ''}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Users className="w-3 h-3" /> {courseEnrollments.length} students
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{avgProg}% avg</span>
                          </div>
                        </div>
                        <Link to={createPageUrl('TutorCourseManager') + `?courseId=${course.id}`}>
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            Manage <ChevronRight className="w-4 h-4 ml-0.5" />
                          </Button>
                        </Link>
                      </motion.div>
                    );
                  })}
                  {myCourses.length > 6 && (
                    <div className="px-6 py-3 text-center">
                      <Link to={createPageUrl('TutorDashboard')}>
                        <Button variant="ghost" size="sm" className="text-blue-600">
                          View all {myCourses.length} courses <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Students Enrolled in My Courses */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">My Students</h2>
                  <p className="text-sm text-gray-500">{totalStudents} enrolled across all courses</p>
                </div>
                <Link to={createPageUrl('TutorDashboard') + '?view=people'}>
                  <Button variant="outline" size="sm" className="gap-1">
                    View All <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
              {totalStudents === 0 ? (
                <div className="py-10 text-center text-gray-400">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-medium text-gray-600">No students enrolled yet</p>
                </div>
              ) : (
                <div className="px-6 py-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-blue-700">{totalStudents}</p>
                      <p className="text-xs text-blue-600 mt-1">Total Students</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-green-700">{completedCount}</p>
                      <p className="text-xs text-green-600 mt-1">Completed</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-purple-700">{avgCompletion}%</p>
                      <p className="text-xs text-purple-600 mt-1">Avg Progress</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Upcoming Sessions */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Upcoming Sessions</h2>
                  <p className="text-sm text-gray-500">{allUpcomingSessions.length} scheduled</p>
                </div>
                <div className="flex gap-2">
                  <Link to={createPageUrl('ScheduleSession')}>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white gap-1">
                      <Plus className="w-3.5 h-3.5" /> Schedule
                    </Button>
                  </Link>
                  <Link to={createPageUrl('TutorSessionsDashboard')}>
                    <Button variant="outline" size="sm" className="gap-1">
                      View All <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
              {upcomingSessions.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <Video className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="font-medium text-gray-600 text-sm">No upcoming sessions</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {upcomingSessions.map(session => {
                    const course = myCourses.find(c => c.id === session.course_id);
                    return (
                      <div key={session.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Video className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{session.title}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(session.scheduled_date).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })} at {session.scheduled_time}
                            {course && <span className="ml-2 text-gray-400">• {course.title}</span>}
                          </p>
                        </div>
                        <Link to={createPageUrl('VideoSession') + `?id=${session.id}`}>
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">Start</Button>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map(action => {
                  const Icon = action.icon;
                  return (
                    <Link key={action.label} to={action.href} className="relative">
                      <button className={`w-full flex flex-col items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all ${action.color}`}>
                        <Icon className="w-5 h-5" />
                        <span className="text-xs leading-tight text-center">{action.label}</span>
                        {action.badge && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {action.badge}
                          </span>
                        )}
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>



            {/* Google Calendar Connection */}
            <TutorGoogleConnect />

            {/* Performance Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">Teaching Impact</p>
                  <p className="text-indigo-200 text-xs">Your performance at a glance</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-indigo-200 text-sm">Avg Completion</span>
                  <span className="font-bold text-xl">{avgCompletion}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full transition-all" style={{ width: `${avgCompletion}%` }} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-indigo-200">Completed</span>
                  <span className="font-semibold">{completedCount} / {myEnrollments.length}</span>
                </div>
              </div>
            </div>

            {/* Messages Preview */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  Messages
                </h3>
                {messages.length > 0 && (
                  <Badge className="bg-red-500 text-white border-0">{messages.length}</Badge>
                )}
              </div>
              {messages.length === 0 ? (
                <div className="py-8 text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">All caught up!</p>
                </div>
              ) : (
                <div>
                  {messages.slice(0, 3).map(msg => (
                    <div key={msg.id} className="px-5 py-3 border-b border-gray-50 hover:bg-gray-50">
                      <p className="text-sm font-medium text-gray-900 truncate">{msg.sender_name || msg.sender_email}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{msg.content}</p>
                    </div>
                  ))}
                  <div className="px-5 py-3">
                    <Link to={createPageUrl('MessageCenter')}>
                      <Button variant="outline" size="sm" className="w-full text-xs gap-1">
                        Open Messages <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Tutor Tools */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                Tutor Tools
              </h3>
              <div className="space-y-1">
                {[
                  { label: 'Availability & Calendar', href: createPageUrl('TutorSetup'), icon: Calendar },
                  { label: 'Booking Manager', href: createPageUrl('TutorBookingManager'), icon: CheckCircle2 },
                  { label: 'Grade Students', href: createPageUrl('TutorDashboard') + '?view=grades', icon: Award },
                  { label: 'Unlock Lessons', href: createPageUrl('TutorDashboard') + '?view=unlock', icon: Key },
                  { label: 'Course Analytics', href: createPageUrl('CourseAnalytics'), icon: BarChart3 },
                  { label: 'Message Center', href: createPageUrl('MessageCenter'), icon: MessageSquare },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.label} to={item.href}>
                      <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                        <Icon className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">{item.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300 ml-auto group-hover:text-blue-400 transition-colors" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}