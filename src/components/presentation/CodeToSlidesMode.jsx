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
  const [detecting, setDetecting] = useState(false);

  const detectLanguage = async (code) => {
    if (!code.trim() || code.length < 20) return;
    
    setDetecting(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Detect the programming language of this code. Return ONLY the language name in lowercase (javascript, python, java, cpp, csharp, go, rust, php, ruby, swift, kotlin, typescript, or other).

Code:
\`\`\`
${code.slice(0, 500)}
\`\`\``,
        response_json_schema: {
          type: "object",
          properties: {
            language: { type: "string" }
          },
          required: ["language"]
        }
      });
      
      if (result?.language) {
        setLanguage(result.language);
        toast.success(`Detected: ${result.language}`);
      }
    } catch (error) {
      console.error('Language detection failed:', error);
    } finally {
      setDetecting(false);
    }
  };

  const handleCodeChange = (code) => {
    setSourceCode(code);
    if (code.trim().length > 50) {
      detectLanguage(code);
    }
  };

  const generateSlidesFromCode = async () => {
    if (!sourceCode.trim()) {
      toast.error('Please enter some source code');
      return;
    }

    setGenerating(true);
    try {
      toast.info('Analyzing code and generating slides...');

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Split this ${language} source code into multiple presentation slides. Each slide should contain a logical chunk of the code.

\`\`\`${language}
${sourceCode}
\`\`\`

${topic ? `Title focus: ${topic}` : ''}

Instructions:
- Split the code into 5-10 slides based on logical sections (imports, classes, functions, etc.)
- Each slide should have a descriptive title indicating what code section it contains
- Each slide content should ONLY contain the code chunk wrapped in proper HTML with syntax highlighting
- Do not add explanations, just show the code

Use this exact format for code in each slide:
<pre style="background: #1e1e1e; color: #d4d4d4; padding: 20px; border-radius: 8px; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.6;">
<code>the actual code chunk here</code>
</pre>`,
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
          Paste your source code and AI will split it into multiple slides
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
            <Label>Source Code * {detecting && <span className="text-xs text-indigo-600">(detecting language...)</span>}</Label>
            <Textarea
              value={sourceCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="Paste your source code here (language will be auto-detected)..."
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
          <li>• AI splits code into logical sections</li>
          <li>• Each slide shows a portion of your code</li>
          <li>• Automatic syntax highlighting</li>
          <li>• Perfect for code presentations and walkthroughs</li>
        </ul>
      </div>
    </div>
  );
}