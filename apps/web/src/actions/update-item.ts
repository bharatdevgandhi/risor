'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function updateItem(itemId: string, updates: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('items')
    .update(updates)
    .eq('id', itemId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);

  await supabase.from('activity_log').insert({
    user_id: user.id,
    item_id: itemId,
    action: 'edited',
    metadata: { fields: Object.keys(updates) },
  });

  revalidatePath('/');
  revalidatePath('/inbox');
  revalidatePath('/matrix');
}
