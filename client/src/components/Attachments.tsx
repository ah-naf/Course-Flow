// src/components/Attachments.tsx
import { Attachment, Course, FileStorage } from "@/utils/types";
import { useEffect, useState } from "react";
import { Download } from "lucide-react"; // Import Download icon
import { Button } from "@/components/ui/button"; // Assuming ShadCN Button for styling
import { useGetAllAttachments } from "@/hooks/usePost";
import { toast } from "sonner";

const Attachments: React.FC<{ course: Course }> = ({ course }) => {
  const { data, isLoading, isError, error } = useGetAllAttachments(course.id);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isError && error) {
      const errorMsg =
        error instanceof Error ? error.message : "Unknown error occurred";
      setErrorMessage(errorMsg);
      toast.error(`Failed to load attachments: ${errorMsg}`);
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [isError, error]);

  // const handleDownload = (file: Attachment) => {
  //   // Placeholder for download logic (e.g., fetch file from API or trigger download)
  //   console.log(`Downloading ${file.document.file_name}`);
  //   // In a real app, you might use something like:
  //   const link = document.createElement("a").target = "";
  //   link.href = file.document.file_path;
  //   link.download = file.document.file_name;
  //   link.click();
  // };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md w-full min-h-[300px]">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
        File Storage
      </h2>
      {errorMessage && (
        <div className="p-4 mb-4 bg-red-50 text-red-600 rounded-md">
          {errorMessage}
        </div>
      )}
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800"></div>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {data &&
            data.map((file) => (
              <a
                key={file.id}
                href={file.document.file_path}
                target="_blank"
                className="flex items-center justify-between border-b pb-2 last:border-b-0 hover:bg-gray-50 hover:shadow-sm transition-all duration-200 rounded-md p-2 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 text-white font-medium rounded-md flex items-center justify-center text-xs sm:text-sm">
                    {file.document.file_type.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base">
                      {file.document.file_name}
                    </p>
                    {/* <p className="text-xs sm:text-sm text-gray-500">
                      {file.size}
                    </p> */}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-xs sm:text-sm text-gray-500">
                      {file.user?.username}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {new Date(file.upload_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </a>
            ))}
        </div>
      )}
    </div>
  );
};

export default Attachments;
