'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CameraIcon, MapPinIcon, MusicalNoteIcon, HashtagIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { ImageFilter, applyFilter } from '@/lib/imageFilters';
import { toast } from 'react-hot-toast';

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function CreatePost() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<ImageFilter>('normal');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [music, setMusic] = useState<{ title: string; artist: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Validate files
    const validFiles = selectedFiles.filter(file => {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a supported image type`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Create preview URLs
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleHashtagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const tag = hashtagInput.trim().replace(/^#/, '');
      if (tag && !hashtags.includes(tag)) {
        setHashtags(prev => [...prev, tag]);
        setHashtagInput('');
      }
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(prev => prev.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    try {
      setIsUploading(true);
      
      // Upload images to Cloudinary
      const uploadPromises = files.map(async (file, index) => {
        const filteredImage = await applyFilter(file, selectedFilter);
        const result = await uploadToCloudinary(filteredImage);
        setUploadProgress(((index + 1) / files.length) * 100);
        return result.secure_url;
      });

      const imageUrls = await Promise.all(uploadPromises);

      // Create post
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: imageUrls,
          caption,
          location,
          hashtags,
          music,
          filter: selectedFilter
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      toast.success('Post created successfully!');
      router.push('/feed');
      router.refresh();
    } catch (error) {
      toast.error('Failed to create post');
      console.error('Error creating post:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Post</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept={ALLOWED_FILE_TYPES.join(',')}
            multiple
            className="hidden"
          />
          
          {previews.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                    style={{ filter: selectedFilter !== 'normal' ? selectedFilter : 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-opacity"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
              {previews.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-primary transition-colors"
                >
                  <CameraIcon className="h-8 w-8 text-gray-400" />
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-12 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors rounded-xl"
            >
              <CameraIcon className="h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-500">Click to upload images</p>
              <p className="text-sm text-gray-400 mt-1">
                JPG, PNG, WebP (max. 5MB)
              </p>
            </button>
          )}
        </div>

        {/* Filters Section */}
        {previews.length > 0 && (
          <div className="overflow-x-auto custom-scrollbar">
            <div className="flex space-x-4 pb-2">
              {Object.entries(ImageFilter).map(([name, filter]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedFilter(filter)}
                  className={`flex-shrink-0 ${
                    selectedFilter === filter ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="w-20 h-20 relative rounded-lg overflow-hidden">
                    <Image
                      src={previews[0]}
                      alt={name}
                      fill
                      className="object-cover"
                      style={{ filter }}
                    />
                  </div>
                  <p className="text-center text-sm mt-1">{name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Caption Input */}
        <div>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            className="w-full p-4 border rounded-xl resize-none h-32 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            maxLength={2200}
          />
          <p className="text-sm text-gray-500 text-right mt-1">
            {caption.length}/2,200
          </p>
        </div>

        {/* Location Input */}
        <div className="relative">
          <div className="flex items-center border rounded-xl overflow-hidden">
            <MapPinIcon className="h-5 w-5 ml-4 text-gray-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location"
              className="w-full p-4 focus:outline-none"
            />
          </div>
        </div>

        {/* Hashtags Input */}
        <div>
          <div className="flex items-center border rounded-xl overflow-hidden">
            <HashtagIcon className="h-5 w-5 ml-4 text-gray-400" />
            <input
              type="text"
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              onKeyDown={handleHashtagInput}
              placeholder="Add hashtags (press Enter or Space)"
              className="w-full p-4 focus:outline-none"
            />
          </div>
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {hashtags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeHashtag(tag)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Music Selection */}
        <div className="relative">
          <div className="flex items-center border rounded-xl overflow-hidden">
            <MusicalNoteIcon className="h-5 w-5 ml-4 text-gray-400" />
            <input
              type="text"
              placeholder="Add music"
              className="w-full p-4 focus:outline-none"
              // Implement music search functionality
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isUploading || files.length === 0}
          className={`w-full py-4 rounded-xl font-medium text-white transition-all ${
            isUploading || files.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary hover:bg-primary/90'
          }`}
        >
          {isUploading ? (
            <div className="flex items-center justify-center">
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Uploading... {Math.round(uploadProgress)}%
            </div>
          ) : (
            'Share Post'
          )}
        </button>
      </form>
    </div>
  );
} 