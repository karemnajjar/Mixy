'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { PaperAirplaneIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/shared/Button';
import { useRealtime } from '@/hooks/useRealtime';
import { fetchMessages, sendMessage } from '@/lib/api';

interface ChatWindowProps {
  conversationId: string;
}

export default function ChatWindow({ conversationId }: ChatWindowProps) {
  const { data: session } = useSession();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => fetchMessages(conversationId),
  });

  // Real-time messages subscription
  const { data: realtimeMessages } = useRealtime(`messages/${conversationId}`);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, realtimeMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await sendMessage({
        conversationId,
        content: message,
        type: 'text',
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversationId', conversationId);

      await fetch('/api/messages/upload', {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          <Image
            src={messages?.participant.image || '/default-avatar.png'}
            alt={messages?.participant.name || ''}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="ml-3">
            <h2 className="font-semibold">{messages?.participant.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {messages?.participant.isOnline ? 'Active now' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${
              msg.userId === session?.user?.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                msg.userId === session?.user?.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              {msg.type === 'image' ? (
                <Image
                  src={msg.content}
                  alt="Shared image"
                  width={300}
                  height={300}
                  className="rounded-lg"
                />
              ) : (
                <p>{msg.content}</p>
              )}
              <p className="text-xs mt-1 opacity-70">
                {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
              </p>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <PhotoIcon className="w-6 h-6" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Button
            type="submit"
            variant="primary"
            className="rounded-full"
            disabled={!message.trim()}
          >
            <PaperAirplaneIcon className="w-5 h-5 rotate-90" />
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </form>
    </div>
  );
} 