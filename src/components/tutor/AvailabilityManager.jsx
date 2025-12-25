import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function AvailabilityManager({ tutorEmail }) {
  const queryClient = useQueryClient();
  const [newSlot, setNewSlot] = useState({
    day_of_week: 'monday',
    start_time: '09:00',
    end_time: '10:00',
  });

  const { data: availability = [] } = useQuery({
    queryKey: ['tutor-availability', tutorEmail],
    queryFn: () => base44.entities.TutorAvailability.filter({ tutor_email: tutorEmail }),
    enabled: !!tutorEmail,
  });

  const createSlotMutation = useMutation({
    mutationFn: (data) => base44.entities.TutorAvailability.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tutor-availability']);
      toast.success('Time slot added');
      setNewSlot({ day_of_week: 'monday', start_time: '09:00', end_time: '10:00' });
    },
  });

  const deleteSlotMutation = useMutation({
    mutationFn: (id) => base44.entities.TutorAvailability.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['tutor-availability']);
      toast.success('Time slot removed');
    },
  });

  const toggleSlotMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.TutorAvailability.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries(['tutor-availability']);
    },
  });

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const handleAddSlot = () => {
    if (newSlot.start_time >= newSlot.end_time) {
      toast.error('End time must be after start time');
      return;
    }

    createSlotMutation.mutate({
      tutor_email: tutorEmail,
      ...newSlot,
    });
  };

  const groupedAvailability = daysOfWeek.reduce((acc, day) => {
    acc[day] = availability.filter(slot => slot.day_of_week === day).sort((a, b) => 
      a.start_time.localeCompare(b.start_time)
    );
    return acc;
  }, {});

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Manage Availability</h3>
      </div>

      {/* Add New Slot */}
      <Card className="p-4 mb-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
        <h4 className="font-medium text-gray-900 mb-3">Add Available Time Slot</h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <select
            value={newSlot.day_of_week}
            onChange={(e) => setNewSlot({ ...newSlot, day_of_week: e.target.value })}
            className="px-3 py-2 border rounded-lg"
          >
            {daysOfWeek.map(day => (
              <option key={day} value={day}>
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </option>
            ))}
          </select>
          <Input
            type="time"
            value={newSlot.start_time}
            onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
          />
          <Input
            type="time"
            value={newSlot.end_time}
            onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
          />
          <Button
            onClick={handleAddSlot}
            disabled={createSlotMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </Card>

      {/* Weekly Schedule */}
      <div className="space-y-4">
        {daysOfWeek.map(day => (
          <div key={day}>
            <h4 className="font-medium text-gray-900 mb-2 capitalize">{day}</h4>
            {groupedAvailability[day].length > 0 ? (
              <div className="space-y-2">
                {groupedAvailability[day].map(slot => (
                  <div
                    key={slot.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      slot.is_active ? 'bg-white' : 'bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {slot.start_time} - {slot.end_time}
                      </span>
                      {!slot.is_active && (
                        <Badge variant="secondary">Disabled</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSlotMutation.mutate({ id: slot.id, is_active: !slot.is_active })}
                      >
                        {slot.is_active ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('Delete this time slot?')) {
                            deleteSlotMutation.mutate(slot.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-2">No availability set</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}