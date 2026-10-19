import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Code, Eye, X, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function InlineCodeEditor({ initialCode, language, onSave, onCancel }) {
  const [code, setCode] = useState(initialCode || '');
  const [showPreview, setShowPreview] = useState(true);

  const isWebCode = ['html', 'css'].includes(language?.toLowerCase());

  const renderPreview = () => {
    if (!isWebCode || !code.trim()) return null;

    return (
      <div className="border-2 border-gray-300 rounded-lg p-4 bg-white min-h-[200px]">
        <div dangerouslySetInnerHTML={{ __html: code }} />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-xl">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <Code className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Edit Code</h3>
              <p className="text-xs text-gray-500">{language || 'Code'} Editor</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isWebCode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isWebCode && showPreview ? (
            <div className="grid grid-cols-2 gap-4 h-full">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Code</label>
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="font-mono text-sm h-[500px] resize-none"
                  placeholder={`Enter ${language} code...`}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Live Preview</label>
                {renderPreview()}
              </div>
            </div>
          ) : (
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Code</label>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-mono text-sm h-[500px] resize-none"
                placeholder={`Enter ${language} code...`}
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(code);
              toast.success('Code updated!');
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