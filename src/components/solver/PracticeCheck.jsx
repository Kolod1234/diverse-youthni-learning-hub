import PracticeQuestionCard from "@/components/solver/PracticeQuestionCard";
import usePracticeCheck from "@/components/solver/usePracticeCheck";

export default function PracticeCheck({ solution }) {
  const state = usePracticeCheck(solution);
  if (!state.questions.length) return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
      <h3 className="font-semibold text-indigo-900">Check your understanding</h3>
      <p className="mt-1 text-xs text-indigo-700">Try three fresh questions that test application, transfer and common misconceptions.</p>
      <button onClick={state.generate} disabled={state.loading} className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{state.loading ? "Creating questions…" : "Create practice questions"}</button>
      {state.error && <p className="mt-2 text-xs text-red-600">{state.error}</p>}
    </div>
  );
  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 space-y-3">
      <h3 className="font-semibold text-indigo-900">Check your understanding</h3>
      {state.questions.map((q, i) => <PracticeQuestionCard key={i} question={q} index={i} selected={state.answers[i]} submitted={state.submitted} onSelect={(value) => state.setAnswers(prev => ({ ...prev, [i]: value }))} />)}
      {!state.submitted ? <button disabled={Object.keys(state.answers).length !== state.questions.length} onClick={() => state.setSubmitted(true)} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Check my answers</button> : <div className="flex items-center justify-between"><p className="font-semibold text-indigo-900">Score: {state.score}/{state.questions.length}</p><button onClick={state.generate} className="text-sm font-semibold text-indigo-700">Try a new set</button></div>}
    </div>
  );
}