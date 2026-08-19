/**
 * Glassware components for the virtual laboratory.
 *
 * Each vessel is a lathed shell of borosilicate glass plus an optional inner
 * liquid mesh. Glass uses MeshPhysicalMaterial with transmission so it actually
 * refracts what is behind it rather than faking transparency with opacity.
 */
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import {
  buretteProfile, flaskProfile, beakerProfile, pipetteProfile,
  testTubeProfile, bottleProfile, liquidProfile,
} from './apparatusProfiles';

const SEGMENTS = 48;

/** Shared borosilicate glass. Memoised so every vessel reuses one material. */
export function useGlassMaterial(tint = '#eaf6ff') {
  return useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(tint),
    metalness: 0,
    roughness: 0.06,
    transmission: 0.95,     // real refraction through the wall
    thickness: 0.004,
    ior: 1.474,             // borosilicate
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), [tint]);
}

/** Liquid material — coloured, slightly refractive, never fully opaque. */
function useLiquidMaterial(color, opacity = 0.85) {
  return useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness: 0.12,
    metalness: 0,
    transmission: 0.35,
    thickness: 0.02,
    ior: 1.333,             // water
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
  }), [color, opacity]);
}

/**
 * A lathed vessel with liquid inside.
 * `fill` is 0..1 of the vessel height; `color` is the liquid colour.
 */
export function Vessel({
  points, fill = 0, color = '#bfe9ff', opacity = 0.85,
  glassTint = '#eaf6ff', children, ...props
}) {
  const glass = useGlassMaterial(glassTint);
  const liquidMat = useLiquidMaterial(color, opacity);
  const liquidPts = useMemo(() => liquidProfile(points, fill), [points, fill]);

  return (
    <group {...props}>
      <mesh material={glass} castShadow receiveShadow renderOrder={2}>
        <latheGeometry args={[points, SEGMENTS]} />
      </mesh>
      {liquidPts && (
        <mesh material={liquidMat} renderOrder={1}>
          <latheGeometry args={[liquidPts, SEGMENTS]} />
        </mesh>
      )}
      {children}
    </group>
  );
}

/** 250 ml conical flask. `swirl` drives the liquid tilt while shaking. */
export function ConicalFlask({ fill = 0, color = '#eaf6ff', swirl = 0, ...props }) {
  const liquid = useRef();
  useFrame(({ clock }) => {
    if (!liquid.current || swirl <= 0) return;
    const t = clock.getElapsedTime() * 9;
    // Tilt the liquid body so it visibly sloshes around the cone.
    liquid.current.rotation.z = Math.sin(t) * 0.14 * swirl;
    liquid.current.rotation.x = Math.cos(t * 0.9) * 0.14 * swirl;
    liquid.current.position.y = Math.abs(Math.sin(t * 2)) * 0.004 * swirl;
  });

  const glass = useGlassMaterial();
  const liquidMat = useLiquidMaterial(color, 0.88);
  const liquidPts = useMemo(() => liquidProfile(flaskProfile, fill), [fill]);

  return (
    <group {...props}>
      <mesh material={glass} castShadow receiveShadow renderOrder={2}>
        <latheGeometry args={[flaskProfile, SEGMENTS]} />
      </mesh>
      {liquidPts && (
        <mesh ref={liquid} material={liquidMat} renderOrder={1}>
          <latheGeometry args={[liquidPts, SEGMENTS]} />
        </mesh>
      )}
    </group>
  );
}

/**
 * 50 ml burette with a working glass tap.
 * `level` is 0..1 of the graduated barrel; `tapAngle` rotates the stopcock.
 */
export function Burette({ level = 1, tapAngle = 0, ...props }) {
  const glass = useGlassMaterial();
  const liquidMat = useLiquidMaterial('#dff0ff', 0.7);

  // The barrel runs from y=0.09 to y=0.56; liquid drains from the top down.
  const liquidPts = useMemo(() => {
    if (level <= 0) return null;
    const bottom = 0.09;
    const top = 0.56;
    const surface = bottom + (top - bottom) * level;
    return [
      new THREE.Vector2(0, bottom),
      new THREE.Vector2(0.0065, bottom),
      new THREE.Vector2(0.0065, surface),
      new THREE.Vector2(0, surface),
    ];
  }, [level]);

  return (
    <group {...props}>
      <mesh material={glass} castShadow renderOrder={2}>
        <latheGeometry args={[buretteProfile, SEGMENTS]} />
      </mesh>
      {liquidPts && (
        <mesh material={liquidMat} renderOrder={1}>
          <latheGeometry args={[liquidPts, SEGMENTS]} />
        </mesh>
      )}

      {/* Stopcock barrel */}
      <mesh position={[0, 0.055, 0]} rotation={[0, 0, Math.PI / 2]} material={glass}>
        <cylinderGeometry args={[0.0085, 0.0085, 0.030, 24]} />
      </mesh>
      {/* Tap handle — rotates as the student opens it */}
      <group position={[0, 0.055, 0]} rotation={[tapAngle, 0, 0]}>
        <mesh position={[0, 0, 0.017]} castShadow>
          <boxGeometry args={[0.006, 0.020, 0.010]} />
          <meshStandardMaterial color="#f4f7fa" roughness={0.35} />
        </mesh>
      </group>

      {/* Graduation ticks every 5 ml down the barrel */}
      {Array.from({ length: 11 }).map((_, i) => (
        <mesh key={i} position={[0.0081, 0.09 + (i * (0.47 / 10)), 0]}>
          <boxGeometry args={[0.0008, 0.0004, i % 2 === 0 ? 0.009 : 0.005]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
      ))}
    </group>
  );
}

/** 250 ml beaker with a pouring spout. */
export function Beaker({ fill = 0, color = '#dff0ff', ...props }) {
  return (
    <Vessel points={beakerProfile} fill={fill} color={color} {...props}>
      <mesh position={[0.035, 0.092, 0]} rotation={[0, 0, -0.4]}>
        <cylinderGeometry args={[0.006, 0.008, 0.010, 12, 1, true]} />
        <meshPhysicalMaterial
          color="#eaf6ff" transmission={0.9} roughness={0.07}
          thickness={0.003} ior={1.474} transparent side={THREE.DoubleSide}
        />
      </mesh>
    </Vessel>
  );
}

/** 25 ml volumetric pipette. */
export function Pipette({ fill = 0, color = '#dff0ff', ...props }) {
  return <Vessel points={pipetteProfile} fill={fill} color={color} {...props} />;
}

/** Test tube — used by the ion-identification practical. */
export function TestTube({ fill = 0, color = '#dff0ff', ...props }) {
  return <Vessel points={testTubeProfile} fill={fill} color={color} {...props} />;
}

/** Amber or clear reagent bottle with a stopper and a paper label. */
export function ReagentBottle({ label, color = '#c88a3a', liquid = '#d9b16a', ...props }) {
  const glass = useGlassMaterial(color);
  const liquidMat = useLiquidMaterial(liquid, 0.9);
  const liquidPts = useMemo(() => liquidProfile(bottleProfile, 0.62), []);

  return (
    <group {...props}>
      <mesh material={glass} castShadow receiveShadow renderOrder={2}>
        <latheGeometry args={[bottleProfile, 32]} />
      </mesh>
      {liquidPts && (
        <mesh material={liquidMat} renderOrder={1}>
          <latheGeometry args={[liquidPts, 32]} />
        </mesh>
      )}
      {/* Ground-glass stopper */}
      <mesh position={[0, 0.152, 0]} castShadow material={glass}>
        <cylinderGeometry args={[0.011, 0.009, 0.018, 20]} />
      </mesh>
      {/* Label */}
      <mesh position={[0, 0.048, 0.0287]}>
        <planeGeometry args={[0.034, 0.040]} />
        <meshStandardMaterial color="#fbf7ed" roughness={0.9} />
      </mesh>
      {label}
    </group>
  );
}

/**
 * Retort stand: cast base, vertical rod, boss head and clamp jaws.
 * Metal rather than glass, so it grounds the scene visually.
 */
export function RetortStand({ height = 0.75, clampY = 0.52, ...props }) {
  const steel = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#8d949c', metalness: 0.85, roughness: 0.35,
  }), []);
  const dark = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#2f353c', metalness: 0.6, roughness: 0.5,
  }), []);

  return (
    <group {...props}>
      <mesh position={[0, 0.008, 0]} material={dark} castShadow receiveShadow>
        <boxGeometry args={[0.16, 0.016, 0.11]} />
      </mesh>
      <mesh position={[0, height / 2, -0.035]} material={steel} castShadow>
        <cylinderGeometry args={[0.006, 0.006, height, 16]} />
      </mesh>
      {/* Boss head */}
      <mesh position={[0, clampY, -0.035]} material={dark} castShadow>
        <boxGeometry args={[0.022, 0.030, 0.026]} />
      </mesh>
      {/* Clamp arm reaching forward to hold the burette */}
      <mesh position={[0, clampY, -0.014]} material={steel} castShadow>
        <cylinderGeometry args={[0.004, 0.004, 0.045, 12]} rotation={[Math.PI / 2, 0, 0]} />
      </mesh>
      <group position={[0, clampY, 0.006]}>
        <mesh position={[-0.011, 0, 0]} material={dark} castShadow>
          <boxGeometry args={[0.008, 0.012, 0.026]} />
        </mesh>
        <mesh position={[0.011, 0, 0]} material={dark} castShadow>
          <boxGeometry args={[0.008, 0.012, 0.026]} />
        </mesh>
      </group>
    </group>
  );
}

/** White tile placed under the flask so the endpoint colour is easy to judge. */
export function WhiteTile(props) {
  return (
    <mesh receiveShadow {...props}>
      <boxGeometry args={[0.12, 0.006, 0.12]} />
      <meshStandardMaterial color="#f7f8fa" roughness={0.55} />
    </mesh>
  );
}
