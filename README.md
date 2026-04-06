# RISOR — AI-Powered Second Brain

> Capture unstructured thoughts. Let AI classify, prioritize, and organize them. Build compounding self-knowledge.

**RISOR** (Rather Intelligent System of Record) captures brain dumps from anywhere — web, Telegram, iOS Shortcuts — and uses Claude AI to classify them into actionable categories with Eisenhower prioritization, effort estimation, and semantic clustering.

## What Makes RISOR Different

Most task managers are filing cabinets. RISOR is a **compounding knowledge system** inspired by [Karpathy's LLM Wiki pattern](https://github.com/karpathy/llm-wiki):

- **Self-improving classification** — Every time you correct the AI, it learns. Reclassifications feed back as few-shot examples.
- **Compounding weekly reviews** — Each review builds on a living synthesis document, not isolated snapshots.
- **Nightly lint checks** — Automated health checks catch orphaned goals, stale items, recurring ideas, and contradictory priorities.
- **Hybrid search** — Full-text + vector similarity search across all your captures.
- **No shame, ever** — Built on self-compassion research. Curiosity over judgment.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 App Router + Tailwind + shadcn/ui |
| Database | Supabase (PostgreSQL + pgvector + pg_cron) |
| Classification | Claude Haiku 4.5 |
| Reviews/Analysis | Claude Sonnet 4.6 |
| Embeddings | OpenAI text-embedding-3-small (1536d) |
| Auth | Supabase Auth + Google OAuth |
| Deployment | Vercel |
| Mobile Capture | Telegram bot + iOS Shortcuts + PWA |

## Quickstart

```bash
git clone https://github.com/bharatdevgandhi/risor.git
cd risor
pnpm install
cp .env.example apps/web/.env.local
# Fill in your Supabase, Anthropic, and OpenAI keys
pnpm dev
```

Run `supabase/migrations/001_initial_schema.sql` in your Supabase SQL Editor.

## 8 Categories

| Category | What it is |
|----------|-----------|
| Task | Concrete action with a done state |
| Idea | Unvalidated thought needing exploration |
| Project | Multi-step initiative |
| Research | Information-gathering tied to a decision |
| Learning | Skill acquisition with intentional growth |
| Curiosity | Low-stakes exploration |
| Art | Creative expression |
| Reading | Saved articles and threads |

## Architecture

```
Capture (Web / Telegram / Shortcuts)
  → Classify (Claude Haiku + dynamic few-shots + goal context)
  → Store (Supabase + pgvector embeddings)
  → Organize (Eisenhower matrix, effort, impact tiers)
  → Execute (Focus mode with task recommendation)
  → Review (Weekly synthesis, compounding insights)
  → Lint (Nightly health checks)
  → Compound (corrections → better classification, reviews → updated synthesis)
```

## License

MIT
