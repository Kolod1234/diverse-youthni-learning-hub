import { useEffect } from 'react';

// Native browser beforeunload prompt when the builder has unsaved changes.
// Router-level prompts would require react-router-dom v6 unstable APIs, so
// we keep this simple and reliable — it covers tab close / page refresh.
export default function useUnsavedChangesWarning(isDirty) {
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);
}