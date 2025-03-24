'use client';

import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const y = useMotionValue(0);
  const rotation = useTransform(y, [0, 100], [0, 360]);
  const controls = useAnimation();

  useEffect(() => {
    let touchStart = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        touchStart = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStart === 0) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - touchStart;
      
      if (diff > 0 && window.scrollY === 0) {
        y.set(Math.min(diff / 2, 100));
        e.preventDefault();
      }
    };

    const handleTouchEnd = async () => {
      if (y.get() > 50 && !isRefreshing) {
        setIsRefreshing(true);
        await onRefresh();
        setIsRefreshing(false);
      }
      controls.start({ y: 0 });
      y.set(0);
      touchStart = 0;
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isRefreshing]);

  return (
    <div className="relative">
      <motion.div
        style={{ y }}
        animate={controls}
        className="absolute left-0 right-0 flex justify-center -top-16"
      >
        <motion.div style={{ rotate: rotation }}>
          <Loader2 className="w-8 h-8 text-primary-500" />
        </motion.div>
      </motion.div>
      {children}
    </div>
  );
} 