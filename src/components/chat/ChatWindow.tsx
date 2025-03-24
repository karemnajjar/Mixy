'use client';

import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Message } from '@/types/chat';

interface ChatWindowProps {
  conversationId: string;
  recipientId: string;
}

export default function ChatWindow({ conversationId, recipientId }: ChatWindowProps) {
  const { data: session } = useSession();
  const { sendMessage, subscribe } = useWebSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { ref, inView } = useInView();

  useEffect(() => {
    // Subscribe to new messages
    const unsubscribeMessage = subscribe('new-message', (data) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) => [...prev, data.message]);
        scrollToBottom();
      }
    });

    // Subscribe to typing indicators
    const unsubscribeTyping = subscribe('typing', (data) => {
      if (data.conversationId === conversationId && data.senderId === recipientId) {
        setIsTyping(true);
        if (typingTimeout) {
          clearTimeout(typingTimeout);
        }
        const timeout = setTimeout(() => setIsTyping(false), 3000);
        setTypingTimeout(timeout);
      }
    });

    // Subscribe to read receipts
    const unsubscribeRead = subscribe('read', (data) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.senderId === session?.user.id ? { ...msg, read: true } : msg
          )
        );
      }
    });

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
      unsubscribeRead();
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [conversationId, recipientId, session?.user.id]);

  const handleTyping = () => {
    sendMessage({
      type: 'typing',
      conversationId,
      recipientId,
    });
  };

  const handleSendMessage = (content: string) => {
    sendMessage({
      type: 'new-message',
      conversationId,
      recipientId,
      content,
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${
                message.senderId === session?.user.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.senderId === session?.user.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <p>{message.content}</p>
                <div className="text-xs mt-1 opacity-70">
                  {message.senderId === session?.user.id && message.read && (
                    <span>✓✓</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        onSend={handleSendMessage}
        onTyping={handleTyping}
      />
    </div>
  );
} 