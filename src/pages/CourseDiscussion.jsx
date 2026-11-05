import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button, Card, TextField, Chip, Avatar as MuiAvatar } from '@mui/material';
const Textarea = ({ className, ...props }) => <TextField fullWidth multiline rows={4} className={className} {...props} />;
const Input = ({ className, ...props }) => <TextField fullWidth size="small" className={className} {...props} />;
const Avatar = ({ children, className, ...props }) => <MuiAvatar className={className} {...props}>{children}</MuiAvatar>;
const AvatarImage = ({ src }) => null;
const AvatarFallback = ({ children, className }) => <span className={className}>{children}</span>;
const Badge = ({ children, className, variant, ...props }) => <Chip label={children} size="small" variant={variant === 'outline' ? 'outlined' : 'filled'} className={className} {...props} />;
import ChatIcon from '@mui/icons-material/Chat';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PushPinIcon from '@mui/icons-material/PushPin';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
const _w = (I) => ({ size, color, className, style, ...r }) => <I className={className} style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const MessageSquare = _w(ChatIcon), ThumbsUp = _w(ThumbUpIcon), Send = _w(SendIcon), ArrowLeft = _w(ArrowBackIcon);
const Pin = _w(PushPinIcon), MessageCircle = _w(ChatBubbleOutlineIcon), Search = _w(SearchIcon);
const Filter = _w(FilterListIcon), Clock = _w(AccessTimeIcon), TrendingUp = _w(TrendingUpIcon);
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function CourseDiscussion() {
  const [user, setUser] = useState(null);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' });
  const [replyContent, setReplyContent] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('courseId');

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0];
    },
    enabled: !!courseId,
  });

  const { data: discussions = [] } = useQuery({
    queryKey: ['discussions', courseId],
    queryFn: () => base44.entities.Discussion.filter({ 
      course_id: courseId,
      parent_id: null 
    }, '-created_date', 100),
    enabled: !!courseId,
  });

  const createDiscussionMutation = useMutation({
    mutationFn: (data) => base44.entities.Discussion.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['discussions', courseId]);
      setNewDiscussion({ title: '', content: '' });
      toast.success('Discussion created!');
    },
  });

  const createReplyMutation = useMutation({
    mutationFn: (data) => base44.entities.Discussion.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['discussions', courseId]);
      queryClient.invalidateQueries(['replies', variables.parent_id]);
      setReplyContent(prev => ({ ...prev, [variables.parent_id]: '' }));
      toast.success('Reply posted!');
    },
  });

  const handleCreateDiscussion = () => {
    if (!newDiscussion.title || !newDiscussion.content) return;
    
    createDiscussionMutation.mutate({
      course_id: courseId,
      title: newDiscussion.title,
      content: newDiscussion.content,
      user_name: user?.full_name,
      user_avatar: user?.avatar,
      replies_count: 0,
      likes_count: 0,
    });
  };

  const handleReply = (parentId) => {
    if (!replyContent[parentId]?.trim()) return;
    
    createReplyMutation.mutate({
      course_id: courseId,
      content: replyContent[parentId],
      user_name: user?.full_name,
      user_avatar: user?.avatar,
      parent_id: parentId,
      replies_count: 0,
      likes_count: 0,
    });
  };

  const filteredDiscussions = discussions.filter(d => 
    !searchQuery || 
    d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedDiscussions = [...filteredDiscussions].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.likes_count || 0) - (a.likes_count || 0);
      case 'active':
        return (b.replies_count || 0) - (a.replies_count || 0);
      default:
        return new Date(b.created_date) - new Date(a.created_date);
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('CourseDetails') + `?id=${courseId}`}>
            <Button variant="ghost" className="mb-4 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Course
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Course Discussion</h1>
          <p className="text-muted-foreground">{course?.title}</p>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'recent' ? 'default' : 'outline'}
              onClick={() => setSortBy('recent')}
              size="sm"
            >
              <Clock className="w-4 h-4 mr-2" />
              Recent
            </Button>
            <Button
              variant={sortBy === 'popular' ? 'default' : 'outline'}
              onClick={() => setSortBy('popular')}
              size="sm"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Popular
            </Button>
          </div>
        </div>

        {/* New Discussion */}
        <Card className="p-6 border-0 shadow-sm mb-6">
          <h2 className="font-semibold text-foreground mb-4">Start a Discussion</h2>
          <div className="space-y-4">
            <Input
              placeholder="Discussion title..."
              value={newDiscussion.title}
              onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
            />
            <Textarea
              placeholder="What's on your mind?"
              value={newDiscussion.content}
              onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
              rows={4}
            />
            <Button 
              onClick={handleCreateDiscussion}
              disabled={!newDiscussion.title || !newDiscussion.content || createDiscussionMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Post Discussion
            </Button>
          </div>
        </Card>

        {/* Discussions List */}
        <div className="space-y-4">
          {sortedDiscussions.map((discussion, index) => (
            <DiscussionCard
              key={discussion.id}
              discussion={discussion}
              index={index}
              courseId={courseId}
              onReply={handleReply}
              replyContent={replyContent[discussion.id] || ''}
              onReplyChange={(content) => setReplyContent({ ...replyContent, [discussion.id]: content })}
            />
          ))}

          {sortedDiscussions.length === 0 && (
            <Card className="p-12 text-center border-0 shadow-sm">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No discussions yet</h3>
              <p className="text-muted-foreground">Be the first to start a discussion!</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function DiscussionCard({ discussion, index, courseId, onReply, replyContent, onReplyChange }) {
  const [showReplies, setShowReplies] = useState(false);
  const queryClient = useQueryClient();

  const { data: replies = [] } = useQuery({
    queryKey: ['replies', discussion.id],
    queryFn: () => base44.entities.Discussion.filter({ parent_id: discussion.id }, 'created_date', 50),
    enabled: showReplies,
  });

  return (
    <motion.div


    >
      <Card className="p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex gap-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={discussion.user_avatar} />
            <AvatarFallback className="bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600">
              {discussion.user_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{discussion.title}</h3>
                  {discussion.is_pinned && (
                    <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300">
                      <Pin className="w-3 h-3 mr-1" />
                      Pinned
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {discussion.user_name} • {format(new Date(discussion.created_date), 'MMM d, yyyy')}
                </p>
              </div>
            </div>

            <p className="text-foreground mb-4">{discussion.content}</p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <button className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                <ThumbsUp className="w-4 h-4" />
                <span>{discussion.likes_count || 0}</span>
              </button>
              <button 
                className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                onClick={() => setShowReplies(!showReplies)}
              >
                <MessageCircle className="w-4 h-4" />
                <span>{discussion.replies_count || 0} {discussion.replies_count === 1 ? 'reply' : 'replies'}</span>
              </button>
            </div>

            {/* Replies */}
            {showReplies && (
              <div className="mt-4 pl-4 border-l-2 border-border space-y-4">
                {replies.map((reply) => (
                  <div key={reply.id} className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={reply.user_avatar} />
                      <AvatarFallback className="bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 text-xs">
                        {reply.user_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg p-3">
                        <p className="text-sm font-medium text-foreground mb-1">{reply.user_name}</p>
                        <p className="text-sm text-foreground">{reply.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(reply.created_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Reply Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => onReplyChange(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        onReply(discussion.id);
                      }
                    }}
                  />
                  <Button 
                    size="sm"
                    onClick={() => onReply(discussion.id)}
                    disabled={!replyContent.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}