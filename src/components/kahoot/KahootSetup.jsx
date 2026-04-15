import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2, ChevronDown, ChevronUp, Zap, FileQuestion, Loader2 } from 'lucide-react';

const COLORS = ['#e21b3c', '#1368ce', '#26890c', '#ffa602'];

function generatePin() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function KahootSetup({ user, onGameCreated }) {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([
    { question: '', question_type: 'multiple_choice', options: ['', '', '', ''], correct_answer: 0, correct_text_answer: '', time_limit_seconds: 20, image_url: '' }
  ]);
  const [importQuizId, setImportQuizId] = useState('');
  const [importPastQuestionsFile, setImportPastQuestionsFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const [importingPastPaper, setImportingPastPaper] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showPastPaperImport, setShowPastPaperImport] = useState(false);

  const { data: quizzes = [] } = useQuery({
    queryKey: ['all-quizzes'],
    queryFn: () => base44.entities.Quiz.list('title', 200),
  });

  const handleImport = () => {
    const quiz = quizzes.find(q => q.id === importQuizId);
    if (!quiz) return;
    setTitle(quiz.title);
    const imported = (quiz.questions || [])
      .filter(q => q.question_type === 'multiple_choice' || !q.question_type)
      .map(q => ({
        question: q.question,
        question_type: q.question_type === 'short_answer' ? 'short_answer' : (q.image_url ? 'image_based' : 'multiple_choice'),
        options: q.options || ['', '', '', ''],
        correct_answer: q.correct_answer || 0,
        correct_text_answer: q.correct_text_answer || '',
        time_limit_seconds: q.time_limit_seconds || 20,
        image_url: q.image_url || '',
      }));
    if (imported.length > 0) setQuestions(imported);
    setShowImport(false);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: '', question_type: 'multiple_choice', options: ['', '', '', ''], correct_answer: 0, correct_text_answer: '', time_limit_seconds: 20, image_url: '' }]);
  };

  const removeQuestion = (i) => {
    setQuestions(questions.filter((_, idx) => idx !== i));
  };

  const updateQuestion = (i, field, value) => {
    const updated = [...questions];
    updated[i] = { ...updated[i], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (qi, oi, value) => {
    const updated = [...questions];
    updated[qi].options[oi] = value;
    setQuestions(updated);
  };

  const handlePastPaperImport = async () => {
    if (!importPastQuestionsFile) return;

    setImportingPastPaper(true);
    const upload = await base44.integrations.Core.UploadFile({ file: importPastQuestionsFile });
    const response = await base44.functions.invoke('convertUploadedPastQuestionsToKahoot', {
      fileUrl: upload.file_url,
      fileName: importPastQuestionsFile.name,
      maxQuestions: 8,
    });

    const converted = response.data?.questions || [];
    if (converted.length > 0) {
      setTitle(response.data?.title || 'Past Questions Kahoot');
      setQuestions(converted);
      setShowPastPaperImport(false);
      setImportPastQuestionsFile(null);
    }
    setImportingPastPaper(false);
  };

  const handleCreate = async () => {
    if (!title.trim() || questions.length === 0) return;
    setCreating(true);
    const pin = generatePin();
    const game = await base44.entities.KahootGame.create({
      pin,
      title,
      host_email: user?.email,
      status: 'lobby',
      current_question_index: 0,
      questions,
      participants: [],
    });
    onGameCreated(game.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center">
            <Zap className="w-7 h-7 text-yellow-900" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Create Kahoot</h1>
            <p className="text-purple-300">Host a live quiz game</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 mb-4 shadow-xl">
          <label className="block text-sm font-bold text-gray-700 mb-1">Game Title</label>
          <input
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-semibold focus:outline-none focus:border-purple-500"
            placeholder="My Epic Quiz"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        {/* Import from Quiz */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-xl">
          <button
            className="flex items-center gap-2 text-purple-700 font-semibold"
            onClick={() => setShowImport(!showImport)}
          >
            {showImport ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Import from existing Quiz
          </button>
          {showImport && (
            <div className="mt-3 flex gap-2">
              <select
                className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2"
                value={importQuizId}
                onChange={e => setImportQuizId(e.target.value)}
              >
                <option value="">Select a quiz...</option>
                {quizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
              </select>
              <button
                onClick={handleImport}
                className="bg-purple-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-purple-700"
              >
                Import
              </button>
            </div>
          )}
        </div>

        {/* Import from Past Papers */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-xl">
          <button
            className="flex items-center gap-2 text-indigo-700 font-semibold"
            onClick={() => setShowPastPaperImport(!showPastPaperImport)}
          >
            {showPastPaperImport ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <FileQuestion className="w-4 h-4" />
            Import from past questions
          </button>
          {showPastPaperImport && (
            <div className="mt-3 grid gap-3">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt,.json,.csv"
                onChange={e => setImportPastQuestionsFile(e.target.files?.[0] || null)}
                className="border-2 border-gray-200 rounded-xl px-3 py-2"
              />
              <p className="text-sm text-gray-500">Upload a past questions file and the engine will convert it into Kahoot-style multiple choice questions.</p>
              <button
                onClick={handlePastPaperImport}
                disabled={!importPastQuestionsFile || importingPastPaper}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {importingPastPaper ? <><Loader2 className="w-4 h-4 animate-spin" /> Converting...</> : 'Upload and convert to Kahoot'}
              </button>
            </div>
          )}
        </div>

        {/* Questions */}
        <div className="space-y-4 mb-4">
          {questions.map((q, qi) => (
            <div key={qi} className="bg-white rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="font-black text-gray-700">Question {qi + 1}</span>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-500">
                    Timer:
                    <select
                      className="ml-2 border border-gray-200 rounded-lg px-2 py-1 text-sm"
                      value={q.time_limit_seconds}
                      onChange={e => updateQuestion(qi, 'time_limit_seconds', parseInt(e.target.value))}
                    >
                      <option value={10}>10s</option>
                      <option value={20}>20s</option>
                      <option value={30}>30s</option>
                      <option value={60}>60s</option>
                    </select>
                  </label>
                  {questions.length > 1 && (
                    <button onClick={() => removeQuestion(qi)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <input
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 mb-3 focus:outline-none focus:border-purple-500"
                placeholder="Enter question..."
                value={q.question}
                onChange={e => updateQuestion(qi, 'question', e.target.value)}
              />
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Question type</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                    value={q.question_type || 'multiple_choice'}
                    onChange={e => updateQuestion(qi, 'question_type', e.target.value)}
                  >
                    <option value="multiple_choice">Multiple choice</option>
                    <option value="image_based">Image-based</option>
                    <option value="short_answer">Short answer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Image URL</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                    placeholder="https://..."
                    value={q.image_url || ''}
                    onChange={e => updateQuestion(qi, 'image_url', e.target.value)}
                  />
                </div>
              </div>
              {q.question_type === 'short_answer' ? (
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Correct short answer</label>
                  <input
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
                    placeholder="Enter the correct answer"
                    value={q.correct_text_answer || ''}
                    onChange={e => updateQuestion(qi, 'correct_text_answer', e.target.value)}
                  />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2 rounded-xl p-2" style={{ backgroundColor: COLORS[oi] + '22', border: `2px solid ${q.correct_answer === oi ? COLORS[oi] : '#e5e7eb'}` }}>
                        <button
                          onClick={() => updateQuestion(qi, 'correct_answer', oi)}
                          className="w-5 h-5 rounded-full border-2 flex-shrink-0"
                          style={{ backgroundColor: q.correct_answer === oi ? COLORS[oi] : 'transparent', borderColor: COLORS[oi] }}
                          title="Set as correct"
                        />
                        <input
                          className="flex-1 bg-transparent focus:outline-none text-sm font-semibold"
                          placeholder={`Option ${oi + 1}`}
                          value={opt}
                          onChange={e => updateOption(qi, oi, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Click the circle to mark the correct answer</p>
                </>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addQuestion}
          className="w-full bg-white/20 text-white border-2 border-white/40 rounded-2xl py-3 font-bold hover:bg-white/30 flex items-center justify-center gap-2 mb-4"
        >
          <Plus className="w-5 h-5" /> Add Question
        </button>

        <button
          onClick={handleCreate}
          disabled={creating || !title.trim() || questions.length === 0}
          className="w-full bg-yellow-400 text-yellow-900 rounded-2xl py-4 text-xl font-black hover:bg-yellow-300 disabled:opacity-50 shadow-xl"
        >
          {creating ? 'Creating...' : '🚀 Launch Game!'}
        </button>
      </div>
    </div>
  );
}