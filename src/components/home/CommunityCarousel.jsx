import React from 'react';
import { Box, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

export default function CommunityCarousel({ images }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000, stopOnInteraction: false })]);

  if (!images || images.length === 0) return null;

  return (
    <motion.div
    >
      <Box sx={{ position: 'relative', borderRadius: 6, overflow: 'hidden', boxShadow: 6 }}>
        <Box sx={{ overflow: 'hidden' }} ref={emblaRef}>
          <Box sx={{ display: 'flex' }}>
            {images.map((img, idx) => (
              <Box key={img.id || idx} sx={{ flex: '0 0 100%', minWidth: 0 }}>
                {/* Padding-top trick guarantees height on mobile regardless of image load */}
                <Box sx={{ width: '100%', paddingTop: { xs: '75%', sm: '56.25%' }, position: 'relative', bgcolor: '#e5e7eb' }}>
                  <img
                    src={img.image_url}
                    alt={`Community ${idx + 1}`}
                    style={{
                      position: 'absolute',
                      top: 0, left: 0,
                      width: '100%', height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <IconButton aria-label="Previous"
          onClick={() => emblaApi?.scrollPrev()}
          sx={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 },
            bgcolor: 'rgba(255,255,255,0.9)', boxShadow: 4, zIndex: 10,
            '&:hover': { bgcolor: 'white' },
          }}
        >
          <ChevronLeft size={22} color="#1f2937" />
        </IconButton>
        <IconButton aria-label="Next"
          onClick={() => emblaApi?.scrollNext()}
          sx={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 },
            bgcolor: 'rgba(255,255,255,0.9)', boxShadow: 4, zIndex: 10,
            '&:hover': { bgcolor: 'white' },
          }}
        >
          <ChevronRight size={22} color="#1f2937" />
        </IconButton>
      </Box>
    </motion.div>
  );
}