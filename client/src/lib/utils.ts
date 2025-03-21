import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRoleLabel(role: number) {
  switch (role) {
    case 4:
      return "Admin";
    case 3:
      return "Instructor";
    case 2:
      return "Moderator";
    case 1:
      return "Member";
    default:
      return "Member";
  }
}
