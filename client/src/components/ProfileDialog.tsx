import React, { useEffect } from "react";
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
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEditUserDetails } from "@/hooks/useAuth"; // Import the hook

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const userEditSchema = yup.object().shape({
  first_name: yup
    .string()
    .required("First name is required")
    .min(4, "First name must be at least 4 characters")
    .max(20, "First name must not exceed 20 characters"),
  last_name: yup
    .string()
    .required("Last name is required")
    .min(4, "Last name must be at least 4 characters")
    .max(20, "Last name must not exceed 20 characters"),
  avatar: yup
    .mixed()
    .optional()
    .test(
      "fileType",
      "Invalid image format. Supported formats: jpg, jpeg, png, gif",
      (value) => {
        if (!value) return true;
        if (value instanceof File) {
          const validTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/jpg",
          ];
          return validTypes.includes(value.type);
        }
        return false;
      }
    )
    .test("fileSize", "File size must be less than 5MB", (value) => {
      if (!value) return true;
      if (value instanceof File) {
        return value.size <= 5 * 1024 * 1024; // 5MB in bytes
      }
      return false;
    }),
});

type UserEditFormData = yup.InferType<typeof userEditSchema>;

const ProfileDialog: React.FC<ProfileDialogProps> = ({ isOpen, onClose }) => {
  const { user } = useUserStore();
  const { mutate: editUser, isPending } = useEditUserDetails();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UserEditFormData>({
    resolver: yupResolver(userEditSchema),
    defaultValues: {
      first_name: user?.firstName || "",
      last_name: user?.lastName || "",
      avatar: undefined,
    },
  });

  // Watch avatar field for preview
  const avatarFile = watch("avatar") as File | undefined;
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(
    user?.avatar ? `http://localhost:8080/${user.avatar}` : null
  );

  // Track if we're using a custom uploaded avatar or the default one
  const [isUsingUploadedAvatar, setIsUsingUploadedAvatar] =
    React.useState(false);

  // Set initial form values when user changes
  useEffect(() => {
    if (user) {
      setValue("first_name", user.firstName);
      setValue("last_name", user.lastName);
      setAvatarPreview(
        user.avatar ? `http://localhost:8080/${user.avatar}` : null
      );
      setIsUsingUploadedAvatar(false);
    }
  }, [user, setValue]);

  // Update avatar preview when a new file is selected
  useEffect(() => {
    if (avatarFile instanceof File) {
      const objectUrl = URL.createObjectURL(avatarFile);
      setAvatarPreview(objectUrl);
      setIsUsingUploadedAvatar(true);
      return () => URL.revokeObjectURL(objectUrl); // Clean up
    }
  }, [avatarFile]);

  // Handle removing the uploaded avatar and showing the original one
  const handleRemoveAvatar = () => {
    setValue("avatar", undefined);
    setAvatarPreview(
      user?.avatar ? `http://localhost:8080/${user.avatar}` : null
    );
    setIsUsingUploadedAvatar(false);
  };

  const onSubmit = (data: UserEditFormData) => {
    editUser(
      {
        first_name: data.first_name,
        last_name: data.last_name,
        avatar: data.avatar as File | undefined,
      },
      {
        onSuccess: () => {
          onClose(); // Close dialog on success
          reset(); // Reset form after successful submission
          setIsUsingUploadedAvatar(false)
        },
      }
    );
  };

  if (!user) return null;

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6 py-4">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24 ring-2 ring-blue-500 shadow">
                <AvatarImage src={avatarPreview || undefined} />
                <AvatarFallback className="bg-blue-600 text-white font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="w-full space-y-2">
                <Label htmlFor="avatar">Profile Picture</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => document.getElementById("avatar")?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    Upload Image
                  </Button>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    {...register("avatar")}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setValue("avatar", file);
                        setIsUsingUploadedAvatar(true);
                      } else {
                        // Handle case where user cancels file selection
                        // Keep the current state
                      }
                    }}
                  />
                  {isUsingUploadedAvatar && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveAvatar}
                      className="text-red-500"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                {errors.avatar && (
                  <p className="text-sm text-red-500">
                    {errors.avatar.message}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Max 5MB, JPG/PNG/GIF
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  {...register("first_name")}
                  className={errors.first_name ? "border-red-500" : ""}
                />
                {errors.first_name && (
                  <p className="text-sm text-red-500">
                    {errors.first_name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  {...register("last_name")}
                  className={errors.last_name ? "border-red-500" : ""}
                />
                {errors.last_name && (
                  <p className="text-sm text-red-500">
                    {errors.last_name.message}
                  </p>
                )}
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
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
