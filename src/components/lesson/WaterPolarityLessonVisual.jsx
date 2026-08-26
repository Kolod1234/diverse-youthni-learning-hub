import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Pause, Play, RotateCcw } from 'lucide-react';

const DIAGRAM_URL = 'https://base44.app/api/apps/69418fc30769c7d951368216/files/mp/public/69418fc30769c7d951368216/b002384b4_lesson-01-water-polarity-hydrogen-bonding-2d-textbook-v1.png';
const DURATION_SECONDS = 18;

const STEPS = [
  {
    title: 'Unequal attraction',
    label: 'Oxygen attracts the shared electrons',
    explanation: 'Oxygen attracts the shared bonding electrons more strongly than hydrogen. Each O–H bond is therefore polar covalent.',
    focus: { left: '2.8%', top: '15.8%', width: '43%', height: '66%' },
    colour: '#2563eb',
    glow: 'rgba(37, 99, 235, 0.18)'
  },
  {
    title: 'A polar molecule',
    label: 'Partial charges do not cancel',
    explanation: 'Oxygen is δ− and each hydrogen is δ+. Because H₂O is bent at about 104.5°, the two bond dipoles do not cancel.',
    focus: { left: '13.4%', top: '34.2%', width: '25%', height: '31%' },
    colour: '#f97316',
    glow: 'rgba(249, 115, 22, 0.2)'
  },
  {
    title: 'Hydrogen bonds',
    label: 'Opposite partial charges attract',
    explanation: 'Hδ+ on one molecule is attracted to Oδ− on another. Each dashed blue line represents this intermolecular hydrogen bond.',
    focus: { left: '47.8%', top: '15.8%', width: '49.2%', height: '66%' },
    colour: '#0f8f88',
    glow: 'rgba(15, 143, 136, 0.2)'
  }
];

const formatTime = seconds => '0:' + String(seconds).padStart(2, '0');

