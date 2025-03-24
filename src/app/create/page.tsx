'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageFilter } from '@/lib/imageFilters';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { toast } from 'react-hot-toast';
import {
  PhotoIcon,
  MapPinIcon,
  MusicalNoteIcon,
  HashtagIcon,
} from '@heroicons/react/24/outline';

const MAX_FILES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function CreatePost() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<'upload' | 'filter' | 'details'>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<keyof typeof ImageFilter>('normal');
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    caption: '',
    location: '',
    hashtags: [] as string[],
    music: null as { title: string; artist: string } | null,
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (selectedFiles.length > MAX_FILES) {
      toast.error(`Maximum ${MAX_FILES} files allowed`);
      return;
    }

    const validFiles = selectedFiles.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
    setFiles(prev => [...prev, ...validFiles]);
    setStep('filter');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    try {
      setIsUploading(true);
      
      // Upload images with selected filter
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append('files', file);
      });
      formData.append('filter', selectedFilter);

      const response = await fetch('/api/posts/create', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to create post');

      toast.success('Post created successfully!');
      router.push('/feed');
    } catch (error) {
      toast.error('Failed to create post');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6"
      >
        <h1 className="text-2xl font-bold mb-6">Create New Post</h1>

        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <PhotoIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Drag photos and videos here
                </p>
                <Button variant="primary" className="mt-4">
                  Select from computer
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </motion.div>
          )}

          {step === 'filter' && (
            <motion.div
              key="filter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Filter selection UI */}
            </motion.div>
          )}

          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Post details form */}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
} 