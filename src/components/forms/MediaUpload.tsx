'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Video, X, Upload } from 'lucide-react';

interface MediaUploadProps {
  onFileSelect: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
  multiple?: boolean;
}

export default function MediaUpload({
  onFileSelect,
  maxFiles = 10,
  accept = 'image/*,video/*',
  multiple = true,
}: MediaUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList) => {
    const selectedFiles = Array.from(files).slice(0, maxFiles);
    
    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    onFileSelect(selectedFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removePreview = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <motion.div
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        animate={{
          scale: isDragging ? 1.02 : 1,
          borderColor: isDragging ? '#0099ff' : '#e5e7eb',
        }}
        className="relative border-2 border-dashed rounded-lg p-8 text-center"
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload className="w-12 h-12 text-primary-500" />
          </div>
          <div>
            <p className="text-gray-700">Drag and drop or</p>
            <button
              onClick={() => inputRef.current?.click()}
              className="text-primary-500 font-medium hover:underline"
            >
              browse files
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Supported formats: JPG, PNG, GIF, MP4
          </p>
        </div>
      </motion.div>

      {/* Previews */}
      <div className="grid grid-cols-3 gap-4">
        <AnimatePresence>
          {previews.map((preview, index) => (
            <motion.div
              key={preview}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative aspect-square rounded-lg overflow-hidden"
            >
              <img
                src={preview}
                alt=""
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removePreview(index)}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
} 