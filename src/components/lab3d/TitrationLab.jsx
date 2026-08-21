/**
 * Interactive 3D acid-base titration.
 *
 * Rendering: React Three Fiber over the three.js already in the project.
 * Chemistry: see titrationModel.js — pH is computed from real moles, so the
 * indicator changes colour because of what the student did, not on a timer.
 */
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

import LabRoom, { BENCH } from './LabRoom';
import {
  Burette, ConicalFlask, Beaker, Pipette, ReagentBottle, RetortStand, WhiteTile,
} from './Apparatus';
import {
  EXPERIMENT, PROCEDURE, equivalenceMl, computePH, indicatorColour,
  gradeTitre, concordantSet, meanTitre, calculatedConcentration,
} from './titrationModel';

const BENCH_Y = BENCH.h + 0.02;   // top surface of the worktop

/* ------------------------------------------------------------------ */
/* Interaction helpers                                                 */
/* ------------------------------------------------------------------ */

/** Wraps children so they highlight and show a tooltip when hoverable. */
function Interactive({ enabled = true, label, onClick, children, ...props }) {
  const [hovered, setHovered] = useState(false);
  const group = useRef();

  useFrame(() => {
    if (!group.current) return;
    const target = hovered && enabled ? 1.03 : 1;
    group.current.scale.lerp(new THREE.Vector3(target, target, target), 0.18);
  });

  useEffect(() => {
    document.body.style.cursor = hovered && enabled ? 'pointer' : 'auto';
    return () => { document.body.style.cursor = 'auto'; };
  }, [hovered, enabled]);

  return (
    <group
      ref={group}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
      onClick={(e) => { e.stopPropagation(); if (enabled && onClick) onClick(); }}
      {...props}
    >
      {children}
      {hovered && enabled && label && (
        <Html center distanceFactor={1.6} position={[0, 0.22, 0]} zIndexRange={[10, 0]}>
          <div style={{
            background: 'rgba(8,26,45,0.94)', color: '#e8f6ff',
            padding: '5px 10px', borderRadius: 7, fontSize: 12,
            whiteSpace: 'nowrap', fontWeight: 600, pointerEvents: 'none',
            border: '1px solid rgba(37,198,218,0.5)',
          }}>{label}</div>
        </Html>
      )}
    </group>
  );
}

/** A drip of titrant falling from the burette jet into the flask. */
function Droplets({ active }) {
  const ref = useRef();
  const COUNT = 5;
  const drops = useMemo(
    () => Array.from({ length: COUNT }, (_, i) => ({ offset: i / COUNT })),
    []
  );

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.visible = active;
    if (!active) return;
    const t = clock.getElapsedTime();
    ref.current.children.forEach((drop, i) => {
      const phase = (t * 2.4 + drops[i].offset) % 1;
      drop.position.y = -phase * 0.20;
      drop.scale.setScalar(1 - phase * 0.25);
    });
  });

  return (
    <group ref={ref} visible={false}>
      {drops.map((d, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.0022, 8, 8]} />
          <meshPhysicalMaterial
            color="#eaf6ff" transmission={0.9} roughness={0.05}
            ior={1.333} thickness={0.002} transparent
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Small label used on bottles and shelves.
 *
 * Deliberately a DOM overlay rather than drei's <Text>: troika (which backs
 * <Text>) resolves its default font over a CDN at runtime, which fails on a
 * locked-down school network and would suspend the whole scene. Html uses the
 * page's own fonts and needs no network at all.
 */
function Tag({ children, position }) {
  return (
    <Html
      center
      position={position}
      distanceFactor={1.6}
      zIndexRange={[8, 0]}
      style={{ pointerEvents: 'none' }}
    >
      <div style={{
        background: 'rgba(255,255,255,0.92)',
        color: '#1e293b',
        border: '1px solid rgba(30,41,59,0.25)',
        borderRadius: 4,
        padding: '3px 6px',
        fontSize: 11,
        lineHeight: 1.15,
        fontWeight: 700,
        textAlign: 'center',
        whiteSpace: 'pre-line',
        letterSpacing: '0.01em',
      }}>
        {children}
      </div>
    </Html>
  );
}

/**
 * Image-based lighting generated locally from three's RoomEnvironment.
 *
 * Replaces <Environment preset="city" />, which downloads a ~2 MB HDR from
 * raw.githack.com. That request fails offline or behind a school firewall, and
 * because the loader suspends inside the scene's only Suspense boundary the
 * failure blanked the entire laboratory. RoomEnvironment ships with three, so
 * the glassware still gets believable reflections with no network dependency.
 */
function StudioEnvironment() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    pmrem.compileEquirectangularShader();
    const room = new RoomEnvironment();
    const target = pmrem.fromScene(room, 0.04);
    scene.environment = target.texture;
    return () => {
      scene.environment = null;
      target.dispose();
      pmrem.dispose();
      room.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) o.material.dispose();
      });
    };
  }, [gl, scene]);

  return null;
}

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

