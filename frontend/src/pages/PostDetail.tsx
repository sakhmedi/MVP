import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { postAPI } from '../services/api'
import type { Post } from '../types/post'
import CommentSection from '../components/CommentSection'

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (slug) {
      fetchPost(slug)
    }
  }, [slug])

  const fetchPost = async (postSlug: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await postAPI.getPost(postSlug)
      setPost(response.post)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load post')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const parseTags = (tags: string): string[] => {
    if (!tags) return []
    return tags.split(',').map(tag => tag.trim()).filter(Boolean)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="animate-pulse">
          <div className="h-8 w-3/4 bg-[#E8E2D9] rounded mb-4" />
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-full bg-[#E8E2D9]" />
            <div className="h-4 w-32 bg-[#E8E2D9] rounded" />
          </div>
          <div className="h-64 w-full bg-[#E8E2D9] rounded-2xl mb-8" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-[#E8E2D9] rounded" />
            <div className="h-4 w-full bg-[#E8E2D9] rounded" />
            <div className="h-4 w-2/3 bg-[#E8E2D9] rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
          <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[#3D405B] mb-2">Post not found</h2>
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
    )
  }

  if (!post) {
    return null
  }

  const tags = parseTags(post.tags)

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        to="/feed"
        className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#E07A5F] transition mb-8"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Feed
      </Link>

      {/* Draft badge */}
      {!post.published && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Draft
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#3D405B] mb-6 leading-tight">
        {post.title}
      </h1>

      {/* Author info and meta */}
      <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-[#E8E2D9]">
        {post.author?.username ? (
          <Link to={`/user/${post.author.username}`} className="flex items-center gap-3 group">
            {post.author?.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.full_name || post.author.username}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#E8E2D9] transition-all group-hover:border-[#E07A5F]"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#E07A5F] flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-lg font-bold text-white">
                  {(post.author?.full_name || post.author?.username || 'A')[0].toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-[#3D405B] group-hover:text-[#E07A5F] transition-colors">
                {post.author?.full_name || post.author.username}
              </p>
              <p className="text-sm text-[#6B7280]">
                {formatDate(post.published_at || post.created_at)}
                {post.read_time > 0 && (
                  <span> · {post.read_time} min read</span>
                )}
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#E07A5F] flex items-center justify-center">
              <span className="text-lg font-bold text-white">A</span>
            </div>
            <div>
              <p className="font-medium text-[#3D405B]">Anonymous</p>
              <p className="text-sm text-[#6B7280]">
                {formatDate(post.published_at || post.created_at)}
                {post.read_time > 0 && (
                  <span> · {post.read_time} min read</span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Cover image */}
      {post.cover_image && (
        <div className="mb-8 rounded-2xl overflow-hidden border border-[#E8E2D9]">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-auto max-h-[500px] object-cover"
          />
        </div>
      )}

      {/* Excerpt */}
      {post.excerpt && (
        <p className="text-xl text-[#6B7280] mb-8 leading-relaxed italic border-l-4 border-[#E07A5F] pl-4">
          {post.excerpt}
        </p>
      )}

      {/* Content */}
      <div
        className="prose prose-lg max-w-none
          prose-headings:text-[#3D405B] prose-headings:font-bold
          prose-p:text-[#4B5563] prose-p:leading-relaxed
          prose-a:text-[#E07A5F] prose-a:no-underline hover:prose-a:underline
          prose-strong:text-[#3D405B]
          prose-code:text-[#E07A5F] prose-code:bg-[#F5F0E8] prose-code:px-1 prose-code:py-0.5 prose-code:rounded
          prose-pre:bg-[#3D405B] prose-pre:text-[#F5F0E8]
          prose-blockquote:border-[#E07A5F] prose-blockquote:text-[#6B7280]
          prose-img:rounded-xl prose-img:border prose-img:border-[#E8E2D9]
          prose-ul:text-[#4B5563] prose-ol:text-[#4B5563]
          mb-8"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-8 border-t border-[#E8E2D9]">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1.5 rounded-full bg-[#F5F0E8] border border-[#E8E2D9] text-sm text-[#3D405B] hover:border-[#E07A5F] hover:text-[#E07A5F] transition cursor-pointer"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer actions */}
      <div className="mt-12 pt-8 border-t border-[#E8E2D9]">
        <div className="flex items-center justify-between">
          <Link
            to="/feed"
            className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#E07A5F] transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Feed
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-sm text-[#6B7280]">
              {post.view_count} {post.view_count === 1 ? 'view' : 'views'}
            </span>
          </div>
        </div>
      </div>

      {/* Comments */}
      <CommentSection postId={post.id} />
    </article>
  )
}
