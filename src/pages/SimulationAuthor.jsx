import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import {
  Container, Card, Box, Typography, Grid, Tabs, Tab, Button
} from '@mui/material';
import { Beaker, Play, Save } from 'lucide-react';
import VisualSimulationEditor from '@/components/simulation/VisualSimulationEditor';
import SimulationPlayer from '@/components/simulation/SimulationPlayer';

export default function SimulationAuthor() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const simulationId = params.get('id');
  const [mode, setMode] = useState('edit');

  const { data: simulation, refetch } = useQuery({
    queryKey: ['simulation', simulationId],
    queryFn: () => base44.entities.InteractiveSimulation.get(simulationId),
    enabled: !!simulationId
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
            Simulation Authoring Studio
          </Typography>
          <Typography color="text.secondary">
            Create interactive branching scenarios and decision trees
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant={mode === 'edit' ? 'contained' : 'outlined'}
            onClick={() => setMode('edit')}
            startIcon={<Beaker className="w-4 h-4" />}
          >
            Edit
          </Button>
          <Button
            variant={mode === 'preview' ? 'contained' : 'outlined'}
            onClick={() => setMode('preview')}
            startIcon={<Play className="w-4 h-4" />}
          >
            Preview
          </Button>
        </Box>
      </Box>

      {mode === 'edit' ? (
        <VisualSimulationEditor
          simulation={simulation}
          onSave={() => refetch()}
        />
      ) : simulation ? (
        <SimulationPlayer
          simulation={simulation}
          onComplete={(result) => {
            toast.success(`Completed! Points: ${result.totalPoints}`);
          }}
        />
      ) : (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Create a simulation first to preview
          </Typography>
        </Card>
      )}
    </Container>
  );
}