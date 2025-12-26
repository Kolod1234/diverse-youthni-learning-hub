import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function LessonRatingDialog({ 
  open, 
  onOpenChange, 
  lesson, 
  course,
  onComplete 
}) {
  const [lessonRating, setLessonRating] = useState(0);
  const [tutorRating, setTutorRating] = useState(0);
  const [lessonComment, setLessonComment] = useState('');
  const [tutorComment, setTutorComment] = useState('');
  const [hoveredLessonStar, setHoveredLessonStar] = useState(0);
  const [hoveredTutorStar, setHoveredTutorStar] = useState(0);
  const queryClient = useQueryClient();

  const submitRatingMutation = useMutation({
    mutationFn: async (data) => {
      // Get current user info
      const user = await base44.auth.me();

      // Save lesson rating
      await base44.entities.Review.create({
        course_id: course.id,
        lesson_id: lesson.id,
        rating: data.lessonRating,
        comment: data.lessonComment,
        rating_type: 'lesson',
        user_name: user.full_name,
        user_avatar: user.avatar,
        is_verified_purchase: true
      });

      // Save tutor rating
      await base44.entities.Review.create({
        course_id: course.id,
        lesson_id: lesson.id,
        rating: data.tutorRating,
        comment: data.tutorComment,
        rating_type: 'tutor',
        instructor_name: course.instructor
      });

      // Update course average rating
      const allReviews = await base44.entities.Review.filter({ course_id: course.id });
      const tutorReviews = allReviews.filter(r => r.rating_type === 'tutor');
      if (tutorReviews.length > 0) {
        const avgRating = tutorReviews.reduce((sum, r) => sum + r.rating, 0) / tutorReviews.length;
        await base44.entities.Course.update(course.id, { rating: avgRating });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews']);
      queryClient.invalidateQueries(['course']);
      queryClient.invalidateQueries(['all-reviews']);
      toast.success('✨ Thank you! Your review has been submitted and may be featured on our homepage!');
      onComplete();
      onOpenChange(false);
    },
  });

  const handleSubmit = () => {
    if (lessonRating === 0 || tutorRating === 0) {
      toast.error('Please provide ratings for both lesson and instructor');
      return;
    }

    if (!lessonComment.trim() || lessonComment.trim().length < 30) {
      toast.error('Please write a detailed review (at least 30 characters) about your experience');
      return;
    }

    submitRatingMutation.mutate({
      lessonRating,
      tutorRating,
      lessonComment,
      tutorComment,
    });
  };

  const handleSkip = () => {
    onComplete();
    onOpenChange(false);
  };

  const StarRating = ({ rating, setRating, hovered, setHovered }) => (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => setRating(star)}
          className="focus:outline-none"
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              star <= (hovered || rating)
                ? 'fill-[#FF8C00] text-[#FF8C00]'
                : 'text-gray-300'
            }`}
          />
        </motion.button>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Share Your Experience</DialogTitle>
          <DialogDescription>
            Your review helps other learners make informed decisions. Tell us about your experience!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Lesson Rating */}
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">How would you rate this lesson?</h3>
              <p className="text-sm text-gray-500">{lesson?.title}</p>
            </div>
            <StarRating
              rating={lessonRating}
              setRating={setLessonRating}
              hovered={hoveredLessonStar}
              setHovered={setHoveredLessonStar}
            />
            <div>
              <Textarea
                placeholder="Share your experience with this lesson... What did you learn? How was the content? (Required - min 30 characters)"
                value={lessonComment}
                onChange={(e) => setLessonComment(e.target.value)}
                className="resize-none"
                rows={3}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                ✨ Your review will be featured on our homepage to help other learners!
              </p>
            </div>
          </div>

          {/* Tutor Rating */}
          <div className="space-y-3 pt-4 border-t">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">How would you rate the instructor?</h3>
              <p className="text-sm text-gray-500">{course?.instructor}</p>
            </div>
            <StarRating
              rating={tutorRating}
              setRating={setTutorRating}
              hovered={hoveredTutorStar}
              setHovered={setHoveredTutorStar}
            />
            <Textarea
              placeholder="How was the teaching style and content delivery? (Optional)"
              value={tutorComment}
              onChange={(e) => setTutorComment(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={submitRatingMutation.isPending}
          >
            Skip for now
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitRatingMutation.isPending || lessonRating === 0 || tutorRating === 0}
            className="bg-[#FF8C00] hover:bg-[#CC7000]"
          >
            {submitRatingMutation.isPending ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}