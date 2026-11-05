import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Box, Container, Typography, Chip, Button, Card, CardMedia, CircularProgress
} from '@mui/material';
import { ArrowLeft, ExternalLink, Tag, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: project, isLoading } = useQuery({
    queryKey: ['project-submission', id],
    queryFn: () => base44.entities.ProjectSubmission.get(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5" fontWeight={700}>Project not found</Typography>
        <Button onClick={() => navigate('/project-gallery')} startIcon={<ArrowLeft size={16} />}>Back to Gallery</Button>
      </Box>
    );
  }

  const isYouTube = project.video_url && (project.video_url.includes('youtube') || project.video_url.includes('youtu.be'));
  const getYouTubeEmbed = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero */}
      <Box sx={{
        background: 'linear-gradient(135deg, #0b2f5c 0%, #1a0d60 50%, #4a0080 100%)',
        py: { xs: 6, md: 8 },
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'radial-gradient(circle at 20% 50%, #ec4899 0%, transparent 50%), radial-gradient(circle at 80% 50%, #3b82f6 0%, transparent 50%)' }} />
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Button
            startIcon={<ArrowLeft size={16} />}
            onClick={() => navigate('/project-gallery')}
            sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, '&:hover': { color: 'white' } }}
          >
            Back to Gallery
          </Button>
          <motion.div>
            {project.category && (
              <Chip label={project.category} icon={<Tag size={12} />} sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 600, border: '1px solid rgba(255,255,255,0.3)' }} />
            )}
            <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 900, color: 'white', mb: 2 }}>
              {project.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'rgba(255,255,255,0.7)' }}>
              <User size={16} />
              <Typography variant="body1">By {project.submitter_name}</Typography>
            </Box>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4 }}>
          {/* Main Content */}
          <Box>
            {/* Media */}
            {project.video_url ? (
              <Box sx={{ borderRadius: 4, overflow: 'hidden', mb: 4, aspectRatio: '16/9', bgcolor: '#000' }}>
                {isYouTube ? (
                  <iframe
                    src={getYouTubeEmbed(project.video_url)}
                    title={project.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  />
                ) : (
                  <video src={project.video_url} controls style={{ width: '100%', height: '100%' }} />
                )}
              </Box>
            ) : project.image_url ? (
              <Card sx={{ borderRadius: 4, overflow: 'hidden', mb: 4 }}>
                <CardMedia component="img" image={project.image_url} alt={project.title} sx={{ maxHeight: 450, objectFit: 'cover' }} />
              </Card>
            ) : null}

            {/* Description */}
            <Card sx={{ borderRadius: 4, p: 4, border: 1, borderColor: 'divider', mb: 3 }}>
              <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>About This Project</Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>
                {project.long_description || project.description || 'No description provided.'}
              </Typography>
            </Card>

            {/* Why Showcase */}
            {project.why_showcase && (
              <Card sx={{ borderRadius: 4, p: 4, border: 1, borderColor: 'divider', bgcolor: 'rgba(124,58,237,0.04)' }}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>✨ Why It Was Featured</Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>{project.why_showcase}</Typography>
              </Card>
            )}
          </Box>

          {/* Sidebar */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Project Link */}
            {project.project_link && (
              <Card sx={{ borderRadius: 4, p: 3, border: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>🔗 Project Link</Typography>
                <Button
                  variant="contained"
                  fullWidth
                  endIcon={<ExternalLink size={16} />}
                  href={project.project_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  component="a"
                  sx={{ background: 'linear-gradient(to right, #0b2f5c, #7c3aed)', color: 'white', borderRadius: 50, fontWeight: 700 }}
                >
                  View Project
                </Button>
              </Card>
            )}

            {/* Skills */}
            {project.skills?.length > 0 && (
              <Card sx={{ borderRadius: 4, p: 3, border: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>🛠️ Skills Used</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {project.skills.map(skill => (
                    <Chip key={skill} label={skill} sx={{ background: 'linear-gradient(135deg, #0b2f5c, #7c3aed)', color: 'white', fontWeight: 600 }} />
                  ))}
                </Box>
              </Card>
            )}

            {/* Category */}
            {project.category && (
              <Card sx={{ borderRadius: 4, p: 3, border: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>📁 Category</Typography>
                <Chip label={project.category} sx={{ fontWeight: 600 }} />
              </Card>
            )}

            {/* Submitter */}
            <Card sx={{ borderRadius: 4, p: 3, border: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>👤 Creator</Typography>
              <Typography color="text.secondary">{project.submitter_name}</Typography>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}