import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import TopicCheckText from '@/components/lesson/topicCheck/TopicCheckText';

export default function TopicCheckQuestions({ questions, busy, onSubmit }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const question = questions[index];
  const selected = answers[index];
  const last = index === questions.length - 1;
  return <section className="space-y-5" aria-label="Topic check questions">
    <p className="text-sm text-muted-foreground">Question {index + 1} of {questions.length}</p>
    <TopicCheckText content={question.question} className="text-lg font-semibold text-foreground" />
    <div className="space-y-3" role="group" aria-label="Answer choices">
      {question.options.map((option, choice) => <button key={choice} type="button" aria-label={'Option ' + (choice + 1)} aria-pressed={selected === choice} disabled={busy} onClick={() => setAnswers(a => ({ ...a, [index]: choice }))} className={'flex w-full min-w-0 items-start gap-3 rounded-lg border p-4 text-left disabled:opacity-50 ' + (selected === choice ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-muted')}><span className="shrink-0 font-bold">{String.fromCharCode(65 + choice)}.</span><TopicCheckText content={option} className="min-w-0 flex-1" /></button>)}
    </div>
    <div className="flex flex-wrap justify-between gap-3">
      <Button variant="outline" disabled={busy || index === 0} onClick={() => setIndex(i => i - 1)}>Previous question</Button>
      <Button disabled={busy || selected === undefined} onClick={() => last ? onSubmit(questions.map((_, i) => answers[i])) : setIndex(i => i + 1)}>{busy ? 'Saving result…' : last ? 'Submit topic check' : 'Next question'}</Button>
    </div>
    <p className="text-xs text-muted-foreground">Answers and explanations appear after submission. These are original lesson-based questions, not an official examination paper.</p>
  </section>;
}