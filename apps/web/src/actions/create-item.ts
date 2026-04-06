'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { classifyItem } from '@/lib/claude/classify';
import type { CaptureSource } from '@risor/shared';

export async function createItem(content: string, source: CaptureSource = 'web') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // 1. Insert raw item
  const { data: item, error } = await supabase
    .from('items')
    .insert({ content, source, user_id: user.id, status: 'inbox' })
    .select('id')
    .single();

  if (error || !item) throw new Error(error?.message || 'Failed to create item');

  // 2. Log activity
  await supabase.from('activity_log').insert({
    user_id: user.id,
    item_id: item.id,
    action: 'created',
    metadata: { source },
  });

  // 3. Classify asynchronously (don't block)
  classifyAndUpdate(item.id, content, user.id).catch(console.error);

  revalidatePath('/');
  revalidatePath('/inbox');
  return item.id;
}

async function classifyAndUpdate(itemId: string, content: string, userId: string) {
  const supabase = await createClient();

  // Fetch user corrections for dynamic few-shots
  const { data: corrections } = await supabase
    .from('classification_corrections')
    .select('content, corrected_type, corrected_quadrant, corrected_effort, corrected_impact_tier')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(15);

  // Fetch context cache for goal-aware classification
  const { data: context } = await supabase
    .from('context_cache')
    .select('goals_summary, category_distribution')
    .eq('user_id', userId)
    .single();

  try {
    const result = await classifyItem(content, corrections || [], context);

    await supabase
      .from('items')
      .update({
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
      })
      .eq('id', itemId);
  } catch (err) {
    console.error('Classification failed:', err);
  }
}
