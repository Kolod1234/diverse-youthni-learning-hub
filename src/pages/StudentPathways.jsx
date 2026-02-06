import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { BookOpen, CheckCircle, Circle, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';
import PDFViewer from '@/components/library/PDFViewer';

export default function StudentPathways() {
  const [user, setUser] = useState(null);
  const [selectedPathway, setSelectedPathway] = useState(null);
  const [viewingResource, setViewingResource] = useState(null);
  const [showViewer, setShowViewer] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: pathways = [] } = useQuery({
    queryKey: ['published-pathways'],
    queryFn: () => base44.entities.LearningPathway.filter({ is_published: true }, '-created_date', 100)
  });

  const { data: myProgress = [] } = useQuery({
    queryKey: ['my-pathway-progress', user?.email],
    queryFn: () => base44.entities.PathwayProgress.filter({ user_email: user.email }, '-updated_date', 100),
    enabled: !!user
  });

  const { data: pathwayResources = [] } = useQuery({
    queryKey: ['pathway-resources', selectedPathway?.id],
    queryFn: () => base44.entities.PathwayResource.filter({ pathway_id: selectedPathway.id }, 'order', 100),
    enabled: !!selectedPathway
  });

  const { data: resources = [] } = useQuery({
    queryKey: ['library-resources'],
    queryFn: () => base44.entities.LibraryResource.list('-created_date', 500)
  });

  const startPathwayMutation = useMutation({
    mutationFn: (pathway_id) => base44.entities.PathwayProgress.create({
      pathway_id,
      user_email: user.email,
      completed_resources: [],
      progress_percent: 0,
      started_date: new Date().toISOString(),
      is_completed: false
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-pathway-progress']);
      toast.success('Pathway started!');
    }
  });

  const markResourceCompleteMutation = useMutation({
    mutationFn: async ({ progressId, resourceId, totalResources }) => {
      const progress = myProgress.find(p => p.id === progressId);
      const completed = [...progress.completed_resources, resourceId];
      const percent = Math.round((completed.length / totalResources) * 100);
      const isComplete = percent === 100;

      return base44.entities.PathwayProgress.update(progressId, {
        completed_resources: completed,
        progress_percent: percent,
        is_completed: isComplete,
        completed_date: isComplete ? new Date().toISOString() : progress.completed_date
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-pathway-progress']);
      toast.success('Progress updated!');
    }
  });

  const getPathwayProgress = (pathwayId) => {
    return myProgress.find(p => p.pathway_id === pathwayId);
  };

  const handleViewResource = (resource) => {
    setViewingResource(resource);
    setShowViewer(true);
  };

  const handleDownloadResource = async (resource) => {
    try {
      await base44.entities.LibraryResource.update(resource.id, {
        downloads_count: (resource.downloads_count || 0) + 1
      });
      window.open(resource.file_url, '_blank');
    } catch (error) {
      window.open(resource.file_url, '_blank');
    }
  };

  const handleMarkComplete = (resourceId) => {
    const progress = getPathwayProgress(selectedPathway.id);
    if (!progress) {
      toast.error('Start the pathway first');
      return;
    }

    if (progress.completed_resources.includes(resourceId)) {
      toast.info('Already marked as complete');
      return;
    }

    markResourceCompleteMutation.mutate({
      progressId: progress.id,
      resourceId,
      totalResources: pathwayResources.length
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Learning Pathways</h1>

        {/* My Active Pathways */}
        {myProgress.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Active Pathways</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProgress.map((progress) => {
                const pathway = pathways.find(p => p.id === progress.pathway_id);
                if (!pathway) return null;
                return (
                  <Card key={progress.id} className="p-6">
                    {pathway.cover_image && (
                      <img src={pathway.cover_image} alt={pathway.title} className="w-full h-32 object-cover rounded-lg mb-4" />
                    )}
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{pathway.title}</h3>
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-semibold text-indigo-600">{progress.progress_percent}%</span>
                      </div>
                      <Progress value={progress.progress_percent} className="h-2" />
                    </div>
                    {progress.is_completed && (
                      <Badge className="mb-3 bg-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                    <Button
                      onClick={() => setSelectedPathway(pathway)}
                      className="w-full"
                      variant={progress.is_completed ? "outline" : "default"}
                    >
                      {progress.is_completed ? 'Review' : 'Continue'}
                    </Button>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* All Available Pathways */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Pathways</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pathways.map((pathway) => {
              const progress = getPathwayProgress(pathway.id);
              const isStarted = !!progress;
              return (
                <Card key={pathway.id} className="p-6 hover:shadow-lg transition-shadow">
                  {pathway.cover_image && (
                    <img src={pathway.cover_image} alt={pathway.title} className="w-full h-32 object-cover rounded-lg mb-4" />
                  )}
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{pathway.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{pathway.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">{pathway.difficulty}</Badge>
                    {pathway.estimated_hours > 0 && (
                      <Badge variant="outline">{pathway.estimated_hours}h</Badge>
                    )}
                    {isStarted && (
                      <Badge className="bg-indigo-600">{progress.progress_percent}% Complete</Badge>
                    )}
                  </div>
                  <Button
                    onClick={() => {
                      if (!isStarted) {
                        startPathwayMutation.mutate(pathway.id);
                      }
                      setSelectedPathway(pathway);
                    }}
                    className="w-full"
                    variant={isStarted ? "default" : "outline"}
                  >
                    {isStarted ? 'View Progress' : 'Start Pathway'}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>

        {pathways.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No pathways available yet</p>
          </div>
        )}
      </div>

      {/* Pathway Detail Dialog */}
      <Dialog open={!!selectedPathway} onOpenChange={() => setSelectedPathway(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedPathway && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedPathway.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                {selectedPathway.cover_image && (
                  <img src={selectedPathway.cover_image} alt={selectedPathway.title} className="w-full h-48 object-cover rounded-lg" />
                )}
                <p className="text-gray-600">{selectedPathway.description}</p>

                {(() => {
                  const progress = getPathwayProgress(selectedPathway.id);
                  return progress && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Overall Progress</span>
                        <span className="text-indigo-600 font-semibold">{progress.progress_percent}%</span>
                      </div>
                      <Progress value={progress.progress_percent} className="h-3" />
                    </div>
                  );
                })()}

                <div>
                  <h3 className="font-semibold text-lg mb-4">Resources ({pathwayResources.length})</h3>
                  <div className="space-y-3">
                    {pathwayResources.map((pr, index) => {
                      const resource = resources.find(r => r.id === pr.resource_id);
                      if (!resource) return null;
                      const progress = getPathwayProgress(selectedPathway.id);
                      const isCompleted = progress?.completed_resources.includes(resource.id);
                      return (
                        <Card key={pr.id} className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              {isCompleted ? (
                                <CheckCircle className="w-6 h-6 text-green-600" />
                              ) : (
                                <Circle className="w-6 h-6 text-gray-300" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold text-gray-900">{index + 1}. {resource.title}</h4>
                                  <p className="text-sm text-gray-600">{resource.author}</p>
                                  {pr.notes && (
                                    <p className="text-sm text-gray-500 mt-1 italic">{pr.notes}</p>
                                  )}
                                </div>
                                <Badge variant={pr.is_required ? "default" : "secondary"}>
                                  {pr.is_required ? 'Required' : 'Optional'}
                                </Badge>
                              </div>
                              <div className="flex gap-2 mt-3">
                                <Button size="sm" variant="outline" onClick={() => handleViewResource(resource)}>
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleDownloadResource(resource)}>
                                  <Download className="w-4 h-4 mr-1" />
                                  Download
                                </Button>
                                {!isCompleted && (
                                  <Button size="sm" onClick={() => handleMarkComplete(resource.id)}>
                                    Mark Complete
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Resource Viewer */}
      <Dialog open={showViewer} onOpenChange={setShowViewer}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-[95vh] p-0">
          {viewingResource && (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">{viewingResource.title}</h3>
                <Button variant="ghost" onClick={() => setShowViewer(false)}>×</Button>
              </div>
              <div className="flex-1">
                <PDFViewer fileUrl={viewingResource.file_url} title={viewingResource.title} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}