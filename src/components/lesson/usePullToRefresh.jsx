import { useState, useEffect, useRef } from 'react';

export default function usePullToRefresh(onRefresh) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);

  useEffect(() => {
    let rafId = null;

    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        touchStartY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (touchStartY.current === 0) return;

      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - touchStartY.current);

      if (distance > 0 && window.scrollY === 0) {
        rafId = requestAnimationFrame(() => {
          setPullDistance(Math.min(distance, 150));
          setIsPulling(true);
        });
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance > 80) {
        await onRefresh?.();
      }
      touchStartY.current = 0;
      setPullDistance(0);
      setIsPulling(false);
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, onRefresh]);

  return { isPulling, pullDistance };
}