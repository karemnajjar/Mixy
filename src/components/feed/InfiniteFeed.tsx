'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface Post {
  id: string;
  // ... other post properties
}

export default function InfiniteFeed() {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(`/api/v1/feed?page=${pageParam}`);
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  React.useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  return (
    <div className="space-y-6">
      <AnimatePresence mode="popLayout">
        {status === 'loading' ? (
          <div className="flex justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
          </div>
        ) : status === 'error' ? (
          <div className="text-center text-red-500">Error loading feed</div>
        ) : (
          data.pages.map((page, i) => (
            <React.Fragment key={i}>
              {page.posts.map((post: Post, index: number) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PostCard post={post} />
                </motion.div>
              ))}
            </React.Fragment>
          ))
        )}
      </AnimatePresence>

      {/* Loading indicator */}
      <div ref={ref} className="h-20 flex items-center justify-center">
        {isFetchingNextPage && (
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
        )}
      </div>
    </div>
  );
} 