// src/components/Attachments.tsx
import { Course } from "@/utils/types";
import { useEffect, useState } from "react";
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
          {data && data.length > 0 ? (
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
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <svg
                className="w-12 h-12 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              <p className="text-sm sm:text-base font-medium">
                No attachments found
              </p>
              <p className="text-xs sm:text-sm mt-1">
                Upload files to see them here
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Attachments;