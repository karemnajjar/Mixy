'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useState, useEffect } from 'react';
import PostCard from '@/components/post/PostCard';
import StoriesBar from '@/components/stories/StoriesBar';
import { Spinner } from '@/components/shared/Spinner';
import { fetchFeedPosts } from '@/lib/api';

export default function FeedPage() {
  const { ref, inView } = useInView();
  const [mounted, setMounted] = useState(false);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: fetchFeedPosts,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  if (!mounted) return null;

  if (status === 'loading') {
    return <Spinner className="mx-auto mt-8" />;
  }

  if (status === 'error') {
    return (
      <div className="text-center mt-8 text-red-500">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <StoriesBar />
      
      <div className="space-y-6 mt-6">
        {data.pages.map((page) =>
          page.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>

      <div ref={ref} className="h-20 flex items-center justify-center">
        {isFetchingNextPage && <Spinner />}
      </div>
    </div>
  );
} 