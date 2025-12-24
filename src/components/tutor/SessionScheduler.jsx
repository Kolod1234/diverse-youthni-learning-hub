import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, Users, X } from 'lucide-react';

export default function SessionScheduler({ courses, onClose, onSuccess }) {
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
    recurrence_end_date: ''
  });
  const [selectAll, setSelectAll] = useState(false);
  const [syncToCalendar, setSyncToCalendar] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', formData.course_id],
    queryFn: () => base44.entities.Enrollment.filter({ course_id: formData.course_id }),
    enabled: !!formData.course_id,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
  });

  const createSessionMutation = useMutation({
    mutationFn: async (sessionData) => {
      const session = await base44.entities.VideoSession.create(sessionData);
      
      // Sync to Google Calendar if enabled
      if (syncToCalendar) {
        try {
          await base44.functions.invoke('syncSessionToCalendar', {
            sessionId: session.id,
            action: 'create'
          });
        } catch (error) {
          console.error('Calendar sync failed:', error);
        }
      }
      
      // Schedule automatic reminders (24 hours and 1 hour before)
      try {
        await base44.functions.invoke('scheduleSessionReminders', {
          sessionId: session.id,
          reminderTimings: [24 * 60, 60] // 24 hours and 1 hour in minutes
        });
      } catch (error) {
        console.error('Failed to schedule reminders:', error);
      }
      
      return session;
    },
    onSuccess: () => {
      onSuccess();
    },
  });

  const students = enrollments.map(enrollment => {
    const student = allUsers.find(u => u.email === enrollment.created_by);
    return student;
  }).filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.course_id || !formData.title || !formData.scheduled_date || !formData.scheduled_time) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.invited_students.length === 0) {
      alert('Please select at least one student');
      return;
    }

    if (formData.is_recurring && !formData.recurrence_end_date) {
      alert('Please specify when recurring sessions should end');
      return;
    }

    const baseSessionData = {
      ...formData,
      tutor_email: user?.email,
      tutor_name: user?.full_name,
      meeting_room_id: `room-${Date.now()}`,
      status: 'scheduled'
    };

    if (formData.is_recurring) {
      // Create recurring sessions
      try {
        await base44.functions.invoke('createRecurringSessions', {
          sessionData: baseSessionData,
          syncToCalendar
        });
        onSuccess();
      } catch (error) {
        alert('Failed to create recurring sessions: ' + error.message);
      }
    } else {
      createSessionMutation.mutate(baseSessionData);
    }
  };

  const toggleStudent = (email) => {
    setFormData(prev => ({
      ...prev,
      invited_students: prev.invited_students.includes(email)
        ? prev.invited_students.filter(e => e !== email)
        : [...prev.invited_students, email]
    }));
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setFormData(prev => ({ ...prev, invited_students: [] }));
    } else {
      setFormData(prev => ({ ...prev, invited_students: students.map(s => s.email) }));
    }
    setSelectAll(!selectAll);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Schedule Live Session
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.course_id}
              onChange={(e) => setFormData({ ...formData, course_id: e.target.value, invited_students: [] })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>

          {/* Session Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Week 1 Review Session"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What will you cover in this session?"
              rows={3}
            />
          </div>

          {/* Date and Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time <span className="text-red-500">*</span>
              </label>
              <Input
                type="time"
                value={formData.scheduled_time}
                onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes)
            </label>
            <Input
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
              min="15"
              max="180"
            />
          </div>

          {/* Recurring Options */}
          <div className="border-t pt-4">
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={formData.is_recurring}
                onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Make this a recurring session</span>
            </label>

            {formData.is_recurring && (
              <div className="ml-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Repeat
                    </label>
                    <select
                      value={formData.recurrence_pattern}
                      onChange={(e) => setFormData({ ...formData, recurrence_pattern: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Every 2 Weeks</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={formData.recurrence_end_date}
                      onChange={(e) => setFormData({ ...formData, recurrence_end_date: e.target.value })}
                      min={formData.scheduled_date}
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Calendar Sync */}
          <div className="border-t pt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={syncToCalendar}
                onChange={(e) => setSyncToCalendar(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Sync to Google Calendar</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Automatically add sessions to your Google Calendar and send invites to participants
            </p>
          </div>

          {/* Student Selection */}
          {formData.course_id && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Invite Students <span className="text-red-500">*</span>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectAll ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <Card className="p-4 max-h-48 overflow-y-auto">
                {students.length > 0 ? (
                  <div className="space-y-2">
                    {students.map(student => (
                      <label
                        key={student.email}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.invited_students.includes(student.email)}
                          onChange={() => toggleStudent(student.email)}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-purple-600">
                              {student.full_name?.charAt(0) || 'S'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{student.full_name}</p>
                            <p className="text-xs text-gray-500">{student.email}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No students enrolled in this course
                  </p>
                )}
              </Card>
              <p className="text-xs text-gray-500 mt-2">
                {formData.invited_students.length} student{formData.invited_students.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createSessionMutation.isPending}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600"
            >
              {createSessionMutation.isPending ? 'Scheduling...' : 'Schedule Session'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}