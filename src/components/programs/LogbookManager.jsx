import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function LogbookManager({ programId, isAdmin, isMentor, userEmail }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    entry_date: format(new Date(), 'yyyy-MM-dd'),
    activity_summary: '',
    skills_developed: '',
    challenges: '',
    hours_worked: '',
  });
  const queryClient = useQueryClient();

  const { data: logbooks = [] } = useQuery({
    queryKey: ['logbooks', programId, userEmail],
    queryFn: () => {
      if (isAdmin || isMentor) {
        return base44.entities.Logbook.filter({ program_id: programId }, '-entry_date', 200);
      } else {
        return base44.entities.Logbook.filter({ program_id: programId, participant_email: userEmail }, '-entry_date', 100);
      }
    },
  });

  const { data: participants = [] } = useQuery({
    queryKey: ['program-participants', programId],
    queryFn: () => base44.entities.ProgramParticipant.filter({ program_id: programId }),
    enabled: isAdmin || isMentor,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Logbook.create({
      ...data,
      program_id: programId,
      participant_email: userEmail,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['logbooks', programId]);
      setShowForm(false);
      resetForm();
      toast.success('Logbook entry submitted');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Logbook.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['logbooks', programId]);
      toast.success('Feedback added');
    },
  });

  const resetForm = () => {
    setFormData({
      entry_date: format(new Date(), 'yyyy-MM-dd'),
      activity_summary: '',
      skills_developed: '',
      challenges: '',
      hours_worked: '',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const addFeedback = (logbookId, feedback) => {
    updateMutation.mutate({
      id: logbookId,
      data: { mentor_feedback: feedback, is_reviewed: true },
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Logbook Entries</h3>
        {!isAdmin && !isMentor && (
          <Button onClick={() => setShowForm(!showForm)} className="bg-[#FF8C00]">
            <Plus className="w-4 h-4 mr-2" />
            New Entry
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="p-4 mb-6 bg-gray-50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={formData.entry_date}
                  onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Hours Worked</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={formData.hours_worked}
                  onChange={(e) => setFormData({ ...formData, hours_worked: e.target.value })}
                  placeholder="e.g., 7.5"
                />
              </div>
            </div>

            <div>
              <Label>Activity Summary *</Label>
              <Textarea
                value={formData.activity_summary}
                onChange={(e) => setFormData({ ...formData, activity_summary: e.target.value })}
                placeholder="What did you work on today?"
                rows={4}
                required
              />
            </div>

            <div>
              <Label>Skills Developed</Label>
              <Textarea
                value={formData.skills_developed}
                onChange={(e) => setFormData({ ...formData, skills_developed: e.target.value })}
                placeholder="What skills did you learn or practice?"
                rows={3}
              />
            </div>

            <div>
              <Label>Challenges Faced</Label>
              <Textarea
                value={formData.challenges}
                onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                placeholder="Any difficulties or obstacles?"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="bg-[#FF8C00]">Submit Entry</Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {logbooks.map(entry => {
          const participant = participants.find(p => p.participant_email === entry.participant_email);
          
          return (
            <Card key={entry.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">
                      {format(new Date(entry.entry_date), 'EEEE, MMMM d, yyyy')}
                    </h4>
                    {entry.is_reviewed ? (
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Reviewed
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                  {(isAdmin || isMentor) && participant && (
                    <p className="text-sm text-gray-500">{participant.participant_name}</p>
                  )}
                  {entry.hours_worked && (
                    <p className="text-sm text-gray-500">{entry.hours_worked} hours</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Activity Summary</h5>
                  <p className="text-gray-600">{entry.activity_summary}</p>
                </div>

                {entry.skills_developed && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Skills Developed</h5>
                    <p className="text-gray-600">{entry.skills_developed}</p>
                  </div>
                )}

                {entry.challenges && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Challenges</h5>
                    <p className="text-gray-600">{entry.challenges}</p>
                  </div>
                )}

                {entry.mentor_feedback && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <h5 className="text-sm font-medium text-purple-900 mb-1">Mentor Feedback</h5>
                    <p className="text-purple-700">{entry.mentor_feedback}</p>
                  </div>
                )}

                {(isAdmin || isMentor) && !entry.is_reviewed && (
                  <div className="pt-3 border-t">
                    <Label className="text-sm text-gray-700 mb-2 block">Add Mentor Feedback</Label>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Write feedback for this entry..."
                        rows={2}
                        id={`feedback-${entry.id}`}
                      />
                      <Button 
                        onClick={() => {
                          const feedback = document.getElementById(`feedback-${entry.id}`).value;
                          if (feedback.trim()) addFeedback(entry.id, feedback);
                        }}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Submit
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}

        {logbooks.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No logbook entries yet</p>
          </div>
        )}
      </div>
    </Card>
  );
}