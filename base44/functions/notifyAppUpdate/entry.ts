import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { version_id } = await req.json();

  // Get the version info
  const version = await base44.asServiceRole.entities.AppVersion.get(version_id);
  if (!version) {
    return Response.json({ error: 'Version not found' }, { status: 404 });
  }

  // Get all users
  const users = await base44.asServiceRole.entities.User.list();

  let sent = 0;
  for (const u of users) {
    if (!u.email) continue;
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: u.email,
      subject: `App Update Available - Version ${version.version_name}`,
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #003366;">📱 New App Version Available!</h2>
          <p>Hi ${u.full_name || 'there'},</p>
          <p>A new version of the <strong>Diverse Youth NI</strong> app is now available.</p>
          <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
            <tr>
              <td style="padding: 8px; background: #f5f5f5; font-weight: bold;">Version</td>
              <td style="padding: 8px;">${version.version_name}</td>
            </tr>
            ${version.release_notes ? `
            <tr>
              <td style="padding: 8px; background: #f5f5f5; font-weight: bold;">What's New</td>
              <td style="padding: 8px;">${version.release_notes}</td>
            </tr>` : ''}
          </table>
          <a href="${version.apk_url}" style="display: inline-block; background: #003366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 8px;">
            Download Update
          </a>
          <p style="color: #666; font-size: 13px; margin-top: 24px;">
            You're receiving this email because you have an account on the Diverse Youth NI platform.
          </p>
        </div>
      `
    });
    sent++;
  }

  return Response.json({ success: true, emails_sent: sent });
});