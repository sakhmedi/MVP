export interface Post {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string
  cover_image: string
  author_id: number
  author?: {
    id: number
    username: string
    full_name: string
    avatar: string
  }
  tags: string
  published: boolean
  view_count: number
  read_time: number
  created_at: string
  updated_at: string
  published_at?: string
}

export interface CreatePostData {
  title: string
  content: string
  excerpt?: string
  cover_image?: string
  tags?: string
  published?: boolean
}

export interface UpdatePostData {
  title?: string
  content?: string
  excerpt?: string
  cover_image?: string
  tags?: string
  published?: boolean
}
