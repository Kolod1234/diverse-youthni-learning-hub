import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Star } from 'lucide-react';

export default function StudentOfMonthWidget() {
  const { data: students = [] } = useQuery({
    queryKey: ['student-of-month'],
    queryFn: () => base44.entities.StudentOfMonth.filter({ is_current: true })
  });

  const currentStudent = students[0];

  if (!currentStudent) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-6 h-6 text-yellow-400" />
        <h3 className="text-lg font-bold text-white">Student of the Month</h3>
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="w-16 h-16 border-4 border-yellow-400">
          <AvatarImage src={currentStudent.student_avatar} />
          <AvatarFallback className="bg-yellow-500 text-white text-xl">
            {currentStudent.student_name?.charAt(0) || 'S'}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-bold text-white text-lg">{currentStudent.student_name}</p>
          <p className="text-sm text-slate-400">{currentStudent.month}</p>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-3 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-4 h-4 text-yellow-400" />
          <p className="text-xs font-semibold text-slate-300 uppercase">Achievement</p>
        </div>
        <p className="text-sm text-white">{currentStudent.achievement}</p>
      </div>

      {currentStudent.testimonial && (
        <div className="text-sm text-slate-400 italic">
          "{currentStudent.testimonial}"
        </div>
      )}
    </Card>
  );
}