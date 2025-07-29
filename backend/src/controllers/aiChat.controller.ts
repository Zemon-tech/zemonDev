import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/AppError';
import ApiResponse from '../utils/ApiResponse';
import { AIChatHistory, CrucibleProblem } from '../models/index';
import { generateChatResponse, generateStreamingChatResponse } from '../services/ai.service';

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

    // Validate problem exists
    const problem = await CrucibleProblem.findById(problemId);
    if (!problem) {
      return next(new AppError('Problem not found', 404));
    }

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
 * @desc    Add a message to a chat session and get AI response
 * @route   POST /api/crucible/:problemId/chats/:chatId/messages
 * @access  Private
 */
export const addChatMessage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId, chatId } = req.params;
    const userId = req.user._id;
    const { content, solutionDraftContent } = req.body;

    // Validate request body
    if (!content) {
      return next(new AppError('Message content is required', 400));
    }

    // Get chat session and problem
    const [chatSession, problem] = await Promise.all([
      AIChatHistory.findOne({
        _id: chatId,
        userId,
        problemId,
        status: 'active'
      }),
      CrucibleProblem.findById(problemId)
    ]);

    if (!chatSession) {
      return next(new AppError('Chat session not found', 404));
    }

    if (!problem) {
      return next(new AppError('Problem not found', 404));
    }

    // Add user message
    const userMessage = {
      role: 'user' as const,
      content,
      timestamp: new Date()
    };
    chatSession.messages.push(userMessage);

    // Get AI response
    const aiResponse = await generateChatResponse(
      [...chatSession.messages],
      problem,
      solutionDraftContent
    );

    if (aiResponse.error) {
      return next(new AppError(aiResponse.message, 500));
    }

    // Add AI response to chat history
    const assistantMessage = {
      role: 'assistant' as const,
      content: aiResponse.message,
      timestamp: new Date()
    };
    chatSession.messages.push(assistantMessage);

    // Save updated chat session
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
 * @desc    Add a message to a chat session and get streaming AI response
 * @route   POST /api/crucible/:problemId/chats/:chatId/messages/stream
 * @access  Private
 */
export const addChatMessageStream = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId, chatId } = req.params;
    const userId = req.user._id;
    const { content, solutionDraftContent } = req.body;

    // Validate request body
    if (!content) {
      return next(new AppError('Message content is required', 400));
    }

    // Get chat session and problem
    const [chatSession, problem] = await Promise.all([
      AIChatHistory.findOne({
        _id: chatId,
        userId,
        problemId,
        status: 'active'
      }),
      CrucibleProblem.findById(problemId)
    ]);

    if (!chatSession) {
      return next(new AppError('Chat session not found', 404));
    }

    if (!problem) {
      return next(new AppError('Problem not found', 404));
    }

    // Add user message
    const userMessage = {
      role: 'user' as const,
      content,
      timestamp: new Date()
    };
    chatSession.messages.push(userMessage);

    // Set up SSE headers with proper caching and connection settings
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Flush headers immediately
    res.flushHeaders();

    // Send initial connection message
    const connectMessage = JSON.stringify({ type: 'connected', message: 'Streaming started' });
    res.write(`data: ${connectMessage}\n\n`);

    let fullResponse = '';
    let hasError = false;

    // Track connection state
    let isConnectionClosed = false;
    req.on('close', () => {
      isConnectionClosed = true;
      console.log('Client disconnected from stream');
    });

    try {
      console.log('Starting streaming response for chat:', chatId);
      const stream = generateStreamingChatResponse(
        [...chatSession.messages],
        problem,
        solutionDraftContent
      );

      let totalChunks = 0;
      let totalBytes = 0;
      let startTime = Date.now();

      for await (const chunk of stream) {
        // Check if client disconnected
        if (isConnectionClosed) {
          console.log('Client disconnected, stopping stream');
          break;
        }

        if (chunk.error) {
          hasError = true;
          console.error('Streaming error:', chunk.content);
          const errorMessage = JSON.stringify({ type: 'error', message: chunk.content });
          res.write(`data: ${errorMessage}\n\n`);
          break;
        }

        if (chunk.content) {
          fullResponse += chunk.content;
          totalChunks++;
          totalBytes += Buffer.byteLength(chunk.content, 'utf8');
          
          // Send real-time word-based chunks
          const chunkMessage = JSON.stringify({ 
            type: 'chunk', 
            content: chunk.content,
            timestamp: Date.now(),
            wordCount: chunk.content.trim().split(/\s+/).length
          });
          
          res.write(`data: ${chunkMessage}\n\n`);
          
          console.log(`Sent chunk #${totalChunks}: ${chunk.content.trim().split(/\s+/).length} words`);
        }

        if (chunk.isComplete) {
          const totalTime = Date.now() - startTime;
          console.log(`Stream completed: ${totalChunks} chunks, ${totalBytes} bytes, ${totalTime}ms`);
          console.log(`Average throughput: ${(totalBytes / totalTime * 1000).toFixed(2)} bytes/sec`);
          break;
        }
      }

      if (!hasError && !isConnectionClosed) {
        // Add AI response to chat history
        const assistantMessage = {
          role: 'assistant' as const,
          content: fullResponse,
          timestamp: new Date()
        };
        chatSession.messages.push(assistantMessage);

        // Save updated chat session
        await chatSession.save();
        console.log('Chat session saved successfully');

        // Send completion message with performance metrics
        const completeMessage = JSON.stringify({ 
          type: 'complete', 
          message: 'Response completed',
          timestamp: Date.now(),
          metrics: {
            totalChunks,
            totalBytes,
            totalTime: Date.now() - startTime
          }
        });
        res.write(`data: ${completeMessage}\n\n`);
      }

    } catch (error) {
      console.error('Streaming error:', error);
      if (!isConnectionClosed) {
        const errorMessage = JSON.stringify({ 
          type: 'error', 
          message: 'An error occurred during streaming',
          timestamp: Date.now()
        });
        res.write(`data: ${errorMessage}\n\n`);
      }
    } finally {
      if (!isConnectionClosed) {
        res.end();
      }
    }
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