import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { followingAPI, topicAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

type FollowingTab = 'writers' | 'topics';

const tabs: { key: FollowingTab; label: string }[] = [
  { key: 'writers', label: 'Writers' },
  { key: 'topics', label: 'Topics' },
];

type Writer = {
  id: number;
  username: string;
  full_name: string;
  bio: string;
  avatar: string;
  follower_count: number;
};

type Topic = {
  id: number;
  name: string;
  slug: string;
  description: string;
};

export default function Following() {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<FollowingTab>((searchParams.get('tab') as FollowingTab) || 'writers');
  const [writers, setWriters] = useState<Writer[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tab = searchParams.get('tab') as FollowingTab;
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
      setWriters([]);
      setTopics([]);

      if (activeTab === 'writers') {
        const res = await followingAPI.getFollowingWriters();
        setWriters(res.users || []);
      } else {
        const res = await topicAPI.getUserTopics();
        setTopics(res.topics || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: FollowingTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleUnfollowWriter = async (username: string) => {
    try {
      await userAPI.unfollowUser(username);
      setWriters(prev => prev.filter(w => w.username !== username));
    } catch (err) {
      console.error('Failed to unfollow:', err);
    }
  };

  const handleUnfollowTopic = async (slug: string) => {
    try {
      await topicAPI.unfollowTopic(slug);
      setTopics(prev => prev.filter(t => t.slug !== slug));
    } catch (err) {
      console.error('Failed to unfollow topic:', err);
    }
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
        <p className="text-[#6B7280] mb-6">Please sign in to see who you're following.</p>
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#3D405B]">Following</h1>
          <p className="text-[#6B7280] text-sm">Writers and topics you follow</p>
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
            <div key={i} className="h-20 bg-white border border-[#E8E2D9] rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Writers Tab */}
      {!loading && !error && activeTab === 'writers' && (
        <>
          {writers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E8E2D9] p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5F0E8] flex items-center justify-center">
                <svg className="w-8 h-8 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#3D405B] mb-2">No writers yet</h3>
              <p className="text-[#6B7280] mb-6">Start following writers to see their posts in your feed.</p>
              <Link
                to="/feed"
                className="inline-flex items-center gap-2 rounded-full bg-[#E07A5F] px-6 py-3 font-medium text-white transition-all hover:bg-[#d36b52]"
              >
                Discover writers
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {writers.map(writer => (
                <div key={writer.id} className="bg-white rounded-xl border border-[#E8E2D9] p-5">
                  <div className="flex items-center gap-4">
                    <Link to={`/user/${writer.username}`} className="flex-shrink-0">
                      {writer.avatar ? (
                        <img src={writer.avatar} alt={writer.full_name} className="w-14 h-14 rounded-full object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-[#E07A5F] flex items-center justify-center">
                          <span className="text-xl font-bold text-white">
                            {(writer.full_name || writer.username)[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/user/${writer.username}`}>
                        <p className="font-medium text-[#3D405B] hover:text-[#E07A5F] transition-colors">
                          {writer.full_name || writer.username}
                        </p>
                      </Link>
                      <p className="text-sm text-[#6B7280]">@{writer.username}</p>
                      {writer.bio && (
                        <p className="text-sm text-[#6B7280] mt-1 line-clamp-1">{writer.bio}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleUnfollowWriter(writer.username)}
                      className="px-4 py-2 rounded-full border border-[#E8E2D9] text-sm font-medium text-[#6B7280] hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                    >
                      Unfollow
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Topics Tab */}
      {!loading && !error && activeTab === 'topics' && (
        <>
          {topics.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E8E2D9] p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5F0E8] flex items-center justify-center">
                <svg className="w-8 h-8 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#3D405B] mb-2">No topics yet</h3>
              <p className="text-[#6B7280]">Follow topics to customize your feed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topics.map(topic => (
                <div key={topic.id} className="bg-white rounded-xl border border-[#E8E2D9] p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-[#3D405B]">{topic.name}</p>
                      {topic.description && (
                        <p className="text-sm text-[#6B7280] mt-1 line-clamp-2">{topic.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleUnfollowTopic(topic.slug)}
                      className="px-3 py-1.5 rounded-full border border-[#E8E2D9] text-xs font-medium text-[#6B7280] hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                    >
                      Unfollow
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
