import type { ChatRequest } from '../types';

export async function fetchChatResponseStream(
  data: ChatRequest,
  onStart: () => void,
  onChunk: (chunk: string) => void
): Promise<void> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to fetch response';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (_) {
      // Ignore JSON parse error if body is not JSON
    }
    throw new Error(errorMessage);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Readable stream is not supported or response body is empty');
  }

  onStart();

  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      onChunk(chunk);
    }
  } finally {
    reader.releaseLock();
  }
}
