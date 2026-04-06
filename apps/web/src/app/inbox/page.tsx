import { createClient } from '@/lib/supabase/server';
import { NavSidebar } from '@/components/nav-sidebar';
import { BrainDumpInput } from '@/components/brain-dump-input';
import { ItemCard } from '@/components/item-card';
import { InboxFilters } from '@/components/inbox-filters';

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const params = await searchParams;
  const filter = params.filter || 'all';
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let query = supabase
    .from('items')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['inbox', 'active'])
    .order('created_at', { ascending: false });

  if (filter === 'unclassified') {
    query = query.is('type', null);
  } else if (filter === 'today') {
    const today = new Date().toISOString().split('T')[0];
    query = query.gte('created_at', `${today}T00:00:00`);
  } else if (filter === 'low-confidence') {
    query = query.lt('ai_confidence', 0.5);
  }

  const { data: items } = await query.limit(50);

  const { count: inboxCount } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'inbox');

  const { count: unclassifiedCount } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'inbox')
    .is('type', null);

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <NavSidebar inboxCount={inboxCount || 0} />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Inbox</h1>
            {unclassifiedCount !== null && unclassifiedCount > 0 && (
              <span className="text-sm text-amber-400">{unclassifiedCount} unclassified</span>
            )}
          </div>

          <BrainDumpInput />

          <InboxFilters current={filter} />

          <div className="space-y-3">
            {items && items.length > 0 ? (
              items.map((item) => <ItemCard key={item.id} item={item} />)
            ) : (
              <p className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-8 text-center text-sm text-zinc-600">
                {filter === 'unclassified'
                  ? 'All items classified!'
                  : 'Inbox is empty. Dump some thoughts above.'}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
