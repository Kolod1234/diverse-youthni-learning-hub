/**
 * Lathe profiles for laboratory glassware.
 *
 * Nearly all lab glassware is a surface of revolution, so each item is defined
 * as a 2-D silhouette (x = radius, y = height, both in metres) which three.js
 * revolves into a mesh. This keeps the geometry exact and the payload tiny —
 * no model files to download — and gives clean normals for glass refraction.
 *
 * Dimensions follow real apparatus so the bench reads at a believable scale:
 *   - 50 ml burette: ~0.50 m of graduated barrel, 8 mm bore
 *   - 250 ml conical (Erlenmeyer) flask: 85 mm base, 140 mm tall
 *   - 250 ml beaker: 70 mm diameter, 95 mm tall
 *   - 25 ml volumetric pipette: 400 mm, with the classic central bulb
 */
import * as THREE from 'three';

/** Build a smooth profile through the given [radius, height] pairs. */
function profile(points, smoothing = 0) {
  const vecs = points.map(([x, y]) => new THREE.Vector2(x, y));
  if (smoothing <= 0) return vecs;
  // Resample through a spline so curved shoulders (flask, pipette bulb) are smooth.
  const curve = new THREE.SplineCurve(vecs);
  return curve.getPoints(vecs.length * smoothing);
}

/** 50 ml burette: tapered tip, long graduated barrel, small filling funnel. */
export const buretteProfile = profile([
  [0.0000, 0.000],
  [0.0016, 0.004], // jet tip
  [0.0022, 0.020],
  [0.0030, 0.040],
  [0.0075, 0.070], // shoulder up into the barrel
  [0.0080, 0.090],
  [0.0080, 0.560], // graduated barrel
  [0.0074, 0.575],
  [0.0100, 0.596], // flared mouth
  [0.0098, 0.600],
], 3);

/** 250 ml conical flask: flat base, straight cone, short neck with a lip. */
export const flaskProfile = profile([
  [0.0000, 0.000],
  [0.0420, 0.000], // base rim
  [0.0425, 0.004],
  [0.0410, 0.010],
  [0.0380, 0.030], // cone begins
  [0.0300, 0.062],
  [0.0215, 0.090],
  [0.0160, 0.108], // shoulder
  [0.0130, 0.118],
  [0.0128, 0.135], // neck
  [0.0150, 0.140], // lip
  [0.0142, 0.142],
], 4);

/** 250 ml beaker: straight wall, rolled rim, pouring spout added separately. */
export const beakerProfile = profile([
  [0.0000, 0.000],
  [0.0340, 0.000],
  [0.0348, 0.006],
  [0.0350, 0.088],
  [0.0362, 0.094], // rolled rim
  [0.0352, 0.096],
], 2);

/** 25 ml volumetric pipette: fine tip, central bulb, calibration stem. */
export const pipetteProfile = profile([
  [0.0000, 0.000],
  [0.0012, 0.010],
  [0.0030, 0.060],
  [0.0035, 0.120],
  [0.0140, 0.165], // bulb swells
  [0.0155, 0.200],
  [0.0140, 0.235],
  [0.0035, 0.280], // back to the stem
  [0.0035, 0.380],
  [0.0042, 0.396], // mouthpiece
  [0.0038, 0.400],
], 4);

/** Test tube: rounded base, straight wall, slight lip. */
export const testTubeProfile = profile([
  [0.0000, 0.0000],
  [0.0060, 0.0022],
  [0.0080, 0.0075],
  [0.0080, 0.1180],
  [0.0088, 0.1230],
  [0.0080, 0.1250],
], 3);

/** Reagent bottle: squat shoulders and a ground-glass stopper neck. */
export const bottleProfile = profile([
  [0.0000, 0.000],
  [0.0280, 0.000],
  [0.0285, 0.005],
  [0.0285, 0.085],
  [0.0230, 0.105], // shoulder
  [0.0110, 0.120],
  [0.0108, 0.140],
  [0.0125, 0.145],
], 4);

/**
 * The inner surface of a vessel, used to render liquid.
 * Shrinks the profile by the glass wall thickness and truncates it at `fill`
 * (0..1 of the vessel's height) so the liquid meniscus sits at the right level.
 */
export function liquidProfile(source, fill, wall = 0.0015) {
  if (fill <= 0) return null;
  const maxY = source[source.length - 1].y;
  const targetY = maxY * fill;
  const pts = [];
  for (const p of source) {
    if (p.y > targetY) break;
    pts.push(new THREE.Vector2(Math.max(0, p.x - wall), p.y));
  }
  if (pts.length < 2) return null;
  // Cap the liquid with a flat surface at the fill line.
  const last = pts[pts.length - 1];
  pts.push(new THREE.Vector2(Math.max(0, last.x - 0.0002), targetY));
  pts.push(new THREE.Vector2(0, targetY));
  return pts;
}

/** Volume of a lathe profile in litres — used to convert fill level to ml. */
export function profileVolumeLitres(points) {
  let v = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const h = b.y - a.y;
    if (h <= 0) continue;
    // Frustum of a cone.
    v += (Math.PI * h * (a.x * a.x + a.x * b.x + b.x * b.x)) / 3;
  }
  return v * 1000; // m³ -> litres
}
