import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, CardContent, IconButton, Box, Typography, Chip } from '@mui/material';
import { ChevronLeft, ChevronRight, RotateCcw, Sparkles, RefreshCw } from 'lucide-react';

export default function FlashCards({ cards, onRegenerate }) {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState(new Set());

  const card = cards[currentCard];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentCard((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentCard((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const markAsKnown = () => {
    setKnownCards(prev => new Set([...prev, currentCard]));
    handleNext();
  };

  const reset = () => {
    setCurrentCard(0);
    setIsFlipped(false);
    setKnownCards(new Set());
  };

  return (
    <Card sx={{ background: 'linear-gradient(to bottom right, #eef2ff, #faf5ff)', borderRadius: 3 }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' }, fontWeight: 700, color: 'grey.800' }}>Flash Cards</Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              label={`${knownCards.size}/${cards.length} known`}
              size="small"
              sx={{ fontWeight: 600, bgcolor: '#9333ea', color: 'white' }}
            />
            <IconButton size="small" onClick={reset}>
              <RotateCcw size={16} />
            </IconButton>
            {onRegenerate && (
              <IconButton size="small" onClick={onRegenerate}>
                <RefreshCw size={16} />
              </IconButton>
            )}
          </Box>
        </Box>

        <Box sx={{ position: 'relative', height: { xs: 256, sm: 320 }, mb: 3, perspective: 1000 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ height: '100%', cursor: 'pointer' }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <Box sx={{ position: 'relative', height: '100%' }}>
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6 }}
                  style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d' }}
                >
                  <Box
                    sx={{ position: 'absolute', inset: 0, bgcolor: 'white', borderRadius: 4, boxShadow: 8, p: { xs: 3, sm: 4 }, display: 'flex', alignItems: 'center', justifyContent: 'center', backfaceVisibility: 'hidden' }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Sparkles size={32} color="#6366f1" style={{ margin: '0 auto 16px' }} />
                      <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, fontWeight: 700, color: 'grey.800' }}>
                        {card.front}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Tap to reveal</Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom right, #6366f1, #9333ea)', borderRadius: 4, boxShadow: 8, p: { xs: 3, sm: 4 }, display: 'flex', alignItems: 'center', justifyContent: 'center', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, fontWeight: 700, color: 'white' }}>
                        {card.back}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 2 }}>Tap to flip back</Typography>
                    </Box>
                  </Box>
                </motion.div>
              </Box>
            </motion.div>
          </AnimatePresence>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
          <IconButton
            onClick={handlePrev}
            disabled={cards.length <= 1}
            sx={{ border: 1, borderColor: 'divider' }}
          >
            <ChevronLeft size={20} />
          </IconButton>

          <Button
            onClick={markAsKnown}
            variant="contained"
            disabled={knownCards.has(currentCard)}
            sx={{ background: 'linear-gradient(to right, #16a34a, #059669)', '&:hover': { background: 'linear-gradient(to right, #15803d, #047857)' } }}
          >
            {knownCards.has(currentCard) ? '✓ Known' : 'I Know This'}
          </Button>

          <IconButton
            onClick={handleNext}
            disabled={cards.length <= 1}
            sx={{ border: 1, borderColor: 'divider' }}
          >
            <ChevronRight size={20} />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2 }}>
          {cards.map((_, index) => (
            <Box
              component="button"
              key={index}
              onClick={() => {
                setCurrentCard(index);
                setIsFlipped(false);
              }}
              sx={{
                width: index === currentCard ? 24 : 8,
                height: 8,
                borderRadius: 50,
                transition: 'all 0.3s',
                border: 'none',
                cursor: 'pointer',
                bgcolor: index === currentCard ? '#6366f1' : knownCards.has(index) ? '#22c55e' : '#d1d5db'
              }}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}