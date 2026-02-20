import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card, Box, Typography, Button, List, ListItem, ListItemText,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import { GitBranch, Save, History, Eye, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ContentVersionControl({ entityType, entityId, currentContent }) {
  const queryClient = useQueryClient();
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [changeSummary, setChangeSummary] = useState('');
  const [selectedVersion, setSelectedVersion] = useState(null);

  const { data: versions = [] } = useQuery({
    queryKey: ['content-versions', entityType, entityId],
    queryFn: () => base44.entities.ContentVersion.filter({ entity_type: entityType, entity_id: entityId }, '-version_number')
  });

  const createVersionMutation = useMutation({
    mutationFn: async ({ content, summary }) => {
      const nextVersion = versions.length > 0 ? Math.max(...versions.map(v => v.version_number)) + 1 : 1;
      
      return await base44.entities.ContentVersion.create({
        entity_type: entityType,
        entity_id: entityId,
        version_number: nextVersion,
        content_snapshot: content,
        change_summary: summary,
        review_status: 'draft'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['content-versions']);
      toast.success('Version saved!');
      setShowVersionDialog(false);
      setChangeSummary('');
    }
  });

  const publishVersionMutation = useMutation({
    mutationFn: async (versionId) => {
      // Unpublish all other versions
      await Promise.all(
        versions
          .filter(v => v.is_published && v.id !== versionId)
          .map(v => base44.entities.ContentVersion.update(v.id, { is_published: false }))
      );
      
      // Publish selected version
      return await base44.entities.ContentVersion.update(versionId, { 
        is_published: true,
        review_status: 'approved'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['content-versions']);
      toast.success('Version published!');
    }
  });

  const handleSaveVersion = () => {
    if (!changeSummary.trim()) {
      toast.error('Please provide a change summary');
      return;
    }
    createVersionMutation.mutate({ content: currentContent, summary: changeSummary });
  };

  const currentPublishedVersion = versions.find(v => v.is_published);

  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GitBranch className="w-5 h-5" />
          <Typography variant="h6">Version Control</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Save className="w-4 h-4" />}
          onClick={() => setShowVersionDialog(true)}
        >
          Save New Version
        </Button>
      </Box>

      {currentPublishedVersion && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
          <Typography variant="body2" fontWeight="bold">
            Published Version: v{currentPublishedVersion.version_number}
          </Typography>
          <Typography variant="caption">{currentPublishedVersion.change_summary}</Typography>
        </Box>
      )}

      <List>
        {versions.map((version) => (
          <ListItem
            key={version.id}
            sx={{
              bgcolor: version.is_published ? 'success.light' : 'grey.50',
              mb: 1,
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2">v{version.version_number}</Typography>
                  {version.is_published && <Chip label="Published" color="success" size="small" />}
                  <Chip label={version.review_status} size="small" />
                </Box>
              }
              secondary={
                <>
                  {version.change_summary}
                  <br />
                  <Typography variant="caption">
                    By {version.author_name || version.author_email} on {new Date(version.created_date).toLocaleDateString()}
                  </Typography>
                </>
              }
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                startIcon={<Eye className="w-4 h-4" />}
                onClick={() => setSelectedVersion(version)}
              >
                View
              </Button>
              {!version.is_published && (
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircle className="w-4 h-4" />}
                  onClick={() => publishVersionMutation.mutate(version.id)}
                >
                  Publish
                </Button>
              )}
            </Box>
          </ListItem>
        ))}
      </List>

      <Dialog open={showVersionDialog} onClose={() => setShowVersionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save New Version</DialogTitle>
        <DialogContent>
          <TextField
            label="Change Summary"
            multiline
            rows={3}
            value={changeSummary}
            onChange={(e) => setChangeSummary(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
            placeholder="Describe what changed in this version..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowVersionDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveVersion}
            disabled={createVersionMutation.isPending}
          >
            {createVersionMutation.isPending ? 'Saving...' : 'Save Version'}
          </Button>
        </DialogActions>
      </Dialog>

      {selectedVersion && (
        <Dialog open={!!selectedVersion} onClose={() => setSelectedVersion(null)} maxWidth="md" fullWidth>
          <DialogTitle>Version {selectedVersion.version_number}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>{selectedVersion.change_summary}</Typography>
            <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, maxHeight: 400, overflow: 'auto' }}>
              <pre>{JSON.stringify(selectedVersion.content_snapshot, null, 2)}</pre>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedVersion(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Card>
  );
}