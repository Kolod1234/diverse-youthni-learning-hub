import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  Box, Container, Typography, Chip, Card, CardContent, CardMedia,
  TextField, InputAdornment, Grid
} from '@mui/material';
import { Search, ExternalLink, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { activateOnKey } from '@/lib/a11y';

const CATEGORIES = ['All', 'Mental Health & Wellbeing', 'Arts & Creativity', 'Programming Projects',
  'Climate Action', 'AI Building', 'Raspberry Pi Projects', 'Cultural Sensitivity', 'Community Development'];

export default function ProjectGallery() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['project-submissions-approved'],
    queryFn: () => base44.entities.ProjectSubmission.filter({ status: 'approved' }, '-created_date', 100),
  });

  const filtered = projects.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.submitter_name?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero */}
      <Box sx={{
        background: 'linear-gradient(135deg, #0b2f5c 0%, #1a0d60 50%, #4a0080 100%)',
        py: { xs: 6, md: 10 },
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'radial-gradient(circle at 20% 50%, #ec4899 0%, transparent 50%), radial-gradient(circle at 80% 50%, #3b82f6 0%, transparent 50%)' }} />
        <Container maxWidth="xl" sx={{ position: 'relative', textAlign: 'center' }}>
          <motion.div>
            <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3.5rem' }, fontWeight: 900, color: 'white', mb: 2 }}>
              Project Showcase
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', mb: 4, maxWidth: 600, mx: 'auto' }}>
              Real projects built by real learners — browse, get inspired, and explore what's possible.
            </Typography>
            <TextField
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..."
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search size={16} color="#9ca3af" /></InputAdornment>,
                sx: { bgcolor: 'white', borderRadius: 50, maxWidth: 400, width: '100%' }
              }}
              sx={{ maxWidth: 400, width: '100%' }}
            />
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Category Filter */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 5 }}>
          {CATEGORIES.map(cat => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => setActiveCategory(cat)}
              sx={{
                fontWeight: 600,
                cursor: 'pointer',
                bgcolor: activeCategory === cat ? '#0b2f5c' : 'transparent',
                color: activeCategory === cat ? 'white' : 'text.primary',
                border: '2px solid',
                borderColor: activeCategory === cat ? '#0b2f5c' : 'divider',
                '&:hover': { bgcolor: activeCategory === cat ? '#082544' : 'action.hover' },
              }}
            />
          ))}
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
            {[...Array(6)].map((_, i) => (
              <Card key={i} sx={{ borderRadius: 4, overflow: 'hidden' }} className="animate-pulse">
                <Box sx={{ height: 200, bgcolor: 'action.hover' }} />
                <CardContent><Box sx={{ height: 20, bgcolor: 'action.hover', borderRadius: 1, mb: 1 }} /><Box sx={{ height: 14, bgcolor: 'action.hover', borderRadius: 1, width: '60%' }} /></CardContent>
              </Card>
            ))}
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>No projects found</Typography>
            <Typography color="text.secondary">Try a different search or category.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
            {filtered.map((project, idx) => (
              <motion.div role="button" tabIndex={0} onKeyDown={activateOnKey}
                key={project.id}
                whileHover={{ y: -6 }}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <Card sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', '&:hover': { boxShadow: '0 16px 48px rgba(0,0,0,0.15)' }, transition: 'all 0.3s', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {project.image_url ? (
                    <CardMedia component="img" image={project.image_url} alt={project.title} sx={{ height: 200, objectFit: 'cover' }} />
                  ) : project.video_url ? (
                    <Box sx={{ height: 200, bgcolor: '#1e1b4b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography sx={{ color: 'white', fontSize: '3rem' }}>🎬</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ height: 200, background: 'linear-gradient(135deg, #0b2f5c, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography sx={{ fontSize: '4rem' }}>🚀</Typography>
                    </Box>
                  )}
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    {project.category && (
                      <Chip label={project.category} size="small" icon={<Tag size={12} />} sx={{ mb: 1.5, fontSize: '0.7rem', fontWeight: 600 }} />
                    )}
                    <Typography variant="h6" fontWeight={800} sx={{ mb: 1, lineHeight: 1.3 }}>{project.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {project.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">By {project.submitter_name}</Typography>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}