import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pencil, Eraser, Trash2, Download, Square, Circle, Type, Minus, X } from 'lucide-react';

export default function Whiteboard({ onClose }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [context, setContext] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setContext(ctx);

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Fill with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e) => {
    if (!context) return;
    setIsDrawing(true);
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing || !context) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'eraser') {
      context.globalCompositeOperation = 'destination-out';
      context.lineWidth = lineWidth * 3;
    } else {
      context.globalCompositeOperation = 'source-over';
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
    }

    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (context) {
      context.closePath();
    }
  };

  const clearCanvas = () => {
    if (!context || !canvasRef.current) return;
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = url;
    link.click();
  };

  const colors = ['#000000', '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">Whiteboard</h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Tools */}
            <Button
              size="sm"
              variant={tool === 'pen' ? 'default' : 'outline'}
              onClick={() => setTool('pen')}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={tool === 'eraser' ? 'default' : 'outline'}
              onClick={() => setTool('eraser')}
            >
              <Eraser className="w-4 h-4" />
            </Button>

            {/* Colors */}
            <div className="flex gap-1 ml-2 border-l pl-2">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-gray-900' : 'border-gray-300'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            {/* Line Width */}
            <div className="flex items-center gap-2 ml-2 border-l pl-2">
              <span className="text-xs text-gray-600">Size:</span>
              <input
                type="range"
                min="1"
                max="20"
                value={lineWidth}
                onChange={(e) => setLineWidth(parseInt(e.target.value))}
                className="w-24"
              />
              <span className="text-xs text-gray-600 w-6">{lineWidth}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 ml-2 border-l pl-2">
              <Button size="sm" variant="outline" onClick={clearCanvas}>
                <Trash2 className="w-4 h-4 mr-1" />
                Clear
              </Button>
              <Button size="sm" variant="outline" onClick={downloadCanvas}>
                <Download className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 p-4 bg-gray-100">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="w-full h-full bg-white rounded-lg shadow-inner cursor-crosshair"
          />
        </div>
      </Card>
    </div>
  );
}