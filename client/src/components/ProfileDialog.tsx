// src/components/ProfileDialog.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserStore } from "@/store/userStore";
import { Upload } from "lucide-react";

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileDialog: React.FC<ProfileDialogProps> = ({ isOpen, onClose }) => {
  const { user } = useUserStore();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [avatar, setAvatar] = useState(user?.avatar || ""); // URL or empty string
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // Selected file
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null); // Preview URL
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update preview when a new file is selected
  useEffect(() => {
    if (avatarFile) {
      const objectUrl = URL.createObjectURL(avatarFile);
      setAvatarPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl); // Clean up
    } else {
      setAvatarPreview(avatar || null); // Use existing avatar URL if no file
    }
  }, [avatarFile, avatar]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Optional: Add file type and size validation
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        alert("File size must be less than 5MB.");
        return;
      }
      setAvatarFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Simulate file upload logic (replace with actual API call)
      let updatedAvatar = avatar;
      if (avatarFile) {
        // Example: Upload file to a server
        // const formData = new FormData();
        // formData.append("avatar", avatarFile);
        // const response = await fetch("/api/upload-avatar", {
        //   method: "POST",
        //   body: formData,
        // });
        // const data = await response.json();
        // updatedAvatar = data.avatarUrl;

        // For demo, we'll just use the preview URL
        updatedAvatar = avatarPreview || avatar;
      }

      // Simulate profile update
      // await updateUserProfile({
      //   firstName,
      //   lastName,
      //   avatar: updatedAvatar,
      // });

      // Update local state (assuming userStore has a method to update user)
      // useUserStore.getState().updateUser({ ...user, firstName, lastName, avatar: updatedAvatar });

      onClose();
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarPreview || avatar} alt={initials} />
                <AvatarFallback className="text-xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="w-full space-y-2">
                <Label htmlFor="avatarFile">Profile Picture</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() =>
                      document.getElementById("avatarFile")?.click()
                    }
                  >
                    <Upload className="h-4 w-4" />
                    Upload Image
                  </Button>
                  <Input
                    id="avatarFile"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {avatarFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAvatarFile(null)}
                      className="text-red-500"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Max 5MB, JPG/PNG/GIF
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={user.username}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user.email}
                disabled
                className="bg-gray-100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
