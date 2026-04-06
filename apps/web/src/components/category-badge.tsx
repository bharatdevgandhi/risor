import { CATEGORIES } from '@risor/shared';
import type { Category } from '@risor/shared';

export function CategoryBadge({ category }: { category: Category | null }) {
  if (!category) {
    return (
      <span className="inline-flex items-center rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-400">
        Unclassified
      </span>
    );
  }

  const config = CATEGORIES[category];

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${config.color}20`, color: config.color }}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}
