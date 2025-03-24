'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface FABProps {
  onClick: () => void;
  icon?: React.ReactNode;
}

export default function FloatingActionButton({ 
  onClick, 
  icon = <Plus className="w-6 h-6" />
}: FABProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-primary-500 text-white shadow-lg flex items-center justify-center"
      style={{
        boxShadow: '0 4px 14px rgba(0, 153, 255, 0.3)',
      }}
    >
      {icon}
    </motion.button>
  );
} 