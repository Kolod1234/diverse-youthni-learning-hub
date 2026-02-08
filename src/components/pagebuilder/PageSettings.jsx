import React, { useState } from 'react';
import { Settings, Save, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import SEOAnalyzer from './SEOAnalyzer';
import MetaDescriptionGenerator from './MetaDescriptionGenerator';
import KeywordSuggester from './KeywordSuggester';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function PageSettings({ page, onUpdate, isDraft, sections = [] }) {
  const [settings, setSettings] = useState({
    seo_title: page?.seo_title || '',
    seo_description: page?.seo_description || '',
    seo_keywords: page?.seo_keywords || '',
    is_published: !isDraft
  });
  const [keywords, setKeywords] = useState(
    typeof settings.seo_keywords === 'string'
      ? settings.seo_keywords.split(',').filter(k => k.trim())
      : []
  );
  const [isGeneratingSitemap, setIsGeneratingSitemap] = useState(false);

  const handleSave = () => {
    onUpdate({
      ...settings,
      seo_keywords: keywords.join(', ')
    });
  };

  const handleGenerateSitemap = async () => {
    setIsGeneratingSitemap(true);
    try {
      const response = await base44.functions.invoke('generateSitemap');
      const blob = new Blob([response.data], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('Sitemap generated and downloaded!');
    } catch (error) {
      toast.error('Failed to generate sitemap');
      console.error(error);
    } finally {
      setIsGeneratingSitemap(false);
    }
  };

  const contentPreview = sections
    .filter(s => s.is_active)
    .map(s => `${s.title || ''} ${s.description || ''}`)
    .join(' ')
    .substring(0, 500);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          Page Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Page Settings & SEO</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="seo">SEO Tools</TabsTrigger>
              <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Page Title</label>
                <Input
                  value={settings.seo_title}
                  onChange={(e) => setSettings({...settings, seo_title: e.target.value})}
                  placeholder="Page title for search engines"
                  maxLength={60}
                />
                <p className="text-xs text-gray-500 mt-1">{settings.seo_title.length}/60</p>
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
            </TabsContent>

            {/* SEO Tools Tab */}
            <TabsContent value="seo" className="space-y-6 mt-4">
              {/* SEO Score */}
              <SEOAnalyzer
                title={settings.seo_title}
                description={settings.seo_description}
                keywords={keywords}
                content={contentPreview}
              />

              <div className="border-t pt-6">
                {/* Meta Description Generator */}
                <MetaDescriptionGenerator
                  title={settings.seo_title}
                  content={contentPreview}
                  onDescriptionGenerated={(desc) =>
                    setSettings({...settings, seo_description: desc})
                  }
                />
              </div>

              <div className="border-t pt-6">
                {/* Keyword Suggester */}
                <KeywordSuggester
                  title={settings.seo_title}
                  content={contentPreview}
                  onKeywordsUpdated={setKeywords}
                />
              </div>
            </TabsContent>

            {/* Sitemap Tab */}
            <TabsContent value="sitemap" className="space-y-4 mt-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">Generate Sitemap</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Create an XML sitemap for your pages to help search engines discover and index your content.
                </p>
                <Button
                  onClick={handleGenerateSitemap}
                  disabled={isGeneratingSitemap}
                  className="w-full gap-2"
                >
                  <Download className="w-4 h-4" />
                  {isGeneratingSitemap ? 'Generating...' : 'Download Sitemap'}
                </Button>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">Submit to Search Engines</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  After downloading, submit your sitemap to:
                </p>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                      Google Search Console
                    </a>
                  </li>
                  <li>
                    <a href="https://www.bing.com/webmasters" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                      Bing Webmaster Tools
                    </a>
                  </li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <div className="border-t pt-4 mt-4">
          <Button onClick={handleSave} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4" />
            Save All Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}