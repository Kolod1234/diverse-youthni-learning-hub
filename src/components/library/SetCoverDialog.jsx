import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import PDFPageSelector from './PDFPageSelector';

export default function SetCoverDialog({ book, open, onOpenChange, onSuccess }) {
  const [extracting, setExtracting] = useState(false);

  const handlePageSelected = async (pageUrl) => {
    setExtracting(true);
    try {
      await base44.entities.LibraryResource.update(book.id, {
        cover_image: pageUrl
      });
      
      toast.success('Cover image updated!');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update cover:', error);
      toast.error('Failed to update cover');
    } finally {
      setExtracting(false);
    }
  };

  if (!book) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Select Page for Cover</DialogTitle>
          <p className="text-sm text-gray-500">Navigate to the page you want and click "Use This Page"</p>
        </DialogHeader>
        
        <div className="mt-4">
          <PDFPageSelector
            fileUrl={book.file_url}
            onPageSelected={handlePageSelected}
            extracting={extracting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}