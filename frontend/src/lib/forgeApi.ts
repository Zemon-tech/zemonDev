// Utility for Forge API
export async function getForgeResources({ type = '', tags = '', difficulty = '', page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams();
  if (type) params.append('type', type);
  if (tags) params.append('tags', tags);
  if (difficulty) params.append('difficulty', difficulty);
  params.append('page', String(page));
  params.append('limit', String(limit));
  const res = await fetch(`/api/forge?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch resources');
  const data = await res.json();
  return data.data.resources;
}

export async function getForgeResourceById(id: string) {
  const res = await fetch(`/api/forge/${id}`);
  if (!res.ok) throw new Error('Resource not found');
  const data = await res.json();
  return data.data;
}

/**
 * Registers a view for a Forge resource (increments view count).
 * This is a side-effecting call that returns the updated resource.
 */
export async function registerForgeResourceView(id: string) {
  return getForgeResourceById(id);
} 