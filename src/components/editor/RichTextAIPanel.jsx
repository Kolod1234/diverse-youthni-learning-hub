import React from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Sparkles, Wand2, FileImage, HelpCircle } from 'lucide-react';

export default function RichTextAIPanel({ editor, aiLoading, setAiLoading, handleAIImage, handleAIGenerate, setShowAI }) {
  const handleAIEnhanceSelection = async () => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    const selection = editor.state.doc.textBetween(from, to, ' ');

    if (!selection.trim()) {
      toast.error('Please select text first');
      return;
    }

    setAiLoading(true);
    const loadingToast = toast.loading('AI is enhancing your text...');

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Rewrite and improve the following text while keeping the same meaning, making it clearer, more polished, and more professional. Return only clean HTML using tags like <p>, <strong>, <em>, <ul>, <li> when needed, with no markdown fences and no extra explanation. Text: ${selection}`,
        add_context_from_internet: false,
      });

      editor.chain().focus().deleteRange({ from, to }).insertContent(`<div>${result}</div>`).run();
      toast.dismiss(loadingToast);
      toast.success('Text enhanced');
      setShowAI(false);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to enhance text');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 p-4 space-y-3">
      <div className="flex items-center gap-2 text-purple-700 font-semibold">
        <Sparkles className="w-5 h-5" />
        <span>AI-Powered Tools</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            const prompt = window.prompt('What content would you like AI to write?');
            if (prompt) handleAIGenerate(prompt);
          }}
          disabled={aiLoading}
          className="flex items-center gap-2 p-3 bg-white rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors disabled:opacity-50"
        >
          <Wand2 className="w-4 h-4 text-purple-600" />
          <div className="text-left text-sm">
            <div className="font-medium">Generate Text</div>
            <div className="text-xs text-gray-500">AI writes content</div>
          </div>
        </button>

        <button
          onClick={handleAIImage}
          disabled={aiLoading}
          className="flex items-center gap-2 p-3 bg-white rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors disabled:opacity-50"
        >
          <FileImage className="w-4 h-4 text-purple-600" />
          <div className="text-left text-sm">
            <div className="font-medium">Generate Image</div>
            <div className="text-xs text-gray-500">AI creates visuals</div>
          </div>
        </button>

        <button
          onClick={handleAIEnhanceSelection}
          disabled={aiLoading}
          className="flex items-center gap-2 p-3 bg-white rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <div className="text-left text-sm">
            <div className="font-medium">Enhance Text</div>
            <div className="text-xs text-gray-500">Improve selection</div>
          </div>
        </button>

        <button
          onClick={() => {
            const topic = window.prompt('Enter a topic for a quiz:');
            if (topic) {
              handleAIGenerate(`Create a multiple choice quiz question about: ${topic}. Format as HTML with the question, 4 options, and indicate the correct answer.`);
            }
          }}
          disabled={aiLoading}
          className="flex items-center gap-2 p-3 bg-white rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors disabled:opacity-50"
        >
          <HelpCircle className="w-4 h-4 text-purple-600" />
          <div className="text-left text-sm">
            <div className="font-medium">AI Quiz</div>
            <div className="text-xs text-gray-500">Auto-generate</div>
          </div>
        </button>
      </div>
    </div>
  );
}