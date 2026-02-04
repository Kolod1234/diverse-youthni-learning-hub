import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Filter, X, Save, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function AdvancedFilters({ filterType, filters, onFilterChange, onClear }) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const queryClient = useQueryClient();

  const { data: savedSearches = [] } = useQuery({
    queryKey: ['saved-searches', filterType],
    queryFn: () => base44.entities.SavedSearch.filter({ search_type: filterType }, '-created_date', 50)
  });

  const saveSearchMutation = useMutation({
    mutationFn: (data) => base44.entities.SavedSearch.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['saved-searches']);
      toast.success('Search saved!');
      setShowSaveDialog(false);
      setSaveName('');
    }
  });

  const deleteSearchMutation = useMutation({
    mutationFn: (id) => base44.entities.SavedSearch.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['saved-searches']);
      toast.success('Search deleted!');
    }
  });

  const handleSave = () => {
    if (!saveName) {
      toast.error('Please enter a name');
      return;
    }
    saveSearchMutation.mutate({
      name: saveName,
      search_type: filterType,
      filters: filters
    });
  };

  const handleLoadSearch = (search) => {
    onFilterChange(search.filters);
    toast.success(`Loaded: ${search.name}`);
  };

  const activeFilterCount = Object.values(filters).filter(v => v && v !== 'all').length;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold">Advanced Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount} active</Badge>
          )}
        </div>
        <div className="flex gap-2">
          {activeFilterCount > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)}>
                <Save className="w-3 h-3 mr-1" />
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={onClear}>
                <X className="w-3 h-3 mr-1" />
                Clear
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filter Controls based on type */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        {filterType === 'courses' && (
          <>
            <div>
              <Label>Category</Label>
              <Select value={filters.category || 'all'} onValueChange={(v) => onFilterChange({ ...filters, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="biology">Biology</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="history">History</SelectItem>
                  <SelectItem value="geography">Geography</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Level</Label>
              <Select value={filters.level || 'all'} onValueChange={(v) => onFilterChange({ ...filters, level: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {filterType === 'lessons' && (
          <>
            <div>
              <Label>Content Type</Label>
              <Select value={filters.content_type || 'all'} onValueChange={(v) => onFilterChange({ ...filters, content_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="richtext">Rich Text</SelectItem>
                  <SelectItem value="googleslides">Google Slides</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Section</Label>
              <Input
                placeholder="Filter by section..."
                value={filters.section || ''}
                onChange={(e) => onFilterChange({ ...filters, section: e.target.value })}
              />
            </div>
          </>
        )}

        {filterType === 'students' && (
          <>
            <div>
              <Label>Progress</Label>
              <Select value={filters.progress || 'all'} onValueChange={(v) => onFilterChange({ ...filters, progress: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Search Name/Email</Label>
              <Input
                placeholder="Search students..."
                value={filters.query || ''}
                onChange={(e) => onFilterChange({ ...filters, query: e.target.value })}
              />
            </div>
          </>
        )}
      </div>

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Saved Searches</h4>
          <div className="flex flex-wrap gap-2">
            {savedSearches.map(search => (
              <div key={search.id} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1">
                <button
                  onClick={() => handleLoadSearch(search)}
                  className="text-sm hover:text-blue-600"
                >
                  {search.name}
                </button>
                <button
                  onClick={() => deleteSearchMutation.mutate(search.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowSaveDialog(false)}>
          <Card className="p-6 w-96 mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold mb-4">Save Search</h3>
            <Input
              placeholder="Enter search name..."
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="mb-4"
              onKeyPress={(e) => e.key === 'Enter' && handleSave()}
            />
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!saveName}>Save</Button>
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
}