import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sliders, Tag, X, Sparkles } from 'lucide-react';

const DIFFICULTY_OPTIONS = [
  { value: 'basic', label: 'Basic', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'advanced', label: 'Advanced', color: 'bg-red-100 text-red-700 border-red-300' },
];

const QUESTION_TYPE_OPTIONS = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'true_false', label: 'True / False' },
  { value: 'short_answer', label: 'Short Answer' },
];

export default function QuizCustomiser({ onGenerate, loading }) {
  const [difficulty, setDifficulty] = useState('intermediate');
  const [questionTypes, setQuestionTypes] = useState(['multiple_choice']);
  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState([]);

  const toggleQuestionType = (type) => {
    setQuestionTypes(prev =>
      prev.includes(type)
        ? prev.length > 1 ? prev.filter(t => t !== type) : prev // keep at least one
        : [...prev, type]
    );
  };

  const addKeyword = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && keywordInput.trim()) {
      e.preventDefault();
      const word = keywordInput.trim().replace(/,$/, '');
      if (word && !keywords.includes(word)) {
        setKeywords(prev => [...prev, word]);
      }
      setKeywordInput('');
    }
  };

  const removeKeyword = (kw) => {
    setKeywords(prev => prev.filter(k => k !== kw));
  };

  const handleGenerate = () => {
    onGenerate({ difficulty, questionTypes, keywords });
  };

  return (
    <Card className="p-4 sm:p-5 border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="flex items-center gap-2 mb-4">
        <Sliders className="w-4 h-4 text-indigo-600" />
        <span className="font-semibold text-gray-800 text-sm">Customise Your Quiz</span>
      </div>

      {/* Difficulty */}
      <div className="mb-4">
        <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Difficulty Level</p>
        <div className="flex flex-wrap gap-2">
          {DIFFICULTY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setDifficulty(opt.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                difficulty === opt.value
                  ? opt.color + ' border-2'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Question Types */}
      <div className="mb-4">
        <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Question Types</p>
        <div className="flex flex-wrap gap-2">
          {QUESTION_TYPE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => toggleQuestionType(opt.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                questionTypes.includes(opt.value)
                  ? 'bg-indigo-100 text-indigo-700 border-indigo-400'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Keywords */}
      <div className="mb-5">
        <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
          <Tag className="w-3 h-3 inline mr-1" />
          Focus Keywords <span className="normal-case font-normal text-gray-400">(optional, press Enter to add)</span>
        </p>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {keywords.map(kw => (
            <Badge key={kw} variant="secondary" className="gap-1 pl-2 pr-1 py-1 text-xs bg-indigo-100 text-indigo-700">
              {kw}
              <button onClick={() => removeKeyword(kw)} className="hover:text-red-600 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        <input
          type="text"
          value={keywordInput}
          onChange={e => setKeywordInput(e.target.value)}
          onKeyDown={addKeyword}
          placeholder="e.g. mitosis, photosynthesis, quadratic..."
          className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        />
      </div>

      <Button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white gap-2"
      >
        <Sparkles className="w-4 h-4" />
        {loading ? 'Generating...' : 'Generate Quiz'}
      </Button>
    </Card>
  );
}