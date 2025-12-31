import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Tesseract from 'tesseract.js';
import { Loader2, Type, Highlighter, Save, X, AlertCircle } from 'lucide-react';

// Simple spell checker - basic common words list
const checkSpelling = (word) => {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
  if (cleaned.length < 2) return true;
  
  // This is a simplified check - in production, use a proper dictionary API
  const commonWords = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their'];
  
  // If word is very short or in common list, likely correct
  if (cleaned.length <= 3 || commonWords.includes(cleaned)) return true;
  
  // Check if it looks like a real word (has vowels, reasonable structure)
  const hasVowels = /[aeiou]/i.test(cleaned);
  const noWeirdPatterns = !/([a-z])\1{3,}/i.test(cleaned); // No more than 3 repeated letters
  
  return hasVowels && noWeirdPatterns;
};

const detectHighlightColor = (imageData, bbox) => {
  const { x0, y0, x1, y1 } = bbox;
  let yellowCount = 0;
  let totalPixels = 0;
  
  for (let y = Math.floor(y0); y < Math.ceil(y1); y++) {
    for (let x = Math.floor(x0); x < Math.ceil(x1); x++) {
      const idx = (y * imageData.width + x) * 4;
      const r = imageData.data[idx];
      const g = imageData.data[idx + 1];
      const b = imageData.data[idx + 2];
      
      // Detect yellow-ish highlight
      if (r > 200 && g > 200 && b < 150) {
        yellowCount++;
      }
      totalPixels++;
    }
  }
  
  return yellowCount / totalPixels > 0.3; // 30% yellow pixels = highlighted
};

