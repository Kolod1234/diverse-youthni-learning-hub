import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card, Box, Typography, TextField, Button, FormControl,
  InputLabel, Select, MenuItem, Tabs, Tab
} from '@mui/material';
import { Beaker, Code, BarChart3, Box as BoxIcon, Play } from 'lucide-react';
import { toast } from 'sonner';

export default function SimulationBuilder({ lessonId, courseId, onCreated }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const [simulationData, setSimulationData] = useState({
    title: '',
    description: '',
    simulation_type: '3d_model',
    embed_url: '',
    custom_code: '',
    config: {}
  });

  const createSimulationMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.InteractiveSimulation.create({
        ...data,
        lesson_id: lessonId,
        course_id: courseId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['simulations']);
      toast.success('Simulation created!');
      onCreated?.();
    }
  });

  const handleCreate = () => {
    if (!simulationData.title.trim()) {
      toast.error('Please provide a title');
      return;
    }

    createSimulationMutation.mutate(simulationData);
  };

  const simulationTypes = [
    { value: '3d_model', label: '3D Model', icon: BoxIcon },
    { value: 'lab_experiment', label: 'Lab Experiment', icon: Beaker },
    { value: 'data_visualization', label: 'Data Visualization', icon: BarChart3 },
    { value: 'coding_sandbox', label: 'Coding Sandbox', icon: Code },
    { value: 'physics_simulation', label: 'Physics Simulation', icon: Play },
    { value: 'chemistry_lab', label: 'Chemistry Lab', icon: Beaker },
    { value: 'math_visualization', label: 'Math Visualization', icon: BarChart3 }
  ];

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>Create Interactive Simulation</Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Basic Info" />
          <Tab label="Configuration" />
          <Tab label="Preview" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Simulation Title"
            value={simulationData.title}
            onChange={(e) => setSimulationData({ ...simulationData, title: e.target.value })}
            fullWidth
          />

          <TextField
            label="Description"
            multiline
            rows={2}
            value={simulationData.description}
            onChange={(e) => setSimulationData({ ...simulationData, description: e.target.value })}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Simulation Type</InputLabel>
            <Select
              value={simulationData.simulation_type}
              onChange={(e) => setSimulationData({ ...simulationData, simulation_type: e.target.value })}
              label="Simulation Type"
            >
              {simulationTypes.map(type => {
                const Icon = type.icon;
                return (
                  <MenuItem key={type.value} value={type.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Icon className="w-4 h-4" />
                      {type.label}
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>
      )}

      {activeTab === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="External Embed URL (PhET, LabXchange, etc.)"
            value={simulationData.embed_url}
            onChange={(e) => setSimulationData({ ...simulationData, embed_url: e.target.value })}
            fullWidth
            helperText="Leave empty if using custom code"
          />

          <TextField
            label="Custom JavaScript Code"
            multiline
            rows={10}
            value={simulationData.custom_code}
            onChange={(e) => setSimulationData({ ...simulationData, custom_code: e.target.value })}
            fullWidth
            placeholder="// Custom simulation logic (optional)"
            sx={{ fontFamily: 'monospace' }}
          />
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Preview</Typography>
          {simulationData.embed_url ? (
            <Box sx={{ 
              width: '100%', 
              height: 400, 
              border: 1, 
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'hidden'
            }}>
              <iframe
                src={simulationData.embed_url}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Simulation Preview"
              />
            </Box>
          ) : (
            <Box sx={{ 
              height: 400, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: 'grey.100',
              borderRadius: 1
            }}>
              <Typography color="text.secondary">No preview available</Typography>
            </Box>
          )}
        </Box>
      )}

      <Button
        variant="contained"
        size="large"
        onClick={handleCreate}
        disabled={createSimulationMutation.isPending}
        fullWidth
        sx={{ mt: 3 }}
      >
        {createSimulationMutation.isPending ? 'Creating...' : 'Create Simulation'}
      </Button>
    </Card>
  );
}