import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { getParentContext, getUpcomingSchedules } from '../../shared/parentAccess.js';

function nextDate(date) { const value = new Date(`${date}T12:00:00Z`); value.setUTCDate(value.getUTCDate() + 1); return value.toISOString().slice(0, 10); }
function calendarBody(item) {
  if (item.allDay) return { summary: item.title, description: item.description || '', location: item.location || '', start: { date: item.date }, end: { date: nextDate(item.date) }, reminders: { useDefault: true } };
  return { summary: item.title, description: item.description || '', location: item.location || '', start: { dateTime: `${item.date}T${item.time || '09:00'}:00`, timeZone: 'Europe/London' }, end: { dateTime: `${item.date}T${item.endTime}:00`, timeZone: 'Europe/London' }, reminders: { useDefault: false, overrides: [{ method: 'email', minutes: 1440 }, { method: 'popup', minutes: 30 }] } };
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    if (body.action === 'health') return Response.json({ ok: true });
    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection('6a2ff9b66b58a1afd53c7b4c');
    if (body.action !== 'sync') {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(new Date().toISOString())}&maxResults=20&singleEvents=true&orderBy=startTime`, { headers: { Authorization: `Bearer ${accessToken}` } });
      if (!response.ok) throw new Error('Unable to read Google Calendar');
      const data = await response.json();
      return Response.json({ connected: true, events: (data.items || []).map((item) => ({ id: item.id, title: item.summary, start: item.start?.dateTime || item.start?.date })) });
    }
    const context = await getParentContext(base44, user);
    const schedules = await getUpcomingSchedules(base44, context.childEmails);
    const sources = [
      ...schedules.events.map((item) => ({ sourceType: 'event', sourceId: item.id, title: item.title, description: item.description, location: item.online_link || item.location, date: item.date, time: item.start_time, endTime: item.end_time || item.start_time, allDay: !item.start_time })),
      ...schedules.sessions.map((item) => ({ sourceType: 'class', sourceId: item.id, title: item.title, description: item.description, location: item.meet_link, date: item.scheduled_date, time: item.scheduled_time, endTime: endTime(item.scheduled_time, item.duration_minutes || 60) })),
      ...schedules.bookings.map((item) => ({ sourceType: 'booking', sourceId: item.id, title: `${item.subject || item.course_title || 'Tutoring class'} with ${item.tutor_name || 'tutor'}`, description: item.tutor_notes || '', location: item.meeting_link, date: item.booking_date, time: item.booking_time, endTime: endTime(item.booking_time, item.duration_minutes || 60) }))
    ];
    const existing = await base44.asServiceRole.entities.ParentCalendarSync.filter({ parent_user_id: user.id }, '-created_date', 500);
    const syncedKeys = new Set(existing.map((item) => `${item.source_type}:${item.source_id}`));
    let added = 0;
    for (const source of sources.slice(0, 100)) {
      if (syncedKeys.has(`${source.sourceType}:${source.sourceId}`)) continue;
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', { method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(calendarBody(source)) });
      if (!response.ok) continue;
      const event = await response.json();
      await base44.asServiceRole.entities.ParentCalendarSync.create({ parent_user_id: user.id, source_type: source.sourceType, source_id: source.sourceId, google_event_id: event.id, synced_at: new Date().toISOString() });
      added += 1;
    }
    return Response.json({ connected: true, added });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

function endTime(start, minutes) { const [hours, mins] = (start || '09:00').split(':').map(Number); const total = hours * 60 + mins + minutes; return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`; }