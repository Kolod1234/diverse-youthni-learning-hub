export const QUESTION_STYLES = [
  { value: "multiple_choice", label: "Multiple choice" },
  { value: "short_answer", label: "Short answer" },
  { value: "long_answer", label: "Long essay answer" },
];

export const practiceSchema = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          type: { type: "string", enum: ["multiple_choice", "short_answer", "long_answer"] },
          options: { type: "array", items: { type: "string" } },
          correctAnswers: { type: "array", items: { type: "integer" } },
          optionFeedback: { type: "array", items: { type: "string" } },
          modelAnswer: { type: "string" },
          keyPoints: { type: "array", items: { type: "string" } },
          explanation: { type: "string" },
        },
        required: ["question", "type", "options", "correctAnswers", "optionFeedback", "modelAnswer", "keyPoints", "explanation"],
      },
    },
  },
  required: ["questions"],
};

export const isAnswered = (question, answer) => question.type === "multiple_choice"
  ? Array.isArray(answer) && answer.length > 0
  : typeof answer === "string" && answer.trim().length > 0;

export const assessMultipleChoice = (question, selected = []) => {
  const correct = [...question.correctAnswers].sort((a, b) => a - b);
  const chosen = [...selected].sort((a, b) => a - b);
  const isCorrect = correct.length === chosen.length && correct.every((value, index) => value === chosen[index]);
  const relevant = [...new Set([...chosen.filter(value => !correct.includes(value)), ...correct.filter(value => !chosen.includes(value))])];
  return {
    isCorrect,
    reason: isCorrect ? question.explanation : relevant.map(index => question.optionFeedback[index]).filter(Boolean).join(" ") || question.explanation,
    improvement: isCorrect ? "" : `Review all correct choices: ${correct.map(index => question.options[index]).join("; ")}`,
  };
};