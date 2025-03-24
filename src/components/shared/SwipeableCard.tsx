'use client';

import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { X, Heart } from 'lucide-react';

interface SwipeableCardProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  children: React.ReactNode;
}

export default function SwipeableCard({
  onSwipeLeft,
  onSwipeRight,
  children,
}: SwipeableCardProps) {
  const [exitX, setExitX] = useState<number>(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 100 && onSwipeRight) {
      setExitX(200);
      onSwipeRight();
    } else if (info.offset.x < -100 && onSwipeLeft) {
      setExitX(-200);
      onSwipeLeft();
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={{ x: exitX }}
      style={{ x, rotate, opacity }}
      className="absolute w-full"
    >
      <div className="relative">
        {children}
        
        {/* Swipe Indicators */}
        <motion.div
          style={{
            opacity: useTransform(x, [-100, 0], [1, 0]),
          }}
          className="absolute left-4 top-4 bg-red-500 text-white p-2 rounded-full"
        >
          <X className="w-6 h-6" />
        </motion.div>
        
        <motion.div
          style={{
            opacity: useTransform(x, [0, 100], [0, 1]),
          }}
          className="absolute right-4 top-4 bg-green-500 text-white p-2 rounded-full"
        >
          <Heart className="w-6 h-6" />
        </motion.div>
      </div>
    </motion.div>
  );
} 