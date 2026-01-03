import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import VisualLessonEditor from '@/components/lesson/VisualLessonEditor';

export default function LessonEditor() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = new URLSearchParams(location.search);
  const lessonId = params.get('id');
  const courseId = params.get('course');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
      
      // Check if user is authorized
      if (userData.role !== 'admin' && !userData.is_tutor) {
        toast.error('Unauthorized access');
        navigate(createPageUrl('Dashboard'));
      }
    };
    loadUser();
  }, []);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      if (!lessonId) return null;
      const lessons = await base44.entities.Lesson.filter({ id: lessonId });
      return lessons[0];
    },
    enabled: !!lessonId
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (lessonId) {
        await base44.entities.Lesson.update(lessonId, data);
      } else {
        await base44.entities.Lesson.create({
          ...data,
          course_id: courseId,
          order: 0,
          content_type: 'richtext'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lesson', lessonId]);
      queryClient.invalidateQueries(['courseLessons', courseId]);
      toast.success('Lesson saved successfully!');
      if (courseId) {
        navigate(createPageUrl('TutorDashboard'));
      }
    },
    onError: () => {
      toast.error('Failed to save lesson');
    }
  });

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-lg font-semibold">
          {lessonId ? 'Edit Lesson' : 'Create New Lesson'}
        </h1>
        <div className="w-20"></div>
      </div>

      <div className="flex-1 overflow-hidden">
        <VisualLessonEditor
          lesson={lesson || { 
            title: '', 
            description: '', 
            slides: [{ 
              title: 'Slide 1', 
              content: '', 
              order: 0, 
              blocks: [] 
            }] 
          }}
          onSave={(data) => saveMutation.mutate(data)}
        />
      </div>
    </div>
  );
}