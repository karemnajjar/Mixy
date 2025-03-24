import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'white';
}

export default function Logo({ size = 'md', variant = 'default' }: LogoProps) {
  const sizes = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
  };

  return (
    <motion.div
      className={`flex items-center ${sizes[size]}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <svg
        viewBox="0 0 124 32"
        className={`${sizes[size]} ${
          variant === 'white' ? 'text-white' : 'text-primary-500'
        }`}
      >
        {/* Custom SVG logo path */}
        <path
          d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 17.5c-3.038 0-5.5-2.462-5.5-5.5s2.462-5.5 5.5-5.5 5.5 2.462 5.5 5.5-2.462 5.5-5.5 5.5z"
          fill="currentColor"
        />
        <text
          x="32"
          y="20"
          className="text-2xl font-bold"
          style={{
            fontFamily: 'Clash Display, sans-serif',
            fill: variant === 'white' ? '#FFFFFF' : '#2E8EFF',
          }}
        >
          Mixy
        </text>
      </svg>
    </motion.div>
  );
} 