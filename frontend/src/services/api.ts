import axios from 'axios';
import type { User, RegisterData, LoginData, AuthResponse } from '../types/user';
import type { Post, CreatePostData, UpdatePostData } from '../types/post';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add access token to requests
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('access_token');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  logout: async () => {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    if (accessToken && refreshToken) {
      await api.post('/auth/logout', {
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>('/user/me');
    return response.data;
  },
};

export const postAPI = {
  createPost: async (data: CreatePostData): Promise<{ post: Post }> => {
    const response = await api.post<{ post: Post }>('/posts', data);
    return response.data;
  },

  updatePost: async (id: number, data: UpdatePostData): Promise<{ post: Post }> => {
    const response = await api.put<{ post: Post }>(`/posts/${id}`, data);
    return response.data;
  },

  deletePost: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/posts/${id}`);
    return response.data;
  },

  getPost: async (slug: string): Promise<{ post: Post }> => {
    const response = await api.get<{ post: Post }>(`/posts/${slug}`);
    return response.data;
  },

  getPosts: async (page = 1, limit = 10): Promise<{ posts: Post[]; total: number; page: number; limit: number }> => {
    const response = await api.get<{ posts: Post[]; total: number; page: number; limit: number }>('/posts', {
      params: { page, limit },
    });
    return response.data;
  },

  getMyPosts: async (): Promise<{ posts: Post[] }> => {
    const response = await api.get<{ posts: Post[] }>('/posts/my');
    return response.data;
  },
};

export default api;
