'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: string;
}

export default function BottomSheet({
  isOpen,
  onClose,
  children,
  height = '50vh',
}: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            style={{ height }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[20px] z-50 overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center p-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Content */}
            <div className="px-4 pb-4 overflow-y-auto max-h-[calc(100%-2rem)]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 