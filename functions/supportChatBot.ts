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
    const supportAgents = allUsers.filter(u =>
      u.role === 'admin' || u.is_tutor === true || (u.is_coordinator === true && !u.coordinator_banned)
    );

    const chatRecord = await base44.asServiceRole.entities.SupportChat.filter({ id: chat_id }, 'created_date', 1);
    const userName = chatRecord?.[0]?.user_name || user.full_name || user.email;
    const userEmail = chatRecord?.[0]?.user_email || user.email;

    await Promise.all(supportAgents.map(async (agent) => {
      // In-app notification
      await base44.asServiceRole.entities.Notification.create({
        recipient_email: agent.email,
        title: '🔴 Live Agent Requested',
        message: `${userName} is requesting a live support agent. Open Support Chats to respond.`,
        type: 'live_agent',
        is_read: false,
        action_url: '/AdminSupportChats'
      }).catch(() => {});

      // Email notification
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: agent.email,
        subject: `🔴 Live Agent Requested by ${userName}`,
        body: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #003366; padding: 20px 24px; border-radius: 8px 8px 0 0;">
    <h2 style="color: white; margin: 0; font-size: 20px;">🔴 Live Agent Requested</h2>
  </div>
  <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
    <p style="color: #374151; font-size: 15px; margin-top: 0;">
      A user is requesting a live support agent on the Diverse Youth NI platform.
    </p>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <tr>
        <td style="padding: 8px 12px; background: #fff; border: 1px solid #e5e7eb; font-weight: bold; color: #6b7280; width: 140px;">User</td>
        <td style="padding: 8px 12px; background: #fff; border: 1px solid #e5e7eb; color: #111827;">${userName}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: bold; color: #6b7280;">Email</td>
        <td style="padding: 8px 12px; background: #f9fafb; border: 1px solid #e5e7eb; color: #111827;">${userEmail}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; background: #fff; border: 1px solid #e5e7eb; font-weight: bold; color: #6b7280;">Time</td>
        <td style="padding: 8px 12px; background: #fff; border: 1px solid #e5e7eb; color: #111827;">${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}</td>
      </tr>
    </table>
    <p style="color: #374151; font-size: 14px;">Please log in to the platform and visit <strong>Support Chats</strong> to assist this user as soon as possible.</p>
    <a href="https://app.base44.com/AdminSupportChats" style="display: inline-block; background: #003366; color: white; padding: 10px 22px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px;">Open Support Chats</a>
  </div>
  <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 12px;">Diverse Youth NI — Support System</p>
</div>
        `.trim()
      }).catch(() => {});
    }));

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