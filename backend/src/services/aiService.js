const OpenAI = require('openai');

let openai;
try {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-openai-key-here') {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (err) {
  console.warn('OpenAI not initialized — using mock AI.');
}

/**
 * Analyze a lead description and return tags + intentScore
 * Falls back to a smart mock if OpenAI key is not configured.
 *
 * @param {string} description - Lead description text
 * @returns {{ tags: string[], intentScore: number }}
 */
const analyzeLeadWithAI = async (description) => {
  // ── Mock Analysis (no API key) ───────────────────────────────────────────
  if (!openai) {
    return mockAnalysis(description);
  }

  // ── Real OpenAI Analysis ─────────────────────────────────────────────────
  try {
    const prompt = `You are an expert lead quality analyst for a design marketplace.

Analyze the following design requirement and respond ONLY with valid JSON — no markdown, no explanation.

Required JSON format:
{
  "tags": ["tag1", "tag2", "tag3"],
  "intentScore": 0.85,
  "urgency": "high|medium|low",
  "notes": "brief insight"
}

Rules:
- tags: 3-6 relevant labels describing style, scope, urgency (e.g. "Modern", "3BHK", "Luxury", "Urgent", "Startup")
- intentScore: float 0–1 based on seriousness, budget clarity, description quality
- urgency: high/medium/low

Lead description:
"""
${description}
"""`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.3,
    });

    const raw = response.choices[0]?.message?.content?.trim();
    const parsed = JSON.parse(raw);

    return {
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 6) : [],
      intentScore: Math.min(1, Math.max(0, parseFloat(parsed.intentScore) || 0.5)),
      urgency: parsed.urgency || 'medium',
    };
  } catch (err) {
    console.error('OpenAI analysis failed:', err.message);
    return mockAnalysis(description);
  }
};

/**
 * Mock AI analysis — keyword-based heuristics
 */
const mockAnalysis = (description) => {
  const text = description.toLowerCase();
  const tags = [];

  // Style tags
  if (/modern|contemporary|minimali/.test(text)) tags.push('Modern');
  if (/luxury|premium|high.?end/.test(text)) tags.push('Luxury');
  if (/minimal|clean|simple/.test(text)) tags.push('Minimal');
  if (/rustic|vintage|classic/.test(text)) tags.push('Rustic');
  if (/industrial/.test(text)) tags.push('Industrial');
  if (/natural|organic|wood/.test(text)) tags.push('Natural');

  // Project size
  if (/3bhk|3 bhk/.test(text)) tags.push('3BHK');
  if (/2bhk|2 bhk/.test(text)) tags.push('2BHK');
  if (/office|commercial/.test(text)) tags.push('Commercial');
  if (/villa|bungalow/.test(text)) tags.push('Villa');

  // Urgency
  if (/urgent|asap|immediately|soon|quickly/.test(text)) tags.push('Urgent');

  // Business
  if (/startup|brand new|launch/.test(text)) tags.push('Startup');
  if (/restaurant|cafe|food/.test(text)) tags.push('F&B');

  // Fallback tags
  if (tags.length === 0) tags.push('Residential', 'Custom');

  // Intent scoring heuristics
  let score = 0.4;
  if (description.length > 150) score += 0.15; // Detailed = serious
  if (description.length > 300) score += 0.1;
  if (/budget|spend|invest|allocat/.test(text)) score += 0.1;
  if (/urgent|asap/.test(text)) score += 0.1;
  if (/ready|decision|finali/.test(text)) score += 0.1;
  if (/reference|similar to|inspired/.test(text)) score += 0.05;

  return {
    tags: tags.slice(0, 6),
    intentScore: Math.min(0.95, parseFloat(score.toFixed(2))),
  };
};

module.exports = { analyzeLeadWithAI };
