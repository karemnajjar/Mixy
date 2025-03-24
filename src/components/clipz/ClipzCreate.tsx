'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import {
  VideoCameraIcon,
  MusicalNoteIcon,
  HashtagIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { createClip } from '@/lib/api';

interface ClipzCreateProps {
  onClose: () => void;
}

export default function ClipzCreate({ onClose }: ClipzCreateProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [music, setMusic] = useState({ title: '', artist: '' });
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const handleSubmit = async () => {
    if (!videoPreview || !session) return;
    setIsUploading(true);

    try {
      await createClip({
        videoUrl: videoPreview,
        caption,
        music,
        hashtags,
        userId: session.user.id,
      });

      queryClient.invalidateQueries(['clipz']);
      onClose();
    } catch (error) {
      console.error('Error creating clip:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-bold">Create New Clipz</h2>
          <button onClick={onClose}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4">
          {videoPreview ? (
            <div className="relative aspect-[9/16] rounded-xl overflow-hidden">
              <video
                src={videoPreview}
                className="w-full h-full object-cover"
                controls
              />
              <button
                onClick={() => setVideoPreview(null)}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full"
              >
                <XMarkIcon className="w-5 h-5 text-white" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[9/16] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-primary-500"
            >
              <div className="text-center">
                <VideoCameraIcon className="w-12 h-12 mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">Upload your Clipz</p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          <div className="space-y-4 mt-4">
            <Input
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />

            <div className="flex gap-2">
              <Input
                placeholder="Music title"
                icon={<MusicalNoteIcon className="w-5 h-5" />}
                value={music.title}
                onChange={(e) => setMusic({ ...music, title: e.target.value })}
              />
              <Input
                placeholder="Artist"
                value={music.artist}
                onChange={(e) => setMusic({ ...music, artist: e.target.value })}
              />
            </div>

            <Input
              placeholder="Add hashtags"
              icon={<HashtagIcon className="w-5 h-5" />}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  setHashtags([...hashtags, e.currentTarget.value]);
                  e.currentTarget.value = '';
                }
              }}
            />

            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag) => (
                  <div
                    key={tag}
                    className="bg-primary-100 text-primary-600 px-2 py-1 rounded-full text-sm"
                  >
                    #{tag}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            variant="primary"
            className="w-full mt-6"
            disabled={!videoPreview || isUploading}
            onClick={handleSubmit}
          >
            {isUploading ? 'Uploading...' : 'Share Clipz'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
} 