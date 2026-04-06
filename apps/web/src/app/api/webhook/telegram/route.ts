import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const ALLOWED_USER_ID = process.env.TELEGRAM_ALLOWED_USER_ID; // Optional: restrict to your Telegram user ID

export async function POST(request: Request) {
  const update = await request.json();
  const message = update.message;

  if (!message?.text && !message?.voice) {
    return NextResponse.json({ ok: true });
  }

  // Optional: restrict to allowed user
  if (ALLOWED_USER_ID && String(message.from.id) !== ALLOWED_USER_ID) {
    return NextResponse.json({ ok: true });
  }

  const content = message.text || '[Voice message — transcription pending]';

  // Find or create user mapping (for MVP, use a fixed user_id from env)
  const userId = process.env.RISOR_DEFAULT_USER_ID;
  if (!userId) {
    console.error('RISOR_DEFAULT_USER_ID not set');
    return NextResponse.json({ ok: true });
  }

  // Split multi-line messages
  const lines = content.split('\n').map((l: string) => l.trim()).filter(Boolean);
  const ids: string[] = [];

  for (const line of lines) {
    const { data, error } = await supabase
      .from('items')
      .insert({ content: line, source: 'telegram', user_id: userId, status: 'inbox' })
      .select('id')
      .single();

    if (error) {
      console.error('Insert error:', error);
      continue;
    }

    ids.push(data.id);

    await supabase.from('activity_log').insert({
      user_id: userId,
      item_id: data.id,
      action: 'created',
      metadata: { source: 'telegram', telegram_chat_id: message.chat.id },
    });

    // Trigger classification
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: data.id, user_id: userId }),
    }).catch(console.error);
  }

  // Send confirmation
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: message.chat.id,
      text: `✓ Captured ${ids.length} item${ids.length > 1 ? 's' : ''}`,
      reply_to_message_id: message.message_id,
    }),
  });

  return NextResponse.json({ ok: true });
}
