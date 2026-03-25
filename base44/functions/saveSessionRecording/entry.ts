import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, recordingUrl, duration, chatLog, transcript } = await req.json();

    // Get session details
    const session = await base44.entities.VideoSession.get(sessionId);

    if (!session) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    // Only tutor or admin can save recordings
    if (user.email !== session.tutor_email && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Create recording record
    const recording = await base44.asServiceRole.entities.SessionRecording.create({
      session_id: sessionId,
      title: session.title,
      recording_url: recordingUrl,
      duration_seconds: duration,
      chat_log: chatLog || [],
      transcript: transcript || '',
      view_count: 0,
      is_public: false
    });

    // Update session with recording reference
    await base44.asServiceRole.entities.VideoSession.update(sessionId, {
      recording_url: recordingUrl,
      status: 'completed'
    });

    // Track xAPI statement for session completion
    await base44.asServiceRole.entities.xAPIStatement.create({
      actor: {
        objectType: 'Agent',
        name: user.full_name,
        mbox: `mailto:${user.email}`
      },
      verb: {
        id: 'http://adlnet.gov/expapi/verbs/completed',
        display: { 'en-US': 'completed' }
      },
      object: {
        objectType: 'Activity',
        id: sessionId,
        definition: {
          name: { 'en-US': session.title },
          type: 'http://adlnet.gov/expapi/activities/meeting'
        }
      },
      result: {
        duration: `PT${Math.floor(duration / 60)}M${duration % 60}S`,
        completion: true
      },
      timestamp: new Date().toISOString(),
      course_id: session.course_id
    });

    return Response.json({ 
      success: true, 
      recordingId: recording.id,
      message: 'Recording saved successfully'
    });
  } catch (error) {
    console.error('Error saving recording:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});