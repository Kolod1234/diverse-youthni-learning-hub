import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, action } = await req.json();

    // Get session details
    const sessions = await base44.entities.VideoSession.filter({ id: sessionId });
    const session = sessions[0];

    if (!session) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get access token for Google Calendar
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');

    if (!accessToken) {
      return Response.json({ 
        error: 'Google Calendar not connected. Please authorize access first.' 
      }, { status: 401 });
    }

    const startDateTime = new Date(`${session.scheduled_date}T${session.scheduled_time}`);
    const endDateTime = new Date(startDateTime.getTime() + session.duration_minutes * 60000);

    // Get all students to add as attendees
    const allUsers = await base44.asServiceRole.entities.User.list();
    const attendees = session.invited_students.map(email => {
      const student = allUsers.find(u => u.email === email);
      return {
        email,
        displayName: student?.full_name || email
      };
    });

    if (action === 'create') {
      // Create calendar event
      const event = {
        summary: session.title,
        description: session.description || '',
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'UTC'
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'UTC'
        },
        attendees: attendees,
        conferenceData: {
          createRequest: {
            requestId: `session-${session.id}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 }
          ]
        }
      };

      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(event)
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Calendar API error: ${error}`);
      }

      const createdEvent = await response.json();

      // Update session with calendar event ID
      await base44.asServiceRole.entities.VideoSession.update(session.id, {
        google_calendar_event_id: createdEvent.id
      });

      return Response.json({ 
        success: true, 
        eventId: createdEvent.id,
        htmlLink: createdEvent.htmlLink
      });
    } else if (action === 'delete' && session.google_calendar_event_id) {
      // Delete calendar event
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${session.google_calendar_event_id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok && response.status !== 404) {
        const error = await response.text();
        throw new Error(`Calendar API error: ${error}`);
      }

      return Response.json({ success: true });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error syncing to calendar:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});