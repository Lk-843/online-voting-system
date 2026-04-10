// js/api.js - Shared API utility and auth helpers

const API = {
  base: '/api',

  // Get stored token
  token: () => localStorage.getItem('token'),

  // Get stored user
  user: () => JSON.parse(localStorage.getItem('user') || 'null'),

  // Save auth data
  saveAuth: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Clear auth and redirect to login
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  },

  // Redirect if not logged in
  requireAuth: () => {
    if (!API.token()) { window.location.href = '/'; return false; }
    return true;
  },

  // Redirect if not admin
  requireAdmin: () => {
    const user = API.user();
    if (!user || user.role !== 'admin') { window.location.href = '/dashboard'; return false; }
    return true;
  },

  // Generic fetch wrapper
  request: async (method, path, body = null) => {
    const opts = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(API.token() ? { Authorization: `Bearer ${API.token()}` } : {})
      }
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(API.base + path, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },

  get: (path) => API.request('GET', path),
  post: (path, body) => API.request('POST', path, body),
  put: (path, body) => API.request('PUT', path, body),
  delete: (path) => API.request('DELETE', path),
};

// Show alert helper
function showAlert(id, message, type = 'error') {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `alert alert-${type}`;
  el.textContent = message;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 4000);
}

// Set button loading state
function setLoading(btn, loading) {
  if (loading) {
    btn.dataset.original = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span> Loading...';
    btn.disabled = true;
  } else {
    btn.innerHTML = btn.dataset.original || btn.innerHTML;
    btn.disabled = false;
  }
}

// Format date
function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Render navbar user info
function renderNavUser() {
  const user = API.user();
  if (!user) return;
  const el = document.getElementById('nav-user');
  if (el) {
    el.innerHTML = `
      <div class="avatar">${user.name.charAt(0).toUpperCase()}</div>
      <span>${user.name}</span>
    `;
  }
}
