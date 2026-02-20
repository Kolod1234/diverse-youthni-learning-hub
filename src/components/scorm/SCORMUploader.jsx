import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card, Box, Typography, Button, TextField, LinearProgress,
  Alert, List, ListItem, ListItemText, Chip, Accordion,
  AccordionSummary, AccordionDetails
} from '@mui/material';
import { Upload, FileArchive, CheckCircle, AlertCircle, AlertTriangle, Info, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

export default function SCORMUploader({ courseId, lessonId, onUploaded }) {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [packageInfo, setPackageInfo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [validationReport, setValidationReport] = useState(null);

  const uploadSCORMMutation = useMutation({
    mutationFn: async (file) => {
      setUploading(true);
      setUploadProgress(10);
      setValidationReport(null);
      setPackageInfo(null);

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
      if (data.success) {
        queryClient.invalidateQueries(['scorm-packages']);
        toast.success('SCORM package uploaded and validated successfully!');
        setPackageInfo(data);
        setValidationReport(data.validationReport);
        onUploaded?.(data);
      } else {
        toast.error('SCORM validation failed - see report for details');
        setValidationReport(data.validationReport);
      }
      setUploading(false);
    },
    onError: (error) => {
      const errorData = error.response?.data;
      if (errorData?.validationReport) {
        setValidationReport(errorData.validationReport);
        toast.error('SCORM package validation failed');
      } else {
        toast.error('Failed to process SCORM package');
      }
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

      {/* Validation Report */}
      {validationReport && (
        <Box sx={{ mb: 3 }}>
          {validationReport.isValid ? (
            <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2 }}>
              ✅ SCORM package validated successfully!
            </Alert>
          ) : (
            <Alert severity="error" icon={<AlertCircle />} sx={{ mb: 2 }}>
              ❌ SCORM package validation failed
            </Alert>
          )}

          {/* Errors */}
          {validationReport.errors.length > 0 && (
            <Accordion defaultExpanded={!validationReport.isValid}>
              <AccordionSummary expandIcon={<ChevronDown />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AlertCircle className="w-4 h-4 text-error-main" />
                  <Typography variant="subtitle2">
                    Errors ({validationReport.errors.length})
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {validationReport.errors.map((error, idx) => (
                    <ListItem key={idx}>
                      <ListItemText
                        primary={error}
                        primaryTypographyProps={{ color: 'error', variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Warnings */}
          {validationReport.warnings.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ChevronDown />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AlertTriangle className="w-4 h-4 text-warning-main" />
                  <Typography variant="subtitle2">
                    Warnings ({validationReport.warnings.length})
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {validationReport.warnings.map((warning, idx) => (
                    <ListItem key={idx}>
                      <ListItemText
                        primary={warning}
                        primaryTypographyProps={{ color: 'warning.main', variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Info */}
          {validationReport.info.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ChevronDown />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Info className="w-4 h-4 text-info-main" />
                  <Typography variant="subtitle2">
                    Package Information ({validationReport.info.length})
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {validationReport.info.map((info, idx) => (
                    <ListItem key={idx}>
                      <ListItemText
                        primary={info}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          )}
        </Box>
      )}

      {/* Package Details */}
      {packageInfo && packageInfo.success && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Package Details</Typography>
          <List dense>
            <ListItem>
              <ListItemText
                primary="Title"
                secondary={packageInfo.title}
              />
            </ListItem>
            {packageInfo.description && (
              <ListItem>
                <ListItemText
                  primary="Description"
                  secondary={packageInfo.description}
                />
              </ListItem>
            )}
            <ListItem>
              <ListItemText
                primary="SCORM Version"
                secondary={
                  <Chip 
                    label={packageInfo.scorm_version} 
                    size="small" 
                    color="primary" 
                  />
                }
              />
            </ListItem>
            {packageInfo.mastery_score && (
              <ListItem>
                <ListItemText
                  primary="Mastery Score"
                  secondary={`${packageInfo.mastery_score}%`}
                />
              </ListItem>
            )}
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