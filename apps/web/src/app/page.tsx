import { createClient } from '@/lib/supabase/server';
import { NavSidebar } from '@/components/nav-sidebar';
import { BrainDumpInput } from '@/components/brain-dump-input';
import { ItemCard } from '@/components/item-card';
import { LintCard } from '@/components/lint-card';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: doItems } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', user.id)
    .eq('eisenhower_quadrant', 'do')
    .in('status', ['inbox', 'active'])
    .order('created_at', { ascending: false })
    .limit(10);

  const { count: inboxCount } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'inbox');

  const today = new Date().toISOString().split('T')[0];
  const { count: capturedToday } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', `${today}T00:00:00`);

  const { count: completedToday } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .gte('completed_at', `${today}T00:00:00`);

  const { data: lintResults } = await supabase
    .from('lint_results')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <NavSidebar inboxCount={inboxCount || 0} />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-zinc-500">
              {capturedToday || 0} captured · {completedToday || 0} completed today
            </p>
          </div>

          <BrainDumpInput />

          {lintResults && lintResults.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-zinc-400">Insights</h2>
              {lintResults.map((lint) => (
                <LintCard key={lint.id} lint={lint} />
              ))}
            </div>
          )}

          <div className="space-y-3">
            <h2 className="text-sm font-medium text-zinc-400">Do First</h2>
            {doItems && doItems.length > 0 ? (
              doItems.map((item) => <ItemCard key={item.id} item={item} />)
            ) : (
              <p className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-6 text-center text-sm text-zinc-600">
                Nothing urgent. Nice work.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
