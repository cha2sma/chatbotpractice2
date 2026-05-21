import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import styles from './Chatbot.module.css';
import type { Message } from '../types';
import { SYSTEM_PROMPT } from '../constants';
import { fetchChatResponseStream } from '../api/chat';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '안녕하세요! 영어 단어 학습 도우미입니다. 어떤 주제나 난이도로 공부하고 싶으신가요?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // System prompt를 포함하여 API 호출
      const apiMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...newMessages,
      ];

      await fetchChatResponseStream(
        { messages: apiMessages as Message[] },
        () => {
          setIsLoading(false);
          setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
        },
        (chunk) => {
          setMessages((prev) => {
            const next = [...prev];
            const lastIndex = next.length - 1;
            if (lastIndex >= 0 && next[lastIndex].role === 'assistant') {
              next[lastIndex] = {
                ...next[lastIndex],
                content: next[lastIndex].content + chunk,
              };
            }
            return next;
          });
        }
      );
    } catch (err) {
      console.error(err);
      setError('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Bot size={24} />
        <h2>영어 단어 퀴즈 챗봇</h2>
      </div>

      <div className={styles.messageList} ref={scrollRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`${styles.message} ${
              msg.role === 'user' ? styles.userMessage : styles.botMessage
            }`}
          >
            {msg.role === 'assistant' && (
              <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Bot size={14} />
                <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>AI Teacher</span>
              </div>
            )}
            {msg.role === 'user' && (
              <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>You</span>
                <User size={14} />
              </div>
            )}
            <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className={styles.loading}>
            <Loader2 className="animate-spin" size={16} />
            AI가 생각 중입니다...
          </div>
        )}
        {error && <div className={styles.error}>{error}</div>}
      </div>

      <div className={styles.inputArea}>
        <input
          type="text"
          className={styles.input}
          placeholder="주제나 난이도를 입력하세요 (예: 여행, 초급)..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isLoading}
        />
        <button
          className={styles.sendButton}
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
