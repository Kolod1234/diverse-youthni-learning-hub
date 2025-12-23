import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, GripVertical, Save, Clock, Image as ImageIcon, Upload, Type, FileText } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'sonner';

export default function QuizBuilder({ courses }) {
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    course_id: '',
    lesson_id: '',
    topic: '',
    subtopic: '',
    passing_score: 70,
    time_limit_minutes: null,
    difficulty: 'medium',
    questions: [
      {
        question: '',
        question_type: 'multiple_choice',
        options: ['', '', '', ''],
        correct_answer: 0,
        correct_text_answer: '',
        image_url: '',
        explanation: '',
        marks: 1,
        time_limit_seconds: null
      }
    ]
  });

  const queryClient = useQueryClient();

  const createQuizMutation = useMutation({
    mutationFn: (data) => {
      const totalMarks = data.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
      return base44.entities.Quiz.create({ ...data, total_marks: totalMarks });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['quizzes']);
      toast.success('Quiz created successfully!');
      setQuizData({
        title: '',
        description: '',
        course_id: '',
        lesson_id: '',
        topic: '',
        subtopic: '',
        passing_score: 70,
        time_limit_minutes: null,
        difficulty: 'medium',
        questions: [
          {
            question: '',
            question_type: 'multiple_choice',
            options: ['', '', '', ''],
            correct_answer: 0,
            correct_text_answer: '',
            image_url: '',
            explanation: '',
            marks: 1,
            time_limit_seconds: null
          }
        ]
      });
    },
  });

  const addQuestion = (type = 'multiple_choice') => {
    setQuizData({
      ...quizData,
      questions: [
        ...quizData.questions,
        {
          question: '',
          question_type: type,
          options: type === 'multiple_choice' ? ['', '', '', ''] : [],
          correct_answer: 0,
          correct_text_answer: '',
          image_url: '',
          explanation: '',
          marks: type === 'long_answer' ? 5 : 1,
          time_limit_seconds: null
        }
      ]
    });
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...quizData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const updateOption = (qIndex, optIndex, value) => {
    const newQuestions = [...quizData.questions];
    const newOptions = [...newQuestions[qIndex].options];
    newOptions[optIndex] = value;
    newQuestions[qIndex] = { ...newQuestions[qIndex], options: newOptions };
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const deleteQuestion = (index) => {
    if (quizData.questions.length === 1) {
      toast.error('Quiz must have at least one question');
      return;
    }
    const newQuestions = quizData.questions.filter((_, i) => i !== index);
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(quizData.questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setQuizData({ ...quizData, questions: items });
  };

  const handleSave = () => {
    if (!quizData.title || !quizData.course_id) {
      toast.error('Please fill in title and select a course');
      return;
    }

    const hasEmptyQuestions = quizData.questions.some(q => !q.question || q.options.some(opt => !opt));
    if (hasEmptyQuestions) {
      toast.error('Please fill in all questions and options');
      return;
    }

    createQuizMutation.mutate(quizData);
  };

  const totalMarks = quizData.questions.reduce((sum, q) => sum + (q.marks || 1), 0);

  return (
    <div className="space-y-6">
      {/* Quiz Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Quiz Settings</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label>Quiz Title *</Label>
            <Input
              value={quizData.title}
              onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
              placeholder="e.g., Chapter 1 Assessment"
            />
          </div>
          <div>
            <Label>Course *</Label>
            <select
              value={quizData.course_id}
              onChange={(e) => setQuizData({ ...quizData, course_id: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-gray-300"
            >
              <option value="">Select Course</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Difficulty Level</Label>
            <select
              value={quizData.difficulty}
              onChange={(e) => setQuizData({ ...quizData, difficulty: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-gray-300"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <Label>Passing Score (%)</Label>
            <Input
              type="number"
              value={quizData.passing_score}
              onChange={(e) => setQuizData({ ...quizData, passing_score: parseInt(e.target.value) || 70 })}
              min="0"
              max="100"
            />
          </div>
          <div>
            <Label>Time Limit (minutes) - Optional</Label>
            <Input
              type="number"
              value={quizData.time_limit_minutes || ''}
              onChange={(e) => setQuizData({ ...quizData, time_limit_minutes: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="Leave blank for no limit"
            />
          </div>
          <div>
            <Label>Total Marks</Label>
            <Input
              type="number"
              value={totalMarks}
              disabled
              className="bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">Calculated from question marks</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label>Topic</Label>
            <Input
              value={quizData.topic || ''}
              onChange={(e) => setQuizData({ ...quizData, topic: e.target.value })}
              placeholder="e.g., Algebra, Photosynthesis"
            />
          </div>
          <div>
            <Label>Subtopic</Label>
            <Input
              value={quizData.subtopic || ''}
              onChange={(e) => setQuizData({ ...quizData, subtopic: e.target.value })}
              placeholder="e.g., Linear Equations, Light Reactions"
            />
          </div>
        </div>
        <div className="mt-4">
          <Label>Description</Label>
          <Textarea
            value={quizData.description}
            onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
            placeholder="Describe what this quiz covers..."
            rows={3}
          />
        </div>
      </Card>

      {/* Questions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Questions ({quizData.questions.length})</h2>
          <div className="flex gap-2">
            <Button onClick={() => addQuestion('multiple_choice')} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Multiple Choice
            </Button>
            <Button onClick={() => addQuestion('short_answer')} variant="outline" size="sm">
              <Type className="w-4 h-4 mr-1" />
              Short Answer
            </Button>
            <Button onClick={() => addQuestion('long_answer')} variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-1" />
              Long Answer
            </Button>
            <Button onClick={() => addQuestion('image_based')} variant="outline" size="sm">
              <ImageIcon className="w-4 h-4 mr-1" />
              Image Question
            </Button>
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="questions">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {quizData.questions.map((question, qIndex) => (
                  <Draggable key={qIndex} draggableId={`q-${qIndex}`} index={qIndex}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`p-6 ${snapshot.isDragging ? 'shadow-2xl' : ''}`}
                      >
                        <div className="flex items-start gap-4">
                          <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing mt-2">
                            <GripVertical className="w-5 h-5 text-gray-400" />
                          </div>

                          <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-gray-900">Question {qIndex + 1}</h3>
                                <select
                                  value={question.question_type || 'multiple_choice'}
                                  onChange={(e) => updateQuestion(qIndex, 'question_type', e.target.value)}
                                  className="h-8 px-2 text-xs border border-gray-300 rounded"
                                >
                                  <option value="multiple_choice">Multiple Choice</option>
                                  <option value="short_answer">Short Answer</option>
                                  <option value="long_answer">Long Answer</option>
                                  <option value="image_based">Image Question</option>
                                </select>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteQuestion(qIndex)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="md:col-span-2">
                                <Label>Question Text *</Label>
                                <Textarea
                                  value={question.question}
                                  onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                  placeholder="Enter your question here..."
                                  rows={2}
                                />
                              </div>

                              {(question.question_type === 'image_based' || question.question_type === 'multiple_choice') && (
                                <div className="md:col-span-2">
                                  <Label>Image/Diagram URL (Optional)</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      value={question.image_url || ''}
                                      onChange={(e) => updateQuestion(qIndex, 'image_url', e.target.value)}
                                      placeholder="https://... or upload below"
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={async () => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.accept = 'image/*';
                                        input.onchange = async (e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const { file_url } = await base44.integrations.Core.UploadFile({ file });
                                            updateQuestion(qIndex, 'image_url', file_url);
                                            toast.success('Image uploaded!');
                                          }
                                        };
                                        input.click();
                                      }}
                                    >
                                      <Upload className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  {question.image_url && (
                                    <img src={question.image_url} className="mt-2 w-full max-w-md rounded-lg border" alt="Question" />
                                  )}
                                </div>
                              )}

                              {question.question_type === 'multiple_choice' && question.options.map((option, optIndex) => (
                                <div key={optIndex}>
                                  <Label>Option {String.fromCharCode(65 + optIndex)} *</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      value={option}
                                      onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                                      placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                    />
                                    <input
                                      type="radio"
                                      name={`correct-${qIndex}`}
                                      checked={question.correct_answer === optIndex}
                                      onChange={() => updateQuestion(qIndex, 'correct_answer', optIndex)}
                                      className="w-5 h-5 text-green-600"
                                      title="Mark as correct"
                                    />
                                  </div>
                                </div>
                              ))}

                              {(question.question_type === 'short_answer' || question.question_type === 'long_answer') && (
                                <div className="md:col-span-2">
                                  <Label>Model Answer *</Label>
                                  <Textarea
                                    value={question.correct_text_answer || ''}
                                    onChange={(e) => updateQuestion(qIndex, 'correct_text_answer', e.target.value)}
                                    placeholder="Enter the expected answer or key points..."
                                    rows={question.question_type === 'long_answer' ? 4 : 2}
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    {question.question_type === 'long_answer' 
                                      ? 'Provide key points for manual grading' 
                                      : 'Exact answer or acceptable variations'}
                                  </p>
                                </div>
                              )}

                              <div>
                                <Label>Marks</Label>
                                <Input
                                  type="number"
                                  value={question.marks || 1}
                                  onChange={(e) => updateQuestion(qIndex, 'marks', parseInt(e.target.value) || 1)}
                                  min="1"
                                />
                              </div>

                              <div>
                                <Label>Time Limit (seconds) - Optional</Label>
                                <div className="flex gap-2 items-center">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <Input
                                    type="number"
                                    value={question.time_limit_seconds || ''}
                                    onChange={(e) => updateQuestion(qIndex, 'time_limit_seconds', e.target.value ? parseInt(e.target.value) : null)}
                                    placeholder="e.g., 60"
                                  />
                                </div>
                              </div>

                              <div className="md:col-span-2">
                                <Label>Explanation (shown after answer)</Label>
                                <Textarea
                                  value={question.explanation || ''}
                                  onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                                  placeholder="Explain why this is the correct answer..."
                                  rows={2}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div className="flex justify-between items-center mt-6 p-4 bg-indigo-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Total: {quizData.questions.length} questions, {totalMarks} marks</p>
            <p className="text-sm text-gray-600">
              {quizData.time_limit_minutes ? `${quizData.time_limit_minutes} min time limit` : 'No time limit'}
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={createQuizMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {createQuizMutation.isPending ? 'Saving...' : 'Save Quiz'}
          </Button>
        </div>
      </Card>
    </div>
  );
}