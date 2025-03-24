export default function StoryCircle({ story, isActive }: { 
  story: Story; 
  isActive?: boolean;
}) {
  return (
    <div className="flex flex-col items-center space-y-1">
      <div className={`
        rounded-full p-[2px]
        ${isActive 
          ? 'bg-gradient-to-r from-primary-500 to-primary-400' 
          : 'bg-gray-200'
        }
      `}>
        <div className="bg-white p-[2px] rounded-full">
          <div className="w-14 h-14 rounded-full overflow-hidden">
            <img
              src={story.user.image}
              alt={story.user.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
      <span className="text-xs text-gray-600 truncate w-16 text-center">
        {story.user.username}
      </span>
    </div>
  );
} 