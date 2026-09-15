import React, { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import DigestiveSystemDiagram from '@/components/lesson/DigestiveSystemDiagram';

// Enhance only the exact digestive asset, without rewriting saved lesson HTML.
export default function DigestiveDiagramPortals({ containerRef, html }) {
  const [targets, setTargets] = useState([]);
  useLayoutEffect(() => {
    const images = Array.from(containerRef.current?.querySelectorAll('img[src$="/f36ac04da_da-bio-digestive-v5.png"]') || []);
    const entries = images.map(image => {
      const target = document.createElement('span');
      target.style.display = 'block';
      const display = image.style.display;
      image.style.display = 'none';
      image.before(target);
      return { image, target, display };
    });
    setTargets(entries.map(entry => entry.target));
    return () => entries.forEach(({ image, target, display }) => {
      image.style.display = display;
      target.remove();
    });
  }, [containerRef, html]);
  return targets.map((target, index) => createPortal(<DigestiveSystemDiagram />, target, String(index)));
}