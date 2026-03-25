import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Called by the Android app on startup to check if an update is available.
// POST body: { version_code: <number> }
// Returns: { update_available, force_update, latest_version, latest_version_code, apk_url, release_notes }
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const { version_code } = await req.json();

  if (version_code === undefined || version_code === null) {
    return Response.json({ error: 'version_code is required' }, { status: 400 });
  }

  // Get the active version
  const versions = await base44.asServiceRole.entities.AppVersion.filter({ is_active: true }, '-created_date', 1);
  const active = versions[0];

  if (!active) {
    return Response.json({ update_available: false });
  }

  const update_available = active.version_code > Number(version_code);

  return Response.json({
    update_available,
    force_update: update_available && !!active.force_update,
    latest_version: active.version_name,
    latest_version_code: active.version_code,
    apk_url: update_available ? active.apk_url : null,
    release_notes: update_available ? (active.release_notes || null) : null,
  });
});