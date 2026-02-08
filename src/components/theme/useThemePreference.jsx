import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export function useThemePreference() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-switch based on sunset/sunrise (simple version - can use geolocation)
  useEffect(() => {
    if (!mounted) return;

    const autoSchedule = localStorage.getItem('auto-schedule-theme') === 'true';
    if (!autoSchedule) return;

    const checkTime = () => {
      const hour = new Date().getHours();
      const isDarkHour = hour >= 18 || hour < 6; // 6 PM to 6 AM
      const shouldBeDark = isDarkHour;

      const currentTheme = theme === 'system' ? systemTheme : theme;
      if (shouldBeDark && currentTheme !== 'dark') {
        setTheme('dark');
      } else if (!shouldBeDark && currentTheme !== 'light') {
        setTheme('light');
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [theme, setTheme, systemTheme, mounted]);

  return {
    theme,
    setTheme,
    isDark: theme === 'dark' || (theme === 'system' && systemTheme === 'dark'),
    isHighContrast: theme === 'high-contrast-dark',
    mounted,
  };
}