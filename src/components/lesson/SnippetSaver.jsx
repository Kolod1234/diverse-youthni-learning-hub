import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Scissors, Save, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

export default function SnippetSaver({ lessonId, courseId, contentRef }) {
  const [showDialog, setShowDialog] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const queryClient = useQueryClient();

  const { data: snippets = [] } = useQuery({
    queryKey: ['snippets', lessonId],
    queryFn: () => base44.entities.LessonSnippet.filter({ lesson_id: lessonId }),
  });

  const createSnippetMutation = useMutation({
    mutationFn: (data) => base44.entities.LessonSnippet.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['snippets', lessonId]);
      toast.success('Snippet saved!');
      setShowDialog(false);
      setTitle('');
      setContent('');
      setTags('');
      setImageUrl('');
    },
  });

  const deleteSnippetMutation = useMutation({
    mutationFn: (id) => base44.entities.LessonSnippet.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['snippets', lessonId]);
      toast.success('Snippet deleted');
    },
  });

  const captureSelection = async () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text.length > 0) {
      setContent(text);
      setShowDialog(true);
    } else if (contentRef?.current) {
      // Capture screenshot of content
      const canvas = await html2canvas(contentRef.current);
      const dataUrl = canvas.toDataURL();
      setImageUrl(dataUrl);
      setShowDialog(true);
    }
  };

  const handleSave = () => {
    createSnippetMutation.mutate({
      lesson_id: lessonId,
      course_id: courseId,
      title: title || 'Untitled Snippet',
      content,
      image_url: imageUrl,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    });
  };

  return (
    <>
      <div className="bg-white border rounded-lg p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-purple-600" />
            <span className="font-semibold">Snippet Saver</span>
          </div>
          <Button size="sm" onClick={captureSelection} className="gap-2">
            <Save className="w-4 h-4" />
            Save Snippet
          </Button>
        </div>

        {snippets.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {snippets.map((snippet) => (
              <div key={snippet.id} className="p-3 bg-gray-50 rounded space-y-2">
                <div className="flex items-start justify-between">
                  <div className="font-medium text-sm">{snippet.title}</div>
                  <button
                    onClick={() => deleteSnippetMutation.mutate(snippet.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {snippet.content && (
                  <p className="text-sm text-gray-600 line-clamp-2">{snippet.content}</p>
                )}
                {snippet.tags?.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {snippet.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Snippet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Snippet title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {content && (
              <Textarea
                placeholder="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
              />
            )}
            {imageUrl && (
              <img src={imageUrl} alt="Snippet" className="rounded border" />
            )}
            <Input
              placeholder="Tags (comma-separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <Button onClick={handleSave} className="w-full" disabled={createSnippetMutation.isPending}>
              Save Snippet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}