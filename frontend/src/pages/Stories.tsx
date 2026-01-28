import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { storiesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Post } from '../types/post';

type StoriesTab = 'drafts' | 'scheduled' | 'published' | 'unlisted' | 'submissions';

const tabs: { key: StoriesTab; label: string }[] = [
  { key: 'drafts', label: 'Drafts' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'published', label: 'Published' },
  { key: 'unlisted', label: 'Unlisted' },
  { key: 'submissions', label: 'Submissions' },
];

export default function Stories() {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<StoriesTab>((searchParams.get('tab') as StoriesTab) || 'drafts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tab = searchParams.get('tab') as StoriesTab;
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

      if (activeTab === 'submissions') {
        // Submissions is a placeholder for now
        setPosts([]);
        setLoading(false);
        return;
      }

      let res;
      switch (activeTab) {
        case 'drafts':
          res = await storiesAPI.getDrafts();
          break;
        case 'scheduled':
          res = await storiesAPI.getScheduled();
          break;
        case 'published':
          res = await storiesAPI.getPublished();
          break;
        case 'unlisted':
          res = await storiesAPI.getUnlisted();
          break;
      }
      setPosts(res?.posts || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: StoriesTab) => {
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
        <p className="text-[#6B7280] mb-6">Please sign in to view your stories.</p>
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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#E07A5F] flex items-center justify-center shadow-lg shadow-[#E07A5F]/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#3D405B]">Your Stories</h1>
            <p className="text-[#6B7280] text-sm">Manage your drafts and published posts</p>
          </div>
        </div>
        <Link
          to="/create-post"
          className="flex items-center gap-2 rounded-full bg-[#E07A5F] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#d36b52]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Story
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex gap-1 rounded-xl bg-white border border-[#E8E2D9] p-1 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
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

      {!loading && !error && posts.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E8E2D9] p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5F0E8] flex items-center justify-center">
            <svg className="w-8 h-8 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-[#3D405B] mb-2">
            {activeTab === 'submissions' ? 'Submissions coming soon' : `No ${activeTab} stories`}
          </h3>
          <p className="text-[#6B7280] mb-6">
            {activeTab === 'drafts' && "Start writing a new story to see it here."}
            {activeTab === 'scheduled' && "Schedule posts to publish them later."}
            {activeTab === 'published' && "Your published stories will appear here."}
            {activeTab === 'unlisted' && "Unlisted stories are only accessible via direct link."}
            {activeTab === 'submissions' && "Submit your stories to publications."}
          </p>
          {activeTab !== 'submissions' && (
            <Link
              to="/create-post"
              className="inline-flex items-center gap-2 rounded-full bg-[#E07A5F] px-6 py-3 font-medium text-white transition-all hover:bg-[#d36b52]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Write a story
            </Link>
          )}
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E8E2D9] divide-y divide-[#E8E2D9]">
          {posts.map(post => (
            <div key={post.id} className="px-6">
              <PostCard post={post} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
