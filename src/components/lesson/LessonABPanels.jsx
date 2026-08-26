import React, { useMemo } from 'react';
import MathJaxContent from '@/components/lesson/MathJaxContent';

const MEDIA_SELECTOR = 'figure, video, audio, iframe';

const normaliseTitle = value => (value || '')
  .replace(/\s+/g, ' ')
  .replace(/:$/, '')
  .trim();

const textLength = node => normaliseTitle(node?.textContent).length;

const isLayoutContainer = element => {
  const style = (element.getAttribute('style') || '').toLowerCase();
  return /display\s*:\s*(grid|flex)|grid-template-columns/.test(style) || element.querySelector(':scope > div');
};

const collectContent = html => {
  if (typeof DOMParser === 'undefined') return null;

  const document = new DOMParser().parseFromString(html || '', 'text/html');
  const blocks = [];
  const media = [];

  Array.from(document.body.children).forEach(element => {
    if (element.matches(MEDIA_SELECTOR)) {
      media.push(element);
      return;
    }

    if (element.tagName === 'DIV' && !isLayoutContainer(element)) {
      const children = Array.from(element.children);
      if (children.length > 1) {
        children.forEach(child => {
          if (child.matches(MEDIA_SELECTOR)) media.push(child);
          else blocks.push(child);
        });
        return;
      }
    }

    blocks.push(element);
  });

  if (blocks.length < 2 && blocks[0]?.children?.length > 1) {
    const onlyBlock = blocks.shift();
    Array.from(onlyBlock.children).forEach(child => {
      if (child.matches(MEDIA_SELECTOR)) media.push(child);
      else blocks.push(child);
    });
  }

  if (blocks.length < 2) return null;

  const totalLength = blocks.reduce((sum, block) => sum + textLength(block), 0);
  let runningLength = 0;
  let splitIndex = 1;
  let smallestDifference = Number.POSITIVE_INFINITY;

  for (let index = 1; index < blocks.length; index += 1) {
    runningLength += textLength(blocks[index - 1]);

    // Keep a heading with the paragraph, list or table that follows it.
    if (/^H[2-4]$/.test(blocks[index - 1].tagName)) continue;

    const difference = Math.abs(totalLength - (runningLength * 2));
    if (difference < smallestDifference) {
      smallestDifference = difference;
      splitIndex = index;
    }
  }

  const groups = [blocks.slice(0, splitIndex), blocks.slice(splitIndex)];

  const extractHeading = (group, fallback) => {
    for (let index = 0; index < group.length; index += 1) {
      const block = group[index];
      const heading = /^H[2-4]$/.test(block.tagName)
        ? block
        : block.querySelector('h2, h3, h4');

      if (heading) {
        const candidate = normaliseTitle(heading.textContent);
        if (candidate && candidate.length <= 78) {
          if (heading === block) group.splice(index, 1);
          else heading.remove();
          return candidate;
        }
      }
    }
    return fallback;
  };

  const panelATitle = extractHeading(groups[0], 'Core concept');
  const panelBTitle = extractHeading(groups[1], 'How the ideas connect');
  const toHtml = group => group.map(block => block.outerHTML).join('');

  return {
    panelATitle,
    panelBTitle,
    panelAHtml: toHtml(groups[0]),
    panelBHtml: toHtml(groups[1]),
    mediaHtml: media.map(element => element.outerHTML).join(''),
    stacked: media.length > 0 || blocks.some(block => /grid-template-columns|<table/i.test(block.outerHTML))
  };
};

const panelBodyClasses = [
  'text-[16px] leading-7 text-slate-700',
  '[&_p]:my-0 [&_p+*]:mt-4',
  '[&_ul]:my-0 [&_ul]:space-y-2 [&_ul]:pl-5',
  '[&_ol]:my-0 [&_ol]:space-y-2 [&_ol]:pl-5',
  '[&_li]:pl-1',
  '[&_h3]:mt-0 [&_h3]:font-serif [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-[#0b1b32]',
  '[&_div]:max-w-full',
  '[&_img]:h-auto [&_img]:max-w-full'
].join(' ');

function LearningPanel({ label, title, subtitle, html, tone }) {
  const isBlue = tone === 'blue';
  const colours = isBlue
    ? {
        border: 'border-blue-200',
        header: 'border-blue-100 bg-blue-50',
        badge: 'bg-blue-600',
        subtitle: 'text-blue-700',
        result: 'bg-blue-50',
        emphasis: '[&_strong]:bg-blue-100 [&_strong]:text-blue-900'
      }
    : {
        border: 'border-teal-200',
        header: 'border-teal-100 bg-teal-50',
        badge: 'bg-teal-600',
        subtitle: 'text-teal-700',
        result: 'bg-teal-50',
        emphasis: '[&_strong]:bg-teal-100 [&_strong]:text-teal-900'
      };

  return (
    <article className={'overflow-hidden rounded-2xl border bg-white shadow-[0_6px_22px_rgba(15,23,42,0.07)] ' + colours.border}>
      <header className={'flex min-h-[96px] items-center gap-3 border-b px-5 py-4 sm:px-6 ' + colours.header}>
        <span className={'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ' + colours.badge}>
          {label}
        </span>
        <div className="min-w-0">
          <h3 className="font-serif text-xl font-bold leading-tight text-[#0b1b32] sm:text-[22px]">{title}</h3>
          <p className={'mt-1 text-[11px] font-bold uppercase tracking-[0.1em] ' + colours.subtitle}>{subtitle}</p>
        </div>
      </header>
      <div className="p-5 sm:p-6">
        <MathJaxContent
          className={panelBodyClasses + ' [&_strong]:rounded [&_strong]:px-1.5 [&_strong]:py-0.5 [&_strong]:font-semibold ' + colours.emphasis}
          html={html}
        />
      </div>
      <div className={'h-2 border-t ' + colours.border + ' ' + colours.result} aria-hidden="true" />
    </article>
  );
}

export default function LessonABPanels({ html, pageTitle, lessonTitle }) {
  const content = useMemo(() => collectContent(html), [html]);

  if (!content) {
    return <MathJaxContent className={panelBodyClasses} html={html || ''} />;
  }

  return (
    <section aria-label={'Panel A and Panel B explanation for ' + pageTitle}>
      <div className={'grid items-start gap-5 ' + (content.stacked ? 'grid-cols-1' : 'lg:grid-cols-2')}>
        <LearningPanel
          label="A"
          title={content.panelATitle}
          subtitle={pageTitle}
          html={content.panelAHtml}
          tone="blue"
        />
        <LearningPanel
          label="B"
          title={content.panelBTitle}
          subtitle={lessonTitle}
          html={content.panelBHtml}
          tone="teal"
        />
      </div>

      {content.mediaHtml && (
        <MathJaxContent
          className="mt-6 [&_figure]:my-0 [&_img]:h-auto [&_img]:max-w-full"
          html={content.mediaHtml}
        />
      )}
    </section>
  );
}
