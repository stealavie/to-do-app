import React, { useState, useRef, useEffect } from 'react';
import { Send, Settings, Trash2, Bot, User } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { ApiKeyModal } from './ApiKeyModal';
import { Button } from '../ui/Button';

export const ChatWindow: React.FC = () => {
  const {
    isOpen,
    messages,
    sendMessage,
    isLoading,
    error,
    clearError,
    hasApiKey,
    setApiKey,
    clearMessages,
  } = useChat();

  const [inputMessage, setInputMessage] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && hasApiKey) {
      inputRef.current?.focus();
    }
  }, [isOpen, hasApiKey]);

  // Show API key modal if no key is set when chat opens
  useEffect(() => {
    if (isOpen && !hasApiKey) {
      setShowApiKeyModal(true);
    }
  }, [isOpen, hasApiKey]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    if (!hasApiKey) {
      setShowApiKeyModal(true);
      return;
    }

    const message = inputMessage.trim();
    setInputMessage('');
    
    try {
      await sendMessage(message);
    } catch (error) {
      // Error is handled by context
    }
  };

  const handleApiKeySave = (apiKey: string) => {
    setApiKey(apiKey);
    clearError();
    // Focus input after saving API key
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-secondary-200 flex flex-col z-30">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-secondary-200 bg-gradient-to-r from-primary-50 to-primary-100 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-600 rounded-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-900">AI Assistant</h3>
              <p className="text-xs text-secondary-600">
                {hasApiKey ? 'Powered by Gemini' : 'API key required'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowApiKeyModal(true)}
              className="p-2 hover:bg-primary-200 rounded-lg transition-colors"
              title="API Key Settings"
            >
              <Settings className="h-4 w-4 text-secondary-600" />
            </button>
            <button
              onClick={clearMessages}
              className="p-2 hover:bg-danger-100 text-danger-600 rounded-lg transition-colors"
              title="Clear Chat"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                ${message.role === 'user' 
                  ? 'bg-primary-600' 
                  : 'bg-secondary-100'
                }
              `}>
                {message.role === 'user' ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-secondary-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`
                  px-4 py-3 rounded-2xl max-w-[280px] break-words
                  ${message.role === 'user'
                    ? 'bg-primary-600 text-white ml-auto'
                    : 'bg-secondary-100 text-secondary-900'
                  }
                `}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
                <p className={`
                  text-xs text-secondary-500 mt-1
                  ${message.role === 'user' ? 'text-right' : 'text-left'}
                `}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center">
                <Bot className="h-4 w-4 text-secondary-600" />
              </div>
              <div className="bg-secondary-100 px-4 py-3 rounded-2xl">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mb-2 p-3 bg-danger-50 border border-danger-200 rounded-xl">
            <p className="text-danger-700 text-sm">{error}</p>
            <button
              onClick={clearError}
              className="text-danger-600 hover:text-danger-700 text-xs font-medium mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Input Form */}
        <div className="p-4 border-t border-secondary-200">
          {!hasApiKey ? (
            <div className="text-center">
              <p className="text-sm text-secondary-600 mb-3">
                Set up your Gemini API key to start chatting
              </p>
              <Button
                onClick={() => setShowApiKeyModal(true)}
                variant="primary"
                size="sm"
                className="w-full"
              >
                Configure API Key
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors disabled:bg-secondary-50"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:bg-secondary-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSave={handleApiKeySave}
      />
    </>
  );
};