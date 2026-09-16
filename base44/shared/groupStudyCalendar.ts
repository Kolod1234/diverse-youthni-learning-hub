export function groupSessionEvent(session) {
  const start = new Date(session.scheduled_time);
  const end = new Date(start.getTime() + (session.duration_minutes || 60) * 60000);
  return {
    summary: session.title,
    description: session.description || "",
    start: { dateTime: start.toISOString(), timeZone: "UTC" },
    end: { dateTime: end.toISOString(), timeZone: "UTC" },
    reminders: { useDefault: false, overrides: [{ method: "email", minutes: 1440 }] },
    extendedProperties: { private: { base44GroupStudySessionId: session.id } }
  };
}

export async function saveGoogleEvent(accessToken, session, eventId) {
  const save = (id) => fetch(id
    ? `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(id)}`
    : "https://www.googleapis.com/calendar/v3/calendars/primary/events", {
    method: id ? "PUT" : "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(groupSessionEvent(session))
  });
  let response = await save(eventId);
  if (eventId && (response.status === 404 || response.status === 410)) response = await save(null);
  if (!response.ok) throw new Error(`Google Calendar sync failed (${response.status})`);
  return await response.json();
}

export async function removeGoogleEvent(accessToken, eventId) {
  if (!eventId) return;
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!response.ok && response.status !== 404 && response.status !== 410) {
    throw new Error(`Google Calendar removal failed (${response.status})`);
  }
}