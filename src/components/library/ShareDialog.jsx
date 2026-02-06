import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Share2, Users, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function ShareDialog({ resource, open, onOpenChange }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [permission, setPermission] = useState('view');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: shares = [] } = useQuery({
    queryKey: ['file-shares', resource?.id],
    queryFn: () => base44.entities.FileShare.filter({ resource_id: resource.id }),
    enabled: !!resource?.id
  });

  const shareMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.FileShare.create(data);
      await base44.entities.FileActivity.create({
        resource_id: resource.id,
        action: 'shared',
        user_name: user.full_name,
        details: `Shared with ${data.shared_with_email}`
      });
      await base44.functions.invoke('sendFileShareNotification', {
        resource_id: resource.id,
        resource_title: resource.title,
        shared_with_email: data.shared_with_email,
        shared_by_name: user.full_name,
        message: data.message
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['file-shares']);
      setEmail('');
      setMessage('');
      toast.success('File shared successfully!');
    }
  });

  const removeMutation = useMutation({
    mutationFn: (id) => base44.entities.FileShare.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['file-shares']);
      toast.success('Share removed');
    }
  });

  const handleShare = () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }
    shareMutation.mutate({
      resource_id: resource.id,
      shared_with_email: email,
      shared_by_email: user.email,
      shared_by_name: user.full_name,
      message,
      permission
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share "{resource?.title}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Email Address</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              type="email"
            />
          </div>

          <div>
            <Label>Permission</Label>
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="view">View only</option>
              <option value="download">View & Download</option>
            </select>
          </div>

          <div>
            <Label>Message (optional)</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message for the recipient..."
              rows={3}
            />
          </div>

          <Button onClick={handleShare} disabled={shareMutation.isPending} className="w-full">
            {shareMutation.isPending ? 'Sharing...' : 'Share File'}
          </Button>

          {shares.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Shared with</span>
              </div>
              <div className="space-y-2">
                {shares.map((share) => (
                  <div key={share.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{share.shared_with_email}</p>
                      <p className="text-xs text-gray-500">
                        Shared by {share.shared_by_name} • {new Date(share.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{share.permission}</Badge>
                      <button
                        onClick={() => removeMutation.mutate(share.id)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}