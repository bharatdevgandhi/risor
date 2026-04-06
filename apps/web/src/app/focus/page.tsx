'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CategoryBadge } from '@/components/category-badge';
import { EffortBadge } from '@/components/effort-badge';
import { completeItem } from '@/actions/complete-item';
import type { Item } from '@risor/shared';

const TIME_SLOTS = [
  { label: '15 min', effort: 'quick', minutes: 15 },
  { label: '30 min', effort: 'medium', minutes: 30 },
  { label: '1 hour', effort: 'medium', minutes: 60 },
  { label: '2 hours', effort: 'deep', minutes: 120 },
];

export default function FocusPage() {
  const [slot, setSlot] = useState<number | null>(null);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(false);

  async function pickTask(minutes: number) {
    setLoading(true);
    setSlot(minutes);
    setElapsed(0);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Pick Q1 first, then Q2, matching effort to time
    const effortFilter = minutes <= 15 ? 'quick' : minutes <= 60 ? 'medium' : 'deep';

    let { data } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', user.id)
      .eq('eisenhower_quadrant', 'do')
      .in('status', ['inbox', 'active'])
      .order('created_at', { ascending: true })
      .limit(1);

    if (!data || data.length === 0) {
      ({ data } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .eq('eisenhower_quadrant', 'schedule')
        .eq('effort', effortFilter)
        .in('status', ['inbox', 'active'])
        .order('created_at', { ascending: true })
        .limit(1));
    }

    setCurrentItem(data?.[0] || null);
    setLoading(false);
  }

  // Timer
  useEffect(() => {
    if (slot === null || !currentItem) return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [slot, currentItem]);

  async function handleComplete() {
    if (!currentItem) return;
    await completeItem(currentItem.id);
    // Pick next task
    if (slot) await pickTask(slot);
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // Time slot selection
  if (slot === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-100">
        <h1 className="mb-2 text-2xl font-bold">Focus Mode</h1>
        <p className="mb-8 text-sm text-zinc-500">How much time do you have?</p>
        <div className="grid grid-cols-2 gap-3">
          {TIME_SLOTS.map((s) => (
            <button
              key={s.minutes}
              onClick={() => pickTask(s.minutes)}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-8 py-6 text-lg font-medium transition hover:border-zinc-600 hover:bg-zinc-900"
            >
              {s.label}
            </button>
          ))}
        </div>
        <a href="/" className="mt-8 text-sm text-zinc-600 hover:text-zinc-400">← Back to dashboard</a>
      </div>
    );
  }

  // Focus view
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-zinc-100">
      {loading ? (
        <p className="text-zinc-500">Finding your next task...</p>
      ) : currentItem ? (
        <div className="w-full max-w-md space-y-8 text-center">
          {/* Timer */}
          <div className="text-5xl font-light tabular-nums text-zinc-300">
            {formatTime(elapsed)}
          </div>

          {/* Task */}
          <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
            <p className="text-lg">{currentItem.ai_summary || currentItem.content}</p>
            <div className="flex justify-center gap-2">
              <CategoryBadge category={currentItem.type} />
              <EffortBadge effort={currentItem.effort} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handleComplete}
              className="rounded-lg bg-green-600 px-6 py-2 font-medium transition hover:bg-green-500"
            >
              Done ✓
            </button>
            <button
              onClick={() => slot && pickTask(slot)}
              className="rounded-lg bg-zinc-800 px-6 py-2 font-medium text-zinc-300 transition hover:bg-zinc-700"
            >
              Skip →
            </button>
            <button
              onClick={() => { setSlot(null); setCurrentItem(null); setElapsed(0); }}
              className="rounded-lg bg-zinc-800 px-6 py-2 font-medium text-zinc-500 transition hover:bg-zinc-700"
            >
              Exit
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-zinc-500">No matching tasks found.</p>
          <button
            onClick={() => setSlot(null)}
            className="mt-4 text-sm text-zinc-600 hover:text-zinc-400"
          >
            ← Try a different time slot
          </button>
        </div>
      )}
    </div>
  );
}
