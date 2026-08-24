import axios from 'axios';

// In Next.js the frontend and API are on the same origin — no VITE_API_URL needed
const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  register: (data)  => api.post('/auth/register', data),
  login:    (data)  => api.post('/auth/login', data),
  me:       ()      => api.get('/auth/me'),
};

export const complaintsApi = {
  myList:       ()           => api.get('/complaints'),
  raise:        (data)       => api.post('/complaints', data),
  getById:      (id)         => api.get(`/complaints/${id}`),
  updateStatus: (id, data)   => api.patch(`/complaints/${id}/status`, data),
  updatePriority:(id, data)  => api.patch(`/complaints/${id}/priority`, data),
  adminList:    (params)     => api.get('/admin/complaints', { params }),
};

export const dashboardApi = {
  get: () => api.get('/admin/dashboard'),
};

export const noticesApi = {
  list:   ()     => api.get('/notices'),
  create: (data) => api.post('/notices', data),
};

export const cloudinaryApi = {
  getSignature: () => api.get('/cloudinary-signature'),
};
