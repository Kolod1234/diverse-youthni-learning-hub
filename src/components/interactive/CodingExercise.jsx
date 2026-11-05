import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Play, Check, X, Code, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CodingExercise({ exercise, onComplete }) {
  const [code, setCode] = useState(exercise.starterCode || '');
  const [output, setOutput] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const runCode = () => {
    setIsRunning(true);
    setOutput('');
    
    setTimeout(() => {
      try {
        // Simple evaluation for demonstration
        const result = eval(code);
        const expectedResult = exercise.expectedOutput;
        
        const correct = String(result) === String(expectedResult);
        setIsCorrect(correct);
        setOutput(String(result));
        
        if (correct && onComplete) {
          setTimeout(() => onComplete(), 1000);
        }
      } catch (error) {
        setIsCorrect(false);
        setOutput(`Error: ${error.message}`);
      }
      setIsRunning(false);
    }, 500);
  };

  return (
    <Card className="p-6 border-0 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Code className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{exercise.title}</h3>
          <p className="text-sm text-gray-500">Coding Exercise</p>
        </div>
      </div>

      <p className="text-gray-700 mb-4">{exercise.description}</p>

      {exercise.instructions && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-amber-900"><strong>Instructions:</strong> {exercise.instructions}</p>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Your Code:</label>
        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Write your code here..."
          className="font-mono text-sm min-h-48"
          style={{ fontFamily: 'monospace' }}
        />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Button 
          onClick={runCode} 
          disabled={isRunning}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Play className="w-4 h-4 mr-2" />
          {isRunning ? 'Running...' : 'Run Code'}
        </Button>

        {exercise.hint && (
          <Button 
            variant="outline"
            onClick={() => setShowHint(!showHint)}
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            {showHint ? 'Hide' : 'Show'} Hint
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showHint && exercise.hint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4"
          >
            <p className="text-sm text-blue-900">💡 {exercise.hint}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {output && (
        <motion.div


          className={`rounded-lg p-4 ${
            isCorrect === true 
              ? 'bg-emerald-50 border border-emerald-200' 
              : isCorrect === false 
              ? 'bg-red-50 border border-red-200'
              : 'bg-gray-50 border border-gray-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {isCorrect === true && <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
            {isCorrect === false && <X className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
            <div className="flex-1">
              <p className={`text-sm font-medium mb-1 ${
                isCorrect === true ? 'text-emerald-900' : isCorrect === false ? 'text-red-900' : 'text-gray-900'
              }`}>
                {isCorrect === true ? 'Correct! Well done!' : isCorrect === false ? 'Not quite right. Try again!' : 'Output:'}
              </p>
              <pre className="text-sm text-gray-700 font-mono">{output}</pre>
            </div>
          </div>
        </motion.div>
      )}
    </Card>
  );
}