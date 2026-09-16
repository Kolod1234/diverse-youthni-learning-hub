import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function useTopicCheckSession(lesson, open) {
  const [attempt, setAttempt] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const client = useQueryClient();
  const check = useQuery({ queryKey: ['prepared-topic-check', lesson?.id, lesson?.updated_date], enabled: open && !!lesson?.id, retry: false, staleTime: 300000, queryFn: async () => (await base44.functions.invoke('generateLessonInteractives', { lessonId: lesson.id, purpose: 'topic_check' })).data });
  useEffect(() => { setAttempt(null); setResult(null); setError(''); }, [lesson?.id, open]);
  const start = async () => {
    setBusy(true); setError('');
    try {
      const { data } = await base44.functions.invoke('topicCheck', { action: 'start', lessonId: lesson.id, setId: check.data.set_id });
      setAttempt(data.attempt_id); setResult(null);
    } catch (err) { setError(err.response?.data?.error || 'Could not start the check. Please try again.'); }
    finally { setBusy(false); }
  };
  const submit = async answers => {
    setBusy(true); setError('');
    try {
      const { data } = await base44.functions.invoke('topicCheck', { action: 'submit', lessonId: lesson.id, attemptId: attempt, answers });
      setResult(data);
      await client.invalidateQueries({ queryKey: ['topic-check-status', lesson.id] });
      await client.invalidateQueries({ queryKey: ['topic-access'] });
    } catch (err) { setError(err.response?.data?.error || 'Your result was not saved. Please submit again.'); }
    finally { setBusy(false); }
  };
  return { check, attempt, result, busy, error, start, submit };
}