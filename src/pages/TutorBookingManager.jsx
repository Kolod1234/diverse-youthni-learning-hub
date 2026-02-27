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
import { 
  Calendar, Clock, User, CheckCircle, XCircle, Plus, Trash2, 
  Users, BookOpen, ArrowLeft, MessageSquare, Settings, ChevronDown 
} from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };

export default function TutorBookingManager() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('bookings');
  const [replyText, setReplyText] = useState({});
  const [meetingLinks, setMeetingLinks] = useState({});
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Availability form state
  const [newSlot, setNewSlot] = useState({ day_of_week: 'monday', start_time: '09:00', end_time: '17:00', session_duration_minutes: 60, allows_group: false, max_group_size: 5 });

  useEffect(() => {
    base44.auth.me().then(userData => {
      setUser(userData);
      if (!userData?.is_tutor && userData?.role !== 'admin') {
        navigate(createPageUrl('Home'));
      }
    });
  }, []);

  const { data: availability = [], isLoading: loadingAvail } = useQuery({
    queryKey: ['my-availability', user?.email],
    queryFn: () => base44.entities.TutorAvailability.filter({ tutor_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: bookings = [], isLoading: loadingBookings } = useQuery({
    queryKey: ['my-tutor-bookings', user?.email],
    queryFn: () => base44.entities.SessionBooking.filter({ tutor_email: user.email }, '-created_date', 100),
    enabled: !!user?.email,
  });

  const addSlotMutation = useMutation({
    mutationFn: (data) => base44.entities.TutorAvailability.create({ ...data, tutor_email: user.email }),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-availability']);
      toast.success('Availability slot added');
    },
  });

  const deleteSlotMutation = useMutation({
    mutationFn: (id) => base44.entities.TutorAvailability.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-availability']);
      toast.success('Slot removed');
    },
  });

  const toggleSlotMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.TutorAvailability.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries(['my-availability']),
  });

  const updateBookingMutation = useMutation({
    mutationFn: ({ id, ...data }) => base44.entities.SessionBooking.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-tutor-bookings']);
      toast.success('Booking updated');
    },
  });

  const handleConfirm = (booking) => {
    updateBookingMutation.mutate({
      id: booking.id,
      status: 'confirmed',
      tutor_notes: replyText[booking.id] || '',
      meeting_link: meetingLinks[booking.id] || '',
    });
  };

  const handleReject = (booking) => {
    updateBookingMutation.mutate({
      id: booking.id,
      status: 'cancelled',
      tutor_notes: replyText[booking.id] || 'Booking declined by tutor.',
    });
  };

  const handleComplete = (booking) => {
    updateBookingMutation.mutate({ id: booking.id, status: 'completed' });
  };

  const handleAddSlot = () => {
    if (!newSlot.start_time || !newSlot.end_time || newSlot.start_time >= newSlot.end_time) {
      toast.error('Please enter valid start and end times');
      return;
    }
    addSlotMutation.mutate(newSlot);
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  const getStatusColor = (status) => ({
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
  }[status] || 'bg-gray-100 text-gray-700');

  const BookingCard = ({ booking }) => {
    const isPending = booking.status === 'pending';
    const isConfirmed = booking.status === 'confirmed';
    const [expanded, setExpanded] = useState(isPending);

    return (
      <Card className={`p-4 border-l-4 ${isPending ? 'border-l-yellow-400' : isConfirmed ? 'border-l-green-400' : 'border-l-gray-300'}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-semibold text-gray-900">{booking.student_name || booking.student_email}</span>
              <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
              <Badge className="bg-purple-100 text-purple-700 text-xs">
                {booking.session_type === 'group' ? <><Users className="w-3 h-3 inline mr-1" />Group</> : <><User className="w-3 h-3 inline mr-1" />1-on-1</>}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {booking.booking_date}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {booking.booking_time}</span>
              <span>{booking.duration_minutes || 60} min</span>
              {booking.subject && <span className="text-purple-600 font-medium">· {booking.subject}</span>}
            </div>
            {booking.notes && (
              <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg p-2">
                <span className="font-medium">Student notes: </span>{booking.notes}
              </p>
            )}
          </div>
          <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-gray-600 mt-1">
            <ChevronDown className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {expanded && (isPending || isConfirmed) && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Reply / Notes to Student</label>
              <Textarea
                value={replyText[booking.id] || booking.tutor_notes || ''}
                onChange={e => setReplyText(prev => ({ ...prev, [booking.id]: e.target.value }))}
                placeholder="Add a note or instructions for the student..."
                rows={2}
                className="text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Meeting Link (Optional)</label>
              <Input
                value={meetingLinks[booking.id] || booking.meeting_link || ''}
                onChange={e => setMeetingLinks(prev => ({ ...prev, [booking.id]: e.target.value }))}
                placeholder="https://meet.google.com/..."
                className="text-sm"
              />
            </div>
            <div className="flex gap-2">
              {isPending && (
                <>
                  <Button
                    onClick={() => handleConfirm(booking)}
                    disabled={updateBookingMutation.isPending}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Confirm
                  </Button>
                  <Button
                    onClick={() => handleReject(booking)}
                    disabled={updateBookingMutation.isPending}
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Decline
                  </Button>
                </>
              )}
              {isConfirmed && (
                <>
                  <Button onClick={() => handleConfirm(booking)} size="sm" variant="outline" className="text-blue-600 border-blue-300">
                    Update Notes
                  </Button>
                  <Button onClick={() => handleComplete(booking)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Mark Complete
                  </Button>
                  <Button onClick={() => handleReject(booking)} size="sm" variant="outline" className="text-red-600 border-red-300">
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl('TutorDashboardOverview')}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              Session Management
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage your availability and student bookings</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Pending', value: pendingBookings.length, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Confirmed', value: confirmedBookings.length, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Completed', value: pastBookings.filter(b => b.status === 'completed').length, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Availability Slots', value: availability.filter(a => a.is_active).length, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(stat => (
            <Card key={stat.label} className={`p-4 ${stat.bg}`}>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-600 mt-0.5">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {[
            { key: 'bookings', label: 'Bookings', icon: Calendar },
            { key: 'availability', label: 'Availability', icon: Settings },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
              {tab.key === 'bookings' && pendingBookings.length > 0 && (
                <span className="bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingBookings.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Pending */}
            {pendingBookings.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  Pending Requests ({pendingBookings.length})
                </h2>
                <div className="space-y-3">
                  {pendingBookings.map(b => <BookingCard key={b.id} booking={b} />)}
                </div>
              </div>
            )}

            {/* Confirmed */}
            {confirmedBookings.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Upcoming Confirmed ({confirmedBookings.length})
                </h2>
                <div className="space-y-3">
                  {confirmedBookings.map(b => <BookingCard key={b.id} booking={b} />)}
                </div>
              </div>
            )}

            {/* Past */}
            {pastBookings.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  Past Sessions ({pastBookings.length})
                </h2>
                <div className="space-y-3">
                  {pastBookings.slice(0, 5).map(b => <BookingCard key={b.id} booking={b} />)}
                </div>
              </div>
            )}

            {bookings.length === 0 && (
              <Card className="p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No bookings yet</h3>
                <p className="text-gray-500 text-sm">Set your availability and students will be able to book sessions with you</p>
                <Button onClick={() => setActiveTab('availability')} className="mt-4" variant="outline">
                  <Settings className="w-4 h-4 mr-2" /> Set Availability
                </Button>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'availability' && (
          <div className="space-y-6">
            {/* Add Slot Form */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600" /> Add Availability Slot
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                  <select
                    value={newSlot.day_of_week}
                    onChange={e => setNewSlot(s => ({ ...s, day_of_week: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {DAYS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newSlot.start_time}
                    onChange={e => setNewSlot(s => ({ ...s, start_time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={newSlot.end_time}
                    onChange={e => setNewSlot(s => ({ ...s, end_time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session Duration (min)</label>
                  <select
                    value={newSlot.session_duration_minutes}
                    onChange={e => setNewSlot(s => ({ ...s, session_duration_minutes: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {[30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} minutes</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-4 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSlot.allows_group}
                      onChange={e => setNewSlot(s => ({ ...s, allows_group: e.target.checked }))}
                      className="w-4 h-4 accent-purple-600"
                    />
                    <span className="text-sm text-gray-700">Allow Group Sessions</span>
                  </label>
                </div>
                {newSlot.allows_group && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Group Size</label>
                    <Input
                      type="number"
                      value={newSlot.max_group_size}
                      onChange={e => setNewSlot(s => ({ ...s, max_group_size: Number(e.target.value) }))}
                      min={2}
                      max={20}
                      className="text-sm"
                    />
                  </div>
                )}
              </div>
              <Button
                onClick={handleAddSlot}
                disabled={addSlotMutation.isPending}
                className="mt-4 bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {addSlotMutation.isPending ? 'Adding...' : 'Add Slot'}
              </Button>
            </Card>

            {/* Current Availability */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" /> Your Availability Schedule
              </h2>
              {loadingAvail ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : availability.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No availability set yet</p>
                  <p className="text-xs text-gray-400 mt-1">Add slots above so students can book sessions with you</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {DAYS.map(day => {
                    const daySlots = availability.filter(a => a.day_of_week === day);
                    if (!daySlots.length) return null;
                    return (
                      <div key={day}>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{day.charAt(0).toUpperCase() + day.slice(1)}</p>
                        <div className="space-y-1.5 ml-2">
                          {daySlots.map(slot => (
                            <div key={slot.id} className={`flex items-center justify-between p-3 rounded-lg border ${slot.is_active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                              <div className="flex items-center gap-3">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-900">{slot.start_time} – {slot.end_time}</span>
                                <span className="text-xs text-gray-500">{slot.session_duration_minutes || 60}min slots</span>
                                {slot.allows_group && (
                                  <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                                    <Users className="w-3 h-3 mr-1 inline" /> Group (max {slot.max_group_size || 5})
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleSlotMutation.mutate({ id: slot.id, is_active: !slot.is_active })}
                                  className={`text-xs px-2 py-1 rounded-full font-medium transition ${slot.is_active ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700' : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700'}`}
                                >
                                  {slot.is_active ? 'Active' : 'Paused'}
                                </button>
                                <button
                                  onClick={() => deleteSlotMutation.mutate(slot.id)}
                                  className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}