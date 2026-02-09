import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePullToRefresh } from '@/components/lesson/usePullToRefresh';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Pin, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Community() {
  const [user, setUser] = useState(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'discussion' });
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: posts = [] } = useQuery({
    queryKey: ['community-posts'],
    queryFn: () => base44.entities.CommunityPost.list('-created_date', 100)
  });

  const createPostMutation = useMutation({
    mutationFn: (data) => base44.entities.CommunityPost.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['community-posts']);
      setShowNewPost(false);
      setNewPost({ title: '', content: '', category: 'discussion' });
      toast.success('Post created!');
    }
  });

  const likePostMutation = useMutation({
    mutationFn: ({ id, likes }) => base44.entities.CommunityPost.update(id, { likes_count: likes + 1 }),
    onSuccess: () => queryClient.invalidateQueries(['community-posts'])
  });

  const categoryColors = {
    announcement: 'bg-blue-100 text-blue-700',
    event: 'bg-purple-100 text-purple-700',
    achievement: 'bg-yellow-100 text-yellow-700',
    discussion: 'bg-green-100 text-green-700',
    question: 'bg-orange-100 text-orange-700'
  };

  const pinnedPosts = posts.filter(p => p.is_pinned);
  const regularPosts = posts.filter(p => !p.is_pinned);

  const { pullToRefreshProps } = usePullToRefresh(() => {
    queryClient.invalidateQueries(['community-posts']);
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8" {...pullToRefreshProps}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Community</h1>
            <p className="text-gray-600">Connect with fellow students and share</p>
          </div>
          <Button onClick={() => setShowNewPost(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            <Plus className="w-4 h-4" />
            New Post
          </Button>
        </div>

        <div className="space-y-6">
          {pinnedPosts.map(post => (
            <Card key={post.id} className="p-6 border-2 border-indigo-200 bg-indigo-50/30">
              <div className="flex items-start gap-4">
                <Pin className="w-5 h-5 text-indigo-600 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={categoryColors[post.category]}>{post.category}</Badge>
                    <Badge variant="outline" className="text-xs">Pinned</Badge>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{post.title}</h3>
                  <p className="text-gray-700 mb-4">{post.content}</p>
                  {post.image_url && (
                    <img src={post.image_url} alt={post.title} className="rounded-lg mb-4 max-h-64 object-cover" />
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <button 
                      onClick={() => likePostMutation.mutate({ id: post.id, likes: post.likes_count || 0 })}
                      className="flex items-center gap-1 hover:text-red-600"
                    >
                      <Heart className="w-4 h-4" />
                      {post.likes_count || 0}
                    </button>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {post.comments_count || 0}
                    </span>
                    <span className="ml-auto">{format(new Date(post.created_date), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {regularPosts.map(post => (
            <Card key={post.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarFallback className="bg-indigo-100 text-indigo-600">
                    {post.created_by?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={categoryColors[post.category]}>{post.category}</Badge>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{post.title}</h3>
                  <p className="text-gray-700 mb-4">{post.content}</p>
                  {post.image_url && (
                    <img src={post.image_url} alt={post.title} className="rounded-lg mb-4 max-h-64 object-cover" />
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <button 
                      onClick={() => likePostMutation.mutate({ id: post.id, likes: post.likes_count || 0 })}
                      className="flex items-center gap-1 hover:text-red-600"
                    >
                      <Heart className="w-4 h-4" />
                      {post.likes_count || 0}
                    </button>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {post.comments_count || 0}
                    </span>
                    <span className="ml-auto">{format(new Date(post.created_date), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Dialog open={showNewPost} onOpenChange={setShowNewPost}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input
                placeholder="Post title..."
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              />
              <select
                value={newPost.category}
                onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="discussion">Discussion</option>
                <option value="question">Question</option>
                <option value="achievement">Achievement</option>
                <option value="event">Event</option>
                <option value="announcement">Announcement</option>
              </select>
              <Textarea
                placeholder="Share your thoughts..."
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                rows={6}
              />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowNewPost(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={() => createPostMutation.mutate(newPost)}
                  disabled={!newPost.title || !newPost.content}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Post
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}