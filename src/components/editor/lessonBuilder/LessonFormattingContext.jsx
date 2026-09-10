import React, { createContext, useCallback, useMemo, useState } from 'react';

export const LessonFormattingContext = createContext(null);

// Keep the active editable DOM separate from the ribbon's focus. Clicking a
// formatting control must not change which lesson selection it operates on.
export function LessonFormattingProvider({ children }) {
  const [activeEditor, setActiveEditor] = useState(null);
  const activate = useCallback((ref, id) => {
    setActiveEditor(current => current?.ref === ref ? current : { ref, id });
  }, []);
  const deactivate = useCallback(ref => {
    setActiveEditor(current => current?.ref === ref ? null : current);
  }, []);
  const value = useMemo(() => ({ activeEditor, activate, deactivate }), [activeEditor, activate, deactivate]);
  return <LessonFormattingContext.Provider value={value}>{children}</LessonFormattingContext.Provider>;
}
