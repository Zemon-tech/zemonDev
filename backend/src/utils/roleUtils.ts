import { UserRole } from '../models';
import mongoose from 'mongoose';

/**
 * Check if user has a specific role for a channel
 * @param userId - User ID to check
 * @param channelId - Channel ID to check role for
 * @param roles - Array of roles to check for
 * @returns Promise<boolean> - True if user has any of the specified roles for the channel
 */
export const hasChannelRole = async (
  userId: string | mongoose.Types.ObjectId,
  channelId: string | mongoose.Types.ObjectId,
  roles: ('admin' | 'moderator')[]
): Promise<boolean> => {
  const userRole = await UserRole.findOne({
    userId: new mongoose.Types.ObjectId(userId.toString()),
    channelId: new mongoose.Types.ObjectId(channelId.toString()),
    role: { $in: roles }
  });

  return !!userRole;
};

/**
 * Check if user has a global role
 * @param userId - User ID to check
 * @param roles - Array of roles to check for
 * @returns Promise<boolean> - True if user has any of the specified global roles
 */
export const hasGlobalRole = async (
  userId: string | mongoose.Types.ObjectId,
  roles: ('admin' | 'moderator')[]
): Promise<boolean> => {
  const userRole = await UserRole.findOne({
    userId: new mongoose.Types.ObjectId(userId.toString()),
    channelId: { $exists: false },
    role: { $in: roles }
  });

  return !!userRole;
};

/**
 * Check if user has any role (global or channel-specific) for a channel
 * @param userId - User ID to check
 * @param channelId - Channel ID to check role for
 * @param roles - Array of roles to check for
 * @returns Promise<boolean> - True if user has any of the specified roles (global or channel-specific)
 */
export const hasAnyRole = async (
  userId: string | mongoose.Types.ObjectId,
  channelId: string | mongoose.Types.ObjectId,
  roles: ('admin' | 'moderator')[]
): Promise<boolean> => {
  // Check for global role first
  const hasGlobal = await hasGlobalRole(userId, roles);
  if (hasGlobal) {
    return true;
  }

  // Check for channel-specific role
  const hasChannel = await hasChannelRole(userId, channelId, roles);
  return hasChannel;
};

/**
 * Get user's role for a specific channel
 * @param userId - User ID to check
 * @param channelId - Channel ID to check role for
 * @returns Promise<string | null> - Role string or null if no role found
 */
export const getUserChannelRole = async (
  userId: string | mongoose.Types.ObjectId,
  channelId: string | mongoose.Types.ObjectId
): Promise<string | null> => {
  const userRole = await UserRole.findOne({
    userId: new mongoose.Types.ObjectId(userId.toString()),
    channelId: new mongoose.Types.ObjectId(channelId.toString())
  });

  return userRole ? userRole.role : null;
};

/**
 * Get user's highest global role
 * @param userId - User ID to check
 * @returns Promise<string> - Highest global role (admin > moderator > user)
 */
export const getUserGlobalRole = async (
  userId: string | mongoose.Types.ObjectId
): Promise<string> => {
  const userRole = await UserRole.findOne({
    userId: new mongoose.Types.ObjectId(userId.toString()),
    channelId: { $exists: false }
  }).sort({ role: 1 }); // Sort to get admin first, then moderator

  return userRole ? userRole.role : 'user';
}; 