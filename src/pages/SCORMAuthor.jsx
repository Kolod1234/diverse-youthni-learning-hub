import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Save, Download, Plus, Edit2, Trash2, FileJson } from 'lucide-react';
import CourseBasicInfo from '@/components/authoring/CourseBasicInfo';
import CourseObjectivesEditor from '@/components/authoring/CourseObjectivesEditor';
import AssessmentBuilder from '@/components/authoring/AssessmentBuilder';
import SCORMExportConfig from '@/components/authoring/SCORMExportConfig';
import RiseImportDialog from '@/components/authoring/RiseImportDialog';

export default function SCORMAuthor() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const [activeTab, setActiveTab] = useState('basic');
  const [showImport, setShowImport] = useState(false);
  const [courseData, setCourseData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch course if editing existing
  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => base44.entities.Course.list({ id: courseId }),
    enabled: !!courseId,
    select: (data) => data?.[0],
  });

  // Fetch lessons for course
  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => base44.entities.Lesson.filter({ course_id: courseId }, 'order', 100),
    enabled: !!courseId,
  });

  // Fetch quizzes for course
  const { data: quizzes = [] } = useQuery({
    queryKey: ['quizzes', courseId],
    queryFn: () => base44.entities.Quiz.filter({ course_id: courseId }, 'created_date', 100),
    enabled: !!courseId,
  });

  useEffect(() => {
    if (course) {
      setCourseData(course);
    }
  }, [course]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (courseId) {
        return base44.entities.Course.update(courseId, data);
      } else {
        return base44.entities.Course.create(data);
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries(['course']);
      if (!courseId) {
        window.location.href = `?courseId=${result.id}`;
      }
      alert('Course saved successfully');
    },
  });

  const handleSave = async () => {
    if (!courseData?.title) {
      alert('Please enter a course title');
      return;
    }
    setIsSaving(true);
    await saveMutation.mutateAsync(courseData);
    setIsSaving(false);
  };

  const handleExport = async (config) => {
    if (!courseId) {
      alert('Please save the course first');
      return;
    }
    try {
      const response = await base44.functions.invoke('exportSCORMPackage', {
        courseId,
        scormVersion: config.scormVersion,
        includeResources: config.includeResources,
      });
      
      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${courseData?.title}-scorm-${config.scormVersion}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      alert('Export failed: ' + error.message);
    }
  };

  if (isLoading && courseId) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">SCORM Course Authoring</h1>
          <p className="text-gray-600">Create and publish SCORM-compliant courses</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Course'}
          </Button>
          {courseId && (
            <>
              <Button
                onClick={() => setShowImport(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Import Rise Module
              </Button>
              <Button
                onClick={() => setActiveTab('export')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export SCORM
              </Button>
            </>
          )}
        </div>

        {/* Rise Import Dialog */}
        {showImport && (
          <RiseImportDialog
            courseId={courseId}
            onClose={() => setShowImport(false)}
            onSuccess={() => {
              setShowImport(false);
              queryClient.invalidateQueries(['lessons', courseId]);
            }}
          />
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="objectives">Learning Objectives</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
                <CardDescription>
                  Define basic course details and SCORM metadata
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CourseBasicInfo
                  courseData={courseData}
                  onChange={setCourseData}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Objectives Tab */}
          <TabsContent value="objectives" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Objectives</CardTitle>
                <CardDescription>
                  Define what students should learn from this course
                </CardDescription>
              </CardHeader>
              <CardContent>
                {courseId ? (
                  <CourseObjectivesEditor
                    courseId={courseId}
                    lessons={lessons}
                    onUpdate={() => queryClient.invalidateQueries(['lessons', courseId])}
                  />
                ) : (
                  <p className="text-gray-500">Save the course first to add objectives</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessments</CardTitle>
                <CardDescription>
                  Create quizzes and assignments to assess learning
                </CardDescription>
              </CardHeader>
              <CardContent>
                {courseId ? (
                  <AssessmentBuilder
                    courseId={courseId}
                    quizzes={quizzes}
                    onUpdate={() => queryClient.invalidateQueries(['quizzes', courseId])}
                  />
                ) : (
                  <p className="text-gray-500">Save the course first to add assessments</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>SCORM Export</CardTitle>
                <CardDescription>
                  Configure and export your course as a SCORM package
                </CardDescription>
              </CardHeader>
              <CardContent>
                {courseId ? (
                  <SCORMExportConfig
                    courseData={courseData}
                    lessons={lessons}
                    quizzes={quizzes}
                    onExport={handleExport}
                  />
                ) : (
                  <p className="text-gray-500">Save the course first to export</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Course Stats */}
        {courseId && (
          <div className="grid grid-cols-3 gap-4 mt-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold">{lessons.length}</div>
                <p className="text-gray-600 text-sm">Lessons</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold">{quizzes.length}</div>
                <p className="text-gray-600 text-sm">Assessments</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold">{courseData?.learning_objectives?.length || 0}</div>
                <p className="text-gray-600 text-sm">Objectives</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}