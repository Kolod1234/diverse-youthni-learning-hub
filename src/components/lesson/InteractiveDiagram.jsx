import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Image, CheckCircle, X, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function InteractiveDiagram({ diagrams }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [showLabels, setShowLabels] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [score, setScore] = useState(0);

  const currentDiagram = diagrams[currentIndex];

  const toggleLabel = (term) => {
    if (isChecked) return;
    
    setSelectedLabels(prev => 
      prev.includes(term) 
        ? prev.filter(t => t !== term)
        : [...prev, term]
    );
  };

  const checkAnswers = () => {
    const allTerms = currentDiagram.labels.map(l => l.term);
    const correctCount = selectedLabels.filter(term => allTerms.includes(term)).length;
    
    setIsChecked(true);
    
    if (correctCount === allTerms.length && selectedLabels.length === allTerms.length) {
      setScore(prev => prev + 1);
      toast.success('Perfect! All labels identified correctly! 🎉');
    } else {
      toast.error(`${correctCount}/${allTerms.length} correct.`);
    }
  };

  const nextDiagram = () => {
    if (currentIndex < diagrams.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedLabels([]);
      setShowLabels(false);
      setIsChecked(false);
    }
  };

  const retry = () => {
    setSelectedLabels([]);
    setIsChecked(false);
  };

  return (
    <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-teal-600" />
            <CardTitle>Interactive Diagram {currentIndex + 1} of {diagrams.length}</CardTitle>
          </div>
          <Badge variant="secondary">{score}/{diagrams.length} Completed</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{currentDiagram.title}</h3>
              <p className="text-gray-600">{currentDiagram.description}</p>
            </div>

            <div className="relative p-6 bg-white rounded-lg border-2 border-gray-200 min-h-[300px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-48 h-48 mx-auto mb-4 bg-gradient-to-br from-teal-100 to-blue-100 rounded-lg flex items-center justify-center border-2 border-teal-300">
                  <Image className="w-20 h-20 text-teal-400" />
                </div>
                <p className="text-sm text-gray-500 italic">
                  {currentDiagram.imagePrompt}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  (Diagram visualization - select labels below)
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">
                  Select all relevant labels ({selectedLabels.length} selected):
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLabels(!showLabels)}
                  className="gap-2"
                >
                  {showLabels ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showLabels ? 'Hide' : 'Show'} Definitions
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {currentDiagram.labels.map((label, idx) => {
                  const isSelected = selectedLabels.includes(label.term);
                  const isCorrect = isChecked && isSelected;
                  
                  return (
                    <motion.button
                      key={idx}
                      onClick={() => toggleLabel(label.term)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        isSelected 
                          ? isCorrect 
                            ? 'bg-green-100 border-green-500 text-green-900'
                            : 'bg-blue-100 border-blue-500 text-blue-900'
                          : 'bg-white border-gray-300 hover:border-gray-400'
                      }`}
                      whileHover={{ scale: isChecked ? 1 : 1.05 }}
                      whileTap={{ scale: isChecked ? 1 : 0.95 }}
                    >
                      <span className="flex items-center gap-2">
                        {label.term}
                        {isChecked && isSelected && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <AnimatePresence>
              {showLabels && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-teal-50 border border-teal-200 rounded-lg space-y-2"
                >
                  {currentDiagram.labels.map((label, idx) => (
                    <div key={idx} className="text-sm">
                      <strong>{label.term}:</strong> {label.definition}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2">
              {!isChecked ? (
                <Button
                  onClick={checkAnswers}
                  disabled={selectedLabels.length === 0}
                  className="flex-1"
                >
                  Check Selection
                </Button>
              ) : (
                <>
                  <Button
                    onClick={retry}
                    variant="outline"
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </Button>
                  {currentIndex < diagrams.length - 1 && (
                    <Button onClick={nextDiagram} className="flex-1">
                      Next Diagram →
                    </Button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}