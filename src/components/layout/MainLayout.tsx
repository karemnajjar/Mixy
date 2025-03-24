'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  UserCircleIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import { HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  PlusCircleIcon as PlusCircleIconSolid,
  ChatBubbleLeftIcon as ChatBubbleLeftIconSolid,
  HeartIcon as HeartIconSolid,
  UserCircleIcon as UserCircleIconSolid,
} from '@heroicons/react/24/solid';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigationItems = [
    { 
      name: 'Home', 
      href: '/feed', 
      icon: HomeIcon,
      activeIcon: HomeIconSolid 
    },
    { 
      name: 'Search', 
      href: '/explore', 
      icon: MagnifyingGlassIcon,
      activeIcon: MagnifyingGlassIconSolid 
    },
    { 
      name: 'Create', 
      href: '/create', 
      icon: PlusCircleIcon,
      activeIcon: PlusCircleIconSolid 
    },
    { 
      name: 'Messages', 
      href: '/messages', 
      icon: ChatBubbleLeftIcon,
      activeIcon: ChatBubbleLeftIconSolid 
    },
    { 
      name: 'Notifications', 
      href: '/notifications', 
      icon: HeartIcon,
      activeIcon: HeartIconSolid 
    },
    { 
      name: 'Profile', 
      href: `/profile/${session?.user?.username}`,
      icon: UserCircleIcon,
      activeIcon: UserCircleIconSolid 
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 hidden lg:block">
        <div className="p-6">
          <Link href="/feed" className="block">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Mixy
            </h1>
          </Link>
        </div>

        <nav className="mt-6 px-3">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = isActive ? item.activeIcon : item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 mb-2 rounded-xl transition-colors duration-200 ${
                  isActive 
                    ? 'bg-gray-100 text-primary font-medium' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <Icon className="h-6 w-6 mr-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-8 left-0 right-0 px-6">
          {session.user?.image ? (
            <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
              <Image
                src={session.user.image}
                alt={session.user.name || ''}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <p className="font-medium">{session.user.name}</p>
                <p className="text-sm text-gray-500">@{session.user.username}</p>
              </div>
            </div>
          ) : null}
        </div>
      </aside>

      {/* Mobile Header */}
      <header 
        className={`fixed top-0 left-0 right-0 h-16 bg-white lg:hidden z-50 transition-shadow duration-200 ${
          isScrolled ? 'shadow-md' : 'border-b border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between px-4 h-full">
          <Link href="/feed">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Mixy
            </h1>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-lg animate-slide-in">
            <div className="p-4">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 float-right"
              >
                ×
              </button>
              <div className="mt-8">
                {session.user?.image && (
                  <div className="flex items-center space-x-3 p-4 mb-4">
                    <Image
                      src={session.user.image}
                      alt={session.user.name || ''}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      <p className="font-medium">{session.user.name}</p>
                      <p className="text-sm text-gray-500">@{session.user.username}</p>
                    </div>
                  </div>
                )}
                <nav className="space-y-1">
                  {navigationItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = isActive ? item.activeIcon : item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center px-4 py-3 rounded-xl transition-colors duration-200 ${
                          isActive 
                            ? 'bg-gray-100 text-primary font-medium' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-6 w-6 mr-4" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden">
        <div className="flex justify-around">
          {navigationItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            const Icon = isActive ? item.activeIcon : item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`p-4 text-center ${
                  isActive ? 'text-primary' : 'text-gray-500'
                }`}
              >
                <Icon className="h-6 w-6 mx-auto" />
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
} 