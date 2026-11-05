import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Search, FolderOpen, Images, Loader2 } from 'lucide-react';
import AssetCard from '@/components/assets/AssetCard';
import AssetUploadDialog from '@/components/assets/AssetUploadDialog';

export default function AssetLibrary() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [folderFilter, setFolderFilter] = useState('all');
  const [showUpload, setShowUpload] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['auth-me'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['asset-library'],
    queryFn: () => base44.entities.AssetLibrary.list('-created_date', 500),
  });

  const folders = useMemo(() => {
    return [...new Set(assets.map(a => a.folder).filter(Boolean))].sort();
  }, [assets]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assets.filter(a => {
      if (typeFilter !== 'all' && a.asset_type !== typeFilter) return false;
      if (folderFilter !== 'all' && a.folder !== folderFilter) return false;
      if (!q) return true;
      return (
        a.name?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        (a.tags || []).some(t => t.toLowerCase().includes(q))
      );
    });
  }, [assets, search, typeFilter, folderFilter]);

  const handleDelete = async (asset) => {
    if (!confirm(`Delete "${asset.name}"? This cannot be undone.`)) return;
    await base44.entities.AssetLibrary.delete(asset.id);
    queryClient.invalidateQueries({ queryKey: ['asset-library'] });
    toast.success('Asset deleted');
  };

  const handleCopyUrl = () => {
    toast.success('Asset URL copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Images className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Asset Library</h1>
                <p className="text-sm text-muted-foreground">Save and reuse images and design assets across slides and lessons.</p>
              </div>
            </div>
          </div>
          <Button onClick={() => setShowUpload(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add asset
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, description or tag..."
              className="pl-9 bg-card"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[170px] bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="canva_design">Canva design</SelectItem>
              <SelectItem value="illustration">Illustration</SelectItem>
              <SelectItem value="icon">Icon</SelectItem>
              <SelectItem value="background">Background</SelectItem>
              <SelectItem value="logo">Logo</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {folders.length > 0 && (
            <Select value={folderFilter} onValueChange={setFolderFilter}>
              <SelectTrigger className="w-[170px] bg-card"><SelectValue placeholder="All folders" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All folders</SelectItem>
                {folders.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-dashed border-slate-300">
            <FolderOpen className="w-14 h-14 text-slate-300 mx-auto mb-3" />
            <p className="text-muted-foreground font-semibold text-lg">
              {assets.length === 0 ? 'Your library is empty' : 'No assets match your filters'}
            </p>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              {assets.length === 0
                ? 'Upload images or save your downloaded Canva designs so you can reuse them anywhere without re-importing.'
                : 'Try a different search or clear the filters.'}
            </p>
            {assets.length === 0 && (
              <Button className="mt-5" onClick={() => setShowUpload(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add your first asset
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map(asset => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onInsert={(a) => { navigator.clipboard.writeText(a.file_url); toast.success('URL copied'); }}
                onDelete={handleDelete}
                onCopyUrl={handleCopyUrl}
                canDelete={user?.role === 'admin' || asset.created_by === user?.email}
              />
            ))}
          </div>
        )}
      </div>

      <AssetUploadDialog
        open={showUpload}
        onOpenChange={setShowUpload}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['asset-library'] })}
      />
    </div>
  );
}