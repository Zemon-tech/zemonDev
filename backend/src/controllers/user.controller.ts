import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/AppError';
import ApiResponse from '../utils/ApiResponse';
import User from '../models/user.model';
import UserRole from '../models/userRole.model';
import { recordDailyVisit, getStreakInfo } from '../services/zemonStreak.service';
import { standardLimiter } from '../middleware/rateLimiter.middleware';
import { cacheMiddleware } from '../middleware/cache.middleware';
import { getUserSkillSummary, getDashboardSummary, recomputeLearningPatterns, recomputeRoleMatch, rebuildDailyStatsFromHistory, getUserInsights, getNextUpRecommendation } from '../services/userScoring.service';

/**
 * @desc    Get current user profile
 * @route   GET /api/users/me
 * @access  Private
 */
export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user._id)
      .select('-__v')
      .populate('bookmarkedResources', 'title url type')
      .populate('completedSolutions', 'problemId status');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Compute a stable solvedCount (prefer explicit counter, fallback to array length)
    const solvedCount =
      (user.stats && typeof user.stats.problemsSolved === 'number')
        ? user.stats.problemsSolved
        : (Array.isArray((user as any).completedSolutions) ? (user as any).completedSolutions.length : 0);

    // Add solvedCount to the returned user object without altering existing fields
    const userWithSolved = { ...(user.toObject()), solvedCount };

    res.status(200).json(
      new ApiResponse(
        200,
        'User profile retrieved successfully',
        userWithSolved
      )
    );
  }
);

/**
 * @desc    Get current user's streak percentile (top %) among users with zemonStreak > 0
 * @route   GET /api/users/me/streak-percentile
 * @access  Private
 */
export const getStreakPercentileController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const me = await User.findById(req.user._id)
        .select('zemonStreak longestZemonStreak lastZemonVisit')
        .lean();

      if (!me) {
        return next(new AppError('User not found', 404));
      }

      const myStreak = me.zemonStreak || 0;
      const myLongest = me.longestZemonStreak || 0;
      const myLast = me.lastZemonVisit || new Date(0);

      const eligibleFilter: any = { zemonStreak: { $gt: 0 } };
      const totalEligible = await User.countDocuments(eligibleFilter);
      const totalAll = await User.countDocuments({});

      if (totalAll === 0 || myStreak === 0) {
        return res.status(200).json(
          new ApiResponse(200, 'Streak percentile calculated', {
            percentile: 100,
            rank: null,
            total: totalAll,
            streak: myStreak,
            longestStreak: myLongest,
          })
        );
      }

      // Count users that strictly rank ahead using tie-breakers
      const greater = await User.countDocuments({
        ...eligibleFilter,
        $or: [
          { zemonStreak: { $gt: myStreak } },
          { zemonStreak: myStreak, longestZemonStreak: { $gt: myLongest } },
          {
            zemonStreak: myStreak,
            longestZemonStreak: myLongest,
            lastZemonVisit: { $gt: myLast },
          },
        ],
      });

      const rank = greater + 1;
      const raw = Math.ceil((rank / Math.max(totalAll, 1)) * 100);
      const percentile = Math.max(1, Math.min(raw, 100));

      res.status(200).json(
        new ApiResponse(200, 'Streak percentile calculated', {
          percentile,
          rank,
          total: totalAll,
          streak: myStreak,
          longestStreak: myLongest,
        })
      );
    } catch (error) {
      return next(new AppError('Failed to calculate streak percentile', 500));
    }
  }
);

/**
 * @desc    Get streak leaderboard (top N)
 * @route   GET /api/users/leaderboard/streak?limit=3
 * @access  Public (read-only)
 */
