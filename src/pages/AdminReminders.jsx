import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Plus, Send, Edit, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AdminReminders() {
  const [user, setUser] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    reminder_type: 'assignment_submission',
    subject: '',
    message: '',
    target_audience: 'all_students',
    course_id: '',
    group_id: '',
    is_active: true
  });

  React.useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const queryClient = useQueryClient();

  const { data: reminders = [] } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => base44.entities.ReminderConfig.list('-updated_date', 100),
    enabled: !!user && (user.role === 'admin' || user.is_tutor)
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 100)
  });

  const { data: studyGroups = [] } = useQuery({
    queryKey: ['study-groups'],
    queryFn: () => base44.entities.StudyGroup.list('-created_date', 100)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ReminderConfig.create({
      ...data,
      created_by_role: user.role === 'admin' ? 'admin' : 'teacher'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      resetForm();
      setShowCreateDialog(false);
      toast.success('Reminder created successfully');
    },
    onError: (error) => toast.error('Failed to create reminder: ' + error.message)
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.ReminderConfig.update(editingReminder.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      resetForm();
      setEditingReminder(null);
      setShowCreateDialog(false);
      toast.success('Reminder updated successfully');
    },
    onError: (error) => toast.error('Failed to update reminder: ' + error.message)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ReminderConfig.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Reminder deleted');
    },
    onError: (error) => toast.error('Failed to delete reminder: ' + error.message)
  });

  const sendMutation = useMutation({
    mutationFn: (reminderId) => base44.functions.invoke('sendStudentReminder', { reminderId }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success(response.data.message);
    },
    onError: (error) => toast.error('Failed to send reminder')
  });

  const resetForm = () => {
    setFormData({
      title: '',
      reminder_type: 'assignment_submission',
      subject: '',
      message: '',
      target_audience: 'all_students',
      course_id: '',
      group_id: '',
      is_active: true
    });
    setEditingReminder(null);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.subject || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingReminder) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (reminder) => {
    setEditingReminder(reminder);
    setFormData({
      title: reminder.title,
      reminder_type: reminder.reminder_type,
      subject: reminder.subject,
      message: reminder.message,
      target_audience: reminder.target_audience,
      course_id: reminder.course_id || '',
      group_id: reminder.group_id || '',
      is_active: reminder.is_active
    });
    setShowCreateDialog(true);
  };

  if (!user || (user.role !== 'admin' && !user.is_tutor)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Only administrators and teachers can access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const reminderTypeLabels = {
    assignment_submission: 'Assignment Submission',
    do_assignment: 'Do Assignment',
    upcoming_class: 'Upcoming Class',
    news: 'News',
    new_course: 'New Course Available'
  };

  const activeReminders = reminders.filter(r => r.is_active);
  const inactiveReminders = reminders.filter(r => !r.is_active);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Bell className="w-8 h-8 text-primary" />
              Student Reminders
            </h1>
            <p className="text-muted-foreground mt-2">Create and manage automated email reminders for students</p>
          </div>
          <Button 
            onClick={() => {
              resetForm();
              setShowCreateDialog(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            New Reminder
          </Button>
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingReminder ? 'Edit Reminder' : 'Create New Reminder'}</DialogTitle>
            </DialogHeader>

            <div className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Assignment Submission Reminder"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Reminder Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Reminder Type *</label>
                <select
                  value={formData.reminder_type}
                  onChange={(e) => setFormData({ ...formData, reminder_type: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Object.entries(reminderTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Don't forget to submit your assignment!"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Write your custom message here..."
                  rows={6}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Send To *</label>
                <select
                  value={formData.target_audience}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all_students">All Students</option>
                  <option value="specific_course">Specific Course</option>
                  <option value="specific_group">Study Group</option>
                </select>
              </div>

              {/* Course Selection */}
              {formData.target_audience === 'specific_course' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Select Course *</label>
                  <select
                    value={formData.course_id}
                    onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Choose a course...</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Group Selection */}
              {formData.target_audience === 'specific_group' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Select Study Group *</label>
                  <select
                    value={formData.group_id}
                    onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Choose a study group...</option>
                    {studyGroups.map(group => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Active Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 accent-primary"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-foreground cursor-pointer">
                  Reminder is active
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingReminder ? 'Update' : 'Create'} Reminder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="active" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Active ({activeReminders.length})
            </TabsTrigger>
            <TabsTrigger value="inactive" className="gap-2">
              <AlertCircle className="w-4 h-4" />
              Inactive ({inactiveReminders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {activeReminders.length > 0 ? (
              <div className="grid gap-4">
                {activeReminders.map((reminder, index) => (
                  <motion.div
                    key={reminder.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{reminder.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {reminderTypeLabels[reminder.reminder_type]} • {reminder.target_audience === 'all_students' ? 'All Students' : reminder.target_audience === 'specific_course' ? 'Specific Course' : 'Study Group'}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => sendMutation.mutate(reminder.id)}
                              disabled={sendMutation.isPending}
                              className="gap-1"
                            >
                              <Send className="w-4 h-4" />
                              Send Now
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(reminder)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteMutation.mutate(reminder.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Subject</p>
                            <p className="text-foreground">{reminder.subject}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Message Preview</p>
                            <p className="text-foreground whitespace-pre-wrap text-sm">{reminder.message.substring(0, 150)}...</p>
                          </div>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>Sent: {reminder.sent_count || 0} times</span>
                            {reminder.last_sent_date && (
                              <span>Last sent: {new Date(reminder.last_sent_date).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Active Reminders</CardTitle>
                  <CardDescription>Create a new reminder to get started</CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="inactive" className="mt-6">
            {inactiveReminders.length > 0 ? (
              <div className="grid gap-4">
                {inactiveReminders.map((reminder, index) => (
                  <motion.div
                    key={reminder.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="opacity-60">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{reminder.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {reminderTypeLabels[reminder.reminder_type]} • Inactive
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(reminder)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteMutation.mutate(reminder.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Inactive Reminders</CardTitle>
                </CardHeader>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}