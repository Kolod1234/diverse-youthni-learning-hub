// Probes whether the CURRENT app user has an active app-user OAuth grant for the
// "Tutor Google Calendar" connector. Returns { connected: boolean, email?: string }.
// Connected = a real access token was returned by the platform AND a lightweight
// Google API call succeeds with it. No reliance on client-set booleans.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TUTOR_GCAL_CONNECTOR_ID = '6a2ff9b66b58a1afd53c7b4c';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let accessToken = null;
        try {
            const conn = await base44.connectors.getCurrentAppUserConnection(TUTOR_GCAL_CONNECTOR_ID);
            accessToken = conn?.accessToken || null;
        } catch (_) {
            // No grant for this user — treated as disconnected.
        }

        if (!accessToken) {
            return Response.json({ connected: false });
        }

        // Verify the token actually works against Google (catches revoked / expired grants).
        const probe = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!probe.ok) {
            return Response.json({ connected: false });
        }

        const info = await probe.json();
        return Response.json({ connected: true, email: info.email || null });
    } catch (error) {
        return Response.json({ error: error.message || 'Internal error' }, { status: 500 });
    }
});