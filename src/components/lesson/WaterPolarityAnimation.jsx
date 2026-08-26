import React, { useEffect, useMemo, useState } from 'react';

const DIAGRAM_URL = 'https://base44.app/api/apps/69418fc30769c7d951368216/files/mp/public/69418fc30769c7d951368216/b002384b4_lesson-01-water-polarity-hydrogen-bonding-2d-textbook-v1.png';
const DURATION_SECONDS = 21;

const STEPS = [
  {
    kicker: 'STEP 1 OF 3',
    shortTitle: 'Electron attraction',
    title: 'Oxygen attracts the shared electrons more strongly',
    caption: 'Each O–H bond is polar covalent: the electrons are shared, but they spend more time near oxygen.',
    cue: 'Follow the unequal pull within each O–H bond.',
    focus: 'left'
  },
  {
    kicker: 'STEP 2 OF 3',
    shortTitle: 'Partial charges',
    title: 'The bent molecule has an uneven charge distribution',
    caption: 'Oxygen is δ−, each hydrogen is δ+, and the 104.5° bend means the two bond dipoles do not cancel.',
    cue: 'The molecule is neutral overall, but it is polar.',
    focus: 'left-close'
  },
  {
    kicker: 'STEP 3 OF 3',
    shortTitle: 'Hydrogen bonding',
    title: 'Opposite partial charges attract between molecules',
    caption: 'A hydrogen bond forms between Hδ+ on one water molecule and Oδ− on a neighbouring molecule.',
    cue: 'Dashed blue links are intermolecular hydrogen bonds.',
    focus: 'right'
  }
];

const padTime = value => String(value).padStart(2, '0');

