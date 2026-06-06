import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Sends a re-engagement email to students who have had no enrollment activity
// in the last 7+ days. Avoids re-sending within a 14-day cooldown window.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Admin gate (scheduled automations run as admin, but guard direct calls too)
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const now = new Date();
    const INACTIVITY_DAYS = 7;
    const COOLDOWN_DAYS = 14;
    const inactivityCutoff = new Date(now.getTime() - INACTIVITY_DAYS * 24 * 60 * 60 * 1000);
    const cooldownCutoff = new Date(now.getTime() - COOLDOWN_DAYS * 24 * 60 * 60 * 1000);

    // Pull recent enrollments (paginate to avoid memory blow-ups)
    const PAGE = 200;
    let skip = 0;
    const latestActivityByUser = new Map(); // email -> { lastActivity: Date, courseId }

    while (true) {
      const batch = await base44.asServiceRole.entities.Enrollment.list('-updated_date', PAGE, skip);
      if (!batch || batch.length === 0) break;

      for (const e of batch) {
        if (!e.created_by || e.is_completed) continue;
        const last = e.updated_date ? new Date(e.updated_date) : null;
        if (!last) continue;
        const existing = latestActivityByUser.get(e.created_by);
        if (!existing || last > existing.lastActivity) {
          latestActivityByUser.set(e.created_by, { lastActivity: last, courseId: e.course_id });
        }
      }

      if (batch.length < PAGE) break;
      skip += PAGE;
      if (skip > 5000) break; // safety cap
    }

    // Filter to users whose latest activity is older than the cutoff
    const candidates = [];
    for (const [email, info] of latestActivityByUser.entries()) {
      if (info.lastActivity < inactivityCutoff) {
        candidates.push({ email, ...info });
      }
    }

    if (candidates.length === 0) {
      return Response.json({ success: true, message: 'No inactive students found', sent: 0 });
    }

    // Load user records to get names + skip suspended users and opted-out users
    const users = await base44.asServiceRole.entities.User.list('-created_date', 1000);
    const userByEmail = new Map(users.map(u => [u.email, u]));

    let sent = 0;
    let skipped = 0;
    const errors = [];

    for (const c of candidates) {
      const u = userByEmail.get(c.email);
      if (!u) { skipped++; continue; }
      if (u.is_suspended) { skipped++; continue; }
      if (u.disable_inactivity_emails === true) { skipped++; continue; }

      // Cooldown check
      const lastReminder = u.last_inactivity_email_at ? new Date(u.last_inactivity_email_at) : null;
      if (lastReminder && lastReminder > cooldownCutoff) { skipped++; continue; }

      const daysInactive = Math.floor((now - c.lastActivity) / (24 * 60 * 60 * 1000));
      const firstName = (u.full_name || '').split(' ')[0] || 'there';

      const subject = `We miss you, ${firstName} — your learning is waiting 📚`;
      const body = `Hi ${firstName},

It's been ${daysInactive} days since you last picked up where you left off — your courses are still here, ready when you are!

Even just 10 minutes a day makes a real difference. Small steps, big results.

👉 Jump back in: https://diverseyouthni.org/Dashboard

If now isn't the right time, no worries — we're here whenever you're ready.

Keep going,
The Diverse Youth NI Team

—
You can manage these reminders from your profile settings.`;

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: c.email,
          subject,
          body,
          from_name: 'Diverse Youth NI',
        });
        await base44.asServiceRole.entities.User.update(u.id, {
          last_inactivity_email_at: now.toISOString(),
        });
        sent++;
      } catch (err) {
        errors.push({ email: c.email, error: err.message });
      }
    }

    return Response.json({
      success: true,
      candidates: candidates.length,
      sent,
      skipped,
      errors: errors.slice(0, 20),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});