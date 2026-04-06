'use client';

import { useState, useTransition } from 'react';
import { createItem } from '@/actions/create-item';

export function BrainDumpInput() {
  const [content, setContent] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!content.trim()) return;

    const lines = content
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    startTransition(async () => {
      for (const line of lines) {
        await createItem(line, 'web');
      }
      setContent('');
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Dump your thoughts here... (one per line, ⌘+Enter to save)"
        rows={3}
        className="w-full resize-none bg-transparent text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none"
        disabled={isPending}
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-zinc-600">
          {content.split('\n').filter((l) => l.trim()).length || 0} items
        </span>
        <button
          onClick={handleSubmit}
          disabled={isPending || !content.trim()}
          className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-40"
        >
          {isPending ? 'Saving...' : 'Dump it'}
        </button>
      </div>
    </div>
  );
}
