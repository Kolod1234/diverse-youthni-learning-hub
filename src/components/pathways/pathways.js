import { base44 } from '@/api/base44Client';

// Stage 1 (pathway-led site): the one list of pathways. The chooser, the hub on Home and the
// menu all read from here, so a pathway is added or renamed in one place.
//
// A pathway decides what the menu and hub show FIRST. It never locks a page: every pathway's
// pages stay reachable, and the real protection stays in the data access rules.
export const PATHWAYS = [
  {
    id: 'learning',
    label: 'GCSE & A-Level',
    short: 'Study',
    description: 'Courses, lessons, quizzes, past papers and live sessions.',
    start: 'Dashboard',
    image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69418fc30769c7d951368216/73bf1b641_PXL_20250405_120925148.jpg',
  },
  {
    id: 'youth_work',
    label: 'Youth Work (OCN)',
    short: 'Youth Work',
    description: 'OCN qualifications, workbook tasks and certification.',
    start: 'YouthWork',
    about: 'YouthWorkLanding',
    image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69418fc30769c7d951368216/adfaefdeb_PXL_20240718_134233296PORTRAIT.jpg',
  },
  {
    id: 'leadership',
    label: 'Leadership Programme',
    short: 'Leadership',
    description: 'Mentoring, weekly activities, logbooks and personal development.',
    start: 'Programs',
    about: 'LeadershipLanding',
    image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69418fc30769c7d951368216/bba9d6785_DSC00124.jpg',
  },
];

// One pathway per person for now (no new data format until the supervisor decides).
// Turning this on lets people pick several; they are then saved as "learning,youth_work"
// in the same field, and everything below already reads that form.
export const ALLOW_SEVERAL_PATHWAYS = false;

const VALID = new Set(PATHWAYS.map(p => p.id));

export const pathwayById = (id) => PATHWAYS.find(p => p.id === id) || null;

/** The pathways a signed-in user chose, in the order they chose them. `guest` and unknown values are ignored. */
export function getPathways(user) {
  const raw = user?.interest_type;
  if (!raw || typeof raw !== 'string') return [];
  return [...new Set(raw.split(',').map(s => s.trim()).filter(id => VALID.has(id)))];
}

/** Saves the signed-in user's own choice (the same field the chooser has always written). */
export async function savePathways(ids) {
  const clean = ids.filter(id => VALID.has(id));
  if (!clean.length) return;
  const value = ALLOW_SEVERAL_PATHWAYS ? clean.join(',') : clean[0];
  await base44.auth.updateMe({ interest_type: value });
}

// A visitor who picked a pathway before signing in: the chooser keeps it here until they are back.
export const PENDING_KEY = 'pending_interest';
export function takePendingPathway() {
  try {
    const id = localStorage.getItem(PENDING_KEY);
    localStorage.removeItem(PENDING_KEY);
    return VALID.has(id) ? id : null;
  } catch {
    return null;
  }
}
