import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Loader2, Upload, Link as LinkIcon } from 'lucide-react';

const ASSET_TYPES = [
  { value: 'image', label: 'Image' },
  { value: 'canva_design', label: 'Canva design' },
  { value: 'illustration', label: 'Illustration' },
  { value: 'icon', label: 'Icon' },
  { value: 'background', label: 'Background' },
  { value: 'logo', label: 'Logo' },
  { value: 'other', label: 'Other' },
];

export default function AssetUploadDialog({ open, onOpenChange, onSaved, defaultType = 'image' }) {
  const [mode, setMode] = useState('upload'); // 'upload' | 'url'
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [assetType, setAssetType] = useState(defaultType);
  const [folder, setFolder] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setFile(null);
    setImageUrl('');
    setName('');
    setDescription('');
    setAssetType(defaultType);
    setFolder('');
    setTags('');
    setMode('upload');
  };

  const handleFileChange = (e) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    setFile(picked);
    if (!name) setName(picked.name.replace(/\.[^/.]+$/, ''));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please give the asset a name');
      return;
    }

    setSaving(true);
    let fileUrl = '';
    let source = 'upload';
    let sourceUrl = '';

    if (mode === 'upload') {
      if (!file) {
        toast.error('Please choose a file');
        setSaving(false);
        return;
      }
      const result = await base44.integrations.Core.UploadFile({ file });
      fileUrl = result.file_url;
    } else {
      if (!imageUrl.trim()) {
        toast.error('Please paste an image URL');
        setSaving(false);
        return;
      }
      fileUrl = imageUrl.trim();
      source = imageUrl.includes('canva.com') ? 'canva' : 'url_import';
      sourceUrl = imageUrl.trim();
    }

    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);

    const created = await base44.entities.AssetLibrary.create({
      name: name.trim(),
      description: description.trim(),
      file_url: fileUrl,
      asset_type: assetType,
      source,
      source_url: sourceUrl,
      folder: folder.trim(),
      tags: tagList,
      usage_count: 0,
    });

    toast.success('Asset saved to your library');
    onSaved?.(created);
    reset();
    onOpenChange(false);
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Save to Asset Library</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-2">
          <Button
            size="sm"
            variant={mode === 'upload' ? 'default' : 'outline'}
            onClick={() => setMode('upload')}
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" /> Upload file
          </Button>
          <Button
            size="sm"
            variant={mode === 'url' ? 'default' : 'outline'}
            onClick={() => setMode('url')}
            className="flex-1"
          >
            <LinkIcon className="w-4 h-4 mr-2" /> Paste image URL
          </Button>
        </div>

        {mode === 'upload' ? (
          <div>
            <Label>File</Label>
            <Input type="file" accept="image/*" onChange={handleFileChange} className="mt-2" />
          </div>
        ) : (
          <div>
            <Label>Image URL</Label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="mt-2"
            />
          </div>
        )}

        <div>
          <Label>Name *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-2" placeholder="e.g. Hero banner - orange" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Type</Label>
            <Select value={assetType} onValueChange={setAssetType}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ASSET_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Folder (optional)</Label>
            <Input value={folder} onChange={(e) => setFolder(e.target.value)} className="mt-2" placeholder="e.g. Lesson covers" />
          </div>
        </div>

        <div>
          <Label>Tags (comma separated)</Label>
          <Input value={tags} onChange={(e) => setTags(e.target.value)} className="mt-2" placeholder="math, gcse, banner" />
        </div>

        <div>
          <Label>Description (optional)</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2" rows={2} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save asset'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}