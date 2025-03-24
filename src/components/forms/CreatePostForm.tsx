'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Upload, X, Loader2 } from 'lucide-react';

const postSchema = z.object({
  caption: z.string()
    .min(1, 'Caption is required')
    .max(2200, 'Caption must be less than 2200 characters'),
  location: z.string().optional(),
  media: z.array(z.any())
    .min(1, 'At least one photo or video is required')
    .max(10, 'Maximum 10 media items allowed'),
  tags: z.array(z.string()).optional(),
});

export default function CreatePostForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(postSchema),
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('caption', data.caption);
      if (data.location) formData.append('location', data.location);
      mediaFiles.forEach(file => formData.append('media', file));

      const response = await fetch('/api/v1/posts', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to create post');

      reset();
      setMediaFiles([]);
      setMediaPreviews([]);
      // Show success notification
    } catch (error) {
      // Show error notification
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaSelect = (files: FileList) => {
    const newFiles = Array.from(files).slice(0, 10 - mediaFiles.length);
    setMediaFiles(prev => [...prev, ...newFiles]);

    // Generate previews
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Media Upload */}
      <div className="relative">
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={(e) => e.target.files && handleMediaSelect(e.target.files)}
          className="hidden"
          id="media-upload"
        />
        
        <motion.label
          htmlFor="media-upload"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer"
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <span className="mt-2 block text-sm font-medium text-gray-900">
            Add photos or videos
          </span>
        </motion.label>

        {/* Media Previews */}
        {mediaPreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            {mediaPreviews.map((preview, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={preview}
                  alt=""
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setMediaFiles(prev => prev.filter((_, i) => i !== index));
                    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Caption */}
      <div>
        <textarea
          {...register('caption')}
          placeholder="Write a caption..."
          className="w-full p-4 border rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={4}
        />
        {errors.caption && (
          <p className="mt-1 text-sm text-red-500">
            {errors.caption.message as string}
          </p>
        )}
      </div>

      {/* Location */}
      <div>
        <input
          {...register('location')}
          type="text"
          placeholder="Add location"
          className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium disabled:opacity-50"
      >
        {isSubmitting ? (
          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
        ) : (
          'Share'
        )}
      </motion.button>
    </form>
  );
} 