import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle, ArrowLeft, BookOpenCheck, Check, ChevronRight,
  FlaskConical, Gauge, HelpCircle, Info, Maximize2, RotateCcw, ShieldCheck,
  Sparkles, Users, Volume2, X
} from 'lucide-react';

import { createScienceCentreBridge, originOf, PROTOCOL_VERSION } from '@/components/scienceCentre/scienceCentreBridge';

/**
 * URL of the hosted Unity WebGL build of the Diverse Youth Virtual Science
 * Centre (entrance atrium, department scenes, first-person hands).
 *
 * The build is ~134 MB, so it is hosted on its own origin rather than bundled
 * into this app. Set VITE_SCIENCE_CENTRE_URL at build time to the Unity host
 * page; its origin is derived automatically and used to lock down postMessage
 * traffic in both directions.
 */
const SCIENCE_CENTRE_URL = import.meta.env.VITE_SCIENCE_CENTRE_URL || '/science-centre/index.html';
const CHECKPOINT_KEY = 'dysc.latest-checkpoint';

const navy = '#081a2d';
const cyan = '#25c6da';
const orange = '#f59e0b';
const STORAGE_KEY = 'diverse-youth-virtual-lab-titration-v1';
const targets = [24.80, 24.65, 24.70, 24.65];

const practicals = [
  {
    subject: 'Chemistry',
    title: 'Acid–base titration',
    description: 'Prepare the apparatus, find the endpoint and obtain concordant titres.',
    duration: '35–45 min',
    level: 'GCSE',
    status: 'ready',
    accent: '#19b6aa'
  },
  {
    subject: 'Chemistry',
    title: 'Identify unknown ions',
    description: 'Use flame, precipitation and gas tests to identify an unknown sample.',
    duration: '30–40 min',
    level: 'GCSE',
    status: 'planned',
    accent: '#7c3aed'
  },
  {
    subject: 'Physics',
    title: 'Current–voltage characteristics',
    description: 'Build a circuit and investigate a resistor, filament lamp and diode.',
    duration: '30–40 min',
    level: 'GCSE',
    status: 'planned',
    accent: '#2563eb'
  },
  {
    subject: 'Biology',
    title: 'Enzyme activity',
    description: 'Investigate how temperature changes the rate of an enzyme reaction.',
    duration: '30–40 min',
    level: 'GCSE',
    status: 'planned',
    accent: '#16a34a'
  }
];

