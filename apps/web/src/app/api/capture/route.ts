import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: Request) {
  // Authenticate via API key
  const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');
  if (apiKey !== process.env.CAPTURE_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { content, source = 'api', user_id } = body;

  if (!content || !user_id) {
    return NextResponse.json({ error: 'content and user_id required' }, { status: 400 });
  }

  // Split multi-line input into separate items
  const lines = content.split('\n').map((l: string) => l.trim()).filter(Boolean);
  const ids: string[] = [];

  for (const line of lines) {
    const { data, error } = await supabase
      .from('items')
      .insert({ content: line, source, user_id, status: 'inbox' })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    ids.push(data.id);

    // Log activity
    await supabase.from('activity_log').insert({
      user_id,
      item_id: data.id,
      action: 'created',
      metadata: { source },
    });
  }

  return NextResponse.json({ ids, count: ids.length });
}
