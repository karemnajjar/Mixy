'use client';

import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';

export default function PostCard({ post }: { post: Post }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center p-4">
        <img
          src={post.user.avatar}
          alt={post.user.name}
          className="w-10 h-10 rounded-full border-2 border-primary-100"
        />
        <div className="ml-3">
          <h3 className="font-semibold text-gray-800">{post.user.name}</h3>
          <p className="text-sm text-gray-500">{post.location}</p>
        </div>
        <button className="ml-auto text-primary-500 hover:text-primary-600">
          •••
        </button>
      </div>

      {/* Media */}
      <div className="relative aspect-square">
        <img
          src={post.image}
          alt={post.caption}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center space-x-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="text-gray-700 hover:text-primary-500"
          >
            <Heart className="w-6 h-6" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="text-gray-700 hover:text-primary-500"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="text-gray-700 hover:text-primary-500"
          >
            <Share2 className="w-6 h-6" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="ml-auto text-gray-700 hover:text-primary-500"
          >
            <Bookmark className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Likes */}
        <div className="mt-3">
          <p className="font-semibold text-gray-900">{post.likes} likes</p>
        </div>

        {/* Caption */}
        <p className="mt-2 text-gray-800">
          <span className="font-semibold">{post.user.username}</span>{' '}
          {post.caption}
        </p>

        {/* Comments */}
        <button className="mt-2 text-gray-500 text-sm">
          View all {post.comments} comments
        </button>
      </div>
    </motion.div>
  );
} 