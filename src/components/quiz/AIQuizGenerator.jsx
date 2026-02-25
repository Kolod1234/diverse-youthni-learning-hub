import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, Save, RefreshCw, Brain } from 'lucide-react';
import { toast } from 'sonner';
import { MathJax } from 'better-react-mathjax';

export default function AIQuizGenerator({ courses }) {
  const [topic, setTopic] = useState('');
  const [subtopic, setSubtopic] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [courseId, setCourseId] = useState('');
  const [lessonId, setLessonId] = useState('');
  const [lessons, setLessons] = useState([]);
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [timePerQuestion, setTimePerQuestion] = useState(60);
  const [marksPerQuestion, setMarksPerQuestion] = useState(1);
  const [includeShortAnswer, setIncludeShortAnswer] = useState(false);
  const [includeLongAnswer, setIncludeLongAnswer] = useState(false);
  const [includeImageQuestions, setIncludeImageQuestions] = useState(false);
  const [includeTrueFalse, setIncludeTrueFalse] = useState(false);
  const [includeMatching, setIncludeMatching] = useState(false);
  const [mixedDifficulty, setMixedDifficulty] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);

  const queryClient = useQueryClient();

  // Load lessons when course is selected
  useEffect(() => {
    const loadLessons = async () => {
      if (courseId) {
        const courseLessons = await base44.entities.Lesson.filter({ course_id: courseId }, 'order', 100);
        setLessons(courseLessons);
      } else {
        setLessons([]);
      }
    };
    loadLessons();
  }, [courseId]);

  const saveQuizMutation = useMutation({
    mutationFn: (data) => base44.entities.Quiz.create({
      ...data,
      is_published: true
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast.success('Quiz published successfully! Students can now take it.');
      setGeneratedQuiz(null);
      setTopic('');
      setSubtopic('');
      setAdditionalContext('');
      setCourseId('');
    },
  });

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    if (!courseId) {
      toast.error('Please select a course');
      return;
    }

    setGenerating(true);
    try {
      const questionTypes = [];
      let mcCount = numQuestions;
      let distribution = {};
      
      const totalChecked = [includeShortAnswer, includeLongAnswer, includeImageQuestions, includeTrueFalse, includeMatching].filter(Boolean).length;
      
      if (totalChecked > 0) {
        const baseCount = Math.floor(numQuestions / (totalChecked + 1));
        mcCount = baseCount;
        
        if (includeShortAnswer) {
          questionTypes.push('short_answer');
          distribution.short_answer = baseCount;
        }
        if (includeLongAnswer) {
          questionTypes.push('long_answer');
          distribution.long_answer = Math.max(2, Math.floor(baseCount * 0.5));
        }
        if (includeImageQuestions) {
          questionTypes.push('image_based');
          distribution.image_based = baseCount;
        }
        if (includeTrueFalse) {
          questionTypes.push('true_false');
          distribution.true_false = baseCount;
        }
        if (includeMatching) {
          questionTypes.push('matching');
          distribution.matching = Math.max(1, Math.floor(baseCount * 0.3));
        }
      }
      
      distribution.multiple_choice = mcCount;

      const difficultyInstruction = mixedDifficulty 
        ? `Difficulty level: MIXED - Distribute questions across all three levels:
   - ${Math.ceil(numQuestions * 0.3)} Easy questions (recall and basic understanding)
   - ${Math.ceil(numQuestions * 0.4)} Medium questions (application and analysis)
   - ${Math.ceil(numQuestions * 0.3)} Hard questions (synthesis, evaluation, critical thinking)
   Clearly mark each question's difficulty level.`
        : `Difficulty level: ${difficulty}
${difficulty === 'easy' ? '- Focus on recall and basic understanding' : difficulty === 'medium' ? '- Require application and analysis' : '- Demand synthesis, evaluation, and critical thinking'}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert A-level examination board question writer. Create ${numQuestions} rigorous, academically challenging quiz questions about: "${topic}"${subtopic ? ` (Subtopic: ${subtopic})` : ''}
        
${additionalContext ? `Additional context: ${additionalContext}` : ''}

${difficultyInstruction}

Question Types Distribution:
- ${distribution.multiple_choice || mcCount} Multiple Choice questions
${distribution.short_answer ? `- ${distribution.short_answer} Short Answer questions (1-2 sentence answers)` : ''}
${distribution.long_answer ? `- ${distribution.long_answer} Long Answer questions (paragraph answers, ${marksPerQuestion * 3}-${marksPerQuestion * 5} marks)` : ''}
${distribution.image_based ? `- ${distribution.image_based} Image/Diagram based questions (include placeholder image URLs)` : ''}
${distribution.true_false ? `- ${distribution.true_false} True/False questions with detailed justification` : ''}
${distribution.matching ? `- ${distribution.matching} Matching questions (5-8 pairs per question)` : ''}

CRITICAL REQUIREMENTS:
1. Mathematical Notation: Use LaTeX formatting
   - Inline math: $x^2 + y^2 = r^2$
   - Display math: $$E = mc^2$$
   - Chemistry: \\ce{H2SO4}, \\ce{2H2O -> 2H2 + O2}
   - Physics: Include units and proper notation

2. Question Quality Standards:
   - Questions must be clear, unambiguous, and academically rigorous
   - Avoid trick questions or ambiguous phrasing
   - Include real-world applications and problem-solving scenarios
   - Test understanding, not just memorization
   - Use proper academic terminology

3. Multiple Choice Excellence:
   - Create plausible distractors (wrong answers that seem reasonable)
   - Randomly vary which option (0-3) is correct across questions
   - DO NOT always make option 0 or 1 correct
   - Each distractor should represent a common misconception
   - Options should be similar in length and complexity

4. PERSONALIZED FEEDBACK (CRITICAL):
   - For EACH incorrect option in multiple choice, provide specific feedback explaining why that answer is wrong
   - Create an "option_feedback" object with keys for each option index (0-3)
   - Each feedback should address the specific misconception or error in that option
   - Format: "option_feedback": {"0": "This is wrong because...", "1": "Correct!", "2": "This assumes X but...", "3": "This confuses Y with Z..."}
   - For true/false: explain both why true is right/wrong AND why false is right/wrong
   - Make feedback educational and constructive, not just "incorrect"

5. Answer Explanations:
   - Explain WHY the correct answer is right
   - Reference key concepts and principles
   - Include step-by-step reasoning for calculations

6. Cognitive Levels (distribute across questions):
   - Recall/Knowledge: 20%
   - Understanding/Comprehension: 30%
   - Application: 25%
   - Analysis: 15%
   - Synthesis/Evaluation: 10%

For each question create:
- question: Clear, well-structured question with LaTeX math where needed
- question_type: "multiple_choice", "short_answer", "long_answer", "image_based", "true_false", or "matching"
${mixedDifficulty ? '- difficulty_level: "easy", "medium", or "hard" (required for mixed difficulty)' : ''}
- For multiple choice:
  * options: Array of 4 options (use LaTeX for math/science)
  * correct_answer: Index 0-3 (VARY THIS across questions)
  * option_feedback: Object with feedback for EACH option {"0": "feedback", "1": "feedback", "2": "feedback", "3": "feedback"}
- For true/false:
  * correct_answer: 0 for True, 1 for False
  * options: ["True", "False"]
  * option_feedback: {"0": "why true is correct/wrong", "1": "why false is correct/wrong"}
- For matching:
  * matching_pairs: Array of objects [{"left": "Term/concept", "right": "Definition/match", "pair_id": 1}, ...]
  * Create 5-8 pairs, each with unique pair_id
- For short/long answer:
  * correct_text_answer: Detailed model answer with key points
- For image questions:
  * image_url: "https://via.placeholder.com/600x400/6366F1/FFFFFF?text=Diagram+Here"
- explanation: Comprehensive explanation with reasoning (general, not option-specific)
- marks: ${marksPerQuestion} for MC/short/TF, ${marksPerQuestion * 2} for matching, ${marksPerQuestion * 3} for long answer
${timePerQuestion ? `- time_limit_seconds: ${timePerQuestion} for MC/TF, ${timePerQuestion * 1.5} for matching, ${timePerQuestion * 2} for short answer, ${timePerQuestion * 3} for long answer` : ''}

Return JSON:
{
  "title": "Engaging, descriptive quiz title",
  "description": "Comprehensive description of learning outcomes covered",
  "questions": [
    {
      "question": "Question text with LaTeX where appropriate",
      "question_type": "multiple_choice|short_answer|long_answer|image_based|true_false|matching",
      ${mixedDifficulty ? '"difficulty_level": "easy|medium|hard",' : ''}
      "image_url": "url for image questions only",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 2,
      "option_feedback": {"0": "Specific feedback for option A", "1": "Specific feedback for option B", "2": "Correct! This is right because...", "3": "Specific feedback for option D"},
      "matching_pairs": [{"left": "Term 1", "right": "Definition 1", "pair_id": 1}, {"left": "Term 2", "right": "Definition 2", "pair_id": 2}],
      "correct_text_answer": "Model answer for text-based questions",
      "explanation": "General explanation with reasoning and key concepts",
      "marks": ${marksPerQuestion},
      "time_limit_seconds": ${timePerQuestion}
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
                  question_type: { type: "string" },
                  difficulty_level: { type: "string" },
                  image_url: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correct_answer: { type: "number" },
                  option_feedback: { type: "object" },
                  matching_pairs: { 
                    type: "array", 
                    items: { 
                      type: "object",
                      properties: {
                        left: { type: "string" },
                        right: { type: "string" },
                        pair_id: { type: "number" }
                      }
                    }
                  },
                  correct_text_answer: { type: "string" },
                  explanation: { type: "string" },
                  marks: { type: "number" },
                  time_limit_seconds: { type: "number" }
                }
              }
            }
          }
        }
      });

      if (!result || !result.questions || result.questions.length === 0) {
        throw new Error('AI returned invalid quiz data. Please try again.');
      }

      setGeneratedQuiz(result);
      toast.success('Quiz generated successfully!');
    } catch (error) {
      console.error('Quiz generation error:', error);
      
      let errorMessage = 'Failed to generate quiz. ';
      if (error?.message) {
        errorMessage += error.message;
      } else if (typeof error === 'string') {
        errorMessage += error;
      } else {
        errorMessage += 'Please check your inputs and try again.';
      }
      
      toast.error(errorMessage, { duration: 5000 });
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
      lesson_id: lessonId || null,
      topic,
      subtopic,
      difficulty,
      passing_score: 70,
      total_marks: totalMarks
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
            <Label>Publish Quiz To Course *</Label>
            <select
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                setLessonId('');
              }}
              className="w-full h-10 px-3 rounded-md border border-gray-300"
              required
            >
              <option value="">Select Course</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Quiz will be visible to students enrolled in this course</p>
          </div>

          <div>
            <Label>Link to Lesson (Optional)</Label>
            <select
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-gray-300"
              disabled={!courseId}
            >
              <option value="">No specific lesson</option>
              {lessons.map(l => (
                <option key={l.id} value={l.id}>{l.title}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Quiz will appear at the end of this lesson</p>
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
                disabled={mixedDifficulty}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={mixedDifficulty}
                  onChange={(e) => setMixedDifficulty(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm text-gray-600">Mixed difficulty levels</span>
              </label>
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
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTrueFalse}
                  onChange={(e) => setIncludeTrueFalse(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span className="text-sm">True/False Questions</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeMatching}
                  onChange={(e) => setIncludeMatching(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span className="text-sm">Matching Questions</span>
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
                {!mixedDifficulty && (
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                    difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {difficulty}
                  </span>
                )}
                {mixedDifficulty && (
                  <span className="text-xs bg-gradient-to-r from-green-100 via-yellow-100 to-red-100 text-gray-700 px-2 py-1 rounded-full font-medium border border-gray-300">
                    Mixed Difficulty
                  </span>
                )}
              </div>
            </div>

            <div className="max-h-[500px] overflow-y-auto space-y-3">
              {generatedQuiz.questions.map((q, idx) => (
                <Card key={idx} className="p-4 bg-gray-50">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="font-bold text-indigo-600">{idx + 1}.</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <MathJax className="font-medium text-gray-900 flex-1">{q.question}</MathJax>
                        {q.question_type && (
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                            q.question_type === 'multiple_choice' ? 'bg-blue-100 text-blue-700' :
                            q.question_type === 'short_answer' ? 'bg-purple-100 text-purple-700' :
                            q.question_type === 'long_answer' ? 'bg-pink-100 text-pink-700' :
                            q.question_type === 'true_false' ? 'bg-teal-100 text-teal-700' :
                            q.question_type === 'matching' ? 'bg-amber-100 text-amber-700' :
                            'bg-cyan-100 text-cyan-700'
                          }`}>
                            {q.question_type.replace(/_/g, ' ')}
                          </span>
                        )}
                        {q.difficulty_level && (
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                            q.difficulty_level === 'easy' ? 'bg-green-100 text-green-700' :
                            q.difficulty_level === 'hard' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {q.difficulty_level}
                          </span>
                        )}
                      </div>
                      
                      {q.image_url && (
                        <img src={q.image_url} alt="Question diagram" className="w-full rounded-lg mb-2 border" />
                      )}
                      
                      {q.matching_pairs && q.matching_pairs.length > 0 ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                          <p className="text-xs font-semibold text-amber-800 mb-2">Match the pairs:</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-gray-600 mb-1">Terms:</p>
                              {q.matching_pairs.map((pair, pIdx) => (
                                <div key={pIdx} className="text-sm bg-white px-2 py-1 rounded border">
                                  <MathJax>{pIdx + 1}. {pair.left}</MathJax>
                                </div>
                              ))}
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-gray-600 mb-1">Matches:</p>
                              {q.matching_pairs.map((pair, pIdx) => (
                                <div key={pIdx} className="text-sm bg-green-50 px-2 py-1 rounded border border-green-200">
                                  <MathJax>{String.fromCharCode(65 + pIdx)}. {pair.right}</MathJax>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : q.options && q.options.length > 0 ? (
                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="space-y-1">
                              <div
                                className={`text-sm px-3 py-2 rounded ${
                                  q.correct_answer === optIdx
                                    ? 'bg-green-100 text-green-800 font-medium border-2 border-green-300'
                                    : 'bg-white text-gray-700 border border-gray-200'
                                }`}
                              >
                                <MathJax>
                                  {q.question_type === 'true_false' ? opt : `${String.fromCharCode(65 + optIdx)}. ${opt}`}
                                </MathJax>
                                {q.correct_answer === optIdx && ' ✓'}
                              </div>
                              {q.option_feedback && q.option_feedback[optIdx] && (
                                <div className={`text-xs px-2 py-1 rounded ml-4 ${
                                  q.correct_answer === optIdx 
                                    ? 'bg-green-50 text-green-700 border-l-2 border-green-400' 
                                    : 'bg-red-50 text-red-700 border-l-2 border-red-400'
                                }`}>
                                  <MathJax>💡 {q.option_feedback[optIdx]}</MathJax>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : q.correct_text_answer && (
                        <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                          <p className="text-xs font-semibold text-green-800 mb-1">Model Answer:</p>
                          <MathJax className="text-sm text-green-900">{q.correct_text_answer}</MathJax>
                        </div>
                      )}
                      
                      {q.explanation && (
                        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-3 rounded mt-2">
                          <p className="text-xs font-semibold text-indigo-800 mb-1">Explanation:</p>
                          <MathJax className="text-xs text-indigo-900">{q.explanation}</MathJax>
                        </div>
                      )}
                      
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                          {q.marks} mark{q.marks !== 1 ? 's' : ''}
                        </span>
                        {q.time_limit_seconds && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-medium">
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