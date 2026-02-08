import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RelatedLessons({ lessons = [], courseId, currentLessonId }) {
  const navigate = useNavigate();
  
  const filteredLessons = lessons.filter(l => l.id !== currentLessonId).slice(0, 3);

  if (filteredLessons.length === 0) return null;

  return (
    <Card className="p-6 mt-8">
      <h3 className="text-lg font-bold mb-4">Up Next</h3>
      <div className="space-y-3">
        {filteredLessons.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => navigate(`/LessonPlayerClassic?lesson=${lesson.id}&course=${courseId}`)}
            className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 group-hover:text-blue-600 mb-1">
                  {lesson.title}
                </h4>
                {lesson.duration_minutes && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="w-3 h-3" />
                    {lesson.duration_minutes} min
                  </div>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}