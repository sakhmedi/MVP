export type User = {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  bio?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export type UserProfile = {
  id: number;
  username: string;
  full_name?: string;
  bio?: string;
  avatar?: string;
  follower_count: number;
  following_count: number;
  created_at: string;
}

export type RegisterData = {
  email: string;
  password: string;
  username: string;
  full_name?: string;
}

export type LoginData = {
  email: string;
  password: string;
}

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  user: User;
}
