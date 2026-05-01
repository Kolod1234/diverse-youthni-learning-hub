import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Clock, CheckCircle, Upload, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentAssignments({ enrollments, user }) {
  const [expandedAssignment, setExpandedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const queryClient = useQueryClient();

  const courseIds = enrollments.map(e => e.course_id);

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['student-assignments', courseIds.join(',')],
    queryFn: async () => {
      if (courseIds.length === 0) return [];
      const results = await Promise.all(
        courseIds.map(id => base44.entities.Assignment.filter({ course_id: id, is_published: true }, '-due_date', 50))
      );
      return results.flat();
    },
    enabled: courseIds.length > 0,
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['student-submissions', user?.email],
    queryFn: () => base44.entities.Submission.filter({ student_email: user?.email }, '-created_date', 100),
    enabled: !!user?.email,
  });

  const submitMutation = useMutation({
    mutationFn: (data) => base44.entities.Submission.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['student-submissions']);
      toast.success('Assignment submitted!');
    },
  });

  const handleFileUpload = async (e, assignmentId) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFiles(prev => ({
        ...prev,
        [assignmentId]: [...(prev[assignmentId] || []), { name: file.name, url: file_url }]
      }));
      toast.success('File uploaded!');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (assignment) => {
    const text = submissionText[assignment.id] || '';
    const files = uploadedFiles[assignment.id] || [];
    if (!text && files.length === 0) {
      toast.error('Please add some content or files before submitting');
      return;
    }
    submitMutation.mutate({
      assignment_id: assignment.id,
      student_email: user?.email,
      student_name: user?.full_name,
      content: text,
      file_urls: files.map(f => f.url),
      submitted_date: new Date().toISOString(),
    });
    setExpandedAssignment(null);
  };

  const getSubmission = (assignmentId) => submissions.find(s => s.assignment_id === assignmentId);
  const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-14 bg-gray-50 rounded-2xl">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="font-medium text-gray-600">No assignments yet</p>
        <p className="text-sm text-gray-400 mt-1">Assignments from your enrolled courses will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {assignments.map((assignment, i) => {
        const submission = getSubmission(assignment.id);
        const overdue = isOverdue(assignment.due_date) && !submission;
        const isExpanded = expandedAssignment === assignment.id;

        return (
          <motion.div
            key={assignment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={`overflow-hidden border ${overdue ? 'border-red-200' : submission ? 'border-green-200' : 'border-gray-200'}`}>
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedAssignment(isExpanded ? null : assignment.id)}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  submission ? 'bg-green-100' : overdue ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  {submission ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <FileText className={`w-5 h-5 ${overdue ? 'text-red-600' : 'text-blue-600'}`} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 truncate">{assignment.title}</h3>
                    {submission ? (
                      <Badge className="bg-green-100 text-green-700 border-0 text-xs">Submitted</Badge>
                    ) : overdue ? (
                      <Badge className="bg-red-100 text-red-700 border-0 text-xs">Overdue</Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">Pending</Badge>
                    )}
                    {submission?.is_graded && (
                      <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">
                        Graded: {submission.grade}/{assignment.total_points}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    {assignment.due_date && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Due {new Date(assignment.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                    <span>{assignment.total_points || 100} pts</span>
                  </div>
                </div>

                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
                      {assignment.description && (
                        <p className="text-sm text-gray-600">{assignment.description}</p>
                      )}

                      {submission ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                          <p className="text-sm font-semibold text-green-800 mb-1 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Your Submission
                          </p>
                          {submission.content && <p className="text-sm text-gray-700 mt-2">{submission.content}</p>}
                          {submission.file_urls?.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {submission.file_urls.map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline block">
                                  Attachment {i + 1}
                                </a>
                              ))}
                            </div>
                          )}
                          {submission.feedback && (
                            <div className="mt-3 pt-3 border-t border-green-200">
                              <p className="text-xs font-semibold text-green-800">Tutor Feedback:</p>
                              <p className="text-sm text-gray-700 mt-1">{submission.feedback}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Textarea
                            placeholder="Write your response here..."
                            value={submissionText[assignment.id] || ''}
                            onChange={(e) => setSubmissionText(prev => ({ ...prev, [assignment.id]: e.target.value }))}
                            rows={4}
                          />
                          <div className="flex items-center gap-3 flex-wrap">
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, assignment.id)}
                                disabled={uploading}
                              />
                              <Button type="button" variant="outline" size="sm" className="gap-2" disabled={uploading}>
                                <Upload className="w-3.5 h-3.5" />
                                {uploading ? 'Uploading...' : 'Attach File'}
                              </Button>
                            </label>
                            {(uploadedFiles[assignment.id] || []).map((f, i) => (
                              <span key={i} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{f.name}</span>
                            ))}
                            <Button
                              size="sm"
                              className="bg-indigo-600 hover:bg-indigo-700 gap-2 ml-auto"
                              onClick={() => handleSubmit(assignment)}
                              disabled={submitMutation.isPending}
                            >
                              <Send className="w-3.5 h-3.5" />
                              {submitMutation.isPending ? 'Submitting...' : 'Submit'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}