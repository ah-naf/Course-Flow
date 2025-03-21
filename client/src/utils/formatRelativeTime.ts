import { formatDistanceToNowStrict, parse, parseISO } from "date-fns";

export function formatRelativeTime(timestamp: string): string {
  try {
    const date = parseISO(timestamp); // Parse as UTC
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    return formatDistanceToNowStrict(date, {
      addSuffix: true,
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Unknown time";
  }
}
