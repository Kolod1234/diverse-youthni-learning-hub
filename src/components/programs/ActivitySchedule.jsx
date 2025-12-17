import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, MapPin, Users, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ActivitySchedule({ programId, isAdmin, participants }) {
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    activity_date: '',
    start_time: '',
    end_time: '',
    location: '',
    assigned_participants: [],
  });
  const queryClient = useQueryClient();

  const { data: activities = [] } = useQuery({
    queryKey: ['activities', programId],
    queryFn: () => base44.entities.Activity.filter({ program_id: programId }, 'activity_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Activity.create({ ...data, program_id: programId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['activities', programId]);
      setShowForm(false);
      resetForm();
      toast.success('Activity created');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Activity.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['activities', programId]);
      setShowForm(false);
      setEditingActivity(null);
      resetForm();
      toast.success('Activity updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Activity.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['activities', programId]);
      toast.success('Activity deleted');
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      activity_date: '',
      start_time: '',
      end_time: '',
      location: '',
      assigned_participants: [],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingActivity) {
      updateMutation.mutate({ id: editingActivity.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setFormData({
      title: activity.title,
      description: activity.description || '',
      activity_date: activity.activity_date,
      start_time: activity.start_time,
      end_time: activity.end_time,
      location: activity.location || '',
      assigned_participants: activity.assigned_participants || [],
    });
    setShowForm(true);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Activity Schedule</h3>
        {isAdmin && (
          <Button onClick={() => setShowForm(!showForm)} className="bg-[#FF8C00]">
            <Plus className="w-4 h-4 mr-2" />
            New Activity
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="p-4 mb-6 bg-gray-50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Activity Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={formData.activity_date}
                  onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Start Time *</Label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>End Time *</Label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="bg-[#FF8C00]">
                {editingActivity ? 'Update' : 'Create'} Activity
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingActivity(null); resetForm(); }}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {activities.map(activity => (
          <Card key={activity.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                  <Badge className={
                    activity.status === 'completed' ? 'bg-green-100 text-green-700' :
                    activity.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }>
                    {activity.status}
                  </Badge>
                </div>
                {activity.description && (
                  <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {format(new Date(activity.activity_date), 'MMM d, yyyy')} • {activity.start_time} - {activity.end_time}
                  </div>
                  {activity.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {activity.location}
                    </div>
                  )}
                  {activity.assigned_participants?.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {activity.assigned_participants.length} participants
                    </div>
                  )}
                </div>
              </div>
              {isAdmin && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(activity)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteMutation.mutate(activity.id)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}

        {activities.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No activities scheduled yet</p>
          </div>
        )}
      </div>
    </Card>
  );
}