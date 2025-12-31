import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AutoTagging({ imageUrl, context = '', onTagsGenerated }) {
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [primaryTags, setPrimaryTags] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [description, setDescription] = useState('');

  const generateTags = async () => {
    if (!imageUrl) {
      toast.error('No image URL provided');
      return;
    }

    setLoading(true);
    try {
      const result = await base44.functions.invoke('generateImageTags', {
        imageUrl,
        context
      });

      if (result.data) {
        setTags(result.data.tags || []);
        setPrimaryTags(result.data.primary_tags || []);
        setKeywords(result.data.keywords || []);
        setDescription(result.data.description || '');
        
        if (onTagsGenerated) {
          onTagsGenerated(result.data);
        }
        
        toast.success('✨ Tags generated successfully!');
      }
    } catch (error) {
      console.error('Failed to generate tags:', error);
      toast.error('Failed to generate tags');
    } finally {
      setLoading(false);
    }
  };

  const removeTag = (tag, type = 'all') => {
    if (type === 'all') {
      setTags(tags.filter(t => t !== tag));
    } else if (type === 'primary') {
      setPrimaryTags(primaryTags.filter(t => t !== tag));
    } else if (type === 'keyword') {
      setKeywords(keywords.filter(t => t !== tag));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900">AI Auto-Tagging</h4>
        <Button 
          onClick={generateTags} 
          disabled={loading || !imageUrl}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Tags
            </>
          )}
        </Button>
      </div>

      {description && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">{description}</p>
        </div>
      )}

      {primaryTags.length > 0 && (
        <div>
          <label className="text-xs font-medium text-gray-700 mb-2 block">Primary Tags</label>
          <div className="flex flex-wrap gap-2">
            {primaryTags.map((tag, idx) => (
              <Badge key={idx} className="bg-purple-100 text-purple-800 hover:bg-purple-200 group">
                {tag}
                <button
                  onClick={() => removeTag(tag, 'primary')}
                  className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div>
          <label className="text-xs font-medium text-gray-700 mb-2 block">All Tags</label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <Badge key={idx} variant="outline" className="group">
                {tag}
                <button
                  onClick={() => removeTag(tag, 'all')}
                  className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {keywords.length > 0 && (
        <div>
          <label className="text-xs font-medium text-gray-700 mb-2 block">Search Keywords</label>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, idx) => (
              <Badge key={idx} variant="secondary" className="group">
                {keyword}
                <button
                  onClick={() => removeTag(keyword, 'keyword')}
                  className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}