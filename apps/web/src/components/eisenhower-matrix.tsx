'use client';

import type { Item, EisenhowerQuadrant } from '@risor/shared';
import { QUADRANTS } from '@risor/shared';
import { ItemCard } from './item-card';

const QUADRANT_ORDER: EisenhowerQuadrant[] = ['do', 'schedule', 'delegate', 'eliminate'];

export function EisenhowerMatrix({ items }: { items: Item[] }) {
  const grouped = QUADRANT_ORDER.reduce(
    (acc, q) => {
      acc[q] = items.filter((i) => i.eisenhower_quadrant === q);
      return acc;
    },
    {} as Record<EisenhowerQuadrant, Item[]>,
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {QUADRANT_ORDER.map((q) => {
        const config = QUADRANTS[q];
        const quadrantItems = grouped[q];
        return (
          <div
            key={q}
            className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: config.color }}>
                {config.label}
              </h3>
              <span className="text-xs text-zinc-600">{config.description}</span>
            </div>
            <div className="space-y-2">
              {quadrantItems.length > 0 ? (
                quadrantItems.map((item) => <ItemCard key={item.id} item={item} />)
              ) : (
                <p className="py-4 text-center text-xs text-zinc-700">Empty</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
