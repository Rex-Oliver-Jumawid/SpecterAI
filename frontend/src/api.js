// Force relative /api path so Vercel rewrites proxy the request to the backend.
// This completely bypasses Safari's strict CORS and Intelligent Tracking Prevention (ITP).
export let BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

// ═══ Notebooks ═══

export const notebooks = {
  list: () => request('/notebooks'),
  create: (data = {}) => request('/notebooks', { method: 'POST', body: JSON.stringify(data) }),
  get: (id) => request(`/notebooks/${id}`),
  update: (id, data) => request(`/notebooks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/notebooks/${id}`, { method: 'DELETE' }),
};

// ═══ References ═══

export const references = {
  list: (notebookId) => request(`/notebooks/${notebookId}/references`),
  add: (notebookId, data) => request(`/notebooks/${notebookId}/references`, { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => request(`/references/${id}`, { method: 'DELETE' }),
  search: (query) => request(`/references/search?q=${encodeURIComponent(query)}`),
};

// ═══ Plans ═══

export const plans = {
  list: (notebookId) => request(`/notebooks/${notebookId}/plans`),
  create: (notebookId, data) => request(`/notebooks/${notebookId}/plans`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/plans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/plans/${id}`, { method: 'DELETE' }),
  trigger: (id) => request(`/plans/${id}/trigger`, { method: 'POST' }),
  confirm: (id, confirmed) => request(`/plans/${id}/confirm`, { method: 'POST', body: JSON.stringify({ confirmed }) }),
};

// ═══ Chat ═══

export const chat = {
  history: (notebookId) => request(`/notebooks/${notebookId}/chat`),
  send: (notebookId, message, mode) => request(`/notebooks/${notebookId}/chat`, { method: 'POST', body: JSON.stringify({ message, mode: mode || 'write' }) }),
  clear: (notebookId) => request(`/notebooks/${notebookId}/chat`, { method: 'DELETE' }),
};
