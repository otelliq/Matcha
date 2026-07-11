"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { ApiClient } from "@/lib/api-client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { Button } from "@/components/Button";
import { PublicProfile } from "@/lib/types";

export default function PublicProfilePage() {
  const params = useParams();
  const profileId = Number(params.id);
  const { user } = useAuth();
  const { addToast, showError } = useToast();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data, error } = await ApiClient.getProfile(profileId);
        if (error) {
          showError(error);
        } else {
          setProfile(data as PublicProfile);
        }
      } catch (err) {
        addToast("Failed to load profile", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [profileId, addToast, showError]);

  const handleLike = async () => {
    if (!user?.pictures || user.pictures.length === 0) {
      addToast("You need at least one profile picture to like someone", "error");
      return;
    }

    try {
      const { data, error } = await ApiClient.like(profileId);
      if (error) {
        showError(error);
      } else {
        const response = data as any;
        if (response.connection_created) {
          addToast("Mutual like! You're connected!", "success");
        } else {
          addToast("Profile liked!", "success");
        }
        setIsLiked(true);
      }
    } catch (err) {
      addToast("Failed to like profile", "error");
    }
  };

  const handleBlock = async () => {
    try {
      const { error } = await ApiClient.block(profileId);
      if (error) {
        showError(error);
      } else {
        addToast("Profile blocked", "success");
        setIsBlocked(true);
      }
    } catch (err) {
      addToast("Failed to block profile", "error");
    }
  };

  const handleReport = async () => {
    try {
      const { error } = await ApiClient.report(profileId, "fake_profile");
      if (error) {
        showError(error);
      } else {
        addToast("Report submitted", "success");
      }
    } catch (err) {
      addToast("Failed to submit report", "error");
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="text-center py-12">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (isBlocked) {
    return (
      <ProtectedRoute>
        <div className="max-w-2xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Blocked</h1>
          <p className="text-gray-600">You have blocked this profile.</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (!profile) {
    return (
      <ProtectedRoute>
        <div className="max-w-2xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
        </div>
      </ProtectedRoute>
    );
  }

  const ageFromDob = profile.date_of_birth
    ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear()
    : null;
  const primaryPhoto = profile.pictures?.find((p) => p.is_primary);

  const { isOnline, displayText } = getOnlineStatus(profile.last_seen_at);

  function getOnlineStatus(lastSeenAt: string | null | undefined): {
    isOnline: boolean;
    displayText: string;
  } {
    if (!lastSeenAt) {
      return { isOnline: false, displayText: "Never seen" };
    }

    const now = new Date();
    const lastSeen = new Date(lastSeenAt);
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 5) {
      return { isOnline: true, displayText: "Online now" };
    } else if (diffMins < 60) {
      return { isOnline: false, displayText: `${diffMins}m ago` };
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return { isOnline: false, displayText: `${hours}h ago` };
    } else {
      const days = Math.floor(diffMins / 1440);
      return { isOnline: false, displayText: `${days}d ago` };
    }
  }

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Photos */}
          <div className="grid grid-cols-2 gap-4 p-6">
            {primaryPhoto ? (
              <div className="col-span-2 relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
                <Image
                  src={primaryPhoto.image_url}
                  alt={profile.first_name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="col-span-2 w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">No photo</span>
              </div>
            )}

            {profile.pictures?.slice(1, 5).map((pic) => (
              <div
                key={pic.id}
                className="relative w-full h-32 bg-gray-200 rounded-lg overflow-hidden"
              >
                <Image
                  src={pic.image_url}
                  alt="Photo"
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.first_name}, {ageFromDob}
                </h1>
                {isOnline && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-600">Online</span>
                  </div>
                )}
              </div>
              <p className={`text-sm ${isOnline ? "text-green-600 font-medium" : "text-gray-600"}`}>
                {displayText}
              </p>
              <p className="text-gray-600 mt-2">
                {profile.city && profile.neighborhood
                  ? `${profile.neighborhood}, ${profile.city}`
                  : profile.city || "Location not specified"}
              </p>
              {profile.distance_km !== undefined && (
                <p className="text-gray-600 mt-1">
                  {Math.round(profile.distance_km)} km away
                </p>
              )}
            </div>

            {profile.biography && (
              <div>
                <h2 className="text-lg font-semibold mb-2">About</h2>
                <p className="text-gray-700">{profile.biography}</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">Fame Rating:</span>
              <span className="text-2xl">⭐ {profile.fame_rating || "N/A"}</span>
            </div>

            {profile.tags && profile.tags.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Interests</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button onClick={handleLike} disabled={isLiked} className="flex-1">
                {isLiked ? "❤️ Liked" : "Like"}
              </Button>
              <Button variant="secondary" onClick={handleBlock} className="flex-1">
                Block
              </Button>
              <Button variant="danger" onClick={handleReport} className="flex-1">
                Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
