'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/shared/Button';
import { 
  HomeIcon, SearchIcon, PlusCircleIcon, 
  ChatBubbleLeftIcon, HeartIcon, UserIcon,
  SunIcon, MoonIcon
} from '@heroicons/react/24/outline';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface SidebarProps {
  user: any; // Replace with proper user type
  onNotifications: () => void;
}

export default function Sidebar({ user, onNotifications }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isCreating, setIsCreating] = useState(false);

  const navigationItems = [
    { name: 'Home', href: '/feed', icon: HomeIcon },
    { name: 'Search', href: '/explore', icon: SearchIcon },
    { name: 'Create', href: '/create', icon: PlusCircleIcon },
    { name: 'Messages', href: '/messages', icon: ChatBubbleLeftIcon },
    { name: 'Profile', href: `/profile/${user?.username}`, icon: UserIcon },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 hidden lg:block">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <Logo />
        </div>

        <nav className="flex-1 px-3">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-4 py-3 mb-2 rounded-xl transition-colors',
                pathname === item.href
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <item.icon className="w-6 h-6 mr-4" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}

          <button
            onClick={onNotifications}
            className="flex items-center w-full px-4 py-3 mb-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <HeartIcon className="w-6 h-6 mr-4" />
            <span className="font-medium">Notifications</span>
          </button>
        </nav>

        <div className="p-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {theme === 'dark' ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>
            <Button
              variant="ghost"
              onClick={() => setIsCreating(true)}
            >
              Settings
            </Button>
          </div>

          {user && (
            <div className="flex items-center">
              <img
                src={user.image || '/default-avatar.png'}
                alt={user.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="ml-3">
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
} 