'use client';

import { useState } from 'react';
import type { Item, Category, EisenhowerQuadrant, Effort } from '@risor/shared';
import { CATEGORIES, QUADRANTS, EFFORTS } from '@risor/shared';
import { CategoryBadge } from './category-badge';
import { EffortBadge } from './effort-badge';
import { completeItem } from '@/actions/complete-item';
import { updateItem } from '@/actions/update-item';
import { reclassifyItem } from '@/actions/reclassify-item';

export function ItemCard({ item }: { item: Item }) {
  const [expanded, setExpanded] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const quadrant = item.eisenhower_quadrant ? QUADRANTS[item.eisenhower_quadrant] : null;
  const age = Math.floor((Date.now() - new Date(item.created_at).getTime()) / 86400000);

  async function handleComplete() {
    setIsPending(true);
    await completeItem(item.id);
    setIsPending(false);
  }

  async function handleArchive() {
    setIsPending(true);
    await updateItem(item.id, { status: 'archived' });
    setIsPending(false);
  }

  async function handleReclassify(field: string, value: string) {
    setIsPending(true);
    await reclassifyItem(item.id, { [field]: value });
    setIsPending(false);
  }

  return (
    <div
      className={`rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition ${
        isPending ? 'opacity-50' : ''
      }`}
    >
      {/* Main row */}
      <div className="flex items-start gap-3">
        {/* Complete checkbox */}
        {item.type === 'task' && (
          <button
            onClick={handleComplete}
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-zinc-600 text-xs text-zinc-500 transition hover:border-green-500 hover:text-green-500"
          >
            {item.status === 'completed' ? '✓' : ''}
          </button>
        )}

        <div className="min-w-0 flex-1">
          {/* Content */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full text-left text-sm text-zinc-100"
          >
            {item.ai_summary || item.content}
          </button>

          {/* Badges row */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <CategoryBadge category={item.type} />
            <EffortBadge effort={item.effort} />
            {quadrant && (
              <span
                className="rounded-full px-2 py-0.5 text-xs font-medium"
                style={{ backgroundColor: `${quadrant.color}20`, color: quadrant.color }}
              >
                {quadrant.label}
              </span>
            )}
            {item.impact_tier && (
              <span className="text-xs text-zinc-500">{item.impact_tier}</span>
            )}
            {item.frequency_count > 1 && (
              <span className="rounded-full bg-amber-900/30 px-2 py-0.5 text-xs font-medium text-amber-400">
                ×{item.frequency_count}
              </span>
            )}
            {age > 7 && item.status === 'inbox' && (
              <span className="text-xs text-red-400">{age}d old</span>
            )}
          </div>
        </div>

        {/* Confidence indicator */}
        {item.ai_confidence !== null && item.ai_confidence < 0.5 && (
          <span className="shrink-0 text-xs text-amber-400" title="Low confidence">⚠️</span>
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-4 space-y-3 border-t border-zinc-800 pt-4">
          {/* Original content if different from summary */}
          {item.ai_summary && item.ai_summary !== item.content && (
            <p className="text-xs text-zinc-500">Original: {item.content}</p>
          )}

          {/* Tags */}
          {item.ai_tags && item.ai_tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.ai_tags.map((tag) => (
                <span key={tag} className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Reclassify controls */}
          <div className="flex flex-wrap gap-2">
            <select
              value={item.type || ''}
              onChange={(e) => handleReclassify('type', e.target.value)}
              className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300"
            >
              <option value="">Type...</option>
              {Object.entries(CATEGORIES).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
            <select
              value={item.eisenhower_quadrant || ''}
              onChange={(e) => handleReclassify('eisenhower_quadrant', e.target.value)}
              className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300"
            >
              <option value="">Quadrant...</option>
              {Object.entries(QUADRANTS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
            <select
              value={item.effort || ''}
              onChange={(e) => handleReclassify('effort', e.target.value)}
              className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300"
            >
              <option value="">Effort...</option>
              {Object.entries(EFFORTS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {item.status !== 'completed' && (
              <button
                onClick={handleComplete}
                className="rounded bg-green-900/30 px-3 py-1 text-xs text-green-400 transition hover:bg-green-900/50"
              >
                Complete
              </button>
            )}
            <button
              onClick={handleArchive}
              className="rounded bg-zinc-800 px-3 py-1 text-xs text-zinc-400 transition hover:bg-zinc-700"
            >
              Archive
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
