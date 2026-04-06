'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function completeItem(itemId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const now = new Date().toISOString();

  const { error } = await supabase
    .from('items')
    .update({ status: 'completed', completed_at: now })
    .eq('id', itemId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);

  // Log activity
  await supabase.from('activity_log').insert({
    user_id: user.id,
    item_id: itemId,
    action: 'completed',
  });

  // Increment user stats
  await supabase.rpc('increment_completed', { p_user_id: user.id }).catch(() => {
    // RPC may not exist yet — non-critical
  });

  revalidatePath('/');
  revalidatePath('/inbox');
  revalidatePath('/matrix');
}
