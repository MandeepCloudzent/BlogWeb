import api from './axiosInstance';

export const contactApi = {
  submit: (data) => api.post('/contact/', data),
};
