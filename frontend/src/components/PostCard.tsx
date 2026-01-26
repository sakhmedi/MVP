import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Post } from '../types/post';
import { bookmarkAPI } from '../services/api';

interface PostCardProps {
  post: Post;
  variant?: 'default' | 'featured' | 'compact';
}

const PostCard = ({ post, variant = 'default' }: PostCardProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const isLoggedIn = !!localStorage.getItem('access_token');

  // Check bookmark status on mount
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!isLoggedIn || !post.id) return;
      try {
        const response = await bookmarkAPI.checkBookmark(post.id);
        setIsBookmarked(response.bookmarked);
      } catch (error) {
        // Silently fail - user might not be logged in
      }
    };
    checkBookmarkStatus();
  }, [post.id, isLoggedIn]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  const getReadTime = (minutes: number) => {
    return `${minutes || 1} min read`;
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      // Could show a login prompt here
      return;
    }

    if (isBookmarkLoading) return;

    setIsBookmarkLoading(true);
    try {
      if (isBookmarked) {
        await bookmarkAPI.removeBookmark(post.id);
        setIsBookmarked(false);
      } else {
        await bookmarkAPI.addBookmark(post.id);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Failed to update bookmark:', error);
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  // Featured variant - large hero card
  if (variant === 'featured') {
    return (
      <article className="group relative overflow-hidden rounded-2xl bg-white border border-[#E8E2D9] transition-all duration-500 hover:shadow-xl hover:shadow-[#3D405B]/10 hover:-translate-y-1">
        <Link to={`/posts/${post.slug}`} className="block">
          {/* Background image with overlay */}
          <div className="absolute inset-0">
            {post.cover_image ? (
              <img
                src={post.cover_image}
                alt={post.title}
                className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-[#E07A5F]/20 via-[#FAF7F2] to-[#81B29A]/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#3D405B] via-[#3D405B]/60 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex h-[400px] flex-col justify-end p-8">
            {/* Tags */}
            {post.tags && (
              <div className="mb-4 flex flex-wrap gap-2">
                {post.tags.split(',').slice(0, 2).map((tag, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h2 className="mb-3 text-3xl font-bold text-white transition-colors group-hover:text-[#FAF7F2] line-clamp-2">
              {post.title}
            </h2>

            {/* Excerpt */}
            <p className="mb-6 text-white/80 line-clamp-2 text-base leading-relaxed">
              {post.excerpt || 'Discover something new...'}
            </p>

            {/* Author and meta */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#E07A5F] flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {post.author?.username?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  {post.author?.username ? (
                    <Link
                      to={`/user/${post.author.username}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-medium text-white hover:underline"
                    >
                      {post.author?.full_name || post.author?.username}
                    </Link>
                  ) : (
                    <span className="font-medium text-white">Anonymous</span>
                  )}
                  <p className="text-sm text-white/70">
                    {formatDate(post.published_at || post.created_at)} · {getReadTime(post.read_time)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-white/70">
                <span className="flex items-center gap-1 text-sm">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {post.view_count || 0}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  // Compact variant - smaller cards for grid
  if (variant === 'compact') {
    return (
      <article className="group relative overflow-hidden rounded-xl bg-white border border-[#E8E2D9] transition-all duration-300 hover:shadow-lg hover:shadow-[#3D405B]/10 hover:-translate-y-1 hover:border-[#E07A5F]/30">
        <Link to={`/posts/${post.slug}`} className="block">
          {/* Image */}
          <div className="aspect-[16/10] overflow-hidden bg-[#FAF7F2]">
            {post.cover_image ? (
              <img
                src={post.cover_image}
                alt={post.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FAF7F2] to-[#E8E2D9]">
                <svg className="h-12 w-12 text-[#E8E2D9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2" />
                </svg>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            {post.tags && (
              <span className="mb-2 inline-block rounded-full bg-[#E07A5F]/10 px-2.5 py-0.5 text-xs font-medium text-[#E07A5F]">
                {post.tags.split(',')[0]?.trim()}
              </span>
            )}
            <h3 className="mb-2 font-bold text-[#3D405B] line-clamp-2 transition-colors group-hover:text-[#E07A5F]">
              {post.title}
            </h3>
            <p className="mb-4 text-sm text-[#6B7280] line-clamp-2">
              {post.excerpt || 'No excerpt available...'}
            </p>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-[#E07A5F] flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {post.author?.username?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
{post.author?.username ? (
                  <Link
                    to={`/user/${post.author.username}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[#6B7280] hover:text-[#E07A5F] transition-colors"
                  >
                    {post.author.username}
                  </Link>
                ) : (
                  <span className="text-[#6B7280]">Anonymous</span>
                )}
              </div>
              <span className="text-[#6B7280]">{getReadTime(post.read_time)}</span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  // Default variant - list style
  return (
    <article className="group relative border-b border-[#E8E2D9] py-8 transition-all duration-300 last:border-b-0 hover:bg-[#FAF7F2]/50">
      <div className="flex gap-6">
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Author info */}
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-[#E07A5F] flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <span className="text-xs font-bold text-white">
                {post.author?.username?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {post.author?.username ? (
                <Link
                  to={`/user/${post.author.username}`}
                  className="font-medium text-[#3D405B] hover:text-[#E07A5F] transition-colors"
                >
                  {post.author?.full_name || post.author.username}
                </Link>
              ) : (
                <span className="font-medium text-[#3D405B]">Anonymous</span>
              )}
              <span className="text-[#9CA3AF]">·</span>
              <span className="text-[#6B7280]">
                {formatDate(post.published_at || post.created_at)}
              </span>
            </div>
          </div>

          {/* Title */}
          <Link to={`/posts/${post.slug}`}>
            <h2 className="mb-2 text-xl font-bold text-[#3D405B] transition-colors group-hover:text-[#E07A5F] line-clamp-2">
              {post.title}
            </h2>
          </Link>

          {/* Excerpt */}
          <p className="mb-4 text-[#6B7280] line-clamp-2 text-[15px] leading-relaxed">
            {post.excerpt || 'No excerpt available...'}
          </p>

          {/* Meta and actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-[#6B7280]">
              {post.tags && (
                <span className="rounded-full border border-[#E8E2D9] bg-[#FAF7F2] px-3 py-1 text-xs font-medium text-[#6B7280] transition-colors hover:border-[#E07A5F] hover:bg-[#E07A5F]/10 hover:text-[#E07A5F]">
                  {post.tags.split(',')[0]?.trim()}
                </span>
              )}
              <span className="text-[#6B7280]">{getReadTime(post.read_time)}</span>
              <span className="hidden sm:flex items-center gap-1 text-[#6B7280]">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {post.view_count || 0}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {/* Like button */}
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all duration-300 ${
                  isLiked
                    ? 'bg-[#E07A5F]/10 text-[#E07A5F]'
                    : 'text-[#6B7280] hover:bg-[#FAF7F2] hover:text-[#3D405B]'
                }`}
              >
                <svg
                  className={`h-4 w-4 transition-transform duration-300 ${isLiked ? 'scale-110' : ''}`}
                  fill={isLiked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span className={`${isLiked ? 'font-medium' : ''}`}>{likeCount}</span>
              </button>

              {/* Bookmark button */}
              <button
                onClick={handleBookmark}
                disabled={isBookmarkLoading || !isLoggedIn}
                className={`rounded-full p-2 transition-all duration-300 ${
                  isBookmarked
                    ? 'bg-[#81B29A]/10 text-[#81B29A]'
                    : 'text-[#6B7280] hover:bg-[#FAF7F2] hover:text-[#3D405B]'
                } ${isBookmarkLoading ? 'opacity-50 cursor-wait' : ''} ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={!isLoggedIn ? 'Login to bookmark' : isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
              >
                <svg
                  className={`h-4 w-4 transition-transform duration-300 ${isBookmarked ? 'scale-110' : ''}`}
                  fill={isBookmarked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </button>

              {/* Share button */}
              <button className="rounded-full p-2 text-[#6B7280] transition-all duration-300 hover:bg-[#FAF7F2] hover:text-[#3D405B]">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Thumbnail */}
        {post.cover_image && (
          <Link to={`/posts/${post.slug}`} className="flex-shrink-0">
            <div className="h-32 w-32 md:h-36 md:w-48 overflow-hidden rounded-xl bg-[#FAF7F2] transition-all duration-300 group-hover:shadow-md group-hover:shadow-[#3D405B]/10">
              <img
                src={post.cover_image}
                alt={post.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          </Link>
        )}
      </div>
    </article>
  );
};

export default PostCard;
