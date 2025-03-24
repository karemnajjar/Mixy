'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

interface FloatingInputProps {
  label: string;
  type?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
}

export default function FloatingInput({
  label,
  type = 'text',
  error,
  value,
  onChange,
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isActive = focused || value.length > 0;

  return (
    <div className="relative">
      <motion.label
        animate={{
          y: isActive ? -24 : 0,
          scale: isActive ? 0.85 : 1,
          color: focused ? '#0099ff' : '#6b7280',
        }}
        className="absolute left-3 cursor-text"
      >
        {label}
      </motion.label>

      <div className="relative">
        <input
          type={type === 'password' && showPassword ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`
            w-full px-3 py-2 border rounded-lg outline-none transition-colors
            ${focused ? 'border-primary-500' : 'border-gray-300'}
            ${error ? 'border-red-500' : ''}
          `}
        />

        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-red-500 mt-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
} 