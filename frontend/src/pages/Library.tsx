import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { bookmarkAPI, likeAPI, commentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Post } from '../types/post';

type LibraryTab = 'saved' | 'liked' | 'commented' | 'responses';

const tabs: { key: LibraryTab; label: string }[] = [
  { key: 'saved', label: 'Saved' },
  { key: 'liked', label: 'Liked' },
  { key: 'commented', label: 'Commented' },
  { key: 'responses', label: 'Responses' },
];

export default function Library() {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<LibraryTab>((searchParams.get('tab') as LibraryTab) || 'saved');
  const [posts, setPosts] = useState<Post[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tab = searchParams.get('tab') as LibraryTab;
    if (tab && tabs.some(t => t.key === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [activeTab, isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setPosts([]);
      setResponses([]);

      switch (activeTab) {
        case 'saved': {
          const res = await bookmarkAPI.getBookmarks();
          setPosts(res.bookmarks?.map(b => b.post) || []);
          break;
        }
        case 'liked': {
          const res = await likeAPI.getLikedPosts();
          setPosts(res.posts || []);
          break;
        }
        case 'commented': {
          const res = await commentAPI.getUserComments();
          setPosts(res.posts || []);
          break;
        }
        case 'responses': {
          const res = await commentAPI.getUserResponses();
          setResponses(res.comments || []);
          break;
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: LibraryTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#E07A5F]/10 flex items-center justify-center">
          <svg className="w-10 h-10 text-[#E07A5F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[#3D405B] mb-2">Sign in required</h2>
        <p className="text-[#6B7280] mb-6">Please sign in to view your library.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-[#E07A5F] px-6 py-3 font-medium text-white transition-all hover:bg-[#d36b52]"
        >
          Go to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-[#E07A5F] flex items-center justify-center shadow-lg shadow-[#E07A5F]/20">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#3D405B]">Your Library</h1>
          <p className="text-[#6B7280] text-sm">Posts you've saved, liked, and interacted with</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex gap-1 rounded-xl bg-white border border-[#E8E2D9] p-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
              activeTab === tab.key
                ? 'bg-[#E07A5F] text-white shadow-sm'
                : 'text-[#6B7280] hover:text-[#3D405B] hover:bg-[#FAF7F2]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {error && (
        <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button onClick={fetchData} className="mt-3 text-sm text-red-600 underline">
            Try again
          </button>
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-white border border-[#E8E2D9] rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && !error && activeTab !== 'responses' && posts.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E8E2D9] p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5F0E8] flex items-center justify-center">
            <svg className="w-8 h-8 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-[#3D405B] mb-2">No {activeTab} posts yet</h3>
          <p className="text-[#6B7280]">
            {activeTab === 'saved' && "Posts you save will appear here."}
            {activeTab === 'liked' && "Posts you like will appear here."}
            {activeTab === 'commented' && "Posts you comment on will appear here."}
          </p>
        </div>
      )}

      {!loading && !error && activeTab === 'responses' && responses.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E8E2D9] p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5F0E8] flex items-center justify-center">
            <svg className="w-8 h-8 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-[#3D405B] mb-2">No responses yet</h3>
          <p className="text-[#6B7280]">Replies to your posts will appear here.</p>
        </div>
      )}

      {!loading && !error && activeTab !== 'responses' && posts.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E8E2D9] divide-y divide-[#E8E2D9]">
          {posts.map(post => (
            <div key={post.id} className="px-6">
              <PostCard post={post} />
            </div>
          ))}
        </div>
      )}

      {!loading && !error && activeTab === 'responses' && responses.length > 0 && (
        <div className="space-y-4">
          {responses.map((comment: any) => (
            <div key={comment.id} className="bg-white rounded-xl border border-[#E8E2D9] p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E07A5F] flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-white">
                    {(comment.user?.full_name || comment.user?.username || 'A')[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-[#3D405B]">
                      {comment.user?.full_name || comment.user?.username}
                    </span>
                    <span className="text-sm text-[#6B7280]">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[#4B5563] mb-2">{comment.content}</p>
                  {comment.post && (
                    <Link
                      to={`/posts/${comment.post.slug}`}
                      className="text-sm text-[#E07A5F] hover:underline"
                    >
                      View post: {comment.post.title}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
