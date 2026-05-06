-- ============================================
-- Specter — Supabase Database Migration
-- ============================================
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This creates all required tables with proper PostgreSQL types.
-- RLS is enabled with permissive policies for the service role key.

-- ═══ Notebooks ═══
CREATE TABLE IF NOT EXISTS notebooks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Untitled Notebook',
  content TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ References ═══
-- "references" is a reserved word in PostgreSQL, so we quote it
CREATE TABLE IF NOT EXISTS "references" (
  id TEXT PRIMARY KEY,
  notebook_id TEXT NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
  title TEXT,
  authors TEXT,
  year TEXT,
  journal TEXT,
  abstract TEXT,
  url TEXT,
  doi TEXT,
  confidence TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ Plans/Tasks ═══
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  notebook_id TEXT NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  outline TEXT DEFAULT '',
  output_type TEXT DEFAULT 'draft',
  word_target INTEGER DEFAULT 500,
  scheduled_date TIMESTAMPTZ,
  scheduled_time TEXT DEFAULT '09:00',
  auto_start BOOLEAN DEFAULT FALSE,
  pre_fetch_refs BOOLEAN DEFAULT FALSE,
  instructions TEXT DEFAULT '',
  status TEXT DEFAULT 'planned',
  ai_output TEXT,
  ai_summary TEXT,
  ai_references TEXT,
  ai_completed_at TIMESTAMPTZ,
  user_confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ Chat Messages ═══
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  notebook_id TEXT NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ Indexes for performance ═══
CREATE INDEX IF NOT EXISTS idx_references_notebook ON "references"(notebook_id);
CREATE INDEX IF NOT EXISTS idx_plans_notebook ON plans(notebook_id);
CREATE INDEX IF NOT EXISTS idx_plans_scheduled ON plans(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_chat_notebook ON chat_messages(notebook_id);
CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_messages(created_at);

-- ═══ Row Level Security ═══
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE "references" ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow full access for service role (used by our serverless functions)
CREATE POLICY "service_role_all" ON notebooks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON "references" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON chat_messages FOR ALL USING (true) WITH CHECK (true);
