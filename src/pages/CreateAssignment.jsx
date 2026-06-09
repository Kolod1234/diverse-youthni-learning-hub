import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button, Card, TextField } from '@mui/material';
const Input = ({ className, ...props }) => <TextField fullWidth size="small" className={className} {...props} />;
const Textarea = ({ className, rows, ...props }) => <TextField fullWidth multiline rows={rows || 4} className={className} {...props} />;
const Label = ({ children, className, htmlFor, ...props }) => <label htmlFor={htmlFor} className={className || 'block text-sm font-medium text-gray-700 mb-1'} {...props}>{children}</label>;
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
const _w = (I) => ({ size, color, className, style, ...r }) => <I className={className} style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const ArrowLeft = _w(ArrowBackIcon), Save = _w(SaveIcon);
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function CreateAssignment() {
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedCourseId = urlParams.get('courseId');
  const [user, setUser] = useState(null);
  const [accessChecked, setAccessChecked] = useState(false);
  const [formData, setFormData] = useState({ total_points: 100, is_published: false, course_id: preselectedCourseId || '' });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me();
      setUser(u);
      if (!u || (!u.is_tutor && u.role !== 'admin')) {
        toast.error('Only tutors can create assignments.');
        navigate(createPageUrl('Home'));
        return;
      }
      setAccessChecked(true);
    };
    load();
  }, []);

  // Only courses explicitly assigned to this tutor (or all for admins).
  const { data: courses = [] } = useQuery({
    queryKey: ['tutor-assigned-courses-assignment-v2', user?.email, user?.role],
    queryFn: () => {
      if (user?.role === 'admin') return base44.entities.Course.list('-created_date', 200);
      return base44.entities.Course.filter({ assigned_tutors: user.email }, '-created_date', 200);
    },
    enabled: !!user?.email,
  });

  // If the preselected courseId is not assigned to this tutor, clear it so they can't submit it.
  useEffect(() => {
    if (!accessChecked || !preselectedCourseId || courses.length === 0) return;
    if (!courses.some(c => c.id === preselectedCourseId)) {
      setFormData(prev => ({ ...prev, course_id: '' }));
      toast.error('You are not assigned to that course.');
    }
  }, [accessChecked, courses, preselectedCourseId]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Assignment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tutor-assignments']);
      toast.success('Assignment created!');
      navigate(createPageUrl('TutorDashboard'));
    },
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.course_id) {
      toast.error('Please fill required fields');
      return;
    }
    // Defence in depth: only allow assignment creation against an assigned course.
    if (user?.role !== 'admin' && !courses.some(c => c.id === formData.course_id)) {
      toast.error('You are not assigned to that course.');
      return;
    }
    createMutation.mutate({
      ...formData,
      total_points: parseInt(formData.total_points) || 100,
    });
  };

  if (!accessChecked) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={createPageUrl('TutorDashboard')} className="inline-flex items-center text-indigo-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <Card className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Assignment</h1>

          {courses.length === 0 ? (
            <div className="text-center py-8 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="font-medium text-amber-900 mb-2">You have no assigned courses</p>
              <p className="text-sm text-amber-800">
                Please contact an admin to be assigned to a course before creating assignments.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Course *</Label>
                <select
                  value={formData.course_id || ''}
                  onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border"
                >
                  <option value="">Select course</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Assignment Title *</Label>
                <Input
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <Label>Instructions</Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                />
              </div>

              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={formData.due_date || ''}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>

              <div>
                <Label>Total Points</Label>
                <Input
                  type="number"
                  value={formData.total_points || ''}
                  onChange={(e) => setFormData({ ...formData, total_points: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.is_published || false}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                />
                <Label htmlFor="published">Publish immediately</Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Create Assignment
                </Button>
                <Link to={createPageUrl('TutorDashboard')}>
                  <Button variant="outline">Cancel</Button>
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}