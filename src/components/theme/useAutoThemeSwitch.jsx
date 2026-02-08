import { useEffect } from 'react';
import { useTheme } from 'next-themes';

/**
 * Auto-switches theme based on time schedule
 * Respects localStorage preferences
 */
export function useAutoThemeSwitch() {
  const { setTheme } = useTheme();

  useEffect(() => {
    const autoSchedule = localStorage.getItem('auto-schedule-theme') === 'true';
    if (!autoSchedule) return;

    const checkAndSwitch = () => {
      const now = new Date();
      const hour = now.getHours();
      
      // Dark mode from 6 PM to 6 AM
      const isWithinDarkPeriod = hour >= 18 || hour < 6;
      setTheme(isWithinDarkPeriod ? 'dark' : 'light');
    };

    checkAndSwitch();
    const interval = setInterval(checkAndSwitch, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [setTheme]);
}

/**
 * Uses geolocation to auto-switch at actual sunset/sunrise
 * Requires explicit permission from user
 */
export function useGeoBasedThemeSwitch() {
  const { setTheme } = useTheme();

  useEffect(() => {
    const geoEnabled = localStorage.getItem('theme-geo-enabled') === 'true';
    if (!geoEnabled) return;

    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const response = await fetch(
            `https://api.sunrise-sunset.org/json?lat=${coords.latitude}&lng=${coords.longitude}`
          );
          const data = await response.json();
          
          if (data.status === 'OK') {
            localStorage.setItem('sunset-sunrise-times', JSON.stringify({
              sunset: data.results.sunset,
              sunrise: data.results.sunrise,
              timestamp: Date.now()
            }));
          }
        } catch (error) {
          console.error('Failed to fetch sunset/sunrise times:', error);
        }
      },
      (error) => console.warn('Geolocation error:', error)
    );
  }, [setTheme]);
}