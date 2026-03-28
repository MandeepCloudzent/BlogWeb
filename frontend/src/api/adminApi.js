import api from './axiosInstance';

export const adminApi = {
  getStats: () => api.get('/auth/admin/stats/'),
  getUsers: (params) => api.get('/auth/admin/users/', { params }),
  updateUser: (id, data) => api.patch(`/auth/admin/users/${id}/`, data),
  getAllPosts: (params) => api.get('/blog/admin/posts/', { params }),
  moderatePost: (id, status) => api.patch(`/blog/admin/posts/${id}/moderate/`, { status }),
  getMessages: () => api.get('/contact/messages/'),
  updateMessage: (id, data) => api.patch(`/contact/messages/${id}/`, data),
  deleteMessage: (id) => api.delete(`/contact/messages/${id}/`),
};
