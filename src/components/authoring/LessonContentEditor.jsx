import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Save, Trash2, Edit2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function LessonContentEditor({ courseId, lessons, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    section: '',
    content: '',
  });

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'code-block',
    'list',
    'indent',
    'link',
    'image',
  ];

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editingLesson) {
        await base44.entities.Lesson.update(editingLesson.id, {
          title: data.title,
          section: data.section,
          slides: [
            {
              title: data.title,
              content: data.content,
              order: 1,
            },
          ],
        });
      } else {
        await base44.entities.Lesson.create({
          course_id: courseId,
          title: data.title,
          section: data.section,
          content_type: 'richtext',
          order: (lessons?.length || 0) + 1,
          slides: [
            {
              title: data.title,
              content: data.content,
              order: 1,
            },
          ],
        });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (lessonId) => base44.entities.Lesson.delete(lessonId),
  });

  const handleSaveLesson = async () => {
    if (!formData.title) {
      alert('Please enter a lesson title');
      return;
    }

    try {
      await saveMutation.mutateAsync(formData);
      onUpdate();
      setShowForm(false);
      setEditingLesson(null);
      setFormData({ title: '', section: '', content: '' });
      alert('Lesson saved successfully');
    } catch (error) {
      alert('Error saving lesson: ' + error.message);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (window.confirm('Delete this lesson?')) {
      try {
        await deleteMutation.mutateAsync(lessonId);
        onUpdate();
      } catch (error) {
        alert('Error deleting lesson: ' + error.message);
      }
    }
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      section: lesson.section || '',
      content: lesson.slides?.[0]?.content || '',
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Lesson
        </Button>
      )}

      {/* Lesson Editor Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingLesson ? 'Edit Lesson' : 'Create Lesson'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Lesson Title */}
            <div>
              <label className="block text-sm font-medium mb-1">Lesson Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Introduction to Algebra"
              />
            </div>

            {/* Section */}
            <div>
              <label className="block text-sm font-medium mb-1">Section</label>
              <Input
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                placeholder="e.g., Module 1"
              />
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-medium mb-2">Lesson Content</label>
              <ReactQuill
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                modules={modules}
                formats={formats}
                theme="snow"
                className="bg-white"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveLesson} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Save Lesson
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingLesson(null);
                  setFormData({ title: '', section: '', content: '' });
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lessons List */}
      <div className="space-y-3">
        {lessons.map((lesson) => (
          <Card key={lesson.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold">{lesson.title}</h3>
                  {lesson.section && <p className="text-sm text-gray-600">{lesson.section}</p>}
                  <div className="mt-2 text-sm text-gray-700 line-clamp-2">
                    {lesson.slides?.[0]?.content?.replace(/<[^>]*>/g, '') || 'No content'}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditLesson(lesson)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteLesson(lesson.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {lessons.length === 0 && (
          <p className="text-gray-500 text-sm italic">No lessons created yet</p>
        )}
      </div>
    </div>
  );
}