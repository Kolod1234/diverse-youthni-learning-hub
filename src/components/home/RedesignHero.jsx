import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Box, Button, Chip, Container, IconButton, Typography } from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

// Redesign hero: navy band, text on the left, the site's real hero photos on the right.
// Text comes from the same SiteContent keys the old hero used, so admins can still edit it.
// Photos with captions printed on them (e.g. "Coding classes") clash with the hero text.
// Add a file-name fragment here to keep a photo out of the hero.
const PHOTOS_WITH_WORDS = ['98873a707_'];

export default function RedesignHero({ images: allImages = [], user }) {
  const images = allImages.filter(img => !PHOTOS_WITH_WORDS.some(id => img.image_url?.includes(id)));
  // Motion review: the photos advance on their own only for people who haven't asked for reduced
  // motion, stop for good once someone interacts, pause under the mouse, and can always be paused.
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true },
    [Autoplay({ delay: 6000, playOnInit: !reduceMotion, stopOnInteraction: true, stopOnMouseEnter: true })]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(!reduceMotion);
  const togglePlay = () => {
    const autoplay = emblaApi?.plugins()?.autoplay;
    if (!autoplay) return;
    if (autoplay.isPlaying()) autoplay.stop(); else autoplay.play();
  };

  const { data: siteContent = [] } = useQuery({
    queryKey: ['site-content-hero'],
    queryFn: () => base44.entities.SiteContent.filter({ section: 'home' }, 'key', 50),
  });
  const get = (key, fallback) => siteContent.find(c => c.key === key)?.value || fallback;

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCurrent(emblaApi.selectedScrollSnap());
    const onPlay = () => setPlaying(true);
    const onStop = () => setPlaying(false);
    emblaApi.on('select', onSelect).on('autoplay:play', onPlay).on('autoplay:stop', onStop);
    return () => { emblaApi.off('select', onSelect).off('autoplay:play', onPlay).off('autoplay:stop', onStop); };
  }, [emblaApi]);

  return (
    <Box component="section" sx={{ bgcolor: '#0b2f5c', color: '#fff', pt: { xs: 5, md: 8 }, pb: { xs: 8, md: 10 } }}>
      <Container maxWidth="lg" sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 4, md: 6 }, alignItems: 'center' }}>
        <Box sx={{ flex: '1 1 420px', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2.5 }}>
          <Chip
            label={`${get('hero_free_access', 'FREE ACCESS')} · ${get('hero_online_learning', 'ONLINE LEARNING')}`}
            sx={{ bgcolor: '#fbbf24', color: '#1a1a1a', fontWeight: 700, letterSpacing: 0.5 }}
          />
          <Typography component="h1" sx={{ fontSize: { xs: '2.25rem', md: '3rem' }, fontWeight: 700, lineHeight: 1.1 }}>
            {get('hero_afterschool_hours', 'Afterschool Hours')}, online.
          </Typography>
          <Typography sx={{ fontSize: '1.125rem', color: '#dbe4f0', maxWidth: 520 }}>
            {get('hero_online_quizzes', 'Online Quizzes')} and lessons for {get('hero_all_courses', 'ALL COURSES').toLowerCase()}.{' '}
            {get('hero_description', 'Access them at the comfort of your home')}.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            <Button component={Link} to={createPageUrl('Explore')} variant="contained"
              sx={{ bgcolor: '#fff', color: '#0b2f5c', '&:hover': { bgcolor: '#e8edf5' } }}>
              {get('hero_button', 'Browse courses')}
            </Button>
            {!user && (
              <Button onClick={() => base44.auth.redirectToLogin()} variant="outlined"
                sx={{ borderColor: '#fff', color: '#fff', borderWidth: 2, '&:hover': { borderWidth: 2, borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}>
                Create free account
              </Button>
            )}
            {user && (
              <Button component={Link} to={createPageUrl('Dashboard')} variant="outlined"
                sx={{ borderColor: '#fff', color: '#fff', borderWidth: 2, '&:hover': { borderWidth: 2, borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}>
                My learning
              </Button>
            )}
          </Box>
        </Box>

        {images.length > 0 && (
          <Box sx={{ flex: '1 1 380px', minWidth: 0 }}>
            <Box ref={emblaRef} sx={{ overflow: 'hidden', borderRadius: '18px', aspectRatio: '4 / 3', bgcolor: '#1e4a7f' }}>
              <Box sx={{ display: 'flex', height: '100%' }}>
                {images.map((img, idx) => (
                  <Box key={img.id || idx} sx={{ flex: '0 0 100%', minWidth: 0, height: '100%' }}>
                    <Box component="img" src={img.image_url} alt="Students learning with Diverse Youth NI"
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </Box>
                ))}
              </Box>
            </Box>
            {images.length > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5, mt: 1 }}>
                <IconButton onClick={togglePlay} aria-label={playing ? 'Pause photos' : 'Play photos'} size="small"
                  sx={{ color: '#fff', mr: 0.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                  {playing ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                </IconButton>
                {images.map((_, idx) => (
                  // The button is a 24px tap target; the visible dot sits inside it.
                  <Box key={idx} component="button" aria-label={`Show photo ${idx + 1}`} aria-current={current === idx ? 'true' : undefined}
                    onClick={() => emblaApi?.scrollTo(idx)}
                    sx={{ minWidth: 24, height: 24, px: '7px', border: 0, bgcolor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box component="span" sx={{ display: 'block', width: current === idx ? 28 : 10, height: 10, borderRadius: 5,
                      bgcolor: current === idx ? '#fbbf24' : 'rgba(255,255,255,0.5)', transition: 'width 200ms var(--ease-out), background-color 200ms ease' }} />
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}
