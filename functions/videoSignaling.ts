import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// In-memory storage for session data
const sessionData = new Map();

const getSessionData = (sessionId) => {
  if (!sessionData.has(sessionId)) {
    sessionData.set(sessionId, {
      participants: [],
      messages: [],
      polls: [],
      questions: [],
      notes: { content: '', editors: [], updated_at: null }
    });
  }
  return sessionData.get(sessionId);
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action, roomId, sessionId, userId } = body;

    const data = getSessionData(sessionId);

    switch (action) {
      case 'join': {
        const participant = {
          userId,
          name: body.name || userId,
          email: userId,
          joinedAt: new Date().toISOString()
        };
        
        if (!data.participants.find(p => p.userId === userId)) {
          data.participants.push(participant);
        }
        
        return Response.json({ participants: data.participants });
      }

      case 'leave': {
        data.participants = data.participants.filter(p => p.userId !== userId);
        return Response.json({ success: true });
      }

      case 'get-participants': {
        return Response.json({ participants: data.participants });
      }

      case 'send-message': {
        const message = {
          id: Date.now().toString(),
          sender: body.name || userId,
          message: body.message,
          timestamp: new Date().toLocaleTimeString()
        };
        data.messages.push(message);
        return Response.json({ message });
      }

      case 'get-messages': {
        return Response.json({ messages: data.messages });
      }

      // Polling actions
      case 'create-poll': {
        const poll = {
          id: Date.now().toString(),
          question: body.question,
          options: body.options,
          votes: new Array(body.options.length).fill(0),
          closed: false,
          voters: []
        };
        data.polls.push(poll);
        return Response.json({ poll });
      }

      case 'get-polls': {
        return Response.json({ polls: data.polls });
      }

      case 'vote-poll': {
        const poll = data.polls.find(p => p.id === body.pollId);
        if (poll && !poll.closed && !poll.voters.includes(userId)) {
          poll.votes[body.optionIndex]++;
          poll.voters.push(userId);
        }
        return Response.json({ poll });
      }

      case 'close-poll': {
        const poll = data.polls.find(p => p.id === body.pollId);
        if (poll) {
          poll.closed = true;
        }
        return Response.json({ poll });
      }

      // Q&A actions
      case 'ask-question': {
        const question = {
          id: Date.now().toString(),
          question: body.question,
          asker_name: body.askerName,
          asker_id: userId,
          upvotes: 0,
          upvoters: [],
          is_answered: false,
          answer: null,
          timestamp: new Date().toISOString()
        };
        data.questions.push(question);
        return Response.json({ question });
      }

      case 'get-questions': {
        return Response.json({ questions: data.questions });
      }

      case 'upvote-question': {
        const question = data.questions.find(q => q.id === body.questionId);
        if (question && !question.upvoters.includes(userId)) {
          question.upvotes++;
          question.upvoters.push(userId);
        }
        return Response.json({ question });
      }

      case 'answer-question': {
        const question = data.questions.find(q => q.id === body.questionId);
        if (question) {
          question.answer = body.answer;
          question.is_answered = true;
        }
        return Response.json({ question });
      }

      case 'mark-answered': {
        const question = data.questions.find(q => q.id === body.questionId);
        if (question) {
          question.is_answered = true;
        }
        return Response.json({ question });
      }

      // Collaborative notes actions
      case 'update-notes': {
        data.notes.content = body.content;
        data.notes.updated_at = new Date().toISOString();
        
        // Track editor
        const editorIndex = data.notes.editors.findIndex(e => e.id === userId);
        if (editorIndex >= 0) {
          data.notes.editors[editorIndex].last_edit = new Date().toISOString();
        } else {
          data.notes.editors.push({
            id: userId,
            name: body.editor,
            last_edit: new Date().toISOString()
          });
        }
        
        // Remove inactive editors (no edit in last 10 seconds)
        const tenSecondsAgo = Date.now() - 10000;
        data.notes.editors = data.notes.editors.filter(
          e => new Date(e.last_edit).getTime() > tenSecondsAgo
        );
        
        return Response.json({ notes: data.notes });
      }

      case 'get-notes': {
        return Response.json({ 
          content: data.notes.content,
          updated_at: data.notes.updated_at
        });
      }

      case 'get-notes-editors': {
        // Clean up inactive editors
        const tenSecondsAgo = Date.now() - 10000;
        data.notes.editors = data.notes.editors.filter(
          e => new Date(e.last_edit).getTime() > tenSecondsAgo
        );
        
        return Response.json({ editors: data.notes.editors });
      }

      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Video signaling error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});