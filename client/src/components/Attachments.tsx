// src/components/Attachments.tsx
import { Course, FileStorage } from "@/utils/types";
import { useState } from "react";

const Attachments: React.FC<{ course: Course }> = ({ course }) => {
  const [files, setFiles] = useState<FileStorage[]>([
    {
      id: "1",
      name: "React_Basics_Lecture.pdf",
      type: "pdf",
      size: "2.5 MB",
      uploadedBy: course.instructor.username,
      uploadDate: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "2",
      name: "Component_Design_Slides.pptx",
      type: "pptx",
      size: "15.7 MB",
      uploadedBy: course.instructor.username,
      uploadDate: new Date(Date.now() - 259200000).toISOString(),
    },
    {
      id: "3",
      name: "Assignment1_Starter_Code.zip",
      type: "zip",
      size: "1.2 MB",
      uploadedBy: course.instructor.username,
      uploadDate: new Date(Date.now() - 432000000).toISOString(),
    },
  ]);

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md w-full min-h-[300px]">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
        File Storage
      </h2>
      <div className="space-y-4 sm:space-y-6">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between border-b pb-2 last:border-b-0 hover:bg-gray-50 hover:shadow-sm transition-all duration-200 rounded-md p-2 cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-md flex items-center justify-center text-xs sm:text-sm">
                {file.type.toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base">{file.name}</p>
                <p className="text-xs sm:text-sm text-gray-500">{file.size}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm text-gray-500">
                Uploaded by {file.uploadedBy}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                {new Date(file.uploadDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Attachments;
