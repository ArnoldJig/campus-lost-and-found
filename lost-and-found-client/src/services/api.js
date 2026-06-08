import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getItems = (params) => API.get('/items', { params });
export const getItem = (id) => API.get(`/items/${id}`);
export const createItem = (data) => API.post('/items', data);
export const getMatches = (id) => API.get(`/items/${id}/matches`);
export const getMessages = (matchId) => API.get(`/messages/${matchId}`);
export const sendMessage = (data) => API.post('/messages', data);
export const getAdminItems = () => API.get('/admin/items');
export const getAdminMatches = () => API.get('/admin/matches');
export const getAdminUsers = () => API.get('/admin/users');
export const updateItemStatus = (id, status) => API.patch(`/admin/items/${id}/status`, { status });
export const deleteItem = (id) => API.delete(`/admin/items/${id}`);
export const getNotifications = () => API.get('/notifications');
export const getUnreadCount = () => API.get('/notifications/unread-count');
export const markAllRead = () => API.patch('/notifications/mark-read');
export const markOneRead = (id) => API.patch(`/notifications/${id}/read`);