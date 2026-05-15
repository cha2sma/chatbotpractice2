import type { ChatRequest, ChatResponse } from '../types';

export async function fetchChatResponse(data: ChatRequest): Promise<ChatResponse> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch response');
    }

    return await response.json();
  } catch (error: any) {
    console.error('API Call Error:', error);
    return { content: '', error: error.message };
  }
}