export const getStreakLeaderboard = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limitParam = Number(req.query.limit) || 3;
      const limit = Math.max(1, Math.min(limitParam, 10));

      const users = await User.find({ zemonStreak: { $gt: 0 } })
        .select('fullName username zemonStreak longestZemonStreak lastZemonVisit stats.reputation profilePicture')
        .sort({ zemonStreak: -1, longestZemonStreak: -1, lastZemonVisit: -1 })
        .limit(limit)
        .lean();

      const leaderboard = users.map((u) => ({
        id: String(u._id),
        name: u.fullName,
        username: u.username,
        streak: u.zemonStreak || 0,
        longestStreak: u.longestZemonStreak || 0,
        lastVisit: u.lastZemonVisit || null,
        points: u.stats?.reputation || 0,
        avatar: (u as any).profilePicture || null,
      }));

      res.status(200).json(new ApiResponse(200, 'Streak leaderboard', leaderboard));
    } catch (error) {
      return next(new AppError('Failed to fetch streak leaderboard', 500));
    }
  }
);

/**
 * @desc    Update current user profile
 * @route   PATCH /api/users/me
 * @access  Private
 */
export const updateCurrentUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { collegeDetails, profile, interests, profileBackground, college, socialLinks, achievements, profilePicture } = req.body;

    // Filter out unwanted fields
    const updateData: any = {};
    if (collegeDetails) updateData.collegeDetails = collegeDetails;
    if (profile) updateData.profile = profile;
    if (interests) updateData.interests = interests;
    if (profileBackground) updateData.profileBackground = profileBackground;
    if (college) updateData.college = college;
    if (socialLinks) updateData.socialLinks = socialLinks;
    if (achievements) updateData.achievements = achievements;
    if (typeof profilePicture === 'string') updateData.profilePicture = profilePicture;

    // Calculate skill mastery if skillProgress is provided
    if (profile?.skillProgress && Array.isArray(profile.skillProgress)) {
      const totalProgress = profile.skillProgress.reduce((sum: number, skill: any) => sum + (skill.progress || 0), 0);
      const averageProgress = profile.skillProgress.length > 0 ? totalProgress / profile.skillProgress.length : 0;
      updateData['stats.skillMastery'] = Math.round(averageProgress);
    }

    // Calculate total badges and certificates if achievements are provided
    if (achievements) {
      if (achievements.badges && Array.isArray(achievements.badges)) {
        updateData['stats.totalBadges'] = achievements.badges.length;
      }
      if (achievements.certificates && Array.isArray(achievements.certificates)) {
        updateData['stats.totalCertificates'] = achievements.certificates.length;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!updatedUser) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json(
      new ApiResponse(
        200,
        'User profile updated successfully',
        updatedUser
      )
    );
  }
);

/**
 * @desc    Update user profile background
 * @route   PATCH /api/users/me/background
 * @access  Private
 */
export const updateProfileBackground = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { type, value, name } = req.body;

    // Validate required fields
    if (!type || !value || !name) {
      return next(new AppError('Type, value, and name are required', 400));
    }

    // Validate type
    if (!['gradient', 'image'].includes(type)) {
      return next(new AppError('Type must be either "gradient" or "image"', 400));
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          profileBackground: {
            type,
            value,
            name
          }
        }
      },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!updatedUser) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json(
      new ApiResponse(
        200,
        'Profile background updated successfully',
        updatedUser.profileBackground
      )
    );
  }
);

/**
 * @desc    Handle Clerk webhook for user creation/updates
 * @route   POST /api/webhooks/clerk
 * @access  Public (Webhook signature should be verified in production)
 */
