'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export default function AnimatedTabs({ 
  tabs, 
  defaultTab,
  onChange 
}: { 
  tabs: Tab[];
  defaultTab: string;
  onChange: (id: string) => void;
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            setActiveTab(tab.id);
            onChange(tab.id);
          }}
          className={`
            relative flex items-center space-x-2 px-4 py-2 rounded-md
            text-sm font-medium transition-colors
            ${activeTab === tab.id ? 'text-white' : 'text-gray-600 hover:text-gray-900'}
          `}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="active-tab"
              className="absolute inset-0 bg-primary-500 rounded-md"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          {tab.icon && (
            <span className="relative z-10">{tab.icon}</span>
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
} 