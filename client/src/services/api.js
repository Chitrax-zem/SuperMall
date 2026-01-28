import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Safe logger (silent in production)
const logError = (...args) => {
  if (import.meta.env.MODE !== 'production') {
    console.error(...args);
  }
};

// Response interceptor - Handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isCanceled =
      (typeof axios.isCancel === 'function' && axios.isCancel(error)) ||
      error?.code === 'ERR_CANCELED' ||
      error?.name === 'CanceledError' ||
      error?.message?.toLowerCase?.() === 'canceled';

    if (isCanceled) return Promise.reject(error);

    if (error.response) {
      const { status, data } = error.response; // no unused vars

      switch (status) {
        case 401: {
          // Clear token; let app-level auth guards handle navigation.
          localStorage.removeItem('token');
          break;
        }
        case 403:
          logError('Access forbidden');
          break;
        case 404:
          logError('Resource not found');
          break;
        case 500:
          logError('Server error occurred');
          break;
        default:
          logError(
            'An error occurred:',
            typeof data === 'string' ? data : data?.message || 'Unknown error'
          );
      }
      return Promise.reject(error);
    } else if (error.request) {
      logError('No response from server. Please check your connection.');
      return Promise.reject(new Error('Network error. Please try again.'));
    } else {
      logError('Error:', error.message);
      return Promise.reject(error);
    }
  }
);

// Admin auth API (matches your server routes)
export const authAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
  getCurrentUser: () => api.get('/admin/profile'),
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },
};

// Products
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Shops
export const shopsAPI = {
  getAll: (params) => api.get('/shops', { params }),
  getById: (id) => api.get(`/shops/${id}`),
  create: (data) => api.post('/shops', data),
  update: (id, data) => api.put(`/shops/${id}`, data),
  delete: (id) => api.delete(`/shops/${id}`),
};

// Offers
export const offersAPI = {
  getAll: (params) => api.get('/offers', { params }),
  getById: (id) => api.get(`/offers/${id}`),
  create: (data) => api.post('/offers', data),
  update: (id, data) => api.put(`/offers/${id}`, data),
  delete: (id) => api.delete(`/offers/${id}`),
};

// Categories
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Floors
export const floorsAPI = {
  getAll: () => api.get('/floors'),
  getById: (id) => api.get(`/floors/${id}`),
  create: (data) => api.post('/floors', data),
  update: (id, data) => api.put(`/floors/${id}`, data),
  delete: (id) => api.delete(`/floors/${id}`),
};

// Upload
export const uploadFile = async (file, endpoint) => {
  const formData = new FormData();
  formData.append('file', file);

  return api.post(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Query string helper
export const buildQueryString = (params) => {
  const query = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      query.append(key, params[key]);
    }
  });
  return query.toString();
};

export default api;
