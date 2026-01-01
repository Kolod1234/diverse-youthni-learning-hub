import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Brain, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function KnowledgeBaseUploader() {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      toast.info('Processing document...');
      
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Extract content from document
      const result = await base44.functions.invoke('processKnowledgeDocument', {
        fileUrl: file_url,
        fileName: file.name
      });

      setTitle(result.data.title || file.name);
      setContent(result.data.content || '');
      setTags(result.data.tags?.join(', ') || '');
      
      toast.success('Document processed!');
    } catch (error) {
      toast.error('Failed to process document');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!title || !content) {
      toast.error('Please provide title and content');
      return;
    }

    setUploading(true);
    try {
      await base44.entities.KnowledgeBaseItem.create({
        title,
        content,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        category: 'user_content'
      });

      toast.success('Knowledge added to AI system!');
      setOpen(false);
      setTitle('');
      setContent('');
      setTags('');
    } catch (error) {
      toast.error('Failed to save knowledge');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Brain className="w-4 h-4 mr-2" />
          Teach AI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add to AI Knowledge Base</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('file-upload').click()}
              disabled={uploading}
              className="flex-1"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </>
              )}
            </Button>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Advanced Biology Notes"
            />
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste or type content here..."
              rows={8}
            />
          </div>

          <div className="space-y-2">
            <Label>Tags (comma-separated)</Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="biology, cells, mitosis"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={uploading}>
              <Brain className="w-4 h-4 mr-2" />
              Add to AI
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}