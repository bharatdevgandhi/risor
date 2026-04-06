'use client';

import type { LintResult } from '@risor/shared';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const LINT_ICONS: Record<string, string> = {
  orphaned_goals: '🏔',
  stale_inbox: '📥',
  recurring_ideas: '💡',
  contradictory_priorities: '⚠️',
  dead_projects: '💀',
  embedding_gaps: '🔗',
  duplicate_candidates: '🔄',
  low_confidence_unreviewed: '❓',
  growing_clusters: '📦',
};

export function LintCard({ lint }: { lint: LintResult }) {
  const router = useRouter();

  async function dismiss() {
    const supabase = createClient();
    await supabase
      .from('lint_results')
      .update({ status: 'dismissed' })
      .eq('id', lint.id);
    router.refresh();
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
      <span className="text-lg">{LINT_ICONS[lint.lint_type] || '📋'}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-zinc-300">{lint.description}</p>
        <p className="mt-1 text-xs text-zinc-500">{lint.suggested_action}</p>
      </div>
      <button
        onClick={dismiss}
        className="shrink-0 text-xs text-zinc-600 transition hover:text-zinc-400"
      >
        Dismiss
      </button>
    </div>
  );
}
