import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Box, Container, Typography, Chip, Card, CardContent, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Tabs, Tab, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Avatar, Tooltip, CircularProgress, Alert
} from '@mui/material';
import { Edit, CheckCircle, XCircle, Clock, ExternalLink, Eye, Save, X, LayoutGrid, List } from 'lucide-react';

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  icon: Clock,       bg: '#fef3c7', text: '#92400e' },
  approved: { label: 'Approved', icon: CheckCircle, bg: '#d1fae5', text: '#065f46' },
  rejected: { label: 'Rejected', icon: XCircle,     bg: '#fee2e2', text: '#991b1b' },
};

const CATEGORIES = [
  'Mental Health & Wellbeing', 'Arts & Creativity', 'Programming Projects',
  'Climate Action', 'AI Building', 'Raspberry Pi Projects',
  'Cultural Sensitivity', 'Community Development',
];

const EMPTY_EDIT = {
  title: '', category: '', description: '', long_description: '',
  image_url: '', video_url: '', project_link: '', skills: '', why_showcase: '',
};

export default function AdminProjectSubmissions() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('pending');
  const [editProject, setEditProject] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [previewProject, setPreviewProject] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [viewMode, setViewMode] = useState('kanban');

  const { data: user } = useQuery({
    queryKey: ['auth-me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['admin-project-submissions'],
    queryFn: () => base44.entities.ProjectSubmission.list('-created_date', 200),
  });

  if (user && user.role !== 'admin') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="error">Access denied. Admin only.</Alert>
      </Box>
    );
  }

  const filtered = projects.filter(p => tab === 'all' || p.status === tab);

  const showFeedback = (message, severity = 'success') => {
    setFeedback({ message, severity });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleStatusChange = async (project, newStatus) => {
    setTogglingId(project.id);
    try {
      await base44.entities.ProjectSubmission.update(project.id, { status: newStatus });
      queryClient.invalidateQueries(['admin-project-submissions']);
      showFeedback(`Project "${project.title}" marked as ${newStatus}.`);
    } catch {
      showFeedback('Failed to update status.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const openEdit = (project) => {
    setEditProject(project);
    setEditForm({
      title: project.title || '',
      category: project.category || '',
      description: project.description || '',
      long_description: project.long_description || '',
      image_url: project.image_url || '',
      video_url: project.video_url || '',
      project_link: project.project_link || '',
      skills: (project.skills || []).join(', '),
      why_showcase: project.why_showcase || '',
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.ProjectSubmission.update(editProject.id, {
        title: editForm.title,
        category: editForm.category,
        description: editForm.description,
        long_description: editForm.long_description,
        image_url: editForm.image_url,
        video_url: editForm.video_url,
        project_link: editForm.project_link,
        skills: editForm.skills.split(',').map(s => s.trim()).filter(Boolean),
        why_showcase: editForm.why_showcase,
      });
      queryClient.invalidateQueries(['admin-project-submissions']);
      showFeedback('Project updated successfully.');
      setEditProject(null);
    } catch {
      showFeedback('Failed to save changes.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId;
    const project = projects.find(p => p.id === result.draggableId);
    if (!project || project.status === newStatus) return;
    await handleStatusChange(project, newStatus);
  };

  const tabCounts = {
    pending: projects.filter(p => p.status === 'pending').length,
    approved: projects.filter(p => p.status === 'approved').length,
    rejected: projects.filter(p => p.status === 'rejected').length,
    all: projects.length,
  };

  const COLUMNS = [
    { key: 'pending',  ...STATUS_CONFIG.pending },
    { key: 'approved', ...STATUS_CONFIG.approved },
    { key: 'rejected', ...STATUS_CONFIG.rejected },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ background: 'linear-gradient(135deg, #0b2f5c 0%, #1a0d60 100%)', py: 5 }}>
        <Container maxWidth="xl">
          <Typography variant="h4" fontWeight={900} sx={{ color: 'white', mb: 0.5 }}>
            Project Submissions
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Review, edit and publish learner project submissions to the gallery.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {feedback && (
          <Alert severity={feedback.severity} sx={{ mb: 3 }} onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        )}

        {/* View Toggle + Tabs */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 0 }}>
            {[
              { key: 'pending',  label: 'Pending' },
              { key: 'approved', label: 'Approved' },
              { key: 'rejected', label: 'Rejected' },
              { key: 'all',      label: 'All' },
            ].map(t => (
              <Tab
                key={t.key}
                value={t.key}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {t.label}
                    <Chip label={tabCounts[t.key]} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                  </Box>
                }
              />
            ))}
          </Tabs>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Kanban Board">
              <IconButton aria-label="Board view" aria-pressed={viewMode === 'kanban'}
                onClick={() => setViewMode('kanban')}
                sx={{ bgcolor: viewMode === 'kanban' ? 'primary.main' : 'transparent', color: viewMode === 'kanban' ? 'white' : 'inherit' }}
              >
                <LayoutGrid size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Table View">
              <IconButton aria-label="Table view" aria-pressed={viewMode === 'table'}
                onClick={() => setViewMode('table')}
                sx={{ bgcolor: viewMode === 'table' ? 'primary.main' : 'transparent', color: viewMode === 'table' ? 'white' : 'inherit' }}
              >
                <List size={18} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : viewMode === 'kanban' ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, alignItems: 'start' }}>
              {COLUMNS.map(col => {
                const colProjects = projects.filter(p => p.status === col.key);
                return (
                  <Box key={col.key}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, px: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: col.text }} />
                      <Typography fontWeight={800} sx={{ fontSize: '0.95rem', color: col.text }}>{col.label}</Typography>
                      <Chip label={colProjects.length} size="small" sx={{ bgcolor: col.bg, color: col.text, fontWeight: 700, height: 20, fontSize: '0.7rem', ml: 'auto' }} />
                    </Box>
                    <Droppable droppableId={col.key}>
                      {(provided, snapshot) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          sx={{
                            minHeight: 200,
                            bgcolor: snapshot.isDraggingOver ? col.bg : 'rgba(0,0,0,0.02)',
                            borderRadius: 3,
                            border: '2px dashed',
                            borderColor: snapshot.isDraggingOver ? col.text : 'divider',
                            p: 1.5,
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.5,
                          }}
                        >
                          {colProjects.map((project, index) => (
                            <Draggable key={project.id} draggableId={project.id} index={index}>
                              {(prov, snap) => (
                                <Card
                                  ref={prov.innerRef}
                                  {...prov.draggableProps}
                                  {...prov.dragHandleProps}
                                  sx={{
                                    borderRadius: 3,
                                    boxShadow: snap.isDragging ? '0 12px 32px rgba(0,0,0,0.18)' : '0 2px 8px rgba(0,0,0,0.07)',
                                    border: '1px solid',
                                    borderColor: snap.isDragging ? col.text : 'divider',
                                    cursor: 'grab',
                                    transition: 'box-shadow 0.2s',
                                    bgcolor: 'background.paper',
                                  }}
                                >
                                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    {project.image_url && (
                                      <Box component="img" src={project.image_url} alt={project.title}
                                        sx={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 2, mb: 1.5 }} />
                                    )}
                                    {project.category && (
                                      <Chip label={project.category} size="small" sx={{ mb: 1, fontSize: '0.65rem' }} />
                                    )}
                                    <Typography fontWeight={700} sx={{ fontSize: '0.88rem', mb: 0.5 }}>{project.title}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5, mb: 1.5 }}>
                                      {project.description}
                                    </Typography>
                                    <Typography variant="caption" fontWeight={600} color="text.secondary">By {project.submitter_name}</Typography>
                                    <Box sx={{ display: 'flex', gap: 0.5, mt: 1.5, justifyContent: 'flex-end' }}>
                                      <Tooltip title="Preview">
                                        <IconButton aria-label="Preview" size="small" onClick={() => setPreviewProject(project)}><Eye size={14} /></IconButton>
                                      </Tooltip>
                                      <Tooltip title="Edit">
                                        <IconButton aria-label="Edit" size="small" onClick={() => openEdit(project)}><Edit size={14} /></IconButton>
                                      </Tooltip>
                                    </Box>
                                  </CardContent>
                                </Card>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          {colProjects.length === 0 && (
                            <Box sx={{ textAlign: 'center', py: 4, color: 'text.disabled' }}>
                              <Typography variant="caption">Drag cards here</Typography>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Droppable>
                  </Box>
                );
              })}
            </Box>
          </DragDropContext>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h6" color="text.secondary">No {tab} submissions.</Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Project</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Submitter</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Submitted</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(project => {
                  const cfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.pending;
                  const StatusIcon = cfg.icon;
                  return (
                    <TableRow key={project.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {project.image_url ? (
                            <Avatar variant="rounded" src={project.image_url} sx={{ width: 48, height: 48 }} />
                          ) : (
                            <Avatar variant="rounded" sx={{ width: 48, height: 48, bgcolor: '#e0e7ff', fontSize: '1.5rem' }}>🚀</Avatar>
                          )}
                          <Box>
                            <Typography fontWeight={700} sx={{ fontSize: '0.9rem' }}>{project.title}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: 260 }}>
                              {project.description}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={project.category || '—'} size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{project.submitter_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{project.submitter_email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<StatusIcon size={14} />}
                          label={cfg.label}
                          size="small"
                          sx={{ bgcolor: cfg.bg, color: cfg.text, fontWeight: 700, border: 'none' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {project.created_date ? new Date(project.created_date).toLocaleDateString('en-GB') : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <Tooltip title="Preview">
                            <IconButton aria-label="Preview" size="small" onClick={() => setPreviewProject(project)}><Eye size={16} /></IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton aria-label="Edit" size="small" onClick={() => openEdit(project)}><Edit size={16} /></IconButton>
                          </Tooltip>
                          {project.status !== 'approved' && (
                            <Tooltip title="Approve">
                              <IconButton aria-label="Approve" size="small" disabled={togglingId === project.id} onClick={() => handleStatusChange(project, 'approved')} sx={{ color: '#065f46', bgcolor: '#d1fae5', '&:hover': { bgcolor: '#a7f3d0' } }}>
                                {togglingId === project.id ? <CircularProgress size={14} /> : <CheckCircle size={16} />}
                              </IconButton>
                            </Tooltip>
                          )}
                          {project.status !== 'pending' && (
                            <Tooltip title="Set Pending">
                              <IconButton aria-label="Mark as pending" size="small" disabled={togglingId === project.id} onClick={() => handleStatusChange(project, 'pending')} sx={{ color: '#92400e', bgcolor: '#fef3c7', '&:hover': { bgcolor: '#fde68a' } }}>
                                <Clock size={16} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {project.status !== 'rejected' && (
                            <Tooltip title="Reject">
                              <IconButton aria-label="Reject" size="small" disabled={togglingId === project.id} onClick={() => handleStatusChange(project, 'rejected')} sx={{ color: '#991b1b', bgcolor: '#fee2e2', '&:hover': { bgcolor: '#fecaca' } }}>
                                <XCircle size={16} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>

      {/* Edit Dialog */}
      <Dialog open={!!editProject} onClose={() => setEditProject(null)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <Box sx={{ height: 5, background: 'linear-gradient(to right, #0b2f5c, #7c3aed)' }} />
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography fontWeight={800} fontSize="1.2rem">✏️ Edit Submission</Typography>
          <IconButton aria-label="Close" onClick={() => setEditProject(null)}><X size={20} /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField label="Project Title *" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} fullWidth size="small" />
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select value={editForm.category} label="Category" onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}>
                <MenuItem value=""><em>None</em></MenuItem>
                {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Short Description" value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} fullWidth size="small" multiline rows={2} />
            <TextField label="Full Details (shown on detail page)" value={editForm.long_description} onChange={e => setEditForm(f => ({ ...f, long_description: e.target.value }))} fullWidth size="small" multiline rows={4} />
            <Divider><Typography variant="caption" color="text.secondary">MEDIA & LINKS</Typography></Divider>
            <TextField label="Cover Image URL" value={editForm.image_url} onChange={e => setEditForm(f => ({ ...f, image_url: e.target.value }))} fullWidth size="small" />
            <TextField label="Video URL (YouTube or direct)" value={editForm.video_url} onChange={e => setEditForm(f => ({ ...f, video_url: e.target.value }))} fullWidth size="small" />
            <TextField label="External Project Link" value={editForm.project_link} onChange={e => setEditForm(f => ({ ...f, project_link: e.target.value }))} fullWidth size="small" />
            <Divider><Typography variant="caption" color="text.secondary">EXTRAS</Typography></Divider>
            <TextField label="Skills (comma-separated)" value={editForm.skills} onChange={e => setEditForm(f => ({ ...f, skills: e.target.value }))} fullWidth size="small" placeholder="e.g. Python, Design, Research" />
            <TextField label="Why it should be showcased" value={editForm.why_showcase} onChange={e => setEditForm(f => ({ ...f, why_showcase: e.target.value }))} fullWidth size="small" multiline rows={2} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setEditProject(null)} variant="outlined">Cancel</Button>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save size={16} />}
            onClick={handleSave}
            disabled={saving}
            sx={{ background: 'linear-gradient(to right, #0b2f5c, #7c3aed)', color: 'white' }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewProject} onClose={() => setPreviewProject(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        {previewProject && (
          <>
            {previewProject.image_url && (
              <Box component="img" src={previewProject.image_url} alt={previewProject.title}
                sx={{ width: '100%', height: 220, objectFit: 'cover' }} />
            )}
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                {previewProject.category && <Chip label={previewProject.category} size="small" sx={{ mb: 1 }} />}
                <Typography fontWeight={800} fontSize="1.2rem">{previewProject.title}</Typography>
                <Typography variant="caption" color="text.secondary">By {previewProject.submitter_name}</Typography>
              </Box>
              <IconButton aria-label="Close" onClick={() => setPreviewProject(null)}><X size={18} /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Typography color="text.secondary" sx={{ lineHeight: 1.8, mb: 2 }}>
                {previewProject.long_description || previewProject.description || 'No description.'}
              </Typography>
              {previewProject.skills?.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {previewProject.skills.map(s => <Chip key={s} label={s} size="small" />)}
                </Box>
              )}
              {previewProject.why_showcase && (
                <Box sx={{ bgcolor: 'rgba(124,58,237,0.05)', borderRadius: 2, p: 2 }}>
                  <Typography variant="caption" fontWeight={700} color="primary">Why it was submitted:</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>{previewProject.why_showcase}</Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              {previewProject.project_link && (
                <Button href={previewProject.project_link} target="_blank" component="a" endIcon={<ExternalLink size={14} />} size="small">
                  View Project
                </Button>
              )}
              <Button onClick={() => setPreviewProject(null)} variant="outlined">Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}