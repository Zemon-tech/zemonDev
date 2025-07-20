import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import User from '../models/user.model';

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private (Admin, Moderator)
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const usersPromise = User.find({})
    .select('-password')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const totalUsersPromise = User.countDocuments({});

  const [users, totalUsers] = await Promise.all([usersPromise, totalUsersPromise]);

  const totalPages = Math.ceil(totalUsers / limit);

  res.status(200).json({
    success: true,
    count: users.length,
    pagination: {
      currentPage: page,
      totalPages,
      totalUsers,
    },
    data: users,
  });
});
