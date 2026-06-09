import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button, Card, TextField, Checkbox as MuiCheckbox, Switch as MuiSwitch, Select as MuiSelect, MenuItem } from '@mui/material';
const Input = ({ className, ...props }) => <TextField fullWidth size="small" className={className} {...props} />;
const Textarea = ({ className, rows, ...props }) => <TextField fullWidth multiline rows={rows || 4} className={className} {...props} />;
const Label = ({ children, className, htmlFor, ...props }) => <label htmlFor={htmlFor} className={className || 'block text-sm font-medium text-gray-700 mb-1'} {...props}>{children}</label>;
const Checkbox = ({ checked, onCheckedChange, id, ...props }) => <MuiCheckbox checked={!!checked} onChange={(e) => onCheckedChange?.(e.target.checked)} id={id} size="small" {...props} />;
const Switch = ({ checked, onCheckedChange, id, ...props }) => <MuiSwitch checked={!!checked} onChange={(e) => onCheckedChange?.(e.target.checked)} id={id} {...props} />;
const Select = ({ value, onValueChange, children }) => {
  const items = React.Children.toArray(children).find(c => c?.type?.displayName === 'SelectContent') || children;
  const itemList = React.Children.toArray((items?.props?.children) || items);
  return <MuiSelect fullWidth size="small" value={value || ''} onChange={(e) => onValueChange?.(e.target.value)}>{itemList}</MuiSelect>;
};
const SelectTrigger = ({ children }) => <>{children}</>;
SelectTrigger.displayName = 'SelectTrigger';
const SelectValue = () => null;
const SelectContent = ({ children }) => <>{children}</>;
SelectContent.displayName = 'SelectContent';
const SelectItem = ({ value, children }) => <MenuItem value={value}>{children}</MenuItem>;
SelectItem.displayName = 'SelectItem';
import { toast } from 'sonner';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VideocamIcon from '@mui/icons-material/Videocam';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import RepeatIcon from '@mui/icons-material/Repeat';
import RefreshIcon from '@mui/icons-material/Refresh';
const _w = (I) => ({ size, color, className, style, ...r }) => <I className={className} style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const ArrowLeft = _w(ArrowBackIcon), Video = _w(VideocamIcon), Calendar = _w(CalendarTodayIcon), Clock = _w(AccessTimeIcon);
const Users = _w(PeopleIcon), Plus = _w(AddIcon), Repeat = _w(RepeatIcon), RefreshCw = _w(RefreshIcon);
import AvailabilityManager from '@/components/tutor/AvailabilityManager';

