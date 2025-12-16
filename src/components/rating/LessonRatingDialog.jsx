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
      // Save lesson rating
      await base44.entities.Review.create({
        course_id: course.id,
        lesson_id: lesson.id,
        rating: data.lessonRating,
        comment: data.lessonComment,
        rating_type: 'lesson'
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
      toast.success('Thank you for your feedback!');
      onComplete();
      onOpenChange(false);
    },
  });

  const handleSubmit = () => {
    if (lessonRating === 0 || tutorRating === 0) {
      toast.error('Please provide ratings for both lesson and tutor');
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
          <DialogTitle className="text-2xl">How was this lesson?</DialogTitle>
          <DialogDescription>
            Your feedback helps us improve the learning experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Lesson Rating */}
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Rate this Lesson</h3>
              <p className="text-sm text-gray-500">{lesson?.title}</p>
            </div>
            <StarRating
              rating={lessonRating}
              setRating={setLessonRating}
              hovered={hoveredLessonStar}
              setHovered={setHoveredLessonStar}
            />
            <Textarea
              placeholder="What did you think about this lesson? (Optional)"
              value={lessonComment}
              onChange={(e) => setLessonComment(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>

          {/* Tutor Rating */}
          <div className="space-y-3 pt-4 border-t">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Rate the Tutor</h3>
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