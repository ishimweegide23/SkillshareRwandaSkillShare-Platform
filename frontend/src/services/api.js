import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
};

export const postAPI = {
  createPost: (postData) => api.post('/posts', postData),
  createPostWithImages: (description, files) => {
    const formData = new FormData();
    formData.append('description', description);
    files.forEach(file => formData.append('files', file));
    return api.post('/posts/with-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getFeed: () => api.get('/posts'),
  likePost: (postId) => api.post(`/posts/${postId}/like`),
  unlikePost: (postId) => api.delete(`/posts/${postId}/like`),
  getPost: (postId) => api.get(`/posts/${postId}`),
};

export const commentAPI = {
  getComments: (postId) => api.get(`/comments/posts/${postId}`),
  addComment: (postId, content) => api.post(`/comments/posts/${postId}`, { content }),
  updateComment: (commentId, content) => api.put(`/comments/${commentId}`, { content }),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
};

export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

export const learningProgressAPI = {
  getProgress: () => api.get('/learning-progress'),
};

export default api; 