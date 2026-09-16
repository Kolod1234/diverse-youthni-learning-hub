export default function PracticeQuestionCard({ question, index, selected, onSelect, submitted }) {
  const correct = question.correctAnswer;
  return (
    <div className="rounded-xl border border-indigo-100 bg-white p-4 space-y-3">
      <p className="text-sm font-semibold text-gray-800">{index + 1}. {question.question}</p>
      <div className="grid gap-2">
        {question.options.map((option, optionIndex) => {
          const chosen = selected === optionIndex;
          const state = submitted
            ? optionIndex === correct ? "border-green-400 bg-green-50" : chosen ? "border-red-400 bg-red-50" : "border-gray-200"
            : chosen ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-indigo-300";
          return <button key={option} type="button" disabled={submitted} onClick={() => onSelect(optionIndex)} className={`text-left rounded-lg border px-3 py-2 text-sm ${state}`}>{option}</button>;
        })}
      </div>
      {submitted && <p className="text-xs text-gray-600"><strong>{selected === correct ? "Correct." : "Review:"}</strong> {question.explanation}</p>}
    </div>
  );
}