import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card, Box, Typography, Button, TextField, LinearProgress,
  Alert, List, ListItem, ListItemText
} from '@mui/material';
import { Upload, FileArchive, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SCORMUploader({ courseId, lessonId, onUploaded }) {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [packageInfo, setPackageInfo] = useState(null);
  const [uploading, setUploading] = useState(false);

  const uploadSCORMMutation = useMutation({
    mutationFn: async (file) => {
      setUploading(true);
      setUploadProgress(10);

      // Upload the SCORM package
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadProgress(50);

      // Process and parse SCORM package
      const response = await base44.functions.invoke('processSCORMPackage', {
        packageUrl: file_url,
        courseId,
        lessonId
      });

      setUploadProgress(100);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['scorm-packages']);
      toast.success('SCORM package uploaded successfully!');
      setPackageInfo(data);
      onUploaded?.(data);
      setUploading(false);
    },
    onError: (error) => {
      toast.error('Failed to upload SCORM package');
      console.error(error);
      setUploading(false);
    }
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      toast.error('Please select a .zip SCORM package');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    uploadSCORMMutation.mutate(selectedFile);
  };

  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <FileArchive className="w-5 h-5" />
        <Typography variant="h6">Upload SCORM Package</Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Upload a SCORM 1.2 or SCORM 2004 compliant .zip package. The package should contain an imsmanifest.xml file.
      </Alert>

      <Box sx={{ mb: 3 }}>
        <input
          type="file"
          accept=".zip"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="scorm-file-input"
        />
        <label htmlFor="scorm-file-input">
          <Button
            variant="outlined"
            component="span"
            startIcon={<Upload className="w-4 h-4" />}
            fullWidth
          >
            {selectedFile ? selectedFile.name : 'Select SCORM Package (.zip)'}
          </Button>
        </label>
      </Box>

      {uploading && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Processing package... {uploadProgress}%
          </Typography>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      {packageInfo && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2 }}>
            SCORM package uploaded successfully!
          </Alert>
          <List dense>
            <ListItem>
              <ListItemText
                primary="Title"
                secondary={packageInfo.title}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="SCORM Version"
                secondary={packageInfo.scorm_version}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Launch File"
                secondary={packageInfo.launch_url}
              />
            </ListItem>
          </List>
        </Box>
      )}

      <Button
        variant="contained"
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        fullWidth
        size="large"
      >
        {uploading ? 'Uploading...' : 'Upload & Process'}
      </Button>
    </Card>
  );
}