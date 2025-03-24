'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import NotificationsPanel from './NotificationsPanel';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Theme hydration fix
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className={cn(
      'min-h-screen bg-background transition-colors duration-300',
      theme === 'dark' ? 'dark' : ''
    )}>
      {/* Desktop Sidebar */}
      <Sidebar 
        user={session?.user}
        onNotifications={() => setShowNotifications(true)}
      />

      {/* Mobile Navigation */}
      <MobileNav 
        user={session?.user}
        onNotifications={() => setShowNotifications(true)}
      />

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-6xl mx-auto px-4 py-6"
        >
          {children}
        </motion.div>
      </main>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <NotificationsPanel onClose={() => setShowNotifications(false)} />
        )}
      </AnimatePresence>
    </div>
  );
} 