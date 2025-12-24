import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Store active connections in memory
const rooms = new Map();

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action, roomId, sessionId, offer, answer, candidate, userId, message } = body;

    // Try to get user, but don't fail if not authenticated
    let user = null;
    try {
      user = await base44.auth.me();
    } catch (error) {
      console.log('No user authentication:', error.message);
    }

    // Verify session exists
    const sessions = await base44.asServiceRole.entities.VideoSession.filter({ id: sessionId });
    const session = sessions[0];
    
    if (!session) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    // For non-authenticated requests, try to validate using userId/email
    if (!user && userId) {
      // Allow unauthenticated access for now - real apps should validate differently
      console.log('Processing request for userId:', userId);
    }

    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        participants: new Map(),
        messages: []
      });
    }

    const room = rooms.get(roomId);

    switch (action) {
      case 'join':
        room.participants.set(userId, {
          userId,
          email: user?.email || userId,
          name: user?.full_name || 'Guest',
          joinedAt: Date.now()
        });
        
        return Response.json({
          success: true,
          participants: Array.from(room.participants.values())
        });

      case 'leave':
        room.participants.delete(userId);
        return Response.json({ success: true });

      case 'offer':
        return Response.json({ success: true, offer });

      case 'answer':
        return Response.json({ success: true, answer });

      case 'ice-candidate':
        return Response.json({ success: true, candidate });

      case 'get-participants':
        return Response.json({
          participants: Array.from(room.participants.values())
        });

      case 'send-message':
        if (!message) {
          return Response.json({ error: 'Message required' }, { status: 400 });
        }
        const msg = {
          id: Date.now(),
          sender: user?.full_name || 'Guest',
          email: user?.email || userId,
          message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        room.messages.push(msg);
        return Response.json({ success: true, message: msg });

      case 'get-messages':
        return Response.json({ messages: room.messages });

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Signaling error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});