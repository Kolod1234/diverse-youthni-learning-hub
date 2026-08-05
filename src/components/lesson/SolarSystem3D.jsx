import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Pause, Play, RotateCcw, Tags } from 'lucide-react';

const PLANETS = [
  { name: 'Mercury', radius: 4.0, size: 0.34, period: 0.24, rotationHours: 1407.6, inclination: 7.0, base: '#8f8a80', stripe: '#b5afa4' },
  { name: 'Venus', radius: 5.2, size: 0.52, period: 0.62, rotationHours: -5832.5, inclination: 3.4, base: '#c99145', stripe: '#f0c56d' },
  { name: 'Earth', radius: 6.5, size: 0.56, period: 1.0, rotationHours: 23.9, inclination: 0, base: '#2563a8', stripe: '#2f9e68', spot: '#63b96f' },
  { name: 'Mars', radius: 7.8, size: 0.43, period: 1.88, rotationHours: 24.6, inclination: 1.9, base: '#a94427', stripe: '#d47748' },
  { name: 'Jupiter', radius: 10.2, size: 1.12, period: 11.86, rotationHours: 9.9, inclination: 1.3, base: '#b88a62', stripe: '#ead1a8', spot: '#9f4932' },
  { name: 'Saturn', radius: 12.7, size: 0.96, period: 29.45, rotationHours: 10.7, inclination: 2.5, base: '#d0b276', stripe: '#f2d79c', rings: true },
  { name: 'Uranus', radius: 15.0, size: 0.73, period: 84.0, rotationHours: -17.2, inclination: 0.8, base: '#77c7d4', stripe: '#bcebf0' },
  { name: 'Neptune', radius: 17.1, size: 0.70, period: 164.8, rotationHours: 16.1, inclination: 1.8, base: '#2d5fb3', stripe: '#5b89dd' }
];

const ALL_BODIES = [
  { name: 'Sun', period: null, fact: 'The star whose gravity holds the Solar System together.' },
  ...PLANETS.map(planet => ({
    name: planet.name,
    period: planet.period,
    fact: planet.name === 'Earth'
      ? 'Our rocky planet; one revolution takes about 365.25 days.'
      : planet.name === 'Jupiter'
        ? 'The largest planet and the fastest rotating planet.'
        : planet.name === 'Saturn'
          ? 'A gas giant with a prominent system of icy rings.'
          : planet.name === 'Uranus'
            ? 'An ice giant that rotates on an axis tilted by about 98°.'
            : planet.name === 'Venus'
              ? 'A rocky planet with slow retrograde rotation.'
              : planet.name === 'Mercury'
                ? 'The closest planet to the Sun and the shortest year.'
                : planet.name === 'Mars'
                  ? 'A cold rocky planet with iron-rich surface material.'
                  : 'The outermost planet, with an orbital period of about 165 Earth years.'
  }))
];

function createPlanetTexture({ base, stripe, spot }) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  context.fillStyle = base;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.globalAlpha = 0.55;
  context.fillStyle = stripe;
  for (let y = 10; y < canvas.height; y += 22) {
    context.fillRect(0, y, canvas.width, 7 + (y % 3));
  }

  if (spot) {
    context.globalAlpha = 0.75;
    context.fillStyle = spot;
    context.beginPath();
    context.ellipse(176, 78, 25, 11, -0.15, 0, Math.PI * 2);
    context.fill();
  }

  context.globalAlpha = 0.16;
  for (let x = 0; x < canvas.width; x += 16) {
    context.fillStyle = x % 32 === 0 ? '#ffffff' : '#000000';
    context.fillRect(x, 0, 5, canvas.height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

function createOrbit(radius, inclinationDegrees) {
  const inclination = THREE.MathUtils.degToRad(inclinationDegrees);
  const points = [];
  for (let step = 0; step < 180; step += 1) {
    const angle = (step / 180) * Math.PI * 2;
    points.push(new THREE.Vector3(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * Math.sin(inclination),
      Math.sin(angle) * radius * Math.cos(inclination)
    ));
  }
  return new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 0x50678e, transparent: true, opacity: 0.48 })
  );
}

