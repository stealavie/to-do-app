import React, { useState, useEffect, useCallback, type ReactNode } from 'react';
import { ChatContext, type ChatMessage, type ChatContextType } from './ChatContextDefinition';
import { chatApi } from '../services/api';

interface ChatProviderProps {
  children: ReactNode;
}

const GEMINI_API_KEY_STORAGE_KEY = 'gemini_api_key';
const CHAT_MESSAGES_STORAGE_KEY = 'chat_messages';

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: '👋 Hello! I\'m your AI assistant powered by Gemini. I can help you analyze your projects, provide recommendations, and assist with your learning goals. How can I help you today?',
  timestamp: new Date(),
};

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load API key and messages from localStorage on mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY);
    if (storedApiKey) {
      setApiKeyState(storedApiKey);
    }

    const storedMessages = localStorage.getItem(CHAT_MESSAGES_STORAGE_KEY);
    if (storedMessages) {
      try {
        const parsed = JSON.parse(storedMessages);
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages([WELCOME_MESSAGE, ...messagesWithDates]);
      } catch (error) {
        console.error('Error parsing stored chat messages:', error);
        localStorage.removeItem(CHAT_MESSAGES_STORAGE_KEY);
      }
    }
  }, []);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    const messagesToStore = messages.filter(msg => msg.id !== 'welcome');
    if (messagesToStore.length > 0) {
      localStorage.setItem(CHAT_MESSAGES_STORAGE_KEY, JSON.stringify(messagesToStore));
    }
  }, [messages]);

  const setApiKey = useCallback((key: string) => {
    setApiKeyState(key);
    localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, key);
  }, []);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    localStorage.removeItem(CHAT_MESSAGES_STORAGE_KEY);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!apiKey) {
      setError('API key is required to send messages');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Add user message immediately
    addMessage({ role: 'user', content });

    try {
      const response = await chatApi.sendMessage(content, apiKey);
      
      // Add assistant response
      addMessage({ 
        role: 'assistant', 
        content: response.message 
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, addMessage]);

  const contextValue: ChatContextType = {
    // API Key Management
    apiKey,
    setApiKey,
    hasApiKey: !!apiKey,
    
    // Chat State
    isOpen,
    setIsOpen,
    messages,
    addMessage,
    clearMessages,
    
    // Chat Actions
    sendMessage,
    isLoading,
    error,
    clearError,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};