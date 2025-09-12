import { createContext } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatContextType {
  // API Key Management
  apiKey: string | null;
  setApiKey: (key: string) => void;
  hasApiKey: boolean;
  
  // Chat State
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  
  // Chat Actions
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);