import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import usePullToRefresh from '@/components/lesson/usePullToRefresh';
import { Card, Button, TextField, Chip, Avatar as MuiAvatar, Dialog as MuiDialog, DialogTitle as MuiDialogTitle, DialogContent as MuiDialogContent } from '@mui/material';
const Textarea = ({ className, ...props }) => <TextField fullWidth multiline rows={4} className={className} {...props} />;
const Input = ({ className, ...props }) => <TextField fullWidth size="small" className={className} {...props} />;
const Avatar = ({ children, className, ...props }) => <MuiAvatar className={className} {...props}>{children}</MuiAvatar>;
const AvatarImage = () => null;
const AvatarFallback = ({ children, className }) => <span className={className}>{children}</span>;
const Badge = ({ children, className, variant, ...props }) => <Chip label={children} size="small" variant={variant === 'outline' ? 'outlined' : 'filled'} className={className} {...props} />;
const Dialog = ({ open, onOpenChange, children }) => <MuiDialog open={!!open} onClose={() => onOpenChange?.(false)} maxWidth="md" fullWidth>{children}</MuiDialog>;
const DialogContent = ({ children, className }) => <MuiDialogContent className={className}>{children}</MuiDialogContent>;
const DialogHeader = ({ children }) => <>{children}</>;
const DialogTitle = ({ children, className }) => <MuiDialogTitle className={className}>{children}</MuiDialogTitle>;
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PushPinIcon from '@mui/icons-material/PushPin';
import AddIcon from '@mui/icons-material/Add';
const _w = (I) => ({ size, color, className, style, ...r }) => <I className={className} style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const Heart = _w(FavoriteIcon), MessageCircle = _w(ChatBubbleOutlineIcon), Pin = _w(PushPinIcon), Plus = _w(AddIcon);
import { toast } from 'sonner';
import { format } from 'date-fns';
import CommunityPostChat from '@/components/chat/CommunityPostChat';

export default function Community() {
  const [user, setUser] = useState(null);
  const [expandedPostId, setExpandedPostId] = useState(null);
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
    announcement: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300',
    event: 'bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300',
    achievement: 'bg-yellow-100 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-300',
    discussion: 'bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-300',
    question: 'bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-300'
  };

  const pinnedPosts = posts.filter(p => p.is_pinned);
  const regularPosts = posts.filter(p => !p.is_pinned);

  usePullToRefresh(() => {
    queryClient.invalidateQueries(['community-posts']);
  });

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Community</h1>
            <p className="text-muted-foreground">Connect with fellow students and share</p>
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
                  <h3 className="font-bold text-foreground text-lg mb-2">{post.title}</h3>
                  <p className="text-foreground mb-4">{post.content}</p>
                  {post.image_url && (
                    <img src={post.image_url} alt={post.title} className="rounded-lg mb-4 max-h-64 object-cover" />
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <button 
                      onClick={() => likePostMutation.mutate({ id: post.id, likes: post.likes_count || 0 })}
                      className="flex items-center gap-1 hover:text-red-600"
                    >
                      <Heart className="w-4 h-4" />
                      {post.likes_count || 0}
                    </button>
                    <span className="ml-auto">{format(new Date(post.created_date), 'MMM d, yyyy')}</span>
                  </div>
                  {user && <CommunityPostChat post={post} currentUser={user} />}
                </div>
              </div>
            </Card>
          ))}

          {regularPosts.map(post => (
            <Card key={post.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarFallback className="bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600">
                    {post.created_by?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={categoryColors[post.category]}>{post.category}</Badge>
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{post.title}</h3>
                  <p className="text-foreground mb-4">{post.content}</p>
                  {post.image_url && (
                    <img src={post.image_url} alt={post.title} className="rounded-lg mb-4 max-h-64 object-cover" />
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <button 
                      onClick={() => likePostMutation.mutate({ id: post.id, likes: post.likes_count || 0 })}
                      className="flex items-center gap-1 hover:text-red-600"
                    >
                      <Heart className="w-4 h-4" />
                      {post.likes_count || 0}
                    </button>
                    <span className="ml-auto">{format(new Date(post.created_date), 'MMM d, yyyy')}</span>
                  </div>
                  {user && <CommunityPostChat post={post} currentUser={user} />}
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