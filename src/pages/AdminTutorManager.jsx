import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  Search, BookOpen, Users, Calendar, MessageSquare,
  X, Plus, Send, Clock, CheckCircle, AlertTriangle, GraduationCap,
  Loader2, Eye, Bell, ChevronRight, BookMarked
} from 'lucide-react';

const MAX_TUTORS_PER_COURSE = 2;

export default function AdminTutorManager() {
  const [activeTab, setActiveTab] = useState('assignments');
  const [searchCourse, setSearchCourse] = useState('');
  const [searchTutor, setSearchTutor] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [reminderSubject, setReminderSubject] = useState('');
  const [reminderBody, setReminderBody] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [activityTutor, setActivityTutor] = useState(null);

  const queryClient = useQueryClient();

  // ── Data fetching ──
  const { data: allUsers = [] } = useQuery({
    queryKey: ['admin-all-users'],
    queryFn: () => base44.entities.User.list('-created_date', 500),
  });

  const tutors = allUsers.filter(u => u.is_tutor || u.role === 'admin');

  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ['admin-all-courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 300),
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['admin-all-bookings'],
    queryFn: () => base44.entities.SessionBooking.list('-created_date', 500),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['admin-all-sessions'],
    queryFn: () => base44.entities.VideoSession.list('-created_date', 300),
  });

  const { data: availability = [] } = useQuery({
    queryKey: ['admin-tutor-availability'],
    queryFn: () => base44.entities.TutorAvailability.list('-created_date', 500),
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['admin-submissions'],
    queryFn: () => base44.entities.Submission.list('-created_date', 300),
  });

  // ── Mutations ──
  const assignMutation = useMutation({
    mutationFn: ({ courseId, tutorEmail, tutorName, currentTutors, currentNames }) => {
      const updated = [...(currentTutors || []), tutorEmail];
      const updatedNames = [...(currentNames || []), tutorName];
      return base44.entities.Course.update(courseId, {
        assigned_tutors: updated,
        assigned_tutor_names: updatedNames,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-all-courses']);
      toast.success('Tutor assigned successfully!');
    },
    onError: () => toast.error('Failed to assign tutor'),
  });

  const unassignMutation = useMutation({
    mutationFn: ({ courseId, tutorEmail, currentTutors, currentNames, tutors: tutorUsers }) => {
      const idx = currentTutors.indexOf(tutorEmail);
      const updatedTutors = currentTutors.filter((_, i) => i !== idx);
      const updatedNames = (currentNames || []).filter((_, i) => i !== idx);
      return base44.entities.Course.update(courseId, {
        assigned_tutors: updatedTutors,
        assigned_tutor_names: updatedNames,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-all-courses']);
      toast.success('Tutor unassigned');
    },
    onError: () => toast.error('Failed to unassign tutor'),
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ tutorEmail, content, subject }) =>
      base44.integrations.Core.SendEmail({
        to: tutorEmail,
        subject: subject || 'Message from Admin',
        body: content,
        from_name: 'Diverse Youth NI Admin',
      }),
    onSuccess: () => {
      toast.success('Message sent!');
      setShowChatModal(false);
      setShowReminderModal(false);
      setChatMessage('');
      setReminderSubject('');
      setReminderBody('');
    },
    onError: () => toast.error('Failed to send message'),
  });

  // ── Helpers ──
  const filteredCourses = courses.filter(c =>
    c.title?.toLowerCase().includes(searchCourse.toLowerCase()) ||
    c.category?.toLowerCase().includes(searchCourse.toLowerCase())
  );

  const filteredTutors = tutors.filter(t =>
    t.full_name?.toLowerCase().includes(searchTutor.toLowerCase()) ||
    t.email?.toLowerCase().includes(searchTutor.toLowerCase())
  );

  const handleAssign = (course, tutor) => {
    const current = course.assigned_tutors || [];
    if (current.includes(tutor.email)) {
      toast.error('Tutor already assigned to this course');
      return;
    }
    if (current.length >= MAX_TUTORS_PER_COURSE) {
      toast.error(`Maximum of ${MAX_TUTORS_PER_COURSE} tutors per course allowed`);
      return;
    }
    assignMutation.mutate({
      courseId: course.id,
      tutorEmail: tutor.email,
      tutorName: tutor.full_name,
      currentTutors: current,
      currentNames: course.assigned_tutor_names || [],
    });
  };

  const handleUnassign = (course, tutorEmail) => {
    unassignMutation.mutate({
      courseId: course.id,
      tutorEmail,
      currentTutors: course.assigned_tutors || [],
      currentNames: course.assigned_tutor_names || [],
    });
  };

  const sendReminder = (tutor) => {
    if (!reminderSubject || !reminderBody) {
      toast.error('Please fill in subject and message');
      return;
    }
    sendMessageMutation.mutate({
      tutorEmail: tutor.email,
      subject: reminderSubject,
      content: reminderBody,
    });
  };

  const sendChat = (tutor) => {
    if (!chatMessage.trim()) return;
    sendMessageMutation.mutate({
      tutorEmail: tutor.email,
      subject: 'Message from Admin',
      content: chatMessage,
    });
  };

  const getTutorStats = (tutor) => {
    const tutorBookings = bookings.filter(b => b.tutor_email === tutor.email);
    const tutorSessions = sessions.filter(s => s.tutor_email === tutor.email);
    const tutorAvailability = availability.filter(a => a.tutor_email === tutor.email);
    const assignedCourses = courses.filter(c => (c.assigned_tutors || []).includes(tutor.email));
    const pendingBookings = tutorBookings.filter(b => b.status === 'pending');
    const upcomingSessions = tutorSessions.filter(s =>
      s.status === 'scheduled' && new Date(s.scheduled_date) >= new Date()
    );
    return { tutorBookings, tutorSessions, tutorAvailability, assignedCourses, pendingBookings, upcomingSessions };
  };

  const ungradedSubmissions = submissions.filter(s => s.status === 'submitted' && !s.grade);

  const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  const tabs = [
    { id: 'assignments', label: 'Course Assignments', icon: BookOpen },
    { id: 'activity', label: 'Tutor Activity', icon: Users },
    { id: 'calendar', label: 'Availability & Calendar', icon: Calendar },
    { id: 'reminders', label: 'Reminders & Coursework', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tutor Management</h1>
          <p className="text-gray-500 mt-1">Assign courses, monitor activity, and communicate with tutors</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Tutors', value: tutors.length, color: 'bg-blue-50 text-blue-700', icon: GraduationCap },
            { label: 'Courses Assigned', value: courses.filter(c => (c.assigned_tutors || []).length > 0).length, color: 'bg-green-50 text-green-700', icon: BookOpen },
            { label: 'Pending Bookings', value: bookings.filter(b => b.status === 'pending').length, color: 'bg-amber-50 text-amber-700', icon: Clock },
            { label: 'Ungraded Work', value: ungradedSubmissions.length, color: 'bg-red-50 text-red-700', icon: AlertTriangle },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={`rounded-xl p-4 ${stat.color} border border-current/10`}>
                <Icon className="w-5 h-5 mb-2 opacity-70" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm font-medium opacity-80">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ══ TAB: Course Assignments ══ */}
        {activeTab === 'assignments' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Courses Panel */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900 mb-3">Courses</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search courses..."
                    value={searchCourse}
                    onChange={e => setSearchCourse(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                {loadingCourses ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : filteredCourses.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">No courses found</div>
                ) : filteredCourses.map(course => {
                  const assignedCount = (course.assigned_tutors || []).length;
                  const isSelected = selectedCourse?.id === course.id;
                  return (
                    <div
                      key={course.id}
                      onClick={() => setSelectedCourse(isSelected ? null : course)}
                      className={`p-4 cursor-pointer transition-all hover:bg-blue-50 ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {course.thumbnail
                            ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                            : <BookMarked className="w-5 h-5 text-blue-500" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{course.title}</p>
                          <p className="text-xs text-gray-500 capitalize mt-0.5">{course.category?.replace(/_/g, ' ')}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge
                            className={assignedCount >= MAX_TUTORS_PER_COURSE
                              ? 'bg-red-100 text-red-700 text-xs'
                              : assignedCount > 0
                                ? 'bg-green-100 text-green-700 text-xs'
                                : 'bg-gray-100 text-gray-600 text-xs'
                            }
                          >
                            {assignedCount}/{MAX_TUTORS_PER_COURSE} tutors
                          </Badge>
                        </div>
                      </div>

                      {/* Assigned tutors */}
                      {(course.assigned_tutors || []).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1 ml-13">
                          {(course.assigned_tutors || []).map((email, idx) => (
                            <div key={email} className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                              <span>{course.assigned_tutor_names?.[idx] || email}</span>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  if (confirm('Unassign this tutor from the course?')) {
                                    handleUnassign(course, email);
                                  }
                                }}
                                className="ml-1 text-blue-600 hover:text-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tutors Panel */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900 mb-1">Tutors</h2>
                {selectedCourse ? (
                  <p className="text-xs text-blue-600 mb-3">
                    Assigning to: <strong>{selectedCourse.title}</strong>
                    {(selectedCourse.assigned_tutors || []).length >= MAX_TUTORS_PER_COURSE && (
                      <span className="ml-2 text-red-500">(Max tutors reached)</span>
                    )}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mb-3">Select a course on the left to assign a tutor</p>
                )}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search tutors..."
                    value={searchTutor}
                    onChange={e => setSearchTutor(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                {filteredTutors.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">No tutors found</div>
                ) : filteredTutors.map(tutor => {
                  const isAssigned = selectedCourse && (selectedCourse.assigned_tutors || []).includes(tutor.email);
                  const canAssign = selectedCourse &&
                    !isAssigned &&
                    (selectedCourse.assigned_tutors || []).length < MAX_TUTORS_PER_COURSE;
                  const assignedCourseCount = courses.filter(c => (c.assigned_tutors || []).includes(tutor.email)).length;

                  return (
                    <div key={tutor.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={tutor.avatar} />
                          <AvatarFallback className="bg-indigo-100 text-indigo-600 text-sm">
                            {tutor.full_name?.charAt(0) || 'T'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{tutor.full_name}</p>
                          <p className="text-xs text-gray-500 truncate">{tutor.email}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{assignedCourseCount} course{assignedCourseCount !== 1 ? 's' : ''} assigned</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {selectedCourse && (
                            isAssigned ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
                                onClick={() => {
                                  if (confirm('Unassign this tutor?')) handleUnassign(selectedCourse, tutor.email);
                                }}
                                disabled={unassignMutation.isPending}
                              >
                                <X className="w-3 h-3 mr-1" /> Unassign
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                                onClick={() => handleAssign(selectedCourse, tutor)}
                                disabled={!canAssign || assignMutation.isPending}
                              >
                                <Plus className="w-3 h-3 mr-1" /> Assign
                              </Button>
                            )
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => { setSelectedTutor(tutor); setShowChatModal(true); }}
                          >
                            <MessageSquare className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB: Tutor Activity ══ */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            {tutors.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center text-gray-400">
                <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No tutors found</p>
              </div>
            ) : tutors.map(tutor => {
              const stats = getTutorStats(tutor);
              const isExpanded = activityTutor?.id === tutor.id;
              return (
                <div key={tutor.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div
                    className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50"
                    onClick={() => setActivityTutor(isExpanded ? null : tutor)}
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={tutor.avatar} />
                      <AvatarFallback className="bg-indigo-100 text-indigo-600">{tutor.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{tutor.full_name}</p>
                      <p className="text-sm text-gray-500">{tutor.email}</p>
                    </div>
                    <div className="flex gap-4 text-center">
                      {[
                        { label: 'Courses', value: stats.assignedCourses.length },
                        { label: 'Bookings', value: stats.tutorBookings.length },
                        { label: 'Sessions', value: stats.tutorSessions.length },
                        { label: 'Pending', value: stats.pendingBookings.length, highlight: stats.pendingBookings.length > 0 },
                      ].map(s => (
                        <div key={s.label} className="hidden sm:block">
                          <p className={`text-lg font-bold ${s.highlight ? 'text-amber-600' : 'text-gray-900'}`}>{s.value}</p>
                          <p className="text-xs text-gray-500">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={e => { e.stopPropagation(); setSelectedTutor(tutor); setShowChatModal(true); }}
                      >
                        <MessageSquare className="w-3 h-3 mr-1" /> Chat
                      </Button>
                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-100 p-5 bg-gray-50">
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Assigned Courses */}
                        <div>
                          <h4 className="font-medium text-gray-700 text-sm mb-2 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-blue-500" /> Assigned Courses
                          </h4>
                          {stats.assignedCourses.length === 0 ? (
                            <p className="text-xs text-gray-400">No courses assigned</p>
                          ) : (
                            <div className="space-y-1">
                              {stats.assignedCourses.map(c => (
                                <div key={c.id} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 text-sm">
                                  <BookMarked className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                                  <span className="truncate text-gray-800">{c.title}</span>
                                  <Badge className="ml-auto text-xs bg-gray-100 text-gray-600 capitalize">{c.category?.replace(/_/g, ' ')}</Badge>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Upcoming Sessions */}
                        <div>
                          <h4 className="font-medium text-gray-700 text-sm mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-500" /> Upcoming Sessions ({stats.upcomingSessions.length})
                          </h4>
                          {stats.upcomingSessions.length === 0 ? (
                            <p className="text-xs text-gray-400">No upcoming sessions</p>
                          ) : (
                            <div className="space-y-1">
                              {stats.upcomingSessions.slice(0, 5).map(s => (
                                <div key={s.id} className="bg-white rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                                  <Clock className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                                  <span className="truncate text-gray-800">{s.title}</span>
                                  <span className="ml-auto text-xs text-gray-500 flex-shrink-0">{s.scheduled_date}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Pending Bookings */}
                        {stats.pendingBookings.length > 0 && (
                          <div className="md:col-span-2">
                            <h4 className="font-medium text-amber-700 text-sm mb-2 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" /> Pending Booking Requests ({stats.pendingBookings.length})
                            </h4>
                            <div className="space-y-1">
                              {stats.pendingBookings.slice(0, 5).map(b => (
                                <div key={b.id} className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                                  <span className="font-medium text-amber-800">{b.student_name}</span>
                                  <span className="text-amber-600">→</span>
                                  <span className="text-amber-700 truncate">{b.subject || 'Session'}</span>
                                  <span className="ml-auto text-xs text-amber-600 flex-shrink-0">{b.booking_date}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ══ TAB: Availability & Calendar ══ */}
        {activeTab === 'calendar' && (
          <div className="space-y-4">
            {tutors.map(tutor => {
              const tutorAvail = availability.filter(a => a.tutor_email === tutor.email);
              const tutorSessions = sessions.filter(s => s.tutor_email === tutor.email && s.status === 'scheduled');
              if (tutorAvail.length === 0 && tutorSessions.length === 0) return null;
              return (
                <div key={tutor.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-gray-50">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={tutor.avatar} />
                      <AvatarFallback className="bg-indigo-100 text-indigo-600 text-sm">{tutor.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{tutor.full_name}</p>
                      <p className="text-xs text-gray-500">{tutor.email}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-auto text-xs"
                      onClick={() => { setSelectedTutor(tutor); setShowChatModal(true); }}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" /> Message
                    </Button>
                  </div>
                  <div className="p-4">
                    {tutorAvail.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Weekly Availability</h4>
                        <div className="grid grid-cols-7 gap-1">
                          {DAYS.map(day => {
                            const slots = tutorAvail.filter(a => a.day_of_week === day && a.is_active);
                            return (
                              <div key={day} className={`rounded-lg p-2 text-center text-xs ${slots.length > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                                <p className="font-medium text-gray-700 capitalize mb-1">{day.slice(0, 3)}</p>
                                {slots.map((s, i) => (
                                  <p key={i} className="text-green-700 leading-tight">{s.start_time}–{s.end_time}</p>
                                ))}
                                {slots.length === 0 && <p className="text-gray-400">–</p>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {tutorSessions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Scheduled Sessions</h4>
                        <div className="space-y-1">
                          {tutorSessions.slice(0, 5).map(s => (
                            <div key={s.id} className="flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-lg px-3 py-2 text-sm">
                              <Calendar className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                              <span className="font-medium text-purple-800 truncate">{s.title}</span>
                              <span className="ml-auto text-xs text-purple-600 flex-shrink-0">{s.scheduled_date} {s.scheduled_time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {tutors.every(t => availability.filter(a => a.tutor_email === t.email).length === 0 && sessions.filter(s => s.tutor_email === t.email).length === 0) && (
              <div className="bg-white rounded-xl p-12 text-center text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No availability or session data found for any tutor</p>
              </div>
            )}
          </div>
        )}

        {/* ══ TAB: Reminders & Coursework ══ */}
        {activeTab === 'reminders' && (
          <div className="space-y-6">
            {/* Ungraded Submissions */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">Ungraded Student Submissions</h2>
                  <p className="text-sm text-gray-500">{ungradedSubmissions.length} submissions awaiting assessment</p>
                </div>
                {ungradedSubmissions.length > 0 && (
                  <Badge className="bg-red-100 text-red-700">{ungradedSubmissions.length} pending</Badge>
                )}
              </div>
              {ungradedSubmissions.length === 0 ? (
                <div className="py-12 text-center">
                  <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
                  <p className="text-gray-500">All submissions have been graded!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                  {ungradedSubmissions.slice(0, 20).map(sub => (
                    <div key={sub.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                      <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{sub.title || 'Submission'}</p>
                        <p className="text-xs text-gray-500">By: {sub.student_name || sub.created_by}</p>
                      </div>
                      <p className="text-xs text-gray-400 flex-shrink-0">
                        {sub.submitted_date ? new Date(sub.submitted_date).toLocaleDateString('en-GB') : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Send Reminder to Tutors */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Send Assessment Reminder</h2>
                <p className="text-sm text-gray-500">Remind tutors to grade student coursework</p>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Subject</label>
                  <Input
                    value={reminderSubject}
                    onChange={e => setReminderSubject(e.target.value)}
                    placeholder="e.g. Please assess pending student submissions"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Message</label>
                  <Textarea
                    value={reminderBody}
                    onChange={e => setReminderBody(e.target.value)}
                    placeholder="Write your reminder message here..."
                    rows={4}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Send to Tutor</p>
                  <div className="grid sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {tutors.map(tutor => (
                      <button
                        key={tutor.id}
                        onClick={() => {
                          if (!reminderSubject || !reminderBody) {
                            toast.error('Please fill in subject and message first');
                            return;
                          }
                          if (confirm(`Send reminder to ${tutor.full_name}?`)) {
                            sendMessageMutation.mutate({
                              tutorEmail: tutor.email,
                              subject: reminderSubject,
                              content: reminderBody,
                            });
                          }
                        }}
                        disabled={sendMessageMutation.isPending}
                        className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-left transition-all"
                      >
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage src={tutor.avatar} />
                          <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs">{tutor.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{tutor.full_name}</p>
                          <p className="text-xs text-gray-500 truncate">{tutor.email}</p>
                        </div>
                        <Send className="w-4 h-4 text-blue-500 ml-auto flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Chat Modal ── */}
      {showChatModal && selectedTutor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowChatModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 p-5 border-b border-gray-100">
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedTutor.avatar} />
                <AvatarFallback className="bg-indigo-100 text-indigo-600">{selectedTutor.full_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900">Message {selectedTutor.full_name}</p>
                <p className="text-xs text-gray-500">{selectedTutor.email}</p>
              </div>
              <button onClick={() => setShowChatModal(false)} className="ml-auto text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <Textarea
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                placeholder="Type your message to this tutor..."
                rows={5}
                autoFocus
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => sendChat(selectedTutor)}
                  disabled={!chatMessage.trim() || sendMessageMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {sendMessageMutation.isPending
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                    : <><Send className="w-4 h-4 mr-2" /> Send Message</>
                  }
                </Button>
                <Button variant="outline" onClick={() => setShowChatModal(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}