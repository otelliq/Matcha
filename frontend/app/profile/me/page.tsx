"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ApiClient } from "@/lib/api-client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Picture, Tag } from "@/lib/types";

export default function EditProfilePage() {
  const { user, refreshUser } = useAuth();
  const { addToast, showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    gender: "unset",
    sexual_preference: "bisexual",
    biography: "",
    date_of_birth: "",
    city: "",
    neighborhood: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        gender: user.gender,
        sexual_preference: user.sexual_preference,
        biography: user.biography || "",
        date_of_birth: user.date_of_birth || "",
        city: user.city || "",
        neighborhood: user.neighborhood || "",
        latitude: user.latitude || null,
        longitude: user.longitude || null,
      });
      setPictures(user.pictures || []);
      setTags(user.tags || []);
    }

    const loadTags = async () => {
      const { data, error } = await ApiClient.getTags("", 100, 0);
      if (!error && data) {
        const response = data as any;
        setAvailableTags(response.results || []);
      }
    };
    loadTags();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate age
    if (formData.date_of_birth) {
      const age = new Date().getFullYear() - new Date(formData.date_of_birth).getFullYear();
      if (age < 18) {
        addToast("You must be at least 18 years old", "error");
        setIsLoading(false);
        return;
      }
    }

    try {
      const { error } = await ApiClient.updateProfile({
        ...formData,
        tags: tags.map((t) => t.id),
      });
      if (error) {
        showError(error);
      } else {
        addToast("Profile updated successfully!", "success");
        await refreshUser();
      }
    } catch (err) {
      addToast("Failed to update profile", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestLocation = async () => {
    setIsRequestingLocation(true);
    try {
      if (!navigator.geolocation) {
        addToast("Geolocation is not supported by your browser", "error");
        setIsRequestingLocation(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setFormData((prev) => ({
            ...prev,
            latitude,
            longitude,
          }));
          addToast("Location captured successfully", "success");
          setIsRequestingLocation(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          addToast(
            error.code === 1
              ? "Permission denied. Please enter location manually."
              : "Unable to get your location. Please enter manually.",
            "error"
          );
          setIsRequestingLocation(false);
        }
      );
    } catch (err) {
      addToast("Failed to request location", "error");
      setIsRequestingLocation(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const { data, error } = await ApiClient.uploadPhoto(
        file,
        pictures.length === 0 // Make first photo primary
      );
      if (error) {
        showError(error);
      } else {
        const response = data as any;
        setPictures((prev) => [...prev, response]);
        addToast("Photo uploaded successfully!", "success");
        await refreshUser();
      }
    } catch (err) {
      addToast("Failed to upload photo", "error");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    try {
      const { error } = await ApiClient.deletePhoto(photoId);
      if (error) {
        showError(error);
      } else {
        setPictures((prev) => prev.filter((p) => p.id !== photoId));
        addToast("Photo deleted", "success");
        await refreshUser();
      }
    } catch (err) {
      addToast("Failed to delete photo", "error");
    }
  };

  const handleTagToggle = (tag: Tag) => {
    setTags((prev) =>
      prev.find((t) => t.id === tag.id)
        ? prev.filter((t) => t.id !== tag.id)
        : [...prev, tag]
    );
  };

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold">Basic Information</h2>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                required
              />
              <Input
                label="Last Name"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value as any })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="unset">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non_binary">Non-binary</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sexual Preference
              </label>
              <select
                value={formData.sexual_preference}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sexual_preference: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="straight">Straight</option>
                <option value="gay">Gay</option>
                <option value="lesbian">Lesbian</option>
                <option value="bisexual">Bisexual</option>
                <option value="asexual">Asexual</option>
              </select>
            </div>

            <Input
              label="Date of Birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) =>
                setFormData({ ...formData, date_of_birth: e.target.value })
              }
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biography
              </label>
              <textarea
                value={formData.biography}
                onChange={(e) =>
                  setFormData({ ...formData, biography: e.target.value })
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Location */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold">Location</h2>

            <div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleRequestLocation}
                isLoading={isRequestingLocation}
                className="w-full"
              >
                📍 Use My Current Location
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                {formData.latitude && formData.longitude
                  ? `Location captured: (${formData.latitude.toFixed(4)}, ${formData.longitude.toFixed(4)})`
                  : "Click to request GPS permission"}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600 mb-4">Or enter location manually:</p>

              <Input
                label="City"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />

              <Input
                label="Neighborhood"
                value={formData.neighborhood}
                onChange={(e) =>
                  setFormData({ ...formData, neighborhood: e.target.value })
                }
              />
            </div>
          </div>

          {/* Photos */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold">Photos ({pictures.length}/5)</h2>

            <div className="grid grid-cols-3 gap-4">
              {pictures.map((pic) => (
                <div key={pic.id} className="relative group">
                  <div className="relative w-full h-32 bg-gray-200 rounded-lg overflow-hidden">
                    <Image
                      src={pic.image_url}
                      alt="Profile photo"
                      fill
                      className="object-cover"
                    />
                  </div>
                  {pic.is_primary && (
                    <div className="absolute top-2 left-2 bg-rose-600 text-white text-xs font-bold px-2 py-1 rounded">
                      Primary
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(pic.id)}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {pictures.length < 5 && (
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-rose-500">
                  <div className="text-gray-500">
                    <p className="text-2xl mb-2">+</p>
                    <p className="text-sm">Upload Photo</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold">Interests</h2>

            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    tags.find((t) => t.id === tag.id)
                      ? "bg-rose-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full">
            Save Profile
          </Button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
