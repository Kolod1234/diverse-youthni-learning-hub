import React from 'react';
import { Box, Button, Card, Typography } from '@mui/material';
import { PATHWAYS } from '@/components/pathways/pathways';

// The three pathway cards. Used on the public homepage and in the hub when someone has not chosen yet.
// `onChoose(id)` runs when a card's button is pressed; `busyId` disables the cards while a choice saves.
export default function PathwayCards({ onChoose, actionLabel = 'Choose', busyId = null, current = [] }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 2.5 }}>
      {PATHWAYS.map(p => {
        const chosen = current.includes(p.id);
        return (
          <Card key={p.id} component="article" sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box component="img" src={p.image} alt="" loading="lazy"
              sx={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', display: 'block', bgcolor: '#1e4a7f' }} />
            <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1 }}>
              <Typography component="h3" sx={{ fontSize: '1.25rem', fontWeight: 700 }}>{p.label}</Typography>
              <Typography color="text.secondary" sx={{ flexGrow: 1 }}>{p.description}</Typography>
              <Button variant={chosen ? 'outlined' : 'contained'} onClick={() => onChoose(p.id)}
                disabled={!!busyId || chosen} sx={{ mt: 1, alignSelf: 'flex-start' }}>
                {chosen ? 'Your pathway' : busyId === p.id ? 'Saving…' : actionLabel}
              </Button>
            </Box>
          </Card>
        );
      })}
    </Box>
  );
}
