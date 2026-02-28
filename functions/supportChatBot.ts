import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const BOT_RESPONSES = {
  greeting: [
    "Hi! I'm the Diverse Youth NI support bot 👋 How can I help you today?",
    "You can ask me about courses, sessions, technical issues, or type **live agent** to connect with a human."
  ],
  keywords: {
    course: "You can browse all available courses on the **Explore** page. If you're looking for something specific, try using the search or category filters!",
    lesson: "Lessons are inside each course. Open a course and click any lesson to start learning. Some lessons may need to be unlocked.",
    enroll: "To enrol in a course, visit the **Explore** page, open the course you like, and click the Enrol button.",
    session: "Live sessions are available on the **Sessions** page. You'll see upcoming sessions and can join or book one-to-one tutor sessions.",
    tutor: "We have great tutors! Visit the **Tutors** page to browse and book a session. You can also apply to become a tutor yourself.",
    quiz: "Quizzes are found inside course lessons. Complete them to test your knowledge and track your progress.",
    certificate: "Certificates are awarded when you complete a course. Visit your **Dashboard** to see your achievements.",
    password: "To change your password, go to **Settings → Account**. If you've forgotten your password, use the login page's 'Forgot password' link.",
    download: "To download the app, look for the 'Download App' banner at the top of the page, or check the App Version section in announcements.",
    contact: "You can reach us via the **Contact Us** page, or a support agent will join this chat shortly. Type **live agent** to request a human.",
    agent: "I'll flag this chat for a support agent to join you shortly. In the meantime, please describe your issue and we'll get back to you as soon as possible! 🙌"
  },
  fallback: "I'm not sure about that, but I'll make sure a support agent sees your message. You can also visit our **Contact Us** page for more help!"
};

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { chat_id, message } = await req.json();
  if (!chat_id || !message) return Response.json({ error: 'Missing params' }, { status: 400 });

  const lower = message.toLowerCase();

  // Find matching keyword
  let reply = BOT_RESPONSES.fallback;
  for (const [key, response] of Object.entries(BOT_RESPONSES.keywords)) {
    if (lower.includes(key)) {
      reply = response;
      break;
    }
  }

  // Save bot reply
  await base44.asServiceRole.entities.SupportMessage.create({
    chat_id,
    sender_role: 'bot',
    sender_name: 'Support Bot',
    content: reply
  });

  // Update chat with last message and mark unread for user
  await base44.asServiceRole.entities.SupportChat.update(chat_id, {
    last_message: reply.substring(0, 100),
    last_message_at: new Date().toISOString(),
    unread_user: true
  });

  return Response.json({ reply });
});