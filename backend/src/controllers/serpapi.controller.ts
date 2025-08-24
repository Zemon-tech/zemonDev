import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/AppError';
import ApiResponse from '../utils/ApiResponse';
import {
  performWebSearch,
  searchNews,
  searchScholar,
  searchImages,
  getTrendingSearches,
  searchLocal,
  getAnswerBox,
  searchShopping,
  performMultiEngineSearch
} from '../services/serpapi.service';

/**
 * @desc    Perform a general web search
 * @route   POST /api/serpapi/web-search
 * @access  Private
 */
export const webSearch = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { query, numResults = 10 } = req.body;

    if (!query) {
      return next(new AppError('Search query is required', 400));
    }

    const results = await performWebSearch(query, numResults);

    res.status(200).json(
      new ApiResponse(
        200,
        'Web search completed successfully',
        results
      )
    );
  }
);

/**
 * @desc    Search for news articles
 * @route   POST /api/serpapi/news-search
 * @access  Private
 */
export const newsSearch = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { query, numResults = 10 } = req.body;

    if (!query) {
      return next(new AppError('News search query is required', 400));
    }

    const results = await searchNews(query, numResults);

    res.status(200).json(
      new ApiResponse(
        200,
        'News search completed successfully',
        results
      )
    );
  }
);

/**
 * @desc    Search for scholarly articles
 * @route   POST /api/serpapi/scholar-search
 * @access  Private
 */
export const scholarSearch = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { query, numResults = 10 } = req.body;

    if (!query) {
      return next(new AppError('Scholar search query is required', 400));
    }

    const results = await searchScholar(query, numResults);

    res.status(200).json(
      new ApiResponse(
        200,
        'Scholar search completed successfully',
        results
      )
    );
  }
);

/**
 * @desc    Search for images
 * @route   POST /api/serpapi/image-search
 * @access  Private
 */
export const imageSearch = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { query, numResults = 20 } = req.body;

    if (!query) {
      return next(new AppError('Image search query is required', 400));
    }

    const results = await searchImages(query, numResults);

    res.status(200).json(
      new ApiResponse(
        200,
        'Image search completed successfully',
        results
      )
    );
  }
);

/**
 * @desc    Get trending searches
 * @route   GET /api/serpapi/trending
 * @access  Private
 */
export const getTrending = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const results = await getTrendingSearches();

    res.status(200).json(
      new ApiResponse(
        200,
        'Trending searches retrieved successfully',
        results
      )
    );
  }
);

/**
 * @desc    Search for local businesses and places
 * @route   POST /api/serpapi/local-search
 * @access  Private
 */
export const localSearch = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { query, location, numResults = 10 } = req.body;

    if (!query || !location) {
      return next(new AppError('Both query and location are required', 400));
    }

    const results = await searchLocal(query, location, numResults);

    res.status(200).json(
      new ApiResponse(
        200,
        'Local search completed successfully',
        results
      )
    );
  }
);

/**
 * @desc    Get answer box information
 * @route   POST /api/serpapi/answer-box
 * @access  Private
 */
export const getAnswerBoxInfo = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { query } = req.body;

    if (!query) {
      return next(new AppError('Search query is required', 400));
    }

    const results = await getAnswerBox(query);

    res.status(200).json(
      new ApiResponse(
        200,
        'Answer box information retrieved successfully',
        results
      )
    );
  }
);

/**
 * @desc    Search for shopping results
 * @route   POST /api/serpapi/shopping-search
 * @access  Private
 */
export const shoppingSearch = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { query, numResults = 20 } = req.body;

    if (!query) {
      return next(new AppError('Shopping search query is required', 400));
    }

    const results = await searchShopping(query, numResults);

    res.status(200).json(
      new ApiResponse(
        200,
        'Shopping search completed successfully',
        results
      )
    );
  }
);

/**
 * @desc    Perform multi-engine search
 * @route   POST /api/serpapi/multi-engine-search
 * @access  Private
 */
export const multiEngineSearch = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { query, engines = ['google', 'bing', 'duckduckgo'] } = req.body;

    if (!query) {
      return next(new AppError('Search query is required', 400));
    }

    const results = await performMultiEngineSearch(query, engines);

    res.status(200).json(
      new ApiResponse(
        200,
        'Multi-engine search completed successfully',
        results
      )
    );
  }
);

/**
 * @desc    Perform comprehensive research search
 * @route   POST /api/serpapi/research-search
 * @access  Private
 */
export const researchSearch = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { query, numResults = 10 } = req.body;

    if (!query) {
      return next(new AppError('Research query is required', 400));
    }

    try {
      // Perform multiple types of searches for comprehensive research
      const [webResults, newsResults, scholarResults] = await Promise.all([
        performWebSearch(query, numResults),
        searchNews(query, numResults),
        searchScholar(query, numResults)
      ]);

      const comprehensiveResults = {
        query,
        timestamp: new Date().toISOString(),
        webSearch: webResults,
        newsSearch: newsResults,
        scholarSearch: scholarResults,
        summary: {
          totalWebResults: webResults.totalResults || 0,
          totalNewsResults: newsResults.totalResults || 0,
          totalScholarResults: scholarResults.totalResults || 0
        }
      };

      res.status(200).json(
        new ApiResponse(
          200,
          'Comprehensive research search completed successfully',
          comprehensiveResults
        )
      );
    } catch (error) {
      return next(new AppError('Failed to perform comprehensive research search', 500));
    }
  }
);

export default {
  webSearch,
  newsSearch,
  scholarSearch,
  imageSearch,
  getTrending,
  localSearch,
  getAnswerBoxInfo,
  shoppingSearch,
  multiEngineSearch,
  researchSearch
};
