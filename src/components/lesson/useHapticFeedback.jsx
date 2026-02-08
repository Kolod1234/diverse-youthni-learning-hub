import { useCallback } from 'react';

export default function useHapticFeedback() {
  const vibrate = useCallback((pattern = [10]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const light = useCallback(() => vibrate([5]), [vibrate]);
  const medium = useCallback(() => vibrate([10]), [vibrate]);
  const heavy = useCallback(() => vibrate([20]), [vibrate]);
  const success = useCallback(() => vibrate([10, 50, 10]), [vibrate]);
  const error = useCallback(() => vibrate([20, 100, 20, 100, 20]), [vibrate]);

  return { vibrate, light, medium, heavy, success, error };
}