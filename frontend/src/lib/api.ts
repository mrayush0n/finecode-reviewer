const API_URL = 'http://localhost:3000/api';

export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('github_pat');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const api = {
  get: async (endpoint: string) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(`API GET ${endpoint} failed: ${res.statusText}`);
    return res.json();
  },
  post: async (endpoint: string, data: any) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `API POST ${endpoint} failed`);
    }
    return res.json();
  }
};
