import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Star, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LessonFeedbackForm({ lesson, courseId, onClose }) {
  const [ratings, setRatings] = useState({
    content_quality: 0,
    relevance: 0,
    clarity: 0,
    engagement: 0,
  });
  const [comment, setComment] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState(null);
  const [hovered, setHovered] = useState({});

  const submitFeedback = useMutation({
    mutationFn: async (feedbackData) => {
      return await base44.entities.LessonFeedback.create({
        lesson_id: lesson.id,
        course_id: courseId,
        content_quality: ratings.content_quality,
        relevance: ratings.relevance,
        clarity: ratings.clarity,
        engagement: ratings.engagement,
        comment: comment || null,
        suggestions: suggestions || null,
        would_recommend: wouldRecommend,
      });
    },
    onSuccess: () => {
      setTimeout(() => onClose?.(), 1500);
    },
  });

  const allRatingsSet = Object.values(ratings).every(r => r > 0);
  const canSubmit = allRatingsSet && (comment || suggestions || wouldRecommend !== null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <Card className="w-full max-w-2xl bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            Share Your Feedback
          </CardTitle>
          <CardDescription>
            Help us improve "{lesson.title}" by sharing your thoughts
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Rating Section */}
          <div className="space-y-4">
            {[
              { key: 'content_quality', label: 'Content Quality', emoji: '✨' },
              { key: 'relevance', label: 'Relevance to Course', emoji: '🎯' },
              { key: 'clarity', label: 'Clarity of Explanation', emoji: '💡' },
              { key: 'engagement', label: 'Engagement Level', emoji: '🎪' },
            ].map(({ key, label, emoji }) => (
              <div key={key}>
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-2">
                  <span>{emoji}</span> {label}
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatings(prev => ({ ...prev, [key]: star }))}
                      onMouseEnter={() => setHovered(prev => ({ ...prev, [key]: star }))}
                      onMouseLeave={() => setHovered(prev => ({ ...prev, [key]: 0 }))}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 transition-all ${
                          star <= (hovered[key] || ratings[key])
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Would Recommend */}
          <div className="bg-slate-100 p-4 rounded-lg">
            <label className="text-sm font-medium text-slate-700 block mb-3">
              Would you recommend this lesson to others?
            </label>
            <div className="flex gap-3">
              {[
                { value: true, label: '👍 Yes, definitely', color: 'bg-green-100 border-green-300' },
                { value: false, label: '👎 No, not really', color: 'bg-red-100 border-red-300' },
                { value: null, label: '🤔 Not sure', color: 'bg-slate-200 border-slate-300' },
              ].map(({ value, label, color }) => (
                <button
                  key={String(value)}
                  onClick={() => setWouldRecommend(wouldRecommend === value ? null : value)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    wouldRecommend === value ? color + ' border-2' : 'border-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Additional Comments (optional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike about this lesson?"
              className="min-h-24"
            />
          </div>

          {/* Suggestions */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Suggestions for Improvement (optional)
            </label>
            <Textarea
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              placeholder="How could we make this lesson better?"
              className="min-h-20"
            />
          </div>

          {/* Status Messages */}
          {submitFeedback.isPending && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-blue-800 text-sm">
              Submitting your feedback...
            </div>
          )}

          {submitFeedback.isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-green-800 text-sm font-medium">Thank you! Your feedback helps us improve.</span>
            </motion.div>
          )}

          {submitFeedback.isError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-red-800 text-sm font-medium">Error submitting feedback. Please try again.</span>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button
              onClick={() => onClose?.()}
              variant="outline"
              className="flex-1"
              disabled={submitFeedback.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => submitFeedback.mutate()}
              disabled={!canSubmit || submitFeedback.isPending}
              className={`flex-1 ${
                canSubmit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-300'
              }`}
            >
              {submitFeedback.isPending ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>

          {!allRatingsSet && (
            <p className="text-xs text-slate-500 text-center">
              ⭐ Please rate all categories to proceed
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}