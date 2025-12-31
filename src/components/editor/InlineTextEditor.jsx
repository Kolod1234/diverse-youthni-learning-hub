import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Check } from 'lucide-react';
import { toast } from 'sonner';
import RichTextEditor from './RichTextEditor';

export default function InlineTextEditor({ initialContent, onSave, onCancel }) {
  const [content, setContent] = useState(initialContent || '');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-xl">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div>
            <h3 className="font-semibold text-gray-900">Edit Slide Content</h3>
            <p className="text-xs text-gray-500">Rich text editor with formatting options</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Edit your slide content..."
          />
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(content);
              toast.success('Content updated!');
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Check className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}