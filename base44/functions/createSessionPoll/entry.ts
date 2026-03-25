import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, question, options } = await req.json();

    // Get session to verify user is tutor
    const session = await base44.entities.VideoSession.get(sessionId);

    if (user.email !== session.tutor_email && user.role !== 'admin') {
      return Response.json({ error: 'Only session host can create polls' }, { status: 403 });
    }

    // Create poll as a system message in chat
    const poll = await base44.asServiceRole.entities.SessionChat.create({
      session_id: sessionId,
      sender_email: 'system',
      sender_name: 'Poll',
      message: JSON.stringify({
        type: 'poll',
        question,
        options: options.map(opt => ({ text: opt, votes: 0 })),
        voters: []
      }),
      message_type: 'system',
      is_pinned: true
    });

    return Response.json({ 
      success: true, 
      pollId: poll.id,
      message: 'Poll created and pinned to chat'
    });
  } catch (error) {
    console.error('Error creating poll:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});