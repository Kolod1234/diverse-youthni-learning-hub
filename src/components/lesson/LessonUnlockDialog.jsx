import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, Key, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function LessonUnlockDialog({ open, onOpenChange, lessonId, courseId, lessonTitle, onUnlockSuccess }) {
  const [keyCode, setKeyCode] = useState('');
  const queryClient = useQueryClient();

  const unlockMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('unlockLessonWithKey', {
        key_code: keyCode,
        lesson_id: lessonId,
        course_id: courseId
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['enrollment', courseId]);
      toast.success('Lesson unlocked! Valid for 3 months.');
      setKeyCode('');
      onOpenChange(false);
      if (onUnlockSuccess) onUnlockSuccess();
    },
    onError: (error) => {
      const message = error.response?.data?.error || 'Invalid unlock key';
      toast.error(message);
    }
  });

  const handleUnlock = () => {
    if (!keyCode.trim()) {
      toast.error('Please enter an unlock key');
      return;
    }
    unlockMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-orange-600" />
            Unlock Lesson
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
              <div className="text-sm text-orange-900">
                <p className="font-semibold mb-1">This lesson is locked</p>
                <p>Enter your unlock key to access: <strong>{lessonTitle}</strong></p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Unlock Key
            </label>
            <Input
              value={keyCode}
              onChange={(e) => setKeyCode(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX-XXXX"
              className="text-center text-lg font-mono tracking-wider"
              onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1 text-center">
              Contact your tutor to get an unlock key
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUnlock}
              disabled={unlockMutation.isPending || !keyCode.trim()}
              className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              {unlockMutation.isPending ? (
                'Unlocking...'
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Unlock
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}