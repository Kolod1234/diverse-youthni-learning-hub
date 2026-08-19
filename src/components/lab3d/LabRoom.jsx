/**
 * The laboratory environment: room shell, bench, cupboard, sink and lighting.
 *
 * Everything is built from parametric geometry rather than downloaded models,
 * so the whole lab costs a few kilobytes of JS instead of a multi-megabyte
 * asset bundle — which matters on school Chromebooks and phones.
 */
import React, { useMemo } from 'react';
import * as THREE from 'three';

const ROOM = { w: 6.4, d: 5.0, h: 3.0 };
const BENCH = { w: 2.6, d: 0.75, h: 0.90 };

function useMaterials() {
  return useMemo(() => ({
    wall: new THREE.MeshStandardMaterial({ color: '#e8eef3', roughness: 0.94 }),
    floor: new THREE.MeshStandardMaterial({ color: '#b9c2cb', roughness: 0.8, metalness: 0.02 }),
    ceiling: new THREE.MeshStandardMaterial({ color: '#f4f7fa', roughness: 1 }),
    // Dark chemical-resistant epoxy resin, as on a real school bench.
    benchTop: new THREE.MeshStandardMaterial({ color: '#23282e', roughness: 0.42, metalness: 0.06 }),
    cabinet: new THREE.MeshStandardMaterial({ color: '#4a5a6a', roughness: 0.6 }),
    cabinetDoor: new THREE.MeshStandardMaterial({ color: '#54687a', roughness: 0.55 }),
    steel: new THREE.MeshStandardMaterial({ color: '#98a1aa', metalness: 0.9, roughness: 0.28 }),
    trim: new THREE.MeshStandardMaterial({ color: '#cfd7de', roughness: 0.7 }),
    glassPane: new THREE.MeshPhysicalMaterial({
      color: '#dcecf5', transmission: 0.92, roughness: 0.05,
      thickness: 0.01, ior: 1.52, transparent: true, side: THREE.DoubleSide,
    }),
  }), []);
}

/** Fluorescent ceiling panel — both the visible fitting and the light it casts. */
function CeilingLight({ position, intensity = 1 }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.2, 0.05, 0.30]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#fdfbf4"
          emissiveIntensity={1.5}
          roughness={0.9}
        />
      </mesh>
      <rectAreaLight
        width={1.2}
        height={0.3}
        intensity={intensity * 5}
        color="#fff8ec"
        position={[0, -0.04, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </group>
  );
}

/** Wall-mounted cupboard where apparatus is stored between experiments. */
export function Cupboard({ open = false, ...props }) {
  const m = useMaterials();
  const doorAngle = open ? -Math.PI * 0.62 : 0;

  return (
    <group {...props}>
      {/* Carcass */}
      <mesh material={m.cabinet} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.85, 0.34]} />
      </mesh>
      {/* Interior back panel, lighter so contents read against it */}
      <mesh position={[0, 0, -0.16]}>
        <planeGeometry args={[1.06, 0.81]} />
        <meshStandardMaterial color="#8e9ba8" roughness={0.85} />
      </mesh>
      {/* Shelf */}
      <mesh position={[0, -0.02, 0.01]} material={m.trim} castShadow receiveShadow>
        <boxGeometry args={[1.06, 0.014, 0.31]} />
      </mesh>

      {/* Two glazed doors, hinged at the outer edges */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.55, 0, 0.17]} rotation={[0, side * doorAngle, 0]}>
          <group position={[-side * 0.275, 0, 0]}>
            <mesh material={m.cabinetDoor} castShadow>
              <boxGeometry args={[0.55, 0.85, 0.022]} />
            </mesh>
            <mesh position={[0, 0, 0.013]} material={m.glassPane}>
              <boxGeometry args={[0.45, 0.74, 0.006]} />
            </mesh>
            <mesh position={[side * -0.22, 0, 0.03]} material={m.steel} castShadow>
              <cylinderGeometry args={[0.006, 0.006, 0.11, 12]} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}

