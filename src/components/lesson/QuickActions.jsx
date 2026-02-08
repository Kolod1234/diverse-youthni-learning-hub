import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, MessageSquare, Bookmark, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function QuickActions({ lesson, onOpenNotes, onAddBookmark, onOpenDiscussion }) {
  const shareLessonProgress = async () => {
    const shareData = {
      title: `Learning: ${lesson.title}`,
      text: `I'm currently learning about ${lesson.title}!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error.name !== 'AbortError') {
          navigator.clipboard.writeText(window.location.href);
          toast.success('Link copied to clipboard!');
        }
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-40">
      <Button
        onClick={onAddBookmark}
        size="icon"
        className="rounded-full shadow-lg"
        title="Add bookmark (Ctrl+B)"
      >
        <Bookmark className="w-4 h-4" />
      </Button>
      
      <Button
        onClick={onOpenNotes}
        size="icon"
        variant="outline"
        className="rounded-full shadow-lg bg-white"
        title="Open notes"
      >
        <FileText className="w-4 h-4" />
      </Button>
      
      <Button
        onClick={shareLessonProgress}
        size="icon"
        variant="outline"
        className="rounded-full shadow-lg bg-white"
        title="Share lesson"
      >
        <Share2 className="w-4 h-4" />
      </Button>
      
      <Button
        onClick={onOpenDiscussion}
        size="icon"
        variant="outline"
        className="rounded-full shadow-lg bg-white"
        title="Discussion"
      >
        <MessageSquare className="w-4 h-4" />
      </Button>
    </div>
  );
}