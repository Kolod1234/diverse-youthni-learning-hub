// NEW one-off server function: backfillChatParticipants   (admin only; run ONCE, then delete)
// The new access rules for chat let a user read a message only if their email is on the message.
// Existing messages don't have that field yet, so run this BEFORE switching the rules on,
// otherwise old conversations would disappear for their members.
//
// Before running: add these fields to the table schemas (type: array of strings):
//   ChatMessage.participant_emails, StudyGroupMessage.member_emails (arrays of strings),
//   and SupportMessage.user_email (string). These are already in the entity files in this change.
//
// New messages already include them (ChatWindow, AdminTutorMonitor, GroupChat, SupportChatWidget,
// AdminSupportChats, supportChatBot).
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

async function each(entity, fn) {
  let skip = 0;
  for (;;) {
    const batch = await entity.list('created_date', 200, skip);
    if (!batch.length) break;
    for (const rec of batch) await fn(rec);
    skip += batch.length;
    if (batch.length < 200) break;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    const sr = base44.asServiceRole.entities;
    const counts = { ChatMessage: 0, StudyGroupMessage: 0, SupportMessage: 0 };

    const rooms = new Map();
    await each(sr.ChatMessage, async (m) => {
      if (m.participant_emails?.length) return;
      if (!rooms.has(m.room_id)) rooms.set(m.room_id, (await sr.ChatRoom.get(m.room_id).catch(() => null))?.participant_emails || []);
      await sr.ChatMessage.update(m.id, { participant_emails: rooms.get(m.room_id) });
      counts.ChatMessage++;
    });

    const groups = new Map();
    await each(sr.StudyGroupMessage, async (m) => {
      if (m.member_emails?.length) return;
      if (!groups.has(m.group_id)) {
        const ms = await sr.StudyGroupMember.filter({ group_id: m.group_id }, 'created_date', 500);
        groups.set(m.group_id, ms.map((x) => x.member_email).filter(Boolean));
      }
      await sr.StudyGroupMessage.update(m.id, { member_emails: groups.get(m.group_id) });
      counts.StudyGroupMessage++;
    });

    const chats = new Map();
    await each(sr.SupportMessage, async (m) => {
      if (m.user_email) return;
      if (!chats.has(m.chat_id)) chats.set(m.chat_id, (await sr.SupportChat.get(m.chat_id).catch(() => null))?.user_email || null);
      if (chats.get(m.chat_id)) { await sr.SupportMessage.update(m.id, { user_email: chats.get(m.chat_id) }); counts.SupportMessage++; }
    });

    return Response.json({ ok: true, updated: counts });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