export const handleClerkWebhook = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const evt = req.body;
    const eventType = evt.type;

    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name } = evt.data;

      const existingUser = await User.findOne({ clerkId: id });
      if (existingUser) {
        // Idempotency: If user already exists, acknowledge successfully.
        return res.status(200).json({ message: 'User already processed.' });
      }

      const primaryEmail = email_addresses.find((e: any) => e.id === evt.data.primary_email_address_id)?.email_address;
      if (!primaryEmail) {
        return next(new AppError('Primary email address not found on webhook event.', 400));
      }

      const newUser = await User.create({
        clerkId: id,
        email: primaryEmail,
        fullName: `${first_name || ''} ${last_name || ''}`.trim(),
      });

      return res.status(201).json(new ApiResponse(201, 'User created successfully.', { userId: newUser._id }));

    } else if (eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = evt.data;

      const primaryEmail = email_addresses.find((e: any) => e.id === evt.data.primary_email_address_id)?.email_address;
      if (!primaryEmail) {
        return next(new AppError('Primary email address not found on webhook event.', 400));
      }

      const updatedUser = await User.findOneAndUpdate(
        { clerkId: id },
        {
          $set: {
            email: primaryEmail,
            fullName: `${first_name || ''} ${last_name || ''}`.trim(),
          },
        },
        { new: true }
      );

      if (!updatedUser) {
        // This could happen if the created webhook failed or was missed.
        // We could either create the user here or return an error.
        // For now, we'll return an error.
        return next(new AppError(`Webhook Error: User with clerkId ${id} not found for update.`, 404));
      }

      return res.status(200).json(new ApiResponse(200, 'User updated successfully.', { userId: updatedUser._id }));

    } else if (eventType === 'user.deleted') {
      const { id } = evt.data;
      
      await User.findOneAndDelete({ clerkId: id });
      
      return res.status(200).json(new ApiResponse(200, 'User deleted successfully.'));
    }

    // Acknowledge other event types without taking action
    res.status(200).json({ message: `Webhook received: ${eventType}, no action taken.` });
  }
);

/**
 * @desc    Get current user role
 * @route   GET /api/users/me/role
 * @access  Private
 */
export const getUserRole = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Get all roles for the user (both global and channel-specific)
    const userRoles = await UserRole.find({ userId: user._id })
      .sort({ role: 1 }) // This will sort: admin, moderator, user
      .select('role channelId grantedBy grantedAt');

    // Separate global and channel-specific roles
    const globalRoles = userRoles.filter(role => !role.channelId);
    const channelRoles = userRoles.filter(role => role.channelId);

    // Determine highest global role
    let highestGlobalRole = 'user';
    if (globalRoles.length > 0) {
      const adminRole = globalRoles.find(role => role.role === 'admin');
      if (adminRole) {
        highestGlobalRole = 'admin';
      } else {
        const moderatorRole = globalRoles.find(role => role.role === 'moderator');
        if (moderatorRole) {
          highestGlobalRole = 'moderator';
        }
      }
    }

    // Create a map of channel-specific roles for easy lookup
    const channelRoleMap: Record<string, { role: string; grantedBy?: string; grantedAt?: Date }> = {};
    channelRoles.forEach(role => {
      if (role.channelId) {
        channelRoleMap[role.channelId.toString()] = {
          role: role.role,
          grantedBy: role.grantedBy?.toString(),
          grantedAt: role.grantedAt
        };
      }
    });

    res.status(200).json(
      new ApiResponse(
        200,
        'User role retrieved successfully',
        { 
          role: highestGlobalRole, // Backward compatibility
          globalRole: highestGlobalRole,
          globalRoles: globalRoles,
          channelRoles: channelRoleMap,
          allRoles: userRoles // Complete role information
        }
      )
    );
  }
);

/**
 * @desc    Record daily visit and update streak
 * @route   POST /api/users/me/visit
 * @access  Private
 */
export const recordDailyVisitController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const streakInfo = await recordDailyVisit(req.user._id);
      
      res.status(200).json(
        new ApiResponse(
          200,
          'Daily visit recorded successfully',
          streakInfo
        )
      );
    } catch (error) {
      return next(new AppError(error instanceof Error ? error.message : 'Failed to record visit', 500));
    }
  }
);

/**
 * @desc    Get current streak information
 * @route   GET /api/users/me/streak
 * @access  Private
 */
