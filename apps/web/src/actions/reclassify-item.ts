'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function reclassifyItem(
  itemId: string,
  updates: { type?: string; eisenhower_quadrant?: string; effort?: string; impact_tier?: string }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // 1. Fetch original classification
  const { data: item } = await supabase
    .from('items')
    .select('content, type, eisenhower_quadrant, effort, impact_tier')
    .eq('id', itemId)
    .eq('user_id', user.id)
    .single();

  if (!item) throw new Error('Item not found');

  // 2. Update the item
  await supabase.from('items').update(updates).eq('id', itemId);

  // 3. Log reclassification
  await supabase.from('activity_log').insert({
    user_id: user.id,
    item_id: itemId,
    action: 'reclassified',
    metadata: {
      original: {
        type: item.type,
        quadrant: item.eisenhower_quadrant,
        effort: item.effort,
        impact_tier: item.impact_tier,
      },
      corrected: updates,
    },
  });

  // 4. Save correction for self-improving classification
  const hasTypeChange = updates.type && updates.type !== item.type;
  const hasQuadrantChange = updates.eisenhower_quadrant && updates.eisenhower_quadrant !== item.eisenhower_quadrant;
  const hasEffortChange = updates.effort && updates.effort !== item.effort;
  const hasTierChange = updates.impact_tier && updates.impact_tier !== item.impact_tier;

  if (hasTypeChange || hasQuadrantChange || hasEffortChange || hasTierChange) {
    await supabase.from('classification_corrections').insert({
      user_id: user.id,
      content: item.content,
      original_type: item.type || 'unknown',
      corrected_type: updates.type || item.type || 'unknown',
      original_quadrant: item.eisenhower_quadrant,
      corrected_quadrant: updates.eisenhower_quadrant || item.eisenhower_quadrant,
      original_effort: item.effort,
      corrected_effort: updates.effort || item.effort,
      original_impact_tier: item.impact_tier,
      corrected_impact_tier: updates.impact_tier || item.impact_tier,
    });
  }

  revalidatePath('/');
  revalidatePath('/inbox');
  revalidatePath('/matrix');
}
