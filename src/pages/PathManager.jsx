import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, MoveUp, MoveDown, Save, Award, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function PathManager() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_ids: [],
    estimated_duration_weeks: 0,
    difficulty_level: 'beginner',
    category: '',
    is_published: false,
  });
  const [editingId, setEditingId] = useState(null);

  const { data: courses = [] } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 200),
  });

  const { data: paths = [] } = useQuery({
    queryKey: ['learning-paths'],
    queryFn: () => base44.entities.LearningPath.list('-created_date', 100),
  });

  const createPathMutation = useMutation({
    mutationFn: (data) => base44.entities.LearningPath.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['learning-paths']);
      resetForm();
      toast.success('Learning path created!');
    },
  });

  const updatePathMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LearningPath.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['learning-paths']);
      resetForm();
      toast.success('Learning path updated!');
    },
  });

  const deletePathMutation = useMutation({
    mutationFn: (id) => base44.entities.LearningPath.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['learning-paths']);
      toast.success('Learning path deleted');
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      course_ids: [],
      estimated_duration_weeks: 0,
      difficulty_level: 'beginner',
      category: '',
      is_published: false,
    });
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!formData.title || formData.course_ids.length === 0) {
      toast.error('Please provide title and at least one course');
      return;
    }

    if (editingId) {
      updatePathMutation.mutate({ id: editingId, data: formData });
    } else {
      createPathMutation.mutate(formData);
    }
  };

  const handleEdit = (path) => {
    setFormData({
      title: path.title,
      description: path.description,
      course_ids: path.course_ids || [],
      estimated_duration_weeks: path.estimated_duration_weeks || 0,
      difficulty_level: path.difficulty_level || 'beginner',
      category: path.category || '',
      is_published: path.is_published || false,
    });
    setEditingId(path.id);
  };

  const moveCourse = (index, direction) => {
    const newCourseIds = [...formData.course_ids];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newCourseIds[index], newCourseIds[targetIndex]] = [newCourseIds[targetIndex], newCourseIds[index]];
    setFormData({ ...formData, course_ids: newCourseIds });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Path Manager</h1>
          <p className="text-gray-600">Create structured learning paths by grouping courses</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">
              {editingId ? 'Edit Learning Path' : 'Create Learning Path'}
            </h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Full Stack Web Development"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Master web development from basics to advanced..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={formData.difficulty_level} onValueChange={(value) => setFormData({ ...formData, difficulty_level: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration">Duration (weeks)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.estimated_duration_weeks}
                    onChange={(e) => setFormData({ ...formData, estimated_duration_weeks: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Web Development"
                />
              </div>

              {/* Course Selection */}
              <div>
                <Label>Courses in Path *</Label>
                <Select onValueChange={(courseId) => {
                  if (!formData.course_ids.includes(courseId)) {
                    setFormData({ ...formData, course_ids: [...formData.course_ids, courseId] });
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses
                      .filter(c => !formData.course_ids.includes(c.id))
                      .map(course => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                {/* Selected Courses */}
                <div className="mt-3 space-y-2">
                  {formData.course_ids.map((courseId, index) => {
                    const course = courses.find(c => c.id === courseId);
                    if (!course) return null;

                    return (
                      <div key={courseId} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </span>
                        <span className="flex-1 text-sm">{course.title}</span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            disabled={index === 0}
                            onClick={() => moveCourse(index, 'up')}
                          >
                            <MoveUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            disabled={index === formData.course_ids.length - 1}
                            onClick={() => moveCourse(index, 'down')}
                          >
                            <MoveDown className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-600 hover:text-red-700"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                course_ids: formData.course_ids.filter(id => id !== courseId)
                              });
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="published">Publish (make visible to students)</Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700">
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? 'Update Path' : 'Create Path'}
                </Button>
                {editingId && (
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Existing Paths */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Learning Paths</h2>
            {paths.map((path) => {
              const pathCourses = courses.filter(c => path.course_ids?.includes(c.id));
              
              return (
                <Card key={path.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{path.title}</h3>
                        {path.is_published ? (
                          <Badge className="bg-green-100 text-green-700">Published</Badge>
                        ) : (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{path.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {pathCourses.length} courses
                        </span>
                        {path.estimated_duration_weeks > 0 && (
                          <span>{path.estimated_duration_weeks} weeks</span>
                        )}
                        <Badge variant="outline" className="text-xs capitalize">
                          {path.difficulty_level}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(path)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => {
                        if (confirm('Delete this learning path?')) {
                          deletePathMutation.mutate(path.id);
                        }
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}