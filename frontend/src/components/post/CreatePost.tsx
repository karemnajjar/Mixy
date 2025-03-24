'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { filters, FilterType } from '@/utils/imageFilters';
import { MapPinIcon, MusicalNoteIcon, HashtagIcon } from '@heroicons/react/24/outline';

interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  previewUrl: string;
}

export default function CreatePost() {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('normal');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [music, setMusic] = useState<MusicTrack | null>(null);
  const [searchMusic, setSearchMusic] = useState('');
  const [musicResults, setMusicResults] = useState<MusicTrack[]>([]);
  const [showMusicSearch, setShowMusicSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { user } = useAuth();

  // Handle image selection and preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  // Handle hashtag input
  const handleHashtagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const newTag = hashtagInput.trim().replace(/^#/, '');
      if (newTag && !hashtags.includes(newTag)) {
        setHashtags([...hashtags, newTag]);
        setHashtagInput('');
      }
    }
  };

  // Remove hashtag
  const removeHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(tag => tag !== tagToRemove));
  };

  // Location search
  const searchLocations = async (query: string) => {
    setLocation(query);
    if (query.length > 2) {
      try {
        const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`);
        const data = await res.json();
        setLocationSuggestions(data.features.map((f: any) => f.place_name));
      } catch (error) {
        console.error('Error searching locations:', error);
      }
    }
  };

  // Music search
  const searchMusicTracks = async (query: string) => {
    setSearchMusic(query);
    if (query.length > 2) {
      try {
        // Replace with your actual music API
        const res = await fetch(`/api/music/search?q=${query}`);
        const data = await res.json();
        setMusicResults(data.tracks);
      } catch (error) {
        console.error('Error searching music:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || images.length === 0) return;

    setLoading(true);
    const formData = new FormData();
    
    images.forEach(image => {
      formData.append('images', image);
    });
    
    formData.append('caption', caption);
    formData.append('location', location);
    formData.append('hashtags', JSON.stringify(hashtags));
    formData.append('filter', selectedFilter);
    if (music) {
      formData.append('music', JSON.stringify(music));
    }

    try {
      const res = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to create post');

      // Reset form
      setImages([]);
      setPreviews([]);
      setCaption('');
      setLocation('');
      setHashtags([]);
      setMusic(null);
      setSelectedFilter('normal');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 mb-8 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
        <span className="gradient-bg p-2 rounded-lg text-white mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </span>
        Create New Post
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 transition-all duration-300 hover:border-primary-color">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            multiple
            accept="image/*"
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer block text-center">
            {previews.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden post-shadow">
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      style={{ filter: filters[selectedFilter] }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 text-lg">Click to upload images</p>
                <p className="text-gray-400 text-sm mt-2">Share your moments with the world</p>
              </div>
            )}
          </label>
        </div>

        {/* Filters Section */}
        {previews.length > 0 && (
          <div className="custom-scrollbar overflow-x-auto -mx-4 px-4">
            <div className="flex space-x-4 pb-2">
              {Object.keys(filters).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setSelectedFilter(filter as FilterType)}
                  className={`filter-preview flex-shrink-0 rounded-lg overflow-hidden ${
                    selectedFilter === filter ? 'ring-2 ring-primary-color ring-offset-2' : ''
                  }`}
                >
                  <div className="w-20 h-20 relative">
                    <Image
                      src={previews[0]}
                      alt={filter}
                      fill
                      className="object-cover"
                      style={{ filter: filters[filter as FilterType] }}
                    />
                  </div>
                  <p className="text-center text-sm mt-2 font-medium">{filter}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Caption Input */}
        <div className="space-y-2">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            className="w-full p-4 border rounded-xl resize-none h-32 focus:ring-2 focus:ring-primary-color focus:border-transparent transition-all duration-300"
          />
        </div>

        {/* Location Section */}
        <div className="relative">
          <div className="flex items-center border rounded-xl overflow-hidden hover:border-primary-color transition-colors duration-300">
            <MapPinIcon className="h-5 w-5 ml-4 text-gray-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => searchLocations(e.target.value)}
              onFocus={() => setShowLocationSearch(true)}
              placeholder="Add location"
              className="w-full p-4 focus:outline-none"
            />
          </div>
          {showLocationSearch && locationSuggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white border rounded-xl mt-2 shadow-lg animate-fade-in">
              {locationSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  onClick={() => {
                    setLocation(suggestion);
                    setShowLocationSearch(false);
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hashtags Section */}
        <div className="space-y-3">
          <div className="flex items-center border rounded-xl overflow-hidden hover:border-primary-color transition-colors duration-300">
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
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeHashtag(tag)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Music Section */}
        <div className="relative">
          <div className="flex items-center border rounded-xl overflow-hidden hover:border-primary-color transition-colors duration-300">
            <MusicalNoteIcon className="h-5 w-5 ml-4 text-gray-400" />
            <input
              type="text"
              value={searchMusic}
              onChange={(e) => searchMusicTracks(e.target.value)}
              onFocus={() => setShowMusicSearch(true)}
              placeholder="Add music"
              className="w-full p-4 focus:outline-none"
            />
          </div>
          {showMusicSearch && musicResults.length > 0 && (
            <div className="absolute z-10 w-full bg-white border rounded-xl mt-2 shadow-lg animate-fade-in">
              {musicResults.map((track) => (
                <div
                  key={track.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  onClick={() => {
                    setMusic(track);
                    setSearchMusic(`${track.title} - ${track.artist}`);
                    setShowMusicSearch(false);
                  }}
                >
                  <div>
                    <p className="font-medium">{track.title}</p>
                    <p className="text-sm text-gray-500">{track.artist}</p>
                  </div>
                  {track.previewUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (audioRef.current) {
                          audioRef.current.src = track.previewUrl;
                          audioRef.current.play();
                        }
                      }}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      Preview
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || images.length === 0}
          className={`w-full bg-blue-500 text-white py-2 rounded-lg ${
            loading || images.length === 0
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-blue-600'
          }`}
        >
          {loading ? 'Posting...' : 'Share Post'}
        </button>
      </form>

      {/* Hidden audio element for music preview */}
      <audio ref={audioRef} />
    </div>
  );
} 