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

  // Detect live agent request
  const isLiveAgentRequest = /live\s*agent/i.test(message.trim());

  if (isLiveAgentRequest) {
    const confirmMsg = "✋ **Connecting you to a live agent...** A member of our team has been notified and will join this chat shortly. Please hold on!";

    // Save bot confirmation message
    await base44.asServiceRole.entities.SupportMessage.create({
      chat_id,
      sender_role: 'bot',
      sender_name: 'Support Bot',
      content: confirmMsg
    });

    // Flag the chat as escalated
    await base44.asServiceRole.entities.SupportChat.update(chat_id, {
      last_message: confirmMsg.substring(0, 100),
      last_message_at: new Date().toISOString(),
      unread_user: true,
      unread_admin: true,
      live_agent_requested: true,
      status: 'live_agent'
    });

    // Notify all admins, tutors and coordinators via Notification entity + email
    const allUsers = await base44.asServiceRole.entities.User.list('created_date', 500);
    const supportAgents = allUsers.filter(u => u.role === 'admin' || u.is_tutor === true || u.is_coordinator === true);

    const chatRecord = await base44.asServiceRole.entities.SupportChat.filter({ id: chat_id }, 'created_date', 1);
    const userName = chatRecord?.[0]?.user_name || user.full_name || user.email;
    const userEmail = chatRecord?.[0]?.user_email || user.email;

    const appUrl = `${Deno.env.get('BASE44_APP_ID') ? 'https://app.base44.com' : 'https://app.base44.com'}`;

    await Promise.all(supportAgents.flatMap(agent => [
      // In-app notification
      base44.asServiceRole.entities.Notification.create({
        recipient_email: agent.email,
        title: '🔴 Live Agent Requested',
        message: `${userName} is requesting a live support agent. Open Support Chats to respond.`,
        type: 'live_agent',
        is_read: false,
        action_url: '/AdminSupportChats'
      }).catch(() => {}),
      // Email notification
      base44.asServiceRole.integrations.Core.SendEmail({
        to: agent.email,
        subject: `🔴 Live Agent Requested by ${userName}`,
        body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #003366; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 22px;">🔴 Live Agent Requested</h1>
  </div>
  <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; color: #1e293b; margin: 0 0 12px;">A user is requesting immediate live support:</p>
    <div style="background: white; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 4px; margin-bottom: 20px;">
      <p style="margin: 0; font-size: 15px;"><strong>User:</strong> ${userName}</p>
      <p style="margin: 4px 0 0; font-size: 14px; color: #64748b;"><strong>Email:</strong> ${userEmail}</p>
    </div>
    <p style="color: #475569; font-size: 14px;">Please log in to the platform and open <strong>Support Chats</strong> to respond to this user as soon as possible.</p>
    <div style="text-align: center; margin-top: 24px;">
      <a href="https://diverse-youth-ni.base44.app/AdminSupportChats" style="background: #003366; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 15px;">Open Support Chats</a>
    </div>
    <p style="margin-top: 20px; font-size: 12px; color: #94a3b8; text-align: center;">Diverse Youth NI — Support Notifications</p>
  </div>
</div>`
      }).catch(() => {})
    ]));

    return Response.json({ reply: confirmMsg, live_agent_requested: true });
  }

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