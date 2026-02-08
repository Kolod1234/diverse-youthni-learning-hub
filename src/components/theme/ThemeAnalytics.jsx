import { useEffect } from 'react';
import { useTheme } from 'next-themes';

/**
 * Tracks dark mode adoption and usage patterns
 * Sends data to your analytics service
 */
export function useThemeAnalytics() {
  const { theme } = useTheme();

  useEffect(() => {
    // Track theme preference on load
    if (typeof window === 'undefined') return;

    const trackThemeUsage = () => {
      const themeData = {
        theme,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        isDarkModeSupported: window.matchMedia('(prefers-color-scheme: dark)').matches,
      };

      // Send to your analytics service
      if (window.gtag) {
        window.gtag('event', 'theme_change', {
          theme_name: theme,
        });
      }

      // Or save to localStorage for custom analytics
      const analytics = JSON.parse(localStorage.getItem('theme-analytics') || '[]');
      analytics.push(themeData);
      localStorage.setItem('theme-analytics', JSON.stringify(analytics.slice(-100))); // Keep last 100 events
    };

    trackThemeUsage();
  }, [theme]);
}

/**
 * Get theme usage statistics
 */
export function getThemeAnalytics() {
  if (typeof window === 'undefined') return null;

  const analytics = JSON.parse(localStorage.getItem('theme-analytics') || '[]');
  const darkModeCount = analytics.filter(a => a.theme === 'dark').length;
  const lightModeCount = analytics.filter(a => a.theme === 'light').length;
  
  return {
    total: analytics.length,
    darkMode: darkModeCount,
    lightMode: lightModeCount,
    darkModePercentage: analytics.length > 0 ? ((darkModeCount / analytics.length) * 100).toFixed(2) : 0,
    recentThemes: analytics.slice(-10),
  };
}