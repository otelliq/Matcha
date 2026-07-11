"use client";

import { useState } from "react";
import { ApiClient } from "@/lib/api-client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProfileCard } from "@/components/ProfileCard";
import { Button } from "@/components/Button";
import { useToast } from "@/lib/toast-context";
import { PublicProfile } from "@/lib/types";

export default function SearchPage() {
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [sort, setSort] = useState("distance");
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(65);
  const [fameMin, setFameMin] = useState(0);
  const [fameMax, setFameMax] = useState(100);
  const [city, setCity] = useState("");
  const [likedProfiles, setLikedProfiles] = useState<Set<number>>(new Set());
  const { addToast, showError } = useToast();

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const query: Record<string, any> = {
        sort,
        "filter[age_min]": ageMin,
        "filter[age_max]": ageMax,
        "filter[fame_min]": fameMin,
        "filter[fame_max]": fameMax,
        limit: 20,
        offset: 0,
      };
      if (city) query["filter[city]"] = city;

      const { data, error } = await ApiClient.search(query);
      if (error) {
        showError(error);
      } else {
        const response = data as any;
        setProfiles(response.results);
        setHasMore(!!response.next);
        setOffset(response.results.length);
      }
    } catch (err) {
      addToast("Failed to search profiles", "error");
    } finally {
      setIsLoading(false);
    }
  };

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
        setProfiles((prev) => prev.filter((p) => p.id !== userId));
        addToast("Profile blocked", "success");
      }
    } catch (err) {
      addToast("Failed to block profile", "error");
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Advanced Search</h1>

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={ageMin}
                  onChange={(e) => setAgeMin(Number(e.target.value))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded"
                />
                <span className="flex items-center">-</span>
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={ageMax}
                  onChange={(e) => setAgeMax(Number(e.target.value))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fame Rating
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={fameMin}
                  onChange={(e) => setFameMin(Number(e.target.value))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded"
                />
                <span className="flex items-center">-</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={fameMax}
                  onChange={(e) => setFameMax(Number(e.target.value))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="distance">Distance</option>
                <option value="same_area">Same Area</option>
                <option value="fame">Fame Rating</option>
                <option value="recent">Recently Active</option>
                <option value="shared_tags">Shared Tags</option>
              </select>
            </div>
          </div>

          <Button onClick={handleSearch} isLoading={isLoading} className="w-full">
            Search
          </Button>
        </div>

        {profiles.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map((profile) => (
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

            {hasMore && (
              <div className="text-center mt-8">
                <Button>Load More</Button>
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
