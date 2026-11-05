import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const cellParts = [
  { id: 'nucleus', name: 'Nucleus', x: 45, y: 45, description: 'Controls cell activities and contains DNA' },
  { id: 'mitochondria', name: 'Mitochondria', x: 65, y: 30, description: 'Site of aerobic respiration' },
  { id: 'membrane', name: 'Cell Membrane', x: 15, y: 50, description: 'Controls what enters and exits the cell' },
  { id: 'cytoplasm', name: 'Cytoplasm', x: 50, y: 70, description: 'Jelly-like substance where reactions occur' },
  { id: 'chloroplast', name: 'Chloroplast', x: 30, y: 30, description: 'Site of photosynthesis (plant cells only)' },
  { id: 'vacuole', name: 'Vacuole', x: 70, y: 60, description: 'Storage of cell sap (large in plant cells)' },
];

export default function CellDiagramGame({ cellType = 'animal' }) {
  const [selectedParts, setSelectedParts] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const relevantParts = cellType === 'plant' 
    ? cellParts 
    : cellParts.filter(p => p.id !== 'chloroplast' && p.id !== 'vacuole');

  const handlePartClick = (part) => {
    if (showResults || selectedParts.includes(part.id)) return;
    
    setSelectedParts([...selectedParts, part.id]);
  };

  const checkAnswers = () => {
    const correct = selectedParts.filter(id => relevantParts.some(p => p.id === id)).length;
    setScore(correct);
    setShowResults(true);
  };

  const resetGame = () => {
    setSelectedParts([]);
    setShowResults(false);
    setScore(0);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Label the {cellType === 'plant' ? 'Plant' : 'Animal'} Cell</h3>
        <p className="text-gray-600">Click on the correct locations to identify cell parts</p>
      </div>

      {/* Cell Diagram */}
      <div className="relative w-full aspect-square max-w-md mx-auto mb-6 bg-card rounded-xl border-2 border-cyan-300 shadow-lg overflow-hidden">
        {/* Cell illustration */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-4/5 h-4/5 rounded-full border-4 ${cellType === 'plant' ? 'border-green-600 bg-green-50' : 'border-pink-600 bg-pink-50'}`}>
            {/* Nucleus */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/4 rounded-full bg-blue-200 border-2 border-blue-600" />
          </div>
        </div>

        {/* Clickable markers */}
        {relevantParts.map((part) => (
          <motion.button
            key={part.id}
            onClick={() => handlePartClick(part)}
            className={`absolute w-8 h-8 rounded-full border-2 transition-all ${
              selectedParts.includes(part.id)
                ? showResults
                  ? 'bg-green-500 border-green-700 scale-110'
                  : 'bg-cyan-500 border-cyan-700'
                : 'bg-white border-gray-400 hover:bg-cyan-100 hover:scale-110'
            }`}
            style={{ left: `${part.x}%`, top: `${part.y}%`, transform: 'translate(-50%, -50%)' }}
            disabled={showResults}
            whileHover={{ scale: showResults ? 1.1 : 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            {selectedParts.includes(part.id) && (
              <CheckCircle className="w-5 h-5 text-white absolute inset-0 m-auto" />
            )}
          </motion.button>
        ))}
      </div>

      {/* Answer options */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
        {relevantParts.map((part) => (
          <Badge
            key={part.id}
            variant={selectedParts.includes(part.id) ? 'default' : 'outline'}
            className={`py-2 cursor-pointer text-center ${
              selectedParts.includes(part.id) ? 'bg-cyan-600' : 'hover:bg-cyan-50'
            }`}
            onClick={() => handlePartClick(part)}
          >
            {part.name}
          </Badge>
        ))}
      </div>

      {/* Results */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-4 bg-card rounded-lg border-2 border-green-200"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-semibold text-gray-900">
                Score: {score} / {relevantParts.length}
              </span>
              {score === relevantParts.length ? (
                <Badge className="bg-green-600">Perfect! 🎉</Badge>
              ) : (
                <Badge variant="outline">Keep learning!</Badge>
              )}
            </div>

            <div className="space-y-2 text-sm">
              {relevantParts.map((part) => (
                <div key={part.id} className="flex items-start gap-2">
                  {selectedParts.includes(part.id) ? (
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <span className="font-medium text-gray-900">{part.name}:</span>
                    <span className="text-gray-600 ml-1">{part.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex gap-3">
        {!showResults ? (
          <Button 
            onClick={checkAnswers}
            disabled={selectedParts.length === 0}
            className="flex-1 bg-cyan-600 hover:bg-cyan-700"
          >
            Check Answers
          </Button>
        ) : (
          <Button onClick={resetGame} className="flex-1 bg-cyan-600 hover:bg-cyan-700">
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    </Card>
  );
}