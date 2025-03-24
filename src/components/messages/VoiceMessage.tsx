'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, Stop, Send } from 'lucide-react';

export default function VoiceMessage({ onSend }: { onSend: (blob: Blob) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      
      mediaRecorder.current.ondataavailable = (e) => {
        chunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        onSend(blob);
        chunks.current = [];
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
  };

  return (
    <motion.div
      initial={{ scale: 1 }}
      whileTap={{ scale: 0.95 }}
      className="relative"
    >
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`p-3 rounded-full ${
          isRecording ? 'bg-red-500' : 'bg-primary-500'
        } text-white`}
      >
        {isRecording ? (
          <Stop className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>
      
      {isRecording && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 px-2 py-1 rounded text-white text-xs"
        >
          Recording...
        </motion.div>
      )}
    </motion.div>
  );
} 