// Single source of truth for classifying VideoSession records as upcoming/active
// vs past. Used by TutorDashboardOverview, TutorSessionsDashboard, and the
// Schedule Session upcoming widget so all three stay consistent.
//
// Rules (per spec, 15 June 2026):
//  - Parse local start from scheduled_date + 'T' + scheduled_time. Never parse
//    date-only values for upcoming decisions.
//  - End = start + (duration_minutes || 60) minutes.
//  - Active/upcoming = (scheduled OR live) AND end >= now. Includes currently
//    running sessions.
//  - Past = completed/cancelled, OR (scheduled/live whose end < now).
//  - Sessions without parseable start time fall back to status only:
//      live -> active, scheduled -> active, completed/cancelled -> past.

const DEFAULT_DURATION_MIN = 60;

export function getSessionStart(s) {
  if (!s?.scheduled_date || !s?.scheduled_time) return null;
  const d = new Date(`${s.scheduled_date}T${s.scheduled_time}`);
  return isNaN(d.getTime()) ? null : d;
}

export function getSessionEnd(s) {
  const start = getSessionStart(s);
  if (!start) return null;
  const mins = Number(s.duration_minutes) > 0 ? Number(s.duration_minutes) : DEFAULT_DURATION_MIN;
  return new Date(start.getTime() + mins * 60000);
}

export function isUpcomingOrActive(s, now = new Date()) {
  if (!s) return false;
  if (s.status === 'completed' || s.status === 'cancelled') return false;
  const end = getSessionEnd(s);
  if (!end) {
    // No parseable time — trust status. live/scheduled stay visible.
    return s.status === 'live' || s.status === 'scheduled';
  }
  return end.getTime() >= now.getTime();
}

export function isPast(s, now = new Date()) {
  if (!s) return false;
  if (s.status === 'completed' || s.status === 'cancelled') return true;
  const end = getSessionEnd(s);
  if (!end) return false;
  return end.getTime() < now.getTime();
}

function sortByStartAsc(a, b) {
  const aS = getSessionStart(a)?.getTime() ?? 0;
  const bS = getSessionStart(b)?.getTime() ?? 0;
  return aS - bS;
}

function sortByStartDesc(a, b) {
  const aS = getSessionStart(a)?.getTime() ?? 0;
  const bS = getSessionStart(b)?.getTime() ?? 0;
  return bS - aS;
}

export function classifySessions(sessions = [], now = new Date()) {
  const upcoming = sessions.filter(s => isUpcomingOrActive(s, now)).sort(sortByStartAsc);
  const past = sessions.filter(s => isPast(s, now)).sort(sortByStartDesc);
  return { upcoming, past };
}

// Active/upcoming sessions whose start date is today (local). Used for the
// "Today" banner. Excludes completed/cancelled/expired by construction.
export function getTodayActiveSessions(sessions = [], now = new Date()) {
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return sessions
    .filter(s => isUpcomingOrActive(s, now) && s.scheduled_date === todayKey)
    .sort(sortByStartAsc);
}