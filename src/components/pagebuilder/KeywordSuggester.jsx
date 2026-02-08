import React, { useState } from 'react';
import { Sparkles, Plus, X, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function KeywordSuggester({ title, content, onKeywordsUpdated }) {
  const [keywords, setKeywords] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');

  const suggestKeywords = async () => {
    if (!title && !content) {
      toast.error('Add a title or content to get suggestions');
      return;
    }

    setIsLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Suggest 8-10 relevant SEO keywords for this page.
Title: "${title || 'Untitled'}"
Content: "${(content || '').substring(0, 500)}"

Requirements:
- Mix of short-tail (1-2 words) and long-tail (3+ words) keywords
- Include variations and related terms
- Focus on search intent and relevance
- Return as a JSON array of strings: ["keyword1", "keyword2", ...]`,
        response_json_schema: {
          type: 'object',
          properties: {
            keywords: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      });

      setSuggestions(response.keywords || []);
      toast.success('Keywords suggested!');
    } catch (error) {
      toast.error('Failed to generate suggestions');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const addKeyword = (keyword) => {
    if (!keyword || keywords.includes(keyword)) return;
    const updated = [...keywords, keyword];
    setKeywords(updated);
    onKeywordsUpdated?.(updated);
  };

  const removeKeyword = (keyword) => {
    const updated = keywords.filter(k => k !== keyword);
    setKeywords(updated);
    onKeywordsUpdated?.(updated);
  };

  const handleAddCustom = () => {
    if (newKeyword.trim()) {
      addKeyword(newKeyword.trim());
      setNewKeyword('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Keywords */}
      <div>
        <label className="text-sm font-semibold block mb-2">Target Keywords</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {keywords.length > 0 ? (
            keywords.map((kw) => (
              <Badge
                key={kw}
                variant="secondary"
                className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-900"
                onClick={() => removeKeyword(kw)}
              >
                {kw}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No keywords yet</p>
          )}
        </div>

        {/* Add Custom Keyword */}
        <div className="flex gap-2 mb-3">
          <Input
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCustom()}
            placeholder="Add custom keyword..."
            className="text-sm"
          />
          <Button onClick={handleAddCustom} variant="outline" size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Suggestions */}
      <div>
        <Button
          onClick={suggestKeywords}
          disabled={isLoading || (!title && !content)}
          variant="outline"
          className="w-full gap-2"
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Generating suggestions...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Get AI Suggestions
            </>
          )}
        </Button>

        {suggestions.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Suggested Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((keyword) => (
                <Badge
                  key={keyword}
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-400"
                  onClick={() => addKeyword(keyword)}
                >
                  {keyword}
                  <Plus className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}