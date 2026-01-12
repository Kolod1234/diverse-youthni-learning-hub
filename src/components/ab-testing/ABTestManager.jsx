import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Eye, EyeOff, TrendingUp, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

export default function ABTestManager({ section }) {
  const [showCreateVariant, setShowCreateVariant] = useState(false);
  const [newVariant, setNewVariant] = useState({
    variant_name: '',
    title: section.title || '',
    subtitle: section.subtitle || '',
    description: section.description || '',
    cta_text: section.cta_text || '',
    cta_link: section.cta_link || '',
    traffic_percentage: 50
  });
  
  const queryClient = useQueryClient();

  const { data: variants = [] } = useQuery({
    queryKey: ['variants', section.id],
    queryFn: () => base44.entities.PageSectionVariant.filter({ parent_section_id: section.id }, '-created_date', 100)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PageSectionVariant.create({
      ...data,
      parent_section_id: section.id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants'] });
      toast.success('Variant created');
      setShowCreateVariant(false);
      setNewVariant({
        variant_name: '',
        title: section.title || '',
        subtitle: section.subtitle || '',
        description: section.description || '',
        cta_text: section.cta_text || '',
        cta_link: section.cta_link || '',
        traffic_percentage: 50
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PageSectionVariant.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants'] });
      toast.success('Variant deleted');
    }
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.PageSectionVariant.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants'] });
      toast.success('Variant updated');
    }
  });

  const calculateCTR = (variant) => {
    if (variant.impressions === 0) return 0;
    return ((variant.clicks / variant.impressions) * 100).toFixed(2);
  };

  const totalImpressions = variants.reduce((sum, v) => sum + (v.impressions || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            A/B Testing Variants
          </h3>
          <p className="text-sm text-gray-500">Create and test different versions of this section</p>
        </div>
        <Button onClick={() => setShowCreateVariant(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Variant
        </Button>
      </div>

      {variants.length === 0 ? (
        <Card className="p-6 text-center border-dashed">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No variants yet. Create one to start A/B testing!</p>
          <Button onClick={() => setShowCreateVariant(true)} variant="outline">
            Create First Variant
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Original Section Stats */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold">Original (Control)</p>
                <p className="text-xs text-gray-600">{section.title}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">0%</p>
                <p className="text-xs text-gray-600">CTR</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center mt-3 pt-3 border-t border-blue-200">
              <div>
                <p className="text-xs text-gray-600">Impressions</p>
                <p className="font-semibold">0</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Clicks</p>
                <p className="font-semibold">0</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Conversions</p>
                <p className="font-semibold">0</p>
              </div>
            </div>
          </Card>

          {variants.map((variant) => {
            const ctr = calculateCTR(variant);
            const impressionShare = totalImpressions > 0 
              ? ((variant.impressions / totalImpressions) * 100).toFixed(1)
              : 0;

            return (
              <Card key={variant.id} className={`p-4 ${variant.is_active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{variant.variant_name}</p>
                      {variant.is_active ? (
                        <span className="text-xs px-2 py-0.5 bg-green-600 text-white rounded">Active</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 bg-gray-400 text-white rounded">Paused</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-1">{variant.title}</p>
                    {variant.cta_text && (
                      <p className="text-xs text-indigo-600 mt-1">CTA: "{variant.cta_text}"</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleMutation.mutate({ id: variant.id, is_active: !variant.is_active })}
                    >
                      {variant.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(variant.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Traffic Split</span>
                    <span className="font-semibold">{variant.traffic_percentage}%</span>
                  </div>
                  <Progress value={variant.traffic_percentage} className="h-2" />
                </div>

                <div className="grid grid-cols-4 gap-3 text-center mt-3 pt-3 border-t">
                  <div>
                    <p className="text-xs text-gray-600">CTR</p>
                    <p className="text-lg font-bold text-indigo-600">{ctr}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Views</p>
                    <p className="font-semibold">{variant.impressions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Clicks</p>
                    <p className="font-semibold">{variant.clicks}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Conv.</p>
                    <p className="font-semibold">{variant.conversions}</p>
                  </div>
                </div>

                {totalImpressions > 0 && (
                  <div className="mt-2 pt-2 border-t text-xs text-gray-600">
                    Getting {impressionShare}% of total traffic
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showCreateVariant} onOpenChange={setShowCreateVariant}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Variant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Variant Name</Label>
              <Input
                placeholder="e.g., Version A, Red Button, Hero with Video"
                value={newVariant.variant_name}
                onChange={(e) => setNewVariant({ ...newVariant, variant_name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={newVariant.title}
                  onChange={(e) => setNewVariant({ ...newVariant, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input
                  value={newVariant.subtitle}
                  onChange={(e) => setNewVariant({ ...newVariant, subtitle: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={newVariant.description}
                onChange={(e) => setNewVariant({ ...newVariant, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>CTA Button Text</Label>
                <Input
                  placeholder="e.g., Get Started, Learn More"
                  value={newVariant.cta_text}
                  onChange={(e) => setNewVariant({ ...newVariant, cta_text: e.target.value })}
                />
              </div>
              <div>
                <Label>CTA Link</Label>
                <Input
                  placeholder="/signup"
                  value={newVariant.cta_link}
                  onChange={(e) => setNewVariant({ ...newVariant, cta_link: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Traffic Percentage</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={newVariant.traffic_percentage}
                onChange={(e) => setNewVariant({ ...newVariant, traffic_percentage: parseInt(e.target.value) })}
              />
              <p className="text-xs text-gray-500 mt-1">What % of visitors should see this variant</p>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setShowCreateVariant(false)}>Cancel</Button>
              <Button 
                onClick={() => createMutation.mutate(newVariant)}
                disabled={!newVariant.variant_name}
              >
                Create Variant
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}