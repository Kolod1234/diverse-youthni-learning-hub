import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Upload, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function PublishToClassroom({ lesson, course }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [createNew, setCreateNew] = useState(false);
  const [newCourseData, setNewCourseData] = useState({
    name: course?.title || '',
    section: 'Youth Support 2025',
    descriptionHeading: course?.description || ''
  });

  useEffect(() => {
    if (open) {
      loadClassrooms();
    }
  }, [open]);

  const loadClassrooms = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('googleClassroomIntegration', {
        action: 'listCourses'
      });

      if (data.success) {
        setClassrooms(data.courses);
      } else {
        toast.error('Failed to load classrooms');
      }
    } catch (error) {
      toast.error('Error loading classrooms: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('googleClassroomIntegration', {
        action: 'createCourse',
        courseData: newCourseData
      });

      if (data.success) {
        toast.success('Course created successfully!');
        setSelectedClassroom(data.courseId);
        setCreateNew(false);
        await loadClassrooms();
      } else {
        toast.error(data.error || 'Failed to create course');
      }
    } catch (error) {
      toast.error('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishLesson = async () => {
    if (!selectedClassroom) {
      toast.error('Please select a classroom');
      return;
    }

    setLoading(true);
    try {
      const materials = [];

      // Add Google Slides if available
      if (lesson.google_slides_url) {
        const presentationId = lesson.google_slides_url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
        if (presentationId) {
          materials.push({
            driveFile: {
              driveFile: {
                id: presentationId,
                title: `${lesson.title} - Slides`
              }
            }
          });
        }
      }

      // Add file if available
      if (lesson.file_url) {
        materials.push({
          link: {
            url: lesson.file_url,
            title: `${lesson.title} - Document`
          }
        });
      }

      const { data } = await base44.functions.invoke('googleClassroomIntegration', {
        action: 'publishLesson',
        classroomCourseId: selectedClassroom,
        lessonData: {
          title: lesson.title,
          description: lesson.description || 'Please review the lesson materials.',
          materials
        }
      });

      if (data.success) {
        toast.success('Lesson published to Google Classroom!');
        setOpen(false);
      } else {
        toast.error(data.error || 'Failed to publish lesson');
      }
    } catch (error) {
      toast.error('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <BookOpen className="w-4 h-4" />
          Publish to Classroom
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Publish to Google Classroom
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Select Classroom */}
          <div>
            <label className="text-sm font-medium mb-2 block">Select Classroom</label>
            <div className="flex gap-2">
              <Select value={selectedClassroom} onValueChange={setSelectedClassroom} disabled={createNew}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Choose a classroom" />
                </SelectTrigger>
                <SelectContent>
                  {classrooms.map((classroom) => (
                    <SelectItem key={classroom.id} value={classroom.id}>
                      {classroom.name} {classroom.section ? `- ${classroom.section}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={() => setCreateNew(!createNew)}
                disabled={loading}
              >
                {createNew ? 'Cancel' : 'Create New'}
              </Button>
            </div>
          </div>

          {/* Create New Classroom */}
          {createNew && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h4 className="font-semibold mb-3 text-blue-900">Create New Classroom</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-blue-900 mb-1 block">Course Name</label>
                  <Input
                    value={newCourseData.name}
                    onChange={(e) => setNewCourseData({ ...newCourseData, name: e.target.value })}
                    placeholder="Early Intervention: Mental Wellbeing"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-blue-900 mb-1 block">Section</label>
                  <Input
                    value={newCourseData.section}
                    onChange={(e) => setNewCourseData({ ...newCourseData, section: e.target.value })}
                    placeholder="Youth Support 2025"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-blue-900 mb-1 block">Description</label>
                  <Textarea
                    value={newCourseData.descriptionHeading}
                    onChange={(e) => setNewCourseData({ ...newCourseData, descriptionHeading: e.target.value })}
                    placeholder="Course description"
                    rows={2}
                  />
                </div>
                <Button 
                  onClick={handleCreateCourse} 
                  disabled={loading || !newCourseData.name}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Course'}
                </Button>
              </div>
            </Card>
          )}

          {/* Lesson Preview */}
          <Card className="p-4 bg-gray-50">
            <h4 className="font-semibold mb-2">Lesson to Publish</h4>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p><strong>Title:</strong> {lesson.title}</p>
              <p><strong>Description:</strong> {lesson.description || 'No description'}</p>
              <div className="flex gap-2 mt-2">
                {lesson.google_slides_url && (
                  <div className="flex items-center gap-1 text-xs bg-card px-2 py-1 rounded border">
                    <ExternalLink className="w-3 h-3" />
                    Google Slides
                  </div>
                )}
                {lesson.file_url && (
                  <div className="flex items-center gap-1 text-xs bg-card px-2 py-1 rounded border">
                    <ExternalLink className="w-3 h-3" />
                    Document
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Publish Button */}
          <Button 
            onClick={handlePublishLesson}
            disabled={loading || !selectedClassroom}
            className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Publish to Classroom
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}