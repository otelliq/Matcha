"use client";

import Link from "next/link";
import Image from "next/image";
import { PublicProfile } from "@/lib/types";
import { Button } from "./Button";

interface ProfileCardProps {
  profile: PublicProfile;
  onLike?: (userId: number) => void;
  onBlock?: (userId: number) => void;
  onReport?: (userId: number) => void;
  isLiked?: boolean;
  isConnected?: boolean;
  showActions?: boolean;
  disableLike?: boolean;
  disableLikeReason?: string;
}

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

export function ProfileCard({
  profile,
  onLike,
  onBlock,
  onReport,
  isLiked = false,
  isConnected = false,
  showActions = true,
  disableLike = false,
  disableLikeReason,
}: ProfileCardProps) {
  const primaryPhoto = profile.pictures?.find((p) => p.is_primary);
  const ageFromDob = profile.date_of_birth
    ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear()
    : null;
  const { isOnline, displayText } = getOnlineStatus(profile.last_seen_at);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {primaryPhoto ? (
        <div className="relative w-full h-64 bg-gray-100">
          <Image
            src={primaryPhoto.image_url}
            alt={profile.first_name}
            fill
            className="object-cover"
          />
          {isOnline && (
            <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
      ) : (
        <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">No photo</span>
        </div>
      )}

      <div className="p-4">
        <div className="mb-3">
          <Link href={`/profile/${profile.id}`} className="hover:underline">
            <h3 className="text-lg font-semibold text-gray-900">
              {profile.first_name}, {ageFromDob}
            </h3>
          </Link>
          <p className="text-sm text-gray-600">
            {profile.city && profile.neighborhood
              ? `${profile.neighborhood}, ${profile.city}`
              : profile.city || "No location"}
          </p>
          <p className={`text-xs mt-1 ${isOnline ? "text-green-600 font-medium" : "text-gray-500"}`}>
            {displayText}
          </p>
        </div>

        {profile.distance_km !== undefined && (
          <p className="text-xs text-gray-500 mb-2">
            {Math.round(profile.distance_km)} km away
          </p>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-gray-700">
              ⭐ {profile.fame_rating || "N/A"}
            </span>
          </div>
          {profile.shared_tags_count !== undefined && profile.shared_tags_count > 0 && (
            <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded">
              {profile.shared_tags_count} shared tag{profile.shared_tags_count !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {isConnected && (
          <div className="mb-3 text-sm text-green-600 font-medium">✓ Connected</div>
        )}

        {isLiked && (
          <div className="mb-3 text-sm text-rose-600 font-medium">❤️ You liked them</div>
        )}

        {showActions && (
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onLike?.(profile.id)}
              disabled={disableLike}
              title={disableLikeReason}
              className="flex-1"
            >
              {isLiked ? "Unlike" : "Like"}
            </Button>
            {onBlock && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onBlock(profile.id)}
                className="flex-1"
              >
                Block
              </Button>
            )}
            {onReport && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onReport(profile.id)}
                className="flex-1"
              >
                Report
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
