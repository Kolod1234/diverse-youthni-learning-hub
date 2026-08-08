import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';

const WIDTH = 1100;
const HEIGHT = 690;
const DURATION = 18;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const ease = value => {
  const x = clamp(value);
  return x * x * (3 - 2 * x);
};
const lerp = (a, b, t) => a + (b - a) * t;

const GAS_PARTICLES = Array.from({ length: 30 }, (_, index) => ({
  angle: (index * 2.399963) % (Math.PI * 2),
  radius: 48 + ((index * 47) % 165),
  speed: 0.42 + (index % 7) * 0.055,
  phase: index * 0.71,
  delay: (index % 10) * 0.16
}));

const DROPLETS = Array.from({ length: 62 }, (_, index) => ({
  delay: (index % 31) * 0.14,
  side: (index % 5) - 2,
  speed: 0.9 + (index % 6) * 0.055,
  size: 4 + (index % 3)
}));

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, r);
}

function drawLabel(ctx, text, x, y, options = {}) {
  const {
    align = 'left',
    colour = '#17233a',
    size = 21,
    weight = 650,
    background = 'rgba(255,255,255,0.92)',
    paddingX = 12,
    paddingY = 7
  } = options;
  ctx.save();
  ctx.font = `${weight} ${size}px Inter, Arial, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  const measured = ctx.measureText(text).width;
  const left = align === 'center' ? x - measured / 2 - paddingX : align === 'right' ? x - measured - paddingX : x - paddingX;
  if (background) {
    roundedRect(ctx, left, y - size / 2 - paddingY, measured + paddingX * 2, size + paddingY * 2, 10);
    ctx.fillStyle = background;
    ctx.fill();
  }
  ctx.fillStyle = colour;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawBeaker(ctx) {
  ctx.save();
  const waterGradient = ctx.createLinearGradient(0, 520, 0, 670);
  waterGradient.addColorStop(0, '#bcecf7');
  waterGradient.addColorStop(1, '#7bd3e8');
  ctx.fillStyle = waterGradient;
  ctx.fillRect(350, 535, 400, 108);
  ctx.fillStyle = '#2ea5c4';
  ctx.fillRect(350, 533, 400, 5);
  ctx.strokeStyle = '#7790a8';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(330, 492);
  ctx.lineTo(345, 652);
  ctx.quadraticCurveTo(550, 682, 755, 652);
  ctx.lineTo(770, 492);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(122,157,181,0.65)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(550, 493, 220, 22, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawFlask(ctx, liquidLevel) {
  ctx.save();
  const glass = ctx.createRadialGradient(495, 245, 25, 550, 265, 275);
  glass.addColorStop(0, 'rgba(255,255,255,0.16)');
  glass.addColorStop(0.75, 'rgba(214,239,248,0.10)');
  glass.addColorStop(1, 'rgba(138,182,204,0.22)');
  ctx.fillStyle = glass;
  ctx.beginPath();
  ctx.arc(550, 270, 258, 0, Math.PI * 2);
  ctx.fill();

  if (liquidLevel > 0.01) {
    const liquidTop = lerp(455, 215, liquidLevel);
    ctx.save();
    ctx.beginPath();
    ctx.arc(550, 270, 250, 0, Math.PI * 2);
    ctx.clip();
    const pink = ctx.createLinearGradient(0, liquidTop, 0, 520);
    pink.addColorStop(0, 'rgba(251,125,181,0.72)');
    pink.addColorStop(1, 'rgba(224,42,120,0.82)');
    ctx.fillStyle = pink;
    ctx.fillRect(292, liquidTop, 516, 320);
    ctx.fillStyle = 'rgba(255,190,219,0.72)';
    ctx.beginPath();
    ctx.ellipse(550, liquidTop, Math.sqrt(Math.max(0, 250 * 250 - Math.pow(liquidTop - 270, 2))), 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.strokeStyle = '#4d6e84';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(550, 270, 258, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.42)';
  ctx.beginPath();
  ctx.ellipse(468, 155, 48, 110, -0.7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#9c6b42';
  roundedRect(ctx, 472, 492, 156, 40, 9);
  ctx.fill();
  ctx.strokeStyle = '#684126';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.strokeStyle = '#6c8da1';
  ctx.lineWidth = 4;
  ctx.fillStyle = 'rgba(224,244,250,0.45)';
  ctx.beginPath();
  ctx.moveTo(510, 500);
  ctx.lineTo(510, 568);
  ctx.lineTo(590, 568);
  ctx.lineTo(590, 500);
  ctx.stroke();
  ctx.restore();
}

function drawTubeWater(ctx, progress) {
  if (progress <= 0) return;
  const bottom = 642;
  const top = lerp(642, 494, ease(progress));
  ctx.save();
  ctx.strokeStyle = '#33b7d3';
  ctx.lineWidth = 22;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(550, bottom);
  ctx.lineTo(550, top);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.65)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(544, bottom - 5);
  ctx.lineTo(544, top + 4);
  ctx.stroke();
  ctx.restore();
}

function drawGas(ctx, time, dissolveProgress) {
  const target = { x: 550, y: 475 };
  GAS_PARTICLES.forEach((particle, index) => {
    const theta = particle.angle + time * particle.speed;
    const wobble = Math.sin(time * 1.7 + particle.phase) * 18;
    const radius = particle.radius + wobble;
    const rawX = 550 + Math.cos(theta) * radius * 0.96;
    const rawY = 270 + Math.sin(theta * 1.13) * radius * 0.72;
    const local = clamp((dissolveProgress - particle.delay / 3.2) * 1.28);
    const x = lerp(rawX, target.x + (index % 3 - 1) * 7, ease(local));
    const y = lerp(rawY, target.y, ease(local));
    const alpha = 1 - clamp((local - 0.76) / 0.24);
    if (alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 9px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', x, y);
    ctx.restore();
  });
}

function drawInitialDrop(ctx, progress) {
  if (progress <= 0 || progress >= 1) return;
  const y = lerp(438, 475, ease(progress));
  ctx.save();
  ctx.fillStyle = '#36b7d4';
  ctx.beginPath();
  ctx.moveTo(550, y - 14);
  ctx.bezierCurveTo(535, y + 5, 539, y + 20, 550, y + 22);
  ctx.bezierCurveTo(561, y + 20, 565, y + 5, 550, y - 14);
  ctx.fill();
  ctx.restore();
}

function drawFountain(ctx, time, fountainProgress) {
  if (fountainProgress <= 0) return;
  const localTime = Math.max(0, time - 8.7);
  ctx.save();
  DROPLETS.forEach((drop, index) => {
    const age = (localTime - drop.delay) * drop.speed;
    if (age < 0 || age > 2.35) return;
    const spread = drop.side * 34;
    const x = 550 + spread * age + Math.sin(index * 1.9) * 8 * age;
    const y = 486 - 430 * age + 160 * age * age;
    const alpha = clamp(Math.min(age / 0.16, (2.35 - age) / 0.25));
    ctx.globalAlpha = alpha;
    ctx.fillStyle = age < 0.28 ? '#38b8d7' : '#e8328a';
    ctx.beginPath();
    ctx.ellipse(x, y, drop.size, drop.size * 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function stageFor(time) {
  if (time < 2.7) return { step: 1, title: 'The flask contains dry ammonia gas', detail: 'The blue particles move continuously throughout the sealed flask.' };
  if (time < 5.7) return { step: 2, title: 'A small water drop enters the flask', detail: 'Ammonia dissolves rapidly in the water.' };
  if (time < 8.7) return { step: 3, title: 'The pressure inside the flask falls', detail: 'Atmospheric pressure pushes the reservoir water up the jet tube.' };
  if (time < 15.8) return { step: 4, title: 'Water forms a fountain', detail: 'More ammonia dissolves; phenolphthalein turns pink in the alkaline solution.' };
  return { step: 5, title: 'The fountain demonstrates two properties', detail: 'Ammonia is very soluble in water and its solution is alkaline.' };
}

export default function AmmoniaFountainLive() {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const lastRef = useRef(null);
  const elapsedRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const render = time => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetWidth = Math.max(620, Math.round(rect.width * dpr));
    const targetHeight = Math.round(targetWidth * HEIGHT / WIDTH);
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(canvas.width / WIDTH, 0, 0, canvas.height / HEIGHT, 0, 0);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const background = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    background.addColorStop(0, '#f7fbff');
    background.addColorStop(1, '#eef5fa');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const dissolveProgress = clamp((time - 2.7) / 3);
    const tubeProgress = clamp((time - 5.7) / 3);
    const fountainProgress = clamp((time - 8.7) / 1.1);
    const liquidLevel = clamp((time - 10) / 6.5) * 0.72;

    drawBeaker(ctx);
    drawFlask(ctx, liquidLevel);
    drawTubeWater(ctx, tubeProgress);
    if (time < 6.2) drawGas(ctx, time, dissolveProgress);
    drawInitialDrop(ctx, clamp((time - 2.7) / 1.2));
    drawFountain(ctx, time, fountainProgress);

    drawLabel(ctx, 'sealed flask containing ammonia, NH₃(g)', 550, 26, { align: 'center', size: 22 });
    drawLabel(ctx, 'water + phenolphthalein', 550, 663, { align: 'center', size: 20, colour: '#075985' });

    const pressure = time < 3 ? 100 : Math.round(lerp(100, 38, ease(clamp((time - 3) / 5))));
    ctx.save();
    roundedRect(ctx, 824, 68, 242, 104, 14);
    ctx.fillStyle = 'rgba(255,255,255,0.94)';
    ctx.fill();
    ctx.strokeStyle = '#b9c9d7';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#475569';
    ctx.font = '650 16px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Inside pressure (conceptual)', 945, 96);
    ctx.fillStyle = pressure < 70 ? '#c0265e' : '#0f766e';
    ctx.font = '800 32px Inter, Arial';
    ctx.fillText(pressure + '%', 945, 140);
    ctx.restore();

    if (time >= 14.8) {
      drawLabel(ctx, 'NH₃(g) + H₂O(l) ⇌ NH₄⁺(aq) + OH⁻(aq)', 550, 610, {
        align: 'center',
        size: 22,
        colour: '#831843',
        background: 'rgba(255,255,255,0.94)'
      });
    }
  };

  useEffect(() => {
    render(elapsedRef.current);
    const onResize = () => render(elapsedRef.current);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!playing) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      lastRef.current = null;
      return undefined;
    }
    const tick = now => {
      if (lastRef.current == null) lastRef.current = now;
      const delta = Math.min((now - lastRef.current) / 1000, 0.08);
      lastRef.current = now;
      elapsedRef.current = Math.min(DURATION, elapsedRef.current + delta);
      render(elapsedRef.current);
      setElapsed(elapsedRef.current);
      if (elapsedRef.current >= DURATION) {
        setPlaying(false);
        return;
      }
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [playing]);

  const replay = () => {
    elapsedRef.current = 0;
    setElapsed(0);
    render(0);
    setPlaying(true);
  };

  const stage = stageFor(elapsed);
  const progress = elapsed / DURATION;

  return (
    <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="Interactive ammonia fountain experiment">
      <div className="border-b border-slate-200 bg-[#eef7f7] px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Stage {stage.step} of 5</p>
            <h3 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">{stage.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{stage.detail}</p>
          </div>
          <div className="flex items-center gap-2" role="group" aria-label="Fountain controls">
            <button
              type="button"
              onClick={() => elapsed >= DURATION ? replay() : setPlaying(value => !value)}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              aria-label={playing ? 'Pause ammonia fountain' : 'Play ammonia fountain'}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? 'Pause' : elapsed >= DURATION ? 'Play again' : 'Play'}
            </button>
            <button
              type="button"
              onClick={replay}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              aria-label="Replay ammonia fountain from the start"
            >
              <RotateCcw className="h-4 w-4" />
              Replay
            </button>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
          <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-pink-500 transition-[width] duration-100" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      <div className="bg-[#f7fbff]">
        <canvas
          ref={canvasRef}
          className="block h-auto w-full"
          style={{ aspectRatio: `${WIDTH} / ${HEIGHT}`, touchAction: 'pan-y pinch-zoom' }}
          role="img"
          aria-label="Live experiment showing ammonia molecules dissolving, pressure falling and coloured water forming a fountain inside the flask"
        />
      </div>

      <div className="grid gap-3 border-t border-slate-200 bg-white p-4 sm:grid-cols-2 sm:p-6">
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <p className="font-bold text-slate-900">Required ammonium-ion test</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Add aqueous sodium hydroxide and warm gently. Ammonia is released and turns damp red litmus paper blue.
          </p>
          <p className="mt-3 overflow-x-auto rounded-lg bg-white px-3 py-2 text-center font-serif text-base text-slate-900">
            NH₄⁺(aq) + OH⁻(aq) → NH₃(g) + H₂O(l)
          </p>
        </div>
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
          <p className="font-bold text-slate-900">What the fountain proves</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            The fountain demonstrates ammonia's high solubility. The pink colour shows that dissolved ammonia produces an alkaline solution. The fountain is an explanation, not the identification test itself.
          </p>
        </div>
      </div>
    </section>
  );
}
