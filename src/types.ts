export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: Message[];
}

export interface ChatResponse {
  content: string;
  error?: string;
}
