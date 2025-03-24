import Image from 'next/image';
import { Button } from '@/components/shared/Button';
import { 
  UserPlusIcon, 
  EnvelopeIcon, 
  EllipsisHorizontalIcon 
} from '@heroicons/react/24/outline';
import { Profile } from '@/types/profile';

interface ProfileHeaderProps {
  profile: Profile;
  isOwnProfile: boolean;
  isFollowing: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
}

export default function ProfileHeader({
  profile,
  isOwnProfile,
  isFollowing,
  onFollow,
  onUnfollow,
}: ProfileHeaderProps) {
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="relative w-32 h-32 md:w-40 md:h-40">
          <Image
            src={profile.image || '/default-avatar.png'}
            alt={profile.name}
            fill
            className="rounded-full object-cover"
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-2xl font-semibold">{profile.username}</h1>
            {isOwnProfile ? (
              <div className="flex gap-2">
                <Button variant="outline">Edit Profile</Button>
                <Button variant="ghost">
                  <EllipsisHorizontalIcon className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                {isFollowing ? (
                  <Button variant="outline" onClick={onUnfollow}>
                    Following
                  </Button>
                ) : (
                  <Button variant="primary" onClick={onFollow}>
                    <UserPlusIcon className="w-5 h-5 mr-2" />
                    Follow
                  </Button>
                )}
                <Button variant="outline">
                  <EnvelopeIcon className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex gap-8 mb-4">
            <div className="text-center md:text-left">
              <span className="font-semibold">{profile.posts.length}</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">posts</span>
            </div>
            <div className="text-center md:text-left">
              <span className="font-semibold">{profile.followers.length}</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">followers</span>
            </div>
            <div className="text-center md:text-left">
              <span className="font-semibold">{profile.following.length}</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">following</span>
            </div>
          </div>

          <div>
            <h2 className="font-semibold">{profile.name}</h2>
            {profile.bio && (
              <p className="mt-2 whitespace-pre-wrap">{profile.bio}</p>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline mt-2 block"
              >
                {profile.website}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 