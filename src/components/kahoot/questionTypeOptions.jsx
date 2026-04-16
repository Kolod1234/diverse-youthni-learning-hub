export const QUESTION_TYPE_OPTIONS = [
  {
    value: 'image_based',
    label: 'Diagram based',
    description: 'Questions using images, diagrams, charts, or visuals.',
    defaultQuestion: { question: '', question_type: 'image_based', options: ['', '', '', ''], correct_answer: 0, correct_text_answer: '', time_limit_seconds: 20, image_url: '' }
  },
  {
    value: 'true_false',
    label: 'True or false',
    description: 'Simple true or false statements.',
    defaultQuestion: { question: '', question_type: 'true_false', options: ['True', 'False'], correct_answer: 0, correct_text_answer: '', time_limit_seconds: 15, image_url: '' }
  },
  {
    value: 'multiple_choice',
    label: 'Multiple choice',
    description: 'Classic four-option quiz questions.',
    defaultQuestion: { question: '', question_type: 'multiple_choice', options: ['', '', '', ''], correct_answer: 0, correct_text_answer: '', time_limit_seconds: 20, image_url: '' }
  },
  {
    value: 'fill_in_the_gap',
    label: 'Fill in the gap',
    description: 'Learners type the missing word or phrase.',
    defaultQuestion: { question: '', question_type: 'fill_in_the_gap', options: [], correct_answer: 0, correct_text_answer: '', time_limit_seconds: 20, image_url: '' }
  },
  {
    value: 'autism_identification',
    label: 'Autism identification',
    description: 'Clear visual identification prompts for children with autism.',
    defaultQuestion: { question: '', question_type: 'autism_identification', options: ['', '', '', ''], correct_answer: 0, correct_text_answer: '', time_limit_seconds: 25, image_url: '' }
  },
  {
    value: 'short_answer',
    label: 'Short answer',
    description: 'Students answer with a short typed response.',
    defaultQuestion: { question: '', question_type: 'short_answer', options: [], correct_answer: 0, correct_text_answer: '', time_limit_seconds: 25, image_url: '' }
  },
  {
    value: 'long_answer',
    label: 'Long answer',
    description: 'Students write a longer free-text answer.',
    defaultQuestion: { question: '', question_type: 'long_answer', options: [], correct_answer: 0, correct_text_answer: '', time_limit_seconds: 60, image_url: '' }
  }
];

export function buildQuestionsByType(questionType, count) {
  const option = QUESTION_TYPE_OPTIONS.find((item) => item.value === questionType) || QUESTION_TYPE_OPTIONS[2];
  return Array.from({ length: count }, () => ({ ...option.defaultQuestion, options: [...(option.defaultQuestion.options || [])] }));
}