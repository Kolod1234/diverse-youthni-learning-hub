import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Chip, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { Check, ChevronRight, FlaskConical, Gauge, ShieldCheck } from 'lucide-react';

const features = [
  { icon: FlaskConical, title: 'Operate the equipment', text: 'Prepare glassware, control a burette and judge an endpoint yourself.' },
  { icon: ShieldCheck, title: 'Learn safely', text: 'Unsafe or inaccurate decisions produce clear, scientifically correct feedback.' },
  { icon: Gauge, title: 'Measure accurately', text: 'Record rough and accurate titres, then identify concordant results.' },
];

export default function CreationHubSection() {
  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#071a2d', color: 'white', overflow: 'hidden' }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '0.95fr 1.05fr' }, gap: { xs: 6, lg: 10 }, alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <Chip
              label="🧪 Interactive science"
              sx={{ mb: 3, bgcolor: 'rgba(37,198,218,.13)', color: '#6ee7e0', border: '1px solid rgba(110,231,224,.28)', fontWeight: 800 }}
            />
            <Typography variant="h2" sx={{ fontSize: { xs: '2.4rem', md: '4rem' }, fontWeight: 900, letterSpacing: '-.04em', lineHeight: 1.02, mb: 2 }}>
              Step inside the<br /><Box component="span" sx={{ color: '#ff9b25' }}>Virtual Laboratory</Box>
            </Typography>
            <Typography sx={{ color: '#b8d0dc', fontSize: { xs: '1rem', md: '1.18rem' }, lineHeight: 1.7, maxWidth: 650, mb: 4 }}>
              Build practical confidence by carrying out experiments, making measurements and learning from realistic consequences—not by watching a demonstration.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
              {['Guided practicals', 'Touch-friendly controls', 'Progress saved'].map(item => (
                <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#d7e8ee', fontSize: '.9rem' }}>
                  <Check size={16} color="#27cabb" /> {item}
                </Box>
              ))}
            </Box>
            <Link to="/laboratory" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                endIcon={<ChevronRight size={18} />}
                sx={{ bgcolor: '#ff9b25', color: '#102338', fontWeight: 900, px: 3.5, py: 1.5, borderRadius: 3, '&:hover': { bgcolor: '#ffad46' } }}
              >
                Enter the laboratory
              </Button>
            </Link>
          </motion.div>

          <Box sx={{ display: 'grid', gap: 2 }}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * .08 }}>
                  <Box sx={{ display: 'flex', gap: 2.2, alignItems: 'flex-start', p: { xs: 2.4, md: 3 }, borderRadius: 4, bgcolor: 'rgba(255,255,255,.055)', border: '1px solid rgba(255,255,255,.11)' }}>
                    <Box sx={{ width: 50, height: 50, borderRadius: 3, bgcolor: index === 1 ? 'rgba(255,155,37,.16)' : 'rgba(37,198,218,.15)', color: index === 1 ? '#ffad46' : '#60ded6', display: 'grid', placeItems: 'center', flex: '0 0 auto' }}>
                      <Icon size={24} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 850, mb: .7 }}>{feature.title}</Typography>
                      <Typography sx={{ color: '#a9c3cf', lineHeight: 1.55 }}>{feature.text}</Typography>
                    </Box>
                  </Box>
                </motion.div>
              );
            })}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
