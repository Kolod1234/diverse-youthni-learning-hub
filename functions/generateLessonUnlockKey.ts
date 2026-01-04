import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && !user.is_tutor)) {
      return Response.json({ error: 'Unauthorized - Admin or Tutor only' }, { status: 403 });
    }

    const { lesson_id, course_id, assigned_to_email, key_count } = await req.json();

    if (!lesson_id || !course_id) {
      return Response.json({ error: 'lesson_id and course_id are required' }, { status: 400 });
    }

    // Generate unique key codes
    const generateKeyCode = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const segments = 3;
      const segmentLength = 4;
      
      const parts = [];
      for (let i = 0; i < segments; i++) {
        let segment = '';
        for (let j = 0; j < segmentLength; j++) {
          segment += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        parts.push(segment);
      }
      return parts.join('-');
    };

    const count = key_count || 1;
    const generatedKeys = [];

    for (let i = 0; i < count; i++) {
      const keyCode = generateKeyCode();
      
      const key = await base44.asServiceRole.entities.LessonUnlockKey.create({
        key_code: keyCode,
        lesson_id,
        course_id,
        assigned_to_email: assigned_to_email || null,
        generated_by: user.email,
        is_used: false
      });

      generatedKeys.push(key);
    }

    return Response.json({
      success: true,
      keys: generatedKeys,
      message: `Generated ${count} unlock key(s)`
    });

  } catch (error) {
    console.error('Error generating unlock key:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});