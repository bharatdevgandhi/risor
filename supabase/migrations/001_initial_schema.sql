-- RISOR Migration 001: Complete Schema (Wiki-Informed)
-- Run this in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgmq;

-- ============================================================
-- Core Tables
-- ============================================================

CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('task','idea','project','research','learning','curiosity','art','reading')),
  status TEXT CHECK (status IN ('inbox','active','waiting','completed','archived','someday')) DEFAULT 'inbox',
  urgency TEXT CHECK (urgency IN ('urgent','not_urgent')),
  importance TEXT CHECK (importance IN ('important','not_important')),
  eisenhower_quadrant TEXT CHECK (eisenhower_quadrant IN ('do','schedule','delegate','eliminate')),
  effort TEXT CHECK (effort IN ('quick','medium','deep')),
  estimated_minutes INT,
  impact_tier TEXT CHECK (impact_tier IN ('immediate','future','hobby')),
  due_date DATE,
  scheduled_date DATE,
  completed_at TIMESTAMPTZ,
  deferred_count INT DEFAULT 0,
  parent_id UUID REFERENCES items(id),
  ai_summary TEXT,
  ai_tags TEXT[],
  ai_delegatable BOOLEAN DEFAULT FALSE,
  ai_confidence FLOAT,
  cluster_id UUID,
  frequency_count INT DEFAULT 1,
  is_compliance BOOLEAN DEFAULT FALSE,
  embedding vector(1536),
  source TEXT DEFAULT 'web' CHECK (source IN ('web','telegram','shortcut','bookmarklet','api','share_sheet')),
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(content, '') || ' ' || coalesce(ai_summary, ''))
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  item_id UUID REFERENCES items(id) ON DELETE SET NULL,
  action TEXT CHECK (action IN ('created','completed','deferred','archived','edited','viewed','focused','reclassified')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  total_completed INT DEFAULT 0,
  total_captured INT DEFAULT 0,
  peak_hour INT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  week_start DATE NOT NULL,
  ai_summary TEXT,
  completions_count INT,
  captures_count INT,
  category_distribution JSONB,
  aging_items JSONB,
  recommendations JSONB,
  affirmations TEXT[],
  suggested_items JSONB DEFAULT '[]',
  synthesis_snapshot TEXT,
  lint_summary JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE compliance_metadata (
  item_id UUID PRIMARY KEY REFERENCES items(id) ON DELETE CASCADE,
  deadline_date DATE NOT NULL,
  lead_time_days INT DEFAULT 14,
  recurrence_pattern TEXT CHECK (recurrence_pattern IN ('daily','weekly','monthly','quarterly','annual','custom')),
  recurrence_interval INT DEFAULT 1,
  severity TEXT CHECK (severity IN ('critical','high','medium','low')),
  consequence_description TEXT,
  reminder_schedule JSONB DEFAULT '[{"days_before":30,"channel":"in_app"},{"days_before":14,"channel":"in_app"},{"days_before":7,"channel":"push"},{"days_before":3,"channel":"push"},{"days_before":1,"channel":"urgent"}]',
  last_completed_at TIMESTAMPTZ,
  next_due DATE
);

CREATE TABLE item_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES items(id) ON DELETE CASCADE,
  target_id UUID REFERENCES items(id) ON DELETE CASCADE,
  link_type TEXT CHECK (link_type IN ('related','blocks','informs','duplicate','inspired_by')),
  similarity_score FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_id, target_id)
);

CREATE TABLE reading_metadata (
  item_id UUID PRIMARY KEY REFERENCES items(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  source_type TEXT CHECK (source_type IN ('article','tweet_thread','substack','pdf','other')),
  author TEXT,
  site_name TEXT,
  published_at TIMESTAMPTZ,
  word_count INTEGER,
  estimated_reading_time INTEGER,
  content_html TEXT,
  content_markdown TEXT,
  reading_status TEXT DEFAULT 'inbox' CHECK (reading_status IN ('inbox','in_progress','completed','archived')),
  reading_progress REAL DEFAULT 0.0,
  lead_image_url TEXT
);

CREATE TABLE highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  highlighted_text TEXT NOT NULL,
  note TEXT,
  position_start INTEGER,
  position_end INTEGER,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE detected_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  pattern_type TEXT,
  description TEXT,
  confidence FLOAT,
  evidence JSONB,
  suggested_automation JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Wiki-Informed Tables
-- ============================================================

CREATE TABLE user_synthesis (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  active_goals_summary TEXT,
  recurring_themes TEXT,
  open_questions TEXT,
  behavioral_patterns TEXT,
  stale_items_summary TEXT,
  version INT DEFAULT 1,
  last_review_id UUID REFERENCES reviews(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE classification_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  original_type TEXT NOT NULL,
  corrected_type TEXT NOT NULL,
  original_quadrant TEXT,
  corrected_quadrant TEXT,
  original_effort TEXT,
  corrected_effort TEXT,
  original_impact_tier TEXT,
  corrected_impact_tier TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE context_cache (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  goals_summary TEXT,
  top_clusters TEXT,
  deferred_items TEXT,
  upcoming_compliance TEXT,
  category_distribution TEXT,
  recent_corrections TEXT,
  rebuilt_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lint_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  lint_type TEXT CHECK (lint_type IN (
    'orphaned_goals','stale_inbox','embedding_gaps','growing_clusters',
    'low_confidence_unreviewed','duplicate_candidates','dead_projects',
    'recurring_ideas','contradictory_priorities'
  )),
  item_ids UUID[],
  description TEXT,
  suggested_action TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','resolved','dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  custom_few_shots JSONB DEFAULT '[]',
  category_overrides JSONB DEFAULT '{}',
  tag_vocabulary TEXT[],
  affirmation_enabled BOOLEAN DEFAULT TRUE,
  affirmation_max_per_day INT DEFAULT 3,
  review_day TEXT DEFAULT 'sunday',
  review_time TEXT DEFAULT '08:00',
  timezone TEXT DEFAULT 'Asia/Kolkata',
  peak_hours INT[],
  chronotype TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX idx_items_user_status ON items(user_id, status);
CREATE INDEX idx_items_user_type ON items(user_id, type);
CREATE INDEX idx_items_parent ON items(parent_id);
CREATE INDEX idx_items_eisenhower ON items(user_id, eisenhower_quadrant);
CREATE INDEX idx_items_due ON items(user_id, due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_items_embedding ON items USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_items_search ON items USING gin(search_vector);
CREATE INDEX idx_activity_user_time ON activity_log(user_id, created_at DESC);
CREATE INDEX idx_highlights_embedding ON highlights USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_corrections_user ON classification_corrections(user_id, created_at DESC);
CREATE INDEX idx_lint_user_status ON lint_results(user_id, status);

-- ============================================================
-- Functions
-- ============================================================

CREATE OR REPLACE FUNCTION find_similar_items(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.60,
  match_count INT DEFAULT 5,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (id UUID, content TEXT, type TEXT, similarity FLOAT)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT i.id, i.content, i.type,
    1 - (i.embedding <=> query_embedding) AS similarity
  FROM items i
  WHERE i.embedding IS NOT NULL
    AND (p_user_id IS NULL OR i.user_id = p_user_id)
    AND 1 - (i.embedding <=> query_embedding) > match_threshold
  ORDER BY i.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

CREATE OR REPLACE FUNCTION hybrid_search(
  p_user_id UUID,
  p_query TEXT,
  p_query_embedding vector(1536) DEFAULT NULL,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (id UUID, content TEXT, type TEXT, text_rank FLOAT, vector_similarity FLOAT, combined_score FLOAT)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT i.id, i.content, i.type,
    ts_rank(i.search_vector, websearch_to_tsquery('english', p_query))::FLOAT,
    CASE WHEN p_query_embedding IS NOT NULL AND i.embedding IS NOT NULL
      THEN (1 - (i.embedding <=> p_query_embedding))::FLOAT ELSE 0.0 END,
    (0.4 * ts_rank(i.search_vector, websearch_to_tsquery('english', p_query)) +
     0.6 * CASE WHEN p_query_embedding IS NOT NULL AND i.embedding IS NOT NULL
       THEN 1 - (i.embedding <=> p_query_embedding) ELSE 0.0 END)::FLOAT
  FROM items i
  WHERE i.user_id = p_user_id
    AND (i.search_vector @@ websearch_to_tsquery('english', p_query)
      OR (p_query_embedding IS NOT NULL AND i.embedding IS NOT NULL
          AND 1 - (i.embedding <=> p_query_embedding) > 0.5))
  ORDER BY combined_score DESC
  LIMIT p_limit;
END;
$$;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER items_updated_at BEFORE UPDATE ON items FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE detected_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_synthesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE classification_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE context_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE lint_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_items" ON items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_activity" ON activity_log FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_stats" ON user_stats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_reviews" ON reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_patterns" ON detected_patterns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_synthesis" ON user_synthesis FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_corrections" ON classification_corrections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_cache" ON context_cache FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_lint" ON lint_results FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_preferences" ON user_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_compliance" ON compliance_metadata FOR ALL USING (item_id IN (SELECT id FROM items WHERE user_id = auth.uid()));
CREATE POLICY "users_own_links" ON item_links FOR ALL USING (source_id IN (SELECT id FROM items WHERE user_id = auth.uid()));
CREATE POLICY "users_own_reading" ON reading_metadata FOR ALL USING (item_id IN (SELECT id FROM items WHERE user_id = auth.uid()));
CREATE POLICY "users_own_highlights" ON highlights FOR ALL USING (item_id IN (SELECT id FROM items WHERE user_id = auth.uid()));
