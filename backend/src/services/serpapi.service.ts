import { getJson } from 'serpapi';
import env from '../config/env';

// --- INTERFACES ---

export interface ISearchResult {
  title: string;
  link: string;
  snippet: string;
  source?: string;
  date?: string;
}

export interface ISearchResponse {
  results: ISearchResult[];
  totalResults?: number;
  searchTime?: number;
  query: string;
}

export interface INewsResult {
  title: string;
  link: string;
  snippet: string;
  source: string;
  date: string;
  thumbnail?: string;
}

export interface INewsResponse {
  news: INewsResult[];
  totalResults?: number;
  searchTime?: number;
  query: string;
}

export interface IScholarResult {
  title: string;
  link: string;
  snippet: string;
  authors?: string[];
  publication?: string;
  year?: string;
  citations?: string;
}

export interface IScholarResponse {
  results: IScholarResult[];
  totalResults?: number;
  searchTime?: number;
  query: string;
}

export interface IWebScrapingResult {
  title: string;
  content: string;
  links: string[];
  images: string[];
  metadata: Record<string, any>;
}

// --- SERPAPI CONFIGURATION ---

const serpApiKey = env.SERPAPI_KEY;

if (!serpApiKey) {
  console.warn("WARNING: SERPAPI_KEY is not set. Web search and scraping features will be disabled.");
}

// --- HELPER FUNCTIONS ---

const handleSerpApiError = (error: unknown, operation: string): never => {
  console.error(`SerpAPI ${operation} error:`, error);
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  throw new Error(`Failed to perform ${operation}: ${errorMessage}`);
};

const validateApiKey = (): void => {
  if (!serpApiKey) {
    throw new Error('SerpAPI key is not configured. Please set SERPAPI_KEY in your environment variables.');
  }
};

// --- CORE SEARCH SERVICES ---

/**
 * Perform a general web search using Google
 * @param query Search query
 * @param numResults Number of results to return (default: 10)
 * @returns Search results
 */
export const performWebSearch = async (
  query: string, 
  numResults: number = 10
): Promise<ISearchResponse> => {
  validateApiKey();
  
  try {
    const response = await getJson({
      engine: 'google',
      q: query,
      api_key: serpApiKey,
      num: numResults,
      gl: 'us',
      hl: 'en'
    });

    const results: ISearchResult[] = (response.organic_results || []).map((result: any) => ({
      title: result.title || '',
      link: result.link || '',
      snippet: result.snippet || '',
      source: result.source || '',
      date: result.date || ''
    }));

    return {
      results,
      totalResults: response.search_information?.total_results,
      searchTime: response.search_information?.time_taken_displayed,
      query
    };
  } catch (error) {
    return handleSerpApiError(error, 'web search');
  }
};

/**
 * Search for news articles
 * @param query News search query
 * @param numResults Number of results to return (default: 10)
 * @returns News results
 */
export const searchNews = async (
  query: string, 
  numResults: number = 10
): Promise<INewsResponse> => {
  validateApiKey();
  
  try {
    const response = await getJson({
      engine: 'google_news',
      q: query,
      api_key: serpApiKey,
      num: numResults,
      gl: 'us',
      hl: 'en'
    });

    const news: INewsResult[] = (response.news_results || []).map((result: any) => ({
      title: result.title || '',
      link: result.link || '',
      snippet: result.snippet || '',
      source: result.source || '',
      date: result.date || '',
      thumbnail: result.thumbnail || ''
    }));

    return {
      news,
      totalResults: response.search_information?.total_results,
      searchTime: response.search_information?.time_taken_displayed,
      query
    };
  } catch (error) {
    return handleSerpApiError(error, 'news search');
  }
};

/**
 * Search for scholarly articles using Google Scholar
 * @param query Academic search query
 * @param numResults Number of results to return (default: 10)
 * @returns Scholarly results
 */
export const searchScholar = async (
  query: string, 
  numResults: number = 10
): Promise<IScholarResponse> => {
  validateApiKey();
  
  try {
    const response = await getJson({
      engine: 'google_scholar',
      q: query,
      api_key: serpApiKey,
      num: numResults,
      gl: 'us',
      hl: 'en'
    });

    const results: IScholarResult[] = (response.organic_results || []).map((result: any) => ({
      title: result.title || '',
      link: result.link || '',
      snippet: result.snippet || '',
      authors: result.authors ? result.authors.split(', ') : [],
      publication: result.publication || '',
      year: result.year || '',
      citations: result.citations || ''
    }));

    return {
      results,
      totalResults: response.search_information?.total_results,
      searchTime: response.search_information?.time_taken_displayed,
      query
    };
  } catch (error) {
    return handleSerpApiError(error, 'scholar search');
  }
};

