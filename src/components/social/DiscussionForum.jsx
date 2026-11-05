import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, ThumbsUp, Reply, Pin, Search } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import moment from 'moment';

export default function DiscussionForum({ courseId, lessonId = null }) {
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: discussions = [], isLoading } = useQuery({
    queryKey: ['discussions', courseId, lessonId],
    queryFn: async () => {
      const filter = lessonId 
        ? { course_id: courseId, lesson_id: lessonId }
        : { course_id: courseId };
      return base44.entities.Discussion.filter(filter, '-created_date', 100);
    }
  });

  const createPostMutation = useMutation({
    mutationFn: (data) => base44.entities.Discussion.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['discussions']);
      setNewPost({ title: '', content: '' });
      toast.success('Post created!');
    }
  });

  const createReplyMutation = useMutation({
    mutationFn: (data) => base44.entities.Discussion.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['discussions']);
      setReplyContent('');
      setReplyTo(null);
      toast.success('Reply added!');
    }
  });

  const likeMutation = useMutation({
    mutationFn: async ({ id, currentLikes }) => {
      await base44.entities.Discussion.update(id, {
        likes_count: (currentLikes || 0) + 1
      });
    },
    onMutate: async ({ id, currentLikes }) => {
      await queryClient.cancelQueries(['discussions']);
      const previousData = queryClient.getQueryData(['discussions']);
      queryClient.setQueryData(['discussions'], (old) => 
        old.map(d => d.id === id ? { ...d, likes_count: (currentLikes || 0) + 1 } : d)
      );
      return { previousData };
    },
    onError: (err, newData, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['discussions'], context.previousData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['discussions']);
    }
  });

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    createPostMutation.mutate({
      course_id: courseId,
      lesson_id: lessonId,
      title: newPost.title,
      content: newPost.content,
      user_name: user?.full_name || 'Anonymous',
      user_avatar: user?.avatar,
      likes_count: 0,
      replies_count: 0
    });
  };

  const handleReply = (parentId) => {
    if (!replyContent.trim()) return;
    createReplyMutation.mutate({
      course_id: courseId,
      lesson_id: lessonId,
      content: replyContent,
      parent_id: parentId,
      user_name: user?.full_name || 'Anonymous',
      user_avatar: user?.avatar,
      likes_count: 0
    });
  };

  const posts = discussions.filter(d => !d.parent_id);
  const filteredPosts = searchQuery 
    ? posts.filter(p => 
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : posts;

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search discussions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* New Post */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Start a Discussion</h3>
        <div className="space-y-3">
          <Input
            placeholder="Discussion title..."
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
          />
          <Textarea
            placeholder="Share your thoughts, ask a question..."
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            rows={4}
          />
          <Button onClick={handleCreatePost} disabled={createPostMutation.isPending}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Post Discussion
          </Button>
        </div>
      </Card>

      {/* Discussions List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-full" />
            </Card>
          ))}
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="space-y-4">
          {filteredPosts.map((post, index) => {
            const replies = discussions.filter(d => d.parent_id === post.id);
            return (
              <motion.div
                key={post.id}
              >
                <Card className="p-6">
                  <div className="flex gap-4">
                    <Avatar>
                      <AvatarImage src={post.user_avatar} />
                      <AvatarFallback>{post.user_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-lg">{post.title}</h4>
                          <p className="text-sm text-gray-500">
                            {post.user_name} • {moment(post.created_date).fromNow()}
                          </p>
                        </div>
                        {post.is_pinned && <Pin className="w-5 h-5 text-orange-500" />}
                      </div>
                      <p className="text-gray-700 mb-4">{post.content}</p>
                      
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => likeMutation.mutate({ id: post.id, currentLikes: post.likes_count })}
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {post.likes_count || 0}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReplyTo(replyTo === post.id ? null : post.id)}
                        >
                          <Reply className="w-4 h-4 mr-1" />
                          {replies.length} Replies
                        </Button>
                      </div>

                      {/* Reply Form */}
                      {replyTo === post.id && (
                        <div className="mt-4 space-y-3 border-l-2 border-indigo-500 pl-4">
                          <Textarea
                            placeholder="Write a reply..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleReply(post.id)}>
                              Post Reply
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setReplyTo(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Replies */}
                      {replies.length > 0 && (
                        <div className="mt-4 space-y-3 border-l-2 border-gray-200 pl-4">
                          {replies.map(reply => (
                            <div key={reply.id} className="flex gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={reply.user_avatar} />
                                <AvatarFallback>{reply.user_name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm">{reply.user_name}</span>
                                  <span className="text-xs text-gray-500">
                                    {moment(reply.created_date).fromNow()}
                                  </span>
                                </div>
                                <p className="text-gray-700 text-sm">{reply.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No discussions yet</h3>
          <p className="text-gray-500">Be the first to start a conversation!</p>
        </Card>
      )}
    </div>
  );
}