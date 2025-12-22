import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Edit, Trash2, Save, X, ArrowLeft, GripVertical, Upload, Video, Eye, Loader2, FileText, FileSliders, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import RichTextEditor from '@/components/editor/RichTextEditor';
import FileUploadManager from '@/components/editor/FileUploadManager';
import SlideEditor from '@/components/editor/SlideEditor';
import LessonContentAnalyzer from '@/components/tutor/LessonContentAnalyzer';
import AdvancedAISlideGenerator from '@/components/tutor/AdvancedAISlideGenerator';

export default function TutorCourseManager() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('courseId');
  const [editingLesson, setEditingLesson] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [lessonForm, setLessonForm] = useState({});
  const [analyzingLesson, setAnalyzingLesson] = useState(null);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
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

  const bulkUpdateMutation = useMutation({
    mutationFn: async (updates) => {
      await Promise.all(updates.map(({ id, data }) => 
        base44.entities.Lesson.update(id, data)
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lessons']);
      toast.success('Order updated!');
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

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(lessons);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updates = items.map((lesson, index) => ({
      id: lesson.id,
      data: { ...lesson, order: index + 1 }
    }));

    bulkUpdateMutation.mutate(updates);
  };

  const sections = lessons.reduce((acc, lesson) => {
    const section = lesson.section || 'Uncategorized';
    if (!acc[section]) acc[section] = [];
    acc[section].push(lesson);
    return acc;
  }, {});

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
          <div>
            <h2 className="text-xl font-semibold">Course Structure</h2>
            <p className="text-sm text-gray-500 mt-1">Organize your course into sections and lessons. Drag to reorder.</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowAIGenerator(true)} 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              <Brain className="w-4 h-4 mr-2" />
              AI Generator
            </Button>
            <Button onClick={() => setShowCreate(true)} className="bg-indigo-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Lesson
            </Button>
          </div>
        </div>

          {showCreate && (
            <Card className="p-6 mb-6 bg-indigo-50 border-indigo-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Create New Lesson</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <LessonFormFields 
                formData={lessonForm} 
                setFormData={setLessonForm}
                courseId={courseId}
                onSave={handleCreate}
                isSaving={createLessonMutation.isPending}
              />
              <div className="flex gap-3 mt-4">
                <Button 
                  onClick={handleCreate} 
                  disabled={createLessonMutation.isPending || !lessonForm.title}
                  className="bg-indigo-600"
                >
                  {createLessonMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Lesson
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </Card>
          )}

          {Object.keys(sections).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(sections).map(([sectionName, sectionLessons]) => (
                <div key={sectionName}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px bg-gray-200 flex-1" />
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      {sectionName}
                    </h3>
                    <div className="h-px bg-gray-200 flex-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Delete section "${sectionName}" and all its lessons?`)) {
                          const lessonIds = sectionLessons.map(l => l.id);
                          Promise.all(lessonIds.map(id => deleteLessonMutation.mutateAsync(id)))
                            .then(() => toast.success('Section deleted!'));
                        }
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId={sectionName}>
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`space-y-2 ${snapshot.isDraggingOver ? 'bg-indigo-50 rounded-lg p-2' : ''}`}
                        >
                          {sectionLessons.map((lesson, index) => (
                            <Draggable key={lesson.id} draggableId={lesson.id} index={index}>
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`p-4 ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}`}
                                >
                                  {editingLesson?.id === lesson.id ? (
                                    <div>
                                      <LessonFormFields 
                                        formData={lessonForm} 
                                        setFormData={setLessonForm}
                                        courseId={courseId}
                                        onSave={() => updateLessonMutation.mutate({ id: lesson.id, data: lessonForm })}
                                        isSaving={updateLessonMutation.isPending}
                                      />
                                      <div className="flex gap-3 mt-4">
                                        <Button 
                                          onClick={() => {
                                            updateLessonMutation.mutate({ id: lesson.id, data: lessonForm });
                                          }} 
                                          size="sm"
                                          disabled={updateLessonMutation.isPending || !lessonForm.title}
                                          className="bg-indigo-600"
                                        >
                                          {updateLessonMutation.isPending ? (
                                            <>
                                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                              Saving...
                                            </>
                                          ) : (
                                            <>
                                              <Save className="w-4 h-4 mr-2" />
                                              Save Changes
                                            </>
                                          )}
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => setEditingLesson(null)}>
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-3">
                                      <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                        <GripVertical className="w-5 h-5 text-gray-400" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                                          {lesson.is_preview && (
                                            <Badge variant="secondary" className="text-xs">
                                              <Eye className="w-3 h-3 mr-1" />
                                              Preview
                                            </Badge>
                                          )}
                                          {lesson.video_url && (
                                            <Badge variant="secondary" className="text-xs">
                                              <Video className="w-3 h-3 mr-1" />
                                              Video
                                            </Badge>
                                          )}
                                          {lesson.resources?.length > 0 && (
                                            <Badge variant="secondary" className="text-xs">
                                              <FileText className="w-3 h-3 mr-1" />
                                              {lesson.resources.length} files
                                            </Badge>
                                          )}
                                          {lesson.slides?.length > 0 && (
                                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                              <FileSliders className="w-3 h-3 mr-1" />
                                              {lesson.slides.length} slides
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-sm text-gray-500">{lesson.duration_minutes || 10} minutes</p>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          onClick={() => setAnalyzingLesson(lesson)}
                                          className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                                        >
                                          <Brain className="w-4 h-4" />
                                        </Button>
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
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No lessons yet. Create your first lesson to get started!</p>
              <Button onClick={() => setShowCreate(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add First Lesson
              </Button>
            </div>
          )}
        </Card>

        {/* AI Content Analyzer */}
        {analyzingLesson && (
          <LessonContentAnalyzer
            lesson={analyzingLesson}
            onClose={() => setAnalyzingLesson(null)}
          />
        )}

        {/* Advanced AI Slide Generator */}
        {showAIGenerator && (
          <AdvancedAISlideGenerator
            courseId={courseId}
            onSlidesGenerated={() => queryClient.invalidateQueries(['lessons'])}
            onClose={() => setShowAIGenerator(false)}
          />
        )}
      </div>
    </div>
  );
}

function LessonFormFields({ formData, setFormData, courseId, onSave, isSaving }) {
  const [uploading, setUploading] = useState(false);

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, video_url: file_url });
      toast.success('Video uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid gap-6">
      {/* Basic Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Lesson Title *</Label>
            <Input 
              value={formData.title || ''} 
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Introduction to the topic"
            />
          </div>
          <div>
            <Label>Section/Module *</Label>
            <Input 
              value={formData.section || ''} 
              onChange={(e) => setFormData({ ...formData, section: e.target.value })} 
              placeholder="e.g. Getting Started, Module 1"
            />
          </div>
        </div>

        <div className="mt-4">
          <Label>Duration (minutes)</Label>
          <Input 
            type="number" 
            value={formData.duration_minutes || ''} 
            onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
            placeholder="10"
            className="max-w-xs"
          />
        </div>
      </div>

      {/* Rich Text Description */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Lesson Content</h3>
        <RichTextEditor
          label="Detailed Description"
          value={formData.description || ''}
          onChange={(value) => setFormData({ ...formData, description: value })}
          placeholder="Write a comprehensive description with formatting, equations, symbols, and more..."
        />
        <p className="text-xs text-gray-500 mt-2">
          Use the toolbar to add formatting, mathematical equations, chemical formulas, superscripts, subscripts, and more
        </p>
      </div>

      {/* Video Upload */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Video Content</h3>
        <div className="space-y-3">
          <div>
            <Label>Video URL or Upload</Label>
            <Input 
              value={formData.video_url || ''} 
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })} 
              placeholder="https://youtube.com/embed/... or https://vimeo.com/..."
              className="mb-3"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-xs text-gray-500 font-medium">OR UPLOAD VIDEO</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          <div>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              disabled={uploading}
              className="hidden"
              id="video-upload"
            />
            <label htmlFor="video-upload">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                disabled={uploading}
                onClick={() => document.getElementById('video-upload').click()}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading Video...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Video File (MP4, MOV, etc.)
                  </>
                )}
              </Button>
            </label>
          </div>

          {formData.video_url && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
              <Video className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <span className="text-sm font-medium text-green-900">Video configured</span>
                <p className="text-xs text-green-700">{formData.video_url.substring(0, 50)}...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Written Lesson Content (Slides) */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Written Lesson Content (Slides)</h3>
          {formData.slides?.length > 0 && (
            <Button
              onClick={onSave}
              disabled={isSaving}
              size="sm"
              className="bg-indigo-600"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Lesson
                </>
              )}
            </Button>
          )}
        </div>
        <SlideEditor
          slides={formData.slides || []}
          onChange={(slides) => setFormData({ ...formData, slides })}
        />
        <p className="text-xs text-gray-500 mt-3">
          Create multi-page written lessons like Open University. Perfect for mixing videos with detailed text content!
        </p>
      </div>

      {/* Supplementary Materials */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Supplementary Materials</h3>
        <FileUploadManager
          resources={formData.resources || []}
          onChange={(resources) => setFormData({ ...formData, resources })}
        />
        <p className="text-xs text-gray-500 mt-3">
          Upload PDFs, slides, code files, worksheets, or any other materials students need
        </p>
      </div>

      {/* Options */}
      <div className="bg-indigo-50 rounded-lg border border-indigo-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Lesson Options</h3>
        
        <div className="flex items-start gap-3">
          <input 
            type="checkbox" 
            id="is_preview" 
            checked={formData.is_preview || false} 
            onChange={(e) => setFormData({ ...formData, is_preview: e.target.checked })}
            className="w-4 h-4 text-indigo-600 rounded mt-0.5"
          />
          <Label htmlFor="is_preview" className="cursor-pointer font-normal flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-indigo-600" />
              <span className="font-medium text-gray-900">Allow Free Preview</span>
            </div>
            <p className="text-xs text-gray-600">
              Make this lesson available to non-enrolled students. Great for showcasing your course quality!
            </p>
          </Label>
        </div>
      </div>
    </div>
  );
}