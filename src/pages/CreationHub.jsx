import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Box, Container, Typography, Chip, Card, CardContent, Button,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Alert
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Palette, Code2, Leaf, Bot, Cpu, Globe, Users,
  ArrowLeft, Plus, Send, X
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const PROJECTS = [
  {
    id: 'mental-health',
    title: 'Mental Health & Wellbeing',
    description: 'Learners explore emotional resilience, mindfulness techniques, and peer support initiatives that create positive mental health communities.',
    longDescription: 'Our Mental Health & Wellbeing projects empower learners to understand and talk openly about mental health. From creating mindfulness apps to designing peer support networks, learners develop empathy, emotional intelligence, and communication skills. Projects include journaling apps, school wellbeing campaigns, and community mental health awareness events.',
    icon: Heart,
    gradient: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
    lightBg: 'rgba(244, 114, 182, 0.08)',
    border: 'rgba(244, 114, 182, 0.25)',
    emoji: '💚',
    examples: ['Peer Support Network App', 'Mindfulness Journal', 'Wellbeing Campaign Posters', 'School Mental Health Day'],
    skills: ['Empathy', 'Communication', 'Design Thinking', 'Research'],
  },
  {
    id: 'arts',
    title: 'Arts & Creativity',
    description: 'From digital design to painting, photography, and music — learners express themselves and develop their creative voice.',
    longDescription: 'Arts & Creativity projects let learners explore their imagination through a wide range of mediums. Whether it\'s digital illustration, photography, music production, or traditional painting, these projects build creative confidence and technical skill. Learners showcase their work in community galleries and exhibitions.',
    icon: Palette,
    gradient: 'linear-gradient(135deg, #fb923c 0%, #f59e0b 100%)',
    lightBg: 'rgba(251, 146, 60, 0.08)',
    border: 'rgba(251, 146, 60, 0.25)',
    emoji: '🎨',
    examples: ['Digital Illustration Portfolio', 'Photography Exhibition', 'Music Production EP', 'Mural Design Project'],
    skills: ['Creative Thinking', 'Digital Tools', 'Self-Expression', 'Portfolio Building'],
  },
  {
    id: 'programming',
    title: 'Programming Projects',
    description: 'Learners build real web apps, games, and scripts — developing logical thinking through hands-on coding.',
    longDescription: 'Programming Projects give learners the skills to build real, functional software. From web applications to games and automation scripts, learners work with modern languages like Python, JavaScript, and HTML/CSS. Projects are often presented at our annual tech showcase.',
    icon: Code2,
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    lightBg: 'rgba(59, 130, 246, 0.08)',
    border: 'rgba(59, 130, 246, 0.25)',
    emoji: '💻',
    examples: ['Quiz Web App', 'Python Game', 'School Calendar Tool', 'Budget Tracker App'],
    skills: ['Python', 'JavaScript', 'HTML/CSS', 'Problem Solving'],
  },
  {
    id: 'climate',
    title: 'Climate Action',
    description: 'Inspiring the next generation of environmental leaders through research, campaigns, and sustainable innovation.',
    longDescription: 'Climate Action projects equip learners with the knowledge and tools to fight climate change at a local and global level. From conducting energy audits of their schools to designing awareness campaigns and researching renewable energy, learners develop as responsible global citizens.',
    icon: Leaf,
    gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    lightBg: 'rgba(34, 197, 94, 0.08)',
    border: 'rgba(34, 197, 94, 0.25)',
    emoji: '🌍',
    examples: ['School Energy Audit', 'Climate Awareness Poster Series', 'Urban Garden Project', 'Recycling Initiative'],
    skills: ['Research', 'Environmental Science', 'Campaign Design', 'Leadership'],
  },
  {
    id: 'ai',
    title: 'AI Building',
    description: 'Learners design, train, and deploy their own AI tools — experiencing the cutting edge of technology.',
    longDescription: 'AI Building projects introduce learners to the world of artificial intelligence in a hands-on way. Using tools like Teachable Machine, Python, and cloud AI APIs, learners build chatbots, image classifiers, and recommendation systems — understanding both the power and ethics of AI.',
    icon: Bot,
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    lightBg: 'rgba(139, 92, 246, 0.08)',
    border: 'rgba(139, 92, 246, 0.25)',
    emoji: '🤖',
    examples: ['Image Classifier', 'Study Chatbot', 'AI Recommendation Tool', 'Voice Assistant'],
    skills: ['Python', 'Machine Learning', 'Data Literacy', 'Ethics'],
  },
  {
    id: 'raspberry-pi',
    title: 'Raspberry Pi Projects',
    description: 'Hands-on hardware meets software — from weather stations to smart home devices using Raspberry Pi.',
    longDescription: 'Raspberry Pi Projects bridge the gap between physical computing and software development. Learners solder, wire, and code their own devices — gaining a deep understanding of how computers work at a hardware level. Projects often solve real-world problems in creative ways.',
    icon: Cpu,
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    lightBg: 'rgba(239, 68, 68, 0.08)',
    border: 'rgba(239, 68, 68, 0.25)',
    emoji: '🍓',
    examples: ['Weather Station', 'Smart Plant Waterer', 'Retro Gaming Console', 'Home Security Camera'],
    skills: ['Electronics', 'Python', 'Linux', 'Physical Computing'],
  },
  {
    id: 'cultural',
    title: 'Cultural Sensitivity',
    description: 'Projects that celebrate diversity, foster inclusion, and build cross-cultural understanding.',
    longDescription: 'Cultural Sensitivity projects help learners explore and celebrate the diverse world around them. Through storytelling, research, and creative collaboration, learners build empathy and respect for different cultures. Projects include multicultural festivals, digital documentaries, and cross-school exchange programmes.',
    icon: Globe,
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    lightBg: 'rgba(6, 182, 212, 0.08)',
    border: 'rgba(6, 182, 212, 0.25)',
    emoji: '🌏',
    examples: ['Multicultural Festival', 'Digital Documentary', 'Languages Showcase', 'Food & Culture Exhibition'],
    skills: ['Intercultural Competence', 'Research', 'Storytelling', 'Collaboration'],
  },
  {
    id: 'community',
    title: 'Community Development',
    description: 'Learners lead local initiatives, volunteer programmes, and social enterprises that make a real difference.',
    longDescription: 'Community Development projects give learners the confidence and skills to lead meaningful change in their local areas. From organising food drives to launching social enterprises and youth councils, these projects build leadership, civic responsibility, and entrepreneurial thinking.',
    icon: Users,
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    lightBg: 'rgba(245, 158, 11, 0.08)',
    border: 'rgba(245, 158, 11, 0.25)',
    emoji: '🤝',
    examples: ['Food Bank Drive', 'Youth Council Initiative', 'Social Enterprise', 'Community Clean-Up'],
    skills: ['Leadership', 'Event Management', 'Fundraising', 'Communication'],
  },
];

