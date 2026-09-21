import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, Box, Typography, Stack, Skeleton, Tabs, Tab, Button, Alert } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

export default function Leaderboard({ limit = 10 }) {
  const [qualification, setQualification] = useState('gcse');
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['leaderboard', qualification, limit],
    queryFn: async () => (await base44.functions.invoke('publicScoreboardData', { type: 'points', qualification, limit })).data
  });
  const entries = data?.entries || [];
  return <Card sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, minWidth: 0 }}>
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
      <EmojiEventsIcon color="warning" /><Typography variant="h6" fontWeight={700}>Student rankings</Typography>
    </Stack>
    <Tabs value={qualification} onChange={(_, value) => setQualification(value)} variant="fullWidth" aria-label="Ranking qualification">
      <Tab value="gcse" label="GCSE" /><Tab value="alevel" label="A-level" />
    </Tabs>
    <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
      All-time points: your best percentage on each topic check. Only improvements add points. Usernames only.
    </Typography>
    {isPending ? <Skeleton variant="rounded" height={180} /> : isError ?
      <Alert severity="error" action={<Button onClick={() => refetch()}>Retry</Button>}>Rankings could not be loaded.</Alert> :
      <Stack spacing={1.5}>
        {data?.current_user && <Typography variant="body2">Your rank: #{data.current_user.rank} · {data.current_user.points.toLocaleString()} points</Typography>}
        {entries.map(entry => <Box key={entry.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, border: 1, borderColor: 'divider', borderRadius: 2, minWidth: 0 }}>
          <Typography fontWeight={700} sx={{ flexShrink: 0 }}>#{entry.rank}</Typography>
          <Typography fontWeight={600} sx={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>{entry.username}</Typography>
          <Box sx={{ textAlign: 'right', flexShrink: 0 }}><Typography fontWeight={700}>{entry.points.toLocaleString()}</Typography><Typography variant="caption">points</Typography></Box>
        </Box>)}
        {!entries.length && <Typography color="text.secondary" sx={{ py: 3 }}>No topic-check scores yet for {qualification === 'gcse' ? 'GCSE' : 'A-level'}.</Typography>}
      </Stack>}
  </Card>;
}
