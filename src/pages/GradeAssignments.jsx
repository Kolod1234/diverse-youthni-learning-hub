import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button, Card, TextField, Chip } from '@mui/material';
const Input = ({ className, ...props }) => <TextField fullWidth size="small" className={className} {...props} />;
const Textarea = ({ className, rows, ...props }) => <TextField fullWidth multiline rows={rows || 4} className={className} {...props} />;
const Label = ({ children, className, htmlFor, ...props }) => <label htmlFor={htmlFor} className={className || 'block text-sm font-medium text-foreground mb-1'} {...props}>{children}</label>;
const Badge = ({ children, className, variant, ...props }) => <Chip label={children} size="small" variant={variant === 'outline' ? 'outlined' : 'filled'} className={className} {...props} />;
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
const _w = (I) => ({ size, color, className, style, ...r }) => <I className={className} style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const ArrowLeft = _w(ArrowBackIcon), Save = _w(SaveIcon), CheckCircle = _w(CheckCircleIcon), AlertCircle = _w(ErrorOutlineIcon);
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { isCourseExplicitlyAssignedToTutor } from '@/components/tutor/tutorAccess';

// ── Shared error / empty page (always reaches a terminal state) ────────────
function ErrorState({ title, message }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 text-center bg-card">
        <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-500/15 mx-auto mb-4 flex items-center justify-center">
          <AlertCircle className="w-7 h-7" color="#d97706" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">{title}</h1>
        <p className="text-muted-foreground mb-6">{message}</p>
        <Link to={createPageUrl('TutorDashboard')}>
          <Button variant="contained" className="bg-indigo-600 text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tutor Dashboard
          </Button>
        </Link>
      </Card>
    </div>
  );
}

