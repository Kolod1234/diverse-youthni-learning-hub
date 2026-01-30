import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Loader2, Save, Upload, Video, FileText, Target, Presentation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import RichTextEditor from '@/components/editor/RichTextEditor';
import SlideEditor from '@/components/editor/SlideEditor';
import FileUploadManager from '@/components/editor/FileUploadManager';

export default function LessonEditor() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = new URLSearchParams(location.search);
  const lessonId = params.get('id');
  const courseId = params.get('courseId');
  const [user, setUser] = useState(null);
  const [lessonForm, setLessonForm] = useState({});
  const [uploading, setUploading] = useState(false);

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
    enabled: !!lessonId,
    onSuccess: (data) => {
      if (data) {
        setLessonForm(data);
      }
    }
  });

  useEffect(() => {
    if (lesson) {
      setLessonForm(lesson);
    }
  }, [lesson]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (lessonId) {
        await base44.entities.Lesson.update(lessonId, lessonForm);
      } else {
        if (!courseId && !lessonForm.course_id) {
          throw new Error('Course ID is required');
        }
        await base44.entities.Lesson.create({
          ...lessonForm,
          course_id: lessonForm.course_id || courseId,
          order: 0,
          content_type: lessonForm.content_type || 'richtext'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lesson', lessonId]);
      queryClient.invalidateQueries(['all-lessons']);
      queryClient.invalidateQueries(['tutor-courses']);
      toast.success('Lesson saved successfully!');
      navigate(-1);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save lesson');
    }
  });

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setLessonForm({ ...lessonForm, video_url: file_url });
      toast.success('Video uploaded!');
    } catch (error) {
      toast.error('Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setLessonForm({ 
        ...lessonForm, 
        file_url,
        file_type: file.name.split('.').pop(),
        content_type: 'document'
      });
      toast.success('Document uploaded!');
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

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
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-gray-900">
            {lessonId ? 'Edit Lesson' : 'Create New Lesson'}
          </h1>
          <Button 
            onClick={() => saveMutation.mutate()} 
            disabled={!lessonForm.title || (!lessonId && !courseId && !lessonForm.course_id) || saveMutation.isPending}
            className="bg-indigo-600"
          >
            {saveMutation.isPending ? (
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
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Basic Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {!lessonId && !courseId && (
                <div className="md:col-span-2">
                  <Label>Course *</Label>
                  <select
                    value={lessonForm.course_id || ''}
                    onChange={(e) => setLessonForm({ ...lessonForm, course_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select a course</option>
                  </select>
                </div>
              )}
              <div>
                <Label>Lesson Title *</Label>
                <Input 
                  value={lessonForm.title || ''} 
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  placeholder="Introduction to the topic"
                />
              </div>
              <div>
                <Label>Section/Module</Label>
                <Input 
                  value={lessonForm.section || ''} 
                  onChange={(e) => setLessonForm({ ...lessonForm, section: e.target.value })} 
                  placeholder="e.g. Getting Started, Module 1"
                />
              </div>
            </div>
            <div className="mt-4">
              <Label>Duration (minutes)</Label>
              <Input 
                type="number" 
                value={lessonForm.duration_minutes || ''} 
                onChange={(e) => setLessonForm({ ...lessonForm, duration_minutes: parseInt(e.target.value) })}
                placeholder="10"
                className="max-w-xs"
              />
            </div>
          </Card>

          {/* Description */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Lesson Description</h2>
            <RichTextEditor
              value={lessonForm.description || ''}
              onChange={(value) => setLessonForm({ ...lessonForm, description: value })}
              placeholder="Write a comprehensive description..."
            />
          </Card>

          {/* Video Content */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Video className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-semibold">Video Content</h2>
            </div>
            <div className="space-y-3">
              <div>
                <Label>Video URL (YouTube, Vimeo, etc.)</Label>
                <Input 
                  value={lessonForm.video_url || ''} 
                  onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })} 
                  placeholder="https://youtube.com/embed/..."
                />
              </div>
              <div className="text-center text-sm text-gray-500">OR</div>
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
                  <Button type="button" variant="outline" className="w-full" disabled={uploading} onClick={() => document.getElementById('video-upload').click()}>
                    {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</> : <><Upload className="w-4 h-4 mr-2" />Upload Video File</>}
                  </Button>
                </label>
              </div>
            </div>
          </Card>

          {/* Google Slides */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Presentation className="w-5 h-5 text-yellow-600" />
              <h2 className="text-lg font-semibold">Google Slides Presentation</h2>
            </div>
            <div>
              <Label>Google Slides URL</Label>
              <Input
                placeholder="https://docs.google.com/presentation/d/..."
                value={lessonForm.google_slides_url || ''}
                onChange={(e) => setLessonForm({ ...lessonForm, google_slides_url: e.target.value, content_type: 'googleslides' })}
              />
              <p className="text-xs text-gray-500 mt-2">Students will see your Google Slides embedded in the lesson player</p>
            </div>
          </Card>

          {/* Document Upload */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Upload Document (PPT, PDF, Word)</h2>
            </div>
            {lessonForm.file_url ? (
              <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-green-800">✓ {lessonForm.file_type?.toUpperCase()} uploaded</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setLessonForm({ 
                        ...lessonForm, 
                        file_url: null, 
                        file_type: null,
                        content_type: 'richtext'
                      });
                      toast.success('Document removed');
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  accept=".pdf,.ppt,.pptx,.doc,.docx"
                  onChange={handleDocumentUpload}
                  disabled={uploading}
                  className="hidden"
                  id="document-upload"
                />
                <label htmlFor="document-upload">
                  <Button type="button" variant="outline" className="w-full" disabled={uploading} onClick={() => document.getElementById('document-upload').click()}>
                    {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</> : <><Upload className="w-4 h-4 mr-2" />Upload Document</>}
                  </Button>
                </label>
              </>
            )}
          </Card>

          {/* Learning Objectives */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold">Learning Objectives (CCEA)</h2>
            </div>
            <p className="text-sm text-gray-600 mb-3">What will students learn in this lesson?</p>
            <div className="space-y-2">
              {(lessonForm.learning_objectives || []).map((objective, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={objective}
                    onChange={(e) => {
                      const newObjectives = [...(lessonForm.learning_objectives || [])];
                      newObjectives[idx] = e.target.value;
                      setLessonForm({ ...lessonForm, learning_objectives: newObjectives });
                    }}
                    placeholder="e.g., Describe the structure and function of cells"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newObjectives = (lessonForm.learning_objectives || []).filter((_, i) => i !== idx);
                      setLessonForm({ ...lessonForm, learning_objectives: newObjectives });
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  setLessonForm({
                    ...lessonForm,
                    learning_objectives: [...(lessonForm.learning_objectives || []), '']
                  });
                }}
              >
                + Add Learning Objective
              </Button>
            </div>
          </Card>

          {/* Custom Slides */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Written Lesson Content (Slides)</h2>
            <SlideEditor
              slides={lessonForm.slides || []}
              onChange={(slides) => setLessonForm({ ...lessonForm, slides })}
            />
            <p className="text-xs text-gray-500 mt-3">Create multi-page written lessons with rich text content</p>
          </Card>

          {/* Resources */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Supplementary Materials</h2>
            <FileUploadManager
              resources={lessonForm.resources || []}
              onChange={(resources) => setLessonForm({ ...lessonForm, resources })}
            />
          </Card>

          {/* Options */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Lesson Options</h2>
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="is_preview" 
                checked={lessonForm.is_preview || false} 
                onChange={(e) => setLessonForm({ ...lessonForm, is_preview: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <Label htmlFor="is_preview" className="cursor-pointer">
                Allow free preview (non-enrolled students can view)
              </Label>
            </div>
          </Card>

          {/* Save Button (Bottom) */}
          <div className="flex justify-end gap-3 pb-8">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button 
              onClick={() => saveMutation.mutate()} 
              disabled={!lessonForm.title || (!lessonId && !courseId && !lessonForm.course_id) || saveMutation.isPending}
              className="bg-indigo-600"
              size="lg"
            >
              {saveMutation.isPending ? (
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
          </div>
        </div>
      </div>
    </div>
  );
}