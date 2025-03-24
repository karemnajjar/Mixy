'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function LikeButton({ initialLiked = false }) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (!isAnimating) {
      setIsLiked(!isLiked);
      setIsAnimating(true);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className="relative"
      whileTap={{ scale: 0.8 }}
    >
      <Heart
        className={`w-6 h-6 ${
          isLiked ? 'fill-primary-500 text-primary-500' : 'text-gray-700'
        }`}
      />
      <AnimatePresence>
        {isLiked && isAnimating && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1.5 }}
            exit={{ scale: 0 }}
            onAnimationComplete={() => setIsAnimating(false)}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Heart className="w-6 h-6 fill-primary-500 text-primary-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
} 