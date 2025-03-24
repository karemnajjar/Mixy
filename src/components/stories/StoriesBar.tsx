'use client';

import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import StoryCircle from './StoryCircle';
import { Button } from '@/components/shared/Button';
import { fetchStories } from '@/lib/api';

export default function StoriesBar() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: stories, isLoading } = useQuery({
    queryKey: ['stories'],
    queryFn: fetchStories,
  });

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
      <div className="flex items-center">
        {/* Scroll Left Button */}
        <Button
          variant="ghost"
          className="absolute left-2 z-10 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
          onClick={() => scroll('left')}
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </Button>

        {/* Stories Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4"
        >
          {/* Add Story Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0"
          >
            <StoryCircle
              type="create"
              onClick={() => {/* Open story creation modal */}}
            />
          </motion.div>

          {/* Story Circles */}
          {stories?.map((story) => (
            <motion.div
              key={story.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0"
            >
              <StoryCircle story={story} />
            </motion.div>
          ))}
        </div>

        {/* Scroll Right Button */}
        <Button
          variant="ghost"
          className="absolute right-2 z-10 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
          onClick={() => scroll('right')}
        >
          <ChevronRightIcon className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
} 