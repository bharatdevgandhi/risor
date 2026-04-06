import { createClient } from '@/lib/supabase/server';
import { NavSidebar } from '@/components/nav-sidebar';

export default async function ReviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: synthesis } = await supabase
    .from('user_synthesis')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const { count: inboxCount } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'inbox');

  const latestReview = reviews?.[0];

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <NavSidebar inboxCount={inboxCount || 0} />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
          <h1 className="text-2xl font-bold">Weekly Review</h1>

          {/* Synthesis (living document) */}
          {synthesis && (
            <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
              <h2 className="text-sm font-semibold text-zinc-400">Current Synthesis (v{synthesis.version})</h2>
              {synthesis.active_goals_summary && (
                <div>
                  <h3 className="text-xs font-medium text-zinc-500">Active Goals</h3>
                  <p className="mt-1 text-sm text-zinc-300 whitespace-pre-wrap">{synthesis.active_goals_summary}</p>
                </div>
              )}
              {synthesis.recurring_themes && (
                <div>
                  <h3 className="text-xs font-medium text-zinc-500">Recurring Themes</h3>
                  <p className="mt-1 text-sm text-zinc-300 whitespace-pre-wrap">{synthesis.recurring_themes}</p>
                </div>
              )}
              {synthesis.behavioral_patterns && (
                <div>
                  <h3 className="text-xs font-medium text-zinc-500">Behavioral Patterns</h3>
                  <p className="mt-1 text-sm text-zinc-300 whitespace-pre-wrap">{synthesis.behavioral_patterns}</p>
                </div>
              )}
              {synthesis.open_questions && (
                <div>
                  <h3 className="text-xs font-medium text-zinc-500">Open Questions</h3>
                  <p className="mt-1 text-sm text-zinc-300 whitespace-pre-wrap">{synthesis.open_questions}</p>
                </div>
              )}
            </div>
          )}

          {/* Latest review */}
          {latestReview ? (
            <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-400">
                  Week of {latestReview.week_start}
                </h2>
                <div className="flex gap-3 text-xs text-zinc-500">
                  <span>{latestReview.completions_count || 0} completed</span>
                  <span>{latestReview.captures_count || 0} captured</span>
                </div>
              </div>

              {latestReview.ai_summary && (
                <p className="text-sm text-zinc-300 whitespace-pre-wrap">{latestReview.ai_summary}</p>
              )}

              {latestReview.affirmations && latestReview.affirmations.length > 0 && (
                <div className="space-y-1">
                  {latestReview.affirmations.map((a: string, i: number) => (
                    <p key={i} className="text-sm text-green-400">✓ {a}</p>
                  ))}
                </div>
              )}

              {/* Suggested items from review */}
              {latestReview.suggested_items && (latestReview.suggested_items as unknown[]).length > 0 && (
                <div className="space-y-2 border-t border-zinc-800 pt-4">
                  <h3 className="text-xs font-medium text-zinc-500">Suggested by your review</h3>
                  {(latestReview.suggested_items as Array<{ content: string; type: string; reason: string }>).map(
                    (suggestion, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-blue-400">💡</span>
                        <div>
                          <p className="text-zinc-300">{suggestion.content}</p>
                          <p className="text-xs text-zinc-600">{suggestion.reason}</p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-8 text-center text-sm text-zinc-600">
              No reviews yet. Your first review will generate after a week of use.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
