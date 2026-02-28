import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Calendar, Clock, User, CheckCircle, Users, BookOpen, Search, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays, parse, isBefore, startOfDay, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isSameMonth, isToday } from 'date-fns';
import TutorChatWidget from '@/components/chat/TutorChatWidget';

const DAY_NAMES = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_MAP = { 0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday' };

export default function BookSession() {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1); // 1: tutor, 2: type+date, 3: confirm
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [sessionType, setSessionType] = useState('one_on_one');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');
  const [tutorSearch, setTutorSearch] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser);
    // Pre-select tutor if passed via URL param
    const params = new URLSearchParams(window.location.search);
    const tutorEmail = params.get('tutor');
    if (tutorEmail) {
      // Will be resolved once allTutors loads
      setTutorSearch('');
      setPendingTutorEmail(tutorEmail);
    }
  }, []);

  const [pendingTutorEmail, setPendingTutorEmail] = useState(null);

  const { data: allTutors = [] } = useQuery({
    queryKey: ['all-tutors'],
    queryFn: async () => {
      const users = await base44.entities.User.list('-created_date', 500);
      return users.filter(u => u.is_tutor === true || u.role === 'admin');
    },
    onSuccess: (tutors) => {
      if (pendingTutorEmail) {
        const found = tutors.find(t => t.email === pendingTutorEmail);
        if (found) { setSelectedTutor(found); setPendingTutorEmail(null); }
      }
    }
  });

  // Resolve pendingTutorEmail once tutors load
  useEffect(() => {
    if (pendingTutorEmail && allTutors.length > 0) {
      const found = allTutors.find(t => t.email === pendingTutorEmail);
      if (found) { setSelectedTutor(found); setPendingTutorEmail(null); }
    }
  }, [pendingTutorEmail, allTutors]);

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 200),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['all-reviews'],
    queryFn: () => base44.entities.Review.list('-created_date', 500),
  });

  const { data: availability = [] } = useQuery({
    queryKey: ['tutor-availability', selectedTutor?.email],
    queryFn: () => base44.entities.TutorAvailability.filter({ tutor_email: selectedTutor.email, is_active: true }),
    enabled: !!selectedTutor?.email,
  });

  const { data: existingBookings = [] } = useQuery({
    queryKey: ['tutor-bookings', selectedTutor?.email],
    queryFn: () => base44.entities.SessionBooking.filter({ tutor_email: selectedTutor.email }),
    enabled: !!selectedTutor?.email,
  });

  const { data: myBookings = [] } = useQuery({
    queryKey: ['my-bookings', user?.email],
    queryFn: () => base44.entities.SessionBooking.filter({ student_email: user.email }),
    enabled: !!user?.email,
  });

  const createBookingMutation = useMutation({
    mutationFn: (data) => base44.entities.SessionBooking.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tutor-bookings']);
      queryClient.invalidateQueries(['my-bookings']);
      toast.success('Booking request sent! Your tutor will confirm shortly.');
      navigate(createPageUrl('Dashboard'));
    },
  });

  const getTutorRating = (tutorEmail) => {
    const tutorReviews = reviews.filter(r => r.instructor_email === tutorEmail || courses.some(c => c.created_by === tutorEmail && c.id === r.course_id));
    if (!tutorReviews.length) return null;
    const avg = tutorReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / tutorReviews.length;
    return avg.toFixed(1);
  };

  const getTutorCourses = (tutorEmail) => courses.filter(c => c.created_by === tutorEmail);

  const getAvailableDaysInMonth = () => {
    const activeDays = availability.filter(a => a.is_active).map(a => a.day_of_week);
    return new Set(activeDays);
  };

  const isDayAvailable = (date) => {
    if (isBefore(date, startOfDay(new Date()))) return false;
    const dayName = DAY_MAP[getDay(date)];
    return availability.some(a => a.is_active && a.day_of_week === dayName);
  };

  const getAvailableSlots = (date) => {
    if (!date || !availability.length) return [];
    const dayName = DAY_MAP[getDay(date)];
    const dateStr = format(date, 'yyyy-MM-dd');
    const daySlots = availability.filter(a => a.is_active && a.day_of_week === dayName);

    const slots = [];
    daySlots.forEach(avail => {
      if (sessionType === 'group' && !avail.allows_group) return;
      const [startH, startM] = avail.start_time.split(':').map(Number);
      const [endH, endM] = avail.end_time.split(':').map(Number);
      const duration = avail.session_duration_minutes || 60;

      let curH = startH, curM = startM;
      while (curH * 60 + curM + duration <= endH * 60 + endM) {
        const timeStr = `${String(curH).padStart(2,'0')}:${String(curM).padStart(2,'0')}`;
        const displayH = curH > 12 ? curH - 12 : curH === 0 ? 12 : curH;
        const ampm = curH >= 12 ? 'PM' : 'AM';
        const display = `${displayH}:${String(curM).padStart(2,'0')} ${ampm}`;

        const isBooked = existingBookings.some(b =>
          b.booking_date === dateStr &&
          b.booking_time === timeStr &&
          (b.status === 'pending' || b.status === 'confirmed') &&
          (sessionType === 'one_on_one' || (b.session_type === 'group' && (b.group_participants || []).length >= (avail.max_group_size || 5)))
        );

        if (!isBooked) {
          slots.push({ time: timeStr, display, duration, allowsGroup: avail.allows_group, maxGroup: avail.max_group_size || 5 });
        }

        curM += duration;
        if (curM >= 60) { curH += Math.floor(curM / 60); curM = curM % 60; }
      }
    });
    return slots;
  };

  const handleBookSession = () => {
    if (!selectedTutor || !selectedDate || !selectedSlot) {
      toast.error('Please complete all required fields');
      return;
    }
    const tutorCourses = getTutorCourses(selectedTutor.email);
    const course = tutorCourses.find(c => c.id === selectedCourse);

    createBookingMutation.mutate({
      tutor_email: selectedTutor.email,
      tutor_name: selectedTutor.full_name,
      student_email: user.email,
      student_name: user.full_name,
      session_type: sessionType,
      course_id: selectedCourse || null,
      course_title: course?.title || null,
      subject: subject || course?.title || 'General',
      booking_date: format(selectedDate, 'yyyy-MM-dd'),
      booking_time: selectedSlot.time,
      duration_minutes: selectedSlot.duration || 60,
      notes,
      status: 'pending',
      max_students: sessionType === 'group' ? (selectedSlot.maxGroup || 5) : 1,
      group_participants: sessionType === 'group' ? [user.email] : [],
    });
  };

  // Calendar rendering
  const renderCalendar = () => {
    const start = startOfMonth(calendarMonth);
    const end = endOfMonth(calendarMonth);
    const days = eachDayOfInterval({ start, end });
    const startPad = getDay(start) === 0 ? 6 : getDay(start) - 1;

    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setCalendarMonth(addMonths(calendarMonth, -1))} className="p-1 hover:bg-gray-100 rounded">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-gray-900">{format(calendarMonth, 'MMMM yyyy')}</span>
          <button onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))} className="p-1 hover:bg-gray-100 rounded">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-1">
          {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => <div key={d} className="py-1 font-medium">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array(startPad).fill(null).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map(day => {
            const avail = isDayAvailable(day);
            const selected = selectedDate && isSameDay(day, selectedDate);
            const today = isToday(day);
            return (
              <button
                key={day.toISOString()}
                onClick={() => { if (avail) { setSelectedDate(day); setSelectedSlot(null); }}}
                disabled={!avail}
                className={`py-2 rounded-lg text-sm font-medium transition-all
                  ${selected ? 'bg-purple-600 text-white' : ''}
                  ${!selected && avail ? 'hover:bg-purple-100 text-gray-900 cursor-pointer' : ''}
                  ${!selected && avail && today ? 'ring-2 ring-purple-400' : ''}
                  ${!avail ? 'text-gray-300 cursor-not-allowed' : ''}
                `}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-purple-600 rounded-full inline-block"></span> Selected</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-200 rounded-full inline-block"></span> Unavailable</span>
        </div>
      </div>
    );
  };

  const filteredTutors = allTutors.filter(t =>
    !tutorSearch || t.full_name?.toLowerCase().includes(tutorSearch.toLowerCase()) ||
    t.tutor_subjects?.some(s => s.toLowerCase().includes(tutorSearch.toLowerCase()))
  );

  const availableSlots = selectedDate ? getAvailableSlots(selectedDate) : [];

  // --- Upcoming bookings ---
  const upcomingBookings = myBookings.filter(b => b.status !== 'cancelled').sort((a, b) => a.booking_date > b.booking_date ? 1 : -1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl('Tutors')}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tutors
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              Book a Session
            </h1>
            <p className="text-gray-500 mt-1">Schedule a 1-on-1 or group session with a tutor</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-1 space-y-5">
            {/* Tutor Search & Selection */}
            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-purple-600" /> Choose Tutor
              </h3>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <Input
                  value={tutorSearch}
                  onChange={e => setTutorSearch(e.target.value)}
                  placeholder="Search tutors or subjects..."
                  className="pl-9 text-sm"
                />
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredTutors.map(tutor => {
                  const rating = getTutorRating(tutor.email);
                  const tutorCourses = getTutorCourses(tutor.email);
                  return (
                    <button
                      key={tutor.email}
                      onClick={() => { setSelectedTutor(tutor); setSelectedDate(null); setSelectedSlot(null); setSelectedCourse(null); }}
                      className={`w-full p-3 rounded-lg border-2 transition text-left ${
                        selectedTutor?.email === tutor.email
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-sm">{tutor.full_name?.charAt(0) || 'T'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{tutor.full_name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {rating && (
                              <span className="flex items-center gap-0.5 text-xs text-amber-600">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {rating}
                              </span>
                            )}
                            <span className="text-xs text-gray-400">{tutorCourses.length} course{tutorCourses.length !== 1 ? 's' : ''}</span>
                          </div>
                          {tutor.tutor_subjects?.length > 0 && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{tutor.tutor_subjects.slice(0, 2).join(', ')}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
                {filteredTutors.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No tutors found</p>
                )}
              </div>
            </Card>

            {/* Session Type */}
            {selectedTutor && (
              <Card className="p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Session Type</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setSessionType('one_on_one'); setSelectedSlot(null); }}
                    className={`p-3 rounded-lg border-2 transition text-center ${sessionType === 'one_on_one' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}
                  >
                    <User className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                    <p className="text-xs font-medium text-gray-900">1-on-1</p>
                    <p className="text-xs text-gray-400">Private</p>
                  </button>
                  <button
                    onClick={() => { setSessionType('group'); setSelectedSlot(null); }}
                    className={`p-3 rounded-lg border-2 transition text-center ${sessionType === 'group' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}
                  >
                    <Users className="w-5 h-5 mx-auto mb-1 text-indigo-500" />
                    <p className="text-xs font-medium text-gray-900">Group</p>
                    <p className="text-xs text-gray-400">Shared</p>
                  </button>
                </div>
              </Card>
            )}

            {/* Course (optional) */}
            {selectedTutor && getTutorCourses(selectedTutor.email).length > 0 && (
              <Card className="p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-600" /> Related Course (Optional)
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className={`w-full p-2 rounded-lg border text-left text-sm transition ${!selectedCourse ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}
                  >
                    <span className="text-gray-500">No specific course</span>
                  </button>
                  {getTutorCourses(selectedTutor.email).map(course => (
                    <button
                      key={course.id}
                      onClick={() => setSelectedCourse(course.id)}
                      className={`w-full p-2 rounded-lg border text-left text-sm transition ${selectedCourse === course.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}
                    >
                      {course.title}
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* My Upcoming Bookings */}
            {upcomingBookings.length > 0 && (
              <Card className="p-5">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">My Upcoming Bookings</h3>
                <div className="space-y-2">
                  {upcomingBookings.slice(0, 3).map(b => (
                    <div key={b.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-xs font-medium text-gray-900">{b.tutor_name || b.tutor_email}</p>
                        <p className="text-xs text-gray-500">{b.booking_date} · {b.booking_time}</p>
                      </div>
                      <Badge className={
                        b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        b.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        b.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }>{b.status}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Panel: Calendar + Slots */}
          <div className="lg:col-span-2 space-y-5">
            {selectedTutor ? (
              <>
                {/* Calendar */}
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-600" /> Select a Date
                  </h3>
                  {availability.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No availability set</p>
                      <p className="text-sm text-gray-400">This tutor hasn't set their availability yet</p>
                    </div>
                  ) : (
                    renderCalendar()
                  )}
                </Card>

                {/* Time Slots */}
                {selectedDate && (
                  <Card className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-600" /> 
                      Available Times · {format(selectedDate, 'EEEE, MMMM d')}
                    </h3>
                    {availableSlots.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {availableSlots.map((slot, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-3 rounded-lg border-2 transition text-center ${
                              selectedSlot?.time === slot.time
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            <p className="text-sm font-semibold text-gray-900">{slot.display}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{slot.duration} min</p>
                            {sessionType === 'group' && slot.allowsGroup && (
                              <p className="text-xs text-indigo-500 mt-0.5">Group</p>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">No available slots for this date</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {sessionType === 'group' ? 'Try switching to 1-on-1 or pick another date' : 'Try a different date'}
                        </p>
                      </div>
                    )}
                  </Card>
                )}

                {/* Notes & Subject */}
                {selectedSlot && (
                  <Card className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Session Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Topic / Subject *</label>
                        <Input
                          value={subject}
                          onChange={e => setSubject(e.target.value)}
                          placeholder="e.g. Algebra, Essay Writing, Revision..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes for Tutor (Optional)</label>
                        <Textarea
                          value={notes}
                          onChange={e => setNotes(e.target.value)}
                          placeholder="What would you like to cover? Any specific questions?"
                          rows={3}
                        />
                      </div>
                    </div>
                  </Card>
                )}

                {/* Booking Summary */}
                {selectedSlot && (
                  <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600" /> Booking Summary
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3 mb-5">
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Tutor</p>
                        <p className="font-medium text-gray-900">{selectedTutor.full_name}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Session Type</p>
                        <p className="font-medium text-gray-900 capitalize">{sessionType === 'one_on_one' ? '1-on-1 Private' : 'Group Session'}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Date & Time</p>
                        <p className="font-medium text-gray-900">{format(selectedDate, 'EEE, MMM d')} · {selectedSlot.display}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Duration</p>
                        <p className="font-medium text-gray-900">{selectedSlot.duration || 60} minutes</p>
                      </div>
                      {subject && (
                        <div className="bg-white rounded-lg p-3 sm:col-span-2">
                          <p className="text-xs text-gray-500 mb-1">Topic</p>
                          <p className="font-medium text-gray-900">{subject}</p>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={handleBookSession}
                      disabled={createBookingMutation.isPending || !subject.trim()}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3"
                    >
                      {createBookingMutation.isPending ? 'Sending...' : (
                        <><CheckCircle className="w-4 h-4 mr-2" /> Send Booking Request</>
                      )}
                    </Button>
                    {!subject.trim() && (
                      <p className="text-xs text-red-500 mt-2 text-center">Please enter a topic/subject to continue</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2 text-center">Your tutor will confirm this request</p>
                  </Card>
                )}
              </>
            ) : (
              <Card className="p-16 text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Tutor</h3>
                <p className="text-gray-500">Choose a tutor from the list to see their availability and book a session</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}