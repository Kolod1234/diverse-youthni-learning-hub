export default function PracticeQuestionCard({ question, index, selected, onSelect, submitted, result }) {
  const toggleChoice = (optionIndex) => {
    const current = Array.isArray(selected) ? selected : [];
    onSelect(current.includes(optionIndex) ? current.filter(value => value !== optionIndex) : [...current, optionIndex]);
  };

  return <div className="rounded-xl border border-indigo-100 bg-card p-4 space-y-3">
    <div><p className="text-sm font-semibold text-foreground">{index + 1}. {question.question}</p>{question.type === "multiple_choice" && <p className="mt-1 text-xs text-indigo-600">Select all answers that apply.</p>}</div>
    {question.type === "multiple_choice" ? <div className="grid gap-2">{question.options.map((option, optionIndex) => {
      const chosen = Array.isArray(selected) && selected.includes(optionIndex);
      const correct = question.correctAnswers.includes(optionIndex);
      const colour = submitted ? correct ? "border-green-400 bg-green-50" : chosen ? "border-red-400 bg-red-50" : "border-gray-200" : chosen ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-indigo-300";
      return <label key={option} className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm ${colour}`}><input type="checkbox" checked={chosen} disabled={submitted} onChange={() => toggleChoice(optionIndex)} className="mt-0.5"/><span>{option}</span></label>;
    })}</div> : <textarea value={selected || ""} disabled={submitted} onChange={(event) => onSelect(event.target.value)} rows={question.type === "long_answer" ? 8 : 3} placeholder={question.type === "long_answer" ? "Write your structured essay answer…" : "Write your answer…"} className="w-full resize-y rounded-lg border border-indigo-200 px-3 py-2 text-sm text-foreground" />}
    {submitted && result && <div className={`rounded-lg border p-3 text-xs ${result.isCorrect ? "border-green-200 bg-green-50 text-green-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}><p className="font-bold">{result.isCorrect ? "Correct" : "Why this needs improvement"}</p><p className="mt-1">{result.reason}</p>{result.improvement && <p className="mt-2"><strong>How to improve:</strong> {result.improvement}</p>}{result.modelAnswer && <p className="mt-2"><strong>Model answer:</strong> {result.modelAnswer}</p>}</div>}
  </div>;
}