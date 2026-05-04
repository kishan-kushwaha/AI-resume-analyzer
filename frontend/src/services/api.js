import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
});

// Attach auth token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Resume
export const resumeAPI = {
  upload: (formData, onProgress) =>
    api.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
    }),
  getAll: () => api.get('/resume/all'),
  getOne: (id) => api.get(`/resume/${id}`),
  delete: (id) => api.delete(`/resume/${id}`),
};

// Analysis
export const analysisAPI = {
  analyse: (resumeId) => api.post(`/analysis/resume/${resumeId}`),
  getOne: (analysisId) => api.get(`/analysis/${analysisId}`),
};

// Jobs
export const jobsAPI = {
  match: (data) => api.post('/jobs/match', data),
  getMatches: () => api.get('/jobs/matches'),
  getMatch: (matchId) => api.get(`/jobs/match/${matchId}`),
};

// Reports
export const reportAPI = {
  generate: (data) => api.post('/report/generate', data),
  getAll: () => api.get('/report/all'),
  getOne: (id) => api.get(`/report/${id}`),
};

// Interview Q&A
export const interviewAPI = {
  generate: (data) => api.post('/interview/generate', data),
};

export default api;
