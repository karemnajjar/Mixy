'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import ConversationList from '@/components/messages/ConversationList';
import ChatWindow from '@/components/messages/ChatWindow';
import NewMessageModal from '@/components/messages/NewMessageModal';
import { Button } from '@/components/shared/Button';
import { PencilIcon } from '@heroicons/react/24/outline';
import { initializeFirebase } from '@/lib/firebase';
import { fetchConversations } from '@/lib/api';

export default function MessagesPage() {
  const { data: session } = useSession();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  
  useEffect(() => {
    initializeFirebase();
  }, []);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    enabled: !!session?.user,
  });

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Conversations Sidebar */}
      <div className="w-full md:w-80 border-r border-gray-200 dark:border-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Messages</h1>
            <Button
              variant="ghost"
              onClick={() => setIsNewMessageModalOpen(true)}
            >
              <PencilIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <ConversationList
          conversations={conversations || []}
          selectedId={selectedConversation}
          onSelect={setSelectedConversation}
          isLoading={isLoading}
        />
      </div>

      {/* Chat Window */}
      <div className="hidden md:flex flex-1">
        {selectedConversation ? (
          <ChatWindow conversationId={selectedConversation} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Welcome to Mixy Messages</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Select a conversation or start a new one
              </p>
              <Button
                variant="primary"
                onClick={() => setIsNewMessageModalOpen(true)}
              >
                <PencilIcon className="w-5 h-5 mr-2" />
                New Message
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* New Message Modal */}
      <AnimatePresence>
        {isNewMessageModalOpen && (
          <NewMessageModal onClose={() => setIsNewMessageModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
} 