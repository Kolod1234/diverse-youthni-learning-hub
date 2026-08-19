/**
 * Titration model for the virtual laboratory.
 *
 * The endpoint is not scripted or time-based: pH is computed from the actual
 * moles of acid and base in the flask, and the indicator colour is derived from
 * that pH. A student who overshoots sees the colour go deep pink because the
 * chemistry says so, which is the behaviour a real practical needs to teach.
 *
 * Default experiment: 25.0 cm3 of 0.100 mol/dm3 NaOH in the flask, titrated
 * with ~0.100 mol/dm3 HCl from the burette, phenolphthalein indicator.
 */

export const EXPERIMENT = {
  analyteVolumeMl: 25.0,      // NaOH pipetted into the flask
  analyteConc: 0.100,         // mol/dm3
  titrantConc: 0.1014,        // mol/dm3 — slightly off 0.1 so titres aren't a round number
  buretteCapacityMl: 50.0,
  indicator: 'phenolphthalein',
};

/** Equivalence point in cm3 — the "correct" titre students are working towards. */
export const equivalenceMl =
  (EXPERIMENT.analyteVolumeMl * EXPERIMENT.analyteConc) / EXPERIMENT.titrantConc;

/**
 * pH of the flask after `addedMl` of acid has been run in.
 * Strong acid into strong base, so we can work directly from excess moles.
 */
export function computePH(addedMl) {
  const Va = addedMl / 1000;                                   // dm3 of titrant
  const Vb = EXPERIMENT.analyteVolumeMl / 1000;                // dm3 of analyte
  const molAcid = Va * EXPERIMENT.titrantConc;
  const molBase = Vb * EXPERIMENT.analyteConc;
  const total = Va + Vb;
  if (total <= 0) return 7;

  const diff = molBase - molAcid;
  const EPS = 1e-9;

  if (diff > EPS) {                       // base still in excess
    const pOH = -Math.log10(diff / total);
    return clamp(14 - pOH, 0, 14);
  }
  if (diff < -EPS) {                      // acid now in excess
    return clamp(-Math.log10(-diff / total), 0, 14);
  }
  return 7;                               // equivalence
}

/**
 * Phenolphthalein colour for a given pH.
 * Colourless below ~8.2, pale pink through the transition, magenta above ~10.
 * Returns a CSS/three-compatible hex string plus the opacity to render at.
 */
export function indicatorColour(pH, hasIndicator) {
  if (!hasIndicator) return { color: '#dff0ff', opacity: 0.55, label: 'colourless' };

  if (pH < 8.2) return { color: '#e6f4ff', opacity: 0.5, label: 'colourless' };
  if (pH > 10.0) return { color: '#d81b7a', opacity: 0.92, label: 'deep pink' };

  // Smooth ramp across the transition range.
  const t = (pH - 8.2) / (10.0 - 8.2);
  const from = [232, 244, 255];
  const to = [216, 27, 122];
  const rgb = from.map((c, i) => Math.round(c + (to[i] - c) * t));
  return {
    color: `#${rgb.map((c) => c.toString(16).padStart(2, '0')).join('')}`,
    opacity: 0.5 + t * 0.42,
    label: t < 0.35 ? 'faintest pink' : t < 0.75 ? 'pale pink' : 'pink',
  };
}

/**
 * Grade a completed titre.
 * A titre counts as accurate if it is within 0.10 cm3 of the true equivalence
 * volume — the tolerance used for concordant results at GCSE.
 */
export function gradeTitre(titreMl) {
  const error = titreMl - equivalenceMl;
  const abs = Math.abs(error);
  if (abs <= 0.10) return { verdict: 'accurate', error, note: 'Within 0.10 cm3 of the true endpoint.' };
  if (error > 0) return {
    verdict: 'overshot',
    error,
    note: `Overshot by ${abs.toFixed(2)} cm3 — the colour went past the faintest permanent pink.`,
  };
  return {
    verdict: 'undershot',
    error,
    note: `Stopped ${abs.toFixed(2)} cm3 early — the pink had not yet persisted on swirling.`,
  };
}

/** Are any two of the recorded titres concordant (within 0.10 cm3)? */
export function concordantSet(titres) {
  const good = [];
  for (let i = 0; i < titres.length; i++) {
    for (let j = i + 1; j < titres.length; j++) {
      if (Math.abs(titres[i] - titres[j]) <= 0.10) {
        if (!good.includes(titres[i])) good.push(titres[i]);
        if (!good.includes(titres[j])) good.push(titres[j]);
      }
    }
  }
  return good;
}

/** Mean of the concordant titres, or null if there is no concordant set yet. */
export function meanTitre(titres) {
  const good = concordantSet(titres);
  if (good.length < 2) return null;
  return good.reduce((a, b) => a + b, 0) / good.length;
}

/**
 * Concentration of the alkali calculated from the student's mean titre,
 * so the results panel can show them the point of the whole experiment.
 */
export function calculatedConcentration(mean) {
  if (!mean) return null;
  const molAcid = (mean / 1000) * EXPERIMENT.titrantConc;
  return molAcid / (EXPERIMENT.analyteVolumeMl / 1000);
}

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

/**
 * The procedure. Steps must be completed in order — `requires` names the
 * step that must be done first, which is what stops students skipping
 * straight to running acid in without rinsing or adding indicator.
 */
export const PROCEDURE = [
  {
    id: 'safety',
    title: 'Put on safety goggles',
    detail: 'Eye protection must be worn before any glassware is handled.',
    hint: 'Click the goggles on the bench.',
  },
  {
    id: 'collect',
    title: 'Collect apparatus from the cupboard',
    detail: 'You need a burette, a pipette, a conical flask and a white tile.',
    hint: 'Open the cupboard and click each item.',
    requires: 'safety',
  },
  {
    id: 'rinse',
    title: 'Rinse the burette with the acid',
    detail: 'Rinsing with the solution it will contain prevents dilution errors.',
    hint: 'Click the burette, then the acid bottle.',
    requires: 'collect',
  },
  {
    id: 'fill',
    title: 'Fill the burette and record the start reading',
    detail: 'Fill above zero, run out to remove the air bubble in the jet, then take the reading from the bottom of the meniscus.',
    hint: 'Click the burette to fill it.',
    requires: 'rinse',
  },
  {
    id: 'pipette',
    title: 'Pipette 25.0 cm3 of alkali into the flask',
    detail: 'Use the volumetric pipette and a safety filler. Touch the tip to the flask wall — do not blow out the last drop.',
    hint: 'Click the pipette, then the flask.',
    requires: 'fill',
  },
  {
    id: 'indicator',
    title: 'Add a few drops of phenolphthalein',
    detail: 'Two or three drops is enough. More indicator does not make the endpoint sharper.',
    hint: 'Click the indicator bottle, then the flask.',
    requires: 'pipette',
  },
  {
    id: 'rough',
    title: 'Run a rough titration',
    detail: 'Add acid quickly to find the approximate endpoint, swirling as you go.',
    hint: 'Hold the burette tap open.',
    requires: 'indicator',
  },
  {
    id: 'accurate',
    title: 'Repeat accurately until you have concordant titres',
    detail: 'Add dropwise near the endpoint. Two titres within 0.10 cm3 of each other are concordant.',
    hint: 'Refill, re-pipette and repeat.',
    requires: 'rough',
  },
  {
    id: 'analyse',
    title: 'Calculate the concentration of the alkali',
    detail: 'Use the mean of your concordant titres.',
    hint: 'Open the results panel.',
    requires: 'accurate',
  },
];
