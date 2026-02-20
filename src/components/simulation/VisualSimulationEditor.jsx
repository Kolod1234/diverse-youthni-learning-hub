import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card, Box, Typography, TextField, Button, IconButton,
  Select, MenuItem, FormControl, InputLabel, Tabs, Tab,
  List, ListItem, ListItemText, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert
} from '@mui/material';
import { Plus, Trash2, Edit, GitBranch, CheckCircle, ArrowRight, Save } from 'lucide-react';
import AIRichTextEditor from '@/components/authoring/AIRichTextEditor';
import { toast } from 'sonner';

export default function VisualSimulationEditor({ simulation, onSave }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const [simData, setSimData] = useState(simulation || {
    title: '',
    description: '',
    simulation_type: 'branching_scenario',
    scenario_data: {
      nodes: [{
        id: 'node_1',
        title: 'Start',
        content: 'Welcome to the scenario',
        choices: [],
        is_end: false
      }],
      start_node_id: 'node_1'
    }
  });
  const [selectedNode, setSelectedNode] = useState(null);
  const [showNodeDialog, setShowNodeDialog] = useState(false);
  const [nodeForm, setNodeForm] = useState({
    id: '',
    title: '',
    content: '',
    media_url: '',
    choices: [],
    is_end: false
  });

  const saveSimulationMutation = useMutation({
    mutationFn: async (data) => {
      if (simulation?.id) {
        return await base44.entities.InteractiveSimulation.update(simulation.id, data);
      }
      return await base44.entities.InteractiveSimulation.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['simulations']);
      toast.success('Simulation saved!');
      onSave?.();
    }
  });

  const addNode = () => {
    const newId = `node_${Date.now()}`;
    setNodeForm({
      id: newId,
      title: 'New Node',
      content: '',
      media_url: '',
      choices: [],
      is_end: false
    });
    setSelectedNode(null);
    setShowNodeDialog(true);
  };

  const editNode = (node) => {
    setNodeForm({ ...node });
    setSelectedNode(node.id);
    setShowNodeDialog(true);
  };

  const saveNode = () => {
    const nodes = simData.scenario_data?.nodes || [];
    
    if (selectedNode) {
      // Update existing
      const updated = nodes.map(n => n.id === selectedNode ? nodeForm : n);
      setSimData({
        ...simData,
        scenario_data: { ...simData.scenario_data, nodes: updated }
      });
    } else {
      // Add new
      setSimData({
        ...simData,
        scenario_data: {
          ...simData.scenario_data,
          nodes: [...nodes, nodeForm]
        }
      });
    }
    
    setShowNodeDialog(false);
  };

  const deleteNode = (nodeId) => {
    if (nodeId === simData.scenario_data?.start_node_id) {
      toast.error('Cannot delete start node');
      return;
    }
    
    const nodes = simData.scenario_data?.nodes.filter(n => n.id !== nodeId);
    setSimData({
      ...simData,
      scenario_data: { ...simData.scenario_data, nodes }
    });
  };

  const addChoice = () => {
    setNodeForm({
      ...nodeForm,
      choices: [
        ...nodeForm.choices,
        { text: '', next_node_id: '', feedback: '', points: 0 }
      ]
    });
  };

  const updateChoice = (idx, field, value) => {
    const choices = [...nodeForm.choices];
    choices[idx] = { ...choices[idx], [field]: value };
    setNodeForm({ ...nodeForm, choices });
  };

  const deleteChoice = (idx) => {
    setNodeForm({
      ...nodeForm,
      choices: nodeForm.choices.filter((_, i) => i !== idx)
    });
  };

  return (
    <Box>
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>Simulation Editor</Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          <TextField
            label="Simulation Title"
            value={simData.title}
            onChange={(e) => setSimData({ ...simData, title: e.target.value })}
            fullWidth
          />

          <TextField
            label="Description"
            multiline
            rows={2}
            value={simData.description}
            onChange={(e) => setSimData({ ...simData, description: e.target.value })}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Simulation Type</InputLabel>
            <Select
              value={simData.simulation_type}
              onChange={(e) => setSimData({ ...simData, simulation_type: e.target.value })}
              label="Simulation Type"
            >
              <MenuItem value="branching_scenario">Branching Scenario</MenuItem>
              <MenuItem value="decision_tree">Decision Tree</MenuItem>
              <MenuItem value="virtual_patient">Virtual Patient</MenuItem>
              <MenuItem value="case_study">Interactive Case Study</MenuItem>
              <MenuItem value="3d_model">3D Model</MenuItem>
              <MenuItem value="lab_experiment">Lab Experiment</MenuItem>
              <MenuItem value="physics_simulation">Physics Simulation</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
            <Tab label="Scenario Builder" />
            <Tab label="Settings" />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2">Scenario Nodes</Typography>
              <Button
                size="small"
                startIcon={<Plus className="w-4 h-4" />}
                onClick={addNode}
              >
                Add Node
              </Button>
            </Box>

            <Alert severity="info" sx={{ mb: 2 }}>
              Create nodes with multiple choice paths. Students navigate through the scenario based on their decisions.
            </Alert>

            <List>
              {simData.scenario_data?.nodes?.map((node) => (
                <ListItem
                  key={node.id}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: node.id === simData.scenario_data?.start_node_id ? 'success.light' : 'background.paper'
                  }}
                  secondaryAction={
                    <Box>
                      <IconButton onClick={() => editNode(node)} size="small">
                        <Edit className="w-4 h-4" />
                      </IconButton>
                      <IconButton
                        onClick={() => deleteNode(node.id)}
                        size="small"
                        disabled={node.id === simData.scenario_data?.start_node_id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {node.is_end ? (
                          <CheckCircle className="w-4 h-4 text-success-main" />
                        ) : (
                          <GitBranch className="w-4 h-4" />
                        )}
                        <span>{node.title}</span>
                      </Box>
                    }
                    secondary={`${node.choices?.length || 0} choices • ${node.is_end ? 'End node' : 'Continue'}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Start Node</InputLabel>
              <Select
                value={simData.scenario_data?.start_node_id || ''}
                onChange={(e) => setSimData({
                  ...simData,
                  scenario_data: {
                    ...simData.scenario_data,
                    start_node_id: e.target.value
                  }
                })}
                label="Start Node"
              >
                {simData.scenario_data?.nodes?.map(node => (
                  <MenuItem key={node.id} value={node.id}>{node.title}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Minimum Time (seconds)"
              type="number"
              value={simData.completion_criteria?.min_time_seconds || 0}
              onChange={(e) => setSimData({
                ...simData,
                completion_criteria: {
                  ...simData.completion_criteria,
                  min_time_seconds: parseInt(e.target.value)
                }
              })}
              fullWidth
            />
          </Box>
        )}

        <Button
          variant="contained"
          size="large"
          startIcon={<Save className="w-5 h-5" />}
          onClick={() => saveSimulationMutation.mutate(simData)}
          disabled={saveSimulationMutation.isPending}
          fullWidth
          sx={{ mt: 3 }}
        >
          {saveSimulationMutation.isPending ? 'Saving...' : 'Save Simulation'}
        </Button>
      </Card>

      {/* Node Editor Dialog */}
      <Dialog open={showNodeDialog} onClose={() => setShowNodeDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedNode ? 'Edit Node' : 'Add Node'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Node Title"
              value={nodeForm.title}
              onChange={(e) => setNodeForm({ ...nodeForm, title: e.target.value })}
              fullWidth
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Content</Typography>
              <AIRichTextEditor
                content={nodeForm.content}
                onChange={(content) => setNodeForm({ ...nodeForm, content })}
                placeholder="Enter the scenario content..."
              />
            </Box>

            <TextField
              label="Media URL (optional)"
              value={nodeForm.media_url}
              onChange={(e) => setNodeForm({ ...nodeForm, media_url: e.target.value })}
              fullWidth
              placeholder="Image or video URL"
            />

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">Choices</Typography>
                <Button size="small" onClick={addChoice}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Choice
                </Button>
              </Box>

              {nodeForm.choices.map((choice, idx) => (
                <Card key={idx} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" fontWeight="bold">Choice {idx + 1}</Typography>
                    <IconButton size="small" onClick={() => deleteChoice(idx)}>
                      <Trash2 className="w-3 h-3" />
                    </IconButton>
                  </Box>
                  
                  <TextField
                    label="Choice Text"
                    value={choice.text}
                    onChange={(e) => updateChoice(idx, 'text', e.target.value)}
                    fullWidth
                    size="small"
                    sx={{ mb: 1 }}
                  />

                  <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                    <InputLabel>Next Node</InputLabel>
                    <Select
                      value={choice.next_node_id}
                      onChange={(e) => updateChoice(idx, 'next_node_id', e.target.value)}
                      label="Next Node"
                    >
                      <MenuItem value="">End scenario</MenuItem>
                      {simData.scenario_data?.nodes?.map(node => (
                        <MenuItem key={node.id} value={node.id}>{node.title}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Feedback"
                    value={choice.feedback}
                    onChange={(e) => updateChoice(idx, 'feedback', e.target.value)}
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    sx={{ mb: 1 }}
                  />

                  <TextField
                    label="Points"
                    type="number"
                    value={choice.points}
                    onChange={(e) => updateChoice(idx, 'points', parseInt(e.target.value) || 0)}
                    fullWidth
                    size="small"
                  />
                </Card>
              ))}

              {nodeForm.choices.length === 0 && (
                <Alert severity="info">
                  Add choices for this node, or mark it as an end node
                </Alert>
              )}
            </Box>

            <FormControl>
              <label>
                <input
                  type="checkbox"
                  checked={nodeForm.is_end}
                  onChange={(e) => setNodeForm({ ...nodeForm, is_end: e.target.checked })}
                />
                <span style={{ marginLeft: 8 }}>This is an end node (no choices needed)</span>
              </label>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNodeDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveNode}>
            {selectedNode ? 'Update Node' : 'Add Node'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}