import { emitToUser, emitToChannel } from '../services/socket.service';
import logger from './logger';

/**
 * Emit role update notification to user and channel
 * @param userId - User ID whose role was updated
 * @param channelId - Channel ID (optional for global roles)
 * @param role - New role assigned
 * @param grantedBy - User ID who granted the role (optional)
 */
export const emitRoleUpdateNotification = async (
  userId: string,
  role: string,
  channelId?: string,
  grantedBy?: string
) => {
  try {
    logger.info('Emitting role update notification:', {
      userId,
      channelId,
      role,
      grantedBy,
      timestamp: new Date().toISOString()
    });

    // Notify the user about their role change
    await emitToUser(userId, 'role_updated', {
      channelId,
      role,
      grantedBy,
      timestamp: new Date().toISOString()
    });

    // If it's a channel-specific role, also notify channel members
    if (channelId) {
      await emitToChannel(channelId, 'user_role_updated', {
        userId,
        role,
        grantedBy,
        timestamp: new Date().toISOString()
      });
    }

    logger.info('Role update notification emitted successfully');
  } catch (error) {
    logger.error('Failed to emit role update notification:', {
      error: error instanceof Error ? error.message : String(error),
      userId,
      channelId,
      role,
      timestamp: new Date().toISOString()
    });
    // Don't throw error to avoid breaking the main operation
  }
};

/**
 * Emit channel permissions update notification
 * @param channelId - Channel ID
 * @param permissions - Updated permissions object
 * @param updatedBy - User ID who updated the permissions (optional)
 */
export const emitChannelPermissionsUpdateNotification = async (
  channelId: string,
  permissions: any,
  updatedBy?: string
) => {
  try {
    logger.info('Emitting channel permissions update notification:', {
      channelId,
      permissions,
      updatedBy,
      timestamp: new Date().toISOString()
    });

    // Notify all channel members about permission changes
    await emitToChannel(channelId, 'channel_permissions_updated', {
      channelId,
      permissions,
      updatedBy,
      timestamp: new Date().toISOString()
    });

    logger.info('Channel permissions update notification emitted successfully');
  } catch (error) {
    logger.error('Failed to emit channel permissions update notification:', {
      error: error instanceof Error ? error.message : String(error),
      channelId,
      permissions,
      timestamp: new Date().toISOString()
    });
    // Don't throw error to avoid breaking the main operation
  }
}; 