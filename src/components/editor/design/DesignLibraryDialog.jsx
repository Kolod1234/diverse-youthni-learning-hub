import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, X, Library, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { DESIGN_TABS } from './designAssets';
import AssetUploadDialog from '@/components/assets/AssetUploadDialog';

// "My library" pseudo-tab — backed by the AssetLibrary entity rather than
// a static items array. Marked with kind: 'library' so the dialog knows to
// fetch and render dynamically.
const MY_LIBRARY_TAB = { id: 'my-library', label: 'My library', kind: 'library' };
const ALL_TABS = [MY_LIBRARY_TAB, ...DESIGN_TABS];

/**
 * DesignLibraryDialog
 * -------------------
 * Quick-access palette of design assets the tutor can drop into the
 * current slide. Mirrors what tools like Canva/Notion call the "Design"
 * or "Elements" panel.
 *
 * Routing per asset kind (decided in designAssets.js):
 *   • image       → onInsertImage({ url, alt })
 *   • html        → onInsertHtml(html)
 *   • background  → onApplyBackground(value)
 *
 * Also supports importing a custom image via upload.
 */
export default function DesignLibraryDialog({
  open,
  initialTab = 'backgrounds',
  onClose,
  onInsertImage,
  onInsertHtml,
  onApplyBackground,
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [uploading, setUploading] = useState(false);
  const [showAssetUpload, setShowAssetUpload] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  // Sync the active tab whenever the dialog reopens with a new initialTab.
  useEffect(() => {
    if (open) setActiveTab(initialTab);
  }, [open, initialTab]);

  const current = ALL_TABS.find((t) => t.id === activeTab) || ALL_TABS[0];

  // Load the tutor's saved AssetLibrary entries — only when the My library
  // tab is active so we don't pay for the fetch when browsing built-ins.
  const { data: myAssets = [], isLoading: loadingLibrary } = useQuery({
    queryKey: ['asset-library-design-dialog'],
    queryFn: () => base44.entities.AssetLibrary.list('-created_date', 500),
    enabled: open && activeTab === 'my-library',
  });

  const handleLibraryAssetClick = async (asset) => {
    onInsertImage?.({ url: asset.file_url, alt: asset.name });
    // Track usage so most-used assets can surface later.
    try {
      await base44.entities.AssetLibrary.update(asset.id, {
        usage_count: (asset.usage_count || 0) + 1,
      });
      queryClient.invalidateQueries({ queryKey: ['asset-library-design-dialog'] });
      queryClient.invalidateQueries({ queryKey: ['asset-library'] });
    } catch {
      // Non-fatal — insertion already succeeded.
    }
    toast.success(`${asset.name} added`);
    onClose?.();
  };

  const handleAssetClick = (item) => {
    if (current.kind === 'background') {
      onApplyBackground?.(item.value);
      toast.success(`${item.name} background applied`);
    } else if (current.kind === 'html') {
      onInsertHtml?.(item.html);
      toast.success(`${item.name} added`);
    } else {
      onInsertImage?.({ url: item.url, alt: item.name });
      toast.success(`${item.name} added`);
    }
    onClose?.();
  };

  const handleUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onInsertImage?.({ url: file_url, alt: file.name });
      toast.success('Image inserted');
      onClose?.();
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose?.(); }}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-3 border-b">
          <DialogTitle>Design library</DialogTitle>
          <DialogDescription>
            Drop in backgrounds, banners, shapes, lines, arrows, social icons or styled cards — or import your own image.
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-[60vh] min-h-[420px]">
          {/* Sidebar */}
          <div className="w-48 shrink-0 border-r bg-slate-50 py-3 overflow-y-auto">
            {ALL_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={[
                  'w-full text-left px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2',
                  activeTab === t.id
                    ? 'bg-indigo-100 text-indigo-700 border-r-2 border-indigo-600'
                    : 'text-slate-700 hover:bg-slate-100',
                ].join(' ')}
              >
                {t.id === 'my-library' && <Library className="w-3.5 h-3.5" />}
                {t.label}
              </button>
            ))}

            <div className="mt-3 px-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f);
                  e.target.value = '';
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="w-3.5 h-3.5" />
                {uploading ? 'Uploading…' : 'Import image'}
              </Button>
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-4 bg-white">
            {current.kind === 'library' ? (
              loadingLibrary ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : myAssets.length === 0 ? (
                <div className="text-center py-12">
                  <Library className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-700 font-semibold">Your library is empty</p>
                  <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                    Upload icons, banners or custom shapes once and reuse them in any lesson.
                  </p>
                  <Button className="mt-4" size="sm" onClick={() => setShowAssetUpload(true)}>
                    <Plus className="w-4 h-4 mr-1.5" /> Add asset
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-slate-500">{myAssets.length} saved asset{myAssets.length === 1 ? '' : 's'}</p>
                    <Button size="sm" variant="outline" onClick={() => setShowAssetUpload(true)}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add new
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {myAssets.map((asset) => (
                      <LibraryAssetTile key={asset.id} asset={asset} onClick={() => handleLibraryAssetClick(asset)} />
                    ))}
                  </div>
                </>
              )
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {current.items.map((item) => (
                  <AssetTile key={item.id} item={item} kind={current.kind} onClick={() => handleAssetClick(item)} />
                ))}
              </div>
            )}
          </div>
        </div>

        <AssetUploadDialog
          open={showAssetUpload}
          onOpenChange={setShowAssetUpload}
          onSaved={() => queryClient.invalidateQueries({ queryKey: ['asset-library-design-dialog'] })}
        />

        <div className="px-6 py-3 border-t flex justify-end bg-slate-50">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4 mr-1" /> Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LibraryAssetTile({ asset, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={asset.name}
      className="group rounded-lg border border-slate-200 hover:border-indigo-400 hover:shadow-md bg-white overflow-hidden text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
    >
      <div className="w-full h-24 flex items-center justify-center bg-slate-50 overflow-hidden">
        <img
          src={asset.thumbnail_url || asset.file_url}
          alt={asset.name}
          className="max-w-full max-h-full object-contain"
          loading="lazy"
        />
      </div>
      <div className="px-2 py-1.5 text-xs font-medium text-slate-700 truncate group-hover:text-indigo-700">
        {asset.name}
      </div>
    </button>
  );
}

function AssetTile({ item, kind, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={item.name}
      className="group rounded-lg border border-slate-200 hover:border-indigo-400 hover:shadow-md bg-white overflow-hidden text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
    >
      <div className="w-full h-24 flex items-center justify-center bg-slate-50 overflow-hidden">
        {kind === 'background' ? (
          <div className="w-full h-full" style={{ background: item.preview }} />
        ) : kind === 'html' ? (
          <div
            className="w-full h-full p-2 text-[10px] overflow-hidden flex items-center"
            // The asset HTML is internally-authored static markup from
            // designAssets.js — no user input is ever rendered here.
            dangerouslySetInnerHTML={{ __html: item.html }}
          />
        ) : (
          <img src={item.url} alt={item.name} className="max-w-full max-h-full object-contain" />
        )}
      </div>
      <div className="px-2 py-1.5 text-xs font-medium text-slate-700 truncate group-hover:text-indigo-700">
        {item.name}
      </div>
    </button>
  );
}