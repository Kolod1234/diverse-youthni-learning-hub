import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Container, Card, Box, Typography, Tabs, Tab, Grid, Button, Chip } from '@mui/material';
import { Users, FolderKanban, MessageSquare, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CollaborationHub() {
  const [activeTab, setActiveTab] = useState(0);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: myProjects = [] } = useQuery({
    queryKey: ['my-group-projects', user?.email],
    queryFn: async () => {
      const allProjects = await base44.entities.GroupProject.list('-created_date', 50);
      return allProjects.filter(p => 
        p.team_members?.some(m => m.email === user.email)
      );
    },
    enabled: !!user
  });

  const { data: myReviews = [] } = useQuery({
    queryKey: ['my-peer-reviews', user?.email],
    queryFn: () => base44.entities.PeerReview.filter({ reviewer_email: user.email }, '-created_date', 20),
    enabled: !!user
  });

  const { data: receivedReviews = [] } = useQuery({
    queryKey: ['received-peer-reviews', user?.email],
    queryFn: () => base44.entities.PeerReview.filter({ reviewee_email: user.email }, '-created_date', 20),
    enabled: !!user
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          Collaboration Hub
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Work together, share feedback, and grow as a team
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab icon={<FolderKanban className="w-4 h-4" />} label="Group Projects" />
          <Tab icon={<Award className="w-4 h-4" />} label="Peer Reviews Given" />
          <Tab icon={<MessageSquare className="w-4 h-4" />} label="Feedback Received" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {myProjects.map((project) => (
            <Grid item xs={12} md={6} lg={4} key={project.id}>
              <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" sx={{ flex: 1 }}>{project.title}</Typography>
                  <Chip 
                    label={project.status} 
                    size="small"
                    color={project.status === 'completed' ? 'success' : 'primary'}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                  {project.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
                  {project.team_members?.slice(0, 3).map((member, idx) => (
                    <Chip key={idx} label={member.name} size="small" />
                  ))}
                  {project.team_members?.length > 3 && (
                    <Chip label={`+${project.team_members.length - 3} more`} size="small" />
                  )}
                </Box>
                <Button
                  variant="contained"
                  component={Link}
                  to={createPageUrl('GroupProjectWorkspace') + `?id=${project.id}`}
                  fullWidth
                >
                  Open Workspace
                </Button>
              </Card>
            </Grid>
          ))}
          {myProjects.length === 0 && (
            <Grid item xs={12}>
              <Card sx={{ p: 4, textAlign: 'center' }}>
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <Typography color="text.secondary">No group projects yet</Typography>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {myReviews.map((review) => (
            <Grid item xs={12} md={6} key={review.id}>
              <Card sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Review for {review.reviewee_email}
                  </Typography>
                  <Chip label={`${review.rating}/5`} color="primary" />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {review.feedback}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(review.created_date).toLocaleDateString()}
                </Typography>
              </Card>
            </Grid>
          ))}
          {myReviews.length === 0 && (
            <Grid item xs={12}>
              <Card sx={{ p: 4, textAlign: 'center' }}>
                <Award className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <Typography color="text.secondary">No peer reviews given yet</Typography>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          {receivedReviews.map((review) => (
            <Grid item xs={12} md={6} key={review.id}>
              <Card sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {review.is_anonymous ? 'Anonymous Reviewer' : `From ${review.reviewer_name}`}
                  </Typography>
                  <Chip label={`${review.rating}/5`} color="success" />
                </Box>
                {review.strengths?.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" fontWeight="bold" color="success.main">Strengths:</Typography>
                    {review.strengths.map((s, idx) => (
                      <Typography key={idx} variant="body2" sx={{ ml: 1 }}>• {s}</Typography>
                    ))}
                  </Box>
                )}
                {review.improvements?.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" fontWeight="bold" color="warning.main">Areas to improve:</Typography>
                    {review.improvements.map((i, idx) => (
                      <Typography key={idx} variant="body2" sx={{ ml: 1 }}>• {i}</Typography>
                    ))}
                  </Box>
                )}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {review.feedback}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(review.created_date).toLocaleDateString()}
                </Typography>
              </Card>
            </Grid>
          ))}
          {receivedReviews.length === 0 && (
            <Grid item xs={12}>
              <Card sx={{ p: 4, textAlign: 'center' }}>
                <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <Typography color="text.secondary">No feedback received yet</Typography>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
    </Container>
  );
}