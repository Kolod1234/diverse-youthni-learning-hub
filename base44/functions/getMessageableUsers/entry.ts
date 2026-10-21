import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch all users with service role
        const allUsers = await base44.asServiceRole.entities.User.list('full_name', 1000);

        // Admins and tutors can message everyone except themselves
        const availableUsers = (user.role === 'admin' || user.is_tutor) 
            ? allUsers.filter(u => u.email !== user.email)
            : allUsers.filter(u => {
                // Cannot message yourself
                if (u.email === user.email) return false;
                
                // Everyone can message admins
                if (u.role === 'admin') return true;
                
                // Everyone can message coordinators
                if (u.is_coordinator) return true;
                
                // Non-tutors can message tutors
                if (u.is_tutor && !user.is_tutor) return true;
                
                // Coordinators can message their assigned participants
                if (user.is_coordinator && u.assigned_coordinator_email === user.email) return true;
                
                return false;
            });

        // Send only what a contact list shows, never whole account records.
        const CONTACT_FIELDS = ['id', 'email', 'full_name', 'username', 'avatar', 'role', 'is_tutor', 'is_coordinator'];
        return Response.json(availableUsers.map(u =>
            Object.fromEntries(CONTACT_FIELDS.filter(k => u[k] !== undefined).map(k => [k, u[k]]))));
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});