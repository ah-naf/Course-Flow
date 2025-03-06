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
import { Course } from "@/utils/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ClassSettingsDialogProps {
  course: Course;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ClassSettingsDialog: React.FC<ClassSettingsDialogProps> = ({
  course,
  isOpen,
  onOpenChange,
}) => {
  const [classSettings, setClassSettings] = useState({
    name: course.name,
    description: course.description || "",
    backgroundColor: course.backgroundColor || "#3b82f6",
    isPrivate: course.isPrivate || false,
    postPermission: course.postPermission || "everyone",
  });

  const handleSettingChange = (field: string, value: any) => {
    setClassSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveSettings = () => {
    console.log("Saving settings:", classSettings);
    onOpenChange(false);
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
                <Label htmlFor="className">Class Name</Label>
                <Input
                  id="className"
                  value={classSettings.name}
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
                <Label htmlFor="coverImage">Cover Image</Label>
                <div className="flex items-center gap-4">
                  <div
                    className="h-20 w-32 rounded-md bg-cover bg-center border"
                    style={{
                      backgroundImage: course.coverPic
                        ? `url(${course.coverPic})`
                        : undefined,
                      backgroundColor: !course.coverPic
                        ? classSettings.backgroundColor
                        : undefined,
                    }}
                  />
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Change Cover
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="backgroundColor"
                    type="color"
                    className="w-16 h-10 p-1"
                    value={classSettings.backgroundColor}
                    onChange={(e) =>
                      handleSettingChange("backgroundColor", e.target.value)
                    }
                  />
                  <span className="text-sm text-gray-600">
                    Used when no cover image is present
                  </span>
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
                  checked={classSettings.isPrivate}
                  onCheckedChange={(checked) =>
                    handleSettingChange("isPrivate", checked)
                  }
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="postPermission">Who can post in class?</Label>
                <RadioGroup
                  value={classSettings.postPermission}
                  onValueChange={(value) =>
                    handleSettingChange("postPermission", value)
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="everyone" id="everyone" />
                    <Label htmlFor="everyone">Everyone</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="instructors" id="instructors" />
                    <Label htmlFor="instructors">Instructors only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderators" id="moderators" />
                    <Label htmlFor="moderators">
                      Instructors and moderators
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveSettings}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