function Scene({ state, actions }) {
  const {
    buretteLevel, flaskFill, flaskColour, swirling,
    running, cupboardOpen, collected, tapAngle, goggles,
  } = state;

  return (
    <>
      <LabRoom cupboardOpen={cupboardOpen} />

      {/* ---- Apparatus stored in the cupboard ---- */}
      {cupboardOpen && (
        <group position={[1.55, 1.62, -2.32]}>
          {[
            { id: 'burette', x: -0.36, node: <Burette level={0} scale={0.42} position={[0, -0.30, 0]} /> },
            { id: 'pipette', x: -0.10, node: <Pipette scale={0.6} position={[0, -0.28, 0]} /> },
            { id: 'flask', x: 0.14, node: <ConicalFlask scale={0.85} position={[0, -0.30, 0]} /> },
            { id: 'tile', x: 0.38, node: <WhiteTile scale={0.8} position={[0, -0.26, 0]} /> },
          ].map((item) => (
            <Interactive
              key={item.id}
              enabled={!collected.includes(item.id)}
              label={collected.includes(item.id) ? 'Already on the bench' : `Take the ${item.id}`}
              onClick={() => actions.collect(item.id)}
              position={[item.x, 0, 0.02]}
            >
              <group visible={!collected.includes(item.id)}>{item.node}</group>
            </Interactive>
          ))}
        </group>
      )}

      {/* ---- Bench setup ---- */}
      <group position={[0, BENCH_Y, 0]}>
        {/* Retort stand and burette */}
        {collected.includes('burette') && (
          <group position={[0.02, 0, -0.16]}>
            <RetortStand height={0.78} clampY={0.50} />
            <Interactive
              label={running ? 'Release to close the tap' : 'Hold to run acid in'}
              enabled={state.canTitrate}
              position={[0, 0.20, 0]}
            >
              <group
                onPointerDown={(e) => { e.stopPropagation(); actions.setRunning(true); }}
                onPointerUp={(e) => { e.stopPropagation(); actions.setRunning(false); }}
              >
                <Burette level={buretteLevel} tapAngle={tapAngle} />
              </group>
            </Interactive>
            <group position={[0, 0.19, 0]}>
              <Droplets active={running} />
            </group>
          </group>
        )}

        {/* White tile and flask directly under the burette jet */}
        {collected.includes('tile') && <WhiteTile position={[0.02, 0.003, -0.16]} />}
        {collected.includes('flask') && (
          <Interactive
            label={state.canSwirl ? 'Swirl the flask' : 'Conical flask'}
            enabled={state.canSwirl}
            onClick={actions.swirl}
            position={[0.02, 0.006, -0.16]}
          >
            <ConicalFlask fill={flaskFill} color={flaskColour} swirl={swirling ? 1 : 0} />
          </Interactive>
        )}

        {/* Pipette resting on the bench */}
        {collected.includes('pipette') && (
          <Interactive
            label="Pipette 25.0 cm3 of alkali into the flask"
            enabled={state.canPipette}
            onClick={actions.pipetteIntoFlask}
            position={[-0.36, 0.02, 0.16]}
            rotation={[0, 0, Math.PI / 2.05]}
          >
            <Pipette fill={state.pipetteFilled ? 0.55 : 0} color="#dff0ff" />
          </Interactive>
        )}

        {/* Reagent bottles at the back of the bench */}
        <Interactive
          label="Hydrochloric acid — fill the burette"
          enabled={state.canFillBurette}
          onClick={actions.fillBurette}
          position={[-0.72, 0, -0.26]}
        >
          <ReagentBottle color="#b8d8c0" liquid="#e8f4ef"
            label={<Tag position={[0, 0.048, 0.030]}>HCl{'\n'}0.10 M</Tag>} />
        </Interactive>

        <Interactive
          label="Sodium hydroxide — draw up with the pipette"
          enabled={state.canDrawAlkali}
          onClick={actions.drawAlkali}
          position={[-0.52, 0, -0.26]}
        >
          <ReagentBottle color="#c9d3e8" liquid="#eef3fb"
            label={<Tag position={[0, 0.048, 0.030]}>NaOH{'\n'}0.10 M</Tag>} />
        </Interactive>

        <Interactive
          label="Phenolphthalein indicator — add 2–3 drops"
          enabled={state.canAddIndicator}
          onClick={actions.addIndicator}
          position={[-0.32, 0, -0.26]}
        >
          <ReagentBottle color="#c88a3a" liquid="#f6f1e4"
            label={<Tag position={[0, 0.048, 0.030]}>Phenol-{'\n'}phthalein</Tag>} />
        </Interactive>

        {/* Waste beaker */}
        <Beaker position={[0.62, 0.002, 0.10]} fill={state.wasteFill} color="#e3ecf3" />

        {/* Safety goggles */}
        {!goggles && (
          <Interactive label="Put on safety goggles" onClick={actions.wearGoggles} position={[0.48, 0.03, 0.22]}>
            <group>
              <mesh castShadow>
                <torusGeometry args={[0.026, 0.008, 10, 24]} />
                <meshPhysicalMaterial color="#dff3ff" transmission={0.7} roughness={0.15} transparent ior={1.5} />
              </mesh>
              <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.027, 0.004, 8, 24]} />
                <meshStandardMaterial color="#1f2937" roughness={0.6} />
              </mesh>
            </group>
          </Interactive>
        )}
      </group>

      {/* ---- Cupboard toggle ---- */}
      <Interactive
        label={cupboardOpen ? 'Close the cupboard' : 'Open the apparatus cupboard'}
        onClick={actions.toggleCupboard}
        position={[1.55, 1.20, -2.32]}
      >
        <mesh visible={false}><boxGeometry args={[1.1, 0.2, 0.3]} /></mesh>
        <Html center distanceFactor={6}>
          <div style={{
            background: cupboardOpen ? 'rgba(37,198,218,0.95)' : 'rgba(8,26,45,0.9)',
            color: '#fff', padding: '6px 14px', borderRadius: 20, fontSize: 13,
            fontWeight: 700, whiteSpace: 'nowrap', border: '1px solid rgba(255,255,255,0.25)',
          }}>
            {cupboardOpen ? 'Close cupboard' : 'Open cupboard'}
          </div>
        </Html>
      </Interactive>

      {/* Grounding shadow under the bench area */}
      <ContactShadows position={[0, 0.002, 0]} opacity={0.35} scale={7} blur={2.4} far={2} />
      <StudioEnvironment />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Container: state machine + HUD                                      */
