import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, Button, Card, Typography, Chip, LinearProgress, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert
} from '@mui/material';
import { Play, CheckCircle, AlertCircle, Loader, Download } from 'lucide-react';

export default function CourseIntegrityValidator() {
  const [isRunning, setIsRunning] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [validation, setValidation] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [error, setError] = useState(null);
  const [fixResult, setFixResult] = useState(null);

  const handleRunValidation = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('validateCourseIntegrity', {});
      setValidation(response.data.validation);
      setFixResult(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleAutoFix = async () => {
    setIsFixing(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('fixCourseIssues', {
        issues_found: validation.issues_found
      });
      setFixResult(response.data.fixes);
      // Re-run validation to show updated status
      setTimeout(() => handleRunValidation(), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsFixing(false);
    }
  };

  const downloadReport = () => {
    const dataStr = JSON.stringify(validation, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `course-validation-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 6 }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, md: 4 } }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Box sx={{ mb: 6 }}>
            <Typography variant="h3" fontWeight={700} sx={{ mb: 2 }}>
              Course Integrity Validator
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Scan all courses to verify content, objectives, and structure integrity
            </Typography>
          </Box>
        </motion.div>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* Validation Controls */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card sx={{ p: 3, mb: 6, border: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={isRunning ? <Loader className="animate-spin" size={20} /> : <Play size={20} />}
                onClick={handleRunValidation}
                disabled={isRunning || isFixing}
                sx={{
                  background: 'linear-gradient(to right, #2563eb, #1e40af)',
                  color: 'white',
                  px: 3,
                  py: 1.5,
                  fontWeight: 600
                }}
              >
                {isRunning ? 'Validating...' : 'Run Full Validation'}
              </Button>
              {validation && !isRunning && validation.issues_found.length > 0 && (
                <Button
                  variant="contained"
                  startIcon={isFixing ? <Loader className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                  onClick={handleAutoFix}
                  disabled={isFixing}
                  sx={{
                    background: 'linear-gradient(to right, #10b981, #059669)',
                    color: 'white',
                    px: 3,
                    py: 1.5,
                    fontWeight: 600
                  }}
                >
                  {isFixing ? 'Fixing...' : 'Auto-Fix Issues'}
                </Button>
              )}
              {validation && !isRunning && (
                <>
                  <Chip
                    icon={<CheckCircle size={16} />}
                    label={`Last run: ${new Date(validation.timestamp).toLocaleString()}`}
                    sx={{ bgcolor: '#d1fae5', color: '#065f46' }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<Download size={16} />}
                    onClick={downloadReport}
                    sx={{ ml: 'auto' }}
                  >
                    Download Report
                  </Button>
                </>
              )}
            </Box>
          </Card>
        </motion.div>

        {validation && (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Summary Stats */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 6 }}>
                {[
                  { label: 'Total Courses', value: validation.summary.total_courses, color: '#3b82f6' },
                  { label: 'With Issues', value: validation.summary.courses_with_issues, color: '#ef4444', highlight: validation.summary.courses_with_issues > 0 },
                  { label: 'Missing Lessons', value: validation.summary.missing_lessons, color: '#f59e0b' },
                  { label: 'Missing Objectives', value: validation.summary.missing_objectives, color: '#8b5cf6' }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card sx={{
                      p: 3,
                      border: 2,
                      borderColor: stat.highlight ? 'error.main' : 'divider',
                      bgcolor: stat.highlight ? 'error.main' + '10' : 'background.paper'
                    }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {stat.label}
                      </Typography>
                      <Typography variant="h4" fontWeight={700} sx={{ color: stat.color }}>
                        {stat.value}
                      </Typography>
                    </Card>
                  </motion.div>
                ))}
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* Issues List */}
              {validation.issues_found.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Typography variant="h5" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AlertCircle size={24} color="#ef4444" />
                    Courses with Issues ({validation.issues_found.length})
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {validation.issues_found.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card
                          sx={{
                            p: 3,
                            border: 2,
                            borderColor: 'error.main',
                            bgcolor: '#fef2f2',
                            cursor: 'pointer',
                            '&:hover': { boxShadow: 4 }
                          }}
                          onClick={() => setSelectedCourse(item)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <AlertCircle size={24} color="#dc2626" sx={{ flexShrink: 0, mt: 0.5 }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                                {item.course_title}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                <Chip label={`ID: ${item.course_id.slice(0, 8)}...`} size="small" />
                                <Chip label={`${item.lesson_count} lessons`} size="small" />
                              </Box>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {item.issues.slice(0, 3).map((issue, i) => (
                                  <Typography key={i} variant="body2" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <span>•</span> {issue}
                                  </Typography>
                                ))}
                                {item.issues.length > 3 && (
                                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                    +{item.issues.length - 3} more issues
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </Card>
                      </motion.div>
                    ))}
                  </Box>
                </motion.div>
              )}

              {validation.issues_found.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card sx={{ p: 6, textAlign: 'center', bgcolor: '#f0fdf4', border: 2, borderColor: 'success.main' }}>
                    <CheckCircle size={48} color="#16a34a" style={{ margin: '0 auto 16px' }} />
                    <Typography variant="h5" fontWeight={700} sx={{ color: '#16a34a', mb: 1 }}>
                      All Courses Valid
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      No integrity issues found. All courses have proper content and structure.
                    </Typography>
                  </Card>
                </motion.div>
              )}

              {/* Detailed Course List */}
              <Box sx={{ mt: 6 }}>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
                  All Courses Status
                </Typography>
                <TableContainer component={Card} sx={{ border: 1, borderColor: 'divider' }}>
                  <Table>
                    <TableHead sx={{ bgcolor: 'background.paper' }}>
                      <TableRow>
                        <TableCell fontWeight={700}>Course</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="right">Issues</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {validation.courses_status.map((course) => (
                        <TableRow key={course.course_id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {course.course_title}
                            </Typography>
                          </TableCell>
                          <TableCell variant="body2" color="text.secondary">
                            {course.category}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              icon={course.status === 'OK' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                              label={course.status}
                              size="small"
                              color={course.status === 'OK' ? 'success' : 'error'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={course.issues.length}
                              size="small"
                              variant={course.issues.length > 0 ? 'filled' : 'outlined'}
                              color={course.issues.length > 0 ? 'error' : 'default'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </motion.div>
          </AnimatePresence>
        )}
      </Box>

      {/* Course Detail Dialog */}
      <Dialog open={!!selectedCourse} onClose={() => setSelectedCourse(null)} maxWidth="sm" fullWidth>
        {selectedCourse && (
          <>
            <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
              {selectedCourse.course_title}
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              <Box sx={{ mb: 3 }}>
                <Chip label={`${selectedCourse.lesson_count} Lessons`} sx={{ mr: 1 }} />
                <Chip label={selectedCourse.course_id} variant="outlined" size="small" />
              </Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
                Issues Found ({selectedCourse.issues.length})
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {selectedCourse.issues.map((issue, i) => (
                  <Alert key={i} severity="error" variant="outlined">
                    {issue}
                  </Alert>
                ))}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedCourse(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}