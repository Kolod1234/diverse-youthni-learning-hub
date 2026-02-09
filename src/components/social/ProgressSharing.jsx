import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Share2, Trophy, TrendingUp, Award, Heart } from 'lucide-react';
import { toast } from 'sonner';
import moment from 'moment';

export default function ProgressSharing({ courseId }) {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const likeEnrollmentMutation = useMutation({
    mutationFn: async ({ enrollmentId, currentLikes }) => {
      await base44.entities.Enrollment.update(enrollmentId, {
        likes_count: (currentLikes || 0) + 1
      });
    },
    onMutate: async ({ enrollmentId, currentLikes }) => {
      await queryClient.cancelQueries(['all-enrollments']);
      const previousData = queryClient.getQueryData(['all-enrollments']);
      queryClient.setQueryData(['all-enrollments'], (old) =>
        old.map(e => e.id === enrollmentId ? { ...e, likes_count: (currentLikes || 0) + 1 } : e)
      );
      return { previousData };
    },
    onError: (err, newData, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['all-enrollments'], context.previousData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-enrollments']);
    }
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['all-enrollments', courseId],
    queryFn: async () => {
      const allEnrollments = await base44.entities.Enrollment.filter({ course_id: courseId }, '-updated_date', 50);
      const users = await base44.entities.User.list('id', 1000);
      const userMap = users.reduce((acc, u) => ({ ...acc, [u.email]: u }), {});
      
      return allEnrollments.map(e => ({
        ...e,
        user: userMap[e.created_by] || { full_name: 'Anonymous', email: e.created_by }
      }));
    }
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ['all-user-progress'],
    queryFn: async () => {
      const progress = await base44.entities.UserProgress.list('-points', 50);
      const users = await base44.entities.User.list('id', 1000);
      const userMap = users.reduce((acc, u) => ({ ...acc, [u.email]: u }), {});
      
      return progress.map(p => ({
        ...p,
        user: userMap[p.created_by] || { full_name: 'Anonymous', email: p.created_by }
      }));
    }
  });

  const handleShareProgress = () => {
    const myEnrollment = enrollments.find(e => e.created_by === user?.email);
    if (!myEnrollment) return;
    
    const shareText = `I'm ${myEnrollment.progress_percent}% through this course! 🎓`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Learning Progress',
        text: shareText,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Progress copied to clipboard!');
    }
  };

  const activeEnrollments = enrollments.filter(e => !e.is_completed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Community Progress</h2>
          <p className="text-gray-600">See how others are progressing</p>
        </div>
        <Button onClick={handleShareProgress} variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          Share My Progress
        </Button>
      </div>

      {/* Top Performers */}
      <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Top Performers
        </h3>
        <div className="space-y-3">
          {userProgress.slice(0, 5).map((up, index) => (
            <div key={up.id} className="flex items-center gap-3 bg-white/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
              <Avatar>
                <AvatarImage src={up.user.avatar} />
                <AvatarFallback>{up.user.full_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{up.user.full_name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Award className="w-3 h-3" />
                  <span>Level {up.level} • {up.points} XP</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Course Progress */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Learning Together
        </h3>
        {activeEnrollments.map(enrollment => (
          <Card key={enrollment.id} className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar>
                <AvatarImage src={enrollment.user.avatar} />
                <AvatarFallback>{enrollment.user.full_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{enrollment.user.full_name}</p>
                <p className="text-sm text-gray-500">
                  Active {moment(enrollment.updated_date).fromNow()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-indigo-600">
                  {enrollment.progress_percent || 0}%
                </p>
                <p className="text-xs text-gray-500">Complete</p>
              </div>
            </div>
            <Progress value={enrollment.progress_percent || 0} className="h-2" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => likeEnrollmentMutation.mutate({ enrollmentId: enrollment.id, currentLikes: enrollment.likes_count })}
              className="mt-2 text-red-500 hover:text-red-600"
            >
              <Heart className="w-4 h-4 mr-1" />
              {enrollment.likes_count || 0}
            </Button>
            </Card>
            ))}
            </div>

      {activeEnrollments.length === 0 && (
        <Card className="p-12 text-center">
          <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No active learners yet</h3>
          <p className="text-gray-500">Be the first to start learning!</p>
        </Card>
      )}
    </div>
  );
}