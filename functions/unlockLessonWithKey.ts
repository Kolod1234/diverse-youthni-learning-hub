import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { key_code, lesson_id, course_id } = await req.json();

    if (!key_code || !lesson_id || !course_id) {
      return Response.json({ error: 'key_code, lesson_id, and course_id are required' }, { status: 400 });
    }

    // Find the key
    const keys = await base44.asServiceRole.entities.LessonUnlockKey.filter({ 
      key_code: key_code.toUpperCase().trim(),
      lesson_id 
    });

    if (keys.length === 0) {
      return Response.json({ error: 'Invalid unlock key for this lesson' }, { status: 404 });
    }

    const key = keys[0];

    // Check if key is already used
    if (key.is_used) {
      return Response.json({ error: 'This key has already been used' }, { status: 400 });
    }

    // Check if key is assigned to specific student
    if (key.assigned_to_email && key.assigned_to_email !== user.email) {
      return Response.json({ error: 'This key is assigned to a different student' }, { status: 403 });
    }

    // Check if key has expired
    if (key.expires_at && new Date(key.expires_at) < new Date()) {
      return Response.json({ error: 'This key has expired' }, { status: 400 });
    }

    // Get or create enrollment
    let enrollments = await base44.entities.Enrollment.filter({ course_id });
    let enrollment = enrollments[0];

    if (!enrollment) {
      enrollment = await base44.entities.Enrollment.create({
        course_id,
        progress_percent: 0,
        completed_lessons: [],
        unlocked_lessons: []
      });
    }

    // Calculate unlock expiry (3 months from now)
    const unlockDate = new Date();
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 3);

    // Add lesson to unlocked_lessons
    const unlockedLessons = enrollment.unlocked_lessons || [];
    
    // Check if already unlocked
    const existingUnlock = unlockedLessons.find(ul => ul.lesson_id === lesson_id);
    if (existingUnlock) {
      return Response.json({ 
        success: true,
        message: 'Lesson was already unlocked',
        unlock_expires_at: existingUnlock.expires_at
      });
    }

    unlockedLessons.push({
      lesson_id,
      unlocked_at: unlockDate.toISOString(),
      expires_at: expiryDate.toISOString(),
      key_code: key.key_code
    });

    // Update enrollment
    await base44.entities.Enrollment.update(enrollment.id, {
      unlocked_lessons: unlockedLessons
    });

    // Mark key as used
    await base44.asServiceRole.entities.LessonUnlockKey.update(key.id, {
      is_used: true,
      used_by: user.email,
      used_date: new Date().toISOString()
    });

    return Response.json({
      success: true,
      message: 'Lesson unlocked successfully!',
      unlock_expires_at: expiryDate.toISOString()
    });

  } catch (error) {
    console.error('Error unlocking lesson:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});