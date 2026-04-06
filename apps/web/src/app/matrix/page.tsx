import { createClient } from '@/lib/supabase/server';
import { NavSidebar } from '@/components/nav-sidebar';
import { EisenhowerMatrix } from '@/components/eisenhower-matrix';

export default async function MatrixPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: items } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['inbox', 'active', 'waiting'])
    .not('eisenhower_quadrant', 'is', null)
    .order('created_at', { ascending: false });

  const { count: inboxCount } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'inbox');

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <NavSidebar inboxCount={inboxCount || 0} />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="space-y-6 px-4 py-8 md:px-8">
          <h1 className="text-2xl font-bold">Eisenhower Matrix</h1>
          <EisenhowerMatrix items={items || []} />
        </div>
      </main>
    </div>
  );
}
