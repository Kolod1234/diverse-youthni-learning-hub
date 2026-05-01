import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, Box, Button, Typography, Chip, Stack, Skeleton } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { motion } from 'framer-motion';

export default function StudentQuizzes({ enrollments, user }) {
  const courseIds = enrollments.map(e => e.course_id);

  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ['student-quizzes', courseIds.join(',')],
    queryFn: async () => {
      if (courseIds.length === 0) return [];
      const results = await Promise.all(
        courseIds.map(id => base44.entities.Quiz.filter({ course_id: id, is_published: true }, '-created_date', 50))
      );
      return results.flat();
    },
    enabled: courseIds.length > 0,
  });

  const { data: attempts = [] } = useQuery({
    queryKey: ['student-quiz-attempts', user?.email],
    queryFn: () => base44.entities.QuizAttempt.filter({ created_by: user?.email }, '-created_date', 200),
    enabled: !!user?.email,
  });

  const getAttemptsForQuiz = (quizId) => attempts.filter(a => a.quiz_id === quizId);
  const getBestScore = (quizId) => {
    const quizAttempts = getAttemptsForQuiz(quizId);
    if (quizAttempts.length === 0) return null;
    return Math.max(...quizAttempts.map(a => a.score || 0));
  };

  if (isLoading) {
    return (
      <Stack spacing={1.5}>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: 2 }} />
        ))}
      </Stack>
    );
  }

  if (quizzes.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 7, bgcolor: 'action.hover', borderRadius: 4 }}>
        <HelpOutlineIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
        <Typography variant="body1" fontWeight={500} sx={{ color: 'text.secondary' }}>
          No quizzes available
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.disabled', mt: 0.5 }}>
          Quizzes from your enrolled courses will appear here
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={1.5}>
      {quizzes.map((quiz, i) => {
        const quizAttempts = getAttemptsForQuiz(quiz.id);
        const bestScore = getBestScore(quiz.id);
        const passed = bestScore !== null && bestScore >= (quiz.passing_score || 70);
        const attempted = quizAttempts.length > 0;
        const borderColor = passed ? '#bbf7d0' : attempted ? '#fde68a' : 'divider';
        const iconBg = passed ? '#dcfce7' : attempted ? '#fef3c7' : '#e0e7ff';
        const iconColor = passed ? '#16a34a' : attempted ? '#d97706' : '#4f46e5';

        return (
          <motion.div
            key={quiz.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card sx={{ p: 2, border: 1, borderColor, boxShadow: 0, '&:hover': { boxShadow: 3 }, transition: 'box-shadow 0.2s' }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2.5,
                    bgcolor: iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {passed ? (
                    <EmojiEventsIcon sx={{ fontSize: 20, color: iconColor }} />
                  ) : attempted ? (
                    <RefreshIcon sx={{ fontSize: 20, color: iconColor }} />
                  ) : (
                    <HelpOutlineIcon sx={{ fontSize: 20, color: iconColor }} />
                  )}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap' }}>
                    <Typography variant="subtitle2" fontWeight={600} noWrap sx={{ color: 'text.primary' }}>
                      {quiz.title}
                    </Typography>
                    {passed ? (
                      <Chip
                        icon={<CheckCircleIcon sx={{ fontSize: '12px !important' }} />}
                        label="Passed"
                        size="small"
                        sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#dcfce7', color: '#15803d' }}
                      />
                    ) : attempted ? (
                      <Chip label="Attempted" size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#fef3c7', color: '#a16207' }} />
                    ) : (
                      <Chip label="Not Started" size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#e0e7ff', color: '#4338ca' }} />
                    )}
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 0.5, color: 'text.secondary', flexWrap: 'wrap' }}>
                    <Typography variant="caption">{quiz.questions?.length || 0} questions</Typography>
                    {quiz.time_limit_minutes && (
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <AccessTimeIcon sx={{ fontSize: 12 }} />
                        <Typography variant="caption">{quiz.time_limit_minutes} min</Typography>
                      </Stack>
                    )}
                    <Typography variant="caption">Pass: {quiz.passing_score || 70}%</Typography>
                    {bestScore !== null && (
                      <Typography variant="caption" fontWeight={600} sx={{ color: passed ? '#16a34a' : '#d97706' }}>
                        Best: {bestScore}%
                      </Typography>
                    )}
                    {quizAttempts.length > 0 && (
                      <Typography variant="caption">
                        {quizAttempts.length} attempt{quizAttempts.length !== 1 ? 's' : ''}
                      </Typography>
                    )}
                  </Stack>
                </Box>

                <Button
                  component={Link}
                  to={createPageUrl('Quiz') + `?quizId=${quiz.id}`}
                  size="small"
                  variant="contained"
                  startIcon={attempted ? <RefreshIcon sx={{ fontSize: 14 }} /> : <PlayArrowIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    flexShrink: 0,
                    bgcolor: attempted ? '#d97706' : '#4f46e5',
                    '&:hover': { bgcolor: attempted ? '#b45309' : '#4338ca' },
                  }}
                >
                  {attempted ? 'Retake' : 'Start'}
                </Button>
              </Stack>
            </Card>
          </motion.div>
        );
      })}
    </Stack>
  );
}