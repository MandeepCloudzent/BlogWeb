import api from './axiosInstance';

export const mediaApi = {
  upload: (file, altText = '') => {
    const formData = new FormData();
    formData.append('file', file);
    if (altText) formData.append('alt_text', altText);
    return api.post('/media/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getFiles: () => api.get('/media/files/'),
  deleteFile: (id) => api.delete(`/media/files/${id}/`),
};
