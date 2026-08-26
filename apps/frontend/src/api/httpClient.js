const BASE_URL = 'http://127.0.0.1:8000';

function formatEndpoint(endpoint) {
  let url = endpoint;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (!url.startsWith('/api/v1') && !url.startsWith('/docs') && !url.startsWith('/openapi')) {
      url = `/api/v1${url.startsWith('/') ? '' : '/'}${url}`;
    }
  }
  return url;
}

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('synova_token') || localStorage.getItem('access_token');
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(token && token !== 'demo-token' ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // If body is FormData, ensure Content-Type is removed so fetch creates boundary
  if (isFormData && headers['Content-Type']) {
    delete headers['Content-Type'];
  }

  const path = formatEndpoint(endpoint);

  try {
    const res = await fetch(path, { ...options, headers });
    if (res.ok) return res;
    if (res.status === 404 || res.status === 502) {
      return await fetch(`${BASE_URL}${path}`, { ...options, headers });
    }
    return res;
  } catch (err) {
    return await fetch(`${BASE_URL}${path}`, { ...options, headers });
  }
}

export const httpClient = {
  async get(url, options = {}) {
    const res = await apiRequest(url, { method: 'GET', ...options });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const err = new Error(data?.detail || res.statusText);
      err.response = { status: res.status, data };
      throw err;
    }
    return { data, status: res.status };
  },

  async post(url, body, options = {}) {
    const isFormData = body instanceof FormData;
    const res = await apiRequest(url, {
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
      ...options,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const err = new Error(data?.detail || res.statusText);
      err.response = { status: res.status, data };
      throw err;
    }
    return { data, status: res.status };
  },

  async put(url, body, options = {}) {
    const isFormData = body instanceof FormData;
    const res = await apiRequest(url, {
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body),
      ...options,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const err = new Error(data?.detail || res.statusText);
      err.response = { status: res.status, data };
      throw err;
    }
    return { data, status: res.status };
  },

  async patch(url, body, options = {}) {
    const isFormData = body instanceof FormData;
    const res = await apiRequest(url, {
      method: 'PATCH',
      body: isFormData ? body : JSON.stringify(body),
      ...options,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const err = new Error(data?.detail || res.statusText);
      err.response = { status: res.status, data };
      throw err;
    }
    return { data, status: res.status };
  },

  async delete(url, options = {}) {
    const res = await apiRequest(url, { method: 'DELETE', ...options });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const err = new Error(data?.detail || res.statusText);
      err.response = { status: res.status, data };
      throw err;
    }
    return { data, status: res.status };
  },
};

export default httpClient;
