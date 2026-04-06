// packages/shared/constants.ts

import type { Category, Effort, EisenhowerQuadrant, ImpactTier } from './types';

export const CATEGORIES: Record<Category, { label: string; color: string; icon: string }> = {
  task:      { label: 'Task',      color: '#3B82F6', icon: '✓' },
  idea:      { label: 'Idea',      color: '#F59E0B', icon: '💡' },
  project:   { label: 'Project',   color: '#8B5CF6', icon: '📋' },
  research:  { label: 'Research',  color: '#06B6D4', icon: '🔍' },
  learning:  { label: 'Learning',  color: '#10B981', icon: '📚' },
  curiosity: { label: 'Curiosity', color: '#EC4899', icon: '🧪' },
  art:       { label: 'Art',       color: '#F97316', icon: '🎨' },
  reading:   { label: 'Reading',   color: '#6366F1', icon: '📖' },
};

export const EFFORTS: Record<Effort, { label: string; color: string; icon: string; maxMinutes: number }> = {
  quick:  { label: 'Quick',  color: '#10B981', icon: '⚡', maxMinutes: 15 },
  medium: { label: 'Medium', color: '#F59E0B', icon: '⏱',  maxMinutes: 60 },
  deep:   { label: 'Deep',   color: '#8B5CF6', icon: '🧠', maxMinutes: 999 },
};

export const QUADRANTS: Record<EisenhowerQuadrant, { label: string; description: string; color: string }> = {
  do:        { label: 'Do First',   description: 'Urgent + Important',         color: '#EF4444' },
  schedule:  { label: 'Schedule',   description: 'Not Urgent + Important',     color: '#3B82F6' },
  delegate:  { label: 'Delegate',   description: 'Urgent + Not Important',     color: '#F59E0B' },
  eliminate: { label: 'Eliminate',  description: 'Not Urgent + Not Important', color: '#6B7280' },
};

export const IMPACT_TIERS: Record<ImpactTier, { label: string; description: string }> = {
  immediate: { label: 'Immediate', description: 'Tied to an active goal or deadline' },
  future:    { label: 'Future',    description: 'Potential value, not tied to current work' },
  hobby:     { label: 'Hobby',     description: 'Fun, relaxation, personal interest' },
};

export const CATEGORY_LIST = Object.keys(CATEGORIES) as Category[];
