import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Search, Plus, FolderOpen, Loader2 } from 'lucide-react';
import AssetCard from './AssetCard';
import AssetUploadDialog from './AssetUploadDialog';

export default function AssetLibraryPicker({ open, onOpenChange, onSelect, currentUserEmail, allowMultiple = false }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [folderFilter, setFolderFilter] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['asset-library'],
    queryFn: () => base44.entities.AssetLibrary.list('-created_date', 500),
    enabled: open,
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

  const handlePick = async (asset) => {
    if (allowMultiple) {
      setSelectedIds(prev =>
        prev.includes(asset.id) ? prev.filter(id => id !== asset.id) : [...prev, asset.id]
      );
      return;
    }
    await base44.entities.AssetLibrary.update(asset.id, { usage_count: (asset.usage_count || 0) + 1 });
    queryClient.invalidateQueries({ queryKey: ['asset-library'] });
    onSelect?.(asset);
    onOpenChange(false);
  };

  const handleInsertSelected = async () => {
    const picked = assets.filter(a => selectedIds.includes(a.id));
    await Promise.all(picked.map(a =>
      base44.entities.AssetLibrary.update(a.id, { usage_count: (a.usage_count || 0) + 1 })
    ));
    queryClient.invalidateQueries({ queryKey: ['asset-library'] });
    onSelect?.(picked);
    setSelectedIds([]);
    onOpenChange(false);
  };

  const handleDelete = async (asset) => {
    if (!confirm(`Delete "${asset.name}"? This cannot be undone.`)) return;
    await base44.entities.AssetLibrary.delete(asset.id);
    queryClient.invalidateQueries({ queryKey: ['asset-library'] });
    toast.success('Asset deleted');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-4">
              <span>Asset Library</span>
              <Button size="sm" onClick={() => setShowUpload(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add asset
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, description or tag..."
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
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
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="All folders" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All folders</SelectItem>
                  {folders.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex-1 overflow-y-auto -mx-2 px-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">No assets found</p>
                <p className="text-sm text-slate-500 mt-1">
                  {assets.length === 0 ? 'Add your first asset to start reusing it across slides.' : 'Try adjusting your filters.'}
                </p>
                {assets.length === 0 && (
                  <Button className="mt-4" onClick={() => setShowUpload(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Add asset
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-2">
                {filtered.map(asset => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    onInsert={handlePick}
                    onDelete={handleDelete}
                    selected={selectedIds.includes(asset.id)}
                    canDelete={!currentUserEmail || asset.created_by === currentUserEmail}
                  />
                ))}
              </div>
            )}
          </div>

          {allowMultiple && (
            <DialogFooter>
              <div className="text-sm text-slate-500 mr-auto">{selectedIds.length} selected</div>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleInsertSelected} disabled={selectedIds.length === 0}>
                Insert {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <AssetUploadDialog
        open={showUpload}
        onOpenChange={setShowUpload}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['asset-library'] })}
      />
    </>
  );
}