import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Box, Typography, Container, Button, IconButton, Chip, Tabs, Tab
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
const _w = (I) => ({ size, color, className, style, ...r }) => <I className={className} style={style} sx={{ fontSize: size || 18, color: color || 'inherit' }} {...r} />;
const ArrowLeft = _w(ArrowBackIcon), Download = _w(DownloadIcon), BookOpen = _w(MenuBookIcon);
const Edit = _w(EditIcon), Trash2 = _w(DeleteIcon), Share2 = _w(ShareIcon);
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import PDFViewer from '@/components/library/PDFViewer';
import CommentsSection from '@/components/library/CommentsSection';
import ActivityHistory from '@/components/library/ActivityHistory';
import ShareDialog from '@/components/library/ShareDialog';
import EditBookDialog from '@/components/library/EditBookDialog';
import { useLibraryPermissions } from '@/components/library/useLibraryPermissions';

export default function BookDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [tabValue, setTabValue] = useState('preview');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  const bookId = new URLSearchParams(location.search).get('id');
  const { canEditBook: checkCanEditBook, canDeleteBook: checkCanDeleteBook } = useLibraryPermissions(user?.email);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: book, isLoading } = useQuery({
    queryKey: ['library-resource', bookId],
    queryFn: async () => {
      const resources = await base44.entities.LibraryResource.list('-created_date', 1000);
      return resources.find(r => r.id === bookId);
    },
    enabled: !!bookId
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.LibraryResource.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['library-resources']);
      toast.success('Book deleted successfully!');
      navigate(createPageUrl('Library'));
    }
  });

  const canEditBookUI = (book) => {
    if (!user || !book) return false;
    return user.role === 'admin';
  };

  const canDeleteBookUI = (book) => {
    if (!user || !book) return false;
    return user.role === 'admin';
  };

  const handleDownload = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!book) return;
    try {
      await base44.functions.invoke('recordStat', { type: 'libraryDownload', id: book.id });
      await base44.entities.FileActivity.create({
        resource_id: book.id,
        action: 'downloaded',
        user_name: user?.full_name
      });
      window.open(book.file_url, '_blank');
    } catch (error) {
      window.open(book.file_url, '_blank');
    }
  };

  const handleDelete = async () => {
    if (!book || !canDeleteBookUI(book)) {
      toast.error('You do not have permission to delete this book');
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${book.title}"?`)) {
      deleteMutation.mutate(book.id);
    }
  };

  const handleEdit = () => {
    if (!book || !canEditBookUI(book)) {
      toast.error('You do not have permission to edit this book');
      return;
    }
    setShowEditDialog(true);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!book) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Book not found</Typography>
        <Button onClick={() => navigate(createPageUrl('Library'))} sx={{ mt: 2 }}>
          Back to Library
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f9fafb' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <IconButton aria-label="Back" onClick={() => navigate(createPageUrl('Library'))}>
            <ArrowLeft />
          </IconButton>
          <Typography variant="h4" fontWeight={700}>Book Details</Typography>
        </Box>

        {/* Main Content */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          {/* Left Side - Book Info */}
          <Box sx={{ width: { xs: '100%', md: '400px' }, flexShrink: 0 }}>
            <Box sx={{ bgcolor: 'white', borderRadius: 3, p: 3, boxShadow: 1 }}>
              {/* Cover Image */}
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                {book.cover_image && book.cover_image.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                  <img
                    src={book.cover_image}
                    alt={book.title}
                    style={{ width: '100%', maxWidth: 300, height: 'auto', borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}
                  />
                ) : (
                  <Box sx={{ width: '100%', maxWidth: 300, aspectRatio: '3/4', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#e5e7eb', borderRadius: 3 }}>
                    <BookOpen size={80} color="#9ca3af" />
                  </Box>
                )}
              </Box>

              {/* Book Info */}
              <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>{book.title}</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>{book.author || 'Unknown Author'}</Typography>
              
              {book.description && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {book.description}
                  </Typography>
                </Box>
              )}

              {/* Stats */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Chip label={`${book.downloads_count || 0} downloads`} />
                <Chip label={book.category?.replace(/_/g, ' ')} sx={{ textTransform: 'capitalize' }} />
              </Box>

              {/* Tags */}
              {book.tags && book.tags.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Tags</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {book.tags.map((tag, i) => (
                      <Chip key={i} label={tag} variant="outlined" size="small" />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  variant="contained"
                  onClick={handleDownload}
                  startIcon={<Download />}
                 
                >
                  Download Book
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setTabValue('preview')}
                  startIcon={<BookOpen />}
                >
                  Read Online
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setShowShareDialog(true)}
                  startIcon={<Share2 />}
                >
                  Share
                </Button>
                {canEditBookUI(book) && (
                  <Button
                    variant="outlined"
                    onClick={handleEdit}
                    startIcon={<Edit />}
                  >
                    Edit Details
                  </Button>
                )}
                {canDeleteBookUI(book) && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleDelete}
                    startIcon={<Trash2 />}
                  >
                    Delete Book
                  </Button>
                )}
              </Box>
            </Box>
          </Box>

          {/* Right Side - Tabs Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ bgcolor: 'white', borderRadius: 3, overflow: 'hidden', boxShadow: 1 }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tab value="preview" label="Preview" />
                <Tab value="comments" label="Comments" />
                <Tab value="activity" label="Activity" />
              </Tabs>

              {tabValue === 'preview' && (
                <Box sx={{ p: 0, minHeight: 600, bgcolor: '#111827' }}>
                  {book.file_url?.toLowerCase().endsWith('.pdf') ? (
                    <PDFViewer 
                      fileUrl={book.file_url} 
                      title={book.title}
                      resourceId={book.id}
                      onCoverCapture={async (pageNum) => {
                        try {
                          const toastId = toast.loading(`Capturing page ${pageNum} as cover...`);
                          const response = await base44.functions.invoke('extractPdfPage', {
                            file_url: book.file_url,
                            page_number: pageNum - 1
                          });
                          if (!response.data.success) {
                            toast.error(response.data.error || 'Failed to capture page', { id: toastId });
                            return;
                          }
                          await base44.entities.LibraryResource.update(book.id, {
                            cover_image: response.data.extracted_page_url
                          });
                          queryClient.invalidateQueries(['library-resource']);
                          toast.success('Cover image saved!', { id: toastId });
                        } catch (error) {
                          toast.error('Failed to capture page: ' + error.message);
                        }
                      }}
                    />
                  ) : (
                    <Box sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
                      <Typography color="text.secondary">Preview not available for this file type</Typography>
                    </Box>
                  )}
                </Box>
              )}

              {tabValue === 'comments' && (
                <Box sx={{ p: 3 }}>
                  <CommentsSection resourceId={book.id} />
                </Box>
              )}

              {tabValue === 'activity' && (
                <Box sx={{ p: 3 }}>
                  <ActivityHistory resourceId={book.id} />
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Dialogs */}
      <ShareDialog
        resource={book}
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
      />

      <EditBookDialog
        book={book}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </Box>
  );
}