const ALL_CATEGORIES = ['All', ...PROJECTS.map(p => p.title)];

const EMPTY_FORM = { name: '', email: '', projectTitle: '', category: '', description: '', whyShowcase: '' };

export default function CreationHub() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const filtered = activeCategory === 'All'
    ? PROJECTS
    : PROJECTS.filter(p => p.title === activeCategory);

  const handleFormChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.projectTitle || !formData.description) {
      setSnackbar({ open: true, message: 'Please fill in all required fields.', severity: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.ProjectSubmission.create({
        title: formData.projectTitle,
        category: formData.category,
        description: formData.description,
        why_showcase: formData.whyShowcase,
        submitter_name: formData.name,
        submitter_email: formData.email,
        status: 'pending',
      });
      await base44.integrations.Core.SendEmail({
        to: 'admin@diverseyouthni.com',
        subject: `New Creation Hub Submission: ${formData.projectTitle}`,
        body: `Name: ${formData.name}\nEmail: ${formData.email}\nProject: ${formData.projectTitle}\nCategory: ${formData.category}\n\nDescription:\n${formData.description}\n\nWhy Showcase:\n${formData.whyShowcase}`,
        from_name: 'Creation Hub',
      });
      setSnackbar({ open: true, message: 'Your project has been submitted! We\'ll be in touch.', severity: 'success' });
      setFormData(EMPTY_FORM);
      setShowForm(false);
    } catch {
      setSnackbar({ open: true, message: 'Submission failed. Please try again.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero */}
      <Box sx={{
        background: 'linear-gradient(135deg, #003366 0%, #1a0d60 50%, #4a0080 100%)',
        py: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'radial-gradient(circle at 20% 50%, #ec4899 0%, transparent 50%), radial-gradient(circle at 80% 50%, #3b82f6 0%, transparent 50%)' }} />
        <Container maxWidth="xl" sx={{ position: 'relative' }}>
          <Link to={createPageUrl('Home')} style={{ textDecoration: 'none' }}>
            <Button startIcon={<ArrowLeft size={16} />} sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, '&:hover': { color: 'white' } }}>
              Back to Home
            </Button>
          </Link>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Chip label="🛠️ Open to Everyone" sx={{ px: 2, py: 1, bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 700, mb: 3, height: 'auto', border: '1px solid rgba(255,255,255,0.3)' }} />
            <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, fontWeight: 900, color: 'white', mb: 2, letterSpacing: '-0.02em' }}>
              Creation Hub 🚀
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: { xs: '1rem', md: '1.25rem' }, maxWidth: 600, lineHeight: 1.7, mb: 4 }}>
              Discover what our learners are building, creating, and launching — real projects that make real impact across 8 exciting categories.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<Plus size={18} />}
              onClick={() => setShowForm(true)}
              sx={{ bgcolor: '#fbbf24', color: '#003366', fontWeight: 800, px: 4, py: 1.5, borderRadius: 50, '&:hover': { bgcolor: '#fcd34d' } }}
            >
              Submit Your Project
            </Button>
            <Link to="/project-gallery" style={{ textDecoration: 'none' }}>
              <Button variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', fontWeight: 700, px: 4, py: 1.5, borderRadius: 50, ml: 2, '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                View Project Gallery
              </Button>
            </Link>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 8 }}>
        {/* Category Filter */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Filter by Category</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {ALL_CATEGORIES.map(cat => (
              <Chip
                key={cat}
                label={cat}
                onClick={() => setActiveCategory(cat)}
                sx={{
                  px: 2,
                  py: 0.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  bgcolor: activeCategory === cat ? '#003366' : 'transparent',
                  color: activeCategory === cat ? 'white' : 'text.primary',
                  border: activeCategory === cat ? '2px solid #003366' : '2px solid',
                  borderColor: activeCategory === cat ? '#003366' : 'divider',
                  '&:hover': { bgcolor: activeCategory === cat ? '#002244' : 'action.hover' },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Project Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3, overflow: 'visible' }}>
          <AnimatePresence mode="popLayout">
            {filtered.map((project, idx) => {
              const Icon = project.icon;
              return (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}

                  style={{ cursor: 'pointer', position: 'relative', zIndex: 1 }}
                  whileHover={{ y: -8, zIndex: 10 }}
                  onClick={() => setSelectedProject(project)}
                >
                  <Card sx={{
                    height: '100%',
                    borderRadius: 4,
                    border: `1.5px solid ${project.border}`,
                    bgcolor: project.lightBg,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
                    '&:hover': { boxShadow: '0 16px 48px rgba(0,0,0,0.14)', borderColor: project.border.replace('0.25', '0.5') },
                    transition: 'all 0.3s',
                  }}>
                    <Box sx={{ height: 5, background: project.gradient, borderRadius: '16px 16px 0 0' }} />
                    <CardContent sx={{ p: 3.5 }}>
                      <Box sx={{ width: 56, height: 56, borderRadius: 3, background: project.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5, boxShadow: `0 8px 20px ${project.border.replace('0.25', '0.4')}` }}>
                        <Icon size={26} color="white" strokeWidth={2} />
                      </Box>
                      <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5, color: 'text.primary', fontSize: '1rem' }}>
                        {project.emoji} {project.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 2 }}>
                        {project.description}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                        Click to explore →
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </Box>

        {/* CTA Banner */}
        <Box sx={{ mt: 10, background: 'linear-gradient(135deg, #003366 0%, #7c3aed 100%)', borderRadius: 6, p: { xs: 4, md: 6 }, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 20% 50%, white 0%, transparent 60%), radial-gradient(circle at 80% 50%, white 0%, transparent 60%)' }} />
          <Box sx={{ position: 'relative' }}>
            <Typography variant="h4" fontWeight={800} sx={{ color: 'white', mb: 2 }}>Have a project idea? 💡</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 3, maxWidth: 500, mx: 'auto' }}>
              Submit your project to be featured in the Creation Hub and inspire other learners across the platform.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<Send size={18} />}
              onClick={() => setShowForm(true)}
              sx={{ bgcolor: '#fbbf24', color: '#003366', fontWeight: 800, px: 4, py: 1.5, borderRadius: 50, '&:hover': { bgcolor: '#fcd34d' } }}
            >
              Submit Your Project
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Category Detail Dialog */}
      <Dialog open={!!selectedProject} onClose={() => setSelectedProject(null)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}>
        {selectedProject && (() => {
          const Icon = selectedProject.icon;
          return (
            <>
              <Box sx={{ height: 8, background: selectedProject.gradient }} />
              <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: selectedProject.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={22} color="white" />
                  </Box>
                  <Typography variant="h5" fontWeight={800}>{selectedProject.emoji} {selectedProject.title}</Typography>
                </Box>
                <Button onClick={() => setSelectedProject(null)} sx={{ minWidth: 0, p: 1 }}><X size={20} /></Button>
              </DialogTitle>
              <DialogContent>
                <Typography sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 3 }}>{selectedProject.longDescription}</Typography>

                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>📌 Example Projects</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {selectedProject.examples.map(ex => (
                    <Chip key={ex} label={ex} sx={{ bgcolor: selectedProject.lightBg, border: `1px solid ${selectedProject.border}`, fontWeight: 500 }} />
                  ))}
                </Box>

                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>🛠️ Skills Developed</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedProject.skills.map(skill => (
                    <Chip key={skill} label={skill} sx={{ background: selectedProject.gradient, color: 'white', fontWeight: 600 }} />
                  ))}
                </Box>
              </DialogContent>
              <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
                <Button onClick={() => setSelectedProject(null)} variant="outlined">Close</Button>
                <Button
                  variant="contained"
                  startIcon={<Send size={16} />}
                  onClick={() => { setSelectedProject(null); setFormData(prev => ({ ...prev, category: selectedProject.title })); setShowForm(true); }}
                  sx={{ background: selectedProject.gradient, color: 'white' }}
                >
                  Submit a Project in This Category
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>

      {/* Submission Form Dialog */}
      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <Box sx={{ height: 6, background: 'linear-gradient(to right, #003366, #7c3aed, #ec4899)' }} />
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.4rem' }}>
          🚀 Submit Your Project
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Share your project idea or showcase something you've already built. We'll review it and feature it in the Creation Hub!
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Your Name *" value={formData.name} onChange={e => handleFormChange('name', e.target.value)} fullWidth size="small" />
            <TextField label="Your Email *" value={formData.email} onChange={e => handleFormChange('email', e.target.value)} fullWidth size="small" type="email" />
            <TextField label="Project Title *" value={formData.projectTitle} onChange={e => handleFormChange('projectTitle', e.target.value)} fullWidth size="small" />
            <Box>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: 'text.secondary' }}>Category</Typography>
              <select
                value={formData.category}
                onChange={e => handleFormChange('category', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ccc', fontSize: 14, background: 'white', color: formData.category ? '#1a1a1a' : '#9ca3af', outline: 'none' }}
              >
                <option value="">Select a category...</option>
                {PROJECTS.map(p => <option key={p.id} value={p.title}>{p.title}</option>)}
              </select>
            </Box>
            <TextField
              label="Project Description *"
              value={formData.description}
              onChange={e => handleFormChange('description', e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={4}
              placeholder="Tell us what your project is about, what problem it solves, and how you built it..."
            />
            <TextField
              label="Why should it be showcased?"
              value={formData.whyShowcase}
              onChange={e => handleFormChange('whyShowcase', e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={3}
              placeholder="What impact does it have? What makes it special?"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={() => setShowForm(false)} variant="outlined">Cancel</Button>
          <Button
            variant="contained"
            startIcon={<Send size={16} />}
            onClick={handleSubmit}
            disabled={submitting}
            sx={{ background: 'linear-gradient(to right, #003366, #7c3aed)', color: 'white' }}
          >
            {submitting ? 'Submitting...' : 'Submit Project'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}