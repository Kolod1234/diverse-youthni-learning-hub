import React, { useEffect, useRef, useState } from 'react';
import { Loader2, MessageCircle, Send, X } from 'lucide-react';
import MathText from '@/components/lesson/MathText';
import { requestFollowUp, splitIntoParts } from '@/components/lesson/explainHighlight';

/**
 * Follow-up discussion under an explanation: the learner can ask anything about the
 * highlight, or pick one sentence / step to talk about, and keep the conversation going.
 */
export default function ExplainFollowUpChat({ selectionText, lessonTitle, explanation, level, focus, onFocusChange, conciseMaths = false }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const endRef = useRef(null);
  const parts = splitIntoParts(selectionText);

  useEffect(() => {
    if (!focus) return;
    boxRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    inputRef.current?.focus({ preventScroll: true });
  }, [focus]);

  useEffect(() => {
    if (messages.length) endRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [messages.length, sending]);

  const send = async () => {
    const question = draft.trim();
    if (!question || sending) return;
    const history = messages;
    setMessages([...history, { role: 'user', text: question, about: focus?.label }]);
    setDraft('');
    setError('');
    setSending(true);
    try {
      const reply = await requestFollowUp({ selectionText, lessonTitle, explanation, level, focus, history, question, conciseMaths });
      setMessages(current => [...current, { role: 'tutor', text: reply }]);
    } catch {
      setMessages(history);
      setDraft(question);
      setError('The tutor could not reply just now. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div ref={boxRef} className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-3">
      <p className="mb-1 flex items-center gap-2 text-xs font-bold text-indigo-900">
        <MessageCircle className="h-4 w-4" /> Still unsure? Discuss it with the tutor
      </p>
      <p className="mb-2 text-[11px] leading-5 text-indigo-700">
        Ask about anything in the highlight. Press <span className="font-semibold">Ask</span> beside a step, or pick a sentence below.
      </p>

      {parts.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {parts.map((part, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onFocusChange({ label: `sentence ${index + 1} of the highlight`, text: part })}
              className="line-clamp-1 max-w-full rounded-full border border-indigo-200 bg-white px-2.5 py-1 text-left text-[11px] text-indigo-900 hover:border-indigo-400"
            >
              <MathText inline text={part} />
            </button>
          ))}
        </div>
      )}

      {messages.length > 0 && (
        <div className="mb-2 space-y-2">
          {messages.map((message, index) => (
            <div
              key={index}
              className={message.role === 'user'
                ? 'ml-6 rounded-lg bg-indigo-600 px-3 py-2 text-xs leading-6 text-white'
                : 'mr-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs leading-6 text-slate-800'}
            >
              {message.about && <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">About {message.about}</p>}
              <MathText className="whitespace-pre-line" text={message.text} />
            </div>
          ))}
          {sending && (
            <p className="flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> The tutor is thinking…
            </p>
          )}
          <div ref={endRef} />
        </div>
      )}

      {focus && (
        <div className="mb-1.5 flex items-start gap-2 rounded-md border border-indigo-200 bg-white px-2 py-1.5 text-[11px] text-indigo-900">
          <span className="shrink-0 font-semibold">Asking about {focus.label}:</span>
          <div className="line-clamp-2 min-w-0 flex-1"><MathText inline text={focus.text} /></div>
          <button type="button" onClick={() => onFocusChange(null)} className="shrink-0 rounded p-0.5 hover:bg-indigo-50" aria-label="Ask about the whole highlight instead">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={draft}
          onChange={event => setDraft(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              send();
            }
          }}
          rows={2}
          placeholder="Type your question, e.g. Why is it 1 over f?"
          className="min-h-10 flex-1 resize-none rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-400"
        />
        <button
          type="button"
          onClick={send}
          disabled={!draft.trim() || sending}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
          aria-label="Send question"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="mt-1.5 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}