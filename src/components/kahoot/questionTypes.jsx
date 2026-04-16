export const QUESTION_TYPE_OPTIONS = [
  { value: 'image_based', label: 'Diagram based questions', description: 'Questions that use images, diagrams, or visuals.' },
  { value: 'true_false', label: 'True or false questions', description: 'Simple true or false style questions.' },
  { value: 'multiple_choice', label: 'Multiple choice questions', description: 'Choose one answer from several options.' },
  { value: 'fill_in_gap', label: 'Fill in the gap questions', description: 'Learners type the missing word or phrase.' },
  { value: 'identification_autism', label: 'Identification questions for children with autism', description: 'Clear prompt-based identification questions with simple visual support.' },
  { value: 'short_answer', label: 'Short answers questions', description: 'Learners write a short answer.' },
  { value: 'long_answer', label: 'Long answers question', description: 'Learners write a longer written response.' }
];

export function createQuestionByType(type) {
  const base = {
    question: '',
    question_type: type,
    options: ['', '', '', ''],
    correct_answer: 0,
    correct_text_answer: '',
    accepted_answers: [],
    time_limit_seconds: 20,
    image_url: '',
    video_url: '',
    visual_description: '',
    prompt_label: ''
  };

  if (type === 'true_false') {
    return {
      ...base,
      options: ['True', 'False'],
      correct_answer: 0,
      time_limit_seconds: 15
    };
  }

  if (type === 'fill_in_gap') {
    return {
      ...base,
      correct_text_answer: '',
      time_limit_seconds: 20
    };
  }

  if (type === 'identification_autism') {
    return {
      ...base,
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      prompt_label: 'Identify the correct item',
      time_limit_seconds: 25
    };
  }

  if (type === 'short_answer') {
    return {
      ...base,
      time_limit_seconds: 30
    };
  }

  if (type === 'long_answer') {
    return {
      ...base,
      time_limit_seconds: 60
    };
  }

  if (type === 'image_based') {
    return {
      ...base,
      time_limit_seconds: 20
    };
  }

  return base;
}