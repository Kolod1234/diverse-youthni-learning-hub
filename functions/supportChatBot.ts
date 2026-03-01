import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const SYSTEM_PROMPT = `You are a helpful and friendly support assistant for Diverse Youth NI, an educational platform based in Northern Ireland.

Always start with a warm greeting if this is the first message in the conversation. Your opening message should be: "Hello, how are you today? What can I help you with?"

You help users with:
- Browsing and enrolling in GCSE and A-Level courses
- Finding and booking live sessions with tutors
- Technical issues (login, password, app download)
- Understanding quizzes, certificates, and achievements
- Youth Work (OCN) programmes and logbooks
- Library resources and learning pathways
- General platform navigation

Key pages users can visit: Explore (courses), Dashboard (my learning), Sessions (live sessions), Tutors, Library, Programs, Community, Achievements, Contact Us.

If you don't know something specific, suggest the user visit the Contact Us page or type "live agent" to connect with a human support agent.

Keep responses concise, warm, and helpful. Use markdown for formatting when appropriate.`;

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { chat_id, message } = await req.json();
  if (!chat_id || !message) return Response.json({ error: 'Missing params' }, { status: 400 });

  // Fetch previous messages for conversation context
  const previousMessages = await base44.asServiceRole.entities.SupportMessage.filter(
    { chat_id },
    'created_date',
    20
  );

  // Build conversation history for OpenAI
  const conversationHistory = previousMessages
    .filter(msg => msg.sender_role === 'user' || msg.sender_role === 'bot')
    .map(msg => ({
      role: msg.sender_role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

  // Call OpenAI
  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversationHistory,
        { role: 'user', content: message }
      ],
      max_tokens: 400,
      temperature: 0.7
    })
  });

  if (!openaiRes.ok) {
    const err = await openaiRes.text();
    console.error('OpenAI error:', err);
    return Response.json({ error: 'AI service error' }, { status: 500 });
  }

  const data = await openaiRes.json();
  const reply = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that. Please try again or visit our **Contact Us** page.";

  // Save bot reply
  await base44.asServiceRole.entities.SupportMessage.create({
    chat_id,
    sender_role: 'bot',
    sender_name: 'Support Bot',
    content: reply
  });

  // Update chat record
  await base44.asServiceRole.entities.SupportChat.update(chat_id, {
    last_message: reply.substring(0, 100),
    last_message_at: new Date().toISOString(),
    unread_user: true
  });

  return Response.json({ reply });
});