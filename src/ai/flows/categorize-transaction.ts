// This file uses server-side code.
'use server';

/**
 * Suggest a transaction category based on description and vendor using an OpenAI model.
 */

interface ChatChoice {
  message?: { content?: string };
}
interface ChatResponse {
  choices?: ChatChoice[];
}

export async function suggestCategory(description: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('OPENAI_API_KEY is not set');
    return '';
  }
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              'You are a financial assistant that categorizes transactions. Respond with only the category name.',
          },
          {
            role: 'user',
            content: `Vendor and description: ${description}`,
          },
        ],
        max_tokens: 10,
        temperature: 0,
      }),
    });

    if (!res.ok) {
      console.error('OpenAI API error', res.status, res.statusText);
      return '';
    }
    const data: ChatResponse = await res.json();
    return data.choices?.[0]?.message?.content?.trim() ?? '';
  } catch (err) {
    console.error('suggestCategory error', err);
    return '';
  }
}

