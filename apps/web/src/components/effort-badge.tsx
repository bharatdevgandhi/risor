import { EFFORTS } from '@risor/shared';
import type { Effort } from '@risor/shared';

export function EffortBadge({ effort }: { effort: Effort | null }) {
  if (!effort) return null;
  const config = EFFORTS[effort];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${config.color}20`, color: config.color }}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}
