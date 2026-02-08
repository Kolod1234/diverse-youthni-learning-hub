import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MessageSquare, ThumbsUp, AlertCircle, Lightbulb, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function InlineDiscussion({ lessonId, paragraphIndex }) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: annotations = [] } = useQuery({
    queryKey: ['annotations', lessonId, paragraphIndex],
    queryFn: () => base44.entities.LessonAnnotation.filter({
      lesson_id: lessonId,
      paragraph_index: paragraphIndex,
      is_shared: true,
    }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LessonAnnotation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['annotations', lessonId, paragraphIndex]);
      setNewComment('');
      toast.success('Comment added!');
    },
  });

  const reactMutation = useMutation({
    mutationFn: ({ id, reaction }) => {
      const annotation = annotations.find(a => a.id === id);
      const currentReactions = annotation.reactions || {};
      return base44.entities.LessonAnnotation.update(id, {
        reactions: {
          ...currentReactions,
          [reaction]: (currentReactions[reaction] || 0) + 1,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['annotations', lessonId, paragraphIndex]);
    },
  });

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    
    createMutation.mutate({
      lesson_id: lessonId,
      paragraph_index: paragraphIndex,
      content: newComment,
      user_name: user?.full_name || 'Anonymous',
      user_avatar: user?.avatar,
      is_shared: true,
      reactions: { helpful: 0, confusing: 0, interesting: 0 },
    });
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowComments(!showComments)}
        className="text-blue-600 hover:text-blue-700 relative"
      >
        <MessageSquare className="w-5 h-5" />
        {annotations.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {annotations.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-0 top-8 w-96 bg-white rounded-lg shadow-xl border-2 border-blue-100 p-4 z-50"
          >
            <h4 className="font-semibold mb-3">Discussion</h4>
            
            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
              {annotations.map((annotation) => (
                <div key={annotation.id} className="bg-gray-50 rounded p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {annotation.user_name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{annotation.user_name}</div>
                      <p className="text-sm text-gray-700 mt-1">{annotation.content}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => reactMutation.mutate({ id: annotation.id, reaction: 'helpful' })}
                      className="flex items-center gap-1 text-xs text-gray-600 hover:text-green-600"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      {annotation.reactions?.helpful || 0}
                    </button>
                    <button
                      onClick={() => reactMutation.mutate({ id: annotation.id, reaction: 'confusing' })}
                      className="flex items-center gap-1 text-xs text-gray-600 hover:text-orange-600"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {annotation.reactions?.confusing || 0}
                    </button>
                    <button
                      onClick={() => reactMutation.mutate({ id: annotation.id, reaction: 'interesting' })}
                      className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600"
                    >
                      <Lightbulb className="w-3 h-3" />
                      {annotation.reactions?.interesting || 0}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder="Add your comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <Button
                onClick={handleSubmit}
                className="w-full gap-2"
                disabled={!newComment.trim() || createMutation.isPending}
              >
                <Send className="w-4 h-4" />
                Post Comment
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}