// packages/shared/types.ts

export type Category = 'task' | 'idea' | 'project' | 'research' | 'learning' | 'curiosity' | 'art' | 'reading';
export type Status = 'inbox' | 'active' | 'waiting' | 'completed' | 'archived' | 'someday';
export type EisenhowerQuadrant = 'do' | 'schedule' | 'delegate' | 'eliminate';
export type Effort = 'quick' | 'medium' | 'deep';
export type ImpactTier = 'immediate' | 'future' | 'hobby';
export type CaptureSource = 'web' | 'telegram' | 'shortcut' | 'bookmarklet' | 'api' | 'share_sheet';
export type ActivityAction = 'created' | 'completed' | 'deferred' | 'archived' | 'edited' | 'viewed' | 'focused' | 'reclassified';
export type LintType = 'orphaned_goals' | 'stale_inbox' | 'embedding_gaps' | 'growing_clusters' | 'low_confidence_unreviewed' | 'duplicate_candidates' | 'dead_projects' | 'recurring_ideas' | 'contradictory_priorities';

export interface Item {
  id: string;
  user_id: string;
  content: string;
  type: Category | null;
  status: Status;
  urgency: 'urgent' | 'not_urgent' | null;
  importance: 'important' | 'not_important' | null;
  eisenhower_quadrant: EisenhowerQuadrant | null;
  effort: Effort | null;
  estimated_minutes: number | null;
  impact_tier: ImpactTier | null;
  due_date: string | null;
  scheduled_date: string | null;
  completed_at: string | null;
  deferred_count: number;
  parent_id: string | null;
  ai_summary: string | null;
  ai_tags: string[] | null;
  ai_delegatable: boolean;
  ai_confidence: number | null;
  cluster_id: string | null;
  frequency_count: number;
  is_compliance: boolean;
  source: CaptureSource;
  created_at: string;
  updated_at: string;
}

export interface ClassificationResult {
  type: Category;
  urgency: 'urgent' | 'not_urgent';
  importance: 'important' | 'not_important';
  eisenhower_quadrant: EisenhowerQuadrant;
  effort: Effort;
  estimated_minutes: number | null;
  impact_tier: ImpactTier;
  ai_summary: string;
  ai_tags: string[];
  ai_delegatable: boolean;
  confidence: number;
}

export interface ActivityLogEntry {
  id: string;
  user_id: string;
  item_id: string | null;
  action: ActivityAction;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  week_start: string;
  ai_summary: string | null;
  completions_count: number | null;
  captures_count: number | null;
  category_distribution: Record<string, number> | null;
  aging_items: unknown | null;
  recommendations: unknown | null;
  affirmations: string[] | null;
  suggested_items: SuggestedItem[];
  synthesis_snapshot: string | null;
  lint_summary: Record<string, unknown>;
  created_at: string;
}

export interface SuggestedItem {
  content: string;
  type: Category;
  reason: string;
}

export interface LintResult {
  id: string;
  user_id: string;
  lint_type: LintType;
  item_ids: string[];
  description: string;
  suggested_action: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
}

export interface UserSynthesis {
  user_id: string;
  active_goals_summary: string | null;
  recurring_themes: string | null;
  open_questions: string | null;
  behavioral_patterns: string | null;
  stale_items_summary: string | null;
  version: number;
  updated_at: string;
}
