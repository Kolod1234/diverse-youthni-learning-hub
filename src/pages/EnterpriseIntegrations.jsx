import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container, Card, Box, Typography, Button, List, ListItem,
  ListItemText, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Switch
} from '@mui/material';
import { Link2, RefreshCw, Settings, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function EnterpriseIntegrations() {
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newIntegration, setNewIntegration] = useState({
    name: '',
    provider: 'moodle',
    integration_type: 'lms',
    endpoint_url: '',
    auth_type: 'api_key',
    sync_enabled: false,
    sync_frequency: 'daily'
  });

  const { data: integrations = [] } = useQuery({
    queryKey: ['lms-integrations'],
    queryFn: () => base44.entities.LMSIntegration.list('-created_date')
  });

  const createIntegrationMutation = useMutation({
    mutationFn: (data) => base44.entities.LMSIntegration.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['lms-integrations']);
      toast.success('Integration added!');
      setShowAddDialog(false);
      setNewIntegration({
        name: '',
        provider: 'moodle',
        integration_type: 'lms',
        endpoint_url: '',
        auth_type: 'api_key',
        sync_enabled: false,
        sync_frequency: 'daily'
      });
    }
  });

  const syncMutation = useMutation({
    mutationFn: async (integrationId) => {
      const response = await base44.functions.invoke('syncLMSData', { integrationId });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['lms-integrations']);
      toast.success(`Synced ${data.users_synced + data.progress_synced} records`);
    },
    onError: () => {
      toast.error('Sync failed');
    }
  });

  const handleAddIntegration = () => {
    if (!newIntegration.name || !newIntegration.endpoint_url) {
      toast.error('Please fill in required fields');
      return;
    }
    createIntegrationMutation.mutate(newIntegration);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Enterprise Integrations</Typography>
          <Typography variant="body1" color="text.secondary">
            Connect with LMS, HRIS, and LRS systems
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Link2 className="w-4 h-4" />}
          onClick={() => setShowAddDialog(true)}
        >
          Add Integration
        </Button>
      </Box>

      <Card sx={{ p: 3 }}>
        <List>
          {integrations.map((integration) => (
            <ListItem
              key={integration.id}
              sx={{
                bgcolor: 'grey.50',
                mb: 2,
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h6">{integration.name}</Typography>
                  <Chip label={integration.provider} size="small" />
                  <Chip label={integration.integration_type} size="small" />
                  {integration.is_active ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {integration.endpoint_url}
                </Typography>
                {integration.last_sync_date && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Last sync: {new Date(integration.last_sync_date).toLocaleString()}
                    </Typography>
                    <Chip
                      label={integration.last_sync_status}
                      size="small"
                      color={
                        integration.last_sync_status === 'success' ? 'success' :
                        integration.last_sync_status === 'partial' ? 'warning' : 'error'
                      }
                    />
                  </Box>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<RefreshCw className="w-4 h-4" />}
                  onClick={() => syncMutation.mutate(integration.id)}
                  disabled={!integration.sync_enabled || syncMutation.isPending}
                >
                  Sync Now
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Settings className="w-4 h-4" />}
                >
                  Configure
                </Button>
              </Box>
            </ListItem>
          ))}
          {integrations.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Link2 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <Typography color="text.secondary">No integrations configured</Typography>
            </Box>
          )}
        </List>
      </Card>

      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Integration</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Integration Name"
              value={newIntegration.name}
              onChange={(e) => setNewIntegration({ ...newIntegration, name: e.target.value })}
              fullWidth
            />
            
            <FormControl fullWidth>
              <InputLabel>Provider</InputLabel>
              <Select
                value={newIntegration.provider}
                onChange={(e) => setNewIntegration({ ...newIntegration, provider: e.target.value })}
                label="Provider"
              >
                <MenuItem value="moodle">Moodle</MenuItem>
                <MenuItem value="canvas">Canvas</MenuItem>
                <MenuItem value="blackboard">Blackboard</MenuItem>
                <MenuItem value="workday">Workday (HRIS)</MenuItem>
                <MenuItem value="successfactors">SAP SuccessFactors</MenuItem>
                <MenuItem value="custom_lrs">Custom LRS</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Integration Type</InputLabel>
              <Select
                value={newIntegration.integration_type}
                onChange={(e) => setNewIntegration({ ...newIntegration, integration_type: e.target.value })}
                label="Integration Type"
              >
                <MenuItem value="lms">LMS</MenuItem>
                <MenuItem value="hris">HRIS</MenuItem>
                <MenuItem value="lrs">LRS</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Endpoint URL"
              value={newIntegration.endpoint_url}
              onChange={(e) => setNewIntegration({ ...newIntegration, endpoint_url: e.target.value })}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Sync Frequency</InputLabel>
              <Select
                value={newIntegration.sync_frequency}
                onChange={(e) => setNewIntegration({ ...newIntegration, sync_frequency: e.target.value })}
                label="Sync Frequency"
              >
                <MenuItem value="realtime">Realtime</MenuItem>
                <MenuItem value="hourly">Hourly</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography>Enable Auto-Sync:</Typography>
              <Switch
                checked={newIntegration.sync_enabled}
                onChange={(e) => setNewIntegration({ ...newIntegration, sync_enabled: e.target.checked })}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddIntegration}
            disabled={createIntegrationMutation.isPending}
          >
            {createIntegrationMutation.isPending ? 'Adding...' : 'Add Integration'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}