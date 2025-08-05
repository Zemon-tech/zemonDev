const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export class ApiService {
  private static async makeRequest(
    endpoint: string, 
    options: RequestInit = {}, 
    getToken: () => Promise<string | null>
  ) {
    const authHeader = await this.getAuthHeader(getToken);
    // Debug: Log the Authorization header (do not commit to production)
    if (authHeader && authHeader.Authorization) {
      // eslint-disable-next-line no-console
      console.log('[DEBUG] Sending Authorization header:', authHeader.Authorization);
    } else {
      // eslint-disable-next-line no-console
      console.warn('[DEBUG] No Authorization header set for request to', endpoint);
    }
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

  // Arena Channels API
  static async getChannels(getToken: () => Promise<string | null>) {
    return this.makeRequest('/api/arena/channels', {}, getToken);
  }

  static async getChannelMessages(
    channelId: string, 
    getToken: () => Promise<string | null>,
    limit = 50, 
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
  static async getShowcaseProjects(getToken: () => Promise<string | null>) {
    return this.makeRequest('/api/arena/showcase', {}, getToken);
  }

  static async upvoteProject(projectId: string, getToken: () => Promise<string | null>) {
    return this.makeRequest(
      `/api/arena/showcase/${projectId}/upvote`, 
      { method: 'POST' }, 
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
} 