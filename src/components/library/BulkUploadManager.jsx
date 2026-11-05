import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Button, TextField, Typography, LinearProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { Upload, Download, FileUp, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function BulkUploadManager({ open, onOpenChange, onSuccess }) {
  const [csvData, setCsvData] = useState([]);
  const [preview, setPreview] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [useAICategories, setUseAICategories] = useState(true);
  const [results, setResults] = useState(null);

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target.result;
        const lines = csv.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const row = {};
          headers.forEach((header, idx) => {
            row[header] = values[idx] || '';
          });
          return row;
        }).filter(row => row.title && row.file_url);

        setCsvData(data);
        setPreview(data.slice(0, 5));
        toast.success(`Loaded ${data.length} books from CSV`);
      } catch (error) {
        toast.error('Failed to parse CSV file');
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = 'title,author,description,category,file_url,cover_image,tags\nExample Book,John Doe,A great book,gcse_books,https://example.com/book.pdf,https://example.com/cover.jpg,"tag1,tag2"';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'book_template.csv';
    a.click();
  };

  const handleBulkUpload = async () => {
    if (csvData.length === 0) {
      toast.error('No books to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setResults([]);

    try {
      const response = await base44.functions.invoke('bulkUploadBooks', {
        books: csvData,
        auto_categorize: useAICategories
      });

      if (response.data.success) {
        setResults(response.data.results);
        toast.success(`Successfully uploaded ${response.data.success_count}/${csvData.length} books`);
        onSuccess?.();
      } else {
        toast.error('Bulk upload failed');
      }
    } catch (error) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="md" fullWidth>
      <DialogTitle>Bulk Upload Books</DialogTitle>
      <DialogContent sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {!results ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            {/* Instructions */}
            <Box sx={{ p: 2, bgcolor: '#f0f9ff', border: 1, borderColor: '#bfdbfe', borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>📋 How to use:</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                1. Download the template below
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                2. Fill in your book data (title, author, file URL, etc.)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                3. Upload the CSV file to import all books at once
              </Typography>
            </Box>

            {/* Template Download */}
            <Button
              variant="outlined"
              startIcon={<Download size={16} />}
              onClick={downloadTemplate}
              fullWidth
            >
              Download CSV Template
            </Button>

            {/* CSV Upload */}
            <Box sx={{ border: 2, borderStyle: 'dashed', borderColor: 'divider', borderRadius: 2, p: 3, textAlign: 'center', cursor: 'pointer' }}>
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                id="csv-input"
                style={{ display: 'none' }}
              />
              <label htmlFor="csv-input" style={{ cursor: 'pointer', width: '100%', display: 'block' }}>
                <FileUp size={32} style={{ margin: '0 auto 12px', color: '#6366f1' }} />
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Click to upload CSV or drag and drop
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  CSV files up to 10MB
                </Typography>
              </label>
            </Box>

            {/* Preview */}
            {preview.length > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  Preview ({csvData.length} books total)
                </Typography>
                <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f3f4f6' }}>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Author</TableCell>
                        <TableCell>Category</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {preview.map((book, idx) => (
                        <TableRow key={idx}>
                          <TableCell sx={{ maxWidth: 150, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {book.title}
                          </TableCell>
                          <TableCell>{book.author || '-'}</TableCell>
                          <TableCell>{book.category || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Options */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <input
                type="checkbox"
                checked={useAICategories}
                onChange={(e) => setUseAICategories(e.target.checked)}
                id="ai-categories"
              />
              <label htmlFor="ai-categories" style={{ cursor: 'pointer' }}>
                <Typography variant="body2">
                  🤖 Auto-categorize books with AI (if category is empty)
                </Typography>
              </label>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, bgcolor: '#f0fdf4', border: 1, borderColor: '#bbf7d0', borderRadius: 2 }}>
              <CheckCircle size={20} color="#16a34a" />
              <Typography variant="body2" color="#16a34a" fontWeight={600}>
                Upload complete! {results.filter(r => r.success).length}/{results.length} successful
              </Typography>
            </Box>

            <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f3f4f6' }}>
                  <TableRow>
                    <TableCell>Book</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Message</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((result, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ maxWidth: 150, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {result.title}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          icon={result.success ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                          label={result.success ? 'Success' : 'Failed'}
                          color={result.success ? 'success' : 'error'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', color: result.success ? '#059669' : '#dc2626' }}>
                        {result.message}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {
          onOpenChange(false);
          setCsvData([]);
          setPreview([]);
          setResults(null);
        }}>
          {results ? 'Close' : 'Cancel'}
        </Button>
        {!results && csvData.length > 0 && (
          <Button
            onClick={handleBulkUpload}
            disabled={uploading}
            variant="contained"
           
            startIcon={uploading ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />}
          >
            {uploading ? 'Uploading...' : 'Upload All Books'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}