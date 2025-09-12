import React from 'react';
import { ChatBubble } from './ChatBubble';
import { ChatWindow } from './ChatWindow';

export const Chat: React.FC = () => {
  return (
    <>
      <ChatBubble />
      <ChatWindow />
    </>
  );
};