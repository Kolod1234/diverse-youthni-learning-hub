import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Users, Heart, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SocialFeedWidget() {
  const { data: posts = [] } = useQuery({
    queryKey: ['community-posts-widget'],
    queryFn: () => base44.entities.CommunityPost.list('-created_date', 5)
  });

  if (posts.length === 0) return null;

  return (
    <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-white">Community Feed</h3>
        </div>
        <Link to={createPageUrl('Community')}>
          <span className="text-xs text-purple-400 hover:text-purple-300">View All</span>
        </Link>
      </div>
      <div className="space-y-3">
        {posts.slice(0, 3).map((post) => (
          <div
            key={post.id}
            className="bg-slate-800/50 hover:bg-slate-700/50 p-3 rounded-lg transition-all"
          >
            <p className="text-sm font-medium text-white mb-2 line-clamp-2">{post.title}</p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {post.likes_count || 0}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {post.comments_count || 0}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}