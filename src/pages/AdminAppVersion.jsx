import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Box, Container, Typography, Button, Card, CardContent, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, IconButton,
  LinearProgress, Alert
} from '@mui/material';
import { Upload, Plus, Bell, Trash2, CheckCircle } from 'lucide-react';

export default function AdminAppVersion() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notifyConfirm, setNotifyConfirm] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [notifyStatus, setNotifyStatus] = useState(null);
  const [form, setForm] = useState({ version_name: '', version_code: '', apk_url: '', release_notes: '' });

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['app-versions'],
    queryFn: () => base44.entities.AppVersion.list('-created_date', 20),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.AppVersion.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-versions'] });
      setDialogOpen(false);
      setForm({ version_name: '', version_code: '', apk_url: '', release_notes: '' });
    },
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

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>App Version Manager</Typography>
          <Typography color="text.secondary">Manage APK downloads for registered users</Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => setDialogOpen(true)}
          sx={{ bgcolor: '#003366', '&:hover': { bgcolor: '#002244' } }}>
          New Version
        </Button>
      </Box>

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
            <Card key={v.id} sx={{ border: v.is_active ? '2px solid #003366' : '1px solid', borderColor: v.is_active ? '#003366' : 'divider' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="h6" fontWeight={700}>v{v.version_name}</Typography>
                      {v.is_active && <Chip label="Active" size="small" color="primary" />}
                    </Box>
                    <Typography variant="caption" color="text.secondary">Version Code: {v.version_code}</Typography>
                    {v.release_notes && (
                      <Typography sx={{ mt: 1, fontSize: '0.875rem', color: 'text.secondary' }}>{v.release_notes}</Typography>
                    )}
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, wordBreak: 'break-all', color: 'primary.main' }}>
                      {v.apk_url}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
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
          <TextField
            label="Version Name (e.g. 1.0.2)"
            value={form.version_name}
            onChange={e => setForm(f => ({ ...f, version_name: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Version Code (integer, e.g. 3)"
            type="number"
            value={form.version_code}
            onChange={e => setForm(f => ({ ...f, version_code: Number(e.target.value) }))}
            fullWidth
          />
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => createMutation.mutate({ ...form, is_active: true })}
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