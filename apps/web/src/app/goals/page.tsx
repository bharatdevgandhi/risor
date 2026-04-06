import { createClient } from '@/lib/supabase/server';
import { NavSidebar } from '@/components/nav-sidebar';
import { ItemCard } from '@/components/item-card';

export default async function GoalsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Goals are items with type='project' and no parent
  const { data: goals } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'project')
    .is('parent_id', null)
    .in('status', ['inbox', 'active'])
    .order('created_at', { ascending: false });

  // For each goal, get child task counts
  const goalsWithProgress = await Promise.all(
    (goals || []).map(async (goal) => {
      const { count: totalTasks } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', goal.id);

      const { count: completedTasks } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', goal.id)
        .eq('status', 'completed');

      return { ...goal, totalTasks: totalTasks || 0, completedTasks: completedTasks || 0 };
    }),
  );

  const { count: inboxCount } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'inbox');

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <NavSidebar inboxCount={inboxCount || 0} />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
          <h1 className="text-2xl font-bold">Goals & Projects</h1>

          {goalsWithProgress.length > 0 ? (
            <div className="space-y-4">
              {goalsWithProgress.map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <ItemCard item={goal} />
                  {goal.totalTasks > 0 && (
                    <div className="ml-8 flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-zinc-800">
                        <div
                          className="h-1.5 rounded-full bg-green-500 transition-all"
                          style={{
                            width: `${(goal.completedTasks / goal.totalTasks) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-zinc-500">
                        {goal.completedTasks}/{goal.totalTasks}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-8 text-center text-sm text-zinc-600">
              No goals yet. Capture a project-level brain dump to get started.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
