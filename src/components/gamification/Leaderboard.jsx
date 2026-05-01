import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, Box, Typography, Avatar, Stack, Skeleton } from '@mui/material';
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
      <Card sx={{ p: 3, borderRadius: 3, boxShadow: 1 }}>
        <Stack spacing={2}>
          {[0, 1, 2, 3, 4].map((index) => (
            <Skeleton key={index} variant="rounded" height={64} />
          ))}
        </Stack>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3, borderRadius: 3, boxShadow: 1, background: 'linear-gradient(to bottom right, #fef9c3, #ffedd5)' }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <EmojiEventsIcon sx={{ fontSize: 32, color: '#ca8a04' }} />
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#1f2937' }}>Leaderboard</Typography>
          <Typography variant="caption" color="text.secondary">Top performers this month</Typography>
        </Box>
      </Stack>

      <Stack spacing={1.5}>
        {leaderboard.map((entry) => {
          const highlight = entry.rank <= 3;
          let rowSx = { bgcolor: 'background.paper', color: 'text.primary' };
          if (entry.rank === 1) rowSx = { background: 'linear-gradient(to right, #fbbf24, #eab308)', color: 'white', boxShadow: 3 };
          else if (entry.rank === 2) rowSx = { background: 'linear-gradient(to right, #d1d5db, #9ca3af)', color: '#1f2937', boxShadow: 2 };
          else if (entry.rank === 3) rowSx = { background: 'linear-gradient(to right, #fb923c, #f97316)', color: 'white', boxShadow: 2 };

          return (
            <Box
              key={entry.id || `${entry.created_by}-${entry.rank}`}
              sx={{ display: 'flex', alignItems: 'center', gap: 2, borderRadius: 3, p: 2, transition: 'all 0.2s', ...rowSx }}
            >
              <Box sx={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {entry.rank === 1 && <EmojiEventsIcon sx={{ fontSize: 32 }} />}
                {entry.rank === 2 && <MilitaryTechIcon sx={{ fontSize: 32 }} />}
                {entry.rank === 3 && <WorkspacePremiumIcon sx={{ fontSize: 32 }} />}
                {entry.rank > 3 && <Typography variant="h6" fontWeight={700} sx={{ color: '#9ca3af' }}>#{entry.rank}</Typography>}
              </Box>

              <Avatar
                src={entry.user.avatar}
                sx={{ width: 48, height: 48, bgcolor: highlight ? 'rgba(255,255,255,0.2)' : '#e5e7eb', color: highlight ? 'white' : '#374151' }}
              >
                {(entry.user.full_name || 'U').charAt(0)}
              </Avatar>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={600} noWrap>{entry.user.full_name || 'Anonymous'}</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="caption" sx={{ opacity: highlight ? 0.9 : 1, color: highlight ? 'inherit' : 'text.secondary' }}>
                    Level {entry.level || 1}
                  </Typography>
                  {entry.streak_days > 0 && (
                    <>
                      <Typography variant="caption">•</Typography>
                      <Typography variant="caption" sx={{ opacity: highlight ? 0.9 : 1, color: highlight ? 'inherit' : '#ea580c' }}>
                        🔥 {entry.streak_days} day streak
                      </Typography>
                    </>
                  )}
                </Stack>
              </Box>

              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h6" fontWeight={700}>{entry.points?.toLocaleString() || 0}</Typography>
                <Typography variant="caption" sx={{ opacity: highlight ? 0.9 : 1, color: highlight ? 'inherit' : 'text.secondary' }}>points</Typography>
              </Box>
            </Box>
          );
        })}
      </Stack>

      {leaderboard.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <TrendingUpIcon sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
          <Typography color="text.secondary">No learners yet. Be the first to earn points!</Typography>
        </Box>
      )}
    </Card>
  );
}