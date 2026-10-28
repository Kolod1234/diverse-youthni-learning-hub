import React from 'react';
import { Button } from '@/components/ui/button';
import TopicCheckText from '@/components/lesson/topicCheck/TopicCheckText';

export default function TopicCheckResults({ result, busy, onRetry, onRepeat, onReviewPage }) {
  return <section className="space-y-6" aria-label="Topic check results">
    <div role="status" className="rounded-xl border bg-muted p-5"><h3 className="text-xl font-bold">{result.passed ? 'Topic check passed' : result.ever_passed ? 'Retake complete — previous pass kept' : 'More practice needed'}</h3><p className="mt-2">You scored {result.score}/{result.total} ({Math.round(result.percentage)}%). {result.passed || result.ever_passed ? 'This topic is recorded as passed and you can continue.' : 'A pass needs 70%. You can carry on with any topic and retake this check whenever you like.'}</p></div>
    <p className="rounded-lg border p-4">Best score: {result.best_percentage ?? Math.round(result.percentage)}% · {result.points ?? Math.round(result.percentage)} topic points. Only an improved best score adds points; rereading and lower retakes keep your points unchanged.</p>
    <div className="grid gap-4 sm:grid-cols-2">
      <div><h4 className="font-bold">Strengths</h4>{result.feedback.strengths.length ? <ul className="mt-2 list-disc space-y-1 pl-5">{result.feedback.strengths.map(c => <li key={c}>{c}</li>)}</ul> : <p className="mt-2 text-muted-foreground">No strengths demonstrated in this attempt yet.</p>}</div>
      <div><h4 className="font-bold">Areas to improve</h4>{result.feedback.weaknesses.length ? <ul className="mt-2 list-disc space-y-1 pl-5">{result.feedback.weaknesses.map(c => <li key={c}>{c}</li>)}</ul> : <p className="mt-2 text-muted-foreground">All concepts in this check were answered correctly.</p>}</div>
    </div>
    <p className="text-sm text-muted-foreground">This feedback reflects these questions only, not your overall ability.</p>
    <div className="flex flex-wrap gap-3"><Button onClick={onRetry} disabled={busy}>Try questions again</Button><Button variant="outline" onClick={onRepeat}>Repeat lesson</Button></div>
    <h4 className="font-bold">Worked answers</h4>
    {result.feedback.review.map((q, i) => <details key={i} className="rounded-lg border p-4"><summary className="cursor-pointer font-semibold">Question {i + 1}: {q.is_correct ? 'Correct' : 'Review needed'} — {q.concept}</summary><div className="mt-4 space-y-3"><TopicCheckText content={q.question} /><p className="font-semibold">Your answer</p><TopicCheckText content={q.selected} /><p className="font-semibold">Correct answer</p><TopicCheckText content={q.correct} /><TopicCheckText content={q.explanation} /><Button variant="outline" onClick={() => onReviewPage(q.source_page - 1)}>Review page {q.source_page}</Button></div></details>)}
  </section>;
}