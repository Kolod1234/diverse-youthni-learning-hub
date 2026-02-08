import React, { useEffect, useState, useCallback } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export default function ThemeProvider({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Sync theme across tabs
    const handleStorageChange = (e) => {
      if (e.key === 'theme-preference') {
        window.location.reload();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="system"
      enableSystem
      storageKey="theme-preference"
      themes={['light', 'dark', 'system']}
      disableTransitionOnChange={false}
      forcedTheme={undefined}
      enableColorScheme={true}
    >
      {children}
    </NextThemesProvider>
  );
}