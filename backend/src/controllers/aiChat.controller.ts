import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/AppError';
import ApiResponse from '../utils/ApiResponse';
import { AIChatHistory } from '../models/index';

/**
 * @desc    Get all chat sessions for a problem
 * @route   GET /api/crucible/:problemId/chats
 * @access  Private
 */
export const getChatSessions = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId } = req.params;
    const userId = req.user._id;

    const chatSessions = await AIChatHistory.find({
      userId,
      problemId,
      status: 'active'
    }).sort({ updatedAt: -1 });

    res.status(200).json(
      new ApiResponse(
        200,
        'Chat sessions fetched successfully',
        chatSessions
      )
    );
  }
);

/**
 * @desc    Create a new chat session
 * @route   POST /api/crucible/:problemId/chats
 * @access  Private
 */
export const createChatSession = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId } = req.params;
    const userId = req.user._id;
    const { title } = req.body;

    const chatSession = await AIChatHistory.create({
      userId,
      problemId,
      title: title || 'New Chat',
      messages: [],
      status: 'active'
    });

    res.status(201).json(
      new ApiResponse(
        201,
        'Chat session created successfully',
        chatSession
      )
    );
  }
);

/**
 * @desc    Get a specific chat session
 * @route   GET /api/crucible/:problemId/chats/:chatId
 * @access  Private
 */
export const getChatSession = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId, chatId } = req.params;
    const userId = req.user._id;

    const chatSession = await AIChatHistory.findOne({
      _id: chatId,
      userId,
      problemId
    });

    if (!chatSession) {
      return next(new AppError('Chat session not found', 404));
    }

    res.status(200).json(
      new ApiResponse(
        200,
        'Chat session fetched successfully',
        chatSession
      )
    );
  }
);

/**
 * @desc    Add a message to a chat session
 * @route   POST /api/crucible/:problemId/chats/:chatId/messages
 * @access  Private
 */
export const addChatMessage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId, chatId } = req.params;
    const userId = req.user._id;
    const { role, content } = req.body;

    // Validate request body
    if (!role || !content) {
      return next(new AppError('Role and content are required', 400));
    }

    if (role !== 'user' && role !== 'assistant') {
      return next(new AppError('Role must be either "user" or "assistant"', 400));
    }

    const chatSession = await AIChatHistory.findOne({
      _id: chatId,
      userId,
      problemId,
      status: 'active'
    });

    if (!chatSession) {
      return next(new AppError('Chat session not found', 404));
    }

    // Add the message
    chatSession.messages.push({
      role,
      content,
      timestamp: new Date()
    });

    await chatSession.save();

    res.status(200).json(
      new ApiResponse(
        200,
        'Message added successfully',
        chatSession
      )
    );
  }
);

/**
 * @desc    Update chat session title
 * @route   PUT /api/crucible/:problemId/chats/:chatId
 * @access  Private
 */
export const updateChatSession = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId, chatId } = req.params;
    const userId = req.user._id;
    const { title } = req.body;

    const chatSession = await AIChatHistory.findOne({
      _id: chatId,
      userId,
      problemId,
      status: 'active'
    });

    if (!chatSession) {
      return next(new AppError('Chat session not found', 404));
    }

    if (title) {
      chatSession.title = title;
    }

    await chatSession.save();

    res.status(200).json(
      new ApiResponse(
        200,
        'Chat session updated successfully',
        chatSession
      )
    );
  }
);

/**
 * @desc    Delete a chat session
 * @route   DELETE /api/crucible/:problemId/chats/:chatId
 * @access  Private
 */
export const deleteChatSession = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId, chatId } = req.params;
    const userId = req.user._id;

    const chatSession = await AIChatHistory.findOne({
      _id: chatId,
      userId,
      problemId,
      status: 'active'
    });

    if (!chatSession) {
      return next(new AppError('Chat session not found', 404));
    }

    // Soft delete by changing status
    chatSession.status = 'archived';
    await chatSession.save();

    res.status(200).json(
      new ApiResponse(
        200,
        'Chat session deleted successfully',
        {}
      )
    );
  }
); 