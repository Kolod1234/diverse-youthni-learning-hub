import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { sessionData, sessionId } = await req.json();

        // Get access token for Google Calendar (shared connector)
        const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');

        if (!accessToken) {
            return Response.json({
                error: 'Google Calendar is not connected. Please ask the workspace admin to connect Google Calendar.'
            }, { status: 400 });
        }

        // Parse date and time
        const startDateTime = new Date(`${sessionData.scheduled_date}T${sessionData.scheduled_time}:00`);
        const endDateTime = new Date(startDateTime.getTime() + (sessionData.duration_minutes || 60) * 60000);

        // Create attendees list (exclude empty/null emails)
        // Include the tutor (current user) so the event appears on their personal Google Calendar
        // via the email invite — they can "Add to calendar" with one click from their inbox.
        const tutorEmail = sessionData.tutor_email || user.email;
        const studentEmails = (sessionData.invited_students || [])
            .filter(email => email && typeof email === 'string');
        const attendeeEmails = Array.from(new Set([tutorEmail, ...studentEmails].filter(Boolean)));
        const attendees = attendeeEmails.map(email => ({
            email,
            ...(email === tutorEmail ? { organizer: true, responseStatus: 'accepted' } : {})
        }));

        // Create Google Calendar event with Meet link
        const requestId = sessionData.meeting_room_id || `meet-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

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
                    requestId: requestId,
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
        // hangoutLink is the primary Meet URL; fall back to conferenceData entry points if missing.
        const meetLink = calendarEvent.hangoutLink
            || calendarEvent.conferenceData?.entryPoints?.find(e => e.entryPointType === 'video')?.uri
            || null;
        const calendarEventId = calendarEvent.id;

        if (!meetLink) {
            console.error('No Meet link returned by Google. Event:', JSON.stringify(calendarEvent));
            return Response.json({
                error: 'Google did not return a Meet link for this event. Please try again.'
            }, { status: 502 });
        }

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