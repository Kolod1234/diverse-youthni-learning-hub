import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { assessMultipleChoice, isAnswered, practiceSchema } from "@/components/solver/practiceQuestionConfig";

export default function usePracticeCheck(solution) {
  const [questionType, setQuestionType] = useState("multiple_choice");
  const [questions, setQuestions] = useState([]), [answers, setAnswers] = useState({}), [feedback, setFeedback] = useState([]);
  const [submitted, setSubmitted] = useState(false), [loading, setLoading] = useState(false), [checking, setChecking] = useState(false), [error, setError] = useState("");
  const generate = async () => {
    setLoading(true); setError(""); setSubmitted(false); setAnswers({}); setFeedback([]); setQuestions([]);
    try {
      const typeRules = questionType === "multiple_choice" ? "Give four plausible options. One or more answers may be correct; use zero-based correctAnswers and say 'Select all that apply' in any question with multiple correct answers. optionFeedback must explain why each matching option is correct or incorrect." : `Set options, correctAnswers and optionFeedback to empty arrays. Provide a complete ${questionType === "short_answer" ? "concise" : "structured essay"} modelAnswer and precise keyPoints for assessment.`;
      const result = await base44.integrations.Core.InvokeLLM({ prompt: `Create exactly 3 original CCEA-style ${questionType} questions for this solved ${solution.qualification} ${solution.subject} problem. Progress from direct application to transfer and misconception diagnosis. Do not claim they are official questions. ${typeRules} Every explanation must teach the reason, not merely state the answer.\n\nOriginal question: ${solution.question || "See attached question"}\n\nSolution: ${solution.answer}`, file_urls: solution.uploadedFile?.url ? [solution.uploadedFile.url] : undefined, model: "automatic", response_json_schema: practiceSchema });
      setQuestions((result.questions || []).slice(0, 3));
    } catch { setError("Practice questions could not be generated. Please try again."); } finally { setLoading(false); }
  };
  const checkAnswers = async () => {
    setChecking(true); setError("");
    try {
      let evaluations;
      if (questionType === "multiple_choice") evaluations = questions.map((question, index) => assessMultipleChoice(question, answers[index]));
      else {
        const result = await base44.integrations.Core.InvokeLLM({ prompt: `Assess these learner responses to ${solution.qualification} ${solution.subject} practice questions. For each, decide whether it meets the expected standard. Give a specific reason identifying the correct reasoning or the misconception/omission, one actionable improvement, and the supplied model answer. Do not penalise valid alternative wording.\n\n${JSON.stringify(questions.map((question, index) => ({ index, question: question.question, learnerAnswer: answers[index], keyPoints: question.keyPoints, modelAnswer: question.modelAnswer })))}`, model: "automatic", response_json_schema: { type: "object", properties: { evaluations: { type: "array", items: { type: "object", properties: { index: { type: "integer" }, isCorrect: { type: "boolean" }, reason: { type: "string" }, improvement: { type: "string" }, modelAnswer: { type: "string" } }, required: ["index", "isCorrect", "reason", "improvement", "modelAnswer"] } } }, required: ["evaluations"] } });
        evaluations = questions.map((question, index) => result.evaluations?.find(item => item.index === index) || { isCorrect: false, reason: question.explanation, improvement: "Compare your response with the model answer.", modelAnswer: question.modelAnswer });
      }
      setFeedback(evaluations); setSubmitted(true);
    } catch { setError("Answers could not be checked. Please try again."); } finally { setChecking(false); }
  };
  const canSubmit = questions.length > 0 && questions.every((question, index) => isAnswered(question, answers[index]));
  return { questionType, setQuestionType, questions, answers, setAnswers, feedback, submitted, loading, checking, error, generate, checkAnswers, canSubmit, score: feedback.filter(item => item.isCorrect).length };
}