export const getStreakInfoController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const streakInfo = await getStreakInfo(req.user._id);
      
      res.status(200).json(
        new ApiResponse(
          200,
          'Streak information retrieved successfully',
          streakInfo
        )
      );
    } catch (error) {
      return next(new AppError(error instanceof Error ? error.message : 'Failed to get streak info', 500));
    }
  }
);

/**
 * @desc    Change user password
 * @route   PATCH /api/users/me/password
 * @access  Private
 */
export const changePasswordController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new AppError('Current password and new password are required', 400));
    }

    if (newPassword.length < 8) {
      return next(new AppError('New password must be at least 8 characters long', 400));
    }

    try {
      // Note: In a real implementation, you would verify the current password with Clerk
      // For now, we'll just update the user record
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { passwordUpdatedAt: new Date() } },
        { new: true }
      );

      if (!updatedUser) {
        return next(new AppError('User not found', 404));
      }

      res.status(200).json(new ApiResponse(200, 'Password changed successfully'));
    } catch (error) {
      return next(new AppError(error instanceof Error ? error.message : 'Failed to change password', 500));
    }
  }
);

/**
 * @desc    Update user skills
 * @route   PATCH /api/users/me/skills
 * @access  Private
 */
export const updateSkillsController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return next(new AppError('Skills must be an array', 400));
    }

    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { 'profile.skills': skills } },
        { new: true }
      );

      if (!updatedUser) {
        return next(new AppError('User not found', 404));
      }

      res.status(200).json(new ApiResponse(200, 'Skills updated successfully', { skills: updatedUser.profile?.skills }));
    } catch (error) {
      return next(new AppError(error instanceof Error ? error.message : 'Failed to update skills', 500));
    }
  }
);

/**
 * @desc    Delete user account
 * @route   DELETE /api/users/me
 * @access  Private
 */
export const deleteAccountController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deletedUser = await User.findByIdAndDelete(req.user._id);

      if (!deletedUser) {
        return next(new AppError('User not found', 404));
      }

      res.status(200).json(new ApiResponse(200, 'Account deleted successfully'));
    } catch (error) {
      return next(new AppError(error instanceof Error ? error.message : 'Failed to delete account', 500));
    }
  }
);

/**
 * @desc    Export user data
 * @route   GET /api/users/me/export
 * @access  Private
 */
export const exportUserDataController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.user._id).select('-__v');

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      // Create export data (exclude sensitive information)
      const exportData = {
        profile: {
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          bio: user.profile?.bio,
          aboutMe: user.profile?.aboutMe,
          location: user.profile?.location,
          skills: user.profile?.skills,
          toolsAndTech: user.profile?.toolsAndTech,
        },
        college: user.college,
        socialLinks: user.socialLinks,
        stats: user.stats,
        interests: user.interests,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      res.status(200).json(new ApiResponse(200, 'User data exported successfully', exportData));
    } catch (error) {
      return next(new AppError(error instanceof Error ? error.message : 'Failed to export user data', 500));
    }
  }
);

/**
 * @desc    Get user's projects
 * @route   GET /api/users/me/projects
 * @access  Private
 */
export const getUserProjectsController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ProjectShowcase = (await import('../models/projectShowcase.model')).default;
      const projects = await ProjectShowcase.find({ userId: req.user._id })
        .sort({ submittedAt: -1 })
        .select('-__v');

      res.status(200).json(new ApiResponse(200, 'User projects retrieved successfully', { projects }));
    } catch (error) {
      return next(new AppError(error instanceof Error ? error.message : 'Failed to fetch user projects', 500));
    }
  }
);

/**
 * @desc    Get user's workspace preferences
 * @route   GET /api/users/me/workspace-preferences
 * @access  Private
 */
