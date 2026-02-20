import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container, Card, Box, Typography, Button, TextField, Tabs, Tab,
  List, ListItem, ListItemText, Avatar, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import { Users, FileText, MessageSquare, Video, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function GroupProjectWorkspace({ projectId }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [deliverableName, setDeliverableName] = useState('');

  const { data: project } = useQuery({
    queryKey: ['group-project', projectId],
    queryFn: () => base44.entities.GroupProject.get(projectId)
  });

  const { data: workspace } = useQuery({
    queryKey: ['workspace', project?.workspace_id],
    queryFn: () => base44.entities.CollaborativeWorkspace.get(project.workspace_id),
    enabled: !!project?.workspace_id
  });

  const uploadDeliverableMutation = useMutation({
    mutationFn: async ({ file, name }) => {
      const { data } = await base44.integrations.Core.UploadFile({ file });
      const deliverable = {
        name,
        file_url: data.file_url,
        submitted_by: (await base44.auth.me()).email,
        submitted_date: new Date().toISOString()
      };
      
      const updatedDeliverables = [...(project.deliverables || []), deliverable];
      await base44.entities.GroupProject.update(projectId, {
        deliverables: updatedDeliverables
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['group-project', projectId]);
      toast.success('Deliverable uploaded!');
      setShowUploadDialog(false);
      setUploadFile(null);
      setDeliverableName('');
    }
  });

  const handleUpload = () => {
    if (!uploadFile || !deliverableName.trim()) {
      toast.error('Please provide file and name');
      return;
    }
    uploadDeliverableMutation.mutate({ file: uploadFile, name: deliverableName });
  };

  if (!project) return null;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Card sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight="bold">{project.title}</Typography>
          <Chip 
            label={project.status} 
            color={project.status === 'completed' ? 'success' : 'primary'}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {project.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {project.team_members?.map((member, idx) => (
            <Chip
              key={idx}
              avatar={<Avatar>{member.name?.charAt(0)}</Avatar>}
              label={`${member.name} (${member.role || 'Member'})`}
              size="small"
            />
          ))}
        </Box>
      </Card>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab icon={<FileText className="w-4 h-4" />} label="Deliverables" />
          <Tab icon={<MessageSquare className="w-4 h-4" />} label="Discussion" />
          <Tab icon={<Users className="w-4 h-4" />} label="Team" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Project Deliverables</Typography>
            <Button
              variant="contained"
              startIcon={<Upload className="w-4 h-4" />}
              onClick={() => setShowUploadDialog(true)}
            >
              Upload Deliverable
            </Button>
          </Box>

          <List>
            {project.deliverables?.map((deliverable, idx) => (
              <ListItem key={idx} sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                <ListItemText
                  primary={deliverable.name}
                  secondary={`Submitted by ${deliverable.submitted_by} on ${new Date(deliverable.submitted_date).toLocaleDateString()}`}
                />
                <Button href={deliverable.file_url} target="_blank">View</Button>
              </ListItem>
            ))}
            {(!project.deliverables || project.deliverables.length === 0) && (
              <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                No deliverables uploaded yet
              </Typography>
            )}
          </List>
        </Card>
      )}

      {activeTab === 1 && (
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Team Discussion</Typography>
          <Typography color="text.secondary">
            Use the message center to communicate with your team members.
          </Typography>
        </Card>
      )}

      {activeTab === 2 && (
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Team Members</Typography>
          <List>
            {project.team_members?.map((member, idx) => (
              <ListItem key={idx}>
                <Avatar sx={{ mr: 2 }}>{member.name?.charAt(0)}</Avatar>
                <ListItemText
                  primary={member.name}
                  secondary={member.role || 'Team Member'}
                />
              </ListItem>
            ))}
          </List>
        </Card>
      )}

      <Dialog open={showUploadDialog} onClose={() => setShowUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Deliverable</DialogTitle>
        <DialogContent>
          <TextField
            label="Deliverable Name"
            value={deliverableName}
            onChange={(e) => setDeliverableName(e.target.value)}
            fullWidth
            sx={{ mt: 2, mb: 2 }}
          />
          <input
            type="file"
            onChange={(e) => setUploadFile(e.target.files[0])}
            style={{ width: '100%' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={uploadDeliverableMutation.isPending}
          >
            {uploadDeliverableMutation.isPending ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}