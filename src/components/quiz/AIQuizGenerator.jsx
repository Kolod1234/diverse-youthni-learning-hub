import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, Save, RefreshCw, Brain, BookOpen, Image, X, Search } from 'lucide-react';
import { toast } from 'sonner';
import { MathJax } from 'better-react-mathjax';

async function searchWikimediaImage(query) {
  try {
    const searchQuery = encodeURIComponent(`${query} diagram biology science`);
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchQuery}&srnamespace=6&srlimit=5&format=json&origin=*`;
    const searchRes = await fetch(url);
    const searchData = await searchRes.json();
    const results = searchData?.query?.search || [];
    if (results.length === 0) return null;

    for (const result of results) {
      const title = result.title;
      const imageInfoUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|mime&format=json&origin=*`;
      const infoRes = await fetch(imageInfoUrl);
      const infoData = await infoRes.json();
      const pages = infoData?.query?.pages || {};
      const page = Object.values(pages)[0];
      const imageInfo = page?.imageinfo?.[0];
      if (imageInfo?.url && imageInfo.mime?.startsWith('image/') && !imageInfo.mime.includes('svg')) {
        return imageInfo.url;
      }
    }

    const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${searchQuery}&srnamespace=6&srlimit=5&format=json&origin=*`;
    const commonsRes = await fetch(commonsUrl);
    const commonsData = await commonsRes.json();
    const commonsResults = commonsData?.query?.search || [];

    for (const result of commonsResults) {
      const title = result.title;
      const imageInfoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|mime&format=json&origin=*`;
      const infoRes = await fetch(imageInfoUrl);
      const infoData = await infoRes.json();
      const pages = infoData?.query?.pages || {};
      const page = Object.values(pages)[0];
      const imageInfo = page?.imageinfo?.[0];
      if (imageInfo?.url && imageInfo.mime?.startsWith('image/') && !imageInfo.mime.includes('svg')) {
        return imageInfo.url;
      }
    }
    return null;
  } catch (e) {
    console.warn('Wikimedia search failed:', e);
    return null;
  }
}

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
  const [searchingImages, setSearchingImages] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [includePastPapers, setIncludePastPapers] = useState(false);
  const [pastPaperSubject, setPastPaperSubject] = useState('');
  const [pastPaperQualification, setPastPaperQualification] = useState('GCSE');
  const [pastPaperExamBoard, setPastPaperExamBoard] = useState('CCEA');
  const queryClient = useQueryClient();

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
    mutationFn: (data) => base44.entities.Quiz.create({ ...data, is_published: true }),
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
    if (!topic.trim()) { toast.error('Please enter a topic'); return; }
    if (!courseId) { toast.error('Please select a course'); return; }
    setGenerating(true);
    try {
      let pastPaperQuestions = [];
      if (includePastPapers) {
        try {
          const filter = { is_published: true };
          if (pastPaperSubject) filter.subject = pastPaperSubject;
          if (pastPaperQualification) filter.qualification_type = pastPaperQualification;
          if (pastPaperExamBoard) filter.exam_board = pastPaperExamBoard;
          const allPastPapers = await base44.entities.PastPaperQuestion.filter(filter, '-year', 200);
          const topicLower = topic.toLowerCase();
          const subtopicLower = subtopic.toLowerCase();
          pastPaperQuestions = allPastPapers.filter(q => {
            const qTopic = (q.topic || '').toLowerCase();
            const qSubtopic = (q.subtopic || '').toLowerCase();
            return qTopic.includes(topicLower) || topicLower.includes(qTopic) ||
              (subtopicLower && (qSubtopic.includes(subtopicLower) || subtopicLower.includes(qSubtopic)));
          });
          pastPaperQuestions = pastPaperQuestions.slice(0, Math.floor(numQuestions / 2));
        } catch (e) {
          console.warn('Could not fetch past paper questions', e);
        }
      }

      const aiQuestionCount = numQuestions - pastPaperQuestions.length;
      const totalChecked = [includeShortAnswer, includeLongAnswer, includeImageQuestions, includeTrueFalse, includeMatching].filter(Boolean).length;
      let mcCount = aiQuestionCount;
      let distribution = {};
      if (totalChecked > 0) {
        const baseCount = Math.floor(aiQuestionCount / (totalChecked + 1));
        mcCount = baseCount;
        if (includeShortAnswer) distribution.short_answer = baseCount;
        if (includeLongAnswer) distribution.long_answer = Math.max(2, Math.floor(baseCount * 0.5));
        if (includeImageQuestions) distribution.image_based = baseCount;
        if (includeTrueFalse) distribution.true_false = baseCount;
        if (includeMatching) distribution.matching = Math.max(1, Math.floor(baseCount * 0.3));
      }
      distribution.multiple_choice = mcCount;

      const difficultyInstruction = mixedDifficulty
        ? `Difficulty: MIXED - ${Math.ceil(aiQuestionCount * 0.3)} Easy, ${Math.ceil(aiQuestionCount * 0.4)} Medium, ${Math.ceil(aiQuestionCount * 0.3)} Hard`
        : `Difficulty: ${difficulty}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert A-level examination board question writer. Create ${aiQuestionCount} rigorous quiz questions about: "${topic}"${subtopic ? ` (Subtopic: ${subtopic})` : ''}
${additionalContext ? `\nAdditional context: ${additionalContext}` : ''}
${difficultyInstruction}

Question Types:
- ${distribution.multiple_choice || mcCount} Multiple Choice
${distribution.short_answer ? `- ${distribution.short_answer} Short Answer` : ''}
${distribution.long_answer ? `- ${distribution.long_answer} Long Answer` : ''}
${distribution.image_based ? `- ${distribution.image_based} Image/Diagram based. Include "image_search_query" field with 3-5 Wikimedia search words (e.g. "alveoli structure unlabelled", "mitosis stages diagram")` : ''}
${distribution.true_false ? `- ${distribution.true_false} True/False` : ''}
${distribution.matching ? `- ${distribution.matching} Matching` : ''}

REQUIREMENTS:
1. Chemistry formulas as plain text: H2SO4, not LaTeX. Only use LaTeX for complex math: $x^2$
2. Vary correct answer position (0-3) across questions
3. Include option_feedback for each option
4. For image questions: include image_search_query with specific Wikimedia terms

Return JSON: { "title": "...", "description": "...", "questions": [{ "question": "...", "question_type": "multiple_choice|short_answer|long_answer|image_based|true_false|matching", ${mixedDifficulty ? '"difficulty_level": "easy|medium|hard",' : ''} "image_search_query": "wikimedia terms", "options": [], "correct_answer": 0, "option_feedback": {"0":"...","1":"...","2":"...","3":"..."}, "matching_pairs": [{"left":"","right":"","pair_id":1}], "correct_text_answer": "...", "explanation": "...", "marks": ${marksPerQuestion}, "time_limit_seconds": ${timePerQuestion} }] }`,
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
                  image_search_query: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correct_answer: { type: "number" },
                  option_feedback: { type: "object" },
                  matching_pairs: { type: "array", items: { type: "object", properties: { left: { type: "string" }, right: { type: "string" }, pair_id: { type: "number" } } } },
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

      if (!result?.questions?.length) throw new Error('AI returned invalid quiz data. Please try again.');

      setSearchingImages(true);
      const questionsWithImages = await Promise.all(
        result.questions.map(async (q) => {
          if (q.question_type === 'image_based' && q.image_search_query) {
            const imageUrl = await searchWikimediaImage(`${q.image_search_query} ${topic}`);
            return { ...q, image_url: imageUrl || null, image_source: imageUrl ? 'wikimedia' : null };
          }
          return q;
        })
      );
      setSearchingImages(false);

      const pastPaperFormatted = pastPaperQuestions.map(ppq => ({
        question: ppq.question_text,
        question_type: ppq.question_type || 'multiple_choice',
        options: ppq.options || [],
        correct_answer: ppq.correct_answer,
        explanation: ppq.mark_scheme || '',
        marks: ppq.marks || marksPerQuestion,
        time_limit_seconds: timePerQuestion,
        image_url: ppq.image_url || null,
        source: 'past_paper',
        source_label: `📄 ${ppq.exam_board} ${ppq.qualification_type} ${ppq.year}${ppq.paper ? ` – ${ppq.paper}` : ''}${ppq.question_number ? ` Q${ppq.question_number}` : ''}`,
      }));

      const aiFormatted = questionsWithImages.map(q => ({ ...q, source: 'ai_generated', source_label: '🤖 AI Generated' }));
      const allQuestions = [...pastPaperFormatted, ...aiFormatted].sort(() => Math.random() - 0.5);
      setGeneratedQuiz({ ...result, questions: allQuestions });

      const imageCount = allQuestions.filter(q => q.image_url).length;
      const imageQCount = allQuestions.filter(q => q.question_type === 'image_based').length;
      toast.success(`Quiz generated! ${pastPaperFormatted.length > 0 ? `${pastPaperFormatted.length} past paper + ${aiFormatted.length} AI` : `${aiFormatted.length} AI questions`}${imageQCount > 0 ? `. ${imageCount}/${imageQCount} diagrams from Wikimedia.` : ''}`);
    } catch (error) {
      toast.error('Failed to generate quiz. ' + (error?.message || 'Please try again.'), { duration: 5000 });
    } finally {
      setGenerating(false);
      setSearchingImages(false);
    }
  };

  const handleReplaceImage = (questionIdx, newUrl) => {
    setGeneratedQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => i === questionIdx ? { ...q, image_url: newUrl } : q)
    }));
  };

  const handleSaveGenerated = () => {
    if (!generatedQuiz) return;
    const totalMarks = generatedQuiz.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
    saveQuizMutation.mutate({ ...generatedQuiz, course_id: courseId, lesson_id: lessonId || null, topic, subtopic, difficulty, passing_score: 70, total_marks: totalMarks });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
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
            <div><Label>Topic *</Label><Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Respiration" /></div>
            <div><Label>Subtopic</Label><Input value={subtopic} onChange={(e) => setSubtopic(e.target.value)} placeholder="e.g., Alveoli" /></div>
          </div>
          <div>
            <Label>Publish Quiz To Course *</Label>
            <select value={courseId} onChange={(e) => { setCourseId(e.target.value); setLessonId(''); }} className="w-full h-10 px-3 rounded-md border border-gray-300">
              <option value="">Select Course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <p className="text-xs text-gray-500 mt-1">Quiz will be visible to students enrolled in this course</p>
          </div>
          <div>
            <Label>Link to Lesson (Optional)</Label>
            <select value={lessonId} onChange={(e) => setLessonId(e.target.value)} className="w-full h-10 px-3 rounded-md border border-gray-300" disabled={!courseId}>
              <option value="">No specific lesson</option>
              {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
            </select>
          </div>
          <div><Label>Additional Context (Optional)</Label><Textarea value={additionalContext} onChange={(e) => setAdditionalContext(e.target.value)} placeholder="Add specific topics, learning objectives, or context..." rows={3} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Number of Questions</Label><Input type="number" value={numQuestions} onChange={(e) => setNumQuestions(parseInt(e.target.value) || 10)} min="1" max="50" /></div>
            <div>
              <Label>Difficulty</Label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full h-10 px-3 rounded-md border border-gray-300" disabled={mixedDifficulty}>
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </select>
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input type="checkbox" checked={mixedDifficulty} onChange={(e) => setMixedDifficulty(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" />
                <span className="text-sm text-gray-600">Mixed difficulty levels</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Marks per Question</Label><Input type="number" value={marksPerQuestion} onChange={(e) => setMarksPerQuestion(parseInt(e.target.value) || 1)} min="1" /></div>
            <div><Label>Time per Question (sec)</Label><Input type="number" value={timePerQuestion} onChange={(e) => setTimePerQuestion(parseInt(e.target.value) || 60)} min="10" /></div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <input type="checkbox" checked={includePastPapers} onChange={(e) => setIncludePastPapers(e.target.checked)} className="w-4 h-4 text-amber-600 rounded" />
              <span className="font-medium text-amber-800 flex items-center gap-2"><BookOpen className="w-4 h-4" />Include Past Paper Questions</span>
            </label>
            {includePastPapers && (
              <div className="space-y-3 mt-2">
                <p className="text-xs text-amber-700">Questions from the past paper bank will be mixed in and labelled with their year and exam board.</p>
                <div>
                  <Label className="text-xs">Subject</Label>
                  <select value={pastPaperSubject} onChange={(e) => setPastPaperSubject(e.target.value)} className="w-full h-9 px-3 rounded-md border border-amber-300 text-sm bg-white">
                    <option value="">All Subjects</option>
                    {['Mathematics','English','Biology','Chemistry','Physics','History','Geography','Religious Studies','French','Spanish','ICT','Business Studies','Other'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Qualification</Label>
                    <select value={pastPaperQualification} onChange={(e) => setPastPaperQualification(e.target.value)} className="w-full h-9 px-3 rounded-md border border-amber-300 text-sm bg-white">
                      <option value="">All</option><option value="GCSE">GCSE</option><option value="A-Level">A-Level</option><option value="AS-Level">AS-Level</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Exam Board</Label>
                    <select value={pastPaperExamBoard} onChange={(e) => setPastPaperExamBoard(e.target.value)} className="w-full h-9 px-3 rounded-md border border-amber-300 text-sm bg-white">
                      <option value="">All</option><option value="CCEA">CCEA</option><option value="AQA">AQA</option><option value="Edexcel">Edexcel</option><option value="OCR">OCR</option><option value="WJEC">WJEC</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <Label className="mb-3 block">Question Types to Include</Label>
            <div className="space-y-2">
              {[
                [includeShortAnswer, setIncludeShortAnswer, 'Short Answer Questions'],
                [includeLongAnswer, setIncludeLongAnswer, 'Long Answer Questions (essay-style)'],
                [includeImageQuestions, setIncludeImageQuestions, 'Image/Diagram Based Questions (sourced from Wikimedia)'],
                [includeTrueFalse, setIncludeTrueFalse, 'True/False Questions'],
                [includeMatching, setIncludeMatching, 'Matching Questions'],
              ].map(([checked, setter, label]) => (
                <label key={label} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={checked} onChange={(e) => setter(e.target.checked)} className="w-4 h-4 text-purple-600 rounded" />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
            {includeImageQuestions && <p className="text-xs text-purple-600 mt-2 flex items-center gap-1"><Image className="w-3 h-3" />Diagrams sourced automatically from Wikimedia Commons</p>}
          </div>

          <Button onClick={handleGenerate} disabled={generating || searchingImages} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 h-12">
            {generating ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Generating Quiz...</> : searchingImages ? <><Search className="w-5 h-5 mr-2 animate-pulse" />Finding Diagrams...</> : <><Sparkles className="w-5 h-5 mr-2" />Generate Quiz</>}
          </Button>
        </div>
      </Card>

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
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">{generatedQuiz.questions.length} questions</span>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">{generatedQuiz.questions.reduce((sum, q) => sum + (q.marks || 1), 0)} marks</span>
                {generatedQuiz.questions.filter(q => q.source === 'past_paper').length > 0 && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">📄 {generatedQuiz.questions.filter(q => q.source === 'past_paper').length} past paper</span>}
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">🤖 {generatedQuiz.questions.filter(q => q.source === 'ai_generated').length} AI generated</span>
                {generatedQuiz.questions.filter(q => q.image_url).length > 0 && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">🖼️ {generatedQuiz.questions.filter(q => q.image_url).length} diagrams</span>}
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
                        {q.source_label && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${q.source === 'past_paper' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-purple-100 text-purple-700'}`}>{q.source_label}</span>}
                        {q.question_type && <span className={`text-xs px-2 py-0.5 rounded font-medium ${q.question_type === 'multiple_choice' ? 'bg-blue-100 text-blue-700' : q.question_type === 'short_answer' ? 'bg-purple-100 text-purple-700' : q.question_type === 'long_answer' ? 'bg-pink-100 text-pink-700' : q.question_type === 'true_false' ? 'bg-teal-100 text-teal-700' : q.question_type === 'matching' ? 'bg-amber-100 text-amber-700' : 'bg-cyan-100 text-cyan-700'}`}>{q.question_type.replace(/_/g, ' ')}</span>}
                        {q.difficulty_level && <span className={`text-xs px-2 py-0.5 rounded font-medium ${q.difficulty_level === 'easy' ? 'bg-green-100 text-green-700' : q.difficulty_level === 'hard' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{q.difficulty_level}</span>}
                      </div>

                      {q.question_type === 'image_based' && (
                        <div className="mb-3">
                          {q.image_url ? (
                            <div>
                              <img src={q.image_url} alt="Question diagram" className="w-full rounded-lg border max-h-48 object-contain bg-white" onError={(e) => { e.target.style.display = 'none'; }} />
                              <p className="text-xs text-gray-400 mt-1">🌐 Source: Wikimedia Commons</p>
                              <Input placeholder="Paste a different image URL and press Enter to replace..." className="text-xs h-8 mt-2" onKeyDown={(e) => { if (e.key === 'Enter' && e.target.value) { handleReplaceImage(idx, e.target.value); e.target.value = ''; } }} />
                            </div>
                          ) : (
                            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                              <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-xs text-gray-500 mb-2">No diagram found automatically</p>
                              <Input placeholder="Paste an image URL and press Enter..." className="text-xs h-8" onKeyDown={(e) => { if (e.key === 'Enter' && e.target.value) { handleReplaceImage(idx, e.target.value); e.target.value = ''; } }} />
                            </div>
                          )}
                        </div>
                      )}

                      {q.matching_pairs?.length > 0 ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                          <p className="text-xs font-semibold text-amber-800 mb-2">Match the pairs:</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1"><p className="text-xs font-semibold text-gray-600 mb-1">Terms:</p>{q.matching_pairs.map((pair, pIdx) => <div key={pIdx} className="text-sm bg-white px-2 py-1 rounded border"><MathJax>{pIdx + 1}. {pair.left}</MathJax></div>)}</div>
                            <div className="space-y-1"><p className="text-xs font-semibold text-gray-600 mb-1">Matches:</p>{q.matching_pairs.map((pair, pIdx) => <div key={pIdx} className="text-sm bg-green-50 px-2 py-1 rounded border border-green-200"><MathJax>{String.fromCharCode(65 + pIdx)}. {pair.right}</MathJax></div>)}</div>
                          </div>
                        </div>
                      ) : q.options?.length > 0 ? (
                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="space-y-1">
                              <div className={`text-sm px-3 py-2 rounded ${q.correct_answer === optIdx ? 'bg-green-100 text-green-800 font-medium border-2 border-green-300' : 'bg-white text-gray-700 border border-gray-200'}`}>
                                <MathJax>{q.question_type === 'true_false' ? opt : `${String.fromCharCode(65 + optIdx)}. ${opt}`}</MathJax>
                                {q.correct_answer === optIdx && ' ✓'}
                              </div>
                              {q.option_feedback?.[optIdx] && <div className={`text-xs px-2 py-1 rounded ml-4 ${q.correct_answer === optIdx ? 'bg-green-50 text-green-700 border-l-2 border-green-400' : 'bg-red-50 text-red-700 border-l-2 border-red-400'}`}><MathJax>💡 {q.option_feedback[optIdx]}</MathJax></div>}
                            </div>
                          ))}
                        </div>
                      ) : q.correct_text_answer && (
                        <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                          <p className="text-xs font-semibold text-green-800 mb-1">Model Answer:</p>
                          <MathJax className="text-sm text-green-900">{q.correct_text_answer}</MathJax>
                        </div>
                      )}

                      {q.explanation && <div className="bg-indigo-50 border-l-4 border-indigo-500 p-3 rounded mt-2"><p className="text-xs font-semibold text-indigo-800 mb-1">Explanation:</p><MathJax className="text-xs text-indigo-900">{q.explanation}</MathJax></div>}
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                        {q.time_limit_seconds && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-medium">⏱️ {q.time_limit_seconds}s</span>}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSaveGenerated} disabled={saveQuizMutation.isPending} className="flex-1 bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />{saveQuizMutation.isPending ? 'Saving...' : 'Save Quiz'}
              </Button>
              <Button onClick={handleGenerate} disabled={generating} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />Regenerate
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}