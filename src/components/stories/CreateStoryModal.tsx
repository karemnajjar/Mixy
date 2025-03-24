'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/shared/Button';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { createStory } from '@/lib/api';

interface CreateStoryModalProps {
  onClose: () => void;
}

export default function CreateStoryModal({ onClose }: CreateStoryModalProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const mutation = useMutation({
    mutationFn: createStory,
    onSuccess: () => {
      queryClient.invalidateQueries(['stories']);
      onClose();
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!preview) return;
    setIsUploading(true);
    try {
      await mutation.mutateAsync({
        mediaUrl: preview,
        userId: session?.user?.id as string,
      });
    } catch (error) {
      console.error('Error creating story:', error);
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
          <h2 className="text-xl font-bold">Create Story</h2>
          <button onClick={onClose}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4">
          {preview ? (
            <div className="relative aspect-[9/16] rounded-xl overflow-hidden">
              <img
                src={preview}
                alt="Story preview"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setPreview(null)}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full"
              >
                <XMarkIcon className="w-5 h-5 text-white" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[9/16] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-primary-500 dark:hover:border-primary-400"
            >
              <div className="text-center">
                <PhotoIcon className="w-12 h-12 mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">Click to upload</p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          <Button
            variant="primary"
            className="w-full mt-4"
            disabled={!preview || isUploading}
            onClick={handleSubmit}
          >
            {isUploading ? 'Creating...' : 'Share Story'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
} 