export const getWorkspacePreferencesController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.user._id).select('workspacePreferences');
      
      if (!user) {
        return next(new AppError('User not found', 404));
      }

      // Return default preferences if none exist
      const workspacePreferences = user.workspacePreferences || {
        editorSettings: {
          fontSize: 14,
          theme: 'system',
          wordWrap: true,
        },
        layout: {
          showProblemSidebar: true,
          showChatSidebar: true,
          sidebarWidths: {
            problem: 320,
            chat: 320,
          },
        },
        notifications: {
          channelUpdates: true,
          projectApprovals: true,
          mentions: true,
        },
      };

      res.status(200).json(new ApiResponse(200, 'Workspace preferences retrieved successfully', { workspacePreferences }));
    } catch (error) {
      return next(new AppError(error instanceof Error ? error.message : 'Failed to fetch workspace preferences', 500));
    }
  }
);

/**
 * @desc    Update user's workspace preferences
 * @route   PATCH /api/users/me/workspace-preferences
 * @access  Private
 */
export const updateWorkspacePreferencesController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { workspacePreferences } = req.body;

      if (!workspacePreferences) {
        return next(new AppError('Workspace preferences are required', 400));
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { workspacePreferences } },
        { new: true }
      ).select('workspacePreferences');

      if (!updatedUser) {
        return next(new AppError('User not found', 404));
      }

      res.status(200).json(new ApiResponse(200, 'Workspace preferences updated successfully', { workspacePreferences: updatedUser.workspacePreferences }));
    } catch (error) {
      return next(new AppError(error instanceof Error ? error.message : 'Failed to update workspace preferences', 500));
    }
  }
);

/**
 * @desc    Get user's bookmarked resources
 * @route   GET /api/users/me/bookmarks
 * @access  Private
 */
export const getBookmarkedResourcesController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.user._id)
        .populate('bookmarkedResources', 'title description url type createdAt')
        .select('bookmarkedResources');

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      // Transform the bookmarked resources to include the type and bookmarked date
      const bookmarks = (user.bookmarkedResources || []).map((resource: any) => ({
        _id: resource._id,
        title: resource.title,
        description: resource.description,
        url: resource.url,
        type: resource.type || 'forge', // Default to forge if type is not specified
        bookmarkedAt: resource.createdAt || new Date(),
      }));

      res.status(200).json(new ApiResponse(200, 'Bookmarked resources retrieved successfully', { bookmarks }));
    } catch (error) {
      return next(new AppError(error instanceof Error ? error.message : 'Failed to fetch bookmarked resources', 500));
    }
  }
);

/**
 * @desc    Remove bookmark
 * @route   DELETE /api/users/me/bookmarks/:resourceId
 * @access  Private
 */
export const removeBookmarkController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { resourceId } = req.params;
      const { resourceType } = req.body;

      if (!resourceId) {
        return next(new AppError('Resource ID is required', 400));
      }

      // Remove from user's bookmarked resources
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { bookmarkedResources: resourceId } },
        { new: true }
      );

      if (!updatedUser) {
        return next(new AppError('User not found', 404));
      }

      // Decrement bookmark count on the resource
      if (resourceType) {
        try {
          let ResourceModel: any;
          switch (resourceType) {
            case 'forge':
              ResourceModel = (await import('../models/forgeResource.model')).default;
              break;
            case 'nirvana-tool':
              ResourceModel = (await import('../models/nirvanaTool.model')).default;
              break;
            case 'nirvana-news':
              ResourceModel = (await import('../models/nirvanaNews.model')).default;
              break;
            case 'nirvana-hackathon':
              ResourceModel = (await import('../models/nirvanaHackathon.model')).default;
              break;
            default:
              ResourceModel = (await import('../models/forgeResource.model')).default;
          }

          if (ResourceModel && typeof ResourceModel.findByIdAndUpdate === 'function') {
            await ResourceModel.findByIdAndUpdate(resourceId, { $inc: { 'metrics.bookmarks': -1 } });
          }
        } catch (error) {
          console.error('Error updating resource bookmark count:', error);
          // Continue with the response even if bookmark count update fails
        }
      }

      res.status(200).json(new ApiResponse(200, 'Bookmark removed successfully'));
    } catch (error) {
      return next(new AppError(error instanceof Error ? error.message : 'Failed to remove bookmark', 500));
    }
  }
);