export default function OCRImageEditor({ imageUrl, onSave, onClose }) {
  const [extracting, setExtracting] = useState(false);
  const [textRegions, setTextRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [imageData, setImageData] = useState(null);
  const [spellSuggestions, setSpellSuggestions] = useState({});

  useEffect(() => {
    if (imageUrl) {
      extractText();
    }
  }, [imageUrl]);

  const extractText = async () => {
    setExtracting(true);
    try {
      const result = await Tesseract.recognize(imageUrl, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      // Get image data for highlight detection
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve) => {
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          setImageData(imgData);
          resolve();
        };
        img.src = imageUrl;
      });

      const regions = result.data.words.map((word, idx) => {
        const isHighlighted = imageData ? detectHighlightColor(imageData, word.bbox) : false;
        const isSpelledCorrectly = checkSpelling(word.text);
        
        return {
          id: idx,
          text: word.text,
          bbox: word.bbox,
          confidence: word.confidence,
          highlighted: isHighlighted,
          misspelled: !isSpelledCorrectly
        };
      });

      setTextRegions(regions);
      
      const misspelledCount = regions.filter(r => r.misspelled).length;
      const highlightedCount = regions.filter(r => r.highlighted).length;
      
      toast.success(`Extracted ${regions.length} words! ${highlightedCount} highlighted, ${misspelledCount} misspelled`);
    } catch (error) {
      toast.error('Failed to extract text: ' + error.message);
    } finally {
      setExtracting(false);
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Draw original image
    ctx.drawImage(img, 0, 0);

    // Draw text regions
    textRegions.forEach(region => {
      const { x0, y0, x1, y1 } = region.bbox;
      
      if (region.highlighted) {
        // Highlight background
        ctx.fillStyle = 'rgba(255, 255, 0, 0.4)';
        ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
      }

      if (selectedRegion?.id === region.id) {
        // Selected region border
        ctx.strokeStyle = '#4F46E5';
        ctx.lineWidth = 3;
        ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
      } else {
        // Normal border - red for misspelled
        ctx.strokeStyle = region.misspelled ? '#EF4444' : region.highlighted ? '#F59E0B' : 'rgba(99, 102, 241, 0.3)';
        ctx.lineWidth = region.misspelled ? 2.5 : 2;
        ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
      }

      // Draw text overlay
      if (region.text) {
        const fontSize = Math.max(12, (y1 - y0) * 0.8);
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = region.misspelled ? '#DC2626' : '#1F2937';
        ctx.fillText(region.text, x0, y0 + (y1 - y0) * 0.8);
        
        // Underline misspelled words
        if (region.misspelled) {
          ctx.strokeStyle = '#DC2626';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 2]);
          ctx.beginPath();
          ctx.moveTo(x0, y1 + 2);
          ctx.lineTo(x1, y1 + 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    });
  };

  useEffect(() => {
    if (imageLoaded && textRegions.length > 0) {
      drawCanvas();
    }
  }, [textRegions, selectedRegion, imageLoaded]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Find clicked region
    const clicked = textRegions.find(region => {
      const { x0, y0, x1, y1 } = region.bbox;
      return x >= x0 && x <= x1 && y >= y0 && y <= y1;
    });

    if (clicked) {
      setSelectedRegion(clicked);
      setEditingText(clicked.text);
    } else {
      setSelectedRegion(null);
    }
  };

  const updateSelectedText = () => {
    if (!selectedRegion) return;

    const isSpelledCorrectly = checkSpelling(editingText);
    
    setTextRegions(regions => 
      regions.map(r => 
        r.id === selectedRegion.id 
          ? { ...r, text: editingText, misspelled: !isSpelledCorrectly }
          : r
      )
    );
    setSelectedRegion({ ...selectedRegion, text: editingText, misspelled: !isSpelledCorrectly });
    toast.success(isSpelledCorrectly ? 'Text updated!' : 'Text updated (possible spelling issue)');
  };

  const toggleHighlight = (regionId) => {
    setTextRegions(regions =>
      regions.map(r =>
        r.id === regionId
          ? { ...r, highlighted: !r.highlighted }
          : r
      )
    );
  };

  const saveImage = async () => {
    const canvas = canvasRef.current;
    canvas.toBlob(async (blob) => {
      try {
        const file = new File([blob], 'edited-image.png', { type: 'image/png' });
        const { base44 } = await import('@/api/base44Client');
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        onSave(file_url);
        toast.success('Image saved!');
      } catch (error) {
        toast.error('Failed to save image: ' + error.message);
      }
    });
  };

  return (
    <div className="space-y-4">
      {extracting && (
        <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 rounded-lg">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-sm text-blue-900">Extracting text from image...</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Label className="mb-2 block">Image with Editable Text</Label>
          <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
            <img
              ref={imgRef}
              src={imageUrl}
              alt="OCR Source"
              className="hidden"
              onLoad={() => setImageLoaded(true)}
            />
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="w-full cursor-crosshair"
              style={{ maxHeight: '500px', objectFit: 'contain' }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Click on any text region to edit. Blue borders show detected text.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Text Editor</Label>
            {selectedRegion ? (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-600">Edit Text</Label>
                  <div className="relative">
                    <Input
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      placeholder="Edit text..."
                      className={`mt-1 ${selectedRegion.misspelled ? 'border-red-300 focus-visible:ring-red-400' : ''}`}
                    />
                    {selectedRegion.misspelled && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      </div>
                    )}
                  </div>
                  {selectedRegion.misspelled && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Possible spelling error
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={updateSelectedText}
                    className="flex-1"
                  >
                    <Type className="w-4 h-4 mr-2" />
                    Update
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleHighlight(selectedRegion.id)}
                    title={selectedRegion.highlighted ? 'Remove highlight' : 'Add highlight'}
                  >
                    <Highlighter className={`w-4 h-4 ${selectedRegion.highlighted ? 'text-yellow-500' : ''}`} />
                  </Button>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded flex justify-between">
                    <span><strong>Confidence:</strong> {Math.round(selectedRegion.confidence)}%</span>
                    {selectedRegion.highlighted && (
                      <span className="text-yellow-600 font-medium">Highlighted</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg text-center">
                Click on text in the image to edit
              </div>
            )}
          </div>

          <div>
            <Label className="text-xs text-gray-600 mb-2 block">
              Detected Text ({textRegions.length})
              <span className="ml-2 text-red-500">
                {textRegions.filter(r => r.misspelled).length} misspelled
              </span>
              <span className="ml-2 text-yellow-600">
                {textRegions.filter(r => r.highlighted).length} highlighted
              </span>
            </Label>
            <div className="max-h-[200px] overflow-y-auto space-y-1 bg-gray-50 rounded-lg p-2">
              {textRegions.map(region => (
                <button
                  key={region.id}
                  onClick={() => {
                    setSelectedRegion(region);
                    setEditingText(region.text);
                  }}
                  className={`w-full text-left text-xs p-2 rounded transition-colors flex items-center gap-2 ${
                    selectedRegion?.id === region.id
                      ? 'bg-indigo-100 text-indigo-900 font-medium'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span className={region.misspelled ? 'text-red-600 underline' : ''}>
                    {region.text}
                  </span>
                  <div className="ml-auto flex gap-1">
                    {region.highlighted && (
                      <span className="w-3 h-3 bg-yellow-400 rounded-full" title="Highlighted" />
                    )}
                    {region.misspelled && (
                      <AlertCircle className="w-3 h-3 text-red-500" title="Misspelled" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={saveImage}
              className="w-full"
              disabled={extracting}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={extractText}
          disabled={extracting}
        >
          {extracting ? 'Extracting...' : 'Re-extract Text'}
        </Button>
        <Button variant="outline" onClick={onClose}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
}