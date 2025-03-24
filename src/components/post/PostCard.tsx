import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { HeartIcon, ChatBubbleLeftIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

interface PostCardProps {
  post: Post;
  onLike: () => void;
  onComment: () => void;
}

export default function PostCard({ post, onLike, onComment }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const iconVariants = {
    liked: { 
      scale: [1, 1.2, 1],
      transition: { duration: 0.3 }
    },
    unliked: { 
      scale: 1
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-2xl shadow-sm overflow-hidden border border-neutral-100"
    >
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative w-10 h-10">
            <Image
              src={post.user.avatar}
              alt={post.user.name}
              fill
              className="rounded-full object-cover"
            />
            {post.user.isVerified && (
              <div className="absolute -right-1 -bottom-1 bg-primary-500 rounded-full p-1">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <h3 className="font-medium text-neutral-900">{post.user.name}</h3>
            <p className="text-sm text-neutral-500">{post.location}</p>
          </div>
        </div>
        <button className="text-neutral-500 hover:text-neutral-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Post Image */}
      <div className="relative aspect-square">
        <Image
          src={post.image}
          alt="Post image"
          fill
          className="object-cover"
        />
        <AnimatePresence>
          {post.hasMusic && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 text-white flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
              </svg>
              <span className="text-sm font-medium">{post.musicTitle}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Post Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.button
              variants={iconVariants}
              animate={isLiked ? 'liked' : 'unliked'}
              onClick={() => {
                setIsLiked(!isLiked);
                onLike();
              }}
              className="focus:outline-none"
            >
              {isLiked ? (
                <HeartIconSolid className="w-7 h-7 text-red-500" />
              ) : (
                <HeartIcon className="w-7 h-7 text-neutral-700" />
              )}
            </motion.button>
            <button 
              onClick={onComment}
              className="focus:outline-none"
            >
              <ChatBubbleLeftIcon className="w-7 h-7 text-neutral-700" />
            </button>
            <button className="focus:outline-none">
              <svg className="w-7 h-7 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <button className="focus:outline-none">
            <BookmarkIcon className="w-7 h-7 text-neutral-700" />
          </button>
        </div>

        {/* Likes */}
        <div className="mt-3">
          <p className="font-medium text-neutral-900">
            {post.likes.toLocaleString()} likes
          </p>
        </div>

        {/* Caption */}
        <div className="mt-2">
          <p className="text-neutral-900">
            <span className="font-medium mr-2">{post.user.username}</span>
            {post.caption}
          </p>
        </div>

        {/* Comments */}
        <button className="mt-2 text-neutral-500 text-sm">
          View all {post.comments} comments
        </button>

        {/* Timestamp */}
        <p className="mt-2 text-xs text-neutral-500 uppercase">
          {post.timestamp}
        </p>
      </div>
    </motion.div>
  );
} 