export default function WaterPolarityLessonVisual({ shouldReduceMotion = false }) {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(!shouldReduceMotion);

  useEffect(() => {
    if (shouldReduceMotion) setIsPlaying(false);
  }, [shouldReduceMotion]);

  useEffect(() => {
    if (!isPlaying) return undefined;

    const interval = window.setInterval(() => {
      setProgress(previous => Math.min(100, previous + 100 / (DURATION_SECONDS * 10)));
    }, 100);

    return () => window.clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (progress >= 100 && isPlaying) setIsPlaying(false);
  }, [progress, isPlaying]);

  const activeStepIndex = Math.min(2, Math.floor(Math.min(progress, 99.99) / (100 / 3)));
  const activeStep = STEPS[activeStepIndex];
  const elapsedSeconds = Math.round((progress / 100) * DURATION_SECONDS);

  const progressLabel = useMemo(
    () => formatTime(elapsedSeconds) + ' / ' + formatTime(DURATION_SECONDS),
    [elapsedSeconds]
  );

  const togglePlayback = () => {
    if (progress >= 100) {
      setProgress(0);
      setIsPlaying(true);
      return;
    }
    setIsPlaying(value => !value);
  };

  const restart = () => {
    setProgress(0);
    setIsPlaying(true);
  };

  const chooseStep = index => {
    setProgress(index * (100 / 3));
    setIsPlaying(false);
  };

  return (
    <section
      className="water-polarity-page"
      aria-label="Interactive explanation of water polarity and hydrogen bonding"
      data-no-swipe
    >
      <figure className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_5px_22px_rgba(15,23,42,0.08)]">
        <div className="relative aspect-[8/5] w-full">
          <img
            src={DIAGRAM_URL}
            alt="Accurate labelled 2D diagram showing a bent polar water molecule and hydrogen bonds between neighbouring water molecules"
            className="h-full w-full select-none object-contain"
            draggable={false}
          />
          <motion.div
            className="pointer-events-none absolute rounded-xl border-[3px]"
            initial={false}
            animate={{
              ...activeStep.focus,
              borderColor: activeStep.colour,
              boxShadow: isPlaying && !shouldReduceMotion
                ? [
                    '0 0 0 0 ' + activeStep.glow,
                    '0 0 0 9px ' + activeStep.glow,
                    '0 0 0 0 ' + activeStep.glow
                  ]
                : '0 0 0 5px ' + activeStep.glow
            }}
            transition={{
              left: { duration: 0.55, ease: 'easeOut' },
              top: { duration: 0.55, ease: 'easeOut' },
              width: { duration: 0.55, ease: 'easeOut' },
              height: { duration: 0.55, ease: 'easeOut' },
              borderColor: { duration: 0.35 },
              boxShadow: {
                duration: shouldReduceMotion ? 0 : 1.6,
                repeat: isPlaying && !shouldReduceMotion ? Infinity : 0,
                ease: 'easeInOut'
              }
            }}
            aria-hidden="true"
          />
        </div>
        <figcaption className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600 sm:px-5">
          Solid O–H bonds are within one water molecule. Dashed blue lines are hydrogen bonds between different molecules.
        </figcaption>
      </figure>

      <div className="mt-5 grid overflow-hidden rounded-xl border border-slate-200 bg-white sm:grid-cols-3 sm:divide-x sm:divide-slate-200">
        {STEPS.map((step, index) => {
          const selected = index === activeStepIndex;
          return (
            <button
              key={step.title}
              type="button"
              onClick={() => chooseStep(index)}
              className={
                'group flex min-h-[92px] items-start gap-3 border-b border-slate-200 px-4 py-4 text-left transition last:border-b-0 sm:border-b-0 ' +
                (selected ? 'bg-orange-50' : 'bg-white hover:bg-slate-50')
              }
              aria-current={selected ? 'step' : undefined}
            >
              <span
                className={
                  'mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ' +
                  (selected ? 'bg-orange-500 text-[#071326]' : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300')
                }
              >
                {index + 1}
              </span>
              <span>
                <span className={'block text-sm font-bold ' + (selected ? 'text-[#0b1b32]' : 'text-slate-700')}>
                  {step.title}
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">{step.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col gap-4 border-y border-slate-200 py-4 sm:flex-row sm:items-center">
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={togglePlayback}
            className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-lg bg-[#071326] px-3 text-sm font-semibold text-white transition hover:bg-[#102a48] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            aria-label={isPlaying ? 'Pause water animation' : 'Play water animation'}
          >
            {isPlaying ? <Pause className="h-4 w-4" fill="currentColor" /> : <Play className="h-4 w-4" fill="currentColor" />}
            <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          <button
            type="button"
            onClick={restart}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-[#071326] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            aria-label="Restart water animation"
            title="Restart animation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        <label className="flex min-w-0 flex-1 items-center gap-3">
          <span className="sr-only">Water animation progress</span>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={event => {
              setProgress(Number(event.target.value));
              setIsPlaying(false);
            }}
            className="h-2 min-w-0 flex-1 cursor-pointer accent-orange-500"
            aria-label="Water animation progress"
          />
          <span className="w-[76px] shrink-0 text-right text-xs font-semibold tabular-nums text-slate-500">
            {progressLabel}
          </span>
        </label>
      </div>

      <motion.div
        key={activeStep.title}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.24 }}
        className="mt-6 border-l-4 border-orange-500 pl-4 sm:pl-5"
        aria-live="polite"
      >
        <h3 className="font-serif text-xl font-bold text-[#0b1b32] sm:text-2xl">{activeStep.title}</h3>
        <p className="mt-2 max-w-3xl text-[16px] leading-7 text-slate-700">{activeStep.explanation}</p>
      </motion.div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <article className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-[0_6px_22px_rgba(37,99,235,0.08)]">
          <header className="flex items-center gap-3 border-b border-blue-100 bg-blue-50 px-5 py-4">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">A</span>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#0b1b32]">Why one water molecule is polar</h3>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.1em] text-blue-700">Inside one H₂O molecule</p>
            </div>
          </header>
          <div className="space-y-4 p-5 text-[15px] leading-7 text-slate-700 sm:p-6">
            <p>
              <strong className="text-blue-800">Unequal electron attraction.</strong> Oxygen attracts the shared electrons in each
              <span className="mx-1 rounded bg-blue-100 px-1.5 py-0.5 font-semibold text-blue-900">polar covalent O–H bond</span>
              more strongly than hydrogen.
            </p>
            <p>
              <strong className="text-blue-800">Partial charges form.</strong> Oxygen becomes
              <span className="mx-1 rounded bg-blue-100 px-1.5 py-0.5 font-semibold text-blue-900">δ−</span>
              and each hydrogen becomes
              <span className="mx-1 rounded bg-orange-100 px-1.5 py-0.5 font-semibold text-orange-800">δ+</span>.
            </p>
            <p>
              <strong className="text-blue-800">The bent shape matters.</strong> The H–O–H angle is approximately
              <span className="mx-1 rounded bg-violet-100 px-1.5 py-0.5 font-semibold text-violet-800">104.5°</span>,
              so the two bond dipoles point in different directions and do not cancel.
            </p>
          </div>
          <div className="border-t border-blue-100 bg-blue-50 px-5 py-4 text-sm font-semibold leading-6 text-blue-950 sm:px-6">
            Result: H₂O is neutral overall, but its charge is distributed unevenly, so the whole molecule is polar.
          </div>
        </article>

        <article className="overflow-hidden rounded-2xl border border-teal-200 bg-white shadow-[0_6px_22px_rgba(13,148,136,0.09)]">
          <header className="flex items-center gap-3 border-b border-teal-100 bg-teal-50 px-5 py-4">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">B</span>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#0b1b32]">How water molecules attract</h3>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.1em] text-teal-700">Between separate molecules</p>
            </div>
          </header>
          <div className="space-y-4 p-5 text-[15px] leading-7 text-slate-700 sm:p-6">
            <p>
              <strong className="text-teal-800">A hydrogen bond forms</strong> when
              <span className="mx-1 rounded bg-orange-100 px-1.5 py-0.5 font-semibold text-orange-800">Hδ+</span>
              on one molecule is attracted to
              <span className="mx-1 rounded bg-blue-100 px-1.5 py-0.5 font-semibold text-blue-900">Oδ−</span>
              on another. The blue dashed lines show these intermolecular attractions.
            </p>
            <p>
              <strong className="text-teal-800">The network is dynamic.</strong> Hydrogen bonds continually break and reform as
              liquid-water molecules move; liquid water is not a fixed lattice.
            </p>
            <p>
              <strong className="text-teal-800">Many weak attractions add up.</strong> Together they contribute to water remaining
              liquid in cells, cohesion, surface tension and a relatively high specific heat capacity.
            </p>
          </div>
          <div className="border-t border-teal-100 bg-teal-50 px-5 py-4 text-sm font-semibold leading-6 text-teal-950 sm:px-6">
            Result: temporary hydrogen bonds give water several properties that are essential for living organisms.
          </div>
        </article>
      </div>

      <aside className="mt-5 rounded-xl border border-orange-200 bg-orange-50 px-5 py-4 text-[15px] leading-7 text-slate-700">
        <strong className="text-orange-800">Key distinction:</strong> solid O–H lines represent polar covalent bonds
        <span className="font-semibold text-slate-900"> within</span> a molecule; blue dashed lines represent hydrogen bonds
        <span className="font-semibold text-slate-900"> between</span> molecules.
      </aside>
    </section>
  );
}
