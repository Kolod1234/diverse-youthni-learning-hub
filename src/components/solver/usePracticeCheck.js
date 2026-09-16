import { useState } from "react";
import { base44 } from "@/api/base44Client";

export default function usePracticeCheck(solution) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const generate = async () => {
    setLoading(true); setError(""); setSubmitted(false); setAnswers({});
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create exactly 3 new CCEA-style multiple-choice questions that test whether the learner truly understands the concept in this solved ${solution.qualification} ${solution.subject} question. Progress from direct application to transfer and misconception diagnosis. Do not copy the original. Use four plausible options, one unambiguously correct answer, zero-based correctAnswer, and an explanation of why it is correct.\n\nQuestion: ${solution.question || "See attached question"}\n\nSolution: ${solution.answer}`,
        file_urls: solution.uploadedFile?.url ? [solution.uploadedFile.url] : undefined,
        model: "automatic",
        response_json_schema: { type: "object", properties: { questions: { type: "array", items: { type: "object", properties: { question: { type: "string" }, options: { type: "array", items: { type: "string" } }, correctAnswer: { type: "integer" }, explanation: { type: "string" } }, required: ["question", "options", "correctAnswer", "explanation"] } } }, required: ["questions"] },
      });
      setQuestions((result.questions || []).slice(0, 3));
    } catch { setError("Practice questions could not be generated. Please try again."); }
    finally { setLoading(false); }
  };
  const score = questions.reduce((total, q, i) => total + (answers[i] === q.correctAnswer ? 1 : 0), 0);
  return { questions, answers, setAnswers, submitted, setSubmitted, loading, error, generate, score };
}