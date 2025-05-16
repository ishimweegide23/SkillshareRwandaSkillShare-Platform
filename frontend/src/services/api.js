import axios from 'axios';

// Use VITE_API_URL if defined, fallback to localhost
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

// Create an Axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

// --- API Functions ---

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  refreshToken: () => api.post('/auth/refresh-token'),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const postAPI = {
  createPost: (postData) => api.post('/posts', postData),
  createPostWithImages: (description, files) => {
    const formData = new FormData();
    formData.append('description', description || '');
    if (files && files.length > 0) {
      files.forEach(file => formData.append('files', file));
    }
    return api.post('/posts/with-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getFeed: (page = 0, size = 10) => api.get(`/posts?page=${page}&size=${size}`),
  getPost: (postId) => api.get(`/posts/${postId}`),
  updatePost: (postId, postData) => {
    if (postData.files && postData.files.length > 0) {
      const formData = new FormData();
      formData.append('description', postData.description || '');
      postData.files.forEach(file => formData.append('files', file));
      return api.put(`/posts/${postId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.put(`/posts/${postId}`, { description: postData.description || '' });
  },
  deletePost: (postId) => api.delete(`/posts/${postId}`),
  likePost: (postId) => api.post(`/posts/${postId}/like`),
  unlikePost: (postId) => api.delete(`/posts/${postId}/like`),
  getPostComments: (postId) => api.get(`/posts/${postId}/comments`),
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
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

export const learningProgressAPI = {
  getProgress: () => api.get('/learning-progress'),
  getProgressById: (id) => api.get(`/learning-progress/${id}`),
  createProgress: (data) => api.post('/learning-progress', data),
  updateProgress: (id, data) => api.put(`/learning-progress/${id}`, data),
  deleteProgress: (id) => api.delete(`/learning-progress/${id}`)
};

export const feedAPI = {
  getAllPosts: () => axios.get(`${API_URL}/api/feed`),
  getPostsByCategory: (category) => axios.get(`${API_URL}/api/feed/category/${category}`),
  getPostsBySourceType: (sourceType) => axios.get(`${API_URL}/api/feed/source/${sourceType}`),
  getPostsByCategoryAndSourceType: (category, sourceType) => 
    axios.get(`${API_URL}/api/feed/category/${category}/source/${sourceType}`),
  createPost: (post) => axios.post(`${API_URL}/api/feed`, post),
  updatePost: (id, post) => axios.put(`${API_URL}/api/feed/${id}`, post),
  deletePost: (id) => axios.delete(`${API_URL}/api/feed/${id}`),
  likePost: (id) => axios.post(`${API_URL}/api/feed/${id}/like`),
  getComments: (postId) => axios.get(`${API_URL}/api/feed/${postId}/comments`),
  addComment: (postId, comment) => axios.post(`${API_URL}/api/feed/${postId}/comments`, comment),
  updateComment: (postId, commentId, comment) => 
    axios.put(`${API_URL}/api/feed/${postId}/comments/${commentId}`, comment),
  deleteComment: (postId, commentId) => 
    axios.delete(`${API_URL}/api/feed/${postId}/comments/${commentId}`),
};

// Utility error handler
export const handleApiError = (error) => {
  if (error.response) {
    console.error('API Error Response:', {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers,
    });
    return error.response.data.message || 'An error occurred';
  } else if (error.request) {
    console.error('API Error Request:', error.request);
    return 'No response from server';
  } else {
    console.error('API Error:', error.message);
    return error.message || 'An error occurred';
  }
};

export default api;
