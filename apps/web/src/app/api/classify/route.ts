import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { classifyItem } from '@/lib/claude/classify';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: Request) {
  const { item_id, user_id } = await request.json();
  if (!item_id || !user_id) {
    return NextResponse.json({ error: 'item_id and user_id required' }, { status: 400 });
  }

  // Fetch item content
  const { data: item } = await supabase
    .from('items')
    .select('content')
    .eq('id', item_id)
    .single();

  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  // Fetch corrections + context
  const { data: corrections } = await supabase
    .from('classification_corrections')
    .select('content, corrected_type, corrected_quadrant, corrected_effort, corrected_impact_tier')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .limit(15);

  const { data: context } = await supabase
    .from('context_cache')
    .select('goals_summary, category_distribution')
    .eq('user_id', user_id)
    .single();

  try {
    const result = await classifyItem(item.content, corrections || [], context);

    await supabase.from('items').update({
      type: result.type,
      urgency: result.urgency,
      importance: result.importance,
      eisenhower_quadrant: result.eisenhower_quadrant,
      effort: result.effort,
      estimated_minutes: result.estimated_minutes,
      impact_tier: result.impact_tier,
      ai_summary: result.ai_summary,
      ai_tags: result.ai_tags,
      ai_delegatable: result.ai_delegatable,
      ai_confidence: result.confidence,
    }).eq('id', item_id);

    return NextResponse.json({ success: true, classification: result });
  } catch (err) {
    return NextResponse.json({ error: 'Classification failed', details: String(err) }, { status: 500 });
  }
}