export default function GradeAssignments() {
  const urlParams = new URLSearchParams(window.location.search);
  const assignmentId = urlParams.get('assignmentId');
  const courseIdParam = urlParams.get('courseId');
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  // 'pending' | 'granted' | 'denied' | 'not-found'
  const [accessState, setAccessState] = useState('pending');
  const [accessDeniedReason, setAccessDeniedReason] = useState('');
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeForm, setGradeForm] = useState({});
  const queryClient = useQueryClient();

  // Mode is determined purely by URL params.
  // - assignmentId present → single-assignment grading view (existing behaviour)
  // - only courseId present → course-level submissions list
  // - neither → terminal "Missing assignment" error
  const mode = assignmentId ? 'assignment' : (courseIdParam ? 'course' : 'missing');

  // ── Load assignment (only in assignment mode) ─────────────────────────────
  const { data: assignment, isLoading: loadingAssignment, isError: assignmentError } = useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: async () => {
      const assignments = await base44.entities.Assignment.filter({ id: assignmentId });
      return assignments[0] || null;
    },
    enabled: mode === 'assignment',
  });

  // ── Load course (only in course mode) ─────────────────────────────────────
  const { data: courseFromParam, isLoading: loadingCourse, isError: courseError } = useQuery({
    queryKey: ['course-for-grading', courseIdParam],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseIdParam });
      return courses[0] || null;
    },
    enabled: mode === 'course',
  });

  // ── Centralised access check that ALWAYS reaches a terminal state ─────────
  useEffect(() => {
    const verify = async () => {
      // 1. Must be signed in as tutor or admin
      const u = await base44.auth.me().catch(() => null);
      setUser(u);
      if (!u) {
        setAccessDeniedReason('You must be signed in.');
        setAccessState('denied');
        return;
      }
      if (!u.is_tutor && u.role !== 'admin') {
        setAccessDeniedReason('Only tutors can grade submissions.');
        setAccessState('denied');
        return;
      }

      // 2. No assignmentId and no courseId → terminal error
      if (mode === 'missing') {
        setAccessState('not-found');
        return;
      }

      // 3. assignmentId path
      if (mode === 'assignment') {
        if (loadingAssignment) return; // wait
        if (assignmentError || !assignment) {
          setAccessState('not-found');
          return;
        }
        // courseId in URL (if any) must match the assignment's actual course
        if (courseIdParam && courseIdParam !== assignment.course_id) {
          setAccessDeniedReason('Assignment does not belong to that course.');
          setAccessState('denied');
          return;
        }
        if (u.role === 'admin') {
          setAccessState('granted');
          return;
        }
        const courses = await base44.entities.Course.filter({ id: assignment.course_id });
        const course = courses[0];
        if (!course || !isCourseExplicitlyAssignedToTutor(course, u)) {
          setAccessDeniedReason('You are not assigned to that course.');
          setAccessState('denied');
          return;
        }
        setAccessState('granted');
        return;
      }

      // 4. courseId-only path
      if (mode === 'course') {
        if (loadingCourse) return; // wait
        if (courseError || !courseFromParam) {
          setAccessState('not-found');
          return;
        }
        if (u.role !== 'admin' && !isCourseExplicitlyAssignedToTutor(courseFromParam, u)) {
          setAccessDeniedReason('You are not assigned to that course.');
          setAccessState('denied');
          return;
        }
        setAccessState('granted');
        return;
      }
    };
    verify();
  }, [mode, assignment, loadingAssignment, assignmentError, courseFromParam, loadingCourse, courseError, courseIdParam]);

  // ── Submissions for the resolved scope ────────────────────────────────────
  const accessGranted = accessState === 'granted';

  // Assignment-mode submissions
  const { data: submissions = [] } = useQuery({
    queryKey: ['submissions', assignmentId],
    queryFn: () => base44.entities.Submission.filter({ assignment_id: assignmentId }, '-created_date', 100),
    enabled: accessGranted && mode === 'assignment',
  });

  // Course-mode: first load all assignments for that course (so we can pick
  // up their submissions and use their total_points for badges).
  const courseId = mode === 'course' ? courseIdParam : null;
  const { data: courseAssignments = [] } = useQuery({
    queryKey: ['course-assignments-grading', courseId],
    queryFn: () => base44.entities.Assignment.filter({ course_id: courseId }, '-created_date', 200),
    enabled: accessGranted && mode === 'course',
  });

  const { data: courseSubmissions = [] } = useQuery({
    queryKey: ['course-submissions-grading', courseId, courseAssignments.map(a => a.id).join(',')],
    queryFn: async () => {
      if (courseAssignments.length === 0) return [];
      const groups = await Promise.all(
        courseAssignments.map(a => base44.entities.Submission.filter({ assignment_id: a.id }, '-created_date', 200))
      );
      return groups.flat();
    },
    enabled: accessGranted && mode === 'course' && courseAssignments.length > 0,
  });

  const gradeMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Submission.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['submissions']);
      queryClient.invalidateQueries(['course-submissions-grading']);
      setGradingSubmission(null);
      setGradeForm({});
      toast.success('Submission graded!');
    },
    onError: (err) => {
      toast.error(`Failed to save grade: ${err.message}`);
    },
  });

  // Resolve the assignment for a given submission (used by validation in
  // course mode where `assignment` is the wrong record).
  const assignmentForSubmission = (submission) => {
    if (mode === 'assignment') return assignment;
    return courseAssignments.find(a => a.id === submission.assignment_id);
  };

  // ── Strict grade validation ───────────────────────────────────────────────
  // Rejects blank, NaN, negative, and over-maximum values BEFORE any update.
  const handleGrade = (submission) => {
    const target = assignmentForSubmission(submission);
    if (!target) {
      toast.error('Cannot find the assignment for that submission.');
      return;
    }
    const maxPoints = Number(target.total_points);
    if (!Number.isFinite(maxPoints) || maxPoints <= 0) {
      toast.error('This assignment has no valid total_points configured.');
      return;
    }
    const raw = gradeForm.grade;
    if (raw === '' || raw === null || raw === undefined) {
      toast.error('Please enter a grade.');
      return;
    }
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) {
      toast.error('Grade must be a number.');
      return;
    }
    if (parsed < 0) {
      toast.error('Grade cannot be negative.');
      return;
    }
    if (parsed > maxPoints) {
      toast.error(`Grade cannot exceed ${maxPoints}.`);
      return;
    }

    gradeMutation.mutate({
      id: submission.id,
      data: {
        ...submission,
        grade: parsed,
        feedback: gradeForm.feedback || '',
        is_graded: true,
      },
    });
  };

  // ── Terminal states ───────────────────────────────────────────────────────
  if (accessState === 'not-found') {
    return (
      <ErrorState
        title={mode === 'missing' ? 'Missing assignment' : 'Not found'}
        message={
          mode === 'missing'
            ? 'No assignment or course was supplied. Open this page from your tutor dashboard.'
            : mode === 'assignment'
              ? 'That assignment does not exist or has been deleted.'
              : 'That course does not exist or has been deleted.'
        }
      />
    );
  }
  if (accessState === 'denied') {
    return <ErrorState title="Access denied" message={accessDeniedReason || 'You do not have access to this grading view.'} />;
  }
  if (accessState !== 'granted') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const displayedSubmissions = mode === 'assignment' ? submissions : courseSubmissions;
  const heading = mode === 'assignment'
    ? assignment?.title
    : `All submissions · ${courseFromParam?.title || ''}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={createPageUrl('TutorDashboard')} className="inline-flex items-center text-indigo-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {mode === 'assignment' ? 'Grade Submissions' : 'All Submissions'}
          </h1>
          <p className="text-muted-foreground">{heading}</p>
        </div>

        <Card className="p-6 bg-card text-slate-900">
          <h2 className="text-xl font-semibold mb-6 text-slate-900">Student Submissions</h2>

          <div className="space-y-4">
            {displayedSubmissions.map((submission) => {
              const target = assignmentForSubmission(submission);
              const maxPoints = target?.total_points;
              return (
                <Card key={submission.id} className="p-4 bg-muted">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{submission.student_name}</h3>
                      <p className="text-sm text-muted-foreground">{submission.student_email}</p>
                      {mode === 'course' && target && (
                        <p className="text-xs text-gray-400 mt-1">Assignment: {target.title}</p>
                      )}
                    </div>
                    <Badge variant={submission.is_graded ? 'default' : 'secondary'}>
                      {submission.is_graded ? `Graded: ${submission.grade}/${maxPoints ?? '?'}` : 'Pending'}
                    </Badge>
                  </div>

                  <div className="bg-card rounded-lg p-4 mb-3">
                    <p className="text-foreground whitespace-pre-wrap">{submission.content}</p>
                  </div>

                  {gradingSubmission?.id === submission.id ? (
                    <div className="bg-card rounded-lg p-4 space-y-3">
                      <div>
                        <Label>Grade (out of {maxPoints ?? '?'})</Label>
                        <Input
                          type="number"
                          inputProps={{ min: 0, max: maxPoints, step: 'any' }}
                          value={gradeForm.grade ?? ''}
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
                        <Button variant="contained" onClick={() => handleGrade(submission)} size="sm" className="bg-indigo-600 text-white" disabled={gradeMutation.isPending}>
                          <Save className="w-4 h-4 mr-2" />
                          {gradeMutation.isPending ? 'Saving…' : 'Submit Grade'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => { setGradingSubmission(null); setGradeForm({}); }}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {submission.is_graded && submission.feedback && (
                        <div className="bg-green-50 dark:bg-green-500/15 rounded-lg p-3 mb-3">
                          <p className="text-sm font-medium text-green-900 dark:text-green-300 mb-1">Feedback:</p>
                          <p className="text-sm text-green-800 dark:text-green-300">{submission.feedback}</p>
                        </div>
                      )}
                      {!submission.is_graded && (
                        <Button
                          onClick={() => {
                            setGradingSubmission(submission);
                            setGradeForm({ grade: '', feedback: '' });
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
              );
            })}
            {displayedSubmissions.length === 0 && (
              <p className="text-muted-foreground text-center py-8">No submissions yet</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}