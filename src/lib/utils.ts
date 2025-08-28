import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges multiple Tailwind CSS class values into a single string.
 *
 * Uses `clsx` to conditionally join the provided values and then
 * resolves conflicting Tailwind classes with `tailwind-merge`.
 *
 * @param {...ClassValue} inputs - Class name values to combine.
 * @returns {string} The merged Tailwind class string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
