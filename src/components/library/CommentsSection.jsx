import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function CommentsSection({ resourceId }) {
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['file-comments', resourceId],
    queryFn: () => base44.entities.FileComment.filter({ resource_id: resourceId }, '-created_date', 100)
  });

  const commentMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.FileComment.create(data);
      await base44.entities.FileActivity.create({
        resource_id: resourceId,
        action: 'commented',
        user_name: user.full_name,
        details: data.comment.substring(0, 50)
      });
      await base44.functions.invoke('sendCommentNotification', {
        resource_id: resourceId,
        commenter_name: user.full_name,
        comment: data.comment
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['file-comments']);
      setComment('');
      toast.success('Comment added!');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    commentMutation.mutate({
      resource_id: resourceId,
      comment: comment.trim(),
      user_name: user.full_name,
      user_avatar: user.avatar
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Comments ({comments.length})</h3>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={!comment.trim() || commentMutation.isPending}>
          <Send className="w-4 h-4" />
        </Button>
      </form>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3 bg-gray-50 rounded-lg p-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={c.user_avatar} />
              <AvatarFallback>{c.user_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900">{c.user_name}</span>
                <span className="text-xs text-gray-500">
                  {new Date(c.created_date).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-700">{c.comment}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-4">No comments yet</p>
        )}
      </div>
    </div>
  );
}