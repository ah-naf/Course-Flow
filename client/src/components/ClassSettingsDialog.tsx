// ClassSettingsDialog.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Upload } from "lucide-react";
import { Course, CoursePreview } from "@/utils/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useUpdateClassSettings } from "@/hooks/useCourse";

interface ClassSettingsDialogProps {
  course: CoursePreview;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ClassSettingsDialog: React.FC<ClassSettingsDialogProps> = ({
  course,
  isOpen,
  onOpenChange,
}) => {
  const [classSettings, setClassSettings] = useState<CoursePreview>(course);
  const [uploadedCoverPic, setUploadedCoverPic] = useState<string | null>(null);
  const [coverPicFile, setCoverPicFile] = useState<File | undefined>(undefined);
  const { mutate: updateClassSettings, isPending } = useUpdateClassSettings();

  const handleSettingChange = (field: string, value: any) => {
    setClassSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveSettings = () => {
    updateClassSettings(
      {
        ...classSettings,
        cover_pic: coverPicFile,
      },
      {
        onSuccess: () => {
          setTimeout(() => window.location.reload(), 1000);
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl sm:text-3xl font-semibold">
            Class Settings
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-gray-600">
            Customize your class details and permissions.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-6">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="className">Class ID</Label>
                <Input id="classId" value={classSettings.join_code} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="className">Class Name</Label>
                <Input
                  id="className"
                  value={classSettings.name}
                  required
                  onChange={(e) => handleSettingChange("name", e.target.value)}
                  placeholder="Enter class name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classDescription">Description</Label>
                <Textarea
                  id="classDescription"
                  value={classSettings.description}
                  onChange={(e) =>
                    handleSettingChange("description", e.target.value)
                  }
                  placeholder="Enter class description"
                  rows={4}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cover_pic">Cover Image</Label>
                <div className="flex items-center gap-4">
                  {uploadedCoverPic || classSettings.cover_pic ? (
                    <div className="relative">
                      <div
                        className="h-20 w-32 rounded-md bg-cover bg-center border"
                        style={{
                          backgroundImage: `url(${
                            uploadedCoverPic || classSettings.cover_pic
                          })`,
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-20 w-32 rounded-md border flex items-center justify-center text-gray-400">
                      No cover image
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      id="coverImageInput"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setCoverPicFile(file);
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setUploadedCoverPic(
                                event.target.result as string
                              );
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 mb-2"
                      onClick={() =>
                        document.getElementById("coverImageInput")?.click()
                      }
                    >
                      <Upload className="h-4 w-4" />
                      Upload Cover
                    </Button>

                    {uploadedCoverPic && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-red-500"
                        onClick={() => {
                          setUploadedCoverPic(null);
                          setCoverPicFile(undefined);
                        }}
                      >
                        Cancel upload
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="backgroundColor"
                    type="color"
                    className="w-16 h-10 p-1"
                    value={classSettings.background_color}
                    onChange={(e) =>
                      handleSettingChange("background_color", e.target.value)
                    }
                  />
                  <div
                    className="h-10 w-10 rounded-md border"
                    style={{ backgroundColor: classSettings.background_color }}
                  />
                  <span className="text-sm text-gray-600">
                    Used when no cover image is present
                  </span>
                </div>
              </div>

              <div className=" space-y-2">
                <Label>Preview</Label>
                <div
                  className="h-32 relative w-full rounded-md bg-cover bg-center border"
                  style={{
                    backgroundImage:
                      uploadedCoverPic || classSettings.cover_pic
                        ? `url(${uploadedCoverPic || classSettings.cover_pic})`
                        : undefined,
                    backgroundColor: !(
                      uploadedCoverPic || classSettings.cover_pic
                    )
                      ? classSettings.background_color
                      : undefined,
                  }}
                >
                  {(classSettings.cover_pic || uploadedCoverPic) && (
                    <div className="absolute bg-black opacity-30 w-full h-full inset-0"></div>
                  )}
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-white drop-shadow-md">
                      {classSettings.name}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="privateClass">Private Class</Label>
                  <p className="text-sm text-gray-500">
                    Only invited students can view and join
                  </p>
                </div>
                <Switch
                  id="privateClass"
                  checked={classSettings.is_private}
                  onCheckedChange={(checked) =>
                    handleSettingChange("is_private", checked)
                  }
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="post_permission">Who can post in class?</Label>
                <RadioGroup
                  value={classSettings.post_permission}
                  onValueChange={(value) =>
                    handleSettingChange("post_permission", value)
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Members" id="Members" />
                    <Label htmlFor="Members">Everyone</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Instructors" id="Instructors" />
                    <Label htmlFor="Instructors">Instructors only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Moderators" id="Moderators" />
                    <Label htmlFor="Moderators">
                      Instructors and moderators
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setClassSettings(course);
            }}
          >
            Cancel
          </Button>
          <Button disabled={isPending} onClick={handleSaveSettings}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
