const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export interface FeedbackSubmission {
  message: string;
  category?: 'bug' | 'feature' | 'improvement' | 'question' | 'other';
}

export class ApiService {
  private static async makeRequest(
    endpoint: string, 
    options: RequestInit = {}, 
    getToken: () => Promise<string | null>
  ) {
    const authHeader = await this.getAuthHeader(getToken);
    if (Object.keys(authHeader).length === 0) {
      throw new Error('You must be signed in to access this resource. Please sign in.');
    }
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader as Record<string, string>),
        ...options.headers,
      },
    });

    let responseBody: any = null;
    try {
      responseBody = await response.json();
    } catch (e) {
      // ignore JSON parse error
    }

    if (!response.ok) {
      const error: any = new Error(responseBody?.message || `API Error: ${response.status}`);
      error.status = response.status;
      error.response = { status: response.status, data: responseBody };
      throw error;
    }

    return responseBody;
  }

  private static async getAuthHeader(getToken: () => Promise<string | null>) {
    const token = await getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private static async makePublicRequest(
    endpoint: string, 
    options: RequestInit = {}
  ) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    let responseBody: any = null;
    try {
      responseBody = await response.json();
    } catch (e) {
      // ignore JSON parse error
    }

    if (!response.ok) {
      const error: any = new Error(responseBody?.message || `API Error: ${response.status}`);
      error.status = response.status;
      error.response = { status: response.status, data: responseBody };
      throw error;
    }

    return responseBody;
  }

  // Arena Channels API
  static async getChannels(getToken: () => Promise<string | null>) {
    return this.makeRequest('/api/arena/channels', {}, getToken);
  }

  static async getAllChannelsForJoin(getToken: () => Promise<string | null>) {
    return this.makeRequest('/api/arena/channels/all', {}, getToken);
  }

  static async getChannelMessages(
    channelId: string, 
    getToken: () => Promise<string | null>,
    limit = 25, 
    before?: string
  ) {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (before) params.append('before', before);
    
    return this.makeRequest(
      `/api/arena/channels/${channelId}/messages?${params}`, 
      {}, 
      getToken
    );
  }

  // Project Showcase API
  static async getShowcaseProjects() {
    return this.makePublicRequest('/api/arena/showcase', {});
  }

  static async upvoteProject(projectId: string, getToken: () => Promise<string | null>) {
    return this.makeRequest(
      `/api/arena/showcase/${projectId}/upvote`, 
      { method: 'POST' }, 
      getToken
    );
  }

  static async removeUpvoteProject(projectId: string, getToken: () => Promise<string | null>) {
    return this.makeRequest(
      `/api/arena/showcase/${projectId}/upvote`,
      { method: 'DELETE' },
      getToken
    );
  }

  static async downvoteProject(projectId: string, getToken: () => Promise<string | null>) {
    return this.makeRequest(
      `/api/arena/showcase/${projectId}/downvote`,
      { method: 'POST' },
      getToken
    );
  }

  static async removeDownvoteProject(projectId: string, getToken: () => Promise<string | null>) {
    return this.makeRequest(
      `/api/arena/showcase/${projectId}/downvote`,
      { method: 'DELETE' },
      getToken
    );
  }

  static async submitShowcaseProject(data: any, getToken: () => Promise<string | null>) {
    return this.makeRequest(
      '/api/arena/showcase',
      { method: 'POST', body: JSON.stringify(data) },
      getToken
    );
  }

  // Hackathon API
  static async getCurrentHackathon(getToken: () => Promise<string | null>) {
    return this.makeRequest('/api/arena/hackathons/current', {}, getToken);
  }

  static async getHackathonLeaderboard(hackathonId: string, getToken: () => Promise<string | null>) {
    return this.makeRequest(`/api/arena/hackathons/${hackathonId}/leaderboard`, {}, getToken);
  }

  // Fetch current user's MongoDB profile
  static async getCurrentUser(getToken: () => Promise<string | null>) {
    return this.makeRequest('/api/users/me', {}, getToken);
  }

  // Update current user profile (partial), including profilePicture
  static async updateCurrentUser(partial: any, getToken: () => Promise<string | null>) {
    return this.makeRequest(
      '/api/users/me',
      { method: 'PATCH', body: JSON.stringify(partial) },
      getToken
    );
  }

  // Join channel request
  static async requestJoinChannel(channelId: string, getToken: () => Promise<string | null>) {
    return this.makeRequest(
      `/api/arena/channels/${channelId}/join`,
      { method: 'POST' },
      getToken
    );
  }

  // Fetch current user's channel membership statuses
  static async getUserChannelStatuses(getToken: () => Promise<string | null>) {
    return this.makeRequest('/api/arena/channels/user-channel-status', {}, getToken);
  }
  
  // Fetch detailed channel membership statuses with ban information
  static async getDetailedUserChannelStatuses(getToken: () => Promise<string | null>) {
    return this.makeRequest('/api/arena/channels/user-channel-status/detailed', {}, getToken);
  }

  // Fetch any user's channel membership statuses (admin only)
  static async getUserChannelStatusesForAdmin(userId: string, getToken: () => Promise<string | null>) {
    return this.makeRequest(`/api/arena/channels/user-channel-status/${userId}`, {}, getToken);
  }

  // Join Requests Admin API
  static async fetchJoinRequests(getToken: () => Promise<string | null>) {
    return this.makeRequest('/api/arena/channels/join-requests', {}, getToken);
  }
  static async postJoinRequestAction(endpoint: string, getToken: () => Promise<string | null>) {
    return this.makeRequest(endpoint, { method: 'POST' }, getToken);
  }

  static async leaveChannel(channelId: string, getToken: () => Promise<string | null>) {
    return this.makeRequest(`/api/arena/channels/${channelId}/leave`, { method: 'DELETE' }, getToken);
  }

  // Channel Management API
  static async updateChannelDescription(
    channelId: string, 
    description: string, 
    getToken: () => Promise<string | null>
  ) {
    return this.makeRequest(
      `/api/arena/channels/${channelId}/description`,
      { 
        method: 'PATCH',
        body: JSON.stringify({ description })
      }, 
      getToken
    );
  }

  // Admin Showcase API
  static async getAdminShowcaseProjects(
    getToken: () => Promise<string | null>,
    status?: 'pending' | 'approved' | 'all',
    page = 1,
    limit = 20
  ) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    return this.makeRequest(
      `/api/admin/showcase?${params}`,
      {},
      getToken
    );
  }

  static async approveShowcaseProject(
    projectId: string,
    getToken: () => Promise<string | null>
  ) {
    return this.makeRequest(
      `/api/admin/showcase/${projectId}/approve`,
      { method: 'POST' },
      getToken
    );
  }

  static async rejectShowcaseProject(
    projectId: string,
    reason: string,
    getToken: () => Promise<string | null>
  ) {
    return this.makeRequest(
      `/api/admin/showcase/${projectId}/reject`,
      { 
        method: 'POST',
        body: JSON.stringify({ reason })
      },
      getToken
    );
  }

  // Nirvana Feed API
  static async getNirvanaFeed(
    getToken: () => Promise<string | null>,
    params: { type?: 'hackathon' | 'news' | 'tool'; page?: number; limit?: number } = {}
  ) {
    const search = new URLSearchParams();
    if (params.type) search.append('type', params.type);
    if (params.page) search.append('page', String(params.page));
    if (params.limit) search.append('limit', String(params.limit));
    const qs = search.toString();
    return this.makeRequest(`/api/nirvana/feed${qs ? `?${qs}` : ''}`, {}, getToken);
  }

  static async createNirvanaHackathon(
    getToken: () => Promise<string | null>,
    data: any
  ) {
    return this.makeRequest('/api/nirvana/hackathons', { method: 'POST', body: JSON.stringify(data) }, getToken);
  }

  static async createNirvanaNews(
    getToken: () => Promise<string | null>,
    data: any
  ) {
    return this.makeRequest('/api/nirvana/news', { method: 'POST', body: JSON.stringify(data) }, getToken);
  }

  static async createNirvanaTool(
    getToken: () => Promise<string | null>,
    data: any
  ) {
    return this.makeRequest('/api/nirvana/tools', { method: 'POST', body: JSON.stringify(data) }, getToken);
  }

  static async updateNirvanaReaction(
    getToken: () => Promise<string | null>,
    type: 'hackathon' | 'news' | 'tool',
    id: string,
    reactionType: 'likes' | 'shares' | 'bookmarks',
    action: 'increment' | 'decrement'
  ) {
    return this.makeRequest(`/api/nirvana/${type}/${id}/reaction`, { method: 'PATCH', body: JSON.stringify({ reactionType, action }) }, getToken);
  }

  // Feedback API
  static async submitFeedback(data: FeedbackSubmission, getToken: () => Promise<string | null>) {
    return this.makeRequest(
      '/api/feedback',
      { method: 'POST', body: JSON.stringify(data) },
      getToken
    );
  }

  static async getUserFeedback(getToken: () => Promise<string | null>) {
    return this.makeRequest('/api/feedback', {}, getToken);
  }
} 
