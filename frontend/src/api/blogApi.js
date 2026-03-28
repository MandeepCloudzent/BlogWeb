import api from './axiosInstance';

export const blogApi = {
  // Posts
  getPosts: (params) => api.get('/blog/posts/', { params }),
  getPost: (slug) => api.get(`/blog/posts/${slug}/`),
  createPost: (data) => api.post('/blog/posts/create/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updatePost: (slug, data) => api.patch(`/blog/posts/${slug}/update/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deletePost: (slug) => api.delete(`/blog/posts/${slug}/delete/`),

  // Comments
  getComments: (slug) => api.get(`/blog/posts/${slug}/comments/`),
  createComment: (slug, data) => api.post(`/blog/posts/${slug}/comments/`, data),
  deleteComment: (id) => api.delete(`/blog/comments/${id}/delete/`),

  // Categories & Tags
  getCategories: () => api.get('/blog/categories/'),
  getCategoryPosts: (slug, params) => api.get(`/blog/categories/${slug}/posts/`, { params }),
  getTags: () => api.get('/blog/tags/'),
  getTagPosts: (slug, params) => api.get(`/blog/tags/${slug}/posts/`, { params }),

  // Search
  search: (q) => api.get('/blog/search/', { params: { q } }),

  // Interactions
  likePost: (slug) => api.post(`/blog/posts/${slug}/like/`),
  bookmarkPost: (slug) => api.post(`/blog/posts/${slug}/bookmark/`),
  getBookmarks: () => api.get('/blog/me/bookmarks/'),
};
