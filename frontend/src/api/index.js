import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 handler: clear token and reload
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data)  => api.post('/auth/register', data),
  login:    (data)  => api.post('/auth/login', data),
  me:       ()      => api.get('/auth/me'),
};

// ─── Complaints ───────────────────────────────────────────────────────────────
export const complaintsApi = {
  raise:         (formData)         => api.post('/complaints', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  myList:        ()                 => api.get('/complaints'),
  adminList:     (params)           => api.get('/complaints/admin/all', { params }),
  getById:       (id)               => api.get(`/complaints/${id}`),
  updateStatus:  (id, body)         => api.patch(`/complaints/${id}/status`, body),
  updatePriority:(id, body)         => api.patch(`/complaints/${id}/priority`, body),
};

// ─── Notices ──────────────────────────────────────────────────────────────────
export const noticesApi = {
  list:   ()     => api.get('/notices'),
  getById:(id)   => api.get(`/notices/${id}`),
  create: (data) => api.post('/notices', data),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardApi = {
  get: () => api.get('/dashboard'),
};

export default api;
