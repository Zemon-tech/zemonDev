const BASE_URL = 'http://localhost:3001/api';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * API Service for handling CRUD operations
 */
class ApiService {
  /**
   * Generic GET request
   */
  static async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `Error fetching data: ${response.statusText}`,
          response.status,
          errorData
        );
      }
      
      const responseData = await response.json();
      // Handle the API response structure (data is usually in the data property)
      return responseData.data || responseData;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error occurred',
        0
      );
    }
  }

  /**
   * Generic POST request
   */
  static async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `Error posting data: ${response.statusText}`,
          response.status,
          errorData
        );
      }
      
      const responseData = await response.json();
      return responseData.data || responseData;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error occurred',
        0
      );
    }
  }

  /**
   * Generic PUT request
   */
  static async put<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `Error updating data: ${response.statusText}`,
          response.status,
          errorData
        );
      }
      
      const responseData = await response.json();
      return responseData.data || responseData;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error occurred',
        0
      );
    }
  }

  /**
   * Generic DELETE request
   */
  static async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `Error deleting data: ${response.statusText}`,
          response.status,
          errorData
        );
      }
      
      const responseData = await response.json();
      return responseData.data || responseData;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error occurred',
        0
      );
    }
  }

  // Collection-specific methods

  /**
   * Get all channels with optional pagination
   */
  static async getChannels() {
    return this.get('/arena/channels');
  }

  /**
   * Get a specific channel by ID
   */
  static async getChannel(id: string) {
    return this.get(`/arena/channels/${id}`);
  }

  /**
   * Create a new channel
   */
  static async createChannel(data: any) {
    return this.post('/dev-admin/channels', data);
  }

  /**
   * Update an existing channel
   */
  static async updateChannel(id: string, data: any) {
    return this.put(`/dev-admin/channels/${id}`, data);
  }

  /**
   * Delete a channel
   */
  static async deleteChannel(id: string) {
    return this.delete(`/dev-admin/channels/${id}`);
  }

  /**
   * Get messages for a specific channel
   */
  static async getChannelMessages(channelId: string, page = 1, limit = 50) {
    return this.get(`/arena/channels/${channelId}/messages?page=${page}&limit=${limit}`);
  }

  /**
   * Get hackathon history
   */
  static async getHackathons() {
    return this.get('/arena/hackathons/history');
  }

  /**
   * Get current hackathon
   */
  static async getCurrentHackathon() {
    return this.get('/arena/hackathons/current');
  }

  /**
   * Get showcases
   */
  static async getShowcases() {
    return this.get('/arena/showcase');
  }

  /**
   * Get all messages (paginated, dev only)
   */
  static async getAllMessages(page = 1, limit = 1) {
    return this.get(`/dev-admin/messages?page=${page}&limit=${limit}`);
  }

  /**
   * Get the total number of messages (dev only)
   */
  static async getTotalMessagesCount() {
    // Fetch just 1 message, but get the total from the response
    const response = await this.getAllMessages(1, 1) as { total?: number };
    return response.total || 0;
  }

  /**
   * Get all channels (flat, dev-admin only)
   */
  static async getAllDevChannels() {
    return this.get('/dev-admin/channels');
  }
}

export default ApiService; 