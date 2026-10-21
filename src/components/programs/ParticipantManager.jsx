import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, User, UserCog, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { listUsers } from '@/api/listUsers';

export default function ParticipantManager({ programId, isAdmin, isMentor }) {
  const [showForm, setShowForm] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [formData, setFormData] = useState({
    participant_email: '',
    participant_name: '',
    mentor_email: '',
    mentor_name: '',
    current_task: '',
    progress_notes: '',
  });
  const queryClient = useQueryClient();

  const { data: participants = [] } = useQuery({
    queryKey: ['program-participants', programId],
    queryFn: () => base44.entities.ProgramParticipant.filter({ program_id: programId }),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => listUsers({ sort: '-created_date', limit: 1000 }),
  });

  const mentors = users.filter(u => u.is_tutor || u.role === 'admin');

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ProgramParticipant.create({ ...data, program_id: programId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['program-participants', programId]);
      setShowForm(false);
      resetForm();
      toast.success('Participant added');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProgramParticipant.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['program-participants', programId]);
      setShowForm(false);
      setEditingParticipant(null);
      resetForm();
      toast.success('Participant updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ProgramParticipant.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['program-participants', programId]);
      toast.success('Participant removed');
    },
  });

  const resetForm = () => {
    setFormData({
      participant_email: '',
      participant_name: '',
      mentor_email: '',
      mentor_name: '',
      current_task: '',
      progress_notes: '',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingParticipant) {
      updateMutation.mutate({ id: editingParticipant.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (participant) => {
    setEditingParticipant(participant);
    setFormData({
      participant_email: participant.participant_email,
      participant_name: participant.participant_name,
      mentor_email: participant.mentor_email || '',
      mentor_name: participant.mentor_name || '',
      current_task: participant.current_task || '',
      progress_notes: participant.progress_notes || '',
    });
    setShowForm(true);
  };

  const assignMentor = (participantId, mentorEmail) => {
    const mentor = mentors.find(m => m.email === mentorEmail);
    if (!mentor) return;
    
    updateMutation.mutate({
      id: participantId,
      data: {
        mentor_email: mentor.email,
        mentor_name: mentor.full_name,
      },
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Participants</h3>
        {isAdmin && (
          <Button onClick={() => setShowForm(!showForm)} className="bg-[#FF8C00]">
            <Plus className="w-4 h-4 mr-2" />
            Add Participant
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="p-4 mb-6 bg-gray-50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Participant Name *</Label>
                <Input
                  value={formData.participant_name}
                  onChange={(e) => setFormData({ ...formData, participant_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.participant_email}
                  onChange={(e) => setFormData({ ...formData, participant_email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Assign Mentor</Label>
                <select
                  value={formData.mentor_email}
                  onChange={(e) => {
                    const mentor = mentors.find(m => m.email === e.target.value);
                    setFormData({ 
                      ...formData, 
                      mentor_email: e.target.value,
                      mentor_name: mentor?.full_name || '',
                    });
                  }}
                  className="w-full h-10 px-3 rounded-md border border-gray-300"
                >
                  <option value="">No mentor assigned</option>
                  {mentors.map(mentor => (
                    <option key={mentor.id} value={mentor.email}>
                      {mentor.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Current Task</Label>
                <Input
                  value={formData.current_task}
                  onChange={(e) => setFormData({ ...formData, current_task: e.target.value })}
                  placeholder="What they're working on"
                />
              </div>
            </div>

            <div>
              <Label>Progress Notes</Label>
              <Textarea
                value={formData.progress_notes}
                onChange={(e) => setFormData({ ...formData, progress_notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="bg-[#FF8C00]">
                {editingParticipant ? 'Update' : 'Add'} Participant
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingParticipant(null); resetForm(); }}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {participants.map(participant => (
          <Card key={participant.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-[#FF8C00] text-white">
                    {participant.participant_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-gray-900">{participant.participant_name}</h4>
                  <p className="text-sm text-gray-500">{participant.participant_email}</p>
                </div>
              </div>
              {isAdmin && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(participant)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(participant.id)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Mentor:</span>{' '}
                {participant.mentor_name ? (
                  <Badge className="bg-purple-100 text-purple-700">{participant.mentor_name}</Badge>
                ) : (
                  <span className="text-gray-400">Not assigned</span>
                )}
              </div>
              
              {participant.current_task && (
                <div>
                  <span className="text-gray-500">Current Task:</span>{' '}
                  <span className="text-gray-900">{participant.current_task}</span>
                </div>
              )}
              
              {participant.progress_notes && (
                <div className="pt-2 border-t">
                  <p className="text-gray-600">{participant.progress_notes}</p>
                </div>
              )}
            </div>

            {(isAdmin || isMentor) && !participant.mentor_email && (
              <div className="mt-3 pt-3 border-t">
                <Label className="text-xs text-gray-500 mb-2 block">Assign Mentor</Label>
                <select
                  onChange={(e) => assignMentor(participant.id, e.target.value)}
                  className="w-full h-9 text-sm px-2 rounded-md border border-gray-300"
                >
                  <option value="">Select mentor</option>
                  {mentors.map(mentor => (
                    <option key={mentor.id} value={mentor.email}>
                      {mentor.full_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </Card>
        ))}

        {participants.length === 0 && (
          <div className="col-span-2 text-center py-12">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No participants added yet</p>
          </div>
        )}
      </div>
    </Card>
  );
}