import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { removeGoogleEvent, saveGoogleEvent } from "../../shared/groupStudyCalendar.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    if (body.dryRun === true) return Response.json({ status: "ready" });
    const changed = body.changed_fields || [];
    if (body.event?.type === "update" && changed.length && changed.every((field) => ["google_calendar_event_id", "calendar_synced_at", "calendar_sync_error"].includes(field))) {
      return Response.json({ status: "metadata_update_skipped" });
    }

    const session = body.data || body.old_data;
    if (!session?.id) return Response.json({ error: "Session data is required" }, { status: 400 });
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("googlecalendar");
    const shouldRemove = body.event?.type === "delete" || session.status === "cancelled";

    if (shouldRemove) {
      await removeGoogleEvent(accessToken, session.google_calendar_event_id);
      return Response.json({ status: "removed" });
    }

    const event = await saveGoogleEvent(accessToken, session, session.google_calendar_event_id);
    await base44.asServiceRole.entities.GroupStudySession.update(session.id, {
      google_calendar_event_id: event.id,
      calendar_synced_at: new Date().toISOString(),
      calendar_sync_error: ""
    });
    return Response.json({ status: "synced", eventId: event.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}