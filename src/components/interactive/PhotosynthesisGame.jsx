import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sun, Droplet, Sparkles, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PhotosynthesisGame() {
  const [inputs, setInputs] = useState({ light: 0, water: 0, co2: 0 });
  const [glucose, setGlucose] = useState(0);
  const [oxygen, setOxygen] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const runPhotosynthesis = () => {
    const minInput = Math.min(inputs.light, inputs.water, inputs.co2);
    
    if (minInput === 0) {
      alert('You need all three inputs: light, water, and CO₂!');
      return;
    }

    setIsRunning(true);
    setGlucose(minInput);
    setOxygen(minInput * 6);

    setTimeout(() => {
      setIsRunning(false);
    }, 2000);
  };

  const reset = () => {
    setInputs({ light: 0, water: 0, co2: 0 });
    setGlucose(0);
    setOxygen(0);
  };

  const addInput = (type) => {
    setInputs(prev => ({ ...prev, [type]: Math.min(prev[type] + 1, 5) }));
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Photosynthesis Simulator</h3>
        <p className="text-gray-600 text-sm">Add inputs to see photosynthesis in action!</p>
        <Badge variant="outline" className="mt-2 bg-card">
          CO₂ + H₂O + Light → Glucose + O₂
        </Badge>
      </div>

      {/* Inputs Section */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <motion.div whileHover={{ scale: 1.05 }} className="text-center">
          <Button
            onClick={() => addInput('light')}
            className="w-full h-20 bg-yellow-500 hover:bg-yellow-600 mb-2"
          >
            <Sun className="w-8 h-8" />
          </Button>
          <p className="text-sm font-semibold text-gray-900">Light Energy</p>
          <Badge className="bg-yellow-600">{inputs.light}</Badge>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className="text-center">
          <Button
            onClick={() => addInput('water')}
            className="w-full h-20 bg-blue-500 hover:bg-blue-600 mb-2"
          >
            <Droplet className="w-8 h-8" />
          </Button>
          <p className="text-sm font-semibold text-gray-900">Water (H₂O)</p>
          <Badge className="bg-blue-600">{inputs.water}</Badge>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className="text-center">
          <Button
            onClick={() => addInput('co2')}
            className="w-full h-20 bg-gray-500 hover:bg-gray-600 mb-2"
          >
            <Sparkles className="w-8 h-8" />
          </Button>
          <p className="text-sm font-semibold text-gray-900">CO₂</p>
          <Badge className="bg-gray-600">{inputs.co2}</Badge>
        </motion.div>
      </div>

      {/* Process Arrow */}
      <div className="flex items-center justify-center mb-8">
        <motion.div
          animate={isRunning ? { x: [0, 10, 0] } : {}}
          transition={{ repeat: isRunning ? Infinity : 0, duration: 0.5 }}
        >
          <Leaf className={`w-12 h-12 ${isRunning ? 'text-green-600' : 'text-green-400'}`} />
        </motion.div>
        <ArrowRight className="w-8 h-8 text-gray-400 mx-4" />
      </div>

      {/* Outputs Section */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-card rounded-lg border-2 border-green-300 text-center">
          <p className="text-sm font-semibold text-gray-700 mb-2">Glucose Produced</p>
          <motion.div
            key={glucose}
            className="text-3xl font-bold text-green-600"
          >
            {glucose}
          </motion.div>
          <p className="text-xs text-gray-500 mt-1">C₆H₁₂O₆</p>
        </div>

        <div className="p-4 bg-card rounded-lg border-2 border-cyan-300 text-center">
          <p className="text-sm font-semibold text-gray-700 mb-2">Oxygen Released</p>
          <motion.div
            key={oxygen}
            className="text-3xl font-bold text-cyan-600"
          >
            {oxygen}
          </motion.div>
          <p className="text-xs text-gray-500 mt-1">O₂ molecules</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          onClick={runPhotosynthesis}
          disabled={isRunning}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {isRunning ? 'Processing...' : 'Start Photosynthesis'}
        </Button>
        <Button onClick={reset} variant="outline">
          Reset
        </Button>
      </div>

      {/* Learning Tip */}
      <div className="mt-6 p-3 bg-card rounded-lg border border-green-200">
        <p className="text-xs text-gray-600">
          <strong>💡 Tip:</strong> Photosynthesis needs all three inputs! The limiting factor (lowest value) determines how much glucose is produced.
        </p>
      </div>
    </Card>
  );
}