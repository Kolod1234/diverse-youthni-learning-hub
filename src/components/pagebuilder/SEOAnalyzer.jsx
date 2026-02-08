import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, XCircle, Zap, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

export default function SEOAnalyzer({ title, description, keywords, content }) {
  const [score, setScore] = useState(0);
  const [checks, setChecks] = useState([]);

  useEffect(() => {
    calculateSEOScore();
  }, [title, description, keywords, content]);

  const calculateSEOScore = () => {
    let points = 0;
    const newChecks = [];

    // Title checks
    if (title && title.length > 0) {
      points += 10;
      newChecks.push({ name: 'Page title', status: 'pass', message: 'Title present' });
    } else {
      newChecks.push({ name: 'Page title', status: 'fail', message: 'Add a title' });
    }

    if (title && title.length >= 30 && title.length <= 60) {
      points += 10;
      newChecks.push({ name: 'Title length', status: 'pass', message: '30-60 characters' });
    } else if (title) {
      newChecks.push({ 
        name: 'Title length', 
        status: 'warning', 
        message: `${title.length} characters (30-60 optimal)` 
      });
    }

    // Meta description checks
    if (description && description.length > 0) {
      points += 10;
      newChecks.push({ name: 'Meta description', status: 'pass', message: 'Description present' });
    } else {
      newChecks.push({ name: 'Meta description', status: 'fail', message: 'Add a description' });
    }

    if (description && description.length >= 120 && description.length <= 160) {
      points += 10;
      newChecks.push({ name: 'Description length', status: 'pass', message: '120-160 characters' });
    } else if (description) {
      newChecks.push({
        name: 'Description length',
        status: 'warning',
        message: `${description.length} characters (120-160 optimal)`
      });
    }

    // Keywords checks
    if (keywords && keywords.length > 0) {
      points += 10;
      newChecks.push({ name: 'Keywords', status: 'pass', message: `${keywords.length} keywords` });
    } else {
      newChecks.push({ name: 'Keywords', status: 'fail', message: 'Add target keywords' });
    }

    // Content checks
    const contentLength = content ? content.length : 0;
    if (contentLength > 300) {
      points += 20;
      newChecks.push({ name: 'Content length', status: 'pass', message: '300+ characters' });
    } else if (contentLength > 0) {
      newChecks.push({
        name: 'Content length',
        status: 'warning',
        message: `${contentLength} characters (300+ recommended)`
      });
    } else {
      newChecks.push({ name: 'Content length', status: 'fail', message: 'Add more content' });
    }

    // Keyword density check
    if (keywords && keywords.length > 0 && content) {
      const keywordMatches = keywords.filter(kw =>
        content.toLowerCase().includes(kw.toLowerCase())
      ).length;
      
      if (keywordMatches >= keywords.length * 0.5) {
        points += 20;
        newChecks.push({ 
          name: 'Keyword usage', 
          status: 'pass', 
          message: `${keywordMatches}/${keywords.length} keywords used` 
        });
      } else {
        newChecks.push({
          name: 'Keyword usage',
          status: 'warning',
          message: `${keywordMatches}/${keywords.length} keywords found in content`
        });
      }
    }

    setScore(points);
    setChecks(newChecks);
  };

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = () => {
    if (score >= 80) return 'Great';
    if (score >= 60) return 'Good';
    return 'Needs Work';
  };

  return (
    <div className="space-y-6 py-4">
      {/* Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 rounded-lg p-6 border border-blue-200 dark:border-slate-700"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            SEO Score
          </h3>
          <div className={`text-3xl font-bold ${getScoreColor()}`}>{score}</div>
        </div>
        <Progress value={score} className="h-3 mb-2" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {getScoreLabel()} - {score >= 80 ? 'Optimize further for better ranking' : 'Improve SEO to boost visibility'}
        </p>
      </motion.div>

      {/* Checks List */}
      <div className="space-y-2">
        <h4 className="font-semibold text-sm">SEO Checklist</h4>
        {checks.map((check, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-start gap-3 p-3 rounded-lg border ${
              check.status === 'pass'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : check.status === 'warning'
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}
          >
            {check.status === 'pass' && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />}
            {check.status === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />}
            {check.status === 'fail' && <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
            <div className="flex-1">
              <p className="font-medium text-sm">{check.name}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{check.message}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}