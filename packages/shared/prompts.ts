// packages/shared/prompts.ts

export const CLASSIFICATION_SYSTEM_PROMPT = `You are RISOR's classification engine. Given a raw brain dump input, classify it into a structured format.

<categories>
- task: Concrete, completable action with a clear done state
- idea: Unvalidated thought needing exploration before becoming actionable
- project: Multi-step initiative with a defined outcome
- research: Information-gathering tied to a decision or project
- learning: Skill/knowledge acquisition with intentional growth
- curiosity: Low-stakes exploration driven by interest
- art: Creative expression — writing, music, visual, design
- reading: Saved article, thread, or long-form content
</categories>

<impact_tiers>
- immediate: Directly tied to an active goal or deadline
- future: May help in the future but not tied to current work
- hobby: Fun, relaxation, personal interest — no productivity obligation
</impact_tiers>

<eisenhower_rules>
- urgent: Has a deadline within 48 hours OR is blocking other work
- important: Aligned with long-term goals OR high-impact outcome
- Ask yourself: "Does this task have a REAL deadline or just FEEL urgent?"
</eisenhower_rules>

<effort_rules>
- quick: Under 15 minutes, single action
- medium: 15-60 minutes, may have 2-3 steps
- deep: Over 60 minutes, requires focused attention
</effort_rules>

Respond ONLY with valid JSON matching the schema. No markdown, no explanation.`;

export const CLASSIFICATION_EXAMPLES = [
  {
    input: "need to write about creating consumer ai vs business ai",
    output: {
      type: "art",
      urgency: "not_urgent",
      importance: "important",
      eisenhower_quadrant: "schedule",
      effort: "deep",
      estimated_minutes: 120,
      impact_tier: "future",
      ai_summary: "Write essay comparing consumer AI vs business AI approaches",
      ai_tags: ["writing", "ai", "essay", "content"],
      ai_delegatable: false,
      confidence: 0.85
    }
  },
  {
    input: "Need to do taxes in the next 8 hours",
    output: {
      type: "task",
      urgency: "urgent",
      importance: "important",
      eisenhower_quadrant: "do",
      effort: "deep",
      estimated_minutes: 180,
      impact_tier: "immediate",
      ai_summary: "File taxes — 8 hour deadline",
      ai_tags: ["taxes", "compliance", "deadline", "finance"],
      ai_delegatable: false,
      confidence: 0.95
    }
  },
  {
    input: "clean the table",
    output: {
      type: "task",
      urgency: "not_urgent",
      importance: "not_important",
      eisenhower_quadrant: "delegate",
      effort: "quick",
      estimated_minutes: 10,
      impact_tier: "hobby",
      ai_summary: "Clean the table",
      ai_tags: ["household", "cleaning"],
      ai_delegatable: true,
      confidence: 0.90
    }
  },
  {
    input: "Long term idea: build a computing system that takes voice and uses a camera to look at my notebook for input",
    output: {
      type: "idea",
      urgency: "not_urgent",
      importance: "important",
      eisenhower_quadrant: "schedule",
      effort: "deep",
      estimated_minutes: null,
      impact_tier: "future",
      ai_summary: "Build voice+camera interface for notebook-based computer input",
      ai_tags: ["hardware", "voice-ui", "camera", "interface", "innovation"],
      ai_delegatable: false,
      confidence: 0.80
    }
  },
  {
    input: "learn everything aman khan has to teach",
    output: {
      type: "learning",
      urgency: "not_urgent",
      importance: "important",
      eisenhower_quadrant: "schedule",
      effort: "deep",
      estimated_minutes: null,
      impact_tier: "future",
      ai_summary: "Study Aman Khan's teachings comprehensively",
      ai_tags: ["learning", "mentorship", "study"],
      ai_delegatable: false,
      confidence: 0.70
    }
  },
  {
    input: "Read 20 pages of the first 90 days book",
    output: {
      type: "learning",
      urgency: "not_urgent",
      importance: "important",
      eisenhower_quadrant: "schedule",
      effort: "medium",
      estimated_minutes: 40,
      impact_tier: "immediate",
      ai_summary: "Read 20 pages of The First 90 Days",
      ai_tags: ["reading", "career", "onboarding"],
      ai_delegatable: false,
      confidence: 0.85
    }
  },
  {
    input: "Figure out in a day if I need to head to bombay",
    output: {
      type: "task",
      urgency: "urgent",
      importance: "important",
      eisenhower_quadrant: "do",
      effort: "quick",
      estimated_minutes: 30,
      impact_tier: "immediate",
      ai_summary: "Decide whether to travel to Bombay today",
      ai_tags: ["travel", "decision", "urgent"],
      ai_delegatable: false,
      confidence: 0.85
    }
  },
  {
    input: "Order new screws for the TV and fix it",
    output: {
      type: "task",
      urgency: "not_urgent",
      importance: "not_important",
      eisenhower_quadrant: "schedule",
      effort: "medium",
      estimated_minutes: 45,
      impact_tier: "hobby",
      ai_summary: "Order screws and fix TV mount",
      ai_tags: ["household", "repair", "shopping"],
      ai_delegatable: false,
      confidence: 0.85
    }
  }
];

export const WEEKLY_REVIEW_SYSTEM_PROMPT = `You are RISOR's weekly review engine. Generate a thoughtful, specific weekly review based on the user's activity data and their evolving synthesis.

Rules:
- Be specific. Reference actual items, actual numbers, actual patterns.
- Affirmations must be data-linked: "You completed 3/3 deep-work tasks today" not "Great job!"
- Never use shame language. Use curiosity: "What's making X hard to start?" not "You're falling behind."
- Maximum 3 affirmations.
- Suggest new items when you notice patterns (recurring ideas, gaps, opportunities).
- Update the synthesis to reflect what changed this week.

Respond ONLY with valid JSON matching the schema. No markdown, no explanation.`;
