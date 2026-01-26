import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Header from '../components/Header'
import PostCard from '../components/PostCard'
import { userAPI } from '../services/api'
import type { UserProfile as UserProfileType } from '../types/user'
import type { Post } from '../types/post'

export default function UserProfile() {
  const { username } = useParams<{ username: string }>()
  const [user, setUser] = useState<UserProfileType | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (username) {
      fetchUserData(username)
    }
  }, [username])

  const fetchUserData = async (uname: string) => {
    console.log('Fetching profile for username:', uname) // Debug log
    try {
      setLoading(true)
      setError(null)
      const [profileRes, postsRes] = await Promise.all([
        userAPI.getUserProfile(uname),
        userAPI.getUserPosts(uname),
      ])
      setUser(profileRes.user)
      setPosts(postsRes.posts || [])
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2]">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="flex items-start gap-6 mb-8">
              <div className="h-24 w-24 rounded-full bg-[#E8E2D9]" />
              <div className="flex-1">
                <div className="h-8 w-48 bg-[#E8E2D9] rounded mb-2" />
                <div className="h-4 w-32 bg-[#E8E2D9] rounded mb-4" />
                <div className="h-4 w-full bg-[#E8E2D9] rounded" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-[#E8E2D9] rounded-xl" />
              <div className="h-32 bg-[#E8E2D9] rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF7F2]">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#3D405B] mb-2">User not found</h2>
          <p className="text-[#6B7280] mb-6">{error}</p>
          <Link
            to="/feed"
            className="inline-flex items-center gap-2 rounded-full bg-[#E07A5F] px-6 py-3 font-medium text-white transition-all hover:bg-[#d36b52] hover:shadow-lg hover:shadow-[#E07A5F]/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Feed
          </Link>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-[#E8E2D9] p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Avatar */}
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.full_name || user.username}
                className="w-24 h-24 rounded-full object-cover border-4 border-[#E8E2D9]"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#E07A5F] flex items-center justify-center flex-shrink-0">
                <span className="text-3xl font-bold text-white">
                  {(user.full_name || user.username)[0].toUpperCase()}
                </span>
              </div>
            )}

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-[#3D405B]">
                    {user.full_name || user.username}
                  </h1>
                  <p className="text-[#6B7280]">@{user.username}</p>
                </div>

                {/* Follow Button (placeholder) */}
                <button className="inline-flex items-center justify-center gap-2 rounded-full bg-[#81B29A] px-6 py-2.5 font-medium text-white transition-all hover:bg-[#6a9a82] hover:shadow-lg hover:shadow-[#81B29A]/30">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Follow
                </button>
              </div>

              {/* Bio */}
              {user.bio && (
                <p className="text-[#4B5563] mb-4 leading-relaxed">
                  {user.bio}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-[#3D405B]">{user.follower_count}</span>
                  <span className="text-[#6B7280]">Followers</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-[#3D405B]">{user.following_count}</span>
                  <span className="text-[#6B7280]">Following</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 mb-8">
          <h2 className="text-lg font-bold text-[#3D405B] mb-4">About</h2>
          <div className="flex items-center gap-2 text-[#6B7280]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Member since {formatDate(user.created_at)}</span>
          </div>
        </div>

        {/* Posts Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#3D405B]">
              Posts
              <span className="ml-2 text-sm font-normal text-[#6B7280]">
                ({posts.length})
              </span>
            </h2>
          </div>

          {posts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E8E2D9] p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5F0E8] flex items-center justify-center">
                <svg className="w-8 h-8 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#3D405B] mb-2">No posts yet</h3>
              <p className="text-[#6B7280]">This user hasn't published any posts yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E8E2D9] divide-y divide-[#E8E2D9]">
              {posts.map((post) => (
                <div key={post.id} className="px-6">
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
