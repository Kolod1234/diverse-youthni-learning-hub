import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Box, Container, Typography, Button, Card, CardContent, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, IconButton,
  LinearProgress, Alert, Switch, FormControlLabel, Tooltip, Divider
} from '@mui/material';
import { Upload, Plus, Bell, Trash2, CheckCircle, Star, AlertTriangle, Info } from 'lucide-react';

export default function AdminAppVersion() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notifyConfirm, setNotifyConfirm] = useState(null);
  const [notifyStatus, setNotifyStatus] = useState(null);
  const [form, setForm] = useState({
    version_name: '',
    version_code: '',
    apk_url: '',
    release_notes: '',
    is_active: true,
    force_update: false,
  });

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['app-versions'],
    queryFn: () => base44.entities.AppVersion.list('-created_date', 20),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      // Deactivate all others if this is set as active
      if (data.is_active) {
        const actives = versions.filter(v => v.is_active);
        await Promise.all(actives.map(v => base44.entities.AppVersion.update(v.id, { is_active: false })));
      }
      return base44.entities.AppVersion.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-versions'] });
      setDialogOpen(false);
      setForm({ version_name: '', version_code: '', apk_url: '', release_notes: '', is_active: true, force_update: false });
    },
  });

  const setActiveMutation = useMutation({
    mutationFn: async (version) => {
      // Deactivate all, then activate selected
      await Promise.all(versions.map(v => base44.entities.AppVersion.update(v.id, { is_active: false })));
      return base44.entities.AppVersion.update(version.id, { is_active: true });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['app-versions'] }),
  });

  const toggleForceUpdate = useMutation({
    mutationFn: ({ id, force_update }) => base44.entities.AppVersion.update(id, { force_update }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['app-versions'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AppVersion.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['app-versions'] }),
  });

  const handleUploadAPK = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, apk_url: file_url }));
    setUploading(false);
  };

  const handleNotify = async (version) => {
    setNotifyStatus('sending');
    setNotifyConfirm(null);
    const res = await base44.functions.invoke('notifyAppUpdate', { version_id: version.id });
    setNotifyStatus(`sent:${res.data.emails_sent}`);
  };

  const activeVersion = versions.find(v => v.is_active);

  // Build the API endpoint explanation
  const apiCheckUrl = `${window.location.origin}/api/functions/checkAppVersion`;

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>App Version Manager</Typography>
          <Typography color="text.secondary">Manage APK downloads & in-app update prompts</Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => setDialogOpen(true)}
          sx={{ bgcolor: '#003366', '&:hover': { bgcolor: '#002244' } }}>
          New Version
        </Button>
      </Box>

      {/* Active Version Summary */}
      {activeVersion && (
        <Card sx={{ mb: 3, bgcolor: '#003366', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.7)' }}>Current Active Version</Typography>
                <Typography variant="h5" fontWeight={700}>v{activeVersion.version_name}</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Version Code: {activeVersion.version_code}
                  {activeVersion.force_update && ' · Force Update ON'}
                </Typography>
              </Box>
              <Chip
                label={activeVersion.force_update ? '⚠ Force Update' : '✓ Optional Update'}
                sx={{
                  bgcolor: activeVersion.force_update ? '#dc2626' : '#16a34a',
                  color: 'white', fontWeight: 700
                }}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* In-App Update Integration Guide */}
      <Card sx={{ mb: 3, border: '1px solid', borderColor: 'info.light', bgcolor: 'info.50' }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
            <Info size={20} color="#0288d1" style={{ marginTop: 2, flexShrink: 0 }} />
            <Box>
              <Typography variant="body2" fontWeight={700} color="info.dark">In-App Update Check API</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Your Android app should call the backend function below on startup to check for updates.
              </Typography>
              <Box sx={{ bgcolor: '#1e293b', borderRadius: 1, p: 1.5, fontFamily: 'monospace', fontSize: '0.75rem', color: '#e2e8f0', wordBreak: 'break-all' }}>
                POST /functions/checkAppVersion<br />
                {'{ "version_code": <current_app_version_code> }'}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Response: <code style={{ background: '#f1f5f9', padding: '1px 4px', borderRadius: 3 }}>
                  {'{ update_available, force_update, latest_version, apk_url, release_notes }'}
                </code>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {notifyStatus?.startsWith('sent:') && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setNotifyStatus(null)}>
          Notification sent to {notifyStatus.split(':')[1]} users successfully!
        </Alert>
      )}
      {notifyStatus === 'sending' && (
        <Alert severity="info" sx={{ mb: 3 }}>Sending email notifications...</Alert>
      )}

      {isLoading ? (
        <LinearProgress />
      ) : versions.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="text.secondary">No versions uploaded yet. Click "New Version" to get started.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {versions.map((v) => (
            <Card key={v.id} sx={{
              border: '1px solid',
              borderColor: v.is_active ? '#003366' : 'divider',
              borderWidth: v.is_active ? 2 : 1,
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                      <Typography variant="h6" fontWeight={700}>v{v.version_name}</Typography>
                      {v.is_active && <Chip label="Active" size="small" color="primary" />}
                      {v.force_update && (
                        <Chip label="Force Update" size="small" sx={{ bgcolor: '#dc2626', color: 'white' }} icon={<AlertTriangle size={12} />} />
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Version Code: {v.version_code} · Uploaded: {new Date(v.created_date).toLocaleDateString()}
                    </Typography>
                    {v.release_notes && (
                      <Typography sx={{ mt: 1, fontSize: '0.875rem', color: 'text.secondary' }}>{v.release_notes}</Typography>
                    )}
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, wordBreak: 'break-all', color: 'primary.main' }}>
                      {v.apk_url}
                    </Typography>

                    {/* Force Update Toggle */}
                    <Box sx={{ mt: 1.5 }}>
                      <Tooltip title="Force update requires all users on older versions to update before using the app">
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={!!v.force_update}
                              onChange={(e) => toggleForceUpdate.mutate({ id: v.id, force_update: e.target.checked })}
                              color="error"
                            />
                          }
                          label={<Typography variant="caption">Force Update (blocks older app versions)</Typography>}
                        />
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                    {!v.is_active && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Star size={14} />}
                        onClick={() => setActiveMutation.mutate(v)}
                        disabled={setActiveMutation.isPending}
                        sx={{ bgcolor: '#003366', '&:hover': { bgcolor: '#002244' }, whiteSpace: 'nowrap' }}
                      >
                        Set Active
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Bell size={16} />}
                      onClick={() => setNotifyConfirm(v)}
                    >
                      Notify Users
                    </Button>
                    <IconButton size="small" color="error" onClick={() => deleteMutation.mutate(v.id)}>
                      <Trash2 size={18} />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* New Version Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New App Version</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Version Name (e.g. 1.0.2)"
              value={form.version_name}
              onChange={e => setForm(f => ({ ...f, version_name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Version Code (e.g. 3)"
              type="number"
              value={form.version_code}
              onChange={e => setForm(f => ({ ...f, version_code: Number(e.target.value) }))}
              fullWidth
            />
          </Box>
          <Box>
            <Typography variant="body2" fontWeight={600} gutterBottom>APK File</Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<Upload size={18} />}
              disabled={uploading}
              fullWidth
            >
              {uploading ? 'Uploading...' : form.apk_url ? 'Replace APK' : 'Upload APK'}
              <input type="file" accept=".apk" hidden onChange={handleUploadAPK} />
            </Button>
            {form.apk_url && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <CheckCircle size={16} color="#22c55e" />
                <Typography variant="caption" color="success.main">APK uploaded successfully</Typography>
              </Box>
            )}
          </Box>
          <TextField
            label="Release Notes (optional)"
            value={form.release_notes}
            onChange={e => setForm(f => ({ ...f, release_notes: e.target.value }))}
            multiline
            rows={3}
            fullWidth
            placeholder="What's new in this version..."
          />
          <Divider />
          <FormControlLabel
            control={<Switch checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} color="primary" />}
            label="Set as active version (triggers in-app update prompt)"
          />
          <FormControlLabel
            control={<Switch checked={form.force_update} onChange={e => setForm(f => ({ ...f, force_update: e.target.checked }))} color="error" />}
            label={
              <Box>
                <Typography variant="body2">Force update</Typography>
                <Typography variant="caption" color="text.secondary">Users on older versions must update before using the app</Typography>
              </Box>
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => createMutation.mutate(form)}
            disabled={!form.version_name || !form.version_code || !form.apk_url || createMutation.isPending}
            sx={{ bgcolor: '#003366', '&:hover': { bgcolor: '#002244' } }}
          >
            Save Version
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notify Confirmation Dialog */}
      <Dialog open={Boolean(notifyConfirm)} onClose={() => setNotifyConfirm(null)}>
        <DialogTitle>Notify All Users?</DialogTitle>
        <DialogContent>
          <Typography>
            This will send an email to all registered users with a download link for <strong>v{notifyConfirm?.version_name}</strong>.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotifyConfirm(null)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={() => handleNotify(notifyConfirm)}>
            Send Notifications
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}