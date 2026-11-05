import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { 
  Brain, Loader2, Sparkles, TrendingUp, Target, 
  Award, Calendar, BookOpen, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function PersonalizedFeedback({ enrollments, quizAttempts, courses, userProgress }) {
  const [generating, setGenerating] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const generateFeedback = async () => {
    setGenerating(true);
    
    try {
      const completedCourses = enrollments.filter(e => e.is_completed).length;
      const avgProgress = enrollments.length > 0 
        ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress_percent || 0), 0) / enrollments.length)
        : 0;
      
      const passRate = quizAttempts.length > 0
        ? Math.round((quizAttempts.filter(a => a.passed).length / quizAttempts.length) * 100)
        : 0;

      const avgScore = quizAttempts.length > 0
        ? Math.round(quizAttempts.reduce((sum, a) => sum + a.score, 0) / quizAttempts.length)
        : 0;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an educational analytics AI. Analyze this student's learning data and provide personalized, actionable feedback.

LEARNING DATA:
- Total Enrollments: ${enrollments.length}
- Completed Courses: ${completedCourses}
- Average Progress: ${avgProgress}%
- Total Quiz Attempts: ${quizAttempts.length}
- Quiz Pass Rate: ${passRate}%
- Average Quiz Score: ${avgScore}%
- Total Points: ${userProgress?.points || 0}
- Current Level: ${userProgress?.level || 1}
- Streak Days: ${userProgress?.streak_days || 0}

COURSE SUBJECTS:
${courses.filter(c => enrollments.some(e => e.course_id === c.id)).map(c => `- ${c.title} (${c.category})`).join('\n')}

Provide feedback in the following JSON format:
{
  "overall_assessment": "A brief, encouraging summary of their learning journey",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "areas_for_improvement": ["area 1", "area 2"],
  "personalized_recommendations": [
    {
      "title": "Recommendation title",
      "description": "Detailed actionable advice",
      "priority": "high/medium/low"
    }
  ],
  "next_steps": ["specific action 1", "specific action 2", "specific action 3"],
  "motivation_message": "Encouraging personalized message based on their data"
}`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_assessment: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            areas_for_improvement: { type: "array", items: { type: "string" } },
            personalized_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            next_steps: { type: "array", items: { type: "string" } },
            motivation_message: { type: "string" }
          }
        }
      });

      setFeedback(result);
      toast.success('AI feedback generated!');
    } catch (error) {
      toast.error('Failed to generate feedback');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === 'high') return 'bg-red-100 dark:bg-red-500/15 text-red-800 dark:text-red-300 border-red-200';
    if (priority === 'medium') return 'bg-yellow-100 dark:bg-yellow-500/15 text-yellow-800 dark:text-yellow-300 border-yellow-200';
    return 'bg-blue-100 dark:bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-200';
  };

  return (
    <div className="space-y-6">
      {!feedback && !generating && (
        <Card className="p-12 text-center bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200">
          <motion.div
          >
            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-500/15 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              AI-Powered Learning Insights
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Get personalized feedback and recommendations based on your learning data, 
              quiz performance, and progress patterns.
            </p>
            <Button 
              onClick={generateFeedback}
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate AI Insights
            </Button>
          </motion.div>
        </Card>
      )}

      {generating && (
        <Card className="p-12 text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Analyzing Your Learning Data...
          </h3>
          <p className="text-muted-foreground">
            AI is generating personalized insights and recommendations
          </p>
        </Card>
      )}

      <AnimatePresence>
        {feedback && (
          <motion.div
            className="space-y-6"
          >
            {/* Overall Assessment */}
            <Card className="p-6 bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-foreground">Overall Assessment</h3>
              </div>
              <p className="text-foreground leading-relaxed">
                {feedback.overall_assessment}
              </p>
            </Card>

            {/* Strengths & Improvements */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-bold text-foreground">Your Strengths</h3>
                </div>
                <ul className="space-y-3">
                  {feedback.strengths?.map((strength, idx) => (
                    <motion.li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>{strength}</span>
                    </motion.li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-bold text-foreground">Growth Areas</h3>
                </div>
                <ul className="space-y-3">
                  {feedback.areas_for_improvement?.map((area, idx) => (
                    <motion.li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <span className="text-orange-600 mt-0.5">→</span>
                      <span>{area}</span>
                    </motion.li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Recommendations */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-indigo-600" />
                <h3 className="text-xl font-bold text-foreground">Personalized Recommendations</h3>
              </div>
              
              <div className="space-y-4">
                {feedback.personalized_recommendations?.map((rec, idx) => (
                  <motion.div
                    key={idx}
                    className="p-4 bg-muted rounded-lg border border-border"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="font-semibold text-foreground">{rec.title}</h4>
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground">{rec.description}</p>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Next Steps */}
            <Card className="p-6 bg-indigo-50 dark:bg-indigo-500/15 border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-bold text-foreground">Your Next Steps</h3>
              </div>
              
              <div className="space-y-3">
                {feedback.next_steps?.map((step, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-start gap-3"
                  >
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-500/15 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">{idx + 1}</span>
                    </div>
                    <p className="text-sm text-foreground">{step}</p>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Motivation */}
            <Card className="p-6 bg-indigo-600 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-6 h-6" />
                <h3 className="text-xl font-bold">Keep Going!</h3>
              </div>
              <p className="text-white/90 leading-relaxed">
                {feedback.motivation_message}
              </p>
            </Card>

            {/* Regenerate Button */}
            <div className="text-center">
              <Button 
                onClick={generateFeedback}
                variant="outline"
                disabled={generating}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Regenerate Insights
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}