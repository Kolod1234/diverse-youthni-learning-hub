import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Star, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function DifficultyRating({ lessonId, onComplete }) {
  const [showDialog, setShowDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: (data) => base44.entities.LessonDifficulty.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['lesson-difficulty']);
      toast.success('Thank you for your feedback!');
      setShowDialog(false);
      setRating(0);
      setFeedback('');
      onComplete?.();
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error('Please select a difficulty rating');
      return;
    }

    submitMutation.mutate({
      lesson_id: lessonId,
      rating,
      feedback,
    });
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDialog(true)}
        className="gap-2"
      >
        <Star className="w-4 h-4" />
        Rate Difficulty
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How difficult was this lesson?</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setRating(value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    rating === value
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Star
                    className={`w-8 h-8 ${
                      rating >= value ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="text-center text-sm text-gray-600">
              {rating === 1 && 'Very Easy'}
              {rating === 2 && 'Easy'}
              {rating === 3 && 'Moderate'}
              {rating === 4 && 'Challenging'}
              {rating === 5 && 'Very Difficult'}
            </div>

            <Textarea
              placeholder="Any specific feedback? (optional)"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
            />

            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={submitMutation.isPending || rating === 0}
            >
              Submit Rating
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}