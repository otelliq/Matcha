"use client";

import { useEffect, useState } from "react";
import { ApiClient } from "@/lib/api-client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProfileCard } from "@/components/ProfileCard";
import { useToast } from "@/lib/toast-context";
import { PublicProfile } from "@/lib/types";

export default function LikersPage() {
  const [likers, setLikers] = useState<PublicProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likedProfiles, setLikedProfiles] = useState<Set<number>>(new Set());
  const { addToast, showError } = useToast();

  useEffect(() => {
    const loadLikers = async () => {
      try {
        const { data, error } = await ApiClient.getLikers(50, 0);
        if (error) {
          showError(error);
        } else {
          const response = data as any;
          setLikers(response.results?.map((l: any) => l.profile) || []);
        }
      } catch (err) {
        addToast("Failed to load likers", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadLikers();
  }, [addToast, showError]);

  const handleLike = async (userId: number) => {
    try {
      const { data, error } = await ApiClient.like(userId);
      if (error) {
        showError(error);
      } else {
        const response = data as any;
        if (response.connection_created) {
          addToast("Mutual like! You're connected!", "success");
        } else {
          addToast("Profile liked!", "success");
        }
        setLikedProfiles((prev) => new Set([...prev, userId]));
      }
    } catch (err) {
      addToast("Failed to like profile", "error");
    }
  };

  const handleBlock = async (userId: number) => {
    try {
      const { error } = await ApiClient.block(userId);
      if (error) {
        showError(error);
      } else {
        setLikers((prev) => prev.filter((l) => l.id !== userId));
        addToast("Profile blocked", "success");
      }
    } catch (err) {
      addToast("Failed to block profile", "error");
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">People Who Liked You</h1>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading likers...</p>
          </div>
        ) : likers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No one has liked your profile yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {likers.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onLike={handleLike}
                onBlock={handleBlock}
                isLiked={likedProfiles.has(profile.id)}
                showActions
              />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
