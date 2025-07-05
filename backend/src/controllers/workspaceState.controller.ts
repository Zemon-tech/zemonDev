import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/AppError';
import ApiResponse from '../utils/ApiResponse';
import { WorkspaceState } from '../models/index';

/**
 * @desc    Get workspace state for a problem
 * @route   GET /api/crucible/:problemId/workspace
 * @access  Private
 */
export const getWorkspaceState = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId } = req.params;
    const userId = req.user._id;

    // Try to find existing workspace state
    let workspaceState = await WorkspaceState.findOne({
      userId,
      problemId
    });

    // If no workspace state exists, create a new one with defaults
    if (!workspaceState) {
      workspaceState = await WorkspaceState.create({
        userId,
        problemId,
        activeMode: 'solution',
        layout: {
          showProblemSidebar: true,
          showChatSidebar: true,
          sidebarWidths: {
            problem: 320,
            chat: 320
          }
        },
        editorSettings: {
          fontSize: 14,
          theme: 'system',
          wordWrap: true
        }
      });
    }

    res.status(200).json(
      new ApiResponse(
        200,
        'Workspace state fetched successfully',
        workspaceState
      )
    );
  }
);

/**
 * @desc    Update workspace state for a problem
 * @route   PUT /api/crucible/:problemId/workspace
 * @access  Private
 */
export const updateWorkspaceState = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId } = req.params;
    const userId = req.user._id;
    const { activeMode, layout, editorSettings } = req.body;

    // Find the workspace state
    let workspaceState = await WorkspaceState.findOne({
      userId,
      problemId
    });

    // If no workspace state exists, create a new one
    if (!workspaceState) {
      workspaceState = await WorkspaceState.create({
        userId,
        problemId,
        activeMode: activeMode || 'solution',
        layout: layout || {
          showProblemSidebar: true,
          showChatSidebar: true,
          sidebarWidths: {
            problem: 320,
            chat: 320
          }
        },
        editorSettings: editorSettings || {
          fontSize: 14,
          theme: 'system',
          wordWrap: true
        }
      });
    } else {
      // Update existing workspace state
      if (activeMode !== undefined) {
        workspaceState.activeMode = activeMode;
      }
      
      if (layout !== undefined) {
        // Update layout properties while preserving existing ones
        if (layout.showProblemSidebar !== undefined) {
          workspaceState.layout.showProblemSidebar = layout.showProblemSidebar;
        }
        if (layout.showChatSidebar !== undefined) {
          workspaceState.layout.showChatSidebar = layout.showChatSidebar;
        }
        if (layout.sidebarWidths) {
          if (layout.sidebarWidths.problem !== undefined) {
            workspaceState.layout.sidebarWidths.problem = layout.sidebarWidths.problem;
          }
          if (layout.sidebarWidths.chat !== undefined) {
            workspaceState.layout.sidebarWidths.chat = layout.sidebarWidths.chat;
          }
        }
      }
      
      if (editorSettings !== undefined) {
        // Update editor settings properties while preserving existing ones
        if (editorSettings.fontSize !== undefined) {
          workspaceState.editorSettings.fontSize = editorSettings.fontSize;
        }
        if (editorSettings.theme !== undefined) {
          workspaceState.editorSettings.theme = editorSettings.theme;
        }
        if (editorSettings.wordWrap !== undefined) {
          workspaceState.editorSettings.wordWrap = editorSettings.wordWrap;
        }
      }
      
      await workspaceState.save();
    }

    res.status(200).json(
      new ApiResponse(
        200,
        'Workspace state updated successfully',
        workspaceState
      )
    );
  }
); 