import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Calendar, Bell, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';

export default function ReviewScheduler({ lessonId, courseId }) {
  const queryClient = useQueryClient();

  const { data: schedules = [] } = useQuery({
    queryKey: ['review-schedule', lessonId],
    queryFn: () => base44.entities.ReviewSchedule.filter({ lesson_id: lessonId }),
  });

  const schedule = schedules[0];

  const createScheduleMutation = useMutation({
    mutationFn: () => {
      const now = new Date();
      return base44.entities.ReviewSchedule.create({
        lesson_id: lessonId,
        course_id: courseId,
        completed_date: now.toISOString(),
        next_review_date: addDays(now, 1).toISOString(),
        interval_days: 1,
        review_count: 0,
        mastery_level: 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['review-schedule', lessonId]);
      toast.success('Spaced repetition schedule created!');
    },
  });

  const updateScheduleMutation = useMutation({
    mutationFn: (performance) => {
      const newInterval = performance === 'good' 
        ? schedule.interval_days * 2 
        : Math.max(1, schedule.interval_days / 2);
      
      const newMastery = Math.min(100, schedule.mastery_level + (performance === 'good' ? 10 : -5));

      return base44.entities.ReviewSchedule.update(schedule.id, {
        next_review_date: addDays(new Date(), newInterval).toISOString(),
        interval_days: newInterval,
        review_count: schedule.review_count + 1,
        mastery_level: newMastery,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['review-schedule', lessonId]);
      toast.success('Review completed!');
    },
  });

  if (!schedule) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Schedule Review Reminders</h3>
          <p className="text-sm text-gray-600 mb-4">
            Use spaced repetition to remember this lesson better
          </p>
          <Button onClick={() => createScheduleMutation.mutate()} className="gap-2">
            <Bell className="w-4 h-4" />
            Enable Reminders
          </Button>
        </div>
      </Card>
    );
  }

  const nextReview = new Date(schedule.next_review_date);
  const isReviewDue = nextReview <= new Date();

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Review Schedule
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Spaced repetition helps you retain knowledge
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {schedule.mastery_level}%
          </div>
          <div className="text-xs text-gray-600">Mastery</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Next Review:</span>
          <span className="font-medium">
            {format(nextReview, 'MMM d, yyyy')}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Reviews Completed:</span>
          <span className="font-medium">{schedule.review_count}</span>
        </div>

        {isReviewDue && (
          <div className="pt-4 border-t space-y-2">
            <p className="text-sm font-medium text-center">How well do you remember?</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => updateScheduleMutation.mutate('poor')}
              >
                Need Review
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={() => updateScheduleMutation.mutate('good')}
              >
                <CheckCircle className="w-4 h-4" />
                Got It!
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}