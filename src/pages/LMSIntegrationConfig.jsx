import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container, Card, Box, Typography, Button, TextField, Select,
  MenuItem, FormControl, InputLabel, Grid, Alert, List,
  ListItem, ListItemText, Chip, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, Switch,
  FormControlLabel
} from '@mui/material';
import { Plus, Trash2, Settings, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function LMSIntegrationConfig() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState(null);
  const [testingConnection, setTestingConnection] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    provider: 'moodle',
    integration_type: 'lms',
    endpoint_url: '',
    auth_type: 'api_key',
    credentials: {},
    sync_enabled: false,
    sync_frequency: 'daily',
    sync_direction: 'push'
  });

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: integrations = [] } = useQuery({
    queryKey: ['lms-integrations'],
    queryFn: () => base44.entities.LMSIntegration.list('-created_date', 50)
  });

  const createIntegrationMutation = useMutation({
    mutationFn: async (data) => {
      if (editingIntegration) {
        return await base44.entities.LMSIntegration.update(editingIntegration.id, data);
      }
      return await base44.entities.LMSIntegration.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lms-integrations']);
      toast.success(editingIntegration ? 'Integration updated!' : 'Integration created!');
      setShowDialog(false);
      resetForm();
    }
  });

  const deleteIntegrationMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.LMSIntegration.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lms-integrations']);
      toast.success('Integration deleted');
    }
  });

  const testConnectionMutation = useMutation({
    mutationFn: async (integration) => {
      const response = await base44.functions.invoke('testLMSConnection', {
        integrationId: integration.id
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Connection successful!');
      } else {
        toast.error('Connection failed: ' + data.error);
      }
      setTestingConnection(null);
    },
    onError: () => {
      toast.error('Failed to test connection');
      setTestingConnection(null);
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      provider: 'moodle',
      integration_type: 'lms',
      endpoint_url: '',
      auth_type: 'api_key',
      credentials: {},
      sync_enabled: false,
      sync_frequency: 'daily',
      sync_direction: 'push'
    });
    setEditingIntegration(null);
  };

  const handleEdit = (integration) => {
    setEditingIntegration(integration);
    setFormData({
      name: integration.name,
      provider: integration.provider,
      integration_type: integration.integration_type,
      endpoint_url: integration.endpoint_url,
      auth_type: integration.auth_type,
      credentials: integration.credentials || {},
      sync_enabled: integration.sync_enabled || false,
      sync_frequency: integration.sync_frequency || 'daily',
      sync_direction: integration.sync_direction || 'push'
    });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.endpoint_url) {
      toast.error('Please fill required fields');
      return;
    }

    createIntegrationMutation.mutate(formData);
  };

  const handleTestConnection = (integration) => {
    setTestingConnection(integration.id);
    testConnectionMutation.mutate(integration);
  };

  const handleTestConnection = (integration) => {
    setTestingConnection(integration.id);
    testConnectionMutation.mutate(integration);
  };

  const providers = [
    { value: 'moodle', label: 'Moodle' },
    { value: 'canvas', label: 'Canvas LMS' },
    { value: 'blackboard', label: 'Blackboard Learn' },
    { value: 'schoology', label: 'Schoology' },
    { value: 'custom_lrs', label: 'Custom LRS (xAPI)' },
    { value: 'workday', label: 'Workday' },
    { value: 'successfactors', label: 'SAP SuccessFactors' }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
            LMS Integration Configuration
          </Typography>
          <Typography color="text.secondary">
            Connect to external learning management systems and HR platforms
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus className="w-4 h-4" />}
          onClick={() => {
            resetForm();
            setShowDialog(true);
          }}
        >
          Add Integration
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Configure integrations to sync learner data, course enrollments, and completion records with external systems.
      </Alert>

      <Grid container spacing={3}>
        {integrations.map((integration) => (
          <Grid item xs={12} md={6} key={integration.id}>
            <Card sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6">{integration.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {providers.find(p => p.value === integration.provider)?.label}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton size="small" onClick={() => handleEdit(integration)}>
                    <Settings className="w-4 h-4" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      if (confirm('Delete this integration?')) {
                        deleteIntegrationMutation.mutate(integration.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </Box>
              </Box>

              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Endpoint"
                    secondary={integration.endpoint_url}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Sync Status"
                    secondary={
                      <Chip
                        label={integration.sync_enabled ? 'Enabled' : 'Disabled'}
                        size="small"
                        color={integration.sync_enabled ? 'success' : 'default'}
                      />
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Last Sync"
                    secondary={
                      integration.last_sync_date
                        ? new Date(integration.last_sync_date).toLocaleString()
                        : 'Never'
                    }
                  />
                </ListItem>
                {integration.last_sync_status && (
                  <ListItem>
                    <ListItemText
                      primary="Last Status"
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {integration.last_sync_status === 'success' ? (
                            <CheckCircle className="w-3 h-3 text-success-main" />
                          ) : (
                            <XCircle className="w-3 h-3 text-error-main" />
                          )}
                          <span>{integration.last_sync_status}</span>
                        </Box>
                      }
                    />
                  </ListItem>
                )}
              </List>

              <Button
                variant="outlined"
                size="small"
                startIcon={
                  testingConnection === integration.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )
                }
                onClick={() => handleTestConnection(integration)}
                disabled={testingConnection === integration.id}
                fullWidth
              >
                Test Connection
              </Button>
            </Card>
          </Grid>
        ))}

        {integrations.length === 0 && (
          <Grid item xs={12}>
            <Card sx={{ p: 6, textAlign: 'center' }}>
              <Settings className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <Typography variant="h6" sx={{ mb: 1 }}>
                No Integrations Configured
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Add your first LMS integration to start syncing data
              </Typography>
              <Button
                variant="contained"
                startIcon={<Plus className="w-4 h-4" />}
                onClick={() => setShowDialog(true)}
              >
                Add Integration
              </Button>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Configuration Dialog */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingIntegration ? 'Edit Integration' : 'Add LMS Integration'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Integration Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />

            <FormControl fullWidth>
              <InputLabel>Provider</InputLabel>
              <Select
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                label="Provider"
              >
                {providers.map(p => (
                  <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Endpoint URL"
              value={formData.endpoint_url}
              onChange={(e) => setFormData({ ...formData, endpoint_url: e.target.value })}
              fullWidth
              required
              placeholder="https://your-lms.com/api"
            />

            <FormControl fullWidth>
              <InputLabel>Authentication Type</InputLabel>
              <Select
                value={formData.auth_type}
                onChange={(e) => setFormData({ ...formData, auth_type: e.target.value })}
                label="Authentication Type"
              >
                <MenuItem value="api_key">API Key</MenuItem>
                <MenuItem value="oauth2">OAuth 2.0</MenuItem>
                <MenuItem value="basic_auth">Basic Auth</MenuItem>
              </Select>
            </FormControl>

            {formData.auth_type === 'api_key' && (
              <TextField
                label="API Key"
                value={formData.credentials.api_key || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  credentials: { ...formData.credentials, api_key: e.target.value }
                })}
                fullWidth
                type="password"
              />
            )}

            {formData.auth_type === 'basic_auth' && (
              <>
                <TextField
                  label="Username"
                  value={formData.credentials.username || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    credentials: { ...formData.credentials, username: e.target.value }
                  })}
                  fullWidth
                />
                <TextField
                  label="Password"
                  value={formData.credentials.password || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    credentials: { ...formData.credentials, password: e.target.value }
                  })}
                  fullWidth
                  type="password"
                />
              </>
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={formData.sync_enabled}
                  onChange={(e) => setFormData({ ...formData, sync_enabled: e.target.checked })}
                />
              }
              label="Enable Automatic Sync"
            />

            {formData.sync_enabled && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Sync Frequency</InputLabel>
                  <Select
                    value={formData.sync_frequency}
                    onChange={(e) => setFormData({ ...formData, sync_frequency: e.target.value })}
                    label="Sync Frequency"
                  >
                    <MenuItem value="realtime">Real-time</MenuItem>
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Sync Direction</InputLabel>
                  <Select
                    value={formData.sync_direction}
                    onChange={(e) => setFormData({ ...formData, sync_direction: e.target.value })}
                    label="Sync Direction"
                  >
                    <MenuItem value="push">Push (Base44 → LMS)</MenuItem>
                    <MenuItem value="pull">Pull (LMS → Base44)</MenuItem>
                    <MenuItem value="bidirectional">Bidirectional</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={createIntegrationMutation.isPending}
          >
            {createIntegrationMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}