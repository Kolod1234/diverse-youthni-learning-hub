import React from 'react';
import { Brain, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import useTopicCheckSession from '@/components/lesson/topicCheck/useTopicCheckSession';
import TopicCheckQuestions from '@/components/lesson/topicCheck/TopicCheckQuestions';
import TopicCheckResults from '@/components/lesson/topicCheck/TopicCheckResults';

export default function TopicQuizModal({ open, lesson, hasNextTopic = false, alreadyPassed = false, onClose, onContinue, onRepeat, onReviewPage }) {
  const { check, attempt, result, busy, error, start, submit } = useTopicCheckSession(lesson, open);
  return <Dialog open={open} onOpenChange={value => { if (!value && !busy) onClose?.(); }}>
    <DialogContent className="z-[130] flex max-h-[92dvh] w-[calc(100vw_-_1.5rem)] max-w-3xl flex-col gap-0 overflow-hidden rounded-2xl bg-background p-0 text-foreground" onEscapeKeyDown={event => { if (busy) event.preventDefault(); }} onInteractOutside={event => event.preventDefault()}>
      <DialogHeader className="shrink-0 border-b bg-muted p-5 pr-12 text-left sm:p-6">
        <p className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary"><Brain className="h-5 w-5" /> Topic check</p>
        <DialogTitle className="text-xl leading-snug sm:text-2xl">{lesson?.title}</DialogTitle>
        <DialogDescription>{alreadyPassed ? 'You have already passed. Reread freely or take an optional retake to improve your points.' : 'Score 70% or more to record a pass and earn points. Every topic stays open to you in any order.'}</DialogDescription>
      </DialogHeader>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        {check.isPending ? <div role="status" className="flex min-h-48 items-center justify-center gap-3"><Loader2 className="h-6 w-6 animate-spin" />Preparing questions from this lesson…</div>
          : check.isError ? <div className="space-y-4"><p role="alert">{check.error?.response?.data?.details || check.error?.response?.data?.error || 'The topic check could not be prepared.'} {alreadyPassed ? 'Your previous pass is still saved.' : 'Progression stays locked until you pass.'}</p><Button onClick={() => check.refetch()}>Retry preparation</Button></div>
          : result ? <TopicCheckResults result={result} busy={busy} onRetry={start} onRepeat={onRepeat} onReviewPage={onReviewPage} />
          : attempt ? <TopicCheckQuestions key={attempt} questions={check.data.questions} busy={busy} onSubmit={submit} />
          : <div className="space-y-4"><h3 className="text-lg font-semibold">10 topic-specific questions</h3><p>Questions are based on this lesson's teaching pages. Answer at least 7 correctly to pass. Your strengths, areas to improve and worked answers will appear after submission.</p><Button onClick={start} disabled={busy}>{busy ? 'Starting…' : 'Start topic check'}</Button></div>}
        {error && <p role="alert" className="mt-4 text-destructive">{error}</p>}
      </div>
      <footer className="flex shrink-0 flex-wrap justify-between gap-3 border-t p-4">
        <Button variant="outline" onClick={onClose} disabled={busy}>Back to lesson</Button>
        <Button onClick={() => onContinue?.(result)} disabled={busy || !(result?.passed || result?.ever_passed || alreadyPassed)}>{hasNextTopic ? 'Continue to next topic' : 'Finish topic'}</Button>
      </footer>
    </DialogContent>
  </Dialog>;
}