export default function ScheduleSession() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    description: '',
    scheduled_date: '',
    scheduled_time: '',
    duration_minutes: 60,
    invited_students: [],
    is_recurring: false,
    recurrence_pattern: 'weekly',
    recurrence_end_date: '',
  });
  const [selectAll, setSelectAll] = useState(false);
  const [syncToCalendar, setSyncToCalendar] = useState(true);
  const [showAvailability, setShowAvailability] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: courses = [] } = useQuery({
    queryKey: ['tutor-assigned-courses-schedule-v2', user?.email, user?.role],
    queryFn: () => {
      if (user?.role === 'admin') {
        return base44.entities.Course.list('-created_date', 200);
      }
      return base44.entities.Course.filter({ assigned_tutors: user.email }, '-created_date', 200);
    },
    enabled: !!user?.email,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['course-enrollments', formData.course_id],
    queryFn: () => base44.entities.Enrollment.filter({ course_id: formData.course_id }),
    enabled: !!formData.course_id,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list('-created_date', 500),
  });

  const students = enrollments
    .map(e => users.find(u => u.email === e.created_by))
    .filter(Boolean);

  const createSessionMutation = useMutation({
    mutationFn: async (sessionData) => {
      const session = await base44.entities.VideoSession.create(sessionData);
      
      // Create Google Meet link
      try {
        const meetResult = await base44.functions.invoke('createGoogleMeetSession', {
          sessionData,
          sessionId: session.id
        });
        
        if (meetResult.data?.meet_link) {
          // Send notifications to invited students
          for (const studentEmail of sessionData.invited_students || []) {
            try {
              await base44.functions.invoke('sendNotification', {
                recipient_email: studentEmail,
                title: `New Live Session: ${sessionData.title}`,
                message: `You've been invited to a live session on ${sessionData.scheduled_date} at ${sessionData.scheduled_time}. Join via Google Meet.`,
                type: 'session_reminder',
                link: `/video-session?id=${session.id}`,
                send_email: true
              });
            } catch (err) {
              console.error('Failed to send notification:', err);
            }
          }
        }
      } catch (error) {
        console.error('Failed to create Google Meet link:', error);
        toast.error('Session created but Google Meet link failed. You can add it later.');
      }
      
      return session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['video-sessions']);
      toast.success('Session scheduled successfully!');
      setFormData({
        course_id: '',
        title: '',
        description: '',
        scheduled_date: '',
        scheduled_time: '',
        duration_minutes: 60,
        invited_students: [],
        is_recurring: false,
        recurrence_pattern: 'weekly',
        recurrence_end_date: '',
      });
      setSelectAll(false);
    },
    onError: () => {
      toast.error('Failed to schedule session');
    },
  });

  const handleToggleStudent = (email) => {
    setFormData(prev => ({
      ...prev,
      invited_students: prev.invited_students.includes(email)
        ? prev.invited_students.filter(e => e !== email)
        : [...prev.invited_students, email]
    }));
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    setFormData(prev => ({
      ...prev,
      invited_students: checked ? students.map(s => s.email) : []
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.course_id || !formData.title || !formData.scheduled_date || !formData.scheduled_time) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Defence in depth: block scheduling for a course the tutor was not assigned to.
    if (user?.role !== 'admin' && !courses.some(c => c.id === formData.course_id)) {
      toast.error('You are not assigned to that course.');
      return;
    }

    if (formData.is_recurring && !formData.recurrence_end_date) {
      toast.error('Please specify end date for recurring sessions');
      return;
    }

    const meetingRoomId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const baseSessionData = {
      ...formData,
      tutor_email: user?.email,
      tutor_name: user?.full_name,
      meeting_room_id: meetingRoomId,
      status: 'scheduled',
    };

    if (formData.is_recurring) {
      try {
        await base44.functions.invoke('createRecurringSessions', {
          sessionData: baseSessionData,
          syncToCalendar
        });
        queryClient.invalidateQueries(['video-sessions']);
        toast.success('Recurring sessions created!');
        setFormData({
          course_id: '',
          title: '',
          description: '',
          scheduled_date: '',
          scheduled_time: '',
          duration_minutes: 60,
          invited_students: [],
          is_recurring: false,
          recurrence_pattern: 'weekly',
          recurrence_end_date: '',
        });
        setSelectAll(false);
      } catch (error) {
        toast.error('Failed to create recurring sessions');
      }
    } else {
      createSessionMutation.mutate(baseSessionData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={createPageUrl('TutorDashboard')}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            Schedule Live Session
          </h1>
          <p className="text-gray-500">Set up a live video tutoring session for your students</p>
        </div>

        <div className="flex gap-3 mb-6">
          <Button
            variant={showAvailability ? 'default' : 'outline'}
            onClick={() => setShowAvailability(!showAvailability)}
          >
            <Clock className="w-4 h-4 mr-2" />
            {showAvailability ? 'Hide' : 'Manage'} Availability
          </Button>
        </div>

        {showAvailability && (
          <div className="mb-6">
            <AvailabilityManager tutorEmail={user?.email} />
          </div>
        )}

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="course">Course *</Label>
              <Select
                value={formData.course_id}
                onValueChange={(value) => setFormData({ ...formData, course_id: value, invited_students: [] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Session Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Introduction to Cell Biology"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What will you cover in this session?"
                rows={3}
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select
                  value={formData.duration_minutes.toString()}
                  onValueChange={(value) => setFormData({ ...formData, duration_minutes: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Recurring Sessions */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Repeat className="w-5 h-5 text-purple-600" />
                  <Label htmlFor="recurring">Recurring Session</Label>
                </div>
                <Switch
                  id="recurring"
                  checked={formData.is_recurring}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
                />
              </div>

              {formData.is_recurring && (
                <div className="ml-7 space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pattern">Repeat</Label>
                      <Select
                        value={formData.recurrence_pattern}
                        onValueChange={(value) => setFormData({ ...formData, recurrence_pattern: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Every 2 Weeks</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="end-date">End Date *</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={formData.recurrence_end_date}
                        onChange={(e) => setFormData({ ...formData, recurrence_end_date: e.target.value })}
                        min={formData.scheduled_date}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Calendar Sync */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-blue-600" />
                  <div>
                    <Label htmlFor="calendar-sync">Sync to Google Calendar</Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Automatically add to calendar and send invites
                    </p>
                  </div>
                </div>
                <Switch
                  id="calendar-sync"
                  checked={syncToCalendar}
                  onCheckedChange={setSyncToCalendar}
                />
              </div>
            </div>

            {formData.course_id && students.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Invite Students ({formData.invited_students.length} selected)</Label>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-all-students"
                      checked={selectAll}
                      onCheckedChange={handleSelectAll}
                    />
                    <label htmlFor="select-all-students" className="text-sm text-gray-600 cursor-pointer">
                      Select All
                    </label>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50 space-y-2">
                  {students.map((student) => (
                    <div
                      key={student.email}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:border-indigo-300 transition-all"
                    >
                      <Checkbox
                        id={`student-${student.email}`}
                        checked={formData.invited_students.includes(student.email)}
                        onCheckedChange={() => handleToggleStudent(student.email)}
                      />
                      <label
                        htmlFor={`student-${student.email}`}
                        className="flex-1 cursor-pointer"
                      >
                        <p className="font-medium text-gray-900">{student.full_name}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Link to={createPageUrl('TutorDashboard')}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={createSessionMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {createSessionMutation.isPending ? (
                  'Scheduling...'
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Session
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}