const steps = [
  'Safety and apparatus',
  'Prepare the burette',
  'Transfer the alkali',
  'Add the indicator',
  'Rough titration',
  'Accurate titrations',
  'Analyse your results'
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatReading(value) {
  return Number(value).toFixed(2);
}

function Fraction({ top, bottom }) {
  return (
    <span className="vl-fraction" aria-label={`${top} divided by ${bottom}`}>
      <span>{top}</span><span>{bottom}</span>
    </span>
  );
}

function LabRoomPreview() {
  return (
    <div className="vl-room" aria-label="Virtual chemistry laboratory preview">
      <div className="vl-room__ceiling">
        <span /><span /><span />
      </div>
      <div className="vl-room__window">
        <span className="vl-room__window-cross" />
      </div>
      <div className="vl-room__poster">
        <ShieldCheck size={24} />
        <strong>Think safety</strong>
        <small>Goggles • coat • care</small>
      </div>
      <div className="vl-room__cupboard">
        <span>REAGENTS</span>
        <div /><div />
      </div>
      <div className="vl-room__bench vl-room__bench--back">
        <i /><i /><i />
      </div>
      <div className="vl-room__bench vl-room__bench--front">
        <div className="vl-room__sink" />
        <div className="vl-room__tap" />
        <div className="vl-room__stool vl-room__stool--one" />
        <div className="vl-room__stool vl-room__stool--two" />
      </div>
      <div className="vl-room__floor-lines" />
      <div className="vl-room__glow" />
      <div className="vl-room__label">
        <span>Interactive room</span>
        <strong>Explore equipment and complete practicals</strong>
      </div>
    </div>
  );
}

function Lobby({ onStart, onStart3D }) {
  const [subject, setSubject] = useState('Chemistry');
  const filtered = subject === 'All' ? practicals : practicals.filter(item => item.subject === subject);

  return (
    <div className="vl-shell vl-dashboard">
      <aside className="vl-side">
        <Link to="/" className="vl-brand" aria-label="Back to learning hub">
          <span className="vl-brand__mark"><FlaskConical size={24} /></span>
          <span><strong>Diverse Youth</strong><small>Learning Hub</small></span>
        </Link>
        <nav aria-label="Laboratory navigation">
          <Link to="/"><span>⌂</span> Dashboard</Link>
          <button className="active"><FlaskConical size={19} /> Virtual Laboratory</button>
          <button><Gauge size={19} /> My Results</button>
          <button><BookOpenCheck size={19} /> Study Resources</button>
          <button><Users size={19} /> Team Sessions <i>soon</i></button>
          <button><HelpCircle size={19} /> Help Centre</button>
        </nav>
        <div className="vl-side__safety"><ShieldCheck size={22} /><div><strong>Safety first</strong><small>Read the briefing before every practical.</small></div></div>
      </aside>

      <main className="vl-dashboard__main">
        <header className="vl-dashboard__header">
          <div>
            <p className="vl-eyebrow"><Sparkles size={15} /> Learn by doing</p>
            <h1>Virtual Laboratory</h1>
            <p>Practise science safely through interactive experiments.</p>
          </div>
          <div className="vl-dashboard__tools">
            <button className="vl-icon-button" title="Sound settings"><Volume2 size={19} /></button>
            <button className="vl-ghost-button"><Users size={18} /> Team mode <span>Coming soon</span></button>
          </div>
        </header>

        <section className="vl-progress-card">
          <div className="vl-progress-card__heading"><div><Gauge size={22} /><strong>Your progress</strong></div><span>Level 1</span></div>
          <div className="vl-stat-row">
            <div><strong>0</strong><small>Practicals completed</small></div>
            <div><strong>0 min</strong><small>Total time</small></div>
            <div><strong>—</strong><small>Average score</small></div>
            <div><strong>1</strong><small>Practical available</small></div>
          </div>
          <div className="vl-dashboard-progress"><span style={{ width: '8%' }} /></div>
          <small>Complete your first practical to begin building laboratory confidence.</small>
        </section>

        <div className="vl-dashboard-grid">
          <section className="vl-practical-library" id="practicals">
            <div className="vl-section-heading">
              <div><p className="vl-eyebrow">Practical library</p><h2>Choose an investigation</h2></div>
              <div className="vl-filters" role="group" aria-label="Filter by subject">
                {['Chemistry', 'Physics', 'Biology', 'All'].map(item => (
                  <button key={item} className={subject === item ? 'active' : ''} onClick={() => setSubject(item)}>{item}</button>
                ))}
              </div>
            </div>
            <div className="vl-card-grid">
              {filtered.map((item, index) => (
                <motion.article
                  key={item.title}
                  className={`vl-practical-card ${item.status !== 'ready' ? 'is-planned' : ''}`}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  style={{ '--accent': item.accent }}
                >
                  <div className="vl-practical-card__visual">
                    <div className="vl-mini-flask"><span /></div>
                    <span className="vl-subject-pill">{item.subject}</span>
                  </div>
                  <div className="vl-practical-card__body">
                    <div className="vl-card-meta"><span>{item.level}</span><span>{item.duration}</span></div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <div className="vl-difficulty"><Gauge size={14} /> Difficulty: <strong>{item.status === 'ready' ? 'Medium' : 'To be confirmed'}</strong></div>
                    {item.status === 'ready' ? (
                      <>
                        <button className="vl-card-start vl-card-start--3d" onClick={onStart3D}>
                          Enter 3D laboratory <ChevronRight size={17} />
                        </button>
                        <button className="vl-card-start vl-card-start--flat" onClick={onStart}>
                          Guided 2D version
                        </button>
                      </>
                    ) : (
                      <button className="vl-card-start" disabled>In development</button>
                    )}
                  </div>
                </motion.article>
              ))}
            </div>
          </section>

          <aside className="vl-dashboard__rail">
            <section className="vl-rail-card">
              <div className="vl-rail-card__title"><Gauge size={19} /><strong>Recently attempted</strong></div>
              <div className="vl-empty-state"><FlaskConical size={31} /><strong>No attempts yet</strong><span>Your saved practicals will appear here.</span></div>
            </section>
            <section className="vl-rail-card vl-assigned">
              <div className="vl-rail-card__title"><BookOpenCheck size={19} /><strong>Recommended first</strong></div>
              <h3>Acid–base titration</h3>
              <p>Learn accurate volumetric technique and obtain concordant results.</p>
              <button className="vl-primary-button" onClick={onStart3D}>Enter 3D laboratory</button>
              <button className="vl-secondary-button" style={{ width: '100%', marginTop: 8 }} onClick={onStart}>
                Guided 2D version
              </button>
            </section>
            <section className="vl-dashboard-room"><LabRoomPreview /></section>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Burette({ delivered, endpoint, overshot, tapOpen }) {
  const level = clamp(8 + (delivered / 30) * 70, 8, 78);
  const flaskColour = overshot ? '#e11d8a' : endpoint ? '#f7f7f4' : '#f7a8cc';

  return (
    <div className="vl-apparatus" aria-label="Burette above a conical flask">
      <div className="vl-stand">
        <span className="vl-stand__rod" />
        <span className="vl-stand__base" />
        <span className="vl-stand__clamp" />
      </div>
      <div className="vl-burette">
        <div className="vl-burette__scale">
          {[0,5,10,15,20,25,30,35,40,45,50].map(n => <span key={n} style={{ top: `${5 + n * 1.65}%` }}>{n}</span>)}
        </div>
        <div className="vl-burette__tube">
          <span className="vl-burette__liquid" style={{ top: `${level}%` }} />
          <span className="vl-burette__meniscus" style={{ top: `calc(${level}% - 2px)` }} />
        </div>
        <span className="vl-burette__tap" />
        <span className={`vl-burette__drop ${tapOpen ? 'is-dropping' : ''}`} />
      </div>
      <div className="vl-tile" />
      <div className="vl-flask">
        <div className="vl-flask__neck" />
        <div className="vl-flask__body">
          <span className="vl-flask__liquid" style={{ background: flaskColour }} />
          <span className={`vl-flask__swirl ${tapOpen ? 'active' : ''}`} />
        </div>
      </div>
      <div className="vl-apparatus__caption">
        <span>Delivered</span>
        <strong>{formatReading(delivered)} cm³</strong>
      </div>
    </div>
  );
}

function ReadingTable({ runs }) {
  return (
    <div className="vl-table-wrap">
      <table className="vl-readings">
        <thead>
          <tr><th>Run</th><th>Initial / cm³</th><th>Final / cm³</th><th>Titre / cm³</th><th>Use?</th></tr>
        </thead>
        <tbody>
          {['Rough', '1', '2', '3'].map((label, index) => {
            const run = runs[index];
            return (
              <tr key={label}>
                <th>{label}</th>
                <td>{run ? '0.00' : '—'}</td>
                <td>{run ? formatReading(run.value) : '—'}</td>
                <td>{run ? formatReading(run.value) : '—'}</td>
                <td>{index === 0 ? 'No' : run ? (run.overshot ? 'No' : 'Yes') : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SafetyBriefing({ onComplete }) {
  const [checked, setChecked] = useState([]);
  const items = [
    ['goggles', 'Wear eye protection', 'Protects your eyes from acid or alkali splashes.'],
    ['coat', 'Wear a laboratory coat', 'Keeps chemicals away from clothing and skin.'],
    ['upright', 'Clamp the burette vertically', 'Prevents inaccurate readings and spills.']
  ];
  const toggle = id => setChecked(current => current.includes(id) ? current.filter(x => x !== id) : [...current, id]);

  return (
    <div className="vl-task-card">
      <p className="vl-eyebrow">Before you begin</p>
      <h2>Prepare to work safely</h2>
      <p>Select every correct safety measure. You must complete the safety check before using the apparatus.</p>
      <div className="vl-safety-grid">
        {items.map(([id, title, text]) => (
          <button key={id} className={checked.includes(id) ? 'selected' : ''} onClick={() => toggle(id)}>
            <span>{checked.includes(id) ? <Check size={20} /> : <ShieldCheck size={20} />}</span>
            <strong>{title}</strong><small>{text}</small>
          </button>
        ))}
      </div>
      <button className="vl-primary-button" disabled={checked.length !== items.length} onClick={onComplete}>
        Safety check complete <ChevronRight size={18} />
      </button>
    </div>
  );
}

function PreparationTask({ step, onNext }) {
  const configs = {
    1: {
      title: 'Prepare the burette',
      intro: 'A burette must be conditioned with the solution it will contain. This prevents dilution by residual water.',
      actions: [
        ['Rinse with deionised water', 'Removes soluble contamination.'],
        ['Rinse with a little hydrochloric acid', 'Conditions the inner surface with the titrant.'],
        ['Fill above 0.00 cm³ and remove the funnel', 'The funnel must not remain in place during titration.'],
        ['Run acid through the jet and set 0.00 cm³', 'Removes air bubbles and establishes the initial reading.']
      ]
    },
    2: {
      title: 'Transfer 25.0 cm³ of sodium hydroxide',
      intro: 'Use a volumetric pipette because it delivers one fixed volume more accurately than a measuring cylinder.',
      actions: [
        ['Rinse the pipette with sodium hydroxide', 'Prevents the alkali from being diluted.'],
        ['Use a pipette filler to draw solution above the mark', 'Never pipette by mouth.'],
        ['Set the bottom of the meniscus on the mark', 'Read at eye level to avoid parallax error.'],
        ['Drain into the conical flask', 'Touch the tip to the flask wall; do not blow out the final drop.']
      ]
    },
    3: {
      title: 'Add phenolphthalein',
      intro: 'Add only 2–3 drops. Too much indicator can affect the titre because indicators are weak acids or bases.',
      actions: [
        ['Add 2–3 drops of phenolphthalein', 'The alkaline solution becomes pink.'],
        ['Place the flask on a white tile', 'The white background makes the endpoint easier to judge.'],
        ['Position the flask under the burette', 'The burette tip should sit safely inside the flask neck.']
      ]
    }
  };
  const config = configs[step];
  const [done, setDone] = useState([]);

  const select = index => {
    if (!done.includes(index) && index === done.length) setDone([...done, index]);
  };

  return (
    <div className="vl-task-card">
      <p className="vl-eyebrow">Apparatus preparation</p>
      <h2>{config.title}</h2>
      <p>{config.intro}</p>
      <div className="vl-action-list">
        {config.actions.map(([title, text], index) => (
          <button
            key={title}
            className={`${done.includes(index) ? 'done' : ''} ${index > done.length ? 'locked' : ''}`}
            onClick={() => select(index)}
          >
            <span>{done.includes(index) ? <Check size={18} /> : index + 1}</span>
            <div><strong>{title}</strong><small>{text}</small></div>
          </button>
        ))}
      </div>
      <button className="vl-primary-button" disabled={done.length !== config.actions.length} onClick={onNext}>
        Continue <ChevronRight size={18} />
      </button>
    </div>
  );
}

function TitrationTask({ runIndex, delivered, setDelivered, onRecord, resetRun }) {
  const target = targets[runIndex];
  const endpoint = delivered >= target && delivered <= target + 0.10;
  const overshot = delivered > target + 0.10;
  const [tapOpen, setTapOpen] = useState(false);
  const isRough = runIndex === 0;

  const add = amount => {
    setTapOpen(true);
    window.setTimeout(() => setTapOpen(false), 320);
    setDelivered(current => clamp(Math.round((current + amount) * 100) / 100, 0, 50));
  };

  return (
    <div className="vl-titration-layout">
      <div className="vl-task-card vl-control-panel">
        <p className="vl-eyebrow">{isRough ? 'Rough titration' : `Accurate titration ${runIndex}`}</p>
        <h2>{isRough ? 'Find the approximate endpoint' : 'Approach the endpoint carefully'}</h2>
        <p>
          {isRough
            ? 'Add acid more quickly at first. When the pink becomes paler, add smaller volumes and swirl continuously.'
            : 'Use the rough titre as your guide. Add acid rapidly until about 2 cm³ before the expected endpoint, then add it dropwise.'}
        </p>

        <div className="vl-live-status">
          <span className={`vl-colour-swatch ${endpoint ? 'endpoint' : overshot ? 'overshot' : ''}`} />
          <div>
            <small>Flask observation</small>
            <strong>{overshot ? 'Endpoint passed — excess acid added' : endpoint ? 'First permanent colourless endpoint' : delivered > target - 2 ? 'Very pale pink — use single drops' : 'Pink solution'}</strong>
          </div>
        </div>

        {overshot && (
          <div className="vl-error-box"><AlertTriangle size={19} /><span>This run is not valid. Record it as overshot, then repeat with a fresh 25.0 cm³ sample.</span></div>
        )}

        <div className="vl-dose-controls">
          <button onClick={() => add(5)} disabled={endpoint || overshot || delivered > target - 5}>Open tap: 5.00 cm³</button>
          <button onClick={() => add(1)} disabled={endpoint || overshot}>Add 1.00 cm³</button>
          <button onClick={() => add(0.1)} disabled={endpoint || overshot}>Add 0.10 cm³</button>
          <button onClick={() => add(0.05)} disabled={endpoint || overshot}>Add one drop ≈ 0.05 cm³</button>
        </div>
        <div className="vl-hint">
          <Info size={18} />
          <span>Read a burette from the top down. Record every reading to two decimal places, including a final zero where needed.</span>
        </div>
        <div className="vl-task-actions">
          <button className="vl-secondary-button" onClick={resetRun}><RotateCcw size={17} /> Reset run</button>
          <button className="vl-primary-button" disabled={!endpoint && !overshot} onClick={() => onRecord({ value: delivered, overshot })}>
            Record titre <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <Burette delivered={delivered} endpoint={endpoint} overshot={overshot} tapOpen={tapOpen} />
    </div>
  );
}

function ResultsTask({ runs, onFinish }) {
  const validAccurate = runs.slice(1).filter(run => !run.overshot).map(run => run.value);
  const pairs = [];
  for (let i = 0; i < validAccurate.length; i += 1) {
    for (let j = i + 1; j < validAccurate.length; j += 1) {
      if (Math.abs(validAccurate[i] - validAccurate[j]) <= 0.10) pairs.push([validAccurate[i], validAccurate[j]]);
    }
  }
  const chosen = pairs[0] || validAccurate.slice(0, 2);
  const mean = chosen.length ? chosen.reduce((a, b) => a + b, 0) / chosen.length : 0;
  const concentration = mean ? (0.125 * mean) / 25.0 : 0;
  const concordant = pairs.length > 0;

  return (
    <div className="vl-task-card vl-analysis">
      <p className="vl-eyebrow">Analyse your results</p>
      <h2>Choose concordant titres</h2>
      <p>
        Concordant titres differ by no more than 0.10 cm³. Do not include the rough titre or an overshot run when calculating the mean.
      </p>
      <ReadingTable runs={runs} />
      <div className={`vl-concordance ${concordant ? 'success' : 'warning'}`}>
        {concordant ? <Check size={20} /> : <AlertTriangle size={20} />}
        <div>
          <strong>{concordant ? 'Concordant readings obtained' : 'No concordant pair yet'}</strong>
          <span>{concordant ? `${formatReading(chosen[0])} cm³ and ${formatReading(chosen[1])} cm³ differ by no more than 0.10 cm³.` : 'Repeat an accurate titration to improve reliability.'}</span>
        </div>
      </div>

      {concordant && (
        <div className="vl-calculation">
          <h3>Calculate the sodium hydroxide concentration</h3>
          <p>The reaction is <strong>HCl + NaOH → NaCl + H₂O</strong>, so the mole ratio is 1 : 1.</p>
          <div className="vl-equation-line">
            <span>mean titre</span>
            <strong><Fraction top={`${formatReading(chosen[0])} + ${formatReading(chosen[1])}`} bottom="2" /> = {formatReading(mean)} cm³</strong>
          </div>
          <div className="vl-equation-line">
            <span>moles of HCl</span>
            <strong>0.125 × <Fraction top={formatReading(mean)} bottom="1000" /> = {(0.125 * mean / 1000).toExponential(3)} mol</strong>
          </div>
          <div className="vl-equation-line">
            <span>concentration of NaOH</span>
            <strong><Fraction top={(0.125 * mean / 1000).toExponential(3)} bottom="0.0250" /> = {concentration.toFixed(3)} mol dm⁻³</strong>
          </div>
        </div>
      )}

      <button className="vl-primary-button" disabled={!concordant} onClick={() => onFinish({ mean, concentration })}>
        Complete practical <ChevronRight size={18} />
      </button>
    </div>
  );
}

function Completion({ result, runs, onRestart, onExit }) {
  return (
    <div className="vl-completion">
      <div className="vl-completion__icon"><BookOpenCheck size={38} /></div>
      <p className="vl-eyebrow">Practical complete</p>
      <h1>Reliable result obtained</h1>
      <p>You prepared the apparatus, controlled the endpoint and selected concordant titres correctly.</p>
      <div className="vl-score-grid">
        <div><small>Mean titre</small><strong>{formatReading(result.mean)} cm³</strong></div>
        <div><small>NaOH concentration</small><strong>{result.concentration.toFixed(3)} mol dm⁻³</strong></div>
        <div><small>Accurate runs</small><strong>{runs.slice(1).length} recorded</strong></div>
      </div>
      <div className="vl-feedback">
        <ShieldCheck size={22} />
        <div><strong>Skill feedback</strong><span>You used the rough result only as a guide and calculated the mean from concordant accurate titres.</span></div>
      </div>
      <div className="vl-completion__actions">
        <button className="vl-secondary-button" onClick={onRestart}><RotateCcw size={17} /> Practise again</button>
        <button className="vl-primary-button" onClick={onExit}>Return to laboratory</button>
      </div>
    </div>
  );
}

function Experiment({ onExit }) {
  const saved = useMemo(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
  }, []);
  const [step, setStep] = useState(saved.step || 0);
  const [runs, setRuns] = useState(saved.runs || []);
  const [delivered, setDelivered] = useState(saved.delivered || 0);
  const [result, setResult] = useState(saved.result || null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, runs, delivered, result }));
  }, [step, runs, delivered, result]);

  const reset = () => {
    setStep(0); setRuns([]); setDelivered(0); setResult(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const recordRun = run => {
    const updated = [...runs, run];
    setRuns(updated);
    setDelivered(0);
    if (updated.length === 1) setStep(5);
    if (updated.length >= 4) setStep(6);
  };

  if (result) {
    return <div className="vl-shell vl-experiment"><Completion result={result} runs={runs} onRestart={reset} onExit={onExit} /></div>;
  }

  return (
    <div className="vl-shell vl-experiment">
      <header className="vl-labbar">
        <button className="vl-icon-button" onClick={onExit} aria-label="Leave practical"><ArrowLeft size={20} /></button>
        <div className="vl-labbar__title"><FlaskConical size={21} /><span><strong>Acid–base titration</strong><small>Guided practical</small></span></div>
        <div className="vl-labbar__actions">
          <button className="vl-icon-button" onClick={() => setShowHelp(true)} aria-label="Open help"><HelpCircle size={20} /></button>
          <button className="vl-icon-button" onClick={() => document.documentElement.requestFullscreen?.()} aria-label="Enter full screen"><Maximize2 size={19} /></button>
        </div>
      </header>

      <div className="vl-progress" aria-label={`Step ${step + 1} of ${steps.length}`}>
        <div className="vl-progress__meta"><span>Step {step + 1} of {steps.length}</span><strong>{steps[step]}</strong></div>
        <div className="vl-progress__track"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
        <div className="vl-progress__steps">
          {steps.map((name, index) => <span key={name} className={index <= step ? 'active' : ''}>{index + 1}</span>)}
        </div>
      </div>

      <main className="vl-workspace">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.2 }}>
            {step === 0 && <SafetyBriefing onComplete={() => setStep(1)} />}
            {[1, 2, 3].includes(step) && <PreparationTask step={step} onNext={() => setStep(step + 1)} />}
            {[4, 5].includes(step) && (
              <TitrationTask
                runIndex={runs.length}
                delivered={delivered}
                setDelivered={setDelivered}
                resetRun={() => setDelivered(0)}
                onRecord={recordRun}
              />
            )}
            {step === 6 && <ResultsTask runs={runs} onFinish={setResult} />}
          </motion.div>
        </AnimatePresence>
        {step === 5 && runs.length < 4 && (
          <div className="vl-run-strip">
            <ReadingTable runs={runs} />
          </div>
        )}
      </main>

      <AnimatePresence>
        {showHelp && (
          <motion.div className="vl-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="vl-help-modal" initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }}>
              <button className="vl-modal-close" onClick={() => setShowHelp(false)}><X size={19} /></button>
              <h2>How to use the practical</h2>
              <p>Complete each action in order. The experiment will not silently correct an unsafe or inaccurate decision.</p>
              <ul>
                <li>Use 1.00 cm³ additions when far from the endpoint.</li>
                <li>Use 0.10 cm³, then single drops when the pink becomes pale.</li>
                <li>A permanent colourless solution is the phenolphthalein endpoint.</li>
                <li>Your progress is saved automatically on this device.</li>
              </ul>
              <button className="vl-primary-button" onClick={() => setShowHelp(false)}>Continue practical</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Full-screen shell hosting the Unity Virtual Science Centre.
 *
 * The Science Centre is a Unity WebGL build - the student walks in through the
 * entrance atrium in first person, with visible hands, and chooses a
 * department. It is embedded rather than reimplemented: Unity is the runtime
 * for the simulation, per the project design document.
 */
function ScienceCentreWorkspace({ onExit }) {
  const frameRef = useRef(null);
  const [status, setStatus] = useState('loading');   // loading | ready | error
  const [place, setPlace] = useState('Entrance atrium');
  const [error, setError] = useState('');

  const targetOrigin = useMemo(() => originOf(SCIENCE_CENTRE_URL), []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !SCIENCE_CENTRE_URL) return undefined;

    // Restore the learner's last checkpoint so they resume where they stopped.
    let checkpointJson;
    try {
      checkpointJson = window.localStorage.getItem(CHECKPOINT_KEY) || undefined;
    } catch {
      checkpointJson = undefined;   // private browsing, storage disabled
    }

    const bridge = createScienceCentreBridge({
      targetWindow: frame.contentWindow,
      targetOrigin,
      launchContext: {
        protocolVersion: PROTOCOL_VERSION,
        sessionId: crypto.randomUUID(),
        learnerId: 'base44-learner',
        courseId: 'science-centre-foundation',
        department: 0,
        mode: 'learner',
        textScale: 100,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        ...(checkpointJson ? { checkpointJson } : {}),
      },
      onReady: () => setStatus('ready'),
      onDepartmentChanged: (name) => {
        setError('');
        setPlace(name === 'Atrium' ? 'Entrance atrium' : `${name} department`);
      },
      onCheckpoint: (json) => {
        try { window.localStorage.setItem(CHECKPOINT_KEY, json); } catch { /* not fatal */ }
      },
      onNavigationFailed: (message) => setError(message),
    });

    return () => bridge.dispose();
  }, [targetOrigin]);

  if (!SCIENCE_CENTRE_URL) {
    return (
      <div className="vl-lab3d">
        <header className="vl-labbar">
          <div className="vl-labbar__title">
            <button className="vl-icon-button" onClick={onExit} aria-label="Go back">
              <ArrowLeft size={20} />
            </button>
            <span><strong>Virtual Science Centre</strong></span>
          </div>
        </header>
        <div className="vl-lab3d__stage">
          <div className="vl-lab3d__loading">
            <FlaskConical size={34} />
            <strong>Science Centre not configured</strong>
            <span>
              Set <code>VITE_SCIENCE_CENTRE_URL</code> to the hosted Unity build,
              then rebuild this app.
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vl-lab3d">
      <header className="vl-labbar">
        <div className="vl-labbar__title">
          <button className="vl-icon-button" onClick={onExit} aria-label="Leave the Science Centre">
            <ArrowLeft size={20} />
          </button>
          <span>
            <strong>Virtual Science Centre</strong>
            <small>{error || place}</small>
          </span>
        </div>
        <div className="vl-labbar__actions">
          <span className="vl-labbar__hint">WASD to walk · mouse to look · click to interact</span>
        </div>
      </header>
      <div className="vl-lab3d__stage">
        <iframe
          ref={frameRef}
          src={SCIENCE_CENTRE_URL}
          title="Diverse Youth Virtual Science Centre"
          allow="fullscreen; autoplay; gamepad; xr-spatial-tracking"
          allowFullScreen
          style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
        />
        {status === 'loading' && (
          <div className="vl-lab3d__loading">
            <FlaskConical size={34} />
            <strong>Entering the Science Centre…</strong>
            <span>First visit downloads the building; later visits are cached.</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Laboratory() {
  const [mode, setMode] = useState('lobby');
  return (
    <>
      <style>{`
        .vl-shell{min-height:100vh;background:#f4f8fb;color:#0b1d33;font-family:Inter,Roboto,Arial,sans-serif;overflow-x:hidden;max-width:100vw}
        .vl-dashboard{display:grid;grid-template-columns:245px minmax(0,1fr)}.vl-side{min-height:100vh;background:linear-gradient(180deg,#061b31,#082744);color:#fff;padding:25px 14px;display:flex;flex-direction:column;position:sticky;top:0;height:100vh}.vl-side .vl-brand{padding:0 8px 24px;border-bottom:1px solid #ffffff16}.vl-side nav{display:grid;gap:8px;margin-top:25px}.vl-side nav a,.vl-side nav button{min-height:49px;width:100%;border:0;background:transparent;color:#cfe0e8;border-radius:11px;padding:0 14px;display:flex;align-items:center;gap:12px;text-decoration:none;font:inherit;font-weight:700;text-align:left;cursor:pointer}.vl-side nav button.active{background:linear-gradient(90deg,#0e777a,#12547c);color:#fff;box-shadow:0 8px 20px #0003}.vl-side nav i{margin-left:auto;background:#f59e0b;color:#0b2236;border-radius:20px;padding:2px 6px;font-size:9px;text-transform:uppercase;font-style:normal}.vl-side__safety{margin-top:auto;background:#ffffff0d;border:1px solid #ffffff1c;border-radius:13px;padding:14px;display:flex;gap:10px;color:#72ded6}.vl-side__safety strong,.vl-side__safety small{display:block}.vl-side__safety small{color:#abc1cc;line-height:1.35;margin-top:4px}
        .vl-dashboard__main{padding:38px clamp(22px,4vw,58px) 70px;max-width:1600px;width:100%;min-width:0;margin:auto}.vl-dashboard__header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:24px}.vl-dashboard__header h1{font-size:clamp(38px,5vw,62px);letter-spacing:-.045em;margin:0 0 6px;line-height:1}.vl-dashboard__header>div>p:last-child{color:#617588;margin:0}.vl-dashboard__tools{display:flex;gap:10px}.vl-dashboard__tools .vl-icon-button,.vl-dashboard__tools .vl-ghost-button{background:#102c43;color:#fff}
        .vl-progress-card{background:#fff;border:1px solid #d6e2e8;border-radius:18px;padding:22px 24px;box-shadow:0 12px 30px #1231470d;margin-bottom:34px}.vl-progress-card__heading{display:flex;justify-content:space-between;align-items:center}.vl-progress-card__heading>div{display:flex;align-items:center;gap:9px}.vl-progress-card__heading svg{color:#159a9a}.vl-progress-card__heading>span{font-size:12px;font-weight:900;color:#ef7f16;background:#fff3df;padding:5px 10px;border-radius:20px}.vl-stat-row{display:grid;grid-template-columns:repeat(4,1fr);margin:22px 0 16px}.vl-stat-row>div{padding:0 18px;border-right:1px solid #dfe7eb}.vl-stat-row>div:first-child{padding-left:0}.vl-stat-row>div:last-child{border:0}.vl-stat-row strong,.vl-stat-row small{display:block}.vl-stat-row strong{font-size:20px}.vl-stat-row small{color:#6b7d8d;margin-top:4px}.vl-dashboard-progress{height:7px;background:#e6edf1;border-radius:10px;overflow:hidden;margin-bottom:8px}.vl-dashboard-progress span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#159a9a,#23c2bc)}.vl-progress-card>small{color:#6d7f8e}
        .vl-dashboard-grid{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:24px;align-items:start}.vl-section-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-bottom:20px}.vl-section-heading h2{font-size:clamp(26px,3vw,36px);letter-spacing:-.03em;margin:0}.vl-practical-library .vl-card-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.vl-difficulty{display:flex;align-items:center;gap:5px;color:#748596;font-size:12px;margin:12px 0}.vl-difficulty strong{color:#e37816}.vl-practical-card .vl-card-start{width:100%;min-height:39px;background:#0c8b89;color:#fff;border-radius:9px;justify-content:center;padding:0 13px}.vl-practical-card .vl-card-start:disabled{background:#b8c7cf;color:#fff}.vl-dashboard__rail{display:grid;gap:18px}.vl-rail-card{background:#fff;border:1px solid #d6e2e8;border-radius:16px;padding:20px;box-shadow:0 10px 26px #102e400d}.vl-rail-card__title{display:flex;align-items:center;gap:8px;color:#123249;margin-bottom:17px}.vl-rail-card__title svg{color:#178f91}.vl-empty-state{display:flex;flex-direction:column;align-items:center;text-align:center;background:#f4f8fa;border-radius:12px;padding:25px;color:#8394a1}.vl-empty-state strong{color:#3e5669;margin:10px 0 4px}.vl-empty-state span{font-size:12px}.vl-assigned h3{font-size:20px;margin:8px 0}.vl-assigned p{font-size:13px;line-height:1.55;color:#647788}.vl-assigned .vl-primary-button{width:100%;margin-top:6px}.vl-dashboard-room .vl-room{height:245px;border-radius:16px}.vl-dashboard-room .vl-room__poster{display:none}.vl-dashboard-room .vl-room__window{transform:scale(.65);transform-origin:top left}.vl-dashboard-room .vl-room__label{bottom:15px;left:15px;right:15px}.vl-dashboard-room .vl-room__bench--front{display:none}
        .vl-shell *{box-sizing:border-box}.vl-topbar,.vl-labbar{height:76px;padding:0 clamp(18px,4vw,64px);display:flex;align-items:center;justify-content:space-between;background:#071a2d;color:#fff;position:relative;z-index:20}
        .vl-brand{display:flex;align-items:center;gap:12px;color:#fff;text-decoration:none}.vl-brand__mark{width:44px;height:44px;border-radius:14px;background:linear-gradient(135deg,#19c8c0,#168cbd);display:grid;place-items:center;box-shadow:0 8px 24px #19c8c044}.vl-brand span:last-child{display:flex;flex-direction:column}.vl-brand strong{font-size:16px}.vl-brand small{color:#9cc3d5;font-size:12px;letter-spacing:.08em;text-transform:uppercase}.vl-topbar__actions,.vl-labbar__actions{display:flex;gap:10px;align-items:center}
        .vl-icon-button,.vl-ghost-button,.vl-primary-button,.vl-secondary-button{border:0;font:inherit;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:9px;transition:.2s}.vl-icon-button{width:42px;height:42px;border-radius:12px;background:#ffffff12;color:inherit}.vl-icon-button:hover{background:#ffffff22}.vl-ghost-button{height:42px;padding:0 15px;border-radius:12px;background:#ffffff10;color:#fff;border:1px solid #ffffff24}.vl-ghost-button span{font-size:10px;background:#f59e0b;color:#172033;padding:3px 6px;border-radius:20px;font-weight:800;text-transform:uppercase}
        .vl-primary-button,.vl-secondary-button{min-height:48px;padding:0 22px;border-radius:12px;font-weight:800}.vl-primary-button{background:linear-gradient(135deg,#ff9b25,#f97316);color:#132238;box-shadow:0 9px 24px #f9731638}.vl-primary-button:hover{transform:translateY(-1px);box-shadow:0 12px 28px #f9731648}.vl-primary-button:disabled{opacity:.42;cursor:not-allowed;transform:none}.vl-secondary-button{background:#fff;color:#15304a;border:1px solid #cad7e2;text-decoration:none}.vl-secondary-button:hover{background:#edf4f8}
        .vl-hero{min-height:620px;background:linear-gradient(135deg,#071b2e 0%,#0a2940 55%,#0d3b4b 100%);display:grid;grid-template-columns:minmax(0,1fr) minmax(480px,1.12fr);align-items:center;gap:clamp(30px,5vw,80px);padding:70px clamp(24px,6vw,92px);overflow:hidden}.vl-hero__copy{color:#fff;max-width:650px}.vl-eyebrow{display:flex;align-items:center;gap:8px;color:#18bbae;text-transform:uppercase;letter-spacing:.16em;font-weight:900;font-size:12px;margin:0 0 14px}.vl-hero h1{font-size:clamp(44px,6vw,78px);line-height:.99;letter-spacing:-.05em;margin:0 0 24px;font-weight:900}.vl-hero h1 span{color:#ff9b25}.vl-lead{color:#bed3df;line-height:1.75;font-size:clamp(16px,1.6vw,20px);max-width:620px}.vl-hero__actions{display:flex;gap:12px;flex-wrap:wrap;margin:30px 0 26px}.vl-trust-row{display:flex;gap:18px;flex-wrap:wrap;color:#b9d0dc;font-size:13px}.vl-trust-row span{display:flex;align-items:center;gap:6px}.vl-trust-row svg{color:#19c8c0}
        .vl-room{height:455px;border-radius:28px;position:relative;overflow:hidden;background:linear-gradient(#dfeef2 0 62%,#b8c9cf 62%);box-shadow:0 30px 80px #0008;border:1px solid #ffffff55;perspective:800px}.vl-room:before{content:'';position:absolute;left:0;right:0;bottom:0;height:38%;background:linear-gradient(145deg,#8fa2aa,#d3dde0);clip-path:polygon(0 18%,100% 0,100% 100%,0 100%)}.vl-room__ceiling{position:absolute;inset:0 0 auto;height:64px;background:#f1f6f7;border-bottom:4px solid #c8d7db}.vl-room__ceiling span{position:absolute;top:19px;width:100px;height:12px;border-radius:9px;background:#fff;box-shadow:0 0 18px #fff}.vl-room__ceiling span:nth-child(1){left:12%}.vl-room__ceiling span:nth-child(2){left:43%}.vl-room__ceiling span:nth-child(3){right:10%}.vl-room__window{position:absolute;left:34px;top:92px;width:180px;height:125px;background:linear-gradient(145deg,#73b6ce,#d9f3f7);border:12px solid #f7fbfc;box-shadow:0 5px 20px #14344928}.vl-room__window:before,.vl-room__window:after{content:'';position:absolute;background:#fff}.vl-room__window:before{width:6px;height:100%;left:50%}.vl-room__window:after{height:6px;width:100%;top:50%}.vl-room__poster{position:absolute;left:235px;top:90px;width:125px;height:126px;background:#fff;border-radius:8px;padding:18px;color:#1a6e69;display:flex;flex-direction:column;gap:8px;box-shadow:0 8px 20px #19304725}.vl-room__poster small{color:#657b8e}.vl-room__cupboard{position:absolute;right:25px;top:86px;width:160px;height:175px;background:#edf3f4;border:8px solid #fff;box-shadow:0 8px 20px #19304728;display:grid;grid-template-columns:1fr 1fr}.vl-room__cupboard span{position:absolute;left:0;right:0;top:-25px;color:#d7e5ea;font-size:11px;text-align:center;letter-spacing:.14em}.vl-room__cupboard div{border:1px solid #9eb4bd}.vl-room__bench{position:absolute;background:#fff;border-top:14px solid #17394b;box-shadow:0 16px 24px #172b3640}.vl-room__bench--back{left:25px;right:25px;top:260px;height:74px}.vl-room__bench--back i{position:absolute;top:-39px;width:24px;height:28px;border:3px solid #1ea69f;border-radius:4px}.vl-room__bench--back i:nth-child(1){left:120px}.vl-room__bench--back i:nth-child(2){left:48%}.vl-room__bench--back i:nth-child(3){right:150px}.vl-room__bench--front{left:120px;right:80px;bottom:15px;height:104px;transform:skewY(-1deg)}.vl-room__sink{position:absolute;left:90px;top:8px;width:115px;height:26px;border:4px solid #7a98a5;border-radius:50%;background:#b9d0d8}.vl-room__tap{position:absolute;left:130px;top:-22px;width:28px;height:34px;border:6px solid #4a6877;border-bottom:0;border-radius:20px 20px 0 0}.vl-room__stool{position:absolute;bottom:-70px;width:70px;height:70px;border-radius:50%;background:#ff9b25;border:8px solid #193b4c}.vl-room__stool--one{left:45%}.vl-room__stool--two{right:12%}.vl-room__glow{position:absolute;inset:0;background:radial-gradient(circle at 48% 22%,#fff7,transparent 35%);pointer-events:none}.vl-room__label{position:absolute;bottom:28px;left:30px;padding:12px 16px;border-radius:12px;background:#071a2de8;color:#fff;display:flex;flex-direction:column}.vl-room__label span{color:#ff9b25;font-size:11px;text-transform:uppercase;letter-spacing:.12em;font-weight:900}.vl-room__label strong{font-size:13px;margin-top:3px}
        .vl-practicals{padding:84px clamp(24px,6vw,92px);max-width:1500px;margin:auto}.vl-section-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;margin-bottom:34px}.vl-section-heading h2{font-size:clamp(30px,4vw,48px);letter-spacing:-.035em;margin:0}.vl-filters{display:flex;gap:7px;padding:6px;background:#e4edf2;border-radius:14px}.vl-filters button{border:0;background:transparent;padding:9px 14px;border-radius:9px;font-weight:700;color:#506579;cursor:pointer}.vl-filters button.active{background:#fff;color:#102b43;box-shadow:0 4px 12px #17344918}.vl-card-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}.vl-practical-card{background:#fff;border:1px solid #d7e2e9;border-radius:20px;overflow:hidden;box-shadow:0 12px 30px #1231470e}.vl-practical-card__visual{height:150px;background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 22%,#edf5f7),#f7fafb);position:relative;display:grid;place-items:center}.vl-subject-pill{position:absolute;top:13px;left:13px;background:#fff;padding:6px 10px;border-radius:30px;font-size:11px;text-transform:uppercase;letter-spacing:.08em;font-weight:900;color:var(--accent)}.vl-mini-flask{width:65px;height:72px;border:5px solid var(--accent);border-top:0;border-radius:8px 8px 30px 30px;position:relative}.vl-mini-flask:before{content:'';position:absolute;width:25px;height:33px;border:5px solid var(--accent);border-bottom:0;left:15px;top:-30px}.vl-mini-flask span{position:absolute;left:6px;right:6px;bottom:7px;height:31px;background:var(--accent);opacity:.65;border-radius:4px 4px 22px 22px}.vl-practical-card__body{padding:21px}.vl-card-meta{display:flex;gap:10px;color:#718397;font-size:12px}.vl-card-meta span+span:before{content:'•';margin-right:10px}.vl-practical-card h3{font-size:19px;margin:11px 0 8px}.vl-practical-card p{font-size:14px;line-height:1.55;color:#5b6d7e;min-height:66px}.vl-practical-card button{border:0;background:transparent;color:var(--accent);font-weight:900;padding:7px 0;display:flex;gap:6px;align-items:center;cursor:pointer}.vl-practical-card button:disabled{color:#90a0ae;cursor:default}.vl-practical-card.is-planned{opacity:.76}
        .vl-labbar{height:68px;padding:0 20px}.vl-labbar__title{display:flex;align-items:center;gap:10px}.vl-labbar__title span{display:flex;flex-direction:column}.vl-labbar__title small{font-size:11px;color:#8eb1c3}.vl-progress{background:#fff;border-bottom:1px solid #d6e2e8;padding:14px clamp(18px,4vw,54px)}.vl-progress__meta{display:flex;justify-content:space-between;font-size:12px;color:#688094;margin-bottom:9px}.vl-progress__meta strong{color:#173047}.vl-progress__track{height:5px;border-radius:8px;background:#e7eef2;overflow:hidden}.vl-progress__track span{display:block;height:100%;background:linear-gradient(90deg,#18bbae,#ff9b25);transition:width .35s}.vl-progress__steps{display:flex;justify-content:space-between;margin-top:10px}.vl-progress__steps span{width:24px;height:24px;border-radius:50%;background:#e7eef2;color:#748797;display:grid;place-items:center;font-size:11px;font-weight:900}.vl-progress__steps span.active{background:#18bbae;color:#fff}
        .vl-workspace{max-width:1380px;margin:auto;padding:clamp(22px,4vw,48px)}.vl-task-card{background:#fff;border:1px solid #d4e1e8;border-radius:22px;padding:clamp(24px,4vw,46px);box-shadow:0 18px 42px #0c2a3b0d}.vl-task-card h2{font-size:clamp(29px,4vw,44px);line-height:1.08;margin:0 0 14px;letter-spacing:-.035em}.vl-task-card>p:not(.vl-eyebrow){color:#5e7182;font-size:16px;line-height:1.65;max-width:850px}.vl-safety-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:28px 0}.vl-safety-grid button{background:#f7fafb;border:2px solid #d9e4e9;border-radius:16px;text-align:left;padding:20px;cursor:pointer;min-height:170px;color:#142b40}.vl-safety-grid button.selected{border-color:#18bbae;background:#edfbf9}.vl-safety-grid button span{width:42px;height:42px;border-radius:12px;background:#e4eef2;color:#178f88;display:grid;place-items:center;margin-bottom:18px}.vl-safety-grid button strong,.vl-safety-grid button small{display:block}.vl-safety-grid button small{color:#637789;line-height:1.5;margin-top:7px}.vl-action-list{display:grid;gap:11px;margin:28px 0}.vl-action-list button{display:flex;gap:15px;align-items:center;text-align:left;border:1px solid #d5e2e8;background:#f8fbfc;border-radius:14px;padding:16px;cursor:pointer;color:#153048}.vl-action-list button>span{width:34px;height:34px;border-radius:50%;background:#e5edf2;display:grid;place-items:center;font-weight:900;flex:0 0 auto}.vl-action-list button.done{background:#ecfbf8;border-color:#69d1c7}.vl-action-list button.done>span{background:#18bbae;color:#fff}.vl-action-list button.locked{opacity:.45;cursor:not-allowed}.vl-action-list strong,.vl-action-list small{display:block}.vl-action-list small{color:#64798b;margin-top:4px}
        .vl-titration-layout{display:grid;grid-template-columns:minmax(0,1fr) 480px;gap:24px;align-items:stretch}.vl-control-panel{min-height:650px}.vl-live-status{display:flex;align-items:center;gap:15px;background:#eef4f7;border-radius:15px;padding:16px;margin:22px 0}.vl-live-status small,.vl-live-status strong{display:block}.vl-live-status small{color:#6d8192;font-size:11px;text-transform:uppercase;letter-spacing:.09em}.vl-colour-swatch{width:42px;height:42px;border-radius:50%;background:#f79ac4;box-shadow:inset 0 0 0 6px #fff8}.vl-colour-swatch.endpoint{background:#f7f7f4;border:1px solid #cbd8df}.vl-colour-swatch.overshot{background:#df2489}.vl-dose-controls{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:20px 0}.vl-dose-controls button{border:1px solid #c9d8df;background:#fff;border-radius:12px;padding:14px 10px;font-weight:800;color:#153048;cursor:pointer}.vl-dose-controls button:last-child{border-color:#f5a33d;background:#fff6e7}.vl-dose-controls button:disabled{opacity:.4}.vl-hint,.vl-error-box{display:flex;gap:11px;align-items:flex-start;padding:14px;border-radius:12px;margin:18px 0;font-size:13px;line-height:1.5}.vl-hint{background:#e8f7fa;color:#28566c}.vl-error-box{background:#fff0f0;color:#a62828;border:1px solid #f4b5b5}.vl-task-actions{display:flex;justify-content:space-between;gap:12px;margin-top:24px}
        .vl-apparatus{min-height:650px;border-radius:22px;background:linear-gradient(#dceaf0 0 63%,#aebfc7 63% 66%,#eef3f4 66%);position:relative;overflow:hidden;border:1px solid #c8d8df;box-shadow:inset 0 20px 50px #fff8}.vl-stand__rod{position:absolute;left:82px;top:70px;width:8px;height:470px;background:#425664;border-radius:5px}.vl-stand__base{position:absolute;left:28px;top:530px;width:280px;height:17px;background:#2d404d;border-radius:50%}.vl-stand__clamp{position:absolute;left:83px;top:118px;width:137px;height:8px;background:#465c68}.vl-burette{position:absolute;left:206px;top:42px;width:76px;height:440px}.vl-burette__tube{position:absolute;left:27px;top:0;width:25px;height:374px;border:3px solid #46606e;border-radius:7px;background:#f8fcfd;overflow:hidden}.vl-burette__liquid{position:absolute;left:1px;right:1px;bottom:0;background:#b9e8ef}.vl-burette__meniscus{position:absolute;left:0;right:0;height:5px;border-radius:50%;border-bottom:2px solid #168fa1}.vl-burette__scale{position:absolute;left:-8px;top:7px;width:30px;height:365px}.vl-burette__scale span{position:absolute;right:0;font-size:8px;color:#375161}.vl-burette__scale span:after{content:'';position:absolute;left:12px;top:5px;width:10px;border-top:1px solid #46606e}.vl-burette__tap{position:absolute;left:9px;top:370px;width:58px;height:8px;background:#1c3d4f;border-radius:8px}.vl-burette__tap:after{content:'';position:absolute;left:26px;top:5px;width:7px;height:31px;background:#42606e}.vl-burette__drop{position:absolute;left:31px;top:409px;width:8px;height:12px;border-radius:50% 50% 55% 55%;background:#36b7c8;opacity:0}.vl-burette__drop.is-dropping{animation:vlDrop .32s ease-in}@keyframes vlDrop{0%{opacity:1;transform:translateY(0) scale(.7)}100%{opacity:0;transform:translateY(62px) scale(1)}}.vl-tile{position:absolute;left:150px;bottom:53px;width:212px;height:46px;background:#fff;transform:skewX(-20deg);box-shadow:0 5px 14px #24394645}.vl-flask{position:absolute;left:194px;bottom:73px;width:124px;height:171px}.vl-flask__neck{position:absolute;left:44px;top:0;width:37px;height:62px;border:4px solid #3d5967;border-bottom:0;background:#eef8fa99}.vl-flask__body{position:absolute;left:2px;top:52px;width:120px;height:118px;border:4px solid #3d5967;clip-path:polygon(36% 0,64% 0,100% 92%,94% 100%,6% 100%,0 92%);background:#edf8fa99;overflow:hidden}.vl-flask__liquid{position:absolute;left:0;right:0;bottom:0;height:48%;opacity:.82;transition:background .25s}.vl-flask__swirl{position:absolute;left:20%;right:20%;bottom:20%;height:12px;border-radius:50%;border:2px solid #c6458899;opacity:0}.vl-flask__swirl.active{animation:vlSwirl .4s linear;opacity:1}@keyframes vlSwirl{to{transform:rotate(360deg) scaleX(1.2)}}.vl-apparatus__caption{position:absolute;right:18px;top:18px;background:#071a2de8;color:#fff;border-radius:12px;padding:11px 14px;display:flex;flex-direction:column}.vl-apparatus__caption span{font-size:10px;color:#9fc3d2;text-transform:uppercase;letter-spacing:.1em}.vl-apparatus__caption strong{font-size:17px}
        .vl-run-strip{margin-top:18px}.vl-table-wrap{overflow:auto;margin:24px 0;border:1px solid #d4e0e6;border-radius:14px}.vl-readings{border-collapse:collapse;width:100%;min-width:620px;background:#fff}.vl-readings th,.vl-readings td{padding:13px 15px;text-align:center;border-bottom:1px solid #e3ebef;font-size:13px}.vl-readings thead th{background:#102b42;color:#fff;font-size:11px;text-transform:uppercase;letter-spacing:.06em}.vl-readings tbody th{text-align:left}.vl-concordance{display:flex;gap:12px;align-items:flex-start;padding:16px;border-radius:13px;margin:20px 0}.vl-concordance.success{background:#e9f9f3;color:#126b52}.vl-concordance.warning{background:#fff6e6;color:#8b5611}.vl-concordance strong,.vl-concordance span{display:block}.vl-concordance span{margin-top:3px;font-size:13px}.vl-calculation{background:#f3f7fa;border-radius:16px;padding:22px;margin:20px 0}.vl-calculation h3{margin-top:0}.vl-equation-line{display:grid;grid-template-columns:200px 1fr;gap:15px;align-items:center;padding:13px 0;border-top:1px solid #dce6eb}.vl-equation-line>span{color:#627688}.vl-fraction{display:inline-flex;flex-direction:column;vertical-align:middle;text-align:center;line-height:1.08;margin:0 4px}.vl-fraction>span:first-child{border-bottom:1.5px solid currentColor;padding:0 4px 2px}.vl-fraction>span:last-child{padding-top:2px}
        .vl-completion{max-width:920px;margin:60px auto;background:#fff;border:1px solid #d4e2e8;border-radius:26px;padding:clamp(28px,5vw,60px);text-align:center;box-shadow:0 24px 60px #102f4118}.vl-completion__icon{width:82px;height:82px;margin:auto auto 20px;border-radius:25px;background:#e5faf6;color:#149b8f;display:grid;place-items:center}.vl-completion h1{font-size:clamp(36px,5vw,58px);letter-spacing:-.04em;margin:0 0 12px}.vl-completion>p:not(.vl-eyebrow){color:#607385}.vl-score-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:13px;margin:30px 0}.vl-score-grid div{background:#f2f7f9;border-radius:14px;padding:20px}.vl-score-grid small,.vl-score-grid strong{display:block}.vl-score-grid small{color:#697d8e}.vl-score-grid strong{font-size:20px;margin-top:6px}.vl-feedback{display:flex;gap:13px;text-align:left;background:#eaf9f6;color:#176c59;border-radius:14px;padding:17px}.vl-feedback strong,.vl-feedback span{display:block}.vl-feedback span{font-size:13px;margin-top:4px}.vl-completion__actions{display:flex;justify-content:center;gap:12px;margin-top:28px}
        .vl-modal-backdrop{position:fixed;inset:0;background:#03111dcc;z-index:100;display:grid;place-items:center;padding:20px}.vl-help-modal{width:min(520px,100%);background:#fff;border-radius:22px;padding:30px;position:relative}.vl-help-modal h2{font-size:30px;margin:0 0 12px}.vl-help-modal p,.vl-help-modal li{color:#5c7082;line-height:1.55}.vl-help-modal li{margin:8px 0}.vl-modal-close{position:absolute;right:14px;top:14px;width:36px;height:36px;border:0;border-radius:10px;background:#edf2f5;cursor:pointer}
        @media(max-width:1050px){.vl-dashboard{grid-template-columns:1fr}.vl-side{display:none}.vl-dashboard-grid{grid-template-columns:1fr}.vl-dashboard__rail{grid-template-columns:repeat(2,1fr)}.vl-dashboard-room{display:none}.vl-hero{grid-template-columns:1fr;padding-top:54px}.vl-hero__copy{max-width:800px}.vl-card-grid{grid-template-columns:repeat(2,1fr)}.vl-titration-layout{grid-template-columns:1fr}.vl-apparatus{min-height:590px}.vl-control-panel{min-height:auto}}
        @media(max-width:680px){.vl-dashboard__main{padding:24px 16px 65px}.vl-dashboard__header{align-items:flex-start}.vl-dashboard__header h1{font-size:38px}.vl-dashboard__tools{display:none}.vl-stat-row{grid-template-columns:repeat(2,1fr);gap:18px}.vl-stat-row>div{padding:0;border:0}.vl-progress-card{padding:18px}.vl-dashboard__rail{grid-template-columns:1fr}.vl-practical-library .vl-card-grid{grid-template-columns:1fr}.vl-section-heading{align-items:flex-start;flex-direction:column}.vl-topbar{height:68px}.vl-ghost-button{display:none}.vl-hero{padding:44px 18px;min-height:auto}.vl-hero h1{font-size:43px}.vl-room{height:330px}.vl-room__window{width:120px;height:90px}.vl-room__poster{left:175px;width:105px}.vl-room__cupboard{display:none}.vl-room__bench--front{left:45px;right:30px}.vl-practicals{padding:58px 18px}.vl-section-heading{align-items:flex-start;flex-direction:column}.vl-filters{max-width:100%;overflow:auto}.vl-card-grid{grid-template-columns:1fr}.vl-practical-card p{min-height:0}.vl-progress__steps{display:none}.vl-workspace{padding:16px}.vl-task-card{padding:22px;border-radius:17px}.vl-safety-grid{grid-template-columns:1fr}.vl-safety-grid button{min-height:120px}.vl-dose-controls{grid-template-columns:1fr}.vl-task-actions,.vl-completion__actions{flex-direction:column}.vl-apparatus{min-height:530px}.vl-apparatus{transform-origin:top center}.vl-stand__rod{left:45px}.vl-stand__base{left:15px;width:240px}.vl-stand__clamp{left:45px;width:115px}.vl-burette{left:144px}.vl-flask{left:132px}.vl-tile{left:86px}.vl-score-grid{grid-template-columns:1fr}.vl-equation-line{grid-template-columns:1fr;gap:5px}.vl-brand strong{font-size:14px}}
        .vl-card-start--3d{background:linear-gradient(135deg,#0f9d92,#12547c)!important;color:#fff!important;margin-bottom:8px}.vl-card-start--flat{background:transparent!important;color:#5b6d7e!important;border:1px solid #cad7e2!important;font-weight:700}
        .vl-lab3d{position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;background:#071a2d}.vl-lab3d .vl-labbar{flex:0 0 auto}.vl-lab3d__stage{flex:1 1 auto;min-height:0;position:relative}.vl-lab3d__stage>*{width:100%;height:100%}.vl-labbar__hint{color:#8eb1c3;font-size:12px}.vl-lab3d__loading{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#9fc9dc;background:#0b1a28}.vl-lab3d__loading strong{color:#e8f6ff;font-size:17px}.vl-lab3d__loading span{font-size:13px}.vl-lab3d__loading svg{color:#25c6da;margin-bottom:6px}
        @media(max-width:680px){.vl-labbar__hint{display:none}}
        @media(prefers-reduced-motion:reduce){.vl-shell *{scroll-behavior:auto!important;animation-duration:.01ms!important;transition-duration:.01ms!important}}
      `}</style>
      {mode === 'lobby' && (
        <Lobby
          onStart={() => setMode('experiment')}
          onStart3D={() => setMode('lab3d')}
        />
      )}
      {mode === 'experiment' && <Experiment onExit={() => setMode('lobby')} />}
      {mode === 'lab3d' && <ScienceCentreWorkspace onExit={() => setMode('lobby')} />}
    </>
  );
}
