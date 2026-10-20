import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Edit, Upload, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import TagInput from './TagInput';
import PDFPageSelector from './PDFPageSelector';

export default function EditBookDialog({ book, open, onOpenChange }) {
  const [formData, setFormData] = useState({
    title: book?.title || '',
    author: book?.author || '',
    description: book?.description || '',
    category: book?.category || 'gcse_books',
    tags: book?.tags || [],
    cover_image: book?.cover_image || '',
    is_featured: book?.is_featured || false
  });

  React.useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        description: book.description || '',
        category: book.category || 'gcse_books',
        tags: book.tags || [],
        cover_image: book.cover_image || '',
        is_featured: book.is_featured || false
      });
    }
  }, [book]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showPageSelector, setShowPageSelector] = useState(false);
  const fileInputRef = React.useRef(null);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.LibraryResource.update(book.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['library-resources']);
      onOpenChange(false);
      toast.success('Book updated successfully!');
    }
  });

  const handleUploadCover = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, cover_image: file_url });
      toast.success('Cover image uploaded!');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploadingCover(false);
    }
  };

  const handlePageSelect = (pageUrl) => {
    setFormData({ ...formData, cover_image: pageUrl });
    setShowPageSelector(false);
    toast.success('Cover image updated! Click "Save Changes" to apply.');
  };

  const handleSave = () => {
    if (!formData.title) {
      toast.error('Title is required');
      return;
    }
    updateMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Edit Book
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label>Title *</Label>
            <Input 
              value={formData.title} 
              onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
              placeholder="Book title"
            />
          </div>

          <div>
            <Label>Author</Label>
            <Input 
              value={formData.author} 
              onChange={(e) => setFormData({ ...formData, author: e.target.value })} 
              placeholder="Author name"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea 
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
              rows={3}
              placeholder="Brief description"
            />
          </div>

          <div>
            <Label>Category</Label>
            <select 
              value={formData.category} 
              onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
              className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
            >
              <option value="youth_work">Youth Work</option>
              <option value="gcse_books">GCSE Books</option>
              <option value="gcse_past_questions">GCSE Past Questions</option>
              <option value="a_level_books">A-Level Books</option>
              <option value="inspirational">Inspirational</option>
              <option value="dyni_books">DYNI Books</option>
              <option value="workbooks_logbooks">Workbooks & Logbooks</option>
              <option value="history_books">History Books</option>
            </select>
          </div>

          <div>
            <Label>Tags</Label>
            <TagInput
              tags={formData.tags}
              onChange={(tags) => setFormData({ ...formData, tags })}
            />
          </div>

          <div className="border-t pt-4">
            <Label className="mb-3 block">Cover Image</Label>
            
            {formData.cover_image && (
              <div className="mb-4">
                {formData.cover_image.toLowerCase().includes('.pdf') ? (
                  <iframe
                    src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(formData.cover_image)}`}
                    className="w-32 h-40 rounded border"
                    style={{ border: 'none' }}
                  />
                ) : (
                  <img src={formData.cover_image} alt="Cover" className="w-32 h-40 object-cover rounded border" />
                )}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Upload Custom Cover</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadCover}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingCover}
                  className="gap-2 w-full"
                >
                  <Upload className="w-4 h-4" />
                  {uploadingCover ? 'Uploading...' : 'Choose File'}
                </Button>
              </div>

              {book?.file_url?.toLowerCase().includes('.pdf') && (
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Extract Page as Cover</Label>
                  {!showPageSelector ? (
                    <Button 
                      variant="outline"
                      onClick={() => setShowPageSelector(true)}
                      className="gap-2 w-full"
                    >
                      <FileText className="w-4 h-4" />
                      Select Page from PDF
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <PDFPageSelector 
                        pdfUrl={book.file_url} 
                        onPageSelect={handlePageSelect}
                      />
                      <Button 
                        variant="ghost"
                        onClick={() => setShowPageSelector(false)}
                        className="w-full"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={formData.is_featured} 
              onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} 
              id="featured-edit"
            />
            <Label htmlFor="featured-edit">Feature this book</Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={updateMutation.isPending}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}