'use client';

import { useEffect } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Notification } from '@/types/notification';

export default function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { subscribe } = useWebSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = subscribe('notification', (data: Notification) => {
      // Update notifications cache
      queryClient.setQueryData<Notification[]>(
        ['notifications'],
        (old = []) => [data, ...old]
      );

      // Show toast notification
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <img
                  className="h-10 w-10 rounded-full"
                  src={data.sender.image}
                  alt=""
                />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {data.sender.name}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {data.content}
                </p>
              </div>
            </div>
          </div>
        </div>
      ));
    });

    return () => unsubscribe();
  }, []);

  return <>{children}</>;
} 