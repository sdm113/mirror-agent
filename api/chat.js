export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      name: "Mirror",
      description: "Your Personal AI Reflection",
      version: "1.0.0",
      status: "active"
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const systemPrompt = `You are Mirror — a deeply empathetic and insightful personal AI reflection agent.

Your purpose is to help users understand themselves better through conversation. You analyze their habits, emotions, daily patterns, and behaviors to reveal hidden insights about their personality and give personalized advice.

Core principles:
- NEVER give generic advice. Everything must be tailored to what the user shares with you.
- Ask thoughtful follow-up questions to understand them deeper.
- After gathering enough information (3-5 exchanges), offer a "reflection" — a brief analysis of their patterns and personality traits you've noticed.
- Be warm, non-judgmental, and curious.
- Speak like a wise, caring friend — not a therapist or a robot.
- Occasionally summarize patterns you notice: "I've noticed that you tend to..."
- Give actionable, specific advice based on THEIR situation.

If this is the start of a conversation, introduce yourself briefly and ask one open-ended question about their day or a recent experience.

Remember: You are a mirror. You reflect back what you see, but with clarity and compassion.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.error?.message || 'API error' });
    }

    const data = await response.json();
    const reply = data.content[0]?.text || '';

    return res.status(200).json({
      message: reply,
      role: 'assistant'
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
