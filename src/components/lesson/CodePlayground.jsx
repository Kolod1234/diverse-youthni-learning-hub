import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Code, Play, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CodePlayground({ initialCode = '', language = 'javascript', onRun }) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    try {
      // For JavaScript - simple eval (in production, use a sandboxed environment)
      if (language === 'javascript') {
        const logs = [];
        const customConsole = {
          log: (...args) => logs.push(args.join(' ')),
        };
        
        const func = new Function('console', code);
        func(customConsole);
        setOutput(logs.join('\n') || 'Code executed successfully!');
      } else {
        setOutput('Language not supported yet. Stay tuned!');
      }
      
      onRun?.(code);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
    setIsRunning(false);
  };

  const handleReset = () => {
    setCode(initialCode);
    setOutput('');
  };

  return (
    <motion.div

    >
      <Card className="p-6 bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-gray-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Code Playground</h3>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            <Button
              onClick={handleRun}
              disabled={isRunning}
              size="sm"
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <Play className="w-4 h-4" />
              {isRunning ? 'Running...' : 'Run'}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Code</label>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="font-mono text-sm bg-slate-900 text-green-400 border-slate-700 min-h-[200px]"
              placeholder="Write your code here..."
            />
          </div>

          {output && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Output</label>
              <pre className="p-4 bg-slate-900 text-gray-100 rounded-lg text-sm overflow-x-auto border border-slate-700">
                {output}
              </pre>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}