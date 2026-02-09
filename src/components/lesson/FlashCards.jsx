import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
    <Card className="p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800">Flash Cards</h3>
        <div className="flex gap-2 items-center">
          <span className="text-sm font-semibold text-purple-600">
            {knownCards.size}/{cards.length} known
          </span>
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          {onRegenerate && (
            <Button variant="outline" size="sm" onClick={onRegenerate}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="relative h-64 sm:h-80 mb-6 perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className="relative h-full">
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 bg-white rounded-2xl shadow-xl p-6 sm:p-8 flex items-center justify-center"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="text-center">
                    <Sparkles className="w-8 h-8 text-indigo-500 mx-auto mb-4" />
                    <p className="text-xl sm:text-2xl font-bold text-gray-800">
                      {card.front}
                    </p>
                    <p className="text-sm text-gray-500 mt-4">Tap to reveal</p>
                  </div>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-6 sm:p-8 flex items-center justify-center"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold text-white">
                      {card.back}
                    </p>
                    <p className="text-sm text-white/80 mt-4">Tap to flip back</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={cards.length <= 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex gap-2">
          <Button
            onClick={markAsKnown}
            className="bg-gradient-to-r from-green-600 to-emerald-600"
            disabled={knownCards.has(currentCard)}
          >
            {knownCards.has(currentCard) ? '✓ Known' : 'I Know This'}
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={cards.length <= 1}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex gap-2 justify-center mt-4">
        {cards.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentCard(index);
              setIsFlipped(false);
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentCard
                ? 'bg-indigo-600 w-6'
                : knownCards.has(index)
                ? 'bg-green-500'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </Card>
  );
}