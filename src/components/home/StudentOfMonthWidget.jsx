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
    <Card className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 border-0 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-6 h-6 text-yellow-600" />
        <h3 className="text-lg font-bold text-gray-900">Student of the Month</h3>
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="w-16 h-16 border-4 border-yellow-400">
          <AvatarImage src={currentStudent.student_avatar} />
          <AvatarFallback className="bg-yellow-200 text-yellow-800 text-xl">
            {currentStudent.student_name?.charAt(0) || 'S'}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-bold text-gray-900 text-lg">{currentStudent.student_name}</p>
          <p className="text-sm text-gray-600">{currentStudent.month}</p>
        </div>
      </div>

      <div className="bg-white/60 rounded-lg p-3 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-4 h-4 text-yellow-600" />
          <p className="text-xs font-semibold text-gray-700 uppercase">Achievement</p>
        </div>
        <p className="text-sm text-gray-800">{currentStudent.achievement}</p>
      </div>

      {currentStudent.testimonial && (
        <div className="text-sm text-gray-600 italic">
          "{currentStudent.testimonial}"
        </div>
      )}
    </Card>
  );
}