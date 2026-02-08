import React, { useState } from 'react';
import { Settings, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function PageSettings({ page, onUpdate, isDraft }) {
  const [settings, setSettings] = useState({
    seo_title: page?.seo_title || '',
    seo_description: page?.seo_description || '',
    seo_keywords: page?.seo_keywords || '',
    is_published: !isDraft
  });

  const handleSave = () => {
    onUpdate(settings);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          Page Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Page Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-2 block">SEO Title</label>
            <Input
              value={settings.seo_title}
              onChange={(e) => setSettings({...settings, seo_title: e.target.value})}
              placeholder="Page title for search engines"
              maxLength={60}
            />
            <p className="text-xs text-gray-500 mt-1">{settings.seo_title.length}/60</p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">SEO Description</label>
            <Textarea
              value={settings.seo_description}
              onChange={(e) => setSettings({...settings, seo_description: e.target.value})}
              placeholder="Meta description"
              maxLength={160}
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">{settings.seo_description.length}/160</p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Keywords</label>
            <Input
              value={settings.seo_keywords}
              onChange={(e) => setSettings({...settings, seo_keywords: e.target.value})}
              placeholder="Comma-separated keywords"
            />
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Status</span>
              <Badge className={settings.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {settings.is_published ? 'Published' : 'Draft'}
              </Badge>
            </div>
            <Button
              onClick={() => setSettings({...settings, is_published: !settings.is_published})}
              variant="outline"
              className="w-full"
            >
              {settings.is_published ? 'Unpublish' : 'Publish'}
            </Button>
          </div>

          <Button onClick={handleSave} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4" />
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}