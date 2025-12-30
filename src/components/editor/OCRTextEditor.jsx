import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Search, Type, Eraser, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { createWorker } from 'tesseract.js';

export default function OCRTextEditor({ imageUrl, onSave, onClose }) {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [activeTab, setActiveTab] = useState('highlight');
  const [loading, setLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  
  // Highlight mode
  const [searchText, setSearchText] = useState('');
  const [highlightedBoxes, setHighlightedBoxes] = useState([]);
  
  // Replace mode
  const [targetText, setTargetText] = useState('');
  const [replacementText, setReplacementText] = useState('');
  
  // Remove mode
  const [removeText, setRemoveText] = useState('');

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImage(img);
      drawCanvas(img);
      performOCR(img);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const drawCanvas = (img, overlayBoxes = []) => {
    if (!img || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = img.width;
    canvas.height = img.height;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    
    // Draw highlight boxes
    overlayBoxes.forEach(box => {
      ctx.fillStyle = 'rgba(255, 255, 0, 0.4)';
      ctx.fillRect(box.x, box.y, box.width, box.height);
      ctx.strokeStyle = '#FFC107';
      ctx.lineWidth = 2;
      ctx.strokeRect(box.x, box.y, box.width, box.height);
    });
  };

  const performOCR = async (img) => {
    setLoading(true);
    try {
      const worker = await createWorker('eng');
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      const { data } = await worker.recognize(canvas);
      setOcrResult(data);
      await worker.terminate();
      toast.success('Text detection complete!');
    } catch (error) {
      console.error('OCR error:', error);
      toast.error('Failed to detect text');
    } finally {
      setLoading(false);
    }
  };

  const handleHighlight = () => {
    if (!searchText.trim() || !ocrResult) {
      toast.error('Please enter text to search');
      return;
    }

    const boxes = [];
    ocrResult.words.forEach(word => {
      if (word.text.toLowerCase().includes(searchText.toLowerCase())) {
        const bbox = word.bbox;
        boxes.push({
          x: bbox.x0,
          y: bbox.y0,
          width: bbox.x1 - bbox.x0,
          height: bbox.y1 - bbox.y0,
          text: word.text
        });
      }
    });

    if (boxes.length > 0) {
      setHighlightedBoxes(boxes);
      drawCanvas(image, boxes);
      toast.success(`Found ${boxes.length} match(es)`);
    } else {
      toast.warning('Text not found in image');
    }
  };

  const handleReplace = async () => {
    if (!targetText.trim() || !replacementText.trim() || !ocrResult) {
      toast.error('Please enter both target and replacement text');
      return;
    }

    setLoading(true);
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Find matching text boxes
      const matchingBoxes = [];
      ocrResult.words.forEach(word => {
        if (word.text.toLowerCase().includes(targetText.toLowerCase())) {
          matchingBoxes.push(word.bbox);
        }
      });

      if (matchingBoxes.length === 0) {
        toast.warning('Target text not found');
        setLoading(false);
        return;
      }

      // Erase old text (fill with white/background color)
      matchingBoxes.forEach(bbox => {
        ctx.fillStyle = 'white';
        ctx.fillRect(bbox.x0 - 2, bbox.y0 - 2, bbox.x1 - bbox.x0 + 4, bbox.y1 - bbox.y0 + 4);
      });

      // Write new text
      matchingBoxes.forEach(bbox => {
        const fontSize = Math.max(12, bbox.y1 - bbox.y0);
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = 'red';
        ctx.fillText(replacementText, bbox.x0, bbox.y1 - 2);
      });

      toast.success('Text replaced successfully!');
    } catch (error) {
      console.error('Replace error:', error);
      toast.error('Failed to replace text');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!removeText.trim() || !ocrResult) {
      toast.error('Please enter text to remove');
      return;
    }

    setLoading(true);
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Find matching text boxes
      const matchingBoxes = [];
      ocrResult.words.forEach(word => {
        if (word.text.toLowerCase().includes(removeText.toLowerCase())) {
          matchingBoxes.push(word.bbox);
        }
      });

      if (matchingBoxes.length === 0) {
        toast.warning('Text not found');
        setLoading(false);
        return;
      }

      // Erase text (simple white fill - in production you'd want more sophisticated inpainting)
      matchingBoxes.forEach(bbox => {
        ctx.fillStyle = 'white';
        ctx.fillRect(bbox.x0 - 2, bbox.y0 - 2, bbox.x1 - bbox.x0 + 4, bbox.y1 - bbox.y0 + 4);
      });

      toast.success(`Removed ${matchingBoxes.length} text occurrence(s)!`);
    } catch (error) {
      console.error('Remove error:', error);
      toast.error('Failed to remove text');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    toast.success('Changes saved!');
  };

  const clearHighlights = () => {
    setHighlightedBoxes([]);
    drawCanvas(image);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">OCR Text Editor</h3>
            <p className="text-sm text-gray-600">Detect, highlight, replace, or remove text from images</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
              Save Changes
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Tools Sidebar */}
          <div className="w-80 border-r bg-gray-50 p-4 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="highlight">Highlight</TabsTrigger>
                <TabsTrigger value="replace">Replace</TabsTrigger>
                <TabsTrigger value="remove">Remove</TabsTrigger>
              </TabsList>

              {/* Highlight Tab */}
              <TabsContent value="highlight" className="space-y-4">
                <div>
                  <Label>Search Text</Label>
                  <Input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Enter text to highlight"
                    className="mt-2"
                    onKeyPress={(e) => e.key === 'Enter' && handleHighlight()}
                    disabled={loading || !ocrResult}
                  />
                </div>

                <Button 
                  onClick={handleHighlight} 
                  className="w-full"
                  disabled={loading || !ocrResult || !searchText.trim()}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Highlight Text
                </Button>

                {highlightedBoxes.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800 mb-2">
                      Found {highlightedBoxes.length} match(es)
                    </p>
                    <Button size="sm" variant="outline" onClick={clearHighlights} className="w-full">
                      Clear Highlights
                    </Button>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    💡 Enter text to search for in the image. Matching text will be highlighted with yellow boxes.
                  </p>
                </div>
              </TabsContent>

              {/* Replace Tab */}
              <TabsContent value="replace" className="space-y-4">
                <div>
                  <Label>Text to Find</Label>
                  <Input
                    value={targetText}
                    onChange={(e) => setTargetText(e.target.value)}
                    placeholder="Enter text to find"
                    className="mt-2"
                    disabled={loading || !ocrResult}
                  />
                </div>

                <div>
                  <Label>Replacement Text</Label>
                  <Input
                    value={replacementText}
                    onChange={(e) => setReplacementText(e.target.value)}
                    placeholder="Enter new text"
                    className="mt-2"
                    disabled={loading || !ocrResult}
                  />
                </div>

                <Button 
                  onClick={handleReplace} 
                  className="w-full bg-amber-500 hover:bg-amber-600"
                  disabled={loading || !ocrResult || !targetText.trim() || !replacementText.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Type className="w-4 h-4 mr-2" />
                      Replace Text
                    </>
                  )}
                </Button>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-800">
                    🔄 The target text will be erased and replaced with your new text. Changes are applied directly to the canvas.
                  </p>
                </div>
              </TabsContent>

              {/* Remove Tab */}
              <TabsContent value="remove" className="space-y-4">
                <div>
                  <Label>Text to Remove</Label>
                  <Input
                    value={removeText}
                    onChange={(e) => setRemoveText(e.target.value)}
                    placeholder="Enter text to remove"
                    className="mt-2"
                    onKeyPress={(e) => e.key === 'Enter' && handleRemove()}
                    disabled={loading || !ocrResult}
                  />
                </div>

                <Button 
                  onClick={handleRemove} 
                  className="w-full bg-red-500 hover:bg-red-600"
                  disabled={loading || !ocrResult || !removeText.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Eraser className="w-4 h-4 mr-2" />
                      Remove Text
                    </>
                  )}
                </Button>

                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs text-red-800">
                    🗑️ The specified text will be erased from the image. This is a simple removal that fills with white background.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {loading && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <p className="text-sm text-blue-800">Analyzing image with OCR...</p>
                </div>
              </div>
            )}

            {ocrResult && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-800">
                  ✅ Detected {ocrResult.words.length} words in the image
                </p>
              </div>
            )}
          </div>

          {/* Canvas Area */}
          <div className="flex-1 flex items-center justify-center bg-gray-100 p-8 overflow-auto">
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full border-2 border-gray-300 shadow-xl rounded-lg bg-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}