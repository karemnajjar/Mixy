'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  ChatBubbleLeftIcon 
} from '@heroicons/react/24/solid';
import { Spinner } from '@/components/shared/Spinner';
import { fetchUserPosts } from '@/lib/api';

interface ProfilePostsProps {
  userId: string;
}

export default function ProfilePosts({ userId }: ProfilePostsProps) {
  const { ref, inView } = useInView();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['userPosts', userId],
    queryFn: () => fetchUserPosts(userId),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  if (status === 'loading') {
    return <Spinner className="mx-auto mt-8" />;
  }

  if (status === 'error') {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-8">
      {data.pages.map((page) =>
        page.posts.map((post) => (
          <Link
            key={post.id}
            href={`/p/${post.id}`}
            className="relative aspect-square group"
          >
            <Image
              src={post.images[0]}
              alt=""
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex gap-6 text-white">
                <div className="flex items-center">
                  <HeartIcon className="w-6 h-6 mr-2" />
                  <span className="font-semibold">{post.likes.length}</span>
                </div>
                <div className="flex items-center">
                  <ChatBubbleLeftIcon className="w-6 h-6 mr-2" />
                  <span className="font-semibold">{post.comments.length}</span>
                </div>
              </div>
            </div>
          </Link>
        ))
      )}

      <div ref={ref} className="col-span-3 h-20 flex items-center justify-center">
        {isFetchingNextPage && <Spinner />}
      </div>
    </div>
  );
} 