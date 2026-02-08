import React, { useState } from 'react';
import { Wand2, Copy, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function MetaDescriptionGenerator({ title, content, onDescriptionGenerated }) {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDescription = async () => {
    if (!title && !content) {
      toast.error('Add a title or content to generate description');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a compelling SEO meta description (120-160 characters) for this page.
Title: "${title || 'Untitled'}"
Content preview: "${(content || '').substring(0, 300)}"

Requirements:
- 120-160 characters exactly
- Include primary keywords if possible
- Write in active voice
- Make it compelling and click-worthy
- Only return the description, no additional text`,
      });

      const generated = response.trim();
      setDescription(generated);
      onDescriptionGenerated?.(generated);
      toast.success('Description generated!');
    } catch (error) {
      toast.error('Failed to generate description');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(description);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold">Meta Description</label>
        <span className="text-xs text-gray-500 dark:text-gray-400">{description.length}/160</span>
      </div>

      <Textarea
        value={description}
        onChange={(e) => {
          setDescription(e.target.value.substring(0, 160));
          onDescriptionGenerated?.(e.target.value);
        }}
        placeholder="Write a compelling description for search engines..."
        className="min-h-[80px] text-sm"
      />

      <div className="flex gap-2">
        <Button
          onClick={generateDescription}
          disabled={isGenerating || (!title && !content)}
          variant="outline"
          className="flex-1 gap-2"
        >
          {isGenerating ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Auto-Generate
            </>
          )}
        </Button>
        {description && (
          <Button onClick={handleCopy} variant="ghost" size="icon">
            <Copy className="w-4 h-4" />
          </Button>
        )}
      </div>

      {description && description.length < 120 && (
        <p className="text-xs text-yellow-600 dark:text-yellow-400">
          ⚠️ Description too short. Aim for 120-160 characters.
        </p>
      )}
      {description && description.length > 160 && (
        <p className="text-xs text-red-600 dark:text-red-400">
          ❌ Description too long. Maximum 160 characters.
        </p>
      )}
    </div>
  );
}