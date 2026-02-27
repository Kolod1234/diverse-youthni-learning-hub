import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function BecomeTutorButton({ user, onSuccess, hideButton, externalOpen, onExternalOpenChange }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onExternalOpenChange !== undefined ? onExternalOpenChange : setInternalOpen;
  const [reason, setReason] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [subjects, setSubjects] = useState(['']);
  const queryClient = useQueryClient();

  const { data: existingRequest } = useQuery({
    queryKey: ['tutor-request', user?.email],
    queryFn: async () => {
      const requests = await base44.entities.TutorRequest.filter({ 
        user_email: user.email 
      });
      return requests[0] || null;
    },
    enabled: !!user && !user.is_tutor,
  });

  const requestMutation = useMutation({
    mutationFn: async (data) => {
      if (existingRequest && existingRequest.status === 'rejected') {
        return await base44.entities.TutorRequest.update(existingRequest.id, {
          reason: data.reason,
          qualifications: data.qualifications,
          subjects: data.subjects,
          status: 'pending',
          processed_by: null,
          processed_date: null
        });
      } else {
        return await base44.entities.TutorRequest.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tutor-request']);
      setOpen(false);
      setReason('');
      setQualifications('');
      setSubjects(['']);
      toast.success('Tutor request submitted successfully!');
      onSuccess?.();
    },
    onError: () => {
      toast.error('Failed to submit request');
    },
  });

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    const filteredSubjects = subjects.filter(s => s.trim());
    if (filteredSubjects.length === 0) {
      toast.error('Please add at least one subject');
      return;
    }

    requestMutation.mutate({
      user_email: user.email,
      user_name: user.full_name,
      reason: reason.trim(),
      qualifications: qualifications.trim(),
      subjects: filteredSubjects,
      status: 'pending',
    });
  };

  const addSubject = () => {
    setSubjects([...subjects, '']);
  };

  const removeSubject = (index) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const updateSubject = (index, value) => {
    const newSubjects = [...subjects];
    newSubjects[index] = value;
    setSubjects(newSubjects);
  };

  const handleClick = () => {
    setOpen(true);
  };

  const handleOpenChange = (val) => {
    setOpen(val);
  };

  const isExternallyControlled = externalOpen !== undefined;

  if (!user || user.is_tutor || user.role === 'admin') {
    return null;
  }

  if (!isExternallyControlled && existingRequest && existingRequest.status === 'pending') {
    return (
      <button className="flex items-center w-full text-left text-gray-400 cursor-not-allowed">
        <GraduationCap className="w-4 h-4 mr-2" />
        Request Pending
      </button>
    );
  }

  if (!isExternallyControlled && existingRequest && existingRequest.status === 'approved') {
    return null;
  }

  return (
    <>
      {!isExternallyControlled && (
        <Button 
          onClick={handleClick} 
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <GraduationCap className="w-4 h-4" />
          {existingRequest?.status === 'rejected' ? 'Reapply as Tutor' : 'Become a Tutor'}
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen} modal={true}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request to Become a Tutor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Why do you want to become a tutor?</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain your motivation and teaching goals..."
                className="mt-2 h-24"
              />
            </div>
            
            <div>
              <Label>Qualifications & Experience (optional)</Label>
              <Textarea
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                placeholder="Degrees, certifications, teaching experience..."
                className="mt-2 h-24"
              />
            </div>

            <div>
              <Label>Subjects You Want to Teach</Label>
              <div className="space-y-2 mt-2">
                {subjects.map((subject, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={subject}
                      onChange={(e) => updateSubject(index, e.target.value)}
                      placeholder="e.g., Mathematics, Biology..."
                    />
                    {subjects.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeSubject(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSubject}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subject
                </Button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                onClick={handleSubmit} 
                disabled={requestMutation.isPending}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                {requestMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
              <Button onClick={() => setOpen(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}