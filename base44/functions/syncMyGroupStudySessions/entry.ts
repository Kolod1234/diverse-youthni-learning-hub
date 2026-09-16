import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { removeGoogleEvent, saveGoogleEvent } from "../../shared/groupStudyCalendar.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection("6a2ff9b66b58a1afd53c7b4c");
    const memberships = await base44.asServiceRole.entities.StudyGroupMember.filter({ member_email: user.email, status: "active" });
    const sessionMap = new Map();
    for (const membership of memberships) {
      const sessions = await base44.asServiceRole.entities.GroupStudySession.filter({ group_id: membership.group_id, status: "scheduled" }, "scheduled_time", 100);
      sessions.forEach((session) => sessionMap.set(session.id, session));
    }
    const organised = await base44.asServiceRole.entities.GroupStudySession.filter({ organizer_email: user.email, status: "scheduled" }, "scheduled_time", 100);
    organised.forEach((session) => sessionMap.set(session.id, session));

    const now = Date.now();
    const upcoming = [...sessionMap.values()].filter((session) => new Date(session.scheduled_time).getTime() > now);
    const mappings = await base44.asServiceRole.entities.GroupSessionCalendarSync.filter({ user_id: user.id });
    let synced = 0;
    for (const session of upcoming) {
      const mapping = mappings.find((item) => item.session_id === session.id);
      const event = await saveGoogleEvent(accessToken, session, mapping?.google_event_id);
      if (mapping) {
        await base44.asServiceRole.entities.GroupSessionCalendarSync.update(mapping.id, { google_event_id: event.id, synced_at: new Date().toISOString() });
      } else {
        await base44.asServiceRole.entities.GroupSessionCalendarSync.create({ session_id: session.id, user_id: user.id, user_email: user.email, google_event_id: event.id, synced_at: new Date().toISOString() });
      }
      synced += 1;
    }

    const upcomingIds = new Set(upcoming.map((session) => session.id));
    for (const mapping of mappings.filter((item) => !upcomingIds.has(item.session_id))) {
      await removeGoogleEvent(accessToken, mapping.google_event_id);
      await base44.asServiceRole.entities.GroupSessionCalendarSync.delete(mapping.id);
    }
    return Response.json({ connected: true, synced });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}