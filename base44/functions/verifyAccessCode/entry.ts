// NEW server function: verifyAccessCode
// Replaces the browser-side "password" gates:
//   - course access password  (fallback value is visible in the public JavaScript; unlocked by
//                              setting sessionStorage "course_access_granted" = "true")
//   - coordinator password    (same problem; sessionStorage "coordinator_access")
// The codes now live in Base44 Secrets and are checked on the server. The result is stored on
// the user record, which the browser cannot change for itself.
//
// Setup: add Secrets COURSE_ACCESS_CODE and COORDINATOR_ACCESS_CODE (new values, not the old ones).
//
// Frontend change:
//   const res = await base44.functions.invoke("verifyAccessCode", { type: "course", code });
//   if (res.data.ok) { await refetchUser(); }   // then show the content
//   Gate check:  user.role === "admin" || user.course_access_granted === true
//   Coordinator: user.is_coordinator && !user.coordinator_banned && user.coordinator_access_granted === true
//   Remove every sessionStorage.getItem/setItem("course_access_granted" | "coordinator_access").
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const TYPES = {
  course: { secret: 'COURSE_ACCESS_CODE', field: 'course_access_granted' },
  coordinator: { secret: 'COORDINATOR_ACCESS_CODE', field: 'coordinator_access_granted', requiresCoordinator: true },
  // Opens the "become a coordinator" request form only; grants nothing (an admin still approves the request).
  coordinatorRequest: { secret: 'COORDINATOR_ACCESS_CODE', field: null },
};

// Constant-time comparison so the code can't be guessed from response timing.
function safeEqual(a, b) {
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { type, code } = await req.json();
    const cfg = TYPES[type];
    if (!cfg || typeof code !== 'string') return Response.json({ error: 'Bad request' }, { status: 400 });
    if (cfg.requiresCoordinator && (user.is_coordinator !== true || user.coordinator_banned)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const expected = Deno.env.get(cfg.secret);
    if (!expected) return Response.json({ error: 'Access code not configured' }, { status: 500 });

    // Slow down guessing.
    await new Promise((r) => setTimeout(r, 400));
    if (!safeEqual(code.trim(), expected)) return Response.json({ ok: false }, { status: 200 });

    if (cfg.field) await base44.asServiceRole.entities.User.update(user.id, { [cfg.field]: true });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
