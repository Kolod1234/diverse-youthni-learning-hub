import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Clock, MapPin, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function RotaManager({ programId, isAdmin, participants }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    participant_email: '',
    shift_date: '',
    start_time: '',
    end_time: '',
    role: '',
    location: '',
    notes: '',
  });
  const queryClient = useQueryClient();

  const { data: rotas = [] } = useQuery({
    queryKey: ['rotas', programId],
    queryFn: () => base44.entities.Rota.filter({ program_id: programId }, 'shift_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      const participant = participants.find(p => p.participant_email === data.participant_email);
      return base44.entities.Rota.create({
        ...data,
        program_id: programId,
        participant_name: participant?.participant_name || '',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['rotas', programId]);
      setShowForm(false);
      resetForm();
      toast.success('Shift added to rota');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Rota.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['rotas', programId]);
      toast.success('Shift removed');
    },
  });

  const resetForm = () => {
    setFormData({
      participant_email: '',
      shift_date: '',
      start_time: '',
      end_time: '',
      role: '',
      location: '',
      notes: '',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  // Group rotas by date
  const rotasByDate = rotas.reduce((acc, rota) => {
    if (!acc[rota.shift_date]) acc[rota.shift_date] = [];
    acc[rota.shift_date].push(rota);
    return acc;
  }, {});

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Rota Schedule</h3>
        {isAdmin && (
          <Button onClick={() => setShowForm(!showForm)} className="bg-[#FF8C00]">
            <Plus className="w-4 h-4 mr-2" />
            Add Shift
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="p-4 mb-6 bg-gray-50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Participant *</Label>
                <select
                  value={formData.participant_email}
                  onChange={(e) => setFormData({ ...formData, participant_email: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-gray-300"
                  required
                >
                  <option value="">Select participant</option>
                  {participants.map(p => (
                    <option key={p.id} value={p.participant_email}>
                      {p.participant_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={formData.shift_date}
                  onChange={(e) => setFormData({ ...formData, shift_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Role/Task</Label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g., Front desk, Admin support"
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
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="bg-[#FF8C00]">Add to Rota</Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {Object.entries(rotasByDate).sort(([a], [b]) => new Date(b) - new Date(a)).map(([date, shifts]) => (
          <div key={date}>
            <h4 className="font-semibold text-gray-900 mb-2">
              {format(new Date(date), 'EEEE, MMMM d, yyyy')}
            </h4>
            <div className="space-y-2">
              {shifts.map(shift => (
                <Card key={shift.id} className="p-3 bg-purple-50 border-purple-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{shift.participant_name}</div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {shift.start_time} - {shift.end_time}
                        </div>
                        {shift.role && <span>• {shift.role}</span>}
                        {shift.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {shift.location}
                          </div>
                        )}
                      </div>
                      {shift.notes && (
                        <p className="text-sm text-gray-500 mt-1">{shift.notes}</p>
                      )}
                    </div>
                    {isAdmin && (
                      <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(shift.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {rotas.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No shifts scheduled on the rota yet</p>
          </div>
        )}
      </div>
    </Card>
  );
}