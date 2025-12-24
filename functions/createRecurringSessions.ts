import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionData, syncToCalendar } = await req.json();

    const startDate = new Date(sessionData.scheduled_date);
    const endDate = new Date(sessionData.recurrence_end_date);
    const sessions = [];
    const parentSessionId = `parent-${Date.now()}`;

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const session = {
        ...sessionData,
        scheduled_date: currentDate.toISOString().split('T')[0],
        meeting_room_id: `room-${Date.now()}-${currentDate.getTime()}`,
        parent_session_id: parentSessionId,
        is_recurring: true
      };

      const created = await base44.asServiceRole.entities.VideoSession.create(session);
      sessions.push(created);

      // Sync to calendar if enabled
      if (syncToCalendar) {
        try {
          await base44.asServiceRole.functions.invoke('syncSessionToCalendar', {
            sessionId: created.id,
            action: 'create'
          });
        } catch (error) {
          console.error('Calendar sync failed for session:', created.id, error);
        }
      }

      // Calculate next occurrence
      switch (sessionData.recurrence_pattern) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'biweekly':
          currentDate.setDate(currentDate.getDate() + 14);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
      }
    }

    return Response.json({ 
      success: true, 
      sessions_created: sessions.length,
      sessions 
    });
  } catch (error) {
    console.error('Error creating recurring sessions:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});