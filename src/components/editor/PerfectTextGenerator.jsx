import React, { useState, useRef, useEffect } from 'react';
import { Download, RefreshCw, Type, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const PerfectTextGenerator = ({ onImageGenerated, onClose }) => {
  const [prompt, setPrompt] = useState('A futuristic neon billboard in Tokyo at night');
  const [text, setText] = useState('NANA BANANA');
  const [isGenerating, setIsGenerating] = useState(false);
  const [baseImage, setBaseImage] = useState(null);
  
  const canvasRef = useRef(null);

  // Generate base image with AI - ensuring a clean blank area for text
  const generateBaseImage = async () => {
    if (!text.trim()) {
      toast.error('Please enter text to display');
      return;
    }

    setIsGenerating(true);
    
    // Modify prompt to ensure a clean writable area exists
    const structuralPrompt = `
      ${prompt}.
      CRITICAL: The scene must feature a CLEAR, BLANK, FLAT SURFACE for text placement.
      This surface should be prominent and centered in the composition.
      The surface must be empty with NO TEXT whatsoever.
      High contrast, sharp focus, well-lit surface suitable for text overlay.
    `.trim();

    try {
      // Use Stable Diffusion for the base image
      const result = await base44.functions.invoke('generateImagenAI', {
        prompt: structuralPrompt,
        aspectRatio: 'landscape'
      });

      if (result.data?.url) {
        setBaseImage(result.data.url);
        toast.success('Base image generated! Text will be added with perfect spelling.');
      } else {
        toast.error('Failed to generate base image');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate base image: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Render text on canvas whenever image or text changes
  useEffect(() => {
    if (!baseImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.crossOrigin = "anonymous";
    img.src = baseImage;

    img.onload = () => {
      // Set canvas to match image size
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the AI-generated base image
      ctx.drawImage(img, 0, 0);

      // --- TEXT OVERLAY LOGIC (100% Accuracy) ---
      
      // Configure Font
      const fontSize = Math.min(canvas.width / 10, 80);
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Add glow effect
      ctx.shadowColor = "#00ff00";
      ctx.shadowBlur = 20;
      
      // Add black outline for better readability
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 4;
      ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
      
      // Fill text
      ctx.fillStyle = "#ffffff";
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    };
  }, [baseImage, text]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = 'perfect-spelling-image.png';
      link.href = canvasRef.current.toDataURL();
      link.click();
      toast.success('Image downloaded!');
    }
  };

  const handleUseImage = async () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Upload to server
      const formData = new FormData();
      formData.append('file', blob, 'perfect-spelling-image.png');
      
      try {
        const uploadResult = await base44.integrations.Core.UploadFile({ file: blob });
        
        if (uploadResult?.file_url) {
          onImageGenerated?.(uploadResult.file_url);
          toast.success('Image added to slide!');
          onClose?.();
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload image');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="max-w-4xl w-full mx-auto p-6 bg-gray-900 rounded-xl shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 border-b border-gray-700 pb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Type className="text-green-400" />
            100% Accurate Text Generator
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Hybrid Method: AI generates the scene, Code renders perfect text.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CONTROLS */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Background Prompt
              </label>
              <textarea
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"
                rows="3"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the scene (e.g., billboard, sign, poster, chalkboard)..."
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Tip: Mention a blank surface like "billboard", "sign", or "poster"
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Text to Embed (Perfect Spelling Guaranteed)
              </label>
              <input
                type="text"
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-lg font-bold"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text..."
              />
            </div>

            <button
              onClick={generateBaseImage}
              disabled={isGenerating || !text.trim()}
              className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all
                ${isGenerating ? 'bg-gray-700 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw />
                  Generate Scene
                </>
              )}
            </button>

            {baseImage && (
              <div className="flex gap-2">
                <button
                  onClick={handleUseImage}
                  className="flex-1 py-3 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-700 transition-all"
                >
                  Use in Slide
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download
                </button>
              </div>
            )}
          </div>

          {/* PREVIEW AREA */}
          <div className="bg-black rounded-lg border border-gray-700 flex items-center justify-center overflow-hidden relative min-h-[400px]">
            {!baseImage && !isGenerating && (
              <div className="text-center text-gray-600">
                <Type className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Image Preview</p>
                <p className="text-xs mt-2">Generate a scene to see it here</p>
              </div>
            )}
            
            {isGenerating && (
              <div className="text-center text-gray-400">
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" />
                <p className="text-sm">Generating base image...</p>
              </div>
            )}
            
            <canvas 
              ref={canvasRef} 
              className="max-w-full h-auto object-contain"
              style={{ display: baseImage ? 'block' : 'none' }}
            />
          </div>
        </div>

        <div className="mt-6 bg-green-900/30 border border-green-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-green-400 mb-2">✨ How It Works</h3>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>• AI generates a scene with a blank surface</li>
            <li>• Code overlays your text with 100% spelling accuracy</li>
            <li>• No AI text generation = No spelling errors!</li>
            <li>• Perfect for signs, billboards, diagrams with labels</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PerfectTextGenerator;