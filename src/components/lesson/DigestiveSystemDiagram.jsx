import React, { useId, useState } from 'react';
import { digestiveImage, digestiveOrgans } from '@/components/lesson/digestiveOrgans';

export default function DigestiveSystemDiagram() {
  const [selected, setSelected] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const id = useId();
  const organ = selected === null ? null : digestiveOrgans[selected];
  return (
    <section data-digestive-interactive data-no-swipe className="not-prose my-6 rounded-xl border border-border bg-card p-3 text-card-foreground sm:p-5" aria-label="Interactive digestive system" onKeyDown={e => { e.stopPropagation(); if (e.key === 'Escape') setSelected(null); }}>
      <div className="mb-3 text-sm">Click or tap a numbered part to reveal its name and function. Keyboard: Tab to a part, then Enter or Space.</div>
      <div className="relative mx-auto w-full max-w-lg" data-digestive-stage style={{ aspectRatio: '1 / 1' }}>
        <img src={digestiveImage} alt="Schematic digestive system: mouth above the oesophagus, liver and stomach above the intestines, ending at the anus. Numbered markers identify ten parts." onLoad={() => setLoaded(true)} onError={() => setFailed(true)} className="block w-full" style={{ width: '100%', height: '100%', maxHeight: 'none', margin: 0, border: 0, objectFit: 'contain' }} />
        {!loaded && <div className="absolute inset-0 flex items-center justify-center bg-card text-sm" role="status">{failed ? 'Diagram could not load. Please reload the lesson.' : 'Loading diagram…'}</div>}
        {loaded && digestiveOrgans.map((part, index) => (
          <button key={part.name} type="button" data-organ-index={index} aria-label={`Reveal part ${index + 1}`} aria-pressed={selected === index} aria-controls={id} onClick={() => setSelected(index)}
            className={'absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-xs font-bold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:h-8 sm:w-8 ' + (selected === index ? 'border-foreground bg-foreground text-background' : 'border-foreground bg-background text-foreground hover:bg-muted')}
            style={{ left: `${part.x}%`, top: `${part.y}%` }}>{index + 1}</button>
        ))}
      </div>
      <div id={id} data-digestive-answer aria-live="polite" aria-atomic="true" className="mt-4 rounded-lg border border-border bg-muted p-4 text-foreground">
        {organ ? <><div className="flex items-center justify-between gap-3"><b className="text-lg">{selected + 1}. {organ.name}</b><button type="button" onClick={() => setSelected(null)} className="min-h-10 rounded border border-border bg-background px-3 text-sm text-foreground">Hide label</button></div><div className="mt-2 text-sm leading-6">{organ.function}</div></> : <div className="text-sm">Select a numbered part to explore its role in digestion.</div>}
      </div>
      <div className="mt-3 text-xs text-muted-foreground">Schematic illustration, not to scale. Markers identify organ locations; fine duct connections are simplified.</div>
    </section>
  );
}