import React, { useState } from 'react';
import { Palette, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useTheme } from 'next-themes';

const colorPresets = [
  { name: 'Orange', primary: '#FF8C00' },
  { name: 'Blue', primary: '#3B82F6' },
  { name: 'Purple', primary: '#A855F7' },
  { name: 'Green', primary: '#10B981' },
  { name: 'Red', primary: '#EF4444' },
  { name: 'Pink', primary: '#EC4899' },
];

export default function ThemeCustomizer() {
  const { theme } = useTheme();
  const [primaryColor, setPrimaryColor] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('primary-color') || '#FF8C00';
    }
    return '#FF8C00';
  });

  const handleColorChange = (color) => {
    setPrimaryColor(color);
    localStorage.setItem('primary-color', color);
    document.documentElement.style.setProperty('--color-primary', color);
  };

  const handleReset = () => {
    const defaultColor = '#FF8C00';
    setPrimaryColor(defaultColor);
    localStorage.removeItem('primary-color');
    document.documentElement.style.setProperty('--color-primary', defaultColor);
  };

  if (theme === 'light') return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" title="Customize theme">
          <Palette className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Customize Dark Mode</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div>
            <h3 className="text-sm font-semibold mb-3">Primary Color</h3>
            <div className="space-y-2">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleColorChange(preset.primary)}
                  className={`w-full p-3 rounded-lg flex items-center gap-3 transition-all border-2 ${
                    primaryColor === preset.primary
                      ? 'border-white/50'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  style={{ backgroundColor: `${preset.primary}20` }}
                >
                  <div
                    className="w-6 h-6 rounded-lg"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <span className="text-sm font-medium">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold block mb-2">Custom Color</label>
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
          </div>

          <div className="pt-4 border-t border-gray-700 space-y-2">
            <Button onClick={handleReset} variant="outline" className="w-full gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset to Default
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}