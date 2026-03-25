import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { sessionData, sessionId } = await req.json();

        // Get access token for Google Calendar
        const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');

        // Parse date and time
        const startDateTime = new Date(`${sessionData.scheduled_date}T${sessionData.scheduled_time}:00`);
        const endDateTime = new Date(startDateTime.getTime() + sessionData.duration_minutes * 60000);

        // Create attendees list
        const attendees = (sessionData.invited_students || []).map(email => ({ email }));

        // Create Google Calendar event with Meet link
        const eventData = {
            summary: sessionData.title,
            description: sessionData.description || '',
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
                    requestId: sessionData.meeting_room_id,
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
            'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('Google Calendar API error:', error);
            return Response.json({ 
                error: 'Failed to create Google Meet session',
                details: error 
            }, { status: response.status });
        }

        const calendarEvent = await response.json();
        const meetLink = calendarEvent.hangoutLink;
        const calendarEventId = calendarEvent.id;

        // Update the session with meet link
        if (sessionId) {
            await base44.asServiceRole.entities.VideoSession.update(sessionId, {
                meet_link: meetLink,
                calendar_event_id: calendarEventId
            });
        }

        return Response.json({
            success: true,
            meet_link: meetLink,
            calendar_event_id: calendarEventId,
            event_html_link: calendarEvent.htmlLink
        });

    } catch (error) {
        console.error('Error creating Google Meet session:', error);
        return Response.json({ 
            error: error.message || 'Internal server error' 
        }, { status: 500 });
    }
});