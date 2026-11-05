import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Card, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Container, Chip, TextField, InputLabel, Select, MenuItem
} from '@mui/material';
import { Upload, Trash2, Download, Eye, FileText, Image, Music, Video, File, Folder, Plus } from 'lucide-react';
import { toast } from 'sonner';

const getFileIcon = (category) => {
  const icons = {
    image: <Image className="w-8 h-8 text-blue-500" />,
    document: <FileText className="w-8 h-8 text-red-500" />,
    video: <Video className="w-8 h-8 text-indigo-500" />,
    audio: <Music className="w-8 h-8 text-green-500" />,
    other: <File className="w-8 h-8 text-muted-foreground" />
  };
  return icons[category] || icons.other;
};

const getCategory = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('sheet')) return 'document';
  return 'other';
};

export default function FileManager() {
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    is_public: true
  });
  const queryClient = useQueryClient();
  const fileInputRef = React.useRef(null);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    loadUser();
  }, []);

  const { data: files = [] } = useQuery({
    queryKey: ['file-uploads'],
    queryFn: () => base44.entities.FileUpload.list('-created_date', 500)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FileUpload.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['file-uploads']);
      setShowUploadDialog(false);
      resetForm();
      toast.success('File uploaded successfully!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FileUpload.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['file-uploads']);
      toast.success('File deleted!');
    }
  });

  const handleFileSelected = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File too large! Maximum size is 500MB.`);
      e.target.value = '';
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadRes = await base44.integrations.Core.UploadFile({ file });
      const file_url = uploadRes.file_url;

      const fileData = {
        file_name: file.name,
        file_url,
        file_type: file.type,
        file_size: file.size,
        category: getCategory(file.type),
        description: formData.description,
        is_public: formData.is_public
      };

      createMutation.mutate(fileData);
      setUploadProgress(100);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const handleInitiateUpload = () => {
    setShowUploadDialog(true);
    setTimeout(() => fileInputRef.current?.click(), 100);
  };

  const handleDelete = (file) => {
    if (window.confirm(`Delete "${file.file_name}"?`)) {
      deleteMutation.mutate(file.id);
    }
  };

  const resetForm = () => {
    setFormData({ description: '', is_public: true });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ bgcolor: '#4f46e5', p: 1, borderRadius: 2 }}>
              <Folder size={24} color="white" />
            </Box>
            <Typography variant="h4" fontWeight={700}>File Manager</Typography>
          </Box>
          
          <Button 
            onClick={handleInitiateUpload}
            disabled={uploading}
            variant="contained"
            sx={{ gap: 1 }}
          >
            <Plus className="w-4 h-4" />
            <span>Upload File</span>
          </Button>
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 6 }}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary" variant="body2">Total Files</Typography>
            <Typography variant="h5" fontWeight={700}>{files.length}</Typography>
          </Card>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary" variant="body2">Images</Typography>
            <Typography variant="h5" fontWeight={700}>{files.filter(f => f.category === 'image').length}</Typography>
          </Card>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary" variant="body2">Documents</Typography>
            <Typography variant="h5" fontWeight={700}>{files.filter(f => f.category === 'document').length}</Typography>
          </Card>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary" variant="body2">Total Size</Typography>
            <Typography variant="h5" fontWeight={700}>
              {formatFileSize(files.reduce((sum, f) => sum + (f.file_size || 0), 0))}
            </Typography>
          </Card>
        </Box>

        {/* Files Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 4 }}>
          {files.map((file) => (
            <Card 
              key={file.id}
              sx={{ 
                p: 3, 
                display: 'flex', 
                flexDirection: 'column',
                gap: 2,
                transition: 'all 0.3s',
                '&:hover': { boxShadow: 4 }
              }}
            >
              {/* Icon */}
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                {getFileIcon(file.category)}
              </Box>

              {/* File Info */}
              <Box>
                <Typography fontWeight={600} noWrap title={file.file_name}>{file.file_name}</Typography>
                <Typography variant="caption" color="textSecondary">{formatFileSize(file.file_size)}</Typography>
                <Chip 
                  label={file.category} 
                  size="small" 
                  sx={{ mt: 1, textTransform: 'capitalize' }}
                />
              </Box>

              {/* Description */}
              {file.description && (
                <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.4 }}>
                  {file.description}
                </Typography>
              )}

              {/* Actions */}
              <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                <Button
                  size="small"
                  onClick={() => window.open(file.file_url, '_blank')}
                  sx={{ flex: 1, bgcolor: '#4f46e5', color: 'white', '&:hover': { bgcolor: '#4338ca' } }}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
                <Button
                  size="small"
                  onClick={() => handleDelete(file)}
                  variant="outlined"
                  sx={{ flex: 1, borderColor: '#ef4444', color: '#ef4444' }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </Box>
            </Card>
          ))}
        </Box>

        {files.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <Typography color="textSecondary" sx={{ mb: 2 }}>No files uploaded yet</Typography>
            <Button 
              onClick={handleInitiateUpload}
              variant="contained"
             
            >
              Upload Your First File
            </Button>
          </Box>
        )}
      </Container>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onClose={() => setShowUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload File</DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelected}
            className="hidden"
          />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Description (Optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What is this file about?"
              multiline
              rows={2}
            />

            <Box>
              <InputLabel>Make Public</InputLabel>
              <Select
                fullWidth
                value={formData.is_public}
                onChange={(e) => setFormData({ ...formData, is_public: e.target.value })}
                sx={{ mt: 1 }}
              >
                <MenuItem value={true}>Yes, anyone can access</MenuItem>
                <MenuItem value={false}>No, only I can access</MenuItem>
              </Select>
            </Box>

            {uploading && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Uploading...</Typography>
                  <Typography variant="body2" fontWeight={600}>{Math.round(uploadProgress)}%</Typography>
                </Box>
                <Box sx={{ width: '100%', bgcolor: '#e5e7eb', borderRadius: 50, height: 8, overflow: 'hidden' }}>
                  <Box 
                    sx={{ 
                      bgcolor: '#4f46e5', 
                      height: '100%', 
                      width: `${uploadProgress}%`,
                      transition: 'width 0.3s'
                    }}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            variant="contained"
           
          >
            {uploading ? 'Uploading...' : 'Select File'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}