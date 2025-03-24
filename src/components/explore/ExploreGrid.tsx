import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { HeartIcon, ChatBubbleLeftIcon, PlayIcon } from '@heroicons/react/24/solid';

interface ExploreGridProps {
  data: any[];
  type: string;
}

export default function ExploreGrid({ data, type }: ExploreGridProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-3 md:grid-cols-4 gap-1 md:gap-4"
    >
      {data.map((content) => (
        <motion.div
          key={content.id}
          variants={item}
          className="relative aspect-square group"
        >
          <Link href={`/${type}/${content.id}`}>
            <div className="relative w-full h-full overflow-hidden rounded-lg">
              <Image
                src={content.thumbnail}
                alt={content.caption}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex gap-4 text-white">
                  {content.type === 'video' && (
                    <PlayIcon className="w-8 h-8" />
                  )}
                  <div className="flex items-center">
                    <HeartIcon className="w-5 h-5 mr-1" />
                    <span>{content.likes}</span>
                  </div>
                  <div className="flex items-center">
                    <ChatBubbleLeftIcon className="w-5 h-5 mr-1" />
                    <span>{content.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
} 