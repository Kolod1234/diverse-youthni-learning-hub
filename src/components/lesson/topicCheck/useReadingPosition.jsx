import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function useReadingPosition(lesson, user) {
  const [page, setPageValue] = useState(0);
  const [readyKey, setReadyKey] = useState('');
  const [saveState, setSaveState] = useState('');
  const [retry, setRetry] = useState(0);
  const touched = useRef(false);
  const queue = useRef(Promise.resolve());
  const key = user?.id && lesson?.id ? user.id + ':' + lesson.id : '';
  const student = !!user && user.role !== 'admin' && !user.is_tutor;
  const count = lesson?.slides?.length || 0;
  useEffect(() => {
    let cancelled = false;
    touched.current = false;
    setReadyKey('');
    setSaveState('');
    const cached = Number.parseInt(sessionStorage.getItem('lesson-player-page:' + key), 10);
    setPageValue(Number.isInteger(cached) && cached >= 0 && cached < count ? cached : 0);
    if (!key || !count || !student) { setReadyKey(key); return; }
    base44.functions.invoke('topicCheck', { action: 'reading_status', lessonId: lesson.id })
      .then(({ data }) => {
        if (!cancelled && !touched.current && data.pages_viewed > 0) setPageValue(data.page_index);
      })
      .catch(() => { if (!cancelled) setSaveState('restore-error'); })
      .finally(() => { if (!cancelled) setReadyKey(key); });
    return () => { cancelled = true; };
  }, [key, count, student, lesson?.id]);
  useEffect(() => {
    if (!key || readyKey !== key || !count) return;
    sessionStorage.setItem('lesson-player-page:' + key, String(page));
    if (!student) return;
    let cancelled = false;
    let started = false;
    const save = () => {
      if (started) return;
      started = true;
      if (!cancelled) setSaveState('saving');
      // Serialize page writes so a slower previous request cannot replace the latest position.
      queue.current = queue.current.catch(() => {}).then(async () => {
        await base44.functions.invoke('topicCheck', { action: 'reading', lessonId: lesson.id, pageIndex: page });
      }).then(() => { if (!cancelled) setSaveState('saved'); })
        .catch(() => { if (!cancelled) setSaveState('error'); });
    };
    const timer = setTimeout(save, 600);
    return () => { cancelled = true; clearTimeout(timer); save(); };
  }, [key, readyKey, count, page, student, lesson?.id, retry]);
  const setPage = value => { touched.current = true; setPageValue(value); };
  return { page, setPage, saveState, retrySave: () => setRetry(value => value + 1) };
}
