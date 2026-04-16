import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';

function normalizeImageUrl(url) {
  if (!url) return '';
  if (url.includes('/api/apps/') && url.includes('/files/mp/public/')) {
    return url.replace('/files/mp/public/', '/files/public/');
  }
  if (url.includes('/api/apps/') && url.includes('/files/public/')) {
    return url.replace('/api/apps/', '/images/public/').replace(/\/files\/public\/.+?\//, '/');
  }
  return url;
}
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2, ChevronDown, ChevronUp, Zap, FileQuestion, Loader2, CheckCircle, ImagePlus, Upload } from 'lucide-react';
import { KAHOOT_BACKGROUND, KAHOOT_COLORS, KAHOOT_SHAPES } from '@/components/kahoot/kahootTheme';
import { createQuestionByType } from '@/components/kahoot/questionTypes';

function generatePin() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function KahootSetup({ user, onGameCreated, setupConfig, onSetupConfigChange, questionTypes = [] }) {
  const [title, setTitle] = useState(setupConfig?.title || '');
  const [selectedQuestionType, setSelectedQuestionType] = useState(setupConfig?.selectedQuestionType || setupConfig?.questionType || 'multiple_choice');
  const [questionCount, setQuestionCount] = useState(setupConfig?.questionCount || 5);
  const [questions, setQuestions] = useState(() => Array.from({ length: setupConfig?.questionCount || 5 }, () => createQuestionByType(setupConfig?.selectedQuestionType || setupConfig?.questionType || 'multiple_choice')));
  const [importQuizId, setImportQuizId] = useState('');
  const [importPastQuestionsFile, setImportPastQuestionsFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const [importingPastPaper, setImportingPastPaper] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showPastPaperImport, setShowPastPaperImport] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

  const { data: quizzes = [] } = useQuery({
    queryKey: ['all-quizzes'],
    queryFn: () => base44.entities.Quiz.list('title', 200),
  });

  useEffect(() => {
    onSetupConfigChange?.({
      title,
      selectedQuestionType,
      questionCount,
    });
  }, [title, selectedQuestionType, questionCount, onSetupConfigChange]);

  useEffect(() => {
    setQuestions((current) => current.map((question) => (
      question.question_type === selectedQuestionType
        ? question
        : createQuestionByType(selectedQuestionType)
    )));
    setSelectedQuestionIndex(0);
  }, [selectedQuestionType]);

  useEffect(() => {
    setQuestions((current) => {
      if (current.length === questionCount) return current;
      if (current.length < questionCount) {
        return [
          ...current,
          ...Array.from({ length: questionCount - current.length }, () => createQuestionByType(selectedQuestionType))
        ];
      }
      return current.slice(0, questionCount);
    });
    setSelectedQuestionIndex((current) => Math.min(current, Math.max(0, questionCount - 1)));
  }, [questionCount, selectedQuestionType]);

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
    if (imported.length > 0) {
    setQuestions(imported);
    setSelectedQuestionIndex(0);
    }
    setShowImport(false);
  };

  const addQuestion = () => {
    const nextCount = questionCount + 1;
    setQuestionCount(nextCount);
    setQuestions([...questions, createQuestionByType(selectedQuestionType)]);
  };

  const removeQuestion = (i) => {
    const nextQuestions = questions.filter((_, idx) => idx !== i);
    setQuestions(nextQuestions);
    setQuestionCount(Math.max(1, nextQuestions.length));
    setSelectedQuestionIndex(0);
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
      setSelectedQuestionIndex(0);
      setShowPastPaperImport(false);
      setImportPastQuestionsFile(null);
    }
    setImportingPastPaper(false);
  };

  const handleQuestionMediaUpload = async (questionIndex, file) => {
    if (!file) return;
    const upload = await base44.integrations.Core.UploadFile({ file });
    const imageUrl = normalizeImageUrl(upload.file_url);
    setQuestions((current) => current.map((question, index) => (
      index === questionIndex
        ? { ...question, image_url: imageUrl, question_type: 'image_based' }
        : question
    )));
  };

  const handleQuestionMediaPaste = async (event, questionIndex) => {
    const items = Array.from(event.clipboardData?.items || []);
    const imageItem = items.find((item) => item.type.startsWith('image/'));
    if (!imageItem) return;
    event.preventDefault();
    const file = imageItem.getAsFile();
    await handleQuestionMediaUpload(questionIndex, file);
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

  const selectedQuestion = useMemo(
    () => questions[selectedQuestionIndex] || questions[0],
    [questions, selectedQuestionIndex]
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#6f4298] p-4 md:p-6">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${KAHOOT_BACKGROUND})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#7d4aa8]/90 via-[#7f58b4]/85 to-[#5f2f8b]/95" />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-[28px] bg-white/95 p-4 shadow-2xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7c948]">
              <Zap className="h-7 w-7 text-[#5b2b86]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">Strands of Ideas</h1>
              <p className="text-sm font-medium text-gray-500">{questions.length} question{questions.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
            {questions.map((q, qi) => (
              <button
                key={qi}
                onClick={() => setSelectedQuestionIndex(qi)}
                className={`w-full rounded-[24px] border p-4 text-left shadow-sm transition ${qi === selectedQuestionIndex ? 'border-[#2f80ed] bg-white ring-4 ring-[#2f80ed]/20' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-base font-black text-gray-800">Question {qi + 1}</span>
                  <span className="rounded-full bg-[#00c985] px-2.5 py-0.5 text-xs font-black text-white">★</span>
                </div>
                <p className="mb-4 line-clamp-2 text-base font-bold text-gray-700">{q.question || 'Untitled question'}</p>
                <div className="grid grid-cols-2 gap-2">
                  {KAHOOT_COLORS.map((color, oi) => (
                    <div key={oi} className="h-8 rounded-xl" style={{ backgroundColor: color }} />
                  ))}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={addQuestion}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1368ce] py-3 font-black text-white shadow-lg hover:bg-[#0f56ab]"
          >
            <Plus className="h-5 w-5" /> Add
          </button>
        </aside>

        <div className="space-y-4">
          <div className="rounded-[28px] bg-white px-6 py-5 shadow-2xl space-y-4">
            <div>
              <label className="mb-2 block text-sm font-black uppercase tracking-wide text-[#6f4298]">Game title</label>
              <input
                className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-lg font-semibold focus:border-[#6f4298] focus:outline-none"
                placeholder="My Epic Quiz"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-black uppercase tracking-wide text-[#6f4298]">Question style</label>
                <select
                  className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-sm font-semibold focus:border-[#6f4298] focus:outline-none"
                  value={selectedQuestionType}
                  onChange={e => setSelectedQuestionType(e.target.value)}
                >
                  {questionTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-black uppercase tracking-wide text-[#6f4298]">Number of questions</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-sm font-semibold focus:border-[#6f4298] focus:outline-none"
                  value={questionCount}
                  onChange={e => setQuestionCount(Math.min(30, Math.max(1, parseInt(e.target.value) || 1)))}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-[28px] bg-white/95 p-4 shadow-2xl">
              <button className="flex items-center gap-2 font-black text-[#6f4298]" onClick={() => setShowImport(!showImport)}>
                {showImport ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Import from existing quiz
              </button>
              {showImport && (
                <div className="mt-3 flex gap-2">
                  <select className="flex-1 rounded-xl border-2 border-gray-200 px-3 py-2" value={importQuizId} onChange={e => setImportQuizId(e.target.value)}>
                    <option value="">Select a quiz...</option>
                    {quizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
                  </select>
                  <button onClick={handleImport} className="rounded-xl bg-[#6f4298] px-4 py-2 font-bold text-white hover:bg-[#5c347f]">Import</button>
                </div>
              )}
            </div>

            <div className="rounded-[28px] bg-white/95 p-4 shadow-2xl">
              <button className="flex items-center gap-2 font-black text-[#6f4298]" onClick={() => setShowPastPaperImport(!showPastPaperImport)}>
                {showPastPaperImport ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                <FileQuestion className="w-4 h-4" />
                Import past questions
              </button>
              {showPastPaperImport && (
                <div className="mt-3 grid gap-3">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.json,.csv"
                    onChange={e => setImportPastQuestionsFile(e.target.files?.[0] || null)}
                    className="rounded-xl border-2 border-gray-200 px-3 py-2"
                  />
                  <p className="text-sm text-gray-500">Upload a file and visual questions will use attached extracted images when available.</p>
                  <button
                    onClick={handlePastPaperImport}
                    disabled={!importPastQuestionsFile || importingPastPaper}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#1368ce] px-4 py-2 font-bold text-white hover:bg-[#0f56ab] disabled:opacity-50"
                  >
                    {importingPastPaper ? <><Loader2 className="w-4 h-4 animate-spin" /> Converting...</> : 'Upload and convert'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5">
            {selectedQuestion && (
              <div className="rounded-[32px] bg-white/95 p-5 shadow-2xl ring-4 ring-[#2f80ed]/30">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-lg font-black text-gray-800">Question {selectedQuestionIndex + 1}</span>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold text-gray-500">
                      Timer
                      <select
                        className="ml-2 rounded-lg border border-gray-200 px-2 py-1 text-sm"
                        value={selectedQuestion.time_limit_seconds}
                        onChange={e => updateQuestion(selectedQuestionIndex, 'time_limit_seconds', parseInt(e.target.value))}
                      >
                        <option value={10}>10s</option>
                        <option value={20}>20s</option>
                        <option value={30}>30s</option>
                        <option value={60}>60s</option>
                      </select>
                    </label>
                    {questions.length > 1 && (
                      <button onClick={() => removeQuestion(selectedQuestionIndex)} className="rounded-xl bg-red-50 p-2 text-red-500 hover:bg-red-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <input
                  className="mb-4 w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-xl font-semibold focus:border-[#6f4298] focus:outline-none"
                  placeholder="Enter your question"
                  value={selectedQuestion.question}
                  onChange={e => updateQuestion(selectedQuestionIndex, 'question', e.target.value)}
                />

                <div className="mb-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-black uppercase tracking-wide text-gray-500">Question type</label>
                    <select
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                      value={selectedQuestion.question_type || 'multiple_choice'}
                      onChange={e => {
                        const nextType = e.target.value;
                        const nextQuestion = createQuestionByType(nextType);
                        updateQuestion(selectedQuestionIndex, 'question_type', nextType);
                        updateQuestion(selectedQuestionIndex, 'options', nextQuestion.options);
                        updateQuestion(selectedQuestionIndex, 'correct_answer', nextQuestion.correct_answer);
                        updateQuestion(selectedQuestionIndex, 'correct_text_answer', nextQuestion.correct_text_answer);
                        updateQuestion(selectedQuestionIndex, 'prompt_label', nextQuestion.prompt_label);
                        updateQuestion(selectedQuestionIndex, 'time_limit_seconds', nextQuestion.time_limit_seconds);
                      }}
                    >
                      {questionTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-black uppercase tracking-wide text-gray-500">Media URL</label>
                    <input
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                      placeholder="Paste image URL"
                      value={selectedQuestion.image_url || ''}
                      onChange={e => updateQuestion(selectedQuestionIndex, 'image_url', normalizeImageUrl(e.target.value))}
                    />
                  </div>
                </div>

                {['image_based', 'identification_autism'].includes(selectedQuestion.question_type) && (
                  <div
                    className="mb-5 rounded-[28px] border-2 border-dashed border-gray-300 bg-[#f5eefb] p-6 text-center"
                    onPaste={(e) => handleQuestionMediaPaste(e, selectedQuestionIndex)}
                  >
                    {selectedQuestion.image_url ? (
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <img key={normalizeImageUrl(selectedQuestion.image_url)} src={normalizeImageUrl(selectedQuestion.image_url)} alt="Question visual" className="max-h-64 rounded-3xl object-cover shadow-lg" />
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-white px-4 py-2 font-bold text-[#6f4298] shadow" htmlFor={`question-media-${selectedQuestionIndex}`}>
                            <Upload className="h-4 w-4" /> Replace media
                          </label>
                          <input id={`question-media-${selectedQuestionIndex}`} type="file" accept="image/*" className="hidden" onChange={e => handleQuestionMediaUpload(selectedQuestionIndex, e.target.files?.[0] || null)} />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#6f4298] shadow">
                          <ImagePlus className="h-8 w-8" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-800">Find and insert media</p>
                          <p className="mt-1 text-sm text-gray-500">Upload or paste an image for this question style</p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#1368ce] px-4 py-2 font-bold text-white shadow hover:bg-[#0f56ab]" htmlFor={`question-media-${selectedQuestionIndex}`}>
                            <Upload className="h-4 w-4" /> Upload file
                          </label>
                          <input id={`question-media-${selectedQuestionIndex}`} type="file" accept="image/*" className="hidden" onChange={e => handleQuestionMediaUpload(selectedQuestionIndex, e.target.files?.[0] || null)} />
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">or press Ctrl/Cmd + V</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {['short_answer', 'long_answer', 'fill_in_gap'].includes(selectedQuestion.question_type) ? (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {KAHOOT_COLORS.map((color, oi) => {
                      const isPrimaryAnswer = oi === 0;
                      return (
                        <div key={oi} className="rounded-[18px] px-5 py-5 text-white shadow-lg" style={{ backgroundColor: color }}>
                          <div className="flex items-center gap-4">
                            <div className="text-3xl font-black">{KAHOOT_SHAPES[oi] || '•'}</div>
                            <input
                              className="flex-1 bg-transparent text-lg font-bold placeholder:text-white/80 focus:outline-none"
                              placeholder={
                                oi === 0
                                  ? (selectedQuestion.question_type === 'long_answer' ? 'Enter the expected long answer' : 'Enter the correct answer')
                                  : `Optional answer ${oi + 1}`
                              }
                              value={isPrimaryAnswer ? (selectedQuestion.correct_text_answer || '') : (selectedQuestion.options?.[oi] || '')}
                              onChange={e => {
                                if (isPrimaryAnswer) {
                                  updateQuestion(selectedQuestionIndex, 'correct_text_answer', e.target.value);
                                } else {
                                  updateOption(selectedQuestionIndex, oi, e.target.value);
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => updateQuestion(selectedQuestionIndex, 'correct_answer', oi)}
                              className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-white/10"
                              title={isPrimaryAnswer ? 'Main answer' : 'Optional answer slot'}
                            >
                              {isPrimaryAnswer ? <CheckCircle className="h-7 w-7 text-white" /> : <span className="h-5 w-5 rounded-full border-2 border-white" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {selectedQuestion.options.map((opt, oi) => (
                      <div key={oi} className="rounded-[18px] px-5 py-5 text-white shadow-lg" style={{ backgroundColor: KAHOOT_COLORS[oi] || '#6b7280' }}>
                        <div className="flex items-center gap-4">
                          <div className="text-3xl font-black">{KAHOOT_SHAPES[oi] || '•'}</div>
                          <input
                            className="flex-1 bg-transparent text-lg font-bold placeholder:text-white/80 focus:outline-none"
                            placeholder={`Answer ${oi + 1}`}
                            value={opt}
                            onChange={e => updateOption(selectedQuestionIndex, oi, e.target.value)}
                          />
                          <button
                            onClick={() => updateQuestion(selectedQuestionIndex, 'correct_answer', oi)}
                            className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-white/10"
                            title="Set as correct"
                          >
                            {selectedQuestion.correct_answer === oi ? <CheckCircle className="h-7 w-7 text-white" /> : <span className="h-5 w-5 rounded-full border-2 border-white" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleCreate}
            disabled={creating || !title.trim() || questions.length === 0}
            className="w-full rounded-[24px] bg-[#f7c948] py-4 text-xl font-black text-[#4b2a74] shadow-xl hover:bg-[#f3bf2b] disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Launch Game'}
          </button>
        </div>
      </div>
    </div>
  );
}