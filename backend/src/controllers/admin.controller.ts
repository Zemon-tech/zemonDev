import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import User from '../models/user.model';
import { ProjectShowcase } from '../models';
import AppError from '../utils/AppError';
import ApiResponse from '../utils/ApiResponse';
import { clearCache } from '../middleware/cache.middleware';
import { createNotification } from '../services/notification.service';

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

/**
 * @desc    Get all showcase projects (pending and approved)
 * @route   GET /api/admin/showcase
 * @access  Private (Admin, Moderator)
 */
export const getShowcaseProjects = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const status = req.query.status as string; // 'pending', 'approved', or 'all'

  // Build filter based on status
  let filter = {};
  if (status === 'pending') {
    filter = { isApproved: false };
  } else if (status === 'approved') {
    filter = { isApproved: true };
  }
  // If status is 'all' or not specified, show all projects

  const projectsPromise = ProjectShowcase.find(filter)
    .populate('userId', 'fullName clerkId')
    .populate('approvedBy', 'fullName')
    .skip(skip)
    .limit(limit)
    .sort({ submittedAt: -1 });

  const totalProjectsPromise = ProjectShowcase.countDocuments(filter);

  const [projects, totalProjects] = await Promise.all([projectsPromise, totalProjectsPromise]);

  const totalPages = Math.ceil(totalProjects / limit);

  res.status(200).json(
    new ApiResponse(200, 'Showcase projects retrieved successfully', {
      projects,
      pagination: {
        currentPage: page,
        totalPages,
        totalProjects,
        limit,
      },
    })
  );
});

/**
 * @desc    Approve a showcase project
 * @route   POST /api/admin/showcase/:projectId/approve
 * @access  Private (Admin, Moderator)
 */
export const approveShowcaseProject = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const approverId = req.user._id;

  const project = await ProjectShowcase.findById(projectId);
  
  if (!project) {
    return res.status(404).json(
      new ApiResponse(404, 'Project not found', null)
    );
  }

  if (project.isApproved) {
    return res.status(400).json(
      new ApiResponse(400, 'Project is already approved', null)
    );
  }

  // Update project to approved
  project.isApproved = true;
  project.approvedAt = new Date();
  project.approvedBy = approverId;
  
  await project.save();

  // Clear showcase cache so approved projects appear instantly
  await clearCache('anonymous:/api/arena/showcase');

  // Send notification to the project owner about approval
  try {
    await createNotification({
      userId: project.userId.toString(),
      type: 'project_approval',
      title: 'Project Approved! 🎉',
      message: `Your project "${project.title}" has been approved and is now live on the showcase!`,
      priority: 'high',
      data: {
        entityId: (project as any)._id.toString(),
        entityType: 'project_showcase',
        action: 'approved',
        metadata: {
          projectTitle: project.title,
          approvedAt: project.approvedAt,
        },
      },
    });
  } catch (error) {
    console.error('Failed to send project approval notification:', error);
  }

  res.status(200).json(
    new ApiResponse(200, 'Project approved successfully', project)
  );
});

/**
 * @desc    Reject a showcase project
 * @route   POST /api/admin/showcase/:projectId/reject
 * @access  Private (Admin, Moderator)
 */
export const rejectShowcaseProject = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { reason } = req.body;

  const project = await ProjectShowcase.findById(projectId);
  
  if (!project) {
    return res.status(404).json(
      new ApiResponse(404, 'Project not found', null)
    );
  }

  if (project.isApproved) {
    return res.status(400).json(
      new ApiResponse(400, 'Cannot reject an already approved project', null)
    );
  }

  // Delete the project (or you could add a 'rejected' status if you want to keep rejected projects)
  await ProjectShowcase.findByIdAndDelete(projectId);

  res.status(200).json(
    new ApiResponse(200, 'Project rejected successfully', null)
  );
});
