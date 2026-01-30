import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import LessonFeedbackForm from './LessonFeedbackForm';

export default function FeedbackButton({ lesson, courseId, className = "" }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={`gap-2 ${className}`}
        >
          <MessageSquare className="w-4 h-4" />
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0 border-0 shadow-2xl">
        <LessonFeedbackForm 
          lesson={lesson} 
          courseId={courseId}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}