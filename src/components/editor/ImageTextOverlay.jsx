import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { X, Plus, Type, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ImageTextOverlay({ imageUrl, onSave, onClose }) {
  const [textBoxes, setTextBoxes] = useState([]);
  const [selectedBox, setSelectedBox] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const addTextBox = () => {
    const newBox = {
      id: Date.now(),
      text: 'Label',
      x: 50,
      y: 50,
      fontSize: 18,
      color: '#000000',
      backgroundColor: '#FFFFFF',
      bold: true,
      padding: 8
    };
    setTextBoxes([...textBoxes, newBox]);
    setSelectedBox(newBox.id);
    toast.success('Text label added');
  };

  const updateTextBox = (id, updates) => {
    setTextBoxes(textBoxes.map(box => 
      box.id === id ? { ...box, ...updates } : box
    ));
  };

  const deleteTextBox = (id) => {
    setTextBoxes(textBoxes.filter(box => box.id !== id));
    if (selectedBox === id) setSelectedBox(null);
  };

  const handleMouseDown = (e, box) => {
    setSelectedBox(box.id);
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedBox) return;
    
    const container = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - container.left - dragOffset.x) / container.width) * 100;
    const y = ((e.clientY - container.top - dragOffset.y) / container.height) * 100;
    
    updateTextBox(selectedBox, {
      x: Math.max(0, Math.min(95, x)),
      y: Math.max(0, Math.min(95, y))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const generateHTML = () => {
    const overlays = textBoxes.map(box => `
      <div style="position: absolute; left: ${box.x}%; top: ${box.y}%; 
                  font-size: ${box.fontSize}px; color: ${box.color}; 
                  background-color: ${box.backgroundColor}; 
                  padding: ${box.padding}px; border-radius: 4px;
                  font-weight: ${box.bold ? '700' : '400'};
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                  pointer-events: none;">
        ${box.text}
      </div>
    `).join('');

    return `<div style="position: relative; margin: 20px auto; max-width: 100%; text-align: center;">
      <img src="${imageUrl}" style="width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: block;" />
      ${overlays}
    </div>`;
  };

  const handleSave = () => {
    const html = generateHTML();
    onSave(html);
    toast.success('Image with labels saved to slide!');
    onClose();
  };

  const selectedBoxData = textBoxes.find(box => box.id === selectedBox);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
      <Card className="w-full max-w-6xl h-[90vh] flex flex-col bg-white">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <Type className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-lg">Add Text Labels to Image</h3>
              <p className="text-sm text-gray-500">Click and drag to position labels with correct spelling</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={addTextBox} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Label
            </Button>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Canvas Area */}
          <div className="flex-1 p-6 overflow-auto bg-gray-100">
            <div 
              className="relative mx-auto max-w-4xl bg-white rounded-lg shadow-lg"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img 
                src={imageUrl} 
                alt="Edit" 
                className="w-full h-auto rounded-lg block"
                draggable={false}
              />
              {textBoxes.map(box => (
                <div
                  key={box.id}
                  className={`absolute cursor-move transition-shadow ${
                    selectedBox === box.id ? 'ring-2 ring-indigo-500 shadow-lg' : ''
                  }`}
                  style={{
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    fontSize: `${box.fontSize}px`,
                    color: box.color,
                    backgroundColor: box.backgroundColor,
                    padding: `${box.padding}px`,
                    borderRadius: '4px',
                    fontWeight: box.bold ? '700' : '400',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    userSelect: 'none'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, box)}
                >
                  {box.text}
                </div>
              ))}
            </div>
          </div>

          {/* Properties Panel */}
          <div className="w-80 border-l bg-gray-50 p-4 overflow-auto">
            {selectedBoxData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Edit Label</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTextBox(selectedBoxData.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div>
                  <Label>Text</Label>
                  <Input
                    value={selectedBoxData.text}
                    onChange={(e) => updateTextBox(selectedBoxData.id, { text: e.target.value })}
                    placeholder="Enter label text"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Font Size</Label>
                  <Input
                    type="number"
                    value={selectedBoxData.fontSize}
                    onChange={(e) => updateTextBox(selectedBoxData.id, { fontSize: parseInt(e.target.value) || 16 })}
                    min={10}
                    max={48}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Text Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={selectedBoxData.color}
                      onChange={(e) => updateTextBox(selectedBoxData.id, { color: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={selectedBoxData.color}
                      onChange={(e) => updateTextBox(selectedBoxData.id, { color: e.target.value })}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Background Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={selectedBoxData.backgroundColor}
                      onChange={(e) => updateTextBox(selectedBoxData.id, { backgroundColor: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={selectedBoxData.backgroundColor}
                      onChange={(e) => updateTextBox(selectedBoxData.id, { backgroundColor: e.target.value })}
                      placeholder="#FFFFFF"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Padding</Label>
                  <Input
                    type="number"
                    value={selectedBoxData.padding}
                    onChange={(e) => updateTextBox(selectedBoxData.id, { padding: parseInt(e.target.value) || 8 })}
                    min={0}
                    max={24}
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="bold"
                    checked={selectedBoxData.bold}
                    onChange={(e) => updateTextBox(selectedBoxData.id, { bold: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="bold" className="cursor-pointer">Bold Text</Label>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Type className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Click "Add Label" to start</p>
                <p className="text-gray-400 text-xs mt-2">Add labels with correct spelling to your image</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t p-4 bg-gray-50 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {textBoxes.length} label{textBoxes.length !== 1 ? 's' : ''} added
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
              Save to Slide
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}