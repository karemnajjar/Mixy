'use client';

import { motion } from 'framer-motion';
import { Home, Search, PlusSquare, Heart, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileTabBar() {
  const pathname = usePathname();

  const tabs = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: PlusSquare, label: 'Create', path: '/create' },
    { icon: Heart, label: 'Activity', path: '/activity' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 sm:hidden">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.path;

          return (
            <Link
              key={tab.path}
              href={tab.path}
              className="relative flex flex-col items-center justify-center w-full h-full"
            >
              <Icon
                className={`w-6 h-6 ${
                  isActive ? 'text-primary-500' : 'text-gray-500'
                }`}
              />
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 w-1/2 h-0.5 bg-primary-500"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
} 