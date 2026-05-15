import { OpenAI } from 'openai';
import type { Message } from '../src/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { messages } = (await req.json()) as { messages: Message[] };

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid messages' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Or 'gpt-4o' if preferred, but gpt-3.5-turbo is cheaper/faster for practice
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || '죄송합니다. 답변을 생성하지 못했습니다.';

    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
