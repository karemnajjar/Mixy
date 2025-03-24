'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/shared/Logo';
import { 
  HomeIcon, SearchIcon, PlusCircleIcon, 
  ChatBubbleLeftIcon, UserIcon, Bars3Icon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  user: any; // Replace with proper user type
  onNotifications: () => void;
}

export default function MobileNav({ user, onNotifications }: MobileNavProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Home', href: '/feed', icon: HomeIcon },
    { name: 'Search', href: '/explore', icon: SearchIcon },
    { name: 'Create', href: '/create', icon: PlusCircleIcon },
    { name: 'Messages', href: '/messages', icon: ChatBubbleLeftIcon },
    { name: 'Profile', href: `/profile/${user?.username}`, icon: UserIcon },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 lg:hidden z-50">
        <div className="flex items-center justify-between px-4 h-full">
          <Logo size="sm" />
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 lg:hidden">
        <div className="flex justify-around">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'p-4 flex flex-col items-center',
                pathname === item.href
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute right-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Menu Content */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 