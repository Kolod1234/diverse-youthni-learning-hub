import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Settings, GripVertical } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function WidgetCustomizer({ user, widgetPreferences, onSave }) {
  const [open, setOpen] = useState(false);
  const [preferences, setPreferences] = useState(widgetPreferences);
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (prefs) => {
      await base44.auth.updateMe({ widget_preferences: prefs });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
      toast.success('Widget preferences saved');
      setOpen(false);
      onSave?.(preferences);
    },
  });

  const toggleWidget = (widgetId) => {
    setPreferences(prev => ({
      ...prev,
      [widgetId]: { ...prev[widgetId], enabled: !prev[widgetId]?.enabled }
    }));
  };

  const handleSave = () => {
    saveMutation.mutate(preferences);
  };

  const defaultWidgets = [
    { id: 'weather', label: 'Weather', description: 'Live weather updates' },
    { id: 'clock', label: 'Clock', description: 'Current time' },
    { id: 'calendar', label: 'Calendar', description: 'Monthly calendar view' },
    { id: 'upcoming_lessons', label: 'Upcoming Lessons', description: 'Your next lessons' },
    { id: 'rss_notifications', label: 'Latest News', description: 'Recent news items' },
    { id: 'quote', label: 'Daily Quote', description: 'Inspirational quotes' },
    { id: 'fact', label: 'Daily Fact', description: 'Interesting facts' },
    { id: 'discover', label: 'Discover', description: 'Featured content' },
    { id: 'student_of_month', label: 'Student of Month', description: 'Featured achievers' },
    { id: 'social_feed', label: 'Social Feed', description: 'Community updates' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
          <Settings className="w-4 h-4 mr-2" />
          Customize Widgets
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Your Dashboard</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600">Choose which widgets to display on your home page</p>
          {defaultWidgets.map((widget) => (
            <div key={widget.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{widget.label}</p>
                  <p className="text-sm text-gray-500">{widget.description}</p>
                </div>
              </div>
              <Switch
                checked={preferences[widget.id]?.enabled !== false}
                onCheckedChange={() => toggleWidget(widget.id)}
              />
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}