'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { MicrophoneIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';

export default function AudioRooms() {
  const { data: session } = useSession();
  const [isRoomCreating, setIsRoomCreating] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Audio Rooms</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Active Rooms */}
        {activeRooms.map((room) => (
          <motion.div
            key={room.id}
            whileHover={{ scale: 1.02 }}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{room.title}</h3>
              <span className="text-red-500">LIVE</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <SpeakerWaveIcon className="w-4 h-4 mr-1" />
              <span>{room.listeners} listening</span>
            </div>
          </motion.div>
        ))}

        {/* Create Room Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => setIsRoomCreating(true)}
          className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 text-center"
        >
          <MicrophoneIcon className="w-6 h-6 mx-auto mb-2 text-primary-500" />
          <span className="text-primary-500 font-medium">Create Room</span>
        </motion.button>
      </div>
    </div>
  );
} 