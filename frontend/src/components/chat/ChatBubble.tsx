import React from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useChat } from '../../hooks/useChat';

export const ChatBubble: React.FC = () => {
  const { isOpen, setIsOpen } = useChat();

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <button
      onClick={toggleChat}
      className={`
        fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg
        transition-all duration-300 transform hover:scale-110 active:scale-95
        focus:outline-none focus:ring-4 focus:ring-primary-500/30
        ${isOpen 
          ? 'bg-secondary-600 hover:bg-secondary-700' 
          : 'bg-primary-600 hover:bg-primary-700'
        }
        z-40
      `}
      aria-label={isOpen ? 'Close chat' : 'Open AI assistant'}
    >
      <div className="flex items-center justify-center w-full h-full">
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </div>
      
      {/* Notification badge for new messages (optional for future use) */}
      {!isOpen && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-success-500 rounded-full border-2 border-white">
          <div className="w-full h-full bg-success-500 rounded-full animate-pulse" />
        </div>
      )}
    </button>
  );
};