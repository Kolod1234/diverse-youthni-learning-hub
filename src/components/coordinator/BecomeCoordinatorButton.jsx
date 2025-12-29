import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { UserCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BecomeCoordinatorButton({ user }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();

  const { data: existingRequest } = useQuery({
    queryKey: ['coordinator-request', user?.email],
    queryFn: async () => {
      const requests = await base44.entities.CoordinatorRequest.filter({ 
        user_email: user.email 
      });
      return requests[0];
    },
    enabled: !!user && !user.is_coordinator,
  });

  const requestMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.CoordinatorRequest.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['coordinator-request']);
      setOpen(false);
      setReason('');
      toast.success('Coordinator request submitted successfully!');
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

    requestMutation.mutate({
      user_email: user.email,
      user_name: user.full_name,
      reason: reason.trim(),
      status: 'pending',
    });
  };

  if (!user || user.is_coordinator || user.role === 'admin') {
    return null;
  }

  if (existingRequest) {
    return (
      <Button disabled variant="outline" className="gap-2">
        <UserCheck className="w-4 h-4" />
        Request {existingRequest.status}
      </Button>
    );
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-purple-600 hover:bg-purple-700 gap-2">
        <UserCheck className="w-4 h-4" />
        Become a Coordinator
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request to Become a Coordinator</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Why do you want to become a coordinator?</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain your motivation and relevant experience..."
                className="mt-2 h-32"
              />
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleSubmit} 
                disabled={requestMutation.isPending}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
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