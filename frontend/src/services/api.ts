import axios from 'axios';
import type { User, UserProfile, RegisterData, LoginData, AuthResponse } from '../types/user';
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

  getPosts: async (page = 1, limit = 10, sort = 'latest'): Promise<{ posts: Post[]; total: number; page: number; limit: number }> => {
    const response = await api.get<{ posts: Post[]; total: number; page: number; limit: number }>('/posts', {
      params: { page, limit, sort },
    });
    return response.data;
  },

  getMyPosts: async (): Promise<{ posts: Post[] }> => {
    const response = await api.get<{ posts: Post[] }>('/posts/my');
    return response.data;
  },

  getStaffPicks: async (): Promise<{ picks: Array<{ id: number; title: string; slug: string; author_name: string; author_username: string; published_at: string }> }> => {
    const response = await api.get('/posts/staff-picks');
    return response.data;
  },

  getFollowingFeed: async (page = 1, limit = 10): Promise<{ posts: Post[]; total: number; page: number; limit: number }> => {
    const response = await api.get<{ posts: Post[]; total: number; page: number; limit: number }>('/feed/following', {
      params: { page, limit },
    });
    return response.data;
  },
};

export const userAPI = {
  getUserProfile: async (username: string): Promise<{ user: UserProfile }> => {
    const response = await api.get<{ user: UserProfile }>(`/users/${username}`);
    return response.data;
  },

  getUserPosts: async (username: string): Promise<{ posts: Post[]; total: number }> => {
    const response = await api.get<{ posts: Post[]; total: number }>(`/users/${username}/posts`);
    return response.data;
  },

  followUser: async (username: string): Promise<{ message: string }> => {
    const response = await api.post(`/users/${username}/follow`);
    return response.data;
  },

  unfollowUser: async (username: string): Promise<{ message: string }> => {
    const response = await api.delete(`/users/${username}/follow`);
    return response.data;
  },

  checkFollowing: async (username: string): Promise<{ following: boolean }> => {
    const response = await api.get(`/users/${username}/following-check`);
    return response.data;
  },

  getSuggestedUsers: async (limit = 3): Promise<{ users: Array<{ id: number; username: string; full_name: string; bio: string; avatar: string; follower_count: number }> }> => {
    const response = await api.get('/users/suggestions', { params: { limit } });
    return response.data;
  },
};

export const bookmarkAPI = {
  addBookmark: async (postId: number): Promise<{ message: string }> => {
    const response = await api.post(`/bookmarks/${postId}`);
    return response.data;
  },

  removeBookmark: async (postId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/bookmarks/${postId}`);
    return response.data;
  },

  getBookmarks: async (): Promise<{ bookmarks: Array<{ id: number; post: Post; created_at: string }>; total: number }> => {
    const response = await api.get('/bookmarks');
    return response.data;
  },

  checkBookmark: async (postId: number): Promise<{ bookmarked: boolean }> => {
    const response = await api.get(`/bookmarks/check/${postId}`);
    return response.data;
  },
};

export const likeAPI = {
  addLike: async (postId: number): Promise<{ message: string; like_count: number }> => {
    const response = await api.post(`/likes/${postId}`);
    return response.data;
  },

  removeLike: async (postId: number): Promise<{ message: string; like_count: number }> => {
    const response = await api.delete(`/likes/${postId}`);
    return response.data;
  },

  checkLike: async (postId: number): Promise<{ liked: boolean; like_count: number }> => {
    const response = await api.get(`/likes/check/${postId}`);
    return response.data;
  },

  getLikeCount: async (postId: number): Promise<{ like_count: number }> => {
    const response = await api.get(`/likes/count/${postId}`);
    return response.data;
  },
};

export default api;
