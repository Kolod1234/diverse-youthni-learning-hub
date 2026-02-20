import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BecomeCoordinatorButton({ user, onOpen }) {
  const [open, setOpen] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);
  const [passcode, setPasscode] = useState('');
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
      if (existingRequest && existingRequest.status === 'rejected') {
        // Update existing rejected request
        return await base44.entities.CoordinatorRequest.update(existingRequest.id, {
          reason: data.reason,
          status: 'pending',
          processed_by: null,
          processed_date: null
        });
      } else {
        // Create new request
        return await base44.entities.CoordinatorRequest.create(data);
      }
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

  const handlePasscodeSubmit = () => {
    if (passcode === 'YELP26') {
      setShowPasscode(false);
      setOpen(true);
      setPasscode('');
    } else {
      toast.error('Incorrect passcode');
    }
  };

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

  if (existingRequest && existingRequest.status === 'pending') {
    return (
      <button className="flex items-center w-full text-left text-gray-400 cursor-not-allowed">
        <UserCheck className="w-4 h-4 mr-2" />
        Request Pending
      </button>
    );
  }

  if (existingRequest && existingRequest.status === 'approved') {
    return null;
  }

  return (
    <>
      <button 
        onClick={() => {
          setShowPasscode(true);
          setTimeout(() => onOpen?.(), 50);
        }} 
        className="flex items-center w-full text-left hover:bg-gray-100 px-2 py-1.5 rounded-md transition-colors"
      >
        <UserCheck className="w-4 h-4 mr-2" />
        {existingRequest?.status === 'rejected' ? 'Reapply as Coordinator' : 'Become a Coordinator'}
      </button>

      {/* Passcode Dialog */}
      <Dialog open={showPasscode} onOpenChange={setShowPasscode}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Coordinator Passcode</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Passcode</Label>
              <Input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode"
                className="mt-2"
                onKeyPress={(e) => e.key === 'Enter' && handlePasscodeSubmit()}
              />
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handlePasscodeSubmit}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                Submit
              </Button>
              <Button onClick={() => setShowPasscode(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Request Form Dialog */}
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