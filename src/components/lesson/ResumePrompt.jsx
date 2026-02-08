import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlayCircle, RotateCcw } from 'lucide-react';

export default function ResumePrompt({ open, onOpenChange, lastPosition, onResume, onStartOver }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome Back!</DialogTitle>
          <DialogDescription>
            You were previously at {Math.round(lastPosition?.progress || 0)}% through this lesson.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 mt-4">
          <Button
            onClick={onResume}
            className="w-full gap-2"
          >
            <PlayCircle className="w-4 h-4" />
            Continue Where I Left Off
          </Button>
          
          <Button
            onClick={onStartOver}
            variant="outline"
            className="w-full gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Start From Beginning
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}