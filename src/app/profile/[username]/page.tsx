'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';
import ProfilePosts from '@/components/profile/ProfilePosts';
import ProfileSaved from '@/components/profile/ProfileSaved';
import ProfileTagged from '@/components/profile/ProfileTagged';
import { Spinner } from '@/components/shared/Spinner';
import { fetchProfile, followUser, unfollowUser } from '@/lib/api';

export default function ProfilePage() {
  const { username } = useParams();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'tagged'>('posts');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => fetchProfile(username as string),
  });

  const followMutation = useMutation({
    mutationFn: followUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['profile', username]);
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: unfollowUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['profile', username]);
    },
  });

  if (isLoading) {
    return <Spinner className="mx-auto mt-8" />;
  }

  if (!profile) {
    return (
      <div className="text-center mt-8">
        <h2 className="text-2xl font-bold">User not found</h2>
      </div>
    );
  }

  const isOwnProfile = session?.user?.id === profile.id;
  const isFollowing = profile.followers.includes(session?.user?.id);

  return (
    <div className="max-w-4xl mx-auto">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        onFollow={() => followMutation.mutate(profile.id)}
        onUnfollow={() => unfollowMutation.mutate(profile.id)}
      />

      <ProfileTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOwnProfile={isOwnProfile}
      />

      <AnimatePresence mode="wait">
        {activeTab === 'posts' && (
          <motion.div
            key="posts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ProfilePosts userId={profile.id} />
          </motion.div>
        )}

        {activeTab === 'saved' && isOwnProfile && (
          <motion.div
            key="saved"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ProfileSaved userId={profile.id} />
          </motion.div>
        )}

        {activeTab === 'tagged' && (
          <motion.div
            key="tagged"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ProfileTagged userId={profile.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 