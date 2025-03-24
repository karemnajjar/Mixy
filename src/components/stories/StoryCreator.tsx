'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Video, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StoryCreator() {
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="flex flex-col h-full">
        {/* Camera Preview */}
        <div className="flex-1 relative">
          {mode === 'photo' ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <canvas
              ref={canvasRef}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Controls */}
        <div className="p-4 bg-black/50 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            {/* Mode Toggle */}
            <div className="flex gap-2">
              <Button
                variant={mode === 'photo' ? 'default' : 'ghost'}
                onClick={() => setMode('photo')}
              >
                <Camera className="w-5 h-5" />
              </Button>
              <Button
                variant={mode === 'video' ? 'default' : 'ghost'}
                onClick={() => setMode('video')}
              >
                <Video className="w-5 h-5" />
              </Button>
            </div>

            {/* Capture Button */}
            <Button size="lg" className="rounded-full">
              {mode === 'photo' ? (
                <Camera className="w-6 h-6" />
              ) : (
                <Video className="w-6 h-6" />
              )}
            </Button>

            {/* Gallery Access */}
            <Button variant="ghost">
              <ImageIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 