/**
 * Search for images
 * @param query Image search query
 * @param numResults Number of results to return (default: 20)
 * @returns Image search results
 */
export const searchImages = async (
  query: string, 
  numResults: number = 20
): Promise<any> => {
  validateApiKey();
  
  try {
    const response = await getJson({
      engine: 'google_images',
      q: query,
      api_key: serpApiKey,
      num: numResults,
      gl: 'us',
      hl: 'en'
    });

    return {
      images: response.images_results || [],
      totalResults: response.search_information?.total_results,
      searchTime: response.search_information?.time_taken_displayed,
      query
    };
  } catch (error) {
    handleSerpApiError(error, 'image search');
  }
};

/**
 * Get trending searches
 * @returns Trending search queries
 */
export const getTrendingSearches = async (): Promise<any> => {
  validateApiKey();
  
  try {
    const response = await getJson({
      engine: 'google_trends',
      api_key: serpApiKey,
      gl: 'us',
      hl: 'en'
    });

    return {
      trending: response.trending_searches || [],
      searchTime: new Date().toISOString()
    };
  } catch (error) {
    handleSerpApiError(error, 'trending searches');
  }
};

/**
 * Search for local businesses and places
 * @param query Local search query
 * @param location Location for local search
 * @param numResults Number of results to return (default: 10)
 * @returns Local search results
 */
export const searchLocal = async (
  query: string, 
  location: string, 
  numResults: number = 10
): Promise<any> => {
  validateApiKey();
  
  try {
    const response = await getJson({
      engine: 'google_local',
      q: query,
      location: location,
      api_key: serpApiKey,
      num: numResults,
      gl: 'us',
      hl: 'en'
    });

    return {
      localResults: response.local_results || [],
      totalResults: response.search_information?.total_results,
      searchTime: response.search_information?.time_taken_displayed,
      query,
      location
    };
  } catch (error) {
    handleSerpApiError(error, 'local search');
  }
};

/**
 * Get answer box information for a query
 * @param query Search query
 * @returns Answer box result
 */
export const getAnswerBox = async (query: string): Promise<any> => {
  validateApiKey();
  
  try {
    const response = await getJson({
      engine: 'google',
      q: query,
      api_key: serpApiKey,
      gl: 'us',
      hl: 'en'
    });

    return {
      answerBox: response.answer_box || null,
      knowledgeGraph: response.knowledge_graph || null,
      query
    };
  } catch (error) {
    handleSerpApiError(error, 'answer box search');
  }
};

/**
 * Search for shopping results
 * @param query Shopping search query
 * @param numResults Number of results to return (default: 20)
 * @returns Shopping results
 */
export const searchShopping = async (
  query: string, 
  numResults: number = 20
): Promise<any> => {
  validateApiKey();
  
  try {
    const response = await getJson({
      engine: 'google_shopping',
      q: query,
      api_key: serpApiKey,
      num: numResults,
      gl: 'us',
      hl: 'en'
    });

    return {
      shoppingResults: response.shopping_results || [],
      totalResults: response.search_information?.total_results,
      searchTime: response.search_information?.time_taken_displayed,
      query
    };
  } catch (error) {
    handleSerpApiError(error, 'shopping search');
  }
};

/**
 * Perform a comprehensive search across multiple engines
 * @param query Search query
 * @param engines Array of search engines to use
 * @returns Combined search results
 */
export const performMultiEngineSearch = async (
  query: string, 
  engines: string[] = ['google', 'bing', 'duckduckgo']
): Promise<any> => {
  validateApiKey();
  
  try {
    const searchPromises = engines.map(async (engine) => {
      try {
        const response = await getJson({
          engine,
          q: query,
          api_key: serpApiKey,
          num: 5,
          gl: 'us',
          hl: 'en'
        });

        return {
          engine,
          results: response.organic_results || [],
          totalResults: response.search_information?.total_results,
          searchTime: response.search_information?.time_taken_displayed
        };
             } catch (error) {
         console.warn(`Failed to search with engine ${engine}:`, error);
         const errorMessage = error instanceof Error ? error.message : 'Unknown error';
         return {
           engine,
           results: [],
           error: errorMessage
         };
       }
    });

    const results = await Promise.all(searchPromises);
    
    return {
      query,
      engines: results,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    handleSerpApiError(error, 'multi-engine search');
  }
};

export default {
  performWebSearch,
  searchNews,
  searchScholar,
  searchImages,
  getTrendingSearches,
  searchLocal,
  getAnswerBox,
  searchShopping,
  performMultiEngineSearch
};
