const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export class ApiService {
  private static async makeRequest(
    endpoint: string, 
    options: RequestInit = {}, 
    getToken: () => Promise<string | null>
  ) {
    const authHeader = await this.getAuthHeader(getToken);
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader as Record<string, string>),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
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

  // Hackathon API
  static async getCurrentHackathon(getToken: () => Promise<string | null>) {
    return this.makeRequest('/api/arena/hackathons/current', {}, getToken);
  }

  static async getHackathonLeaderboard(hackathonId: string, getToken: () => Promise<string | null>) {
    return this.makeRequest(`/api/arena/hackathons/${hackathonId}/leaderboard`, {}, getToken);
  }
} 