import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function TextLayoutArchitect({ onPromptGenerated }) {
  const [scene, setScene] = useState('');
  const [renderMode, setRenderMode] = useState('graphic'); // 'graphic' or 'photo'

  const generateArchitectPrompt = () => {
    if (!scene) {
      toast.error('Please enter a scene description');
      return;
    }

    let styleInstruction = "";
    
    // Strategy 1: The "Graphic Design" trick (High success rate)
    if (renderMode === 'graphic') {
      styleInstruction = "Style: Vector Illustration / High-Contrast Graphic Design. Text must be flat, sharp, and 2D.";
    } 
    // Strategy 2: The "Signage" trick (Medium success rate, but realistic)
    else {
      styleInstruction = "Style: Photorealistic. Focus: The camera is focused specifically on the text. Depth of field is deep (no blur).";
    }

    const structuredPrompt = `
Request: ${scene}

${styleInstruction}

--- TYPOGRAPHY RULES (STRICT) ---
1. Treat all text as "Vector Data": distinct from the background.
2. Kerning: Uniform spacing between letters.
3. Anti-Aliasing: Text edges must be sharp, not painterly.
4. Content: Use only standard English dictionary words.
5. Error Check: Do not generate "simulated" text lines (squiggles). If text is too small to read, leave it blank.
    `.trim();

    if (onPromptGenerated) {
      onPromptGenerated(structuredPrompt);
    }

    navigator.clipboard.writeText(structuredPrompt);
    toast.success('Strict Layout Prompt copied to clipboard!');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 border-2 border-gray-800 bg-amber-50 rounded-none">
      <h2 className="text-xl font-bold uppercase tracking-wider border-b-2 border-gray-800 pb-3 mb-4">
        Text Layout Architect
      </h2>
      <p className="text-sm italic text-gray-700 mb-6">
        AI messes up spelling when it tries to "paint" letters. This tool forces it to "print" letters.
      </p>

      <div className="space-y-6">
        <div>
          <Label className="block font-bold uppercase text-xs mb-2">Scene Description:</Label>
          <Textarea
            value={scene}
            onChange={(e) => setScene(e.target.value)}
            placeholder="e.g. A coffee shop chalkboard menu listing Cappuccino, Latte, and Espresso..."
            rows={4}
            className="border-2 border-gray-800 bg-white"
          />
        </div>

        <div>
          <Label className="block font-bold uppercase text-xs mb-2">Render Strategy:</Label>
          <div className="flex gap-3">
            <button
              onClick={() => setRenderMode('graphic')}
              className={`flex-1 p-3 border-2 font-bold transition-all ${
                renderMode === 'graphic'
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-transparent text-gray-800 border-gray-300'
              }`}
            >
              Graphic / Poster (Best Spelling)
            </button>
            <button
              onClick={() => setRenderMode('photo')}
              className={`flex-1 p-3 border-2 font-bold transition-all ${
                renderMode === 'photo'
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-transparent text-gray-800 border-gray-300'
              }`}
            >
              Photorealistic (Harder)
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            *Note: "Graphic/Poster" style works best because the AI focuses on lines and shapes, preventing "wobbly" letters.
          </p>
        </div>

        <Button
          onClick={generateArchitectPrompt}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase py-4"
        >
          <Copy className="w-4 h-4 mr-2" />
          Generate & Copy Strict Prompt
        </Button>
      </div>
    </div>
  );
}