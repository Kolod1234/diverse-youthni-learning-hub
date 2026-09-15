import React, { useEffect, useRef, useState } from 'react';
import DigestiveDiagramPortals from '@/components/lesson/DigestiveDiagramPortals';
import LessonImageZoom from '@/components/lesson/LessonImageZoom';

function annotateRenderedMath(node, mathJax) {
  const containers = Array.from(node.querySelectorAll('mjx-container'));
  const items = mathJax.startup?.document?.getMathItemsWithin?.(node) || [];

  containers.forEach((container, index) => {
    const item = items[index];
    const source = item?.math?.trim();
    if (!source) return;

    const notation = item.display ? `$$${source}$$` : `$${source}$`;
    container.dataset.assistantMath = notation;
    container.setAttribute('aria-label', `Mathematical notation: ${source}`);
  });
}

/**
 * Renders lesson HTML and typesets any LaTeX it contains ($...$ / $$...$$).
 * MathJax is provided app-wide by the MathJaxContext in the layout; if it is
 * not ready yet the effect simply does nothing and re-runs when content changes.
 * Content that contains no LaTeX (e.g. MathML lessons) is unaffected.
 */
export default function MathJaxContent({ html, className }) {
  const ref = useRef(null);
  const [zoomedImage, setZoomedImage] = useState(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let cancelled = false;

    const typeset = () => {
      const mathJax = window.MathJax;
      if (cancelled || !mathJax?.typesetPromise) return;
      mathJax.typesetClear?.([node]);
      mathJax.typesetPromise([node])
        .then(() => {
          if (!cancelled) annotateRenderedMath(node, mathJax);
        })
        .catch(() => {});
    };

    if (window.MathJax?.typesetPromise) {
      typeset();
    } else {
      // MathJax loads asynchronously; poll briefly until it is available.
      const started = Date.now();
      const timer = setInterval(() => {
        if (window.MathJax?.typesetPromise || Date.now() - started > 8000) {
          clearInterval(timer);
          typeset();
        }
      }, 200);
      return () => { cancelled = true; clearInterval(timer); };
    }

    return () => { cancelled = true; };
  }, [html]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const images = Array.from(node.querySelectorAll('figure img:not([data-no-zoom])'));
    images.forEach(image => {
      image.tabIndex = 0;
      image.setAttribute('role', 'button');
      image.setAttribute('aria-label', `Enlarge diagram: ${image.alt || 'lesson image'}`);
      image.title = 'Select to enlarge';
    });
    const openImage = (image) => setZoomedImage({ src: image.currentSrc || image.src, alt: image.alt || 'Lesson diagram' });
    const onClick = (event) => event.target.matches('figure img:not([data-no-zoom])') && openImage(event.target);
    const onKeyDown = (event) => {
      if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('figure img:not([data-no-zoom])')) {
        event.preventDefault();
        openImage(event.target);
      }
    };
    node.addEventListener('click', onClick);
    node.addEventListener('keydown', onKeyDown);
    return () => {
      node.removeEventListener('click', onClick);
      node.removeEventListener('keydown', onKeyDown);
    };
  }, [html]);

  return <><div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: html || '' }} /><DigestiveDiagramPortals containerRef={ref} html={html} /><LessonImageZoom image={zoomedImage} onClose={() => setZoomedImage(null)} /></>;
}