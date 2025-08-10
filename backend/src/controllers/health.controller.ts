import { Request, Response } from 'express';
import ApiResponse from '../utils/ApiResponse';
import changeStreamsService from '../services/changeStreams.service';

/**
 * Get overall system health
 */
export const getHealth = async (req: Request, res: Response) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    };

    res.status(200).json(new ApiResponse(200, 'System is healthy', health));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, 'Health check failed', { error: 'Internal server error' }));
  }
};

/**
 * Get Change Streams service status
 */
export const getChangeStreamsStatus = async (req: Request, res: Response) => {
  try {
    const status = changeStreamsService.getStatus();
    
    res.status(200).json(new ApiResponse(200, 'Change Streams status retrieved', status));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, 'Failed to get Change Streams status', { error: 'Internal server error' }));
  }
};
