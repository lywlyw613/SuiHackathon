/**
 * Avatar utilities
 * 
 * Provides functions to get avatar URLs for wallet addresses
 */

import { getUserProfile } from "./user-profile";

/**
 * Get avatar URL for an address
 * Returns base64 data URL from MongoDB if available, otherwise returns a fallback avatar
 */
export function getAvatarUrl(address: string, profile?: { avatarUrl?: string } | null): string {
  if (profile?.avatarUrl) {
    // Check if it's a data URL (starts with data:) or a regular URL
    return profile.avatarUrl;
  }
  // Fallback to a deterministic avatar based on address
  return `https://api.dicebear.com/7.x/initials/svg?seed=${address}&backgroundColor=1da1f2,000000,657786&backgroundType=solid&fontFamily=Helvetica,Arial&fontWeight=600`;
}

/**
 * Get avatar URL asynchronously (fetches profile if not provided)
 */
export async function getAvatarUrlAsync(address: string): Promise<string> {
  try {
    const profile = await getUserProfile(address);
    return getAvatarUrl(address, profile);
  } catch (error) {
    console.error("Error getting avatar:", error);
    return getAvatarUrl(address);
  }
}

