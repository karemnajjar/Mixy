'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  MusicalNoteIcon,
  PauseIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { likeClip, shareClip } from '@/lib/api';
import type { Clip } from '@/types/clip';

interface ClipzViewerProps {
  clip: Clip;
}

export default function ClipzViewer({ clip }: ClipzViewerProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [progress, setProgress] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play();
          setIsPlaying(true);
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.5 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleLike = async () => {
    if (!session) return;

    try {
      await likeClip(clip.id);
      setIsLiked(!isLiked);
      controls.start({
        scale: [1, 1.2, 1],
        transition: { duration: 0.3 }
      });
    } catch (error) {
      console.error('Error liking clip:', error);
    }
  };

  return (
    <div className="relative h-full bg-black">
      {/* Video */}
      <video
        ref={videoRef}
        src={clip.videoUrl}
        className="h-full w-full object-cover"
        loop
        muted
        playsInline
        onClick={togglePlay}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
        >
          {!isPlaying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-black/50 rounded-full p-4"
            >
              <PlayIcon className="w-12 h-12 text-white" />
            </motion.div>
          )}
        </button>

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-600">
          <div
            className="h-full bg-primary-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* User Info */}
        <div className="absolute bottom-20 left-4">
          <div className="flex items-center">
            <Image
              src={clip.user.image}
              alt={clip.user.name}
              width={40}
              height={40}
              className="rounded-full border-2 border-white"
            />
            <div className="ml-2">
              <h3 className="text-white font-semibold">{clip.user.name}</h3>
              <p className="text-white/70 text-sm">{clip.caption}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="absolute bottom-20 right-4 space-y-4">
          <motion.button
            animate={controls}
            onClick={handleLike}
            className="flex flex-col items-center"
          >
            {isLiked ? (
              <HeartIconSolid className="w-8 h-8 text-red-500" />
            ) : (
              <HeartIcon className="w-8 h-8 text-white" />
            )}
            <span className="text-white text-sm">{clip.likes}</span>
          </motion.button>

          <button className="flex flex-col items-center">
            <ChatBubbleLeftIcon className="w-8 h-8 text-white" />
            <span className="text-white text-sm">{clip.comments}</span>
          </button>

          <button className="flex flex-col items-center">
            <ShareIcon className="w-8 h-8 text-white" />
            <span className="text-white text-sm">Share</span>
          </button>
        </div>

        {/* Music Info */}
        <div className="absolute bottom-4 left-4 flex items-center">
          <MusicalNoteIcon className="w-5 h-5 text-white" />
          <div className="ml-2 text-white">
            <p className="text-sm font-medium">{clip.music.title}</p>
            <p className="text-xs">{clip.music.artist}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 