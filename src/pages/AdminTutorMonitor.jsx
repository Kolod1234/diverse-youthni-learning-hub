import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  GraduationCap, Calendar, MessageSquare, BookOpen, Send, Bell,
  Clock, User, ChevronRight, Loader2, X, CheckCircle, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminTutorMonitor() {
  const queryClient = useQueryClient();
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [reminderOpen, setReminderOpen] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');
  const [reminderSubject, setReminderSubject] = useState('');

  // Fetch all tutors
  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users-for-monitor'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getAllTutors');
      return res.data?.users || [];
    },
  });

  const tutors = allUsers.filter(u => u.is_tutor || u.role === 'admin');

  // Fetch all courses (with assigned_tutors)
  const { data: courses = [] } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 500),
  });

  // Fetch tutor availability
  const { data: availability = [] } = useQuery({
    queryKey: ['all-tutor-availability'],
    queryFn: () => base44.entities.TutorAvailability.list('-created_date', 500),
  });

  // Fetch session bookings
  const { data: bookings = [] } = useQuery({
    queryKey: ['all-bookings'],
    queryFn: () => base44.entities.SessionBooking.list('-created_date', 500),
  });

  // Fetch ungraded submissions
  const { data: submissions = [] } = useQuery({
    queryKey: ['ungraded-submissions'],
    queryFn: () => base44.entities.Submission.filter({ is_graded: false }, '-created_date', 200),
  });

  // Fetch assignments for context
  const { data: assignments = [] } = useQuery({
    queryKey: ['all-assignments'],
    queryFn: () => base44.entities.Assignment.list('-created_date', 200),
  });

  // Chat room mutation
  const sendChatMutation = useMutation({
    mutationFn: async ({ tutorEmail, tutorName, message }) => {
      // Find or create direct chat room between admin and tutor
      const existing = await base44.entities.ChatRoom.filter({ type: 'direct' }, '-created_date', 500);
      let room = existing.find(r =>
        r.participant_emails?.includes(tutorEmail) &&
        r.participant_emails?.includes('admin')
      );
      if (!room) {
        room = await base44.entities.ChatRoom.create({
          type: 'direct',
          participant_emails: ['admin', tutorEmail],
          title: `Admin ↔ ${tutorName}`
        });
      }
      const me = await base44.auth.me();
      await base44.entities.ChatMessage.create({
        room_id: room.id,
        sender_email: me.email,
        sender_name: me.full_name || 'Admin',
        content: message,
        type: 'text'
      });
      await base44.entities.ChatRoom.update(room.id, {
        last_message: message,
        last_message_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      toast.success('Message sent to tutor');
      setChatMessage('');
      setChatOpen(false);
    },
    onError: () => toast.error('Failed to send message'),
  });

  // Email reminder mutation
  const sendReminderMutation = useMutation({
    mutationFn: async ({ tutorEmail, subject, body }) => {
      await base44.integrations.Core.SendEmail({
        to: tutorEmail,
        subject,
        body,
        from_name: 'Diverse Youth NI Admin'
      });
    },
    onSuccess: () => {
      toast.success('Reminder sent!');
      setReminderMessage('');
      setReminderSubject('');
      setReminderOpen(false);
    },
    onError: () => toast.error('Failed to send reminder'),
  });

  const getTutorCourses = (tutorEmail) =>
    courses.filter(c => c.assigned_tutors?.includes(tutorEmail));

  const getTutorAvailability = (tutorEmail) =>
    availability.filter(a => a.tutor_email === tutorEmail);

  const getTutorBookings = (tutorEmail) =>
    bookings.filter(b => b.tutor_email === tutorEmail);

  const getTutorUngradedCount = (tutorEmail) => {
    const tutorCourseIds = getTutorCourses(tutorEmail).map(c => c.id);
    const tutorAssignmentIds = assignments
      .filter(a => tutorCourseIds.includes(a.course_id))
      .map(a => a.id);
    return submissions.filter(s => tutorAssignmentIds.includes(s.assignment_id)).length;
  };

  const openChat = (tutor) => {
    setSelectedTutor(tutor);
    setChatOpen(true);
    setReminderOpen(false);
  };

  const openReminder = (tutor) => {
    setSelectedTutor(tutor);
    setReminderOpen(true);
    setChatOpen(false);
    const ungradedCount = getTutorUngradedCount(tutor.email);
    setReminderSubject('Reminder: Student Coursework Needs Assessment');
    setReminderMessage(
      `Hi ${tutor.full_name},\n\nThis is a reminder that you currently have ${ungradedCount} ungraded student submission(s) awaiting your assessment.\n\nPlease log in to the platform and review the outstanding work at your earliest convenience.\n\nThank you,\nAdmin Team`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tutor Monitor</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor tutor activity, calendars, and communicate with tutors</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Tutors</p>
                <p className="text-2xl font-bold">{tutors.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Bookings</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ungraded Submissions</p>
                <p className="text-2xl font-bold">{submissions.length}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tutor List */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Tutors</h2>
            {tutors.length === 0 && (
              <Card className="p-4 text-center text-gray-400 text-sm">No tutors found</Card>
            )}
            {tutors.map(tutor => {
              const ungradedCount = getTutorUngradedCount(tutor.email);
              const tutorCourseCount = getTutorCourses(tutor.email).length;
              return (
                <Card
                  key={tutor.id}
                  className={`p-3 cursor-pointer transition-all border-2 ${selectedTutor?.id === tutor.id ? 'border-indigo-500 bg-indigo-50' : 'border-transparent hover:border-indigo-200'}`}
                  onClick={() => { setSelectedTutor(tutor); setChatOpen(false); setReminderOpen(false); }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={tutor.avatar} />
                      <AvatarFallback className="bg-indigo-100 text-indigo-700">{tutor.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{tutor.full_name}</p>
                      <p className="text-xs text-gray-500 truncate">{tutor.email}</p>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="outline" className="text-xs py-0">{tutorCourseCount} courses</Badge>
                        {ungradedCount > 0 && (
                          <Badge className="text-xs py-0 bg-red-100 text-red-700">{ungradedCount} ungraded</Badge>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-2">
            {!selectedTutor ? (
              <Card className="p-10 text-center text-gray-400">
                <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Select a tutor to view their activity</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Tutor Header */}
                <Card className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={selectedTutor.avatar} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-700">{selectedTutor.full_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-gray-900">{selectedTutor.full_name}</h3>
                        <p className="text-sm text-gray-500">{selectedTutor.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openChat(selectedTutor)}>
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Chat
                      </Button>
                      <Button size="sm" className="bg-amber-500 hover:bg-amber-600" onClick={() => openReminder(selectedTutor)}>
                        <Bell className="w-4 h-4 mr-1" />
                        Send Reminder
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Chat Panel */}
                {chatOpen && (
                  <Card className="p-4 border-indigo-200 bg-indigo-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-indigo-600" />
                        Send Message to {selectedTutor.full_name}
                      </h4>
                      <Button variant="ghost" size="sm" onClick={() => setChatOpen(false)}><X className="w-4 h-4" /></Button>
                    </div>
                    <Textarea
                      value={chatMessage}
                      onChange={e => setChatMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={3}
                      className="mb-3 bg-white"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => setChatOpen(false)}>Cancel</Button>
                      <Button
                        size="sm"
                        className="bg-indigo-600"
                        disabled={!chatMessage.trim() || sendChatMutation.isPending}
                        onClick={() => sendChatMutation.mutate({ tutorEmail: selectedTutor.email, tutorName: selectedTutor.full_name, message: chatMessage })}
                      >
                        {sendChatMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
                        Send
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Reminder Panel */}
                {reminderOpen && (
                  <Card className="p-4 border-amber-200 bg-amber-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Bell className="w-4 h-4 text-amber-600" />
                        Assessment Reminder for {selectedTutor.full_name}
                      </h4>
                      <Button variant="ghost" size="sm" onClick={() => setReminderOpen(false)}><X className="w-4 h-4" /></Button>
                    </div>
                    <Input
                      value={reminderSubject}
                      onChange={e => setReminderSubject(e.target.value)}
                      placeholder="Email subject"
                      className="mb-2 bg-white"
                    />
                    <Textarea
                      value={reminderMessage}
                      onChange={e => setReminderMessage(e.target.value)}
                      placeholder="Reminder message..."
                      rows={5}
                      className="mb-3 bg-white"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => setReminderOpen(false)}>Cancel</Button>
                      <Button
                        size="sm"
                        className="bg-amber-500 hover:bg-amber-600"
                        disabled={!reminderMessage.trim() || sendReminderMutation.isPending}
                        onClick={() => sendReminderMutation.mutate({ tutorEmail: selectedTutor.email, subject: reminderSubject, body: reminderMessage })}
                      >
                        {sendReminderMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4 mr-1" />}
                        Send Email Reminder
                      </Button>
                    </div>
                  </Card>
                )}

                <Tabs defaultValue="courses">
                  <TabsList className="w-full">
                    <TabsTrigger value="courses" className="flex-1">
                      <BookOpen className="w-4 h-4 mr-1" />
                      Courses
                    </TabsTrigger>
                    <TabsTrigger value="availability" className="flex-1">
                      <Clock className="w-4 h-4 mr-1" />
                      Availability
                    </TabsTrigger>
                    <TabsTrigger value="bookings" className="flex-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      Bookings
                    </TabsTrigger>
                    <TabsTrigger value="coursework" className="flex-1">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Coursework
                    </TabsTrigger>
                  </TabsList>

                  {/* Assigned Courses */}
                  <TabsContent value="courses" className="mt-3 space-y-2">
                    {getTutorCourses(selectedTutor.email).length === 0 ? (
                      <Card className="p-6 text-center text-gray-400 text-sm">
                        No courses assigned to this tutor
                      </Card>
                    ) : (
                      getTutorCourses(selectedTutor.email).map(course => (
                        <Card key={course.id} className="p-3">
                          <div className="flex items-center gap-3">
                            {course.thumbnail && (
                              <img src={course.thumbnail} alt={course.title} className="w-12 h-10 object-cover rounded" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-sm">{course.title}</p>
                              <p className="text-xs text-gray-500 capitalize">{course.category?.replace(/_/g, ' ')} • {course.enrolled_count || 0} students</p>
                            </div>
                            <Badge variant="outline" className="text-xs">{course.qualification_type?.toUpperCase()}</Badge>
                          </div>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  {/* Availability */}
                  <TabsContent value="availability" className="mt-3 space-y-2">
                    {getTutorAvailability(selectedTutor.email).length === 0 ? (
                      <Card className="p-6 text-center text-gray-400 text-sm">
                        No availability slots configured
                      </Card>
                    ) : (
                      getTutorAvailability(selectedTutor.email).map(slot => (
                        <Card key={slot.id} className="p-3">
                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium">{slot.day_of_week} — {slot.start_time} to {slot.end_time}</p>
                              <p className="text-xs text-gray-500">{slot.session_type || 'Any'} • {slot.max_students || 1} student(s)</p>
                            </div>
                            <Badge className={`ml-auto text-xs ${slot.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {slot.is_active !== false ? 'Active' : 'Paused'}
                            </Badge>
                          </div>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  {/* Bookings Calendar */}
                  <TabsContent value="bookings" className="mt-3 space-y-2">
                    {getTutorBookings(selectedTutor.email).length === 0 ? (
                      <Card className="p-6 text-center text-gray-400 text-sm">
                        No bookings found for this tutor
                      </Card>
                    ) : (
                      getTutorBookings(selectedTutor.email).map(booking => (
                        <Card key={booking.id} className="p-3">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{booking.student_name || booking.student_email}</p>
                              <p className="text-xs text-gray-500">
                                {booking.session_date ? format(new Date(booking.session_date), 'MMM d, yyyy') : 'Date TBD'}
                                {booking.session_time ? ` at ${booking.session_time}` : ''}
                              </p>
                            </div>
                            <Badge className={`text-xs ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {booking.status || 'pending'}
                            </Badge>
                          </div>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  {/* Ungraded Coursework */}
                  <TabsContent value="coursework" className="mt-3 space-y-2">
                    {(() => {
                      const tutorCourseIds = getTutorCourses(selectedTutor.email).map(c => c.id);
                      const tutorAssignmentIds = assignments.filter(a => tutorCourseIds.includes(a.course_id)).map(a => a.id);
                      const ungradedSubs = submissions.filter(s => tutorAssignmentIds.includes(s.assignment_id));
                      return ungradedSubs.length === 0 ? (
                        <Card className="p-6 text-center text-sm">
                          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                          <p className="text-gray-400">All submissions graded — great work!</p>
                        </Card>
                      ) : (
                        ungradedSubs.map(sub => {
                          const assignment = assignments.find(a => a.id === sub.assignment_id);
                          return (
                            <Card key={sub.id} className="p-3 border-red-100">
                              <div className="flex items-center gap-3">
                                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{sub.student_name || sub.student_email}</p>
                                  <p className="text-xs text-gray-500">{assignment?.title || 'Assignment'}</p>
                                  <p className="text-xs text-gray-400">
                                    Submitted: {sub.submitted_date ? format(new Date(sub.submitted_date), 'MMM d, yyyy') : 'Unknown'}
                                  </p>
                                </div>
                                <Badge className="bg-red-100 text-red-700 text-xs">Ungraded</Badge>
                              </div>
                            </Card>
                          );
                        })
                      );
                    })()}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}