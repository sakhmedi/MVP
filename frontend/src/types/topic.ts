export interface Topic {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

export interface TopicFollow {
  id: number;
  user_id: number;
  topic_id: number;
  created_at: string;
  topic?: Topic;
}