export default function WaterPolarityAnimation() {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [captionsOn, setCaptionsOn] = useState(true);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setIsPlaying(false);
    }
  }, []);

  useEffect(() => {
    if (!isPlaying) return undefined;

    const timer = window.setInterval(() => {
      setProgress(previous => {
        if (previous >= 100) {
          setIsPlaying(false);
          return 100;
        }
        return Math.min(100, previous + (100 / DURATION_SECONDS) * 0.08);
      });
    }, 80);

    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const activeStepIndex = Math.min(2, Math.floor(Math.min(progress, 99.999) / (100 / 3)));
  const activeStep = STEPS[activeStepIndex];

  const elapsedSeconds = Math.round((progress / 100) * DURATION_SECONDS);
  const timeLabel = useMemo(
    () => `0:${padTime(elapsedSeconds)} / 0:${DURATION_SECONDS}`,
    [elapsedSeconds]
  );

  const togglePlayback = () => {
    if (progress >= 100) setProgress(0);
    setIsPlaying(value => !value);
  };

  const restart = () => {
    setProgress(0);
    setIsPlaying(true);
  };

  const jumpToStep = index => {
    setProgress(index * (100 / 3));
    setIsPlaying(false);
  };

  return (
    <section
      className="water-polarity-animation"
      aria-label="Interactive animation explaining water polarity and hydrogen bonding"
    >
      <style>{`
        .water-polarity-animation {
          --navy: #08263f;
          --ink: #17313b;
          --blue: #2166c2;
          --teal: #0f8f88;
          --orange: #e87519;
          --line: #d4e2e8;
          container-type: inline-size;
          width: 100%;
          height: 100%;
          min-height: 0;
          display: grid;
          grid-template-rows: auto minmax(0, 1fr) auto;
          overflow: hidden;
          color: var(--ink);
          background: #f7fbfc;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .water-animation__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 13px 20px 11px;
          color: white;
          background:
            radial-gradient(circle at 74% 0%, rgba(31, 159, 195, .32), transparent 36%),
            linear-gradient(112deg, #071f35 0%, #0b3150 55%, #0a4659 100%);
          border-bottom: 3px solid #29a6a0;
        }

        .water-animation__eyebrow {
          margin: 0 0 2px;
          color: #82d7d1;
          font-size: 10px;
          line-height: 1.1;
          font-weight: 800;
          letter-spacing: .14em;
          text-transform: uppercase;
        }

        .water-animation__heading {
          margin: 0;
          color: #fff;
          font-size: clamp(15px, 2.35cqw, 24px);
          line-height: 1.1;
          font-weight: 800;
          letter-spacing: -.02em;
        }

        .water-animation__status {
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 10px;
          color: #dffaf7;
          font-size: 10px;
          font-weight: 700;
          border: 1px solid rgba(130, 215, 209, .48);
          border-radius: 999px;
          background: rgba(5, 24, 41, .42);
        }

        .water-animation__status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #39d4c7;
          box-shadow: 0 0 0 5px rgba(57, 212, 199, .12);
          animation: waterStatusPulse 1.7s ease-in-out infinite;
        }

        .water-animation__body {
          min-height: 0;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(212px, 28%);
        }

        .water-animation__stage {
          position: relative;
          min-height: 0;
          overflow: hidden;
          background: #e8f1f5;
          border-right: 1px solid var(--line);
        }

        .water-animation__image {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition: transform 1s cubic-bezier(.2,.75,.25,1), filter .5s ease;
          filter: saturate(1.04) contrast(1.02);
        }

        .water-animation__image--left {
          transform: scale(1.08);
          transform-origin: 24% 54%;
        }

        .water-animation__image--left-close {
          transform: scale(1.2);
          transform-origin: 24% 54%;
        }

        .water-animation__image--right {
          transform: scale(1.12);
          transform-origin: 77% 52%;
        }

        .water-animation__stage::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(to top, rgba(5, 29, 49, .72), transparent 42%);
        }

        .water-animation__focus {
          position: absolute;
          top: 14%;
          bottom: 23%;
          width: 44%;
          z-index: 2;
          pointer-events: none;
          border: 3px solid rgba(20, 137, 190, .78);
          border-radius: 18px;
          box-shadow: 0 0 0 999px rgba(4, 26, 42, .12), 0 0 0 7px rgba(33, 102, 194, .12);
          transition: left .9s cubic-bezier(.2,.75,.25,1), width .9s ease, border-color .5s ease;
          animation: waterFocusPulse 2s ease-in-out infinite;
        }

        .water-animation__focus--left,
        .water-animation__focus--left-close {
          left: 3%;
        }

        .water-animation__focus--left-close {
          width: 42%;
          border-color: rgba(232, 117, 25, .82);
        }

        .water-animation__focus--right {
          left: 52.5%;
          width: 44%;
          border-color: rgba(15, 143, 136, .82);
        }

        .water-animation__cue {
          position: absolute;
          z-index: 3;
          left: 18px;
          right: 18px;
          bottom: 14px;
          display: flex;
          align-items: center;
          gap: 11px;
          color: white;
        }

        .water-animation__cue-number {
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          color: #fff;
          font-size: 16px;
          font-weight: 900;
          background: var(--orange);
          box-shadow: 0 8px 18px rgba(0, 0, 0, .24);
        }

        .water-animation__cue-copy {
          min-width: 0;
        }

        .water-animation__cue-title {
          margin: 0;
          font-size: clamp(12px, 1.75cqw, 18px);
          line-height: 1.16;
          font-weight: 800;
        }

        .water-animation__cue-text {
          margin: 3px 0 0;
          color: #dcecf2;
          font-size: clamp(9px, 1.18cqw, 12px);
          line-height: 1.25;
        }

        .water-animation__rail {
          min-width: 0;
          display: flex;
          flex-direction: column;
          padding: 14px;
          background: #fff;
        }

        .water-animation__rail-title {
          margin: 0 0 9px;
          color: #607883;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .water-animation__steps {
          display: grid;
          gap: 8px;
        }

        .water-animation__step {
          width: 100%;
          display: grid;
          grid-template-columns: 26px minmax(0, 1fr);
          align-items: center;
          gap: 8px;
          padding: 8px;
          text-align: left;
          color: #55717b;
          border: 1px solid #dce7eb;
          border-radius: 11px;
          background: #f9fbfc;
          cursor: pointer;
          transition: transform .2s ease, border-color .2s ease, background .2s ease, box-shadow .2s ease;
        }

        .water-animation__step:hover {
          transform: translateY(-1px);
          border-color: #98bdce;
        }

        .water-animation__step--active {
          color: var(--ink);
          border-color: #2787bd;
          background: #edf7fc;
          box-shadow: 0 7px 16px rgba(12, 73, 108, .11);
        }

        .water-animation__step-number {
          display: grid;
          place-items: center;
          width: 26px;
          height: 26px;
          color: #fff;
          font-size: 11px;
          font-weight: 900;
          border-radius: 8px;
          background: #8aa0aa;
        }

        .water-animation__step--active .water-animation__step-number {
          background: linear-gradient(135deg, var(--blue), var(--teal));
        }

        .water-animation__step-kicker {
          display: block;
          margin-bottom: 1px;
          color: #7b929b;
          font-size: 7px;
          font-weight: 800;
          letter-spacing: .08em;
        }

        .water-animation__step-title {
          display: block;
          font-size: clamp(9px, 1.1cqw, 11px);
          line-height: 1.18;
          font-weight: 800;
        }

        .water-animation__science-note {
          margin-top: auto;
          padding: 9px 10px;
          color: #31525e;
          font-size: 9px;
          line-height: 1.35;
          border-left: 4px solid var(--teal);
          border-radius: 8px;
          background: #eef8f6;
        }

        .water-animation__science-note strong {
          color: #0a716b;
        }

        .water-animation__controls {
          display: grid;
          grid-template-columns: auto minmax(95px, 1fr) auto;
          align-items: center;
          gap: 12px;
          min-height: 60px;
          padding: 8px 16px;
          color: #d9e9ef;
          background: var(--navy);
          border-top: 1px solid rgba(255, 255, 255, .12);
        }

        .water-animation__buttons {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .water-animation__control {
          display: grid;
          place-items: center;
          min-width: 34px;
          height: 34px;
          padding: 0 9px;
          color: #fff;
          font: inherit;
          font-size: 14px;
          font-weight: 800;
          border: 1px solid rgba(255, 255, 255, .24);
          border-radius: 9px;
          background: rgba(255, 255, 255, .08);
          cursor: pointer;
          transition: background .2s ease, transform .2s ease;
        }

        .water-animation__control:hover {
          background: rgba(255, 255, 255, .17);
          transform: translateY(-1px);
        }

        .water-animation__control--primary {
          width: 38px;
          color: #08263f;
          border-color: #61d5ce;
          background: #64ddd4;
        }

        .water-animation__control--primary:hover {
          background: #86eee7;
        }

        .water-animation__timeline {
          min-width: 0;
          display: grid;
          grid-template-columns: minmax(70px, 1fr) auto;
          align-items: center;
          gap: 9px;
        }

        .water-animation__range {
          width: 100%;
          accent-color: #52d1ca;
          cursor: pointer;
        }

        .water-animation__time {
          min-width: 70px;
          color: #bcd0d8;
          font-size: 9px;
          font-variant-numeric: tabular-nums;
          text-align: right;
        }

        .water-animation__caption {
          max-width: 310px;
          margin: 0;
          color: #fff;
          font-size: clamp(9px, 1.05cqw, 11px);
          line-height: 1.3;
          text-align: right;
        }

        .water-animation__caption strong {
          color: #71e1da;
        }

        @keyframes waterStatusPulse {
          50% { opacity: .62; transform: scale(.78); }
        }

        @keyframes waterFocusPulse {
          50% { box-shadow: 0 0 0 999px rgba(4, 26, 42, .17), 0 0 0 9px rgba(33, 102, 194, .08); }
        }

        @container (max-width: 690px) {
          .water-animation__header {
            padding: 7px 10px 6px;
            border-bottom-width: 2px;
          }

          .water-animation__eyebrow,
          .water-animation__status {
            display: none;
          }

          .water-animation__heading {
            font-size: clamp(11px, 4.3cqw, 17px);
          }

          .water-animation__body {
            grid-template-columns: 1fr;
          }

          .water-animation__rail {
            display: none;
          }

          .water-animation__stage {
            border-right: 0;
          }

          .water-animation__focus {
            top: 9%;
            bottom: 25%;
            border-width: 2px;
            border-radius: 10px;
          }

          .water-animation__cue {
            left: 8px;
            right: 8px;
            bottom: 5px;
            gap: 7px;
          }

          .water-animation__cue-number {
            width: 24px;
            height: 24px;
            border-radius: 7px;
            font-size: 11px;
          }

          .water-animation__cue-title {
            font-size: clamp(8px, 3cqw, 12px);
          }

          .water-animation__cue-text {
            display: none;
          }

          .water-animation__controls {
            grid-template-columns: auto minmax(50px, 1fr);
            gap: 7px;
            min-height: 40px;
            padding: 4px 7px;
          }

          .water-animation__control {
            min-width: 27px;
            width: 27px;
            height: 27px;
            padding: 0;
            border-radius: 7px;
            font-size: 11px;
          }

          .water-animation__timeline {
            grid-template-columns: 1fr auto;
            gap: 5px;
          }

          .water-animation__time {
            min-width: 51px;
            font-size: 7px;
          }

          .water-animation__caption,
          .water-animation__control--captions {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .water-polarity-animation *,
          .water-polarity-animation *::before,
          .water-polarity-animation *::after {
            animation: none !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

      <header className="water-animation__header">
        <div>
          <p className="water-animation__eyebrow">AS Biology · Interactive mechanism</p>
          <h2 className="water-animation__heading">Why water is polar and forms hydrogen bonds</h2>
        </div>
        <div className="water-animation__status" aria-live="polite">
          <span className="water-animation__status-dot" aria-hidden="true" />
          {isPlaying ? 'Animation playing' : 'Paused for review'}
        </div>
      </header>

      <div className="water-animation__body">
        <div className="water-animation__stage">
          <img
            className={`water-animation__image water-animation__image--${activeStep.focus}`}
            src={DIAGRAM_URL}
            alt="Labelled raster diagram of a bent polar water molecule and a hydrogen-bonded network"
          />
          <div
            className={`water-animation__focus water-animation__focus--${activeStep.focus}`}
            aria-hidden="true"
          />
          <div className="water-animation__cue" aria-live="polite">
            <span className="water-animation__cue-number">{activeStepIndex + 1}</span>
            <div className="water-animation__cue-copy">
              <h3 className="water-animation__cue-title">{activeStep.title}</h3>
              <p className="water-animation__cue-text">{activeStep.cue}</p>
            </div>
          </div>
        </div>

        <aside className="water-animation__rail" aria-label="Animation steps">
          <p className="water-animation__rail-title">Mechanism sequence</p>
          <div className="water-animation__steps">
            {STEPS.map((step, index) => (
              <button
                key={step.shortTitle}
                type="button"
                className={`water-animation__step ${index === activeStepIndex ? 'water-animation__step--active' : ''}`}
                onClick={() => jumpToStep(index)}
                aria-current={index === activeStepIndex ? 'step' : undefined}
              >
                <span className="water-animation__step-number">{index + 1}</span>
                <span>
                  <span className="water-animation__step-kicker">{step.kicker}</span>
                  <span className="water-animation__step-title">{step.shortTitle}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="water-animation__science-note">
            <strong>Keep the bond types separate.</strong><br />
            Solid O–H bonds are within a molecule. Dashed hydrogen bonds are between molecules.
          </div>
        </aside>
      </div>

      <footer className="water-animation__controls">
        <div className="water-animation__buttons">
          <button
            type="button"
            className="water-animation__control water-animation__control--primary"
            onClick={togglePlayback}
            aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
          >
            <span aria-hidden="true">{isPlaying ? 'Ⅱ' : '▶'}</span>
          </button>
          <button
            type="button"
            className="water-animation__control"
            onClick={restart}
            aria-label="Restart animation"
            title="Restart"
          >
            <span aria-hidden="true">↺</span>
          </button>
          <button
            type="button"
            className="water-animation__control water-animation__control--captions"
            onClick={() => setCaptionsOn(value => !value)}
            aria-pressed={captionsOn}
            aria-label={captionsOn ? 'Hide captions' : 'Show captions'}
            title="Captions"
          >
            CC
          </button>
        </div>

        <label className="water-animation__timeline">
          <span className="sr-only">Animation progress</span>
          <input
            className="water-animation__range"
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={event => {
              setProgress(Number(event.target.value));
              setIsPlaying(false);
            }}
          />
          <span className="water-animation__time">{timeLabel}</span>
        </label>

        {captionsOn && (
          <p className="water-animation__caption">
            <strong>{activeStep.kicker}</strong><br />
            {activeStep.caption}
          </p>
        )}
      </footer>
    </section>
  );
}
