import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Save } from 'lucide-react';
import { toast } from 'sonner';

const notificationTypes = [
  {
    key: 'logbook_approvals',
    label: 'Logbook Approvals',
    description: 'Get notified when your logbook entries are reviewed and approved'
  },
  {
    key: 'program_announcements',
    label: 'Program Announcements',
    description: 'Receive updates and announcements from programmes you are enrolled in'
  },
  {
    key: 'mentor_messages',
    label: 'Mentor Messages',
    description: 'Receive messages and feedback from your mentor'
  },
  {
    key: 'activity_reminders',
    label: 'Activity Reminders',
    description: 'Get reminded about upcoming activities and events'
  },
  {
    key: 'quiz_reminders',
    label: 'Quiz Reminders',
    description: 'Receive reminders about upcoming quiz deadlines'
  },
  {
    key: 'session_updates',
    label: 'Live Session Updates',
    description: 'Get notified about live session starts and schedule changes'
  },
  {
    key: 'course_completions',
    label: 'Course Completions',
    description: 'Celebrate when you complete courses'
  },
  {
    key: 'system_notifications',
    label: 'System Notifications',
    description: 'Important updates about your account and the platform'
  },
  {
    key: 'email_notifications',
    label: 'Email Notifications',
    description: 'Send notifications to your email address'
  },
];

export default function NotificationPreferences() {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    loadUser();
  }, []);

  const { data: existingPrefs } = useQuery({
    queryKey: ['notification-preferences', user?.email],
    queryFn: () => base44.entities.NotificationPreference.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (existingPrefs && existingPrefs.length > 0) {
      const prefs = existingPrefs[0];
      setPreferences(prefs);
    } else if (user?.email) {
      // Initialize with defaults
      setPreferences({
        user_email: user.email,
        logbook_approvals: true,
        program_announcements: true,
        mentor_messages: true,
        activity_reminders: true,
        quiz_reminders: true,
        session_updates: true,
        course_completions: true,
        system_notifications: true,
        email_notifications: false,
      });
    }
  }, [existingPrefs, user?.email]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (preferences.id) {
        return base44.entities.NotificationPreference.update(preferences.id, data);
      } else {
        return base44.entities.NotificationPreference.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notification-preferences']);
      setHasChanges(false);
      toast.success('Notification preferences saved');
    },
    onError: () => {
      toast.error('Failed to save preferences');
    },
  });

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    const saveData = { ...preferences };
    delete saveData.id;
    delete saveData.created_date;
    delete saveData.updated_date;
    delete saveData.created_by;
    saveMutation.mutate(saveData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
          <Bell className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notification Preferences</h2>
          <p className="text-sm text-gray-500 mt-1">Control which notifications you receive</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {notificationTypes.map(type => (
            <div key={type.key} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
              <div className="flex-1">
                <Label className="text-base font-medium text-gray-900 cursor-pointer">
                  {type.label}
                </Label>
                <p className="text-sm text-gray-500 mt-1">{type.description}</p>
              </div>
              <Switch
                checked={preferences[type.key] || false}
                onCheckedChange={() => handleToggle(type.key)}
                className="ml-4 flex-shrink-0"
              />
            </div>
          ))}
        </div>
      </Card>

      {hasChanges && (
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900">You have unsaved changes</p>
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Save className="w-4 h-4" />
            {saveMutation.isPending ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      )}

      {!hasChanges && (
        <p className="text-sm text-gray-500 text-center">All changes are saved</p>
      )}
    </div>
  );
}