/* ------------------------------------------------------------------ */

export default function TitrationLab({ onProgress }) {
  const [goggles, setGoggles] = useState(false);
  const [cupboardOpen, setCupboardOpen] = useState(false);
  const [collected, setCollected] = useState([]);
  const [rinsed, setRinsed] = useState(false);
  const [buretteLevel, setBuretteLevel] = useState(0);
  const [, setStartReading] = useState(null);
  const [pipetteFilled, setPipetteFilled] = useState(false);
  const [flaskVolume, setFlaskVolume] = useState(0);   // cm3 of alkali in the flask
  const [hasIndicator, setHasIndicator] = useState(false);
  const [added, setAdded] = useState(0);               // cm3 of titrant run in
  const [running, setRunning] = useState(false);
  const [swirling, setSwirling] = useState(false);
  const [titres, setTitres] = useState([]);
  const [wasteFill, setWasteFill] = useState(0.05);
  const [message, setMessage] = useState(null);

  const doneRef = useRef(new Set());

  /* ---- derived chemistry ---- */
  const pH = useMemo(() => (flaskVolume > 0 ? computePH(added) : 7), [added, flaskVolume]);
  const { color: flaskColour, opacity: flaskOpacity, label: colourLabel } =
    useMemo(() => indicatorColour(pH, hasIndicator && flaskVolume > 0), [pH, hasIndicator, flaskVolume]);

  const buretteReading = useMemo(
    () => EXPERIMENT.buretteCapacityMl * (1 - buretteLevel),
    [buretteLevel]
  );

  /* ---- step gating ---- */
  const markDone = useCallback((id) => {
    if (!doneRef.current.has(id)) {
      doneRef.current.add(id);
      if (onProgress) onProgress(id, PROCEDURE.findIndex((s) => s.id === id) + 1, PROCEDURE.length);
    }
  }, [onProgress]);

  const hasAllApparatus = ['burette', 'pipette', 'flask', 'tile']
    .every((i) => collected.includes(i));

  const canDrawAlkali = hasAllApparatus && buretteLevel > 0 && !pipetteFilled && flaskVolume === 0;
  const canPipette = pipetteFilled && flaskVolume === 0;
  const canAddIndicator = flaskVolume > 0 && !hasIndicator;
  const canTitrate = hasIndicator && flaskVolume > 0 && buretteLevel > 0;
  const canSwirl = flaskVolume > 0;
  const canFillBurette = collected.includes('burette') && buretteLevel < 0.99;
  const canDrawAlkaliGate = canDrawAlkali;

  /* ---- running the tap ---- */
  useEffect(() => {
    if (!running || !canTitrate) return undefined;
    const id = setInterval(() => {
      setAdded((prev) => {
        const next = prev + 0.06;
        setBuretteLevel((lv) => Math.max(0, lv - 0.06 / EXPERIMENT.buretteCapacityMl));
        return next;
      });
    }, 40);
    return () => clearInterval(id);
  }, [running, canTitrate]);

  useEffect(() => {
    if (buretteLevel <= 0 && running) setRunning(false);
  }, [buretteLevel, running]);

  /* ---- actions ---- */
  const actions = {
    wearGoggles: () => { setGoggles(true); markDone('safety'); setMessage('Goggles on. You can open the cupboard now.'); },
    toggleCupboard: () => {
      if (!goggles) { setMessage('Put your safety goggles on first.'); return; }
      setCupboardOpen((o) => !o);
    },
    collect: (id) => {
      setCollected((c) => (c.includes(id) ? c : [...c, id]));
      const next = [...collected, id];
      if (['burette', 'pipette', 'flask', 'tile'].every((i) => next.includes(i))) {
        markDone('collect');
        setCupboardOpen(false);
        setMessage('All apparatus on the bench. Rinse and fill the burette with the acid.');
      }
    },
    fillBurette: () => {
      if (!rinsed) {
        setRinsed(true);
        markDone('rinse');
        setWasteFill((w) => Math.min(0.6, w + 0.12));
        setMessage('Burette rinsed with acid and drained to waste. Now fill it.');
        return;
      }
      setBuretteLevel(1);
      setAdded(0);
      setStartReading(0);
      markDone('fill');
      setMessage('Burette filled. Start reading 0.00 cm3. Now pipette the alkali.');
    },
    drawAlkali: () => {
      setPipetteFilled(true);
      setMessage('25.0 cm3 drawn up. Click the flask to run it in.');
    },
    pipetteIntoFlask: () => {
      if (!pipetteFilled) { setMessage('Draw the alkali up with the pipette first.'); return; }
      setPipetteFilled(false);
      setFlaskVolume(EXPERIMENT.analyteVolumeMl);
      markDone('pipette');
      setMessage('25.0 cm3 of alkali in the flask. Add the indicator.');
    },
    addIndicator: () => {
      setHasIndicator(true);
      markDone('indicator');
      setMessage('Indicator added. Run the acid in, swirling as you go.');
    },
    swirl: () => {
      setSwirling(true);
      setTimeout(() => setSwirling(false), 1600);
    },
    setRunning: (v) => {
      if (v && !canTitrate) {
        setMessage(hasIndicator ? 'Fill the burette first.' : 'Add the indicator before you start.');
        return;
      }
      setRunning(v);
    },
    recordTitre: () => {
      if (flaskVolume === 0 || added <= 0) return;
      const titre = added;
      const grade = gradeTitre(titre);
      setTitres((t) => [...t, titre]);
      if (titres.length === 0) markDone('rough');
      const all = [...titres, titre];
      if (concordantSet(all).length >= 2) markDone('accurate');
      setMessage(`Titre recorded: ${titre.toFixed(2)} cm3 — ${grade.note}`);
      // Reset the flask for the next run.
      setFlaskVolume(0);
      setHasIndicator(false);
      setAdded(0);
      setWasteFill((w) => Math.min(0.75, w + 0.08));
    },
    reset: () => {
      setGoggles(false); setCupboardOpen(false); setCollected([]); setRinsed(false);
      setBuretteLevel(0); setStartReading(null); setPipetteFilled(false);
      setFlaskVolume(0); setHasIndicator(false); setAdded(0); setRunning(false);
      setTitres([]); setWasteFill(0.05); setMessage(null);
      doneRef.current = new Set();
    },
  };

  const mean = meanTitre(titres);
  const conc = calculatedConcentration(mean);
  if (mean && !doneRef.current.has('analyse')) markDone('analyse');

  const currentStep = PROCEDURE.find((s) => !doneRef.current.has(s.id)) || null;

  const state = {
    buretteLevel, flaskFill: flaskVolume > 0 ? 0.20 + (added / 60) * 0.12 : 0,
    flaskColour, flaskOpacity, swirling, running, cupboardOpen, collected,
    tapAngle: running ? 1.2 : 0, goggles, pipetteFilled, wasteFill,
    canTitrate, canSwirl, canPipette, canAddIndicator,
    canFillBurette, canDrawAlkali: canDrawAlkaliGate,
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 520, background: '#0b1a28' }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0.9, 1.72, 1.55], fov: 42 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <Suspense fallback={null}>
          <Scene state={state} actions={actions} />
        </Suspense>
        <OrbitControls
          target={[0, 1.05, -0.1]}
          minDistance={0.6}
          maxDistance={4.2}
          maxPolarAngle={Math.PI / 2.05}
          enablePan
        />
      </Canvas>

      {/* ---------- HUD ---------- */}
      <div style={hud.panelLeft}>
        <div style={hud.title}>Acid–base titration</div>
        {currentStep ? (
          <>
            <div style={hud.stepLabel}>
              Step {PROCEDURE.indexOf(currentStep) + 1} of {PROCEDURE.length}
            </div>
            <div style={hud.stepTitle}>{currentStep.title}</div>
            <div style={hud.stepDetail}>{currentStep.detail}</div>
            <div style={hud.hint}>{currentStep.hint}</div>
          </>
        ) : (
          <div style={hud.stepTitle}>Practical complete — well done.</div>
        )}
        <div style={hud.progressTrack}>
          <div style={{
            ...hud.progressFill,
            width: `${(doneRef.current.size / PROCEDURE.length) * 100}%`,
          }} />
        </div>
      </div>

      <div style={hud.panelRight}>
        <Row label="Burette reading" value={`${buretteReading.toFixed(2)} cm³`} />
        <Row label="Volume added" value={`${added.toFixed(2)} cm³`} strong />
        <Row label="In the flask" value={flaskVolume ? `${flaskVolume.toFixed(1)} cm³ NaOH` : '—'} />
        <Row label="pH" value={flaskVolume ? pH.toFixed(2) : '—'} />
        <Row label="Colour" value={hasIndicator && flaskVolume ? colourLabel : '—'} />
        <button
          style={{ ...hud.button, opacity: flaskVolume > 0 && added > 0 ? 1 : 0.4 }}
          disabled={!(flaskVolume > 0 && added > 0)}
          onClick={actions.recordTitre}
        >
          Record this titre
        </button>

        {titres.length > 0 && (
          <div style={hud.results}>
            <div style={hud.resultsHead}>Results</div>
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: '#8fb6cc' }}>
                  <th style={hud.th}>Run</th><th style={hud.th}>Titre / cm³</th><th style={hud.th}></th>
                </tr>
              </thead>
              <tbody>
                {titres.map((t, i) => {
                  const good = concordantSet(titres).includes(t);
                  return (
                    <tr key={i}>
                      <td style={hud.td}>{i === 0 ? 'Rough' : i}</td>
                      <td style={hud.td}>{t.toFixed(2)}</td>
                      <td style={{ ...hud.td, color: good ? '#4ade80' : '#94a3b8' }}>
                        {good ? 'concordant' : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {mean ? (
              <div style={hud.calc}>
                <div>Mean titre <strong>{mean.toFixed(2)} cm³</strong></div>
                <div>Calculated [NaOH] <strong>{conc.toFixed(4)} mol dm⁻³</strong></div>
                <div style={{ color: '#8fb6cc', marginTop: 4, fontSize: 11 }}>
                  True value 0.1000 — true endpoint {equivalenceMl.toFixed(2)} cm³
                </div>
              </div>
            ) : (
              <div style={{ ...hud.calc, color: '#8fb6cc' }}>
                Need two titres within 0.10 cm³ to be concordant.
              </div>
            )}
          </div>
        )}

        <button style={{ ...hud.button, background: 'transparent', border: '1px solid #35586e', marginTop: 6 }}
          onClick={actions.reset}>
          Reset experiment
        </button>
      </div>

      {message && (
        <div style={hud.toast} onClick={() => setMessage(null)}>{message}</div>
      )}
    </div>
  );
}

function Row({ label, value, strong }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
      <span style={{ color: '#8fb6cc', fontSize: 12 }}>{label}</span>
      <span style={{
        color: strong ? '#25c6da' : '#e8f6ff', fontSize: 13,
        fontWeight: strong ? 700 : 500, fontVariantNumeric: 'tabular-nums',
      }}>{value}</span>
    </div>
  );
}

const panelBase = {
  position: 'absolute', background: 'rgba(8,22,38,0.92)',
  border: '1px solid rgba(37,198,218,0.28)', borderRadius: 12,
  padding: '14px 16px', color: '#e8f6ff', backdropFilter: 'blur(8px)',
  fontFamily: 'system-ui, -apple-system, sans-serif', zIndex: 5,
};

const hud = {
  panelLeft: { ...panelBase, top: 14, left: 14, width: 268 },
  panelRight: { ...panelBase, top: 14, right: 14, width: 250, maxHeight: 'calc(100% - 28px)', overflowY: 'auto' },
  title: { fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: '#25c6da', fontWeight: 700, marginBottom: 8 },
  stepLabel: { fontSize: 11, color: '#8fb6cc', marginBottom: 3 },
  stepTitle: { fontSize: 15, fontWeight: 700, marginBottom: 6, lineHeight: 1.3 },
  stepDetail: { fontSize: 12, color: '#c3dced', lineHeight: 1.5, marginBottom: 8 },
  hint: { fontSize: 11.5, color: '#f59e0b', fontStyle: 'italic' },
  progressTrack: { marginTop: 12, height: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg,#25c6da,#4ade80)', transition: 'width .35s ease' },
  button: {
    width: '100%', marginTop: 10, padding: '9px 12px', borderRadius: 8, border: 'none',
    background: '#25c6da', color: '#04202c', fontWeight: 700, fontSize: 13, cursor: 'pointer',
  },
  results: { marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 10 },
  resultsHead: { fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: '#25c6da', fontWeight: 700, marginBottom: 6 },
  th: { textAlign: 'left', fontWeight: 600, padding: '2px 0', fontSize: 11 },
  td: { padding: '3px 0', fontVariantNumeric: 'tabular-nums' },
  calc: { marginTop: 8, fontSize: 12, lineHeight: 1.6 },
  toast: {
    position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)',
    background: 'rgba(8,22,38,0.95)', color: '#e8f6ff', padding: '10px 18px',
    borderRadius: 22, fontSize: 13, border: '1px solid rgba(37,198,218,0.4)',
    cursor: 'pointer', maxWidth: '70%', textAlign: 'center', zIndex: 6,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
};
