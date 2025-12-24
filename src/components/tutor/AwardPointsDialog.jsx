import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, Zap, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function AwardPointsDialog({ open, onOpenChange, courseId }) {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [points, setPoints] = useState('10');
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();

  const { data: enrollments = [] } = useQuery({
    queryKey: ['course-enrollments', courseId],
    queryFn: () => base44.entities.Enrollment.filter({ course_id: courseId }),
    enabled: !!courseId && open,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list('-created_date', 500),
    enabled: open,
  });

  const students = enrollments
    .map(e => users.find(u => u.email === e.created_by))
    .filter(Boolean);

  const awardPointsMutation = useMutation({
    mutationFn: async ({ studentEmail, points, reason }) => {
      const progressList = await base44.entities.UserProgress.filter({ created_by: studentEmail });
      
      if (progressList.length > 0) {
        const progress = progressList[0];
        const newPoints = (progress.points || 0) + points;
        const newLevel = Math.floor(newPoints / 100) + 1;
        
        await base44.entities.UserProgress.update(progress.id, {
          points: newPoints,
          level: newLevel,
        });
      } else {
        await base44.entities.UserProgress.create({
          points,
          level: Math.floor(points / 100) + 1,
        });
      }

      // Create achievement record for bonus points
      await base44.entities.Achievement.create({
        type: 'badge',
        name: 'Instructor Recognition',
        description: reason || 'Awarded by instructor for outstanding contribution',
        icon: 'instructor_bonus',
        course_id: courseId,
        earned_date: new Date().toISOString().split('T')[0],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-progress']);
      toast.success('Bonus points awarded successfully!');
      setSelectedStudent('');
      setPoints('10');
      setReason('');
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error('Failed to award points');
      console.error(error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudent || !points) {
      toast.error('Please select a student and enter points');
      return;
    }

    const pointsNum = parseInt(points);
    if (pointsNum < 1 || pointsNum > 100) {
      toast.error('Points must be between 1 and 100');
      return;
    }

    awardPointsMutation.mutate({
      studentEmail: selectedStudent,
      points: pointsNum,
      reason,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            Award Bonus Points
          </DialogTitle>
          <DialogDescription>
            Reward students for outstanding participation or contributions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="student">Select Student</Label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map(student => (
                  <SelectItem key={student.email} value={student.email}>
                    {student.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="points">Bonus Points (1-100)</Label>
            <div className="relative">
              <Input
                id="points"
                type="number"
                min="1"
                max="100"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                placeholder="10"
                className="pl-10"
              />
              <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Standard rewards: 10-20 points</p>
          </div>

          <div>
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Excellent class participation, helping other students..."
              rows={3}
            />
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div className="text-sm text-indigo-900">
                <p className="font-semibold mb-1">Suggested Awards:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Active participation: 10-15 points</li>
                  <li>• Helping peers: 15-20 points</li>
                  <li>• Exceptional work: 20-30 points</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={awardPointsMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={awardPointsMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {awardPointsMutation.isPending ? 'Awarding...' : 'Award Points'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}