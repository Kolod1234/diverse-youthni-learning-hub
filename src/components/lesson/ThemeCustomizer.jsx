import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Palette, Type, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';

const COLORS = [
  { name: 'Blue', value: '#1e3a8a' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Green', value: '#059669' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Pink', value: '#db2777' },
  { name: 'Teal', value: '#0d9488' },
];

const FONTS = [
  { name: 'System', value: 'system-ui, sans-serif' },
  { name: 'Serif', value: 'Georgia, serif' },
  { name: 'Mono', value: 'monospace' },
];

const LAYOUTS = [
  { name: 'Card View', value: 'card' },
  { name: 'Magazine', value: 'magazine' },
  { name: 'Minimal', value: 'minimal' },
  { name: 'Split View', value: 'split' },
];

const DENSITIES = [
  { name: 'Compact', value: 'compact' },
  { name: 'Comfortable', value: 'comfortable' },
  { name: 'Spacious', value: 'spacious' },
];

export default function ThemeCustomizer() {
  const queryClient = useQueryClient();
  
  const { data: preferences = [] } = useQuery({
    queryKey: ['user-preferences'],
    queryFn: () => base44.entities.UserPreferences.list(),
  });

  const pref = preferences[0] || {};

  const updateMutation = useMutation({
    mutationFn: (data) => {
      if (pref.id) {
        return base44.entities.UserPreferences.update(pref.id, data);
      } else {
        return base44.entities.UserPreferences.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-preferences']);
      toast.success('Preferences saved!');
    },
  });

  const applyTheme = (color) => {
    document.documentElement.style.setProperty('--primary-color', color);
    updateMutation.mutate({
      ...pref,
      theme: { ...pref.theme, primary_color: color },
    });
  };

  const applyFont = (font) => {
    document.body.style.fontFamily = font;
    updateMutation.mutate({
      ...pref,
      theme: { ...pref.theme, font_family: font },
    });
  };

  const applyDensity = (density) => {
    const scale = density === 'compact' ? 0.9 : density === 'spacious' ? 1.1 : 1;
    document.documentElement.style.fontSize = `${scale}rem`;
    updateMutation.mutate({
      ...pref,
      content_density: density,
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Palette className="w-4 h-4" />
          Customize
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Customize Your Experience</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Theme Color
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => applyTheme(color.value)}
                  className="h-12 rounded-lg border-2 transition-all hover:scale-105"
                  style={{
                    backgroundColor: color.value,
                    borderColor: pref.theme?.primary_color === color.value ? '#000' : 'transparent',
                  }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Type className="w-4 h-4" />
              Font Family
            </h3>
            <Select
              value={pref.theme?.font_family}
              onValueChange={applyFont}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {FONTS.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Layout className="w-4 h-4" />
              Content Density
            </h3>
            <Select
              value={pref.content_density}
              onValueChange={applyDensity}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select density" />
              </SelectTrigger>
              <SelectContent>
                {DENSITIES.map((density) => (
                  <SelectItem key={density.value} value={density.value}>
                    {density.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}