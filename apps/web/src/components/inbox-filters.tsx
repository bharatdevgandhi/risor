'use client';

import Link from 'next/link';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unclassified', label: 'Unclassified' },
  { key: 'today', label: 'Today' },
  { key: 'low-confidence', label: 'Low Confidence' },
];

export function InboxFilters({ current }: { current: string }) {
  return (
    <div className="flex gap-2">
      {FILTERS.map((f) => (
        <Link
          key={f.key}
          href={f.key === 'all' ? '/inbox' : `/inbox?filter=${f.key}`}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            current === f.key
              ? 'bg-zinc-700 text-white'
              : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {f.label}
        </Link>
      ))}
    </div>
  );
}
