import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Box, Card, Avatar, Stack, Typography, Skeleton } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export default function Leaderboard({ limit = 10 }) {
  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: async () => {
      const allProgress = await base44.entities.UserProgress.list('-points', limit);
      const users = await base44.entities.User.list('id', 1000);
      const userMap = users.reduce((acc, user) => {
        acc[user.email] = user;
        return acc;
      }, {});

      return allProgress.map((progress, index) => ({
        ...progress,
        rank: index + 1,
        user: userMap[progress.created_by] || { full_name: 'Anonymous', email: progress.created_by }
      }));
    }
  });

  if (isLoading) {
    return (
      <Card sx={{ p: 3, boxShadow: 1, border: 1, borderColor: 'divider' }}>
        <Stack spacing={2}>
          {[0, 1, 2, 3, 4].map((index) => (
            <Skeleton key={index} variant="rounded" height={64} sx={{ borderRadius: 2 }} />
          ))}
        </Stack>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        p: 3,
        background: 'linear-gradient(135deg, #fefce8, #fff7ed)',
        border: 1,
        borderColor: 'divider',
        boxShadow: 1,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <EmojiEventsIcon sx={{ fontSize: 32, color: '#ca8a04' }} />
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ color: 'text.primary' }}>
            Leaderboard
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Top performers this month
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={1.5}>
        {leaderboard.map((entry) => {
          const isFirst = entry.rank === 1;
          const isSecond = entry.rank === 2;
          const isThird = entry.rank === 3;
          const highlight = isFirst || isSecond || isThird;

          let bgGradient = 'white';
          let textColor = 'text.primary';
          let shadow = 0;

          if (isFirst) {
            bgGradient = 'linear-gradient(to right, #facc15, #eab308)';
            textColor = 'white';
            shadow = 4;
          } else if (isSecond) {
            bgGradient = 'linear-gradient(to right, #d1d5db, #9ca3af)';
            textColor = '#1f2937';
            shadow = 2;
          } else if (isThird) {
            bgGradient = 'linear-gradient(to right, #fb923c, #f97316)';
            textColor = 'white';
            shadow = 2;
          }

          return (
            <Stack
              key={entry.id || `${entry.created_by}-${entry.rank}`}
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{
                p: 2,
                borderRadius: 3,
                background: bgGradient,
                color: textColor,
                boxShadow: shadow,
                transition: 'all 0.2s',
              }}
            >
              <Box sx={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {isFirst && <EmojiEventsIcon sx={{ fontSize: 32 }} />}
                {isSecond && <MilitaryTechIcon sx={{ fontSize: 32 }} />}
                {isThird && <WorkspacePremiumIcon sx={{ fontSize: 32 }} />}
                {entry.rank > 3 && (
                  <Typography variant="h5" fontWeight={700} sx={{ color: 'text.disabled' }}>
                    #{entry.rank}
                  </Typography>
                )}
              </Box>

              <Avatar
                src={entry.user.avatar}
                alt={entry.user.full_name || 'User'}
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: highlight ? 'rgba(255,255,255,0.2)' : '#e5e7eb',
                  color: highlight ? 'white' : '#374151',
                  fontWeight: 600,
                }}
              >
                {(entry.user.full_name || 'U').charAt(0)}
              </Avatar>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight={600} noWrap>
                  {entry.user.full_name || 'Anonymous'}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ fontSize: '0.875rem' }}>
                  <Typography variant="body2" sx={{ opacity: highlight ? 0.9 : 1, color: highlight ? 'inherit' : 'text.secondary' }}>
                    Level {entry.level || 1}
                  </Typography>
                  {entry.streak_days > 0 && (
                    <>
                      <Typography variant="body2">•</Typography>
                      <Typography variant="body2" sx={{ opacity: highlight ? 0.9 : 1, color: highlight ? 'inherit' : '#ea580c' }}>
                        🔥 {entry.streak_days} day streak
                      </Typography>
                    </>
                  )}
                </Stack>
              </Box>

              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h5" fontWeight={700}>
                  {entry.points?.toLocaleString() || 0}
                </Typography>
                <Typography variant="caption" sx={{ opacity: highlight ? 0.9 : 1, color: highlight ? 'inherit' : 'text.disabled' }}>
                  points
                </Typography>
              </Box>
            </Stack>
          );
        })}
      </Stack>

      {leaderboard.length === 0 && (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <TrendingUpIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No learners yet. Be the first to earn points!
          </Typography>
        </Box>
      )}
    </Card>
  );
}