/** The main working bench, with under-bench drawers and a gas tap. */
function Bench(props) {
  const m = useMaterials();
  return (
    <group {...props}>
      {/* Worktop */}
      <mesh position={[0, BENCH.h, 0]} material={m.benchTop} castShadow receiveShadow>
        <boxGeometry args={[BENCH.w, 0.04, BENCH.d]} />
      </mesh>
      {/* Upstand at the back */}
      <mesh position={[0, BENCH.h + 0.05, -BENCH.d / 2 + 0.01]} material={m.benchTop} castShadow>
        <boxGeometry args={[BENCH.w, 0.07, 0.022]} />
      </mesh>
      {/* Carcass */}
      <mesh position={[0, BENCH.h / 2 - 0.02, -0.02]} material={m.cabinet} receiveShadow>
        <boxGeometry args={[BENCH.w - 0.06, BENCH.h - 0.06, BENCH.d - 0.08]} />
      </mesh>
      {/* Drawer fronts */}
      {[-0.85, 0, 0.85].map((x) => (
        <group key={x} position={[x, 0, BENCH.d / 2 - 0.05]}>
          {[0.30, 0.56].map((y) => (
            <group key={y}>
              <mesh position={[0, y, 0]} material={m.cabinetDoor} castShadow>
                <boxGeometry args={[0.72, 0.22, 0.02]} />
              </mesh>
              <mesh position={[0, y, 0.02]} material={m.steel} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.005, 0.005, 0.18, 10]} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
      {/* Gas tap */}
      <group position={[-1.02, BENCH.h + 0.02, -0.26]}>
        <mesh material={m.steel} castShadow>
          <cylinderGeometry args={[0.018, 0.022, 0.05, 14]} />
        </mesh>
        <mesh position={[0, 0.055, 0]} material={m.steel} castShadow>
          <cylinderGeometry args={[0.008, 0.008, 0.07, 12]} />
        </mesh>
        <mesh position={[0, 0.055, 0.03]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.006, 0.006, 0.05, 12]} />
          <meshStandardMaterial color="#c0392b" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

/** Belfast-style sink set into a short return bench. */
function Sink(props) {
  const m = useMaterials();
  return (
    <group {...props}>
      <mesh position={[0, BENCH.h, 0]} material={m.benchTop} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.04, BENCH.d]} />
      </mesh>
      <mesh position={[0, BENCH.h / 2 - 0.02, -0.02]} material={m.cabinet}>
        <boxGeometry args={[0.86, BENCH.h - 0.06, BENCH.d - 0.08]} />
      </mesh>
      {/* Basin recess */}
      <mesh position={[0, BENCH.h + 0.005, 0]}>
        <boxGeometry args={[0.46, 0.03, 0.36]} />
        <meshStandardMaterial color="#e6eaed" roughness={0.35} metalness={0.15} />
      </mesh>
      <mesh position={[0, BENCH.h - 0.08, 0]}>
        <boxGeometry args={[0.44, 0.16, 0.34]} />
        <meshStandardMaterial color="#d3d9de" roughness={0.4} metalness={0.2} side={THREE.BackSide} />
      </mesh>
      {/* Swan-neck tap */}
      <group position={[0, BENCH.h + 0.03, -0.20]}>
        <mesh material={m.steel} castShadow>
          <cylinderGeometry args={[0.014, 0.016, 0.20, 14]} />
        </mesh>
        <mesh position={[0, 0.10, 0.06]} rotation={[Math.PI / 2.6, 0, 0]} material={m.steel} castShadow>
          <cylinderGeometry args={[0.009, 0.009, 0.15, 12]} />
        </mesh>
      </group>
    </group>
  );
}

/** Safety poster / periodic table on the back wall. */
function WallChart({ color = '#20415f', ...props }) {
  return (
    <group {...props}>
      <mesh castShadow>
        <boxGeometry args={[0.9, 0.62, 0.012]} />
        <meshStandardMaterial color="#f6f4ee" roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.24, 0.008]}>
        <planeGeometry args={[0.82, 0.09]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {/* Suggestion of a periodic-table grid */}
      {Array.from({ length: 7 }).map((_, r) =>
        Array.from({ length: 14 }).map((__, c) => (
          <mesh key={`${r}-${c}`} position={[-0.39 + c * 0.06, 0.13 - r * 0.055, 0.008]}>
            <planeGeometry args={[0.05, 0.045]} />
            <meshStandardMaterial
              color={['#7fb3d5', '#f5b041', '#82e0aa', '#f1948a'][(r + c) % 4]}
              roughness={0.9}
            />
          </mesh>
        ))
      )}
    </group>
  );
}

/**
 * Full room. `cupboardOpen` swings the storage cupboard doors so students can
 * see the apparatus they are about to select.
 */
export default function LabRoom({ cupboardOpen = false }) {
  const m = useMaterials();

  return (
    <group>
      {/* ---- Shell ---- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={m.floor} receiveShadow>
        <planeGeometry args={[ROOM.w, ROOM.d]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM.h, 0]} material={m.ceiling}>
        <planeGeometry args={[ROOM.w, ROOM.d]} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, ROOM.h / 2, -ROOM.d / 2]} material={m.wall} receiveShadow>
        <planeGeometry args={[ROOM.w, ROOM.h]} />
      </mesh>
      {/* Side walls */}
      <mesh position={[-ROOM.w / 2, ROOM.h / 2, 0]} rotation={[0, Math.PI / 2, 0]} material={m.wall} receiveShadow>
        <planeGeometry args={[ROOM.d, ROOM.h]} />
      </mesh>
      <mesh position={[ROOM.w / 2, ROOM.h / 2, 0]} rotation={[0, -Math.PI / 2, 0]} material={m.wall} receiveShadow>
        <planeGeometry args={[ROOM.d, ROOM.h]} />
      </mesh>

      {/* ---- Window on the right wall, with daylight coming through ---- */}
      <group position={[ROOM.w / 2 - 0.02, 1.75, 0.4]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh material={m.glassPane}>
          <planeGeometry args={[2.0, 1.15]} />
        </mesh>
        {[-0.67, 0, 0.67].map((x) => (
          <mesh key={x} position={[x, 0, 0.01]} material={m.trim}>
            <boxGeometry args={[0.035, 1.15, 0.03]} />
          </mesh>
        ))}
        <mesh position={[0, 0, 0.01]} material={m.trim}>
          <boxGeometry args={[2.0, 0.035, 0.03]} />
        </mesh>
      </group>

      {/* ---- Furniture ---- */}
      <Bench position={[0, 0, 0]} />
      <Sink position={[-1.95, 0, 0]} />
      <Cupboard open={cupboardOpen} position={[1.55, 1.62, -ROOM.d / 2 + 0.18]} />
      <WallChart position={[-1.2, 1.85, -ROOM.d / 2 + 0.01]} />

      {/* Eyewash station — a small nod to the safety step in the procedure */}
      <group position={[-2.6, 1.35, -ROOM.d / 2 + 0.12]}>
        <mesh castShadow>
          <boxGeometry args={[0.22, 0.30, 0.10]} />
          <meshStandardMaterial color="#1e8449" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0.055]}>
          <planeGeometry args={[0.16, 0.16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </mesh>
      </group>

      {/* ---- Lighting ---- */}
      {/* Soft ambient fill so shadows never go black */}
      <ambientLight intensity={0.42} color="#eef4fb" />
      {/* Cool daylight from the window, casting the main shadows */}
      <directionalLight
        position={[4.2, 3.4, 1.8]}
        intensity={1.25}
        color="#dcecff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={14}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0004}
      />
      {/* Warm strip lights overhead */}
      <CeilingLight position={[-1.1, ROOM.h - 0.08, -0.3]} intensity={0.9} />
      <CeilingLight position={[1.1, ROOM.h - 0.08, -0.3]} intensity={0.9} />
      {/* Gentle bounce from the bench up into the glassware */}
      <pointLight position={[0, 1.35, 0.55]} intensity={0.35} color="#fff4e6" distance={3} />
    </group>
  );
}

export { ROOM, BENCH };
