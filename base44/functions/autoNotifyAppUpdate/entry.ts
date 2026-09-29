import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const payload = await req.json();
  const { event, data, old_data } = payload;

  // Only proceed if this is a create or update event
  if (!data || !data.id) {
    return Response.json({ skipped: true, reason: 'No version id in payload' });
  }

  // Load the authoritative record from the database. Never trust caller-
  // supplied email content (version_name, release_notes, apk_url) — a direct
  // HTTP caller could otherwise mass-mail attacker-controlled HTML. The
  // entity-trigger workflow passes the real record id, so this preserves it.
  let version;
  try {
    version = await base44.asServiceRole.entities.AppVersion.get(data.id);
  } catch {
    return Response.json({ skipped: true, reason: 'AppVersion record not found' });
  }
  if (!version) {
    return Response.json({ skipped: true, reason: 'AppVersion record not found' });
  }

  // Only send notifications if notify_users is true AND is_active is true
  if (!version.notify_users || !version.is_active) {
    return Response.json({ skipped: true, reason: 'notify_users or is_active not set' });
  }

  // For updates, only send if notify_users just became true (avoid re-sending on unrelated updates)
  if (event?.type === 'update' && old_data?.notify_users === true) {
    return Response.json({ skipped: true, reason: 'notify_users was already true before this update' });
  }

  // Restrict the download link to https to prevent phishing/malware links.
  if (version.apk_url) {
    try {
      if (new URL(version.apk_url).protocol !== 'https:') {
        return Response.json({ skipped: true, reason: 'apk_url must be an https URL' });
      }
    } catch {
      return Response.json({ skipped: true, reason: 'apk_url is not a valid URL' });
    }
  }

  // Get all users
  const users = await base44.asServiceRole.entities.User.list();

  let sent = 0;
  for (const u of users) {
    if (!u.email) continue;
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: u.email,
      subject: `📱 App Update Available – Version ${version.version_name}`,
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #003366;">📱 New App Version Available!</h2>
          <p>Hi ${u.full_name || 'there'},</p>
          <p>A new version of the <strong>Diverse Youth NI</strong> app is now available to download.</p>
          <table style="width:100%; border-collapse: collapse; margin: 16px 0; background: #f8fafc; border-radius: 8px;">
            <tr>
              <td style="padding: 10px 12px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Version</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0;">${version.version_name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Version Code</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0;">${version.version_code}</td>
            </tr>
            ${version.release_notes ? `
            <tr>
              <td style="padding: 10px 12px; font-weight: bold; vertical-align: top;">What's New</td>
              <td style="padding: 10px 12px; white-space: pre-wrap;">${version.release_notes}</td>
            </tr>` : ''}
          </table>
          <a href="${version.apk_url}" style="display: inline-block; background: #003366; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 8px; font-size: 16px;">
            ⬇️ Download Update
          </a>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">
            You're receiving this because you have an account on the Diverse Youth NI platform.
          </p>
        </div>
      `
    });
    sent++;
  }

  // Mark notify_users as false so it doesn't re-trigger on future unrelated updates
  await base44.asServiceRole.entities.AppVersion.update(version.id, { notify_users: false });

  return Response.json({ success: true, emails_sent: sent });
});