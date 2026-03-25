import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_email, notification_type } = await req.json();

    if (!user_email || !notification_type) {
      return Response.json({ allowed: true }, { status: 200 });
    }

    // Get user preferences
    const prefs = await base44.entities.NotificationPreference.filter({ user_email });

    if (!prefs || prefs.length === 0) {
      // If no preferences set, allow all notifications
      return Response.json({ allowed: true }, { status: 200 });
    }

    const userPrefs = prefs[0];

    // Map notification types to preference keys
    const typeMap = {
      logbook: 'logbook_approvals',
      program: 'program_announcements',
      message: 'mentor_messages',
      activity_reminder: 'activity_reminders',
      quiz: 'quiz_reminders',
      session_reminder: 'session_updates',
      session_started: 'session_updates',
      session_cancelled: 'session_updates',
      course_completion: 'course_completions',
      general: 'system_notifications',
    };

    const prefKey = typeMap[notification_type] || 'system_notifications';
    const allowed = userPrefs[prefKey] !== false;

    return Response.json({ allowed, preference_key: prefKey }, { status: 200 });
  } catch (error) {
    console.error('Error checking notification preferences:', error);
    return Response.json({ allowed: true, error: error.message }, { status: 200 });
  }
});