import React from 'react';
import { Box, Container, Typography, Chip, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import { Heart, Palette, Code2, Leaf, Bot, Cpu, Globe, Users } from 'lucide-react';

const PROJECTS = [
  {
    title: 'Mental Health & Wellbeing',
    description: 'Learners explore emotional resilience, mindfulness techniques, and peer support initiatives that create positive mental health communities.',
    icon: Heart,
    gradient: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
    lightBg: 'rgba(244, 114, 182, 0.08)',
    border: 'rgba(244, 114, 182, 0.25)',
    emoji: '💚',
  },
  {
    title: 'Arts & Creativity',
    description: 'From digital design to painting, photography, and music — learners express themselves and develop their creative voice through hands-on artistic projects.',
    icon: Palette,
    gradient: 'linear-gradient(135deg, #fb923c 0%, #f59e0b 100%)',
    lightBg: 'rgba(251, 146, 60, 0.08)',
    border: 'rgba(251, 146, 60, 0.25)',
    emoji: '🎨',
  },
  {
    title: 'Programming Projects',
    description: 'Learners build real web apps, games, and scripts — developing logical thinking and problem-solving skills through hands-on coding challenges.',
    icon: Code2,
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    lightBg: 'rgba(59, 130, 246, 0.08)',
    border: 'rgba(59, 130, 246, 0.25)',
    emoji: '💻',
  },
  {
    title: 'Climate Action',
    description: 'Inspiring the next generation of environmental leaders through research, awareness campaigns, and sustainable innovation projects.',
    icon: Leaf,
    gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    lightBg: 'rgba(34, 197, 94, 0.08)',
    border: 'rgba(34, 197, 94, 0.25)',
    emoji: '🌍',
  },
  {
    title: 'AI Building',
    description: 'Learners design, train, and deploy their own AI tools — experiencing the cutting edge of technology and its real-world applications.',
    icon: Bot,
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    lightBg: 'rgba(139, 92, 246, 0.08)',
    border: 'rgba(139, 92, 246, 0.25)',
    emoji: '🤖',
  },
  {
    title: 'Raspberry Pi Projects',
    description: 'Hands-on hardware meets software as learners build physical computing projects — from weather stations to smart home devices using Raspberry Pi.',
    icon: Cpu,
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    lightBg: 'rgba(239, 68, 68, 0.08)',
    border: 'rgba(239, 68, 68, 0.25)',
    emoji: '🍓',
  },
  {
    title: 'Cultural Sensitivity',
    description: 'Projects that celebrate diversity, foster inclusion, and build cross-cultural understanding — helping learners thrive in a multicultural world.',
    icon: Globe,
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    lightBg: 'rgba(6, 182, 212, 0.08)',
    border: 'rgba(6, 182, 212, 0.25)',
    emoji: '🌏',
  },
  {
    title: 'Community Development',
    description: 'Learners lead local initiatives, volunteer programmes, and social enterprises that make a tangible difference in their communities.',
    icon: Users,
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    lightBg: 'rgba(245, 158, 11, 0.08)',
    border: 'rgba(245, 158, 11, 0.25)',
    emoji: '🤝',
  },
];

export default function CreationHubSection() {
  return (
    <Box
      component="section"
      sx={{
        py: 12,
        background: 'linear-gradient(180deg, rgba(0,51,102,0.04) 0%, rgba(124,58,237,0.06) 50%, rgba(0,51,102,0.04) 100%)',
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip
              label="🛠️ Open to Everyone"
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 50,
                background: 'linear-gradient(to right, rgba(124,58,237,0.12), rgba(236,72,153,0.12))',
                border: '2px solid rgba(124,58,237,0.3)',
                fontWeight: 700,
                fontSize: '0.9rem',
                mb: 3,
                height: 'auto',
                '& .MuiChip-label': {
                  background: 'linear-gradient(to right, #7c3aed, #ec4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                },
              }}
            />

            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2.25rem', md: '3.5rem' },
                fontWeight: 900,
                mb: 2,
                background: 'linear-gradient(to right, #003366, #7c3aed, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}
            >
              Creation Hub
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 680, mx: 'auto', lineHeight: 1.7, fontSize: { xs: '1rem', md: '1.2rem' } }}
            >
              Discover what our learners are building, creating, and launching — real projects that make real impact.
            </Typography>
          </Box>
        </motion.div>

        {/* Project Cards Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 3,
          }}
        >
          {PROJECTS.map((project, idx) => {
            const Icon = project.icon;
            return (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: idx * 0.07 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    border: `1.5px solid ${project.border}`,
                    bgcolor: project.lightBg,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
                    '&:hover': {
                      boxShadow: '0 16px 48px rgba(0,0,0,0.14)',
                      borderColor: project.border.replace('0.25', '0.5'),
                    },
                    transition: 'all 0.3s',
                    overflow: 'visible',
                    position: 'relative',
                  }}
                >
                  {/* Top gradient accent bar */}
                  <Box
                    sx={{
                      height: 5,
                      background: project.gradient,
                      borderRadius: '16px 16px 0 0',
                    }}
                  />

                  <CardContent sx={{ p: 3.5 }}>
                    {/* Icon */}
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 3,
                        background: project.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2.5,
                        boxShadow: `0 8px 20px ${project.border.replace('0.25', '0.4')}`,
                      }}
                    >
                      <Icon size={26} color="white" strokeWidth={2} />
                    </Box>

                    {/* Emoji + Title */}
                    <Typography
                      variant="h6"
                      fontWeight={800}
                      sx={{ mb: 1.5, color: 'text.primary', lineHeight: 1.25, fontSize: '1rem' }}
                    >
                      {project.emoji} {project.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.7, fontSize: '0.875rem' }}
                    >
                      {project.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </Box>

        {/* Bottom tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                fontSize: '1.05rem',
                fontStyle: 'italic',
              }}
            >
              Every learner is a creator. Every project is a step towards a better world. 🚀
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}