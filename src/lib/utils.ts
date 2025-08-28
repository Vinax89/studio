import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges Tailwind CSS class names using `clsx` and `tailwind-merge`.
 *
 * @param inputs Class name values to merge.
 * @returns A combined class name string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
