import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Type, Contrast } from 'lucide-react';
import { toast } from 'sonner';

export default function AccessibilityControls() {
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 10, 150);
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
    toast.success(`Font size: ${newSize}%`);
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 10, 80);
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
    toast.success(`Font size: ${newSize}%`);
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    document.documentElement.classList.toggle('high-contrast');
    toast.success(highContrast ? 'Normal contrast' : 'High contrast enabled');
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={decreaseFontSize}
        size="sm"
        variant="ghost"
        title="Decrease font size"
      >
        <Type className="w-3 h-3" />
      </Button>
      <Button
        onClick={increaseFontSize}
        size="sm"
        variant="ghost"
        title="Increase font size"
      >
        <Type className="w-5 h-5" />
      </Button>
      <Button
        onClick={toggleHighContrast}
        size="sm"
        variant={highContrast ? "default" : "ghost"}
        title="Toggle high contrast"
      >
        <Contrast className="w-4 h-4" />
      </Button>
    </div>
  );
}