import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Calendar, Clock, User, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays, parse, isAfter, isBefore } from 'date-fns';

export default function BookSession() {
  const [user, setUser] = useState(null);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  // Get enrolled courses
  const { data: enrollments = [] } = useQuery({
    queryKey: ['my-enrollments', user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  // Get courses
  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 100),
  });

  // Filter to tutors from enrolled courses
  const tutorEmails = [...new Set(
    enrollments
      .map(e => courses.find(c => c.id === e.course_id))
      .filter(Boolean)
      .map(c => c.created_by)
  )];

  const { data: tutors = [] } = useQuery({
    queryKey: ['tutors', tutorEmails],
    queryFn: async () => {
      const allUsers = await base44.entities.User.list('-created_date', 500);
      return allUsers.filter(u => tutorEmails.includes(u.email));
    },
    enabled: tutorEmails.length > 0,
  });

  // Get tutor availability
  const { data: availability = [] } = useQuery({
    queryKey: ['tutor-availability', selectedTutor?.email],
    queryFn: () => base44.entities.TutorAvailability.filter({ 
      tutor_email: selectedTutor.email,
      is_active: true 
    }),
    enabled: !!selectedTutor?.email,
  });

  // Get existing sessions
  const { data: existingSessions = [] } = useQuery({
    queryKey: ['tutor-sessions', selectedTutor?.email],
    queryFn: () => base44.entities.VideoSession.filter({ 
      tutor_email: selectedTutor.email,
      status: 'scheduled'
    }),
    enabled: !!selectedTutor?.email,
  });

  // Get existing bookings
  const { data: existingBookings = [] } = useQuery({
    queryKey: ['tutor-bookings', selectedTutor?.email],
    queryFn: () => base44.entities.SessionBooking.filter({ 
      tutor_email: selectedTutor.email,
      status: ['pending', 'confirmed']
    }),
    enabled: !!selectedTutor?.email,
  });

  const createBookingMutation = useMutation({
    mutationFn: (bookingData) => base44.entities.SessionBooking.create(bookingData),
    onSuccess: () => {
      queryClient.invalidateQueries(['tutor-bookings']);
      toast.success('Session booking request sent!');
      setSelectedSlot(null);
      setNotes('');
    },
  });

  // Get available slots for selected date
  const getAvailableSlots = () => {
    if (!selectedDate || !availability.length) return [];

    const dayName = format(selectedDate, 'EEEE').toLowerCase();
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    const dayAvailability = availability.filter(slot => slot.day_of_week === dayName);
    
    const allSlots = [];
    dayAvailability.forEach(slot => {
      const start = parse(slot.start_time, 'HH:mm', new Date());
      const end = parse(slot.end_time, 'HH:mm', new Date());
      
      let current = start;
      while (isBefore(current, end)) {
        const timeStr = format(current, 'HH:mm');
        
        // Check if slot is already booked
        const isBooked = existingSessions.some(s => 
          s.scheduled_date === dateStr && s.scheduled_time === timeStr
        ) || existingBookings.some(b => 
          b.booking_date === dateStr && b.booking_time === timeStr
        );
        
        if (!isBooked) {
          allSlots.push({
            time: timeStr,
            display: format(current, 'h:mm a')
          });
        }
        
        current = addDays(current, 0);
        current.setHours(current.getHours() + 1);
      }
    });
    
    return allSlots;
  };

  const handleBookSession = () => {
    if (!selectedSlot || !selectedCourse) {
      toast.error('Please select a course and time slot');
      return;
    }

    createBookingMutation.mutate({
      tutor_email: selectedTutor.email,
      student_email: user.email,
      course_id: selectedCourse,
      booking_date: format(selectedDate, 'yyyy-MM-dd'),
      booking_time: selectedSlot.time,
      duration_minutes: 60,
      notes,
    });
  };

  const availableSlots = getAvailableSlots();
  const tutorCourses = courses.filter(c => c.created_by === selectedTutor?.email);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={createPageUrl('Dashboard')}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            Book a Session
          </h1>
          <p className="text-gray-500">Schedule a one-on-one session with your tutor</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tutor Selection */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Select Tutor
              </h3>
              <div className="space-y-2">
                {tutors.map(tutor => (
                  <button
                    key={tutor.email}
                    onClick={() => {
                      setSelectedTutor(tutor);
                      setSelectedSlot(null);
                      setSelectedCourse(null);
                    }}
                    className={`w-full p-3 rounded-lg border-2 transition text-left ${
                      selectedTutor?.email === tutor.email
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-medium">
                          {tutor.full_name?.charAt(0) || 'T'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{tutor.full_name}</p>
                        <p className="text-xs text-gray-500">{tutor.email}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {selectedTutor && tutorCourses.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Select Course</h3>
                <div className="space-y-2">
                  {tutorCourses.map(course => (
                    <button
                      key={course.id}
                      onClick={() => setSelectedCourse(course.id)}
                      className={`w-full p-3 rounded-lg border-2 transition text-left ${
                        selectedCourse === course.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <p className="font-medium text-gray-900 text-sm">{course.title}</p>
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Date & Time Selection */}
          <div className="lg:col-span-2">
            {selectedTutor ? (
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Select Date & Time
                </h3>

                {/* Date Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={format(selectedDate, 'yyyy-MM-dd')}
                    onChange={(e) => {
                      setSelectedDate(new Date(e.target.value));
                      setSelectedSlot(null);
                    }}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                {/* Available Slots */}
                {availableSlots.length > 0 ? (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Available Time Slots
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                      {availableSlots.map((slot, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3 rounded-lg border-2 transition ${
                            selectedSlot?.time === slot.time
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <Clock className="w-4 h-4 mx-auto mb-1 text-gray-400" />
                          <p className="text-sm font-medium text-gray-900">{slot.display}</p>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No available slots for this date</p>
                    <p className="text-sm text-gray-400 mt-1">Try selecting a different date</p>
                  </div>
                )}

                {/* Notes */}
                {selectedSlot && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="What would you like to cover in this session?"
                      rows={3}
                    />
                  </div>
                )}

                {/* Submit */}
                {selectedSlot && selectedCourse && (
                  <Card className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-900">Booking Summary</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {format(selectedDate, 'EEEE, MMMM d, yyyy')} at {selectedSlot.display}
                        </p>
                        <p className="text-sm text-gray-600">
                          Duration: 1 hour
                        </p>
                      </div>
                      <Badge className="bg-purple-600">Pending Approval</Badge>
                    </div>
                    <Button
                      onClick={handleBookSession}
                      disabled={createBookingMutation.isPending}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      {createBookingMutation.isPending ? 'Booking...' : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Send Booking Request
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Your tutor will confirm this booking request
                    </p>
                  </Card>
                )}
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Tutor</h3>
                <p className="text-gray-500">Choose a tutor from your enrolled courses to get started</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}