import type { User } from './user';

export interface Comment {
  id: number;
  user_id: number;
  post_id: number;
  parent_id?: number;
  content: string;
  created_at: string;
  updated_at: string;
  user: User;
  replies?: Comment[];
}
