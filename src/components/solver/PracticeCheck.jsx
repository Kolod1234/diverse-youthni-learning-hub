import PracticeQuestionCard from "@/components/solver/PracticeQuestionCard";
import usePracticeCheck from "@/components/solver/usePracticeCheck";
import { QUESTION_STYLES } from "@/components/solver/practiceQuestionConfig";

export default function PracticeCheck({ solution }) {
  const state = usePracticeCheck(solution);
  const stylePicker = <label className="block text-xs font-semibold text-indigo-900">Question style<select value={state.questionType} onChange={(event) => state.setQuestionType(event.target.value)} disabled={state.loading || state.checking} className="mt-1 block w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-normal text-gray-800">{QUESTION_STYLES.map(style => <option key={style.value} value={style.value}>{style.label}</option>)}</select></label>;

  if (!state.questions.length) return <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 space-y-3"><h3 className="font-semibold text-indigo-900">Check your understanding</h3><p className="text-xs text-indigo-700">Choose a question style, then try three fresh questions.</p>{stylePicker}<button onClick={state.generate} disabled={state.loading} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{state.loading ? "Creating questions…" : "Create practice questions"}</button>{state.error && <p className="text-xs text-red-600">{state.error}</p>}</div>;

  return <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 space-y-3">
    <h3 className="font-semibold text-indigo-900">Check your understanding</h3>
    {stylePicker}
    {state.questions.map((question, index) => <PracticeQuestionCard key={index} question={question} index={index} selected={state.answers[index]} submitted={state.submitted} result={state.feedback[index]} onSelect={(value) => state.setAnswers(previous => ({ ...previous, [index]: value }))} />)}
    {!state.submitted
      ? <button disabled={!state.canSubmit || state.checking} onClick={state.checkAnswers} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{state.checking ? "Checking answers…" : "Check my answers"}</button>
      : <div className="flex items-center justify-between"><p className="font-semibold text-indigo-900">Score: {state.score}/{state.questions.length}</p><button onClick={state.generate} className="text-sm font-semibold text-indigo-700">Create this style again</button></div>}
    {state.error && <p className="text-xs text-red-600">{state.error}</p>}
  </div>;
}