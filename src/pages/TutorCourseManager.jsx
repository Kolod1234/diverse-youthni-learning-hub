import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Save, X, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function TutorCourseManager() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('courseId');
  const [editingLesson, setEditingLesson] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [lessonForm, setLessonForm] = useState({});
  const queryClient = useQueryClient();

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0];
    },
    enabled: !!courseId,
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => base44.entities.Lesson.filter({ course_id: courseId }, 'order', 100),
    enabled: !!courseId,
  });

  const createLessonMutation = useMutation({
    mutationFn: (data) => base44.entities.Lesson.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['lessons']);
      setShowCreate(false);
      setLessonForm({});
      toast.success('Lesson created!');
    },
  });

  const updateLessonMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lesson.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['lessons']);
      setEditingLesson(null);
      toast.success('Lesson updated!');
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (id) => base44.entities.Lesson.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['lessons']);
      toast.success('Lesson deleted!');
    },
  });

  const handleCreate = () => {
    createLessonMutation.mutate({
      ...lessonForm,
      course_id: courseId,
      order: lessons.length + 1,
      duration_minutes: parseInt(lessonForm.duration_minutes) || 10,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={createPageUrl('TutorDashboard')} className="inline-flex items-center text-indigo-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Course Lessons</h1>
          <p className="text-gray-500">{course?.title}</p>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Lessons & Topics</h2>
            <Button onClick={() => setShowCreate(true)} className="bg-indigo-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Lesson
            </Button>
          </div>

          {showCreate && (
            <Card className="p-6 mb-6 bg-indigo-50 border-indigo-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Create New Lesson</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <LessonFormFields formData={lessonForm} setFormData={setLessonForm} />
              <div className="flex gap-3 mt-4">
                <Button onClick={handleCreate} disabled={createLessonMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  Create
                </Button>
                <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          <div className="space-y-3">
            {lessons.map((lesson) => (
              <Card key={lesson.id} className="p-4">
                {editingLesson?.id === lesson.id ? (
                  <div>
                    <LessonFormFields formData={lessonForm} setFormData={setLessonForm} />
                    <div className="flex gap-3 mt-4">
                      <Button onClick={() => {
                        updateLessonMutation.mutate({ id: lesson.id, data: lessonForm });
                      }} size="sm">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingLesson(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                      <p className="text-sm text-gray-500">{lesson.section || 'No section'} • {lesson.duration_minutes || 10} min</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        setEditingLesson(lesson);
                        setLessonForm(lesson);
                      }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        if (confirm('Delete this lesson?')) deleteLessonMutation.mutate(lesson.id);
                      }}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function LessonFormFields({ formData, setFormData }) {
  return (
    <div className="grid gap-4">
      <div>
        <Label>Lesson Title *</Label>
        <Input value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
      </div>
      <div>
        <Label>Section/Topic</Label>
        <Input value={formData.section || ''} onChange={(e) => setFormData({ ...formData, section: e.target.value })} placeholder="e.g. Introduction, Advanced Topics" />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
      </div>
      <div>
        <Label>Video URL</Label>
        <Input value={formData.video_url || ''} onChange={(e) => setFormData({ ...formData, video_url: e.target.value })} placeholder="https://youtube.com/embed/..." />
      </div>
      <div>
        <Label>Duration (minutes)</Label>
        <Input type="number" value={formData.duration_minutes || ''} onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })} />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="is_preview" checked={formData.is_preview || false} onChange={(e) => setFormData({ ...formData, is_preview: e.target.checked })} />
        <Label htmlFor="is_preview">Allow free preview</Label>
      </div>
    </div>
  );
}