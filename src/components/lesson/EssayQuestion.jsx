import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { FileText, Sparkles, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function EssayQuestion({ questions, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  const currentQuestion = questions[currentIndex];
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  const isWithinRange = wordCount >= (currentQuestion.wordCount * 0.8) && wordCount <= (currentQuestion.wordCount * 1.5);

  const analyzeEssay = async () => {
    if (wordCount < 50) {
      toast.error('Please write at least 50 words before submitting.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a fair and understanding A-level examiner. Analyze this student essay with flexibility and nuance.

IMPORTANT ASSESSMENT PRINCIPLES:
1. ACCEPT MULTIPLE VALID APPROACHES - Students may express the same concept differently using alternative terminology, examples, or reasoning paths. Award full marks if the understanding is demonstrated, even if wording differs from the rubric.

2. REWARD UNDERSTANDING OVER EXACT WORDING - Focus on whether the student grasps the concept, not whether they use specific phrases. Different explanations of the same idea should receive equal credit.

3. VALUE ORIGINAL THINKING - If a student provides valid points not explicitly in the rubric but relevant to the question, recognize and credit this independent thinking.

4. BE LENIENT WITH TERMINOLOGY - Accept synonyms, paraphrases, and different ways of expressing the same concept (e.g., "increase in temperature" = "getting hotter" = "thermal energy rises").

5. PARTIAL CREDIT - Award partial marks for partially correct answers, work in progress, or answers that show some understanding even if incomplete.

6. CONSIDER CONTEXT - Evaluate the answer holistically. A well-structured argument with minor gaps may deserve higher marks than a list of facts without coherence.

Question: ${currentQuestion.question}

Student Answer: ${answer}

Rubric/Key Points to Consider (not a strict checklist): ${currentQuestion.rubric}

ASSESSMENT GUIDELINES:
- 90-100: Excellent understanding, addresses all key concepts (even if worded differently), well-structured
- 75-89: Good understanding, covers most key concepts, minor gaps acceptable
- 60-74: Adequate understanding, addresses main points, some areas need development
- 50-59: Basic understanding, covers some points but misses key elements
- Below 50: Limited understanding, significant gaps in knowledge

Provide feedback in JSON format:
{
  "score": 85,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2"],
  "overallFeedback": "detailed, encouraging feedback paragraph that acknowledges valid alternative approaches",
  "conceptsCovered": ["concept 1", "concept 2"],
  "conceptsMissing": ["concept that could strengthen the answer"]
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            score: { type: 'number' },
            strengths: { type: 'array', items: { type: 'string' } },
            improvements: { type: 'array', items: { type: 'string' } },
            overallFeedback: { type: 'string' },
            conceptsCovered: { type: 'array', items: { type: 'string' } },
            conceptsMissing: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setFeedback(response);
      setCompletedCount(prev => prev + 1);
      
      if (currentIndex === questions.length - 1 && onComplete) {
        setTimeout(() => onComplete(completedCount + 1), 2000);
      }
    } catch (error) {
      console.error('Failed to analyze essay:', error);
      toast.error('Failed to analyze your essay. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setAnswer('');
      setFeedback(null);
    }
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <CardTitle>Essay Question {currentIndex + 1} of {questions.length}</CardTitle>
          </div>
          <Badge variant="secondary">{completedCount}/{questions.length} Completed</Badge>
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
            <div className="p-4 bg-white rounded-lg border-l-4 border-purple-600">
              <p className="text-lg font-medium text-gray-900">{currentQuestion.question}</p>
              {currentQuestion.tips && (
                <p className="text-sm text-gray-600 mt-2">💡 {currentQuestion.tips}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">Target: ~{currentQuestion.wordCount} words</p>
            </div>

            {!feedback ? (
              <>
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Write your response here..."
                  className="min-h-[200px] text-base"
                  disabled={isAnalyzing}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isWithinRange ? 'text-green-600' : 'text-gray-500'}`}>
                      {wordCount} words
                    </span>
                    {isWithinRange && <CheckCircle className="w-4 h-4 text-green-600" />}
                  </div>
                  <Button
                    onClick={analyzeEssay}
                    disabled={isAnalyzing || wordCount < 50}
                    className="gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Get AI Feedback
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-4 bg-white rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Your Score</h3>
                    <Badge className="text-lg px-4 py-1" variant={feedback.score >= 70 ? 'default' : 'secondary'}>
                      {feedback.score}/100
                    </Badge>
                  </div>

                  {feedback.strengths.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Strengths
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {feedback.strengths.map((strength, idx) => (
                          <li key={idx} className="text-gray-700">{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {feedback.conceptsCovered?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-blue-700 mb-2">Concepts Demonstrated</h4>
                      <div className="flex flex-wrap gap-2">
                        {feedback.conceptsCovered.map((concept, idx) => (
                          <Badge key={idx} variant="outline" className="bg-blue-50">
                            {concept}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {feedback.improvements.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-amber-700 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Areas for Improvement
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {feedback.improvements.map((improvement, idx) => (
                          <li key={idx} className="text-gray-700">{improvement}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {feedback.conceptsMissing?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-purple-700 mb-2">Consider Adding</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {feedback.conceptsMissing.map((concept, idx) => (
                          <li key={idx} className="text-gray-700">{concept}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-2">Overall Feedback</h4>
                    <p className="text-gray-700 leading-relaxed">{feedback.overallFeedback}</p>
                  </div>
                </div>

                {currentIndex < questions.length - 1 && (
                  <Button onClick={nextQuestion} className="w-full">
                    Next Question →
                  </Button>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}