/**
 * @desc    Get public user profile by username
 * @route   GET /api/users/public/:username
 * @access  Public
 */
export const getPublicUserProfileController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username } = req.params;

      if (!username) {
        return next(new AppError('Username is required', 400));
      }

      const user = await User.findOne({ username })
        .select('fullName username profile socialLinks college stats achievements profileVisibility profileBackground profilePicture')
        .lean();

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      // Check if profile is public
      if (!user.profileVisibility?.isPublic) {
        return next(new AppError('Profile is private', 403));
      }

      // Filter data based on visibility settings
      const publicProfile = {
        fullName: user.fullName,
        username: user.username,
        profilePicture: (user as any).profilePicture,
        profile: {
          headline: user.profile?.headline,
          bio: user.profile?.bio,
          aboutMe: user.profileVisibility?.showSkills ? user.profile?.aboutMe : undefined,
          location: user.profile?.location,
          skills: user.profileVisibility?.showSkills ? user.profile?.skills : undefined,
          toolsAndTech: user.profileVisibility?.showSkills ? user.profile?.toolsAndTech : undefined,
        },
        socialLinks: user.profileVisibility?.showSocialLinks ? user.socialLinks : undefined,
        college: user.profileVisibility?.showCollegeDetails ? user.college : undefined,
        stats: user.profileVisibility?.showStats ? user.stats : undefined,
        achievements: user.profileVisibility?.showAchievements ? user.achievements : undefined,
        profileBackground: user.profileBackground,
      };

      res.status(200).json(
        new ApiResponse(200, 'Public profile retrieved successfully', {
          profile: publicProfile,
        })
      );
    } catch (error) {
      return next(new AppError(error instanceof Error ? error.message : 'Failed to fetch public profile', 500));
    }
  }
);

/**
 * @desc    Update user profile visibility settings
 * @route   PATCH /api/users/me/visibility
 * @access  Private
 */
export const updateProfileVisibilityController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { profileVisibility } = req.body;

      if (!profileVisibility || typeof profileVisibility !== 'object') {
        return next(new AppError('Profile visibility settings are required', 400));
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { profileVisibility } },
        { new: true, runValidators: true }
      ).select('profileVisibility');

      if (!updatedUser) {
        return next(new AppError('User not found', 404));
      }

      res.status(200).json(
        new ApiResponse(200, 'Profile visibility updated successfully', {
          profileVisibility: updatedUser.profileVisibility,
        })
      );
    } catch (error) {
      return next(new AppError(error instanceof Error ? error.message : 'Failed to update profile visibility', 500));
    }
  }
);

/**
 * @desc    Search users by username (for public profile discovery)
 * @route   GET /api/users/search?q=username
 * @access  Public
 */
export const searchUsersController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return next(new AppError('Search query is required', 400));
      }

      if (q.length < 2) {
        return next(new AppError('Search query must be at least 2 characters long', 400));
      }

      // Search for users with public profiles
      const users = await User.find({
        username: { $regex: q, $options: 'i' },
        'profileVisibility.isPublic': true
      })
      .select('username fullName profile.headline profile.bio profileBackground')
      .limit(10)
      .lean();

      const results = users.map(user => ({
        username: user.username,
        fullName: user.fullName,
        headline: user.profile?.headline,
        bio: user.profile?.bio,
        profileBackground: user.profileBackground,
        publicUrl: `/profile/${user.username}`
      }));

      res.status(200).json(
        new ApiResponse(200, 'Users found successfully', {
          results,
          total: results.length,
          query: q
        })
      );
    } catch (error) {
      return next(new AppError(error instanceof Error ? error.message : 'Failed to search users', 500));
    }
  }
);

/**
 * @desc    Get current user's scoring and skill tracking data
 * @route   GET /api/users/me/scoring
 * @access  Private
 */
export const getUserScoringController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const skillSummary = await getUserSkillSummary(req.user._id);
      
      if (!skillSummary) {
        return next(new AppError('User not found', 404));
      }

      res.status(200).json(
        new ApiResponse(200, 'User scoring data retrieved successfully', skillSummary)
      );
    } catch (error) {
      return next(new AppError(error instanceof Error ? error.message : 'Failed to fetch user scoring data', 500));
    }
  }
);

/**
 * @desc    Get compact dashboard summary (today's stats, goal, role match)
 * @route   GET /api/users/me/dashboard
 * @access  Private
 */
export const getUserDashboardController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const summary = await getDashboardSummary(req.user._id);
      if (!summary) return next(new AppError('User not found', 404));
      res.status(200).json(new ApiResponse(200, 'Dashboard summary fetched', summary));
    } catch (error) {
      return next(new AppError(error instanceof Error ? error.message : 'Failed to fetch dashboard summary', 500));
    }
  }
);

/**
 * @desc    Recompute learning patterns and role match (best-effort)
 * @route   POST /api/users/me/recompute-analytics
 * @access  Private
 */
export const recomputeUserAnalyticsController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await recomputeLearningPatterns(req.user._id as any);
      await recomputeRoleMatch(req.user._id as any);
      await rebuildDailyStatsFromHistory(req.user._id as any);
      res.status(200).json(new ApiResponse(200, 'User analytics recomputed', { ok: true }));
    } catch (error) {
      return next(new AppError(error instanceof Error ? error.message : 'Failed to recompute analytics', 500));
    }
  }
);

/**
 * @desc    Get deep insights for the user (patterns, breakdowns, comparisons)
 * @route   GET /api/users/me/insights
 * @access  Private
 */
export const getUserInsightsController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await getUserInsights(req.user._id);
      if (!data) return next(new AppError('User not found', 404));
      res.status(200).json(new ApiResponse(200, 'User insights fetched', data));
    } catch (error) {
      return next(new AppError(error instanceof Error ? error.message : 'Failed to fetch insights', 500));
    }
  }
);

/**
 * @desc    Get the next-up recommendation card for the user
 * @route   GET /api/users/me/next-up
 * @access  Private
 */
export const getNextUpController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rec = await getNextUpRecommendation(req.user._id);
      if (!rec) return next(new AppError('User not found', 404));
      res.status(200).json(new ApiResponse(200, 'Next-up recommendation fetched', rec));
    } catch (error) {
      return next(new AppError(error instanceof Error ? error.message : 'Failed to fetch next-up recommendation', 500));
    }
  }
);

/**
 * @desc    Set or update user's active goal (role and optional focus skills)
 * @route   POST /api/users/me/goal
 * @body    { role: string; title?: string; focusSkills?: string[]; targetDate?: string }
 * @access  Private
 */
export const setActiveGoalController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { role, title, focusSkills, targetDate } = req.body || {};
      if (!role || typeof role !== 'string') return next(new AppError('role is required', 400));
      await User.updateOne(
        { _id: req.user._id },
        { $set: { activeGoal: { role, title, focusSkills: Array.isArray(focusSkills) ? focusSkills : [], startedAt: new Date(), targetDate: targetDate ? new Date(targetDate) : undefined } } }
      );
      // Recompute role match for the new role
      await recomputeRoleMatch(req.user._id as any, role);
      res.status(200).json(new ApiResponse(200, 'Active goal set', { role }));
    } catch (error) {
      return next(new AppError(error instanceof Error ? error.message : 'Failed to set goal', 500));
    }
  }
);