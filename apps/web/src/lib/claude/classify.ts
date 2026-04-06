import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { CLASSIFICATION_SYSTEM_PROMPT, CLASSIFICATION_EXAMPLES } from '@risor/shared';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export const ClassificationSchema = z.object({
  type: z.enum(['task', 'idea', 'project', 'research', 'learning', 'curiosity', 'art', 'reading']),
  urgency: z.enum(['urgent', 'not_urgent']),
  importance: z.enum(['important', 'not_important']),
  eisenhower_quadrant: z.enum(['do', 'schedule', 'delegate', 'eliminate']),
  effort: z.enum(['quick', 'medium', 'deep']),
  estimated_minutes: z.number().nullable(),
  impact_tier: z.enum(['immediate', 'future', 'hobby']),
  ai_summary: z.string().max(100),
  ai_tags: z.array(z.string()).max(5),
  ai_delegatable: z.boolean(),
  confidence: z.number().min(0).max(1),
});

export type ClassificationResult = z.infer<typeof ClassificationSchema>;

interface CorrectionExample {
  content: string;
  corrected_type: string;
  corrected_quadrant: string | null;
  corrected_effort: string | null;
  corrected_impact_tier: string | null;
}

interface ContextCache {
  goals_summary: string | null;
  category_distribution: string | null;
}

export async function classifyItem(
  content: string,
  corrections: CorrectionExample[] = [],
  context: ContextCache | null = null,
): Promise<ClassificationResult> {
  // Build dynamic few-shot examples from user corrections
  const dynamicExamples = corrections.map((c) => ({
    input: c.content,
    output: {
      type: c.corrected_type,
      eisenhower_quadrant: c.corrected_quadrant || 'schedule',
      effort: c.corrected_effort || 'medium',
      impact_tier: c.corrected_impact_tier || 'future',
    },
  }));

  // Build goal-aware context block
  const contextBlock = context?.goals_summary
    ? `\n\n<user_context>
Active goals: ${context.goals_summary}
Recent category distribution: ${context.category_distribution || 'No data yet'}
</user_context>

Use this context to better classify impact_tier:
- If the input relates to an active goal, impact_tier should be "immediate"
- If it relates to a known interest area but no active goal, "future"
- Otherwise use your best judgment`
    : '';

  // Combine static + dynamic examples
  const allExamples = [...CLASSIFICATION_EXAMPLES, ...dynamicExamples];

  const messages: Anthropic.MessageParam[] = [];

  // Few-shot examples as user/assistant pairs
  for (const ex of allExamples) {
    messages.push({ role: 'user', content: ex.input });
    messages.push({ role: 'assistant', content: JSON.stringify(ex.output) });
  }

  // Actual input
  messages.push({ role: 'user', content });

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20250514',
    max_tokens: 500,
    system: CLASSIFICATION_SYSTEM_PROMPT + contextBlock,
    messages,
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const parsed = JSON.parse(text);

  return ClassificationSchema.parse(parsed);
}