function StaticFallback() {
  return (
    <div className="rounded-lg border border-slate-700 bg-[#071326] p-5 text-white">
      <p className="font-semibold">Interactive 3D is unavailable on this device.</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">Planet order from the Sun:</p>
      <ol className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        {PLANETS.map((planet, index) => (
          <li key={planet.name} className="rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2">
            {index + 1}. {planet.name}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function SolarSystem3D() {
  const mountRef = useRef(null);
  const labelRefs = useRef({});
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const runningRef = useRef(true);
  const speedRef = useRef(1);
  const labelsRef = useRef(true);
  const sceneBodiesRef = useRef([]);
  const animationRef = useRef(null);
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedName, setSelectedName] = useState('Earth');
  const [webGLAvailable, setWebGLAvailable] = useState(true);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    labelsRef.current = showLabels;
    if (!showLabels) {
      Object.values(labelRefs.current).forEach(label => {
        if (label) label.style.display = 'none';
      });
    }
  }, [showLabels]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setRunning(false);
      runningRef.current = false;
    }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch (error) {
      console.warn('WebGL Solar System could not initialise:', error);
      setWebGLAvailable(false);
      return undefined;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('aria-label', 'Interactive three-dimensional Solar System model');
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'none';
    mount.prepend(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030a19);
    scene.fog = new THREE.FogExp2(0x030a19, 0.013);

    const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 140);
    camera.position.set(0, 22, 36);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.minDistance = 13;
    controls.maxDistance = 58;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    scene.add(new THREE.AmbientLight(0x8aa4d6, 0.44));
    const sunlight = new THREE.PointLight(0xfff0bf, 5.5, 70, 1.25);
    sunlight.position.set(0, 0, 0);
    sunlight.castShadow = true;
    scene.add(sunlight);

    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffb11b });
    const sun = new THREE.Mesh(new THREE.SphereGeometry(1.85, 48, 32), sunMaterial);
    sun.userData.bodyName = 'Sun';
    scene.add(sun);

    const sunGlow = new THREE.Mesh(
      new THREE.SphereGeometry(2.16, 40, 24),
      new THREE.MeshBasicMaterial({ color: 0xff8a00, transparent: true, opacity: 0.18, side: THREE.BackSide })
    );
    scene.add(sunGlow);

    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(900 * 3);
    for (let index = 0; index < 900; index += 1) {
      const radius = 30 + Math.random() * 45;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      starPositions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[(index * 3) + 1] = radius * Math.cos(phi);
      starPositions[(index * 3) + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({ color: 0xb9d7ff, size: 0.09, transparent: true, opacity: 0.85 })
    );
    scene.add(stars);

    const sceneBodies = [{ name: 'Sun', mesh: sun, angle: 0, config: null }];
    PLANETS.forEach((planet, index) => {
      scene.add(createOrbit(planet.radius, planet.inclination));

      const texture = createPlanetTexture(planet);
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.82,
        metalness: 0.02
      });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(planet.size, 38, 26), material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.bodyName = planet.name;

      if (planet.rings) {
        const rings = new THREE.Mesh(
          new THREE.RingGeometry(planet.size * 1.28, planet.size * 2.05, 96),
          new THREE.MeshBasicMaterial({
            color: 0xd9bf8c,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.78
          })
        );
        rings.rotation.x = Math.PI / 2.35;
        mesh.add(rings);
      }

      scene.add(mesh);
      sceneBodies.push({
        name: planet.name,
        mesh,
        config: planet,
        angle: (index / PLANETS.length) * Math.PI * 2
      });
    });
    sceneBodiesRef.current = sceneBodies;

    const clock = new THREE.Clock();
    const projected = new THREE.Vector3();
    const occupied = [];

    const placeLabels = () => {
      if (!labelsRef.current) return;
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      occupied.length = 0;

      sceneBodies.forEach(body => {
        const label = labelRefs.current[body.name];
        if (!label) return;
        body.mesh.getWorldPosition(projected);
        projected.project(camera);

        const behindCamera = projected.z > 1;
        const baseX = ((projected.x + 1) / 2) * width;
        const baseY = ((-projected.y + 1) / 2) * height;
        const outside = baseX < 28 || baseX > width - 28 || baseY < 25 || baseY > height - 25;
        if (behindCamera || outside) {
          label.style.display = 'none';
          return;
        }

        const labelWidth = Math.max(58, body.name.length * 8 + 18);
        const offsets = [-26, -52, 22, -78, 48];
        let chosenY = null;
        for (const offset of offsets) {
          const candidate = { left: baseX - (labelWidth / 2), right: baseX + (labelWidth / 2), top: baseY + offset - 12, bottom: baseY + offset + 12 };
          const overlaps = occupied.some(box => !(candidate.right < box.left || candidate.left > box.right || candidate.bottom < box.top || candidate.top > box.bottom));
          if (!overlaps && candidate.top > 5 && candidate.bottom < height - 5) {
            occupied.push(candidate);
            chosenY = baseY + offset;
            break;
          }
        }

        if (chosenY === null) {
          label.style.display = 'none';
          return;
        }
        label.style.display = 'block';
        label.style.transform = `translate3d(${baseX}px, ${chosenY}px, 0) translate(-50%, -50%)`;
      });
    };

    const updateSize = () => {
      const width = Math.max(280, mount.clientWidth);
      const height = window.innerWidth < 640 ? 420 : 540;
      mount.style.height = `${height}px`;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(mount);
    updateSize();

    const animate = () => {
      animationRef.current = window.requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      if (runningRef.current) {
        sceneBodies.forEach(body => {
          if (!body.config) {
            body.mesh.rotation.y += delta * speedRef.current * 0.16;
            return;
          }
          const orbitalRate = 0.43 / Math.pow(body.config.period, 0.36);
          body.angle += delta * speedRef.current * orbitalRate;
          const inclination = THREE.MathUtils.degToRad(body.config.inclination);
          body.mesh.position.set(
            Math.cos(body.angle) * body.config.radius,
            Math.sin(body.angle) * body.config.radius * Math.sin(inclination),
            Math.sin(body.angle) * body.config.radius * Math.cos(inclination)
          );
          const spinDirection = body.config.rotationHours < 0 ? -1 : 1;
          const rotationRate = Math.min(1.3, 14 / Math.abs(body.config.rotationHours));
          body.mesh.rotation.y += delta * speedRef.current * rotationRate * spinDirection;
        });
      }
      controls.update();
      placeLabels();
      renderer.render(scene, camera);
    };

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerStart = null;
    const handlePointerDown = event => {
      pointerStart = { x: event.clientX, y: event.clientY };
    };
    const handlePointerUp = event => {
      if (!pointerStart || Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 7) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(sceneBodies.map(body => body.mesh), false);
      if (hits[0]?.object?.userData?.bodyName) setSelectedName(hits[0].object.userData.bodyName);
    };
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);
    animate();

    return () => {
      window.cancelAnimationFrame(animationRef.current);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      controls.dispose();
      scene.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach(material => {
            if (material.map) material.map.dispose();
            material.dispose();
          });
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      rendererRef.current = null;
      controlsRef.current = null;
      cameraRef.current = null;
      sceneBodiesRef.current = [];
    };
  }, []);

  const resetView = () => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    camera.position.set(0, 22, 36);
    controls.target.set(0, 0, 0);
    controls.update();
  };

  const selectRelativeBody = direction => {
    const currentIndex = ALL_BODIES.findIndex(body => body.name === selectedName);
    const nextIndex = (currentIndex + direction + ALL_BODIES.length) % ALL_BODIES.length;
    setSelectedName(ALL_BODIES[nextIndex].name);
  };

  const selectedBody = ALL_BODIES.find(body => body.name === selectedName) || ALL_BODIES[0];

  if (!webGLAvailable) return <StaticFallback />;

  return (
    <section className="not-prose mt-6" aria-labelledby="solar-system-3d-heading">
      <div className="mb-4">
        <h3 id="solar-system-3d-heading" className="text-xl font-bold text-[#0b1b32]">Interactive Solar System</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Drag to rotate the view, pinch or use the mouse wheel to zoom, and select a planet to inspect it.
        </p>
      </div>

      <div
        ref={mountRef}
        className="relative isolate w-full overflow-hidden rounded-xl border border-slate-700 bg-[#030a19] shadow-lg focus-within:ring-2 focus-within:ring-orange-500"
        tabIndex={0}
        onKeyDown={event => {
          if (event.key === 'ArrowRight') selectRelativeBody(1);
          if (event.key === 'ArrowLeft') selectRelativeBody(-1);
          if (event.key === ' ') {
            event.preventDefault();
            setRunning(value => !value);
          }
        }}
        aria-label="Interactive Solar System. Use left and right arrow keys to select bodies; press space to play or pause."
      >
        <div className="pointer-events-none absolute inset-0 z-10" aria-hidden={!showLabels}>
          {ALL_BODIES.map(body => (
            <span
              key={body.name}
              ref={element => { labelRefs.current[body.name] = element; }}
              className={'absolute left-0 top-0 whitespace-nowrap rounded border px-2 py-0.5 text-[11px] font-bold shadow-sm ' + (body.name === selectedName
                ? 'border-orange-300 bg-orange-400 text-[#071326]'
                : 'border-white/20 bg-[#071326]/85 text-white')}
              style={{ willChange: 'transform', display: showLabels ? 'block' : 'none' }}
            >
              {body.name}
            </span>
          ))}
        </div>
        <div className="pointer-events-none absolute bottom-3 left-3 z-20 rounded-md border border-white/10 bg-[#071326]/85 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200">
          Sizes, distances and time are compressed — model not to scale
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <button
          type="button"
          onClick={() => setRunning(value => !value)}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#071326] px-4 text-sm font-bold text-white hover:bg-[#102443] focus:outline-none focus:ring-2 focus:ring-orange-500"
          aria-pressed={running}
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {running ? 'Pause' : 'Play'}
        </button>

        <label className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700">
          Speed
          <select
            value={speed}
            onChange={event => setSpeed(Number(event.target.value))}
            className="bg-transparent font-bold outline-none"
            aria-label="Orbital animation speed"
          >
            <option value={0.25}>0.25×</option>
            <option value={1}>1×</option>
            <option value={4}>4×</option>
          </select>
        </label>

        <button
          type="button"
          onClick={() => setShowLabels(value => !value)}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
          aria-pressed={showLabels}
        >
          <Tags className="h-4 w-4" />
          {showLabels ? 'Hide labels' : 'Show labels'}
        </button>

        <button
          type="button"
          onClick={resetView}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <RotateCcw className="h-4 w-4" />
          Reset view
        </button>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4" aria-live="polite">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">Selected body</p>
          <p className="mt-1 text-lg font-bold text-[#0b1b32]">{selectedBody.name}</p>
          <p className="mt-1 text-sm leading-6 text-slate-700">{selectedBody.fact}</p>
          {selectedBody.period && (
            <p className="mt-2 text-sm font-semibold text-slate-700">
              Orbital period: {selectedBody.period} Earth {selectedBody.period === 1 ? 'year' : 'years'}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:w-56">
          {ALL_BODIES.map(body => (
            <button
              type="button"
              key={body.name}
              onClick={() => setSelectedName(body.name)}
              className={'min-h-10 rounded-md border px-2 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-orange-500 ' + (body.name === selectedName
                ? 'border-orange-400 bg-orange-100 text-orange-900'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400')}
            >
              {body.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-lg border-l-4 border-orange-500 bg-orange-50 px-4 py-3 text-sm leading-6 text-slate-700">
        <strong>Movement shown:</strong> each planet rotates on its axis and revolves around the Sun. Orbital speeds preserve the correct fastest-to-slowest order, but the animation is deliberately compressed so outer planets visibly move during the lesson.
      </div>
    </section>
  );
}
