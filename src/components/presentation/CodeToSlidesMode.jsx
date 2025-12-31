import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Code, Loader2, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

export default function CodeToSlidesMode({ onSlidesGenerated }) {
  const [sourceCode, setSourceCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);

  const generateSlidesFromCode = async () => {
    if (!sourceCode.trim()) {
      toast.error('Please enter some source code');
      return;
    }

    setGenerating(true);
    try {
      toast.info('Analyzing code and generating slides...');

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this ${language} source code and create educational presentation slides explaining the code:

\`\`\`${language}
${sourceCode}
\`\`\`

${topic ? `Focus on: ${topic}` : ''}

Create 5-8 slides that:
1. Overview slide with code purpose
2. Key concepts and architecture
3. Code walkthrough with syntax highlighting
4. Important functions/classes explained
5. Best practices and patterns used
6. Summary and takeaways

For code examples in slides, use:
<pre style="background: #1e1e1e; color: #d4d4d4; padding: 16px; border-radius: 8px; overflow-x: auto; font-family: 'Courier New', monospace;">
<code>your code here</code>
</pre>

Format other content with <h2>, <h3>, <p>, <ul>, <li>, <strong> tags.`,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            slides: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string" },
                  order: { type: "number" }
                },
                required: ["title", "content", "order"]
              }
            }
          },
          required: ["slides"]
        }
      });

      if (!result?.slides || result.slides.length === 0) {
        throw new Error('No slides generated');
      }

      onSlidesGenerated(result.slides);
      toast.success(`Generated ${result.slides.length} slides from code!`);
    } catch (error) {
      console.error('Failed to generate slides:', error);
      toast.error('Failed to generate slides: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Code to Slides</h3>
        <p className="text-sm text-gray-600 mb-4">
          Paste your source code and AI will create educational slides explaining it
        </p>

        <div className="space-y-4">
          <div>
            <Label>Programming Language</Label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="csharp">C#</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="php">PHP</option>
              <option value="ruby">Ruby</option>
              <option value="swift">Swift</option>
              <option value="kotlin">Kotlin</option>
            </select>
          </div>

          <div>
            <Label>Topic/Focus (Optional)</Label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., React hooks, API integration, Algorithm explanation"
            />
          </div>

          <div>
            <Label>Source Code *</Label>
            <Textarea
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              placeholder="Paste your source code here..."
              rows={15}
              className="font-mono text-sm"
            />
          </div>

          <Button
            onClick={generateSlidesFromCode}
            disabled={!sourceCode.trim() || generating}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Code...
              </>
            ) : (
              <>
                <Code className="w-4 h-4 mr-2" />
                Generate Slides from Code
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          How It Works
        </h4>
        <ul className="text-sm text-indigo-700 space-y-1">
          <li>• AI analyzes your code structure and logic</li>
          <li>• Creates slides explaining key concepts</li>
          <li>• Highlights important code snippets with syntax</li>
          <li>• Perfect for code reviews and teaching</li>
        </ul>
      </div>
    </div>
  );
}