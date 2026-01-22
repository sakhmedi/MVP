import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import PostCard from '../components/PostCard';
import { postAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Post } from '../types/post';

type FeedTab = 'foryou' | 'following' | 'latest';

// Trending topics mock data
const trendingTopics = [
  { name: 'Technology', posts: 1234 },
  { name: 'Programming', posts: 892 },
  { name: 'Design', posts: 756 },
  { name: 'Startups', posts: 543 },
  { name: 'AI & ML', posts: 432 },
  { name: 'Web Dev', posts: 321 },
];

// Recommended writers mock data
const recommendedWriters = [
  { id: 1, name: 'Sarah Chen', username: 'sarahc', bio: 'Tech writer & Developer Advocate', followers: '12.5K' },
  { id: 2, name: 'Marcus Johnson', username: 'marcusj', bio: 'Building the future of AI', followers: '8.2K' },
  { id: 3, name: 'Elena Rodriguez', username: 'elenar', bio: 'UX Designer at Figma', followers: '15.1K' },
];

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FeedTab>('foryou');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll observer
  const lastPostRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    }, { threshold: 0.1 });

    if (node) observerRef.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  const fetchPosts = async (pageNum = 1) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      }
      setError(null);
      const response = await postAPI.getPosts(pageNum, 10);

      if (pageNum === 1) {
        setPosts(response.posts || []);
      } else {
        setPosts(prev => [...prev, ...(response.posts || [])]);
      }

      setHasMore((response.posts?.length || 0) === 10);
      setPage(pageNum);
    } catch (err) {
      setError('Failed to load posts. Please try again.');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      fetchPosts(page + 1);
    }
  };

  const handleTabChange = (tab: FeedTab) => {
    setActiveTab(tab);
    setPage(1);
    setPosts([]);
  };

  // Get featured post (first post with cover image)
  const featuredPost = posts.find(p => p.cover_image);
  const regularPosts = featuredPost ? posts.filter(p => p.id !== featuredPost.id) : posts;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />

      {/* Welcome banner for authenticated users */}
      {user && (
        <div className="bg-gradient-to-r from-[#1e1033] via-[#2d1a4d] to-[#1e1033] border-b border-[#24243a]">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-[#5b3d8a]/30 backdrop-blur-sm">
                  <svg className="h-5 w-5 text-[#b99fe0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-white">Welcome back, {user.full_name || user.username}!</p>
                  <p className="text-sm text-[#9d7dcf]">Discover stories that matter to you</p>
                </div>
              </div>
              <Link
                to="/create-post"
                className="hidden sm:flex items-center gap-2 rounded-full bg-[#5b3d8a] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#7c5aad] hover:shadow-lg hover:shadow-[#5b3d8a]/30"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Write a story
              </Link>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Feed Tabs */}
            <div className="mb-8 flex gap-1 rounded-xl bg-[#12121a] border border-[#24243a] p-1">
              {(['foryou', 'following', 'latest'] as FeedTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-[#5b3d8a] text-white shadow-lg shadow-[#5b3d8a]/20'
                      : 'text-gray-400 hover:text-white hover:bg-[#1a1a24]'
                  }`}
                >
                  {tab === 'foryou' ? 'For you' : tab === 'following' ? 'Following' : 'Latest'}
                </button>
              ))}
            </div>

            {/* Error State */}
            {error && (
              <div className="mb-8 rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center">
                <svg className="mx-auto mb-3 h-10 w-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="mb-3 text-red-400">{error}</p>
                <button
                  onClick={() => fetchPosts(1)}
                  className="rounded-full bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/30"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && posts.length === 0 && (
              <div className="space-y-6">
                {/* Featured skeleton */}
                <div className="h-[400px] animate-pulse rounded-2xl bg-[#12121a] border border-[#24243a]" />

                {/* Regular skeletons */}
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-6 border-b border-[#24243a] py-8 animate-pulse">
                    <div className="flex-1">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#24243a]" />
                        <div className="h-4 w-32 rounded bg-[#24243a]" />
                      </div>
                      <div className="mb-2 h-6 w-3/4 rounded bg-[#24243a]" />
                      <div className="mb-1 h-4 w-full rounded bg-[#24243a]" />
                      <div className="h-4 w-2/3 rounded bg-[#24243a]" />
                    </div>
                    <div className="h-32 w-32 rounded-xl bg-[#24243a]" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && posts.length === 0 && (
              <div className="py-16 text-center">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#2d1a4d] to-[#1e1033]">
                  <svg className="h-12 w-12 text-[#9d7dcf]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2" />
                  </svg>
                </div>
                <h3 className="mb-2 text-2xl font-bold text-white">No posts yet</h3>
                <p className="mx-auto mb-8 max-w-sm text-gray-400">
                  Be the first to share your thoughts and ideas with the community.
                </p>
                <Link
                  to="/create-post"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#5b3d8a] to-[#7c5aad] px-8 py-3 font-medium text-white transition-all hover:shadow-lg hover:shadow-[#5b3d8a]/30"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Write your first post
                </Link>
              </div>
            )}

            {/* Posts */}
            {posts.length > 0 && (
              <div className="space-y-6">
                {/* Featured Post */}
                {featuredPost && (
                  <div className="mb-8">
                    <PostCard post={featuredPost} variant="featured" />
                  </div>
                )}

                {/* Trending Section Header */}
                {regularPosts.length > 0 && (
                  <div className="flex items-center gap-3 pb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#5b3d8a] to-[#9d7dcf]">
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2Z"/>
                      </svg>
                    </div>
                    <h2 className="text-lg font-bold text-white">Trending Stories</h2>
                  </div>
                )}

                {/* Regular Posts List */}
                <div className="rounded-2xl border border-[#24243a] bg-[#12121a]">
                  {regularPosts.map((post, index) => (
                    <div
                      key={post.id}
                      ref={index === regularPosts.length - 1 ? lastPostRef : null}
                      className="px-6"
                    >
                      <PostCard post={post} />
                    </div>
                  ))}
                </div>

                {/* Loading more indicator */}
                {loadingMore && (
                  <div className="flex justify-center py-8">
                    <div className="flex items-center gap-3 text-gray-400">
                      <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-sm font-medium">Loading more stories...</span>
                    </div>
                  </div>
                )}

                {/* End of feed */}
                {!hasMore && posts.length > 0 && (
                  <div className="py-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1a1a24]">
                      <svg className="h-8 w-8 text-[#5b3d8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="mb-2 font-medium text-white">You're all caught up!</p>
                    <p className="text-sm text-gray-500">Check back later for new stories</p>
                  </div>
                )}

                {/* Invisible load more trigger */}
                <div ref={loadMoreRef} className="h-1" />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Trending Topics */}
              <div className="rounded-2xl border border-[#24243a] bg-[#12121a] p-6">
                <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
                  <svg className="h-5 w-5 text-[#9d7dcf]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2Z"/>
                  </svg>
                  Trending Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trendingTopics.map((topic, i) => (
                    <button
                      key={i}
                      className="rounded-full border border-[#24243a] bg-[#1a1a24] px-3 py-1.5 text-sm text-gray-300 transition-all hover:border-[#5b3d8a] hover:bg-[#5b3d8a]/20 hover:text-[#b99fe0]"
                    >
                      {topic.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recommended Writers */}
              <div className="rounded-2xl border border-[#24243a] bg-[#12121a] p-6">
                <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
                  <svg className="h-5 w-5 text-[#9d7dcf]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Who to follow
                </h3>
                <div className="space-y-4">
                  {recommendedWriters.map(writer => (
                    <div key={writer.id} className="flex items-start gap-3">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-[#5b3d8a] to-[#9d7dcf] p-0.5">
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-[#12121a] text-sm font-bold text-[#b99fe0]">
                          {writer.name[0]}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-white">{writer.name}</p>
                        <p className="truncate text-sm text-gray-500">{writer.bio}</p>
                      </div>
                      <button className="flex-shrink-0 rounded-full border border-[#5b3d8a] px-3 py-1 text-sm font-medium text-[#b99fe0] transition-all hover:bg-[#5b3d8a] hover:text-white">
                        Follow
                      </button>
                    </div>
                  ))}
                </div>
                <button className="mt-4 text-sm font-medium text-[#9d7dcf] hover:text-[#b99fe0]">
                  See more suggestions
                </button>
              </div>

              {/* Quick Links */}
              <div className="rounded-2xl border border-[#5b3d8a]/30 bg-gradient-to-br from-[#1e1033] to-[#12121a] p-6">
                <h3 className="mb-3 font-bold text-white">Start writing</h3>
                <p className="mb-4 text-sm text-gray-400">
                  Share your knowledge and experiences with our community.
                </p>
                <Link
                  to="/create-post"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#5b3d8a] to-[#7c5aad] px-4 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-[#5b3d8a]/30"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Write a story
                </Link>
              </div>

              {/* Footer links */}
              <div className="text-xs text-gray-600">
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <a href="#" className="hover:text-[#9d7dcf]">Help</a>
                  <a href="#" className="hover:text-[#9d7dcf]">Status</a>
                  <a href="#" className="hover:text-[#9d7dcf]">About</a>
                  <a href="#" className="hover:text-[#9d7dcf]">Careers</a>
                  <a href="#" className="hover:text-[#9d7dcf]">Blog</a>
                  <a href="#" className="hover:text-[#9d7dcf]">Privacy</a>
                  <a href="#" className="hover:text-[#9d7dcf]">Terms</a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Feed;
