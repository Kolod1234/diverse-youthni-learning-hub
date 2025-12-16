import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function GradeAssignments() {
  const urlParams = new URLSearchParams(window.location.search);
  const assignmentId = urlParams.get('assignmentId');
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeForm, setGradeForm] = useState({});
  const queryClient = useQueryClient();

  const { data: assignment } = useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: async () => {
      const assignments = await base44.entities.Assignment.filter({ id: assignmentId });
      return assignments[0];
    },
    enabled: !!assignmentId,
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['submissions', assignmentId],
    queryFn: () => base44.entities.Submission.filter({ assignment_id: assignmentId }, '-created_date', 100),
    enabled: !!assignmentId,
  });

  const gradeMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Submission.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['submissions']);
      setGradingSubmission(null);
      setGradeForm({});
      toast.success('Submission graded!');
    },
  });

  const handleGrade = (submission) => {
    gradeMutation.mutate({
      id: submission.id,
      data: {
        ...submission,
        grade: parseFloat(gradeForm.grade),
        feedback: gradeForm.feedback,
        is_graded: true,
      },
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Grade Submissions</h1>
          <p className="text-gray-500">{assignment?.title}</p>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Student Submissions</h2>
          
          <div className="space-y-4">
            {submissions.map((submission) => (
              <Card key={submission.id} className="p-4 bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{submission.student_name}</h3>
                    <p className="text-sm text-gray-500">{submission.student_email}</p>
                  </div>
                  <Badge variant={submission.is_graded ? 'default' : 'secondary'}>
                    {submission.is_graded ? `Graded: ${submission.grade}/${assignment?.total_points}` : 'Pending'}
                  </Badge>
                </div>

                <div className="bg-white rounded-lg p-4 mb-3">
                  <p className="text-gray-700 whitespace-pre-wrap">{submission.content}</p>
                </div>

                {gradingSubmission?.id === submission.id ? (
                  <div className="bg-white rounded-lg p-4 space-y-3">
                    <div>
                      <Label>Grade (out of {assignment?.total_points})</Label>
                      <Input 
                        type="number" 
                        max={assignment?.total_points}
                        value={gradeForm.grade || ''} 
                        onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })} 
                      />
                    </div>
                    <div>
                      <Label>Feedback</Label>
                      <Textarea 
                        value={gradeForm.feedback || ''} 
                        onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })} 
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleGrade(submission)} size="sm" className="bg-indigo-600">
                        <Save className="w-4 h-4 mr-2" />
                        Submit Grade
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setGradingSubmission(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {submission.is_graded && submission.feedback && (
                      <div className="bg-green-50 rounded-lg p-3 mb-3">
                        <p className="text-sm font-medium text-green-900 mb-1">Feedback:</p>
                        <p className="text-sm text-green-800">{submission.feedback}</p>
                      </div>
                    )}
                    {!submission.is_graded && (
                      <Button 
                        onClick={() => {
                          setGradingSubmission(submission);
                          setGradeForm({ grade: assignment?.total_points, feedback: '' });
                        }} 
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Grade Submission
                      </Button>
                    )}
                  </>
                )}
              </Card>
            ))}
            {submissions.length === 0 && (
              <p className="text-gray-500 text-center py-8">No submissions yet</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}