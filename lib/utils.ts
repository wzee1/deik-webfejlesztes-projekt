import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateString(string: string, maxCharCount: number) {
  if (string.length <= maxCharCount) return string
  return `${string.slice(0, maxCharCount)}...`
}