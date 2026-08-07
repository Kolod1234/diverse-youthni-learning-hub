import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Hand, RotateCcw, ZoomIn } from 'lucide-react';

const DIAMOND_BASIS = [
  [0, 0, 0],
  [0, 0.5, 0.5],
  [0.5, 0, 0.5],
  [0.5, 0.5, 0],
  [0.25, 0.25, 0.25],
  [0.25, 0.75, 0.75],
  [0.75, 0.25, 0.75],
  [0.75, 0.75, 0.25]
];

function centrePoints(points) {
  const box = new THREE.Box3().setFromPoints(points);
  const centre = box.getCenter(new THREE.Vector3());
  return points.map(point => point.clone().sub(centre));
}

function buildDiamondModel() {
  const latticeScale = 2.05;
  const atoms = [];

  for (let x = 0; x < 2; x += 1) {
    for (let y = 0; y < 2; y += 1) {
      for (let z = 0; z < 2; z += 1) {
        DIAMOND_BASIS.forEach(([bx, by, bz]) => {
          atoms.push(new THREE.Vector3(
            (x + bx) * latticeScale,
            (y + by) * latticeScale,
            (z + bz) * latticeScale
          ));
        });
      }
    }
  }

  const centredAtoms = centrePoints(atoms);
  const nearestNeighbour = Math.sqrt(3) * latticeScale / 4;
  const bonds = [];

  for (let i = 0; i < centredAtoms.length; i += 1) {
    for (let j = i + 1; j < centredAtoms.length; j += 1) {
      const distance = centredAtoms[i].distanceTo(centredAtoms[j]);
      if (Math.abs(distance - nearestNeighbour) < 0.035) {
        bonds.push([i, j]);
      }
    }
  }

  return {
    atoms: centredAtoms,
    bonds,
    atomColour: '#263449',
    bondColour: '#8b98a9',
    atomRadius: 0.18,
    bondRadius: 0.065,
    camera: [6.8, 5.8, 7.4],
    target: [0, 0, 0]
  };
}

function buildGraphiteModel() {
  const atoms = [];
  const layers = [-1.65, 0, 1.65];
  const rootThree = Math.sqrt(3);

  layers.forEach((height, layerIndex) => {
    const offsetX = layerIndex % 2 === 0 ? 0 : rootThree / 2;
    const offsetZ = layerIndex % 2 === 0 ? 0 : 0.5;

    for (let i = -2; i <= 2; i += 1) {
      for (let j = -2; j <= 2; j += 1) {
        const x = rootThree * i + (rootThree / 2) * j + offsetX;
        const z = 1.5 * j + offsetZ;
        atoms.push({ position: new THREE.Vector3(x, height, z), layer: layerIndex });
        atoms.push({ position: new THREE.Vector3(x, height, z + 1), layer: layerIndex });
      }
    }
  });

  const points = centrePoints(atoms.map(atom => atom.position));
  const centredAtoms = atoms.map((atom, index) => ({ position: points[index], layer: atom.layer }));
  const bonds = [];

  for (let i = 0; i < centredAtoms.length; i += 1) {
    for (let j = i + 1; j < centredAtoms.length; j += 1) {
      if (centredAtoms[i].layer !== centredAtoms[j].layer) continue;
      const distance = centredAtoms[i].position.distanceTo(centredAtoms[j].position);
      if (Math.abs(distance - 1) < 0.035) {
        bonds.push([i, j]);
      }
    }
  }

  return {
    atoms: centredAtoms.map(atom => atom.position),
    bonds,
    atomColour: '#2563eb',
    bondColour: '#64748b',
    atomRadius: 0.16,
    bondRadius: 0.055,
    camera: [8.6, 6.4, 9.4],
    target: [0, 0, 0]
  };
}

function addBond(group, start, end, geometry, material) {
  const midpoint = start.clone().add(end).multiplyScalar(0.5);
  const direction = end.clone().sub(start);
  const length = direction.length();
  const bond = new THREE.Mesh(geometry, material);

  bond.position.copy(midpoint);
  bond.scale.set(1, length, 1);
  bond.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize()
  );
  group.add(bond);
}

export default function CrystalLattice3D({ model = 'diamond' }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const [renderError, setRenderError] = useState(false);
  const isGraphite = model === 'graphite';
  const title = isGraphite ? 'Interactive 3D graphite structure' : 'Interactive 3D diamond structure';

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let renderer;
    let controls;
    let resizeObserver;
    let disposed = false;

    try {
      const modelData = isGraphite ? buildGraphiteModel() : buildDiamondModel();
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#f8fafc');

      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      camera.position.set(...modelData.camera);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      mount.appendChild(renderer.domElement);

      const hemisphere = new THREE.HemisphereLight('#ffffff', '#b9c4d1', 2.15);
      scene.add(hemisphere);
      const keyLight = new THREE.DirectionalLight('#ffffff', 2.6);
      keyLight.position.set(6, 9, 8);
      scene.add(keyLight);
      const fillLight = new THREE.DirectionalLight('#c7dcff', 1.4);
      fillLight.position.set(-7, 2, -5);
      scene.add(fillLight);

      const group = new THREE.Group();
      scene.add(group);

      const atomGeometry = new THREE.SphereGeometry(modelData.atomRadius, 24, 18);
      const atomMaterial = new THREE.MeshStandardMaterial({
        color: modelData.atomColour,
        roughness: 0.26,
        metalness: 0.08
      });
      const bondGeometry = new THREE.CylinderGeometry(modelData.bondRadius, modelData.bondRadius, 1, 14);
      const bondMaterial = new THREE.MeshStandardMaterial({
        color: modelData.bondColour,
        roughness: 0.45,
        metalness: 0.04
      });

      modelData.bonds.forEach(([startIndex, endIndex]) => {
        addBond(
          group,
          modelData.atoms[startIndex],
          modelData.atoms[endIndex],
          bondGeometry,
          bondMaterial
        );
      });

      modelData.atoms.forEach(position => {
        const atom = new THREE.Mesh(atomGeometry, atomMaterial);
        atom.position.copy(position);
        group.add(atom);
      });

      group.rotation.set(
        isGraphite ? -0.28 : -0.18,
        isGraphite ? 0.15 : 0.35,
        isGraphite ? 0 : 0.08
      );

      controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(...modelData.target);
      controls.enableDamping = false;
      controls.enablePan = false;
      controls.enableZoom = true;
      controls.minDistance = isGraphite ? 7 : 5;
      controls.maxDistance = isGraphite ? 20 : 16;
      controls.rotateSpeed = 0.72;
      controls.zoomSpeed = 0.8;

      const renderScene = () => renderer.render(scene, camera);
      controls.addEventListener('change', renderScene);

      const resize = () => {
        if (disposed || !mount.clientWidth) return;
        const width = mount.clientWidth;
        const height = Math.max(360, Math.min(560, Math.round(width * 0.62)));
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderScene();
      };

      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(mount);
      resize();

      sceneRef.current = {
        reset: () => {
          camera.position.set(...modelData.camera);
          controls.target.set(...modelData.target);
          controls.update();
          renderScene();
        }
      };

      return () => {
        disposed = true;
        resizeObserver?.disconnect();
        controls?.removeEventListener('change', renderScene);
        controls?.dispose();
        atomGeometry.dispose();
        bondGeometry.dispose();
        atomMaterial.dispose();
        bondMaterial.dispose();
        renderer?.dispose();
        if (renderer?.domElement?.parentNode === mount) mount.removeChild(renderer.domElement);
        sceneRef.current = null;
      };
    } catch (error) {
      console.error('Unable to render the crystal lattice model', error);
      setRenderError(true);
      return undefined;
    }
  }, [isGraphite]);

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label={title}>
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">The model remains still until you interact with it.</p>
        </div>
        <button
          type="button"
          onClick={() => sceneRef.current?.reset()}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset view
        </button>
      </div>

      {renderError ? (
        <div className="flex min-h-[360px] items-center justify-center p-6 text-center text-slate-600">
          This browser could not display the 3D model. Please enable WebGL or try another browser.
        </div>
      ) : (
        <div
          ref={mountRef}
          className="w-full cursor-grab bg-slate-50 active:cursor-grabbing [&>canvas]:block [&>canvas]:w-full"
          style={{ touchAction: 'none', minHeight: 360 }}
          role="img"
          aria-label={isGraphite
            ? 'Rotatable ball-and-stick model of three stacked graphite layers made from hexagonal carbon sheets'
            : 'Rotatable ball-and-stick model of the repeating tetrahedral carbon network in diamond'}
          onPointerDown={event => event.stopPropagation()}
          onTouchStart={event => event.stopPropagation()}
        />
      )}

      <div className="grid gap-3 border-t border-slate-200 px-4 py-4 text-sm text-slate-700 sm:grid-cols-2">
        <p className="flex items-center gap-2"><Hand className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" /><span><strong>Drag</strong> to rotate the structure.</span></p>
        <p className="flex items-center gap-2"><ZoomIn className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" /><span><strong>Pinch or scroll</strong> to zoom.</span></p>
      </div>

      <div className="grid gap-3 bg-slate-50 px-4 py-4 text-sm sm:grid-cols-3">
        <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200"><strong>Sphere</strong><br />Carbon atom</div>
        <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200"><strong>Rod</strong><br />Strong covalent bond</div>
        <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
          <strong>{isGraphite ? 'Separate sheets' : '3D network'}</strong><br />
          {isGraphite ? 'Weak forces act between layers; rods are not drawn between them.' : 'Each interior carbon has four tetrahedral neighbours.'}
        </div>
      </div>
      <p className="px-4 py-3 text-xs leading-5 text-slate-500">
        Colours are a visual convention; both structures contain carbon atoms.
      </p>
    </section>
  );
}
