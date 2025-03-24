'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart, Send } from 'lucide-react';

export default function StoryViewer({ stories, initialIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    startProgress();
    return () => clearInterval(progressInterval.current);
  }, [currentIndex]);

  const startProgress = () => {
    setProgress(0);
    clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + 1;
      });
    }, 30);
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Progress Bars */}
      <div className="absolute top-0 left-0 right-0 flex gap-1 p-2">
        {stories.map((_, index) => (
          <div
            key={index}
            className="h-0.5 flex-1 bg-white/30 overflow-hidden"
          >
            {index === currentIndex && (
              <motion.div
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Story Content */}
      <div className="relative h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            <img
              src={stories[currentIndex].image}
              alt=""
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12"
        />
        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12"
        />

        {/* Actions */}
        <div className="absolute bottom-4 left-0 right-0 flex items-center px-4">
          <input
            type="text"
            placeholder="Send message..."
            className="flex-1 bg-white/10 backdrop-blur-lg text-white rounded-full px-4 py-2 border border-white/20"
          />
          <button className="ml-2 text-white">
            <Heart className="w-6 h-6" />
          </button>
          <button className="ml-2 text-white">
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
} 