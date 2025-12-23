import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, Save, RefreshCw, Brain } from 'lucide-react';
import { toast } from 'sonner';

export default function AIQuizGenerator({ courses }) {
  const [topic, setTopic] = useState('');
  const [subtopic, setSubtopic] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [courseId, setCourseId] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [timePerQuestion, setTimePerQuestion] = useState(60);
  const [marksPerQuestion, setMarksPerQuestion] = useState(1);
  const [includeShortAnswer, setIncludeShortAnswer] = useState(false);
  const [includeLongAnswer, setIncludeLongAnswer] = useState(false);
  const [includeImageQuestions, setIncludeImageQuestions] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);

  const queryClient = useQueryClient();

  const saveQuizMutation = useMutation({
    mutationFn: (data) => base44.entities.Quiz.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['quizzes']);
      toast.success('Quiz saved successfully!');
      setGeneratedQuiz(null);
      setTopic('');
      setAdditionalContext('');
    },
  });

  const handleGenerate = async () => {
    if (!topic.trim() || !courseId) {
      toast.error('Please enter a topic and select a course');
      return;
    }

    setGenerating(true);
    try {
      const questionTypes = [];
      let mcCount = numQuestions;
      
      if (includeShortAnswer) {
        questionTypes.push('short_answer');
        mcCount = Math.floor(numQuestions * 0.7);
      }
      if (includeLongAnswer) {
        questionTypes.push('long_answer');
        mcCount = Math.floor(numQuestions * 0.6);
      }
      if (includeImageQuestions) {
        questionTypes.push('image_based');
      }

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create ${numQuestions} quiz questions about: "${topic}"${subtopic ? ` (Subtopic: ${subtopic})` : ''}
        
${additionalContext ? `Additional context: ${additionalContext}` : ''}

Difficulty level: ${difficulty}

Question Types Distribution:
- ${mcCount} Multiple Choice questions
${includeShortAnswer ? `- ${Math.ceil(numQuestions * 0.2)} Short Answer questions (1-2 sentence answers)` : ''}
${includeLongAnswer ? `- ${Math.ceil(numQuestions * 0.15)} Long Answer questions (paragraph answers, ${marksPerQuestion * 3}-${marksPerQuestion * 5} marks)` : ''}
${includeImageQuestions ? `- ${Math.ceil(numQuestions * 0.15)} Image/Diagram based questions (include placeholder image URLs)` : ''}

For each question create:
- Clear, educational question text
- Set question_type: "multiple_choice", "short_answer", "long_answer", or "image_based"
- For multiple choice: 4 options, correct_answer (0-3)
- For short/long answer: correct_text_answer with model answer
- For image questions: image_url (use "https://via.placeholder.com/600x400/6366F1/FFFFFF?text=Diagram+Here"), and either options or correct_text_answer
- Brief explanation
- Marks: ${marksPerQuestion} for MC/short, ${marksPerQuestion * 3} for long answer
${timePerQuestion ? `- Time limit: ${timePerQuestion}s for MC, ${timePerQuestion * 2}s for short answer, ${timePerQuestion * 3}s for long answer` : ''}

Return JSON:
{
  "title": "Quiz title",
  "description": "What the quiz covers",
  "questions": [
    {
      "question": "Question text",
      "question_type": "multiple_choice|short_answer|long_answer|image_based",
      "image_url": "url for image questions",
      "options": ["A", "B", "C", "D"] // only for multiple_choice,
      "correct_answer": 0, // only for multiple_choice
      "correct_text_answer": "model answer", // for short/long answer
      "explanation": "Why correct",
      "marks": 1,
      "time_limit_seconds": 60
    }
  ]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correct_answer: { type: "number" },
                  explanation: { type: "string" },
                  marks: { type: "number" },
                  time_limit_seconds: { type: "number" }
                }
              }
            }
          }
        }
      });

      setGeneratedQuiz(result);
      toast.success('Quiz generated successfully!');
    } catch (error) {
      toast.error('Failed to generate quiz');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveGenerated = () => {
    if (!generatedQuiz) return;

    const totalMarks = generatedQuiz.questions.reduce((sum, q) => sum + (q.marks || 1), 0);

    saveQuizMutation.mutate({
      ...generatedQuiz,
      course_id: courseId,
      topic,
      subtopic,
      difficulty,
      passing_score: 70,
      total_marks: totalMarks,
      is_published: false
    });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left Panel - Input */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">AI Quiz Generator</h2>
            <p className="text-sm text-gray-500">Generate quizzes from any topic</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Topic *</Label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Photosynthesis"
              />
            </div>
            <div>
              <Label>Subtopic</Label>
              <Input
                value={subtopic}
                onChange={(e) => setSubtopic(e.target.value)}
                placeholder="e.g., Light Reactions"
              />
            </div>
          </div>

          <div>
            <Label>Course *</Label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-gray-300"
            >
              <option value="">Select Course</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div>
            <Label>Additional Context (Optional)</Label>
            <Textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Add specific topics, learning objectives, or context..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Number of Questions</Label>
              <Input
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value) || 10)}
                min="1"
                max="50"
              />
            </div>
            <div>
              <Label>Difficulty</Label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-gray-300"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Marks per Question</Label>
              <Input
                type="number"
                value={marksPerQuestion}
                onChange={(e) => setMarksPerQuestion(parseInt(e.target.value) || 1)}
                min="1"
              />
            </div>
            <div>
              <Label>Time per Question (sec)</Label>
              <Input
                type="number"
                value={timePerQuestion}
                onChange={(e) => setTimePerQuestion(parseInt(e.target.value) || 60)}
                min="10"
                placeholder="e.g., 60"
              />
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <Label className="mb-3 block">Question Types to Include</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeShortAnswer}
                  onChange={(e) => setIncludeShortAnswer(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span className="text-sm">Short Answer Questions</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLongAnswer}
                  onChange={(e) => setIncludeLongAnswer(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span className="text-sm">Long Answer Questions (essay-style)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeImageQuestions}
                  onChange={(e) => setIncludeImageQuestions(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span className="text-sm">Image/Diagram Based Questions</span>
              </label>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 h-12"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Quiz...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Quiz
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Right Panel - Preview */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Preview</h2>

        {!generatedQuiz ? (
          <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed">
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No quiz generated yet</p>
            <p className="text-sm text-gray-400">Fill in the details and click Generate</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
              <h3 className="font-bold text-lg text-gray-900 mb-1">{generatedQuiz.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{generatedQuiz.description}</p>
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                  {generatedQuiz.questions.length} questions
                </span>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
                  {generatedQuiz.questions.reduce((sum, q) => sum + q.marks, 0)} marks
                </span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {difficulty}
                </span>
              </div>
            </div>

            <div className="max-h-[500px] overflow-y-auto space-y-3">
              {generatedQuiz.questions.map((q, idx) => (
                <Card key={idx} className="p-4 bg-gray-50">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="font-bold text-indigo-600">{idx + 1}.</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-2">{q.question}</p>
                      <div className="space-y-1">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`text-sm px-3 py-2 rounded ${
                              q.correct_answer === optIdx
                                ? 'bg-green-100 text-green-800 font-medium'
                                : 'bg-white text-gray-700'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}. {opt}
                            {q.correct_answer === optIdx && ' ✓'}
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <p className="text-xs text-gray-600 mt-2 italic">💡 {q.explanation}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          {q.marks} mark{q.marks !== 1 ? 's' : ''}
                        </span>
                        {q.time_limit_seconds && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                            ⏱️ {q.time_limit_seconds}s
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSaveGenerated}
                disabled={saveQuizMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveQuizMutation.isPending ? 'Saving...' : 'Save Quiz'